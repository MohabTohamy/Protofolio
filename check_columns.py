import pandas as pd

# Read just first few rows to inspect
df = pd.read_excel('Distresses_20251014_2.xlsx', nrows=5)

print("Column names and sample values:")
print("=" * 80)
for col in ['latitude', 'longitude', 'elevation']:
    if col in df.columns:
        print(f"\n{col}:")
        print(df[col].tolist())
print("\n" + "=" * 80)

# Check data types
print(f"\nlatitude values type: {type(df['latitude'].iloc[0])}")
print(f"longitude values type: {type(df['longitude'].iloc[0])}")

# Show actual values
print(f"\nFirst row actual values:")
print(f"  latitude column value: {df['latitude'].iloc[0]}")
print(f"  longitude column value: {df['longitude'].iloc[0]}")
print(f"  elevation column value: {df['elevation'].iloc[0]}")

print(f"\n✅ For Aseer region, we expect:")
print(f"  Latitude: ~17-20° N")
print(f"  Longitude: ~41-43° E")
