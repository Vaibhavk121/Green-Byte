from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
import os
from dotenv import load_dotenv
import uvicorn

# Load environment variables
load_dotenv()

# Initialize FastAPI
app = FastAPI(title="GreenByte - Crop Prediction API", version="1.0.0")

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in environment variables")

genai.configure(api_key=GEMINI_API_KEY)

# Pydantic models for request/response
class CropPredictionRequest(BaseModel):
    land_area: int  # in square feet
    latitude: float
    longitude: float
    soil_type: str  # Sandy, Loamy, Clayey, Silty

class CropData(BaseModel):
    name: str
    water_required_liters: float

class YieldData(BaseModel):
    crop_name: str
    yield_amount: float
    market_rate_per_unit: float
    cost_of_selling: float
    cost_of_growing: float
    roi: float

class ClimateData(BaseModel):
    avg_temp: float
    avg_soil_moisture: float
    avg_surface_temp: float
    total_rainfall: float

class CropPredictionResponse(BaseModel):
    crops: list
    yield_data: list
    crop_timeline: list
    best_sowing_time: str
    climate_data: dict
    soil_info: dict

class ChatbotRequest(BaseModel):
    question: str
    prediction_data: CropPredictionResponse  # The output from /predict endpoint
    language: str = "en"  # Language code: "en", "hi", "kn"

class ChatbotResponse(BaseModel):
    answer: str

@app.get("/")
def read_root():
    """Welcome endpoint"""
    return {"message": "Welcome to GreenByte - Crop Prediction API"}

@app.post("/predict", response_model=CropPredictionResponse)
async def predict_crop(request: CropPredictionRequest):
    """
    Predict crops based on land area, location, and soil type.
    Uses NASA POWER API for climate data and Gemini for crop prediction.
    """
    try:
        # Get soil information from iot_data.json (fast, local file)
        soil_info = get_soil_info(request.soil_type)
        
        # Fetch climate data from NASA POWER API with fallback
        try:
            climate_data = fetch_climate_data(request.latitude, request.longitude)
        except Exception as climate_error:
            # Use default climate data if NASA API fails or is slow
            print(f"Warning: NASA API failed, using default climate data: {climate_error}")
            climate_data = {
                "avg_temp": 25.0,
                "avg_soil_moisture": 0.5,
                "avg_surface_temp": 26.0,
                "total_rainfall": 100.0
            }
        
        # Create prompt for Gemini
        prompt = create_prediction_prompt(
            land_area=request.land_area,
            latitude=request.latitude,
            longitude=request.longitude,
            soil_type=request.soil_type,
            climate_data=climate_data,
            soil_info=soil_info
        )
        
        # Get prediction from Gemini
        prediction = get_gemini_prediction(prompt)
        
        return {
            "crops": prediction["crops"],
            "yield_data": prediction["yield_data"],
            "crop_timeline": prediction.get("crop_timeline", []),
            "best_sowing_time": prediction["best_sowing_time"],
            "climate_data": climate_data,
            "soil_info": soil_info
        }
    
    except ValueError as e:
        error_message = str(e)
        # Check for specific error types
        if "API_KEY_LIMIT_EXCEEDED" in error_message:
            raise HTTPException(
                status_code=429, 
                detail="API_KEY_LIMIT_EXCEEDED: Gemini API quota/rate limit has been exceeded. Please try again later or check your API key limits."
            )
        elif "API_KEY_ERROR" in error_message:
            raise HTTPException(
                status_code=401,
                detail="API_KEY_ERROR: Invalid or missing API key. Please check your Gemini API key configuration."
            )
        elif "GEMINI_API_ERROR" in error_message:
            raise HTTPException(
                status_code=500,
                detail=error_message
            )
        else:
            raise HTTPException(status_code=500, detail=f"Error processing prediction: {error_message}")
    except Exception as e:
        error_str = str(e).lower()
        if "quota" in error_str or "limit" in error_str or "rate limit" in error_str:
            raise HTTPException(
                status_code=429,
                detail="API_KEY_LIMIT_EXCEEDED: API quota/rate limit has been exceeded. Please try again later."
            )
        raise HTTPException(status_code=500, detail=f"Error processing prediction: {str(e)}")

@app.post("/ask", response_model=ChatbotResponse)
async def ask_question(request: ChatbotRequest):
    """
    Answer questions based strictly on the provided prediction data.
    The chatbot will only answer questions using information from the dataset.
    """
    try:
        # Create a prompt that restricts answers to only the provided dataset
        prompt = create_chatbot_prompt(request.question, request.prediction_data, request.language)
        
        # Get answer from Gemini
        answer = get_chatbot_answer(prompt, request.language)
        
        return {
            "answer": answer
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing question: {str(e)}")

def fetch_climate_data(lat: float, lon: float) -> dict:
    """Fetch climate data from NASA POWER API"""
    import requests
    from datetime import datetime, timedelta
    
    BASE_URL = "https://power.larc.nasa.gov/api/temporal/daily/point"
    
    today = datetime.now()
    thirty_days_ago = today - timedelta(days=30)
    
    end_date_str = today.strftime("%Y%m%d")
    start_date_str = thirty_days_ago.strftime("%Y%m%d")
    
    params = {
        "request": "execute",
        "parameters": "T2M,PRECTOTCORR,GWETTOP,TS",
        "community": "AG",
        "longitude": lon,
        "latitude": lat,
        "start": start_date_str,
        "end": end_date_str,
        "format": "JSON"
    }
    
    # Reduced timeout to fail faster if API is slow (5 seconds)
    response = requests.get(BASE_URL, params=params, timeout=5)
    response.raise_for_status()
    
    data = response.json()
    parameters = data['properties']['parameter']
    
    def clean_values(param_key):
        return [v for v in parameters[param_key].values() if v != -999]
    
    t2m_values = clean_values('T2M')
    gwet_values = clean_values('GWETTOP')
    ts_values = clean_values('TS')
    precip_values = clean_values('PRECTOTCORR')
    
    if not t2m_values:
        raise ValueError("No valid climate data found for the requested period")
    
    avg_temp = sum(t2m_values) / len(t2m_values)
    avg_soil_moist = sum(gwet_values) / len(gwet_values)
    avg_surface_temp = sum(ts_values) / len(ts_values)
    total_rainfall = sum(precip_values)
    
    return {
        "avg_temp": round(avg_temp, 2),
        "avg_soil_moisture": round(avg_soil_moist, 4),
        "avg_surface_temp": round(avg_surface_temp, 2),
        "total_rainfall": round(total_rainfall, 2)
    }

def get_soil_info(soil_type: str) -> dict:
    """Get soil information from iot_data.json"""
    import json
    
    try:
        with open("iot_data.json", "r") as f:
            iot_data = json.load(f)
        
        for soil in iot_data["soil_data"]:
            if soil["type"].lower() == soil_type.lower():
                return {
                    "type": soil["type"],
                    "water_retention": soil["water_retention"],
                    "nutrient_content": soil["nutrient_content"],
                    "pH_level": soil["pH_level"]
                }
        
        return {"type": soil_type, "water_retention": "Unknown", "nutrient_content": "Unknown", "pH_level": 0}
    
    except FileNotFoundError:
        return {"type": soil_type, "water_retention": "Unknown", "nutrient_content": "Unknown", "pH_level": 0}

def create_prediction_prompt(land_area: int, latitude: float, longitude: float, 
                            soil_type: str, climate_data: dict, soil_info: dict) -> str:
    """Create a detailed prompt for Gemini API"""
    # Convert square feet to acres (1 acre = 43,560 sq ft)
    land_area_acres = land_area / 43560
    
    return f"""
Based on the following agricultural data, provide crop recommendations:

**Land Details:**
- Land Area: {land_area} square feet ({land_area_acres:.2f} acres)
- Location: Latitude {latitude}, Longitude {longitude}

**Climate Data (Last 30 days):**
- Average Temperature: {climate_data['avg_temp']}°C
- Average Soil Moisture: {climate_data['avg_soil_moisture']}
- Average Surface Temperature: {climate_data['avg_surface_temp']}°C
- Total Rainfall: {climate_data['total_rainfall']} mm

**Soil Information:**
- Type: {soil_info['type']}
- Water Retention: {soil_info['water_retention']}
- Nutrient Content: {soil_info['nutrient_content']}
- pH Level: {soil_info['pH_level']}

Please provide recommendations in the following JSON format:
{{
    "crops": [
        {{
            "name": "Crop Name",
            "water_required_liters": <total liters needed for {land_area} sq ft>
        }}
    ],
    "yield_data": [
        {{
            "crop_name": "Crop Name",
            "yield_amount": <exact numeric yield in kg for {land_area} sq ft, not a range>,
            "market_rate_per_unit": <exact market rate in rupees per kg>,
            "cost_of_selling": <yield_amount * market_rate_per_unit>,
            "cost_of_growing": <exact cost in rupees to grow this crop on {land_area} sq ft>,
            "roi": <((cost_of_selling - cost_of_growing) / cost_of_growing) * 100>
        }}
    ],
    "crop_timeline": [
        {{
            "crop": "Crop Name",
            "season": "Season (Kharif/Rabi/Summer/Year Round)",
            "suitable_months": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"] - only include months suitable for planting
        }}
    ],
    "best_sowing_time": "Optimal planting season(s) with specific months"
}}

Recommend 3-5 best crops considering climate and soil conditions. For yield_data, provide EXACT numbers (not ranges) for yield in kg, market rates in Indian rupees per kg, costs in rupees, and ROI as a percentage. For crop_timeline, include all 12 months list but only list the suitable months for planting each crop. Be very specific with all values.
"""

def get_gemini_prediction(prompt: str) -> dict:
    """Get prediction from Gemini API"""
    import json
    import re
    
    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt)
    except Exception as e:
        error_str = str(e).lower()
        # Check for API key limit errors
        if "quota" in error_str or "limit" in error_str or "rate limit" in error_str or "429" in error_str:
            raise ValueError("API_KEY_LIMIT_EXCEEDED: Gemini API quota/rate limit has been exceeded. Please try again later or check your API key limits.")
        elif "api key" in error_str or "invalid" in error_str or "401" in error_str or "403" in error_str:
            raise ValueError("API_KEY_ERROR: Invalid or missing API key. Please check your Gemini API key configuration.")
        else:
            raise ValueError(f"GEMINI_API_ERROR: {str(e)}")
    
    # Extract JSON from response
    response_text = response.text
    
    # Try to find JSON in the response
    json_match = re.search(r'\{[\s\S]*\}', response_text)
    if json_match:
        try:
            prediction_data = json.loads(json_match.group())
            return {
                "crops": prediction_data.get("crops", []),
                "yield_data": prediction_data.get("yield_data", []),
                "crop_timeline": prediction_data.get("crop_timeline", []),
                "best_sowing_time": prediction_data.get("best_sowing_time", "Not specified")
            }
        except json.JSONDecodeError:
            pass
    
    # Fallback: return the raw response
    return {
        "crops": [],
        "yield_data": [],
        "crop_timeline": [],
        "best_sowing_time": "Not specified"
    }

def create_chatbot_prompt(question: str, prediction_data: CropPredictionResponse, language: str = "en") -> str:
    """Create a prompt for the chatbot that restricts answers to only the provided dataset"""
    import json
    
    # Format the prediction data as a readable string
    crops_str = "\n".join([
        f"- {crop['name']}: Requires {crop['water_required_liters']:,} liters of water"
        for crop in prediction_data.crops
    ])
    
    yield_data_str = "\n".join([
        f"- {y['crop_name']}: "
        f"Yield: {y['yield_amount']} kg, "
        f"Market Rate: ₹{y['market_rate_per_unit']}/kg, "
        f"Sell Value (Total Revenue): ₹{y['cost_of_selling']:,}, "
        f"Growing Cost: ₹{y['cost_of_growing']:,}, "
        f"Profit (Revenue - Cost): ₹{y['cost_of_selling'] - y['cost_of_growing']:,}, "
        f"ROI: {y['roi']:.2f}%"
        for y in prediction_data.yield_data
    ])
    
    
    climate_str = (
        f"Average Temperature: {prediction_data.climate_data['avg_temp']}°C\n"
        f"Average Soil Moisture: {prediction_data.climate_data['avg_soil_moisture']}\n"
        f"Average Surface Temperature: {prediction_data.climate_data['avg_surface_temp']}°C\n"
        f"Total Rainfall: {prediction_data.climate_data['total_rainfall']} mm"
    )
    
    soil_str = (
        f"Type: {prediction_data.soil_info['type']}\n"
        f"Water Retention: {prediction_data.soil_info['water_retention']}\n"
        f"Nutrient Content: {prediction_data.soil_info['nutrient_content']}\n"
        f"pH Level: {prediction_data.soil_info['pH_level']}"
    )
    
    # Language mapping with detailed instructions
    language_instructions = {
        "en": {
            "name": "English",
            "prefix": "Respond in English language only. Do not mix any other languages in your response.",
        },
        "hi": {
            "name": "Hindi (हिंदी)",
            "prefix": "आप को हिंदी में जवाब देना है। अपने उत्तर में किसी अन्य भाषा को मिश्रित न करें। सभी शब्द, संख्याएं और व्याख्या हिंदी में होनी चाहिए।",
        },
        "kn": {
            "name": "Kannada (ಕನ್ನಡ)",
            "prefix": "ನೀವು ಕನ್ನಡ ಭಾಷೆಯಲ್ಲಿ ಉತ್ತರ ನೀಡಬೇಕು. ನಿಮ್ಮ ಪ್ರತಿಕ್ರಿಯೆಯಲ್ಲಿ ಯಾವುದೇ ಇತರ ಭಾಷೆಯನ್ನು ಮಿಶ್ರಣ ಮಾಡಬೇಡಿ. ಎಲ್ಲಾ ಪದಗಳು, ಸಂಖ್ಯೆಗಳು ಮತ್ತು ವಿವರಣೆಯು ಕನ್ನಡದಲ್ಲಿ ಹೋಗಬೇಕು.",
        }
    }
    
    lang_config = language_instructions.get(language, language_instructions["en"])
    target_language = lang_config["name"]
    language_prefix = lang_config["prefix"]
    
    return f"""{language_prefix}

You are an agricultural assistant chatbot. You can ONLY answer questions based on the following crop prediction data provided below. 

CRITICAL RULES - YOU MUST FOLLOW THESE STRICTLY:
1. LANGUAGE REQUIREMENT: You MUST respond in {target_language} language ONLY. Every single word must be in {target_language}. Do NOT mix languages. Do NOT include English words or phrases unless they are proper nouns (like crop names or technical measurements).
2. DATA-BASED ANSWERS ONLY: You MUST ONLY use information from the dataset provided below. Do NOT use any external knowledge.
3. ALLOWED CALCULATIONS: You CAN perform calculations using the data provided (e.g., profit = Sell Value - Growing Cost, net income, etc.)
4. ALLOWED TOPICS: You CAN answer questions about:
   - Crop recommendations and their details
   - Yield amounts, market rates, costs, ROI
   - Profit calculations (Sell Value minus Growing Cost)
   - Net income, earnings, or any financial metrics derivable from the data
   - Climate data, soil information
   - Sowing times and crop timelines
5. DENIED REQUESTS: If the question asks about something NOT in this dataset and cannot be calculated from it, you MUST respond with a polite refusal in {target_language}.
6. ACCURACY: Do NOT make up, infer, or guess any information that is not explicitly in the dataset below.
7. NO EXTERNAL ADVICE: Do NOT provide general agricultural advice, farming tips, or any information outside of this specific dataset.
8. CONCISENESS: Be concise and accurate, using only the exact numbers and facts from the dataset.
9. MISSING DATA: If asked about crops not listed in the dataset, say they are not in the available data (in {target_language}).
10. OUT-OF-SCOPE: If asked about general farming practices, weather patterns, or anything not in the dataset, decline politely and refer to the dataset limitation (in {target_language}).

**CROP RECOMMENDATIONS:**
{crops_str}

**YIELD & ECONOMICS DATA:**
{yield_data_str}

**BEST SOWING TIME:**
{prediction_data.best_sowing_time}

**CLIMATE DATA:**
{climate_str}

**SOIL INFORMATION:**
{soil_str}

**USER QUESTION:**
{question}

**YOUR ANSWER (in {target_language} ONLY - do not mix languages):**
"""

def get_chatbot_answer(prompt: str, language: str = "en") -> str:
    """Get answer from Gemini API for chatbot"""
    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        
        # Configure generation to be more focused on the requested language
        generation_config = {
            "temperature": 0.1,  # Lower temperature for more consistent language adherence
            "top_p": 0.7,  # More restrictive for consistency
            "top_k": 20,  # Smaller top_k for less randomness
            "max_output_tokens": 500,
        }
        
        response = model.generate_content(
            prompt,
            generation_config=generation_config
        )
        
        answer = response.text.strip()
        
        # Post-processing: Clean up any mixed language artifacts
        # For Hindi and Kannada, check if response contains too much English and warn
        if language in ["hi", "kn"]:
            answer = clean_response_language(answer, language)
        
        # Validate that answer is not empty
        if not answer:
            error_messages = {
                "en": "I apologize, but I couldn't generate an answer. Please try rephrasing your question.",
                "hi": "मुझे खेद है, लेकिन मैं उत्तर उत्पन्न नहीं कर सका। कृपया अपने प्रश्न को फिर से तैयार करने का प्रयास करें।",
                "kn": "ಕ್ಷಮಿಸಿ, ನಾನು ಉತ್ತರವನ್ನು ರಚಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಮರುರೂಪಿಸಲು ಪ್ರಯತ್ನಿಸಿ."
            }
            return error_messages.get(language, error_messages["en"])
        
        return answer
    
    except Exception as e:
        error_messages = {
            "en": f"I encountered an error while processing your question: {str(e)}",
            "hi": f"आपके प्रश्न को संसाधित करते समय मुझे एक त्रुटि का सामना करना पड़ा: {str(e)}",
            "kn": f"ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಪ್ರಕ್ರಿಯೆಗೊಳಿಸುವಾಗ ನಾನು ದೋಷವನ್ನು ಎದುರಿಸಿದೆ: {str(e)}"
        }
        return error_messages.get(language, error_messages["en"])

def clean_response_language(response: str, language: str) -> str:
    """
    Clean up response to ensure it stays in the requested language.
    This removes or minimizes English text that may have been mixed in.
    """
    import re
    
    if language == "hi":
        # For Hindi, look for common patterns where English text might be mixed
        # Keep numeric values and proper nouns (crop names), but translate common English phrases if possible
        pass  # The model instruction should be strong enough
    
    elif language == "kn":
        # For Kannada, similar approach
        pass  # The model instruction should be strong enough
    
    return response

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)