import requests
import json
from datetime import datetime, timedelta

# Coordinates for Whitefield, Bengaluru, India
LATITUDE = 13.1172
LONGITUDE = 77.6346

def fetch_and_display_data(lat, lon):
    # API Endpoint for Daily Time-Series
    BASE_URL = "https://power.larc.nasa.gov/api/temporal/daily/point"
    
    # --- Dynamic Date Calculation ---
    today = datetime.now()
    thirty_days_ago = today - timedelta(days=30)
    
    # NASA POWER requires YYYYMMDD format
    end_date_str = today.strftime("%Y%m%d")
    start_date_str = thirty_days_ago.strftime("%Y%m%d")
    
    # NASA data may have a lag, meaning the last few days might return -999 (missing)
    # The API documentation suggests data is available to within about 7 days of real time.
    
    # Parameters: T2M, PRECTOTCORR, GWETTOP, TS
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

    print(f"Fetching NASA POWER historical data for {start_date_str} to {end_date_str}...")
    
    # --- API Call ---
    response = requests.get(BASE_URL, params=params, timeout=15)
    
    # Check for success (Essential check)
    response.raise_for_status() 
    
    data = response.json()
    
    # Extracting data
    parameters = data['properties']['parameter']
    
    # --- Data Processing: Calculating Averages and Total ---
    
    # Filter out missing values (-999) before calculation
    def clean_values(param_key):
        return [v for v in parameters[param_key].values() if v != -999]

    t2m_values = clean_values('T2M')
    gwet_values = clean_values('GWETTOP')
    ts_values = clean_values('TS')
    precip_values = clean_values('PRECTOTCORR')
    
    if not t2m_values:
        print("\nError: No valid data found for the requested 30-day period. The latest data is likely lagging.")
        return
        
    avg_temp = sum(t2m_values) / len(t2m_values)
    avg_soil_moist = sum(gwet_values) / len(gwet_values)
    avg_surface_temp = sum(ts_values) / len(ts_values)
    
    # PRECTOTCORR (Total Rainfall) - Sum is appropriate
    total_rainfall = sum(precip_values)

    # --- Display Results ---
    print(f"\n--- Historical Climate & Soil Summary ({start_date_str} to {end_date_str}) ---")
    print(f"Location: Latitude {lat}, Longitude {lon}")
    print("-----------------------------------------------------")
    print(f"Avg Air Temp (C): {avg_temp:.2f}")
    print(f"Avg Soil Moisture (0-5cm): {avg_soil_moist:.4f} (fraction)")
    print(f"Avg Surface Temp (C): {avg_surface_temp:.2f}")
    print(f"Total Rainfall (mm): {total_rainfall:.2f}")


# ----------------------------------------------------------------------
# Main Execution
# ----------------------------------------------------------------------
fetch_and_display_data(lat=LATITUDE, lon=LONGITUDE)