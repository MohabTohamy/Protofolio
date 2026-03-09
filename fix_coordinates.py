import pandas as pd
import json
from datetime import datetime

print("Reading Excel file...")
df = pd.read_excel('Distresses_20251014_2.xlsx')

print(f"Found {len(df)} rows")
print(f"Columns: {list(df.columns)}")

# IMPORTANT FIX: Your Excel file has latitude/longitude columns SWAPPED!
# Column named 'latitude' contains longitude values (41-42 range)
# Column named 'longitude' contains latitude values (17-19 range)
# We need to swap them!

print("\n⚠️  Excel columns are swapped! Fixing...")
df = df.rename(columns={
    'latitude': 'longitude',  # What's labeled 'latitude' is actually longitude
    'longitude': 'latitude'    # What's labeled 'longitude' is actually latitude  
})

# Convert to numeric
df['latitude'] = pd.to_numeric(df['latitude'], errors='coerce')
df['longitude'] = pd.to_numeric(df['longitude'], errors='coerce')
df = df.dropna(subset=['latitude', 'longitude'])

print(f"After removing invalid coordinates: {len(df)} points")
print(f"\nCorrected coordinate ranges (Aseer region):")
print(f"  Latitude: {df['latitude'].min():.6f} to {df['latitude'].max():.6f}")
print(f"  Longitude: {df['longitude'].min():.6f} to {df['longitude'].max():.6f}")

# Map severity to conditions
severity_to_condition = {
    'Low': 'good',
    'Med': 'fair',
    'High': 'poor',
    'Critical': 'very_poor'
}

severity_to_value = {
    'Low': 75,
    'Med': 55,
    'High': 35,
    'Critical': 15
}

# Create GeoJSON features
features = []

for idx, row in df.iterrows():
    severity = str(row.get('severity_PCI', 'Med')).strip()
    condition = severity_to_condition.get(severity, 'fair')
    value = severity_to_value.get(severity, 50)
    
    # Create feature - coordinates in GeoJSON order: [longitude, latitude]
    feature = {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [float(row['longitude']), float(row['latitude'])]
        },
        "properties": {
            "code": f"DIST-{idx:05d}",
            "name": f"{row.get('distressType_PCI', 'Distress')} - {severity}",
            "type": "distress",
            "layer": "distress",
            "value": value,
            "condition": condition,
            "distressType": str(row.get('distressType_PCI', 'Unknown')),
            "severity": severity,
            "sectionCode": str(row.get('SectionCode', '')),
            "lane": str(row.get('lane', '')),
            "surveyDate": str(row.get('measDate', ''))[:10] if pd.notna(row.get('measDate')) else '',
            "surveyType": str(row.get('surveyType', '')),
            "surveyInspector": str(row.get('surveyInspector', '')),
            "elevation": float(row.get('elevation', 0)) if pd.notna(row.get('elevation')) else 0
        }
    }
    
    features.append(feature)

# Create GeoJSON
geojson = {
    "type": "FeatureCollection",
    "metadata": {
        "name": "Road Distress Survey Data - Aseer Region",
        "description": f"Road distress points from LCMS survey - {len(features)} distresses",
        "generated": datetime.now().strftime("%Y-%m-%d"),
        "coordinateSystem": "WGS84",
        "location": "Saudi Arabia - Aseer Region (Southern Province)",
        "region": "Aseer",
        "totalFeatures": len(features),
        "dataSource": "Distresses_20251014_2.xlsx"
    },
    "features": features
}

# Save to file
output_file = 'public/distresses-map-data.json'
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(geojson, f, indent=2, ensure_ascii=False)

print(f"\n✅ SUCCESS! Created {output_file}")
print(f"   Total features: {len(features)}")
print(f"\n📍 Sample coordinates (should be in Aseer ~19°N, 42°E):")
print(f"   First point: Lon={features[0]['geometry']['coordinates'][0]:.6f}, Lat={features[0]['geometry']['coordinates'][1]:.6f}")
print(f"   Last point: Lon={features[-1]['geometry']['coordinates'][0]:.6f}, Lat={features[-1]['geometry']['coordinates'][1]:.6f}")
print("\n🗺️  Now click 'Upload Data File' in the map and select this file!")
