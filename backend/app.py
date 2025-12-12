from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
import os
from dotenv import load_dotenv
from climate_data import fetch_and_display_data

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
        # Fetch climate data from NASA POWER API
        climate_data = fetch_climate_data(request.latitude, request.longitude)
        
        # Get soil information from iot_data.json
        soil_info = get_soil_info(request.soil_type)
        
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
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing prediction: {str(e)}")

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
    
    response = requests.get(BASE_URL, params=params, timeout=15)
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
    
    model = genai.GenerativeModel("gemini-2.5-flash")
    response = model.generate_content(prompt)
    
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)