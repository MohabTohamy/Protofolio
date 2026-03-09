import pandas as pd

df = pd.read_excel('Distresses_20251014_2.xlsx')

print(f"Latitude range: {df['latitude'].min():.6f} to {df['latitude'].max():.6f}")
print(f"Longitude range: {df['longitude'].min():.6f} to {df['longitude'].max():.6f}")

print(f"\n🔍 Searching for your sample coordinate (lat=19.35, lon=42.08)...")
matches = df[(df['latitude'] > 19.35) & (df['latitude'] < 19.36)]
print(f"Found {len(matches)} rows with latitude ~19.35")

if len(matches) > 0:
    print("\nSample rows:")
    print(matches[['latitude', 'longitude', 'elevation']].head())
    
print(f"\n🔍 Checking if lat/lon might be reversed in some rows...")
matches2 = df[(df['longitude'] > 19.35) & (df['longitude'] < 19.36)]
print(f"Found {len(matches2)} rows with LONGITUDE ~19.35")

if len(matches2) > 0:
    print("\nThese look REVERSED:")
    print(matches2[['latitude', 'longitude', 'elevation']].head())
