import pandas as pd
import json
import sys

try:
    # Read the Excel file
    print("Reading Excel file...")
    df = pd.read_excel('Distresses_20251014_2.xlsx')
    
    # Display column names
    print(f"\nFound {len(df)} rows")
    print(f"\nColumns: {list(df.columns)}")
    
    # Display first few rows to understand the data
    print("\nFirst 5 rows:")
    print(df.head().to_string())
    
    # Display data types
    print("\nData types:")
    print(df.dtypes)
    
except Exception as e:
    print(f"Error: {e}")
    print("\nTrying to install required packages...")
    import subprocess
    subprocess.run([sys.executable, "-m", "pip", "install", "pandas", "openpyxl"])
    print("\nPlease run the script again after installation.")
