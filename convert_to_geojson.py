import pandas as pd
import json
from datetime import datetime

print("Reading Excel file...")
df = pd.read_excel('Distresses_20251014_2.xlsx')

print(f"Found {len(df)} distress points")
print(f"Columns: {list(df.columns[:10])}...")

# Remove rows with missing lat/lon
df = df.dropna(subset=['latitude', 'longitude'])
print(f"After removing invalid coordinates: {len(df)} points")
print(f"\nCoordinate ranges (Aseer region, Saudi Arabia):")
print(f"  Latitude: {df['latitude'].min():.6f}° to {df['latitude'].max():.6f}°N")
print(f"  Longitude: {df['longitude'].min():.6f}° to {df['longitude'].max():.6f}°E")

# Map severity to conditions (matching our map's color scheme)
severity_to_condition = {
    'Low': 'good',
    'Med': 'fair',
    'High': 'poor',
    'Critical': 'very_poor'
}

# Map severity to value (for color coding)
severity_to_value = {
    'Low': 75,
    'Med': 55,
    'High': 35,
    'Critical': 15
}

# Create GeoJSON structure
features = []

for idx, row in df.iterrows():
    # Get severity and map it
    severity = str(row.get('severity_PCI', 'Med')).strip()
    condition = severity_to_condition.get(severity, 'fair')
    value = severity_to_value.get(severity, 50)
    
    # Create feature with ALL Excel columns
    feature = {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [float(row['longitude']), float(row['latitude'])]
        },
        "properties": {
            # For map styling
            "code": f"DIST-{idx:05d}",
            "name": f"{row.get('distressType_PCI', 'Distress')} - {severity}",
            "type": "distress",
            "layer": "distress",
            "value": value,
            "condition": condition,
            
            # Section Information (from Excel)
            "junoSectionID": str(row.get('junoSectionID', '')),
            "administrativeRegionCode": str(row.get('administrativeRegionCode', '')),
            "SectionCode": str(row.get('SectionCode', '')),
            "lane": str(row.get('lane', '')),
            "location": str(row.get('location', '')),
            
            # Measurement Data (from Excel)
            "measDate": str(row.get('measDate', ''))[:10] if pd.notna(row.get('measDate')) else '',
            "length_mm": float(row.get('length_mm', 0)) if pd.notna(row.get('length_mm')) else 0,
            "width_mm": float(row.get('width_mm', 0)) if pd.notna(row.get('width_mm')) else 0,
            "depth_mm": float(row.get('depth_mm', 0)) if pd.notna(row.get('depth_mm')) else 0,
            "area_m2": float(row.get('area_m2', 0)) if pd.notna(row.get('area_m2')) else 0,
            
            # PCI Distress Information (from Excel)
            "distressNo_PCI": str(row.get('distressNo_PCI', '')),
            "distressType_PCI": str(row.get('distressType_PCI', 'Unknown')),
            "severityNo_PCI": str(row.get('severityNo_PCI', '')),
            "severity_PCI": severity,
            
            # UDI Distress Information (from Excel)
            "distressNo_UDI": str(row.get('distressNo_UDI', '')),
            "distressType_UDI": str(row.get('distressType_UDI', '')),
            "severityNo_UDI": str(row.get('severityNo_UDI', '')),
            "severity_UDI": str(row.get('severity_UDI', '')),
            
            # Survey Information (from Excel)
            "surveyType": str(row.get('surveyType', '')),
            "surveyDataSource": str(row.get('surveyDataSource', '')),
            "surveyInspector": str(row.get('surveyInspector', '')),
            "surveyChangeStart": str(row.get('surveyChangeStart', '')),
            "surveyChangeEnd": str(row.get('surveyChangeEnd', '')),
            
            # Geographic Information (from Excel)
            "latitude": float(row['latitude']),
            "longitude": float(row['longitude']),
            "elevation": float(row.get('elevation', 0)) if pd.notna(row.get('elevation')) else 0
        }
    }
    
    features.append(feature)

# Create GeoJSON FeatureCollection
geojson = {
    "type": "FeatureCollection",
    "metadata": {
        "name": "Road Distress Survey Data",
        "description": f"Road distress points from survey - {len(features)} distresses",
        "generated": datetime.now().strftime("%Y-%m-%d"),
        "coordinateSystem": "WGS84",
        "location": "Saudi Arabia - Survey Area",
        "totalFeatures": len(features),
        "dataSource": "Distresses_20251014_2.xlsx"
    },
    "features": features
}

# Save to JSON file
output_file = 'public/distresses-map-data.json'
print(f"\nSaving to {output_file}...")

with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(geojson, f, indent=2, ensure_ascii=False)

print(f"✅ Successfully converted {len(features)} distress points to GeoJSON!")
print(f"\nFile saved: {output_file}")

# Print statistics
print("\n=== STATISTICS ===")
print(f"Total distress points: {len(features)}")

# Count by severity
severity_counts = df['severity_PCI'].value_counts()
print(f"\nBy Severity:")
for sev, count in severity_counts.items():
    print(f"  {sev}: {count}")

# Count by distress type
distress_counts = df['distressType_PCI'].value_counts().head(10)
print(f"\nTop 10 Distress Types:")
for dist, count in distress_counts.items():
    print(f"  {dist}: {count}")

# Coordinate bounds
print(f"\nCoordinate Bounds:")
print(f"  Latitude: {df['latitude'].min():.6f} to {df['latitude'].max():.6f}")
print(f"  Longitude: {df['longitude'].min():.6f} to {df['longitude'].max():.6f}")

print("\n✨ Ready to upload to the map!")
print("📍 Go to http://localhost:3000/map-demo and upload: public/distresses-map-data.json")
