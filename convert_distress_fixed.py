import pandas as pd
import json
from datetime import datetime

print("Reading Excel file...")
# Read Excel - adjust column reading
df = pd.read_excel('Distresses_20251014_2.xlsx', header=None)

print(f"Found {len(df)} rows")
print(f"Columns in file: {df.shape[1]}")

# Show first row to see structure
print("\nFirst row sample:")
print(df.iloc[0].tolist())

# Based on your data: last 3 columns are elevation, longitude, latitude
# Let's check the column positions
lat_col = df.shape[1] - 2  # Second from last
lon_col = df.shape[1] - 3  # Third from last  
elev_col = df.shape[1] - 1  # Last column

print(f"\nAssuming coordinates in columns: Lat={lat_col}, Lon={lon_col}, Elev={elev_col}")

# Check if first row has column names
first_row = df.iloc[0].tolist()
if 'latitude' in first_row or 'longitude' in first_row:
    # File has headers - use them
print("File has column headers")
    df.columns = df.iloc[0]
    df = df.iloc[1:]
    
    # IMPORTANT: Excel file has lat/lon columns SWAPPED!
    # The column named 'latitude' actually contains longitude values
    # The column named 'longitude' actually contains latitude values
    df = df.rename(columns={
        'latitude': 'longitude_temp',
        'longitude': 'latitude',
        'longitude_temp': 'longitude'
    })
else:
    # No headers - use position
    df.columns = [f'col_{i}' for i in range(df.shape[1])]
    df = df.rename(columns={
        f'col_{lat_col}': 'latitude',
        f'col_{lon_col}': 'longitude',
        f'col_{elev_col}': 'elevation'
    })

# Skip header row if exists
if df.iloc[0]['latitude'] == 'latitude' or not isinstance(df.iloc[0]['latitude'], (int, float)):
    df = df.iloc[1:]
    print("Skipped header row")

# Convert to numeric and remove invalid
df['latitude'] = pd.to_numeric(df['latitude'], errors='coerce')
df['longitude'] = pd.to_numeric(df['longitude'], errors='coerce')
df = df.dropna(subset=['latitude', 'longitude'])

print(f"After removing invalid coordinates: {len(df)} points")
print(f"\nCoordinate ranges:")
print(f"  Latitude: {df['latitude'].min():.6f} to {df['latitude'].max():.6f}")
print(f"  Longitude: {df['longitude'].min():.6f} to {df['longitude'].max():.6f}")

# Try to identify other columns by position (adjust based on your Excel structure)
# Severity might be in column around position 11-12 (where you showed "Med")
severity_col_idx = 11 if df.shape[1] > 11 else None

# Map severity to conditions
severity_to_condition = {
    'Low': 'good',
    'Med': 'fair', 
    'High': 'poor',
    'Critical': 'very_poor',
    '1': 'good',
    '2': 'fair',
    '3': 'poor'
}

severity_to_value = {
    'Low': 75,
    'Med': 55,
    'High': 35,
    'Critical': 15,
    '1': 75,
    '2': 55,
    '3': 35
}

# Create GeoJSON features
features = []

for idx, row in df.iterrows():
    # Get severity if column exists
    if severity_col_idx and f'col_{severity_col_idx}' in df.columns:
        severity = str(row[f'col_{severity_col_idx}']).strip()
    else:
        severity = 'Med'
    
    condition = severity_to_condition.get(severity, 'fair')
    value = severity_to_value.get(severity, 50)
    
    # Create feature with coordinates in correct order: [longitude, latitude]
    feature = {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [float(row['longitude']), float(row['latitude'])]
        },
        "properties": {
            "code": f"DIST-{idx:05d}",
            "name": f"Distress - {severity}",
            "type": "distress",
            "layer": "distress",
            "value": value,
            "condition": condition,
            "severity": severity,
            "elevation": float(row['elevation']) if pd.notna(row.get('elevation')) else 0
        }
    }
    
    features.append(feature)

# Create GeoJSON
geojson = {
    "type": "FeatureCollection",
    "metadata": {
        "name": "Road Distress Survey Data - Aseer Region",
        "description": f"Road distress points from survey - {len(features)} distresses",
        "generated": datetime.now().strftime("%Y-%m-%d"),
        "coordinateSystem": "WGS84",
        "location": "Saudi Arabia - Aseer Region",
        "totalFeatures": len(features)
    },
    "features": features
}

# Save to file
output_file = 'public/distresses-map-data.json'
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(geojson, f, indent=2, ensure_ascii=False)

print(f"\n✅ Created {output_file}")
print(f"   Total features: {len(features)}")
print(f"\nSample coordinate (first point):")
print(f"   Lon: {features[0]['geometry']['coordinates'][0]}")
print(f"   Lat: {features[0]['geometry']['coordinates'][1]}")
print("\nYou can now upload this file in the map interface!")
