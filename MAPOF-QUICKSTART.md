# Interactive Map Demo - Quick Start Guide

## 🎉 What We Built

A fully functional interactive GIS map system inspired by your MainMap.tsx, but redesigned to work **without a database** using file upload/download functionality.

## 🚀 Key Features

### 1. **File-Based Data System**
   - Download sample GeoJSON data
   - Upload your own data files
   - Works entirely client-side (no backend needed)

### 2. **Real Map from MainMap.tsx**
   - Uses MapLibre/Mapbox GL (same as your real project)
   - Condition-based coloring (Good/Fair/Poor)
   - Multiple layer types (Pavement PCI/IRI, Assets: Guardrails, Light Poles, etc.)
   - Interactive popups with feature details
   - Layer visibility controls
   - Condition filtering

### 3. **Sample Data Included**
   Located at `/public/sample-map-data.json`:
   - 3 PCI road lanes (Good, Fair, Poor conditions)
   - 2 IRI road lanes
   - 2 Guardrail sections
   - 1 Curb stone section
   - 4 Point assets (Light Pole, Road Sign, Manhole, Catch Basin)
   - Real coordinates (Riyadh area: ~46.67°E, 24.71°N)

## 📋 How to Test

### Step 1: Access the Map
1. Make sure your dev server is running: `npm run dev`
2. Navigate to: http://localhost:3000/map-demo

### Step 2: Download Sample Data
1. Click **"Download Sample Data"** button
2. Save `sample-map-data.json` to your desktop
3. (Optional) Open it in a text editor to see the structure

### Step 3: Upload and View
1. Click **"Upload Data File"** button
2. Select the sample-map-data.json you just downloaded
3. **Magic happens**: Map automatically zooms to show all features
4. You'll see:
   - Colored road lines (green, yellow, red based on condition)
   - Colored point markers for assets
   - Statistics showing 14 features loaded

### Step 4: Interact with the Map
- **Click any feature** to see a popup with all its properties
- **Use Layer Controls** to toggle visibility of different layer types
- **Use Condition Filters** to show only Good, Fair, or Poor features
- **Pan and Zoom** to explore the data

### Step 5: Create Your Own Data
1. Copy the sample file
2. Modify coordinates to your location (anywhere in the world!)
3. Change values, add more features
4. Upload and see your custom data visualized

## 📝 GeoJSON Format

### For Line Features (Roads, Guardrails, Curbs)
```json
{
  "type": "Feature",
  "geometry": {
    "type": "LineString",
    "coordinates": [
      [longitude1, latitude1],
      [longitude2, latitude2],
      [longitude3, latitude3]
    ]
  },
  "properties": {
    "code": "RD-001",
    "name": "My Road",
    "type": "pavement",
    "layer": "pci",
    "value": 85,
    "condition": "good"
  }
}
```

### For Point Features (Poles, Signs, Manholes)
```json
{
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": [longitude, latitude]
  },
  "properties": {
    "code": "LP-001",
    "name": "Light Pole",
    "type": "asset",
    "layer": "lightpoles",
    "value": 90,
    "condition": "good"
  }
}
```

## 🎨 Supported Layer Types

### Pavement Layers
- `pci` - Pavement Condition Index
- `iri` - International Roughness Index
- `pqi` - Pavement Quality Index
- `fwd` - Falling Weight Deflectometer
- `cft` - Coefficient of Friction Test
- `gpr` - Ground Penetrating Radar

### Asset Layers
- `guardrail` - Guardrails
- `curbstone` - Curb Stones
- `lightpoles` - Light Poles
- `roadsigns` - Road Signs
- `manhole` - Manholes
- `catchbasin` - Catch Basins
- `fence` - Fences
- `bollards` - Bollards
- ...and more (see MainMap.tsx for full list)

## 🎯 Condition Values & Colors

### Assets (uses ACI - Asset Condition Index)
- **Good** (71-100): Dark Green `#228B22`
- **Fair** (41-70): Yellow `#FFEB3B`
- **Poor** (0-40): Red `#FF6B6B`

### Pavement PCI/PQI
- **Good** (≥85): Dark Green
- **Satisfactory** (70-84): Lime Green
- **Fair** (55-69): Yellow
- **Poor** (40-54): Light Red
- **Very Poor** (25-39): Red
- **Serious** (10-24): Dark Red
- **Failed** (<10): Very Dark Red

### Pavement IRI
- **Good** (≤2): Green
- **Fair** (2-3): Yellow
- **Poor** (3-4): Light Red
- **Very Poor** (>4): Red

## 🔧 Customization Ideas

1. **Change Basemap**: Edit `mapStyle` prop to use satellite, streets, or other styles
2. **Add New Layer Types**: Just add them to your GeoJSON with a unique `layer` property
3. **Modify Colors**: Edit `getConditionColor()` function in the code
4. **Add More Properties**: Any property in your GeoJSON will show in the popup

## 🌍 Example Coordinates

### Major Saudi Cities (for testing)
- **Riyadh**: [46.6753, 24.7136]
- **Jeddah**: [39.1925, 21.4858]
- **Dammam**: [50.0991, 26.3927]
- **Mecca**: [39.8579, 21.4225]

### Major World Cities
- **New York**: [-74.0060, 40.7128]
- **London**: [-0.1276, 51.5074]
- **Tokyo**: [139.6917, 35.6895]
- **Dubai**: [55.2708, 25.2048]

## 📊 What Makes This Different from MainMap.tsx?

### MainMap.tsx (Your Real Project)
- Uses backend API with streaming (SSE)
- PostgreSQL database with PostGIS
- Location hierarchy (Admin Region → Amanah → Municipality → etc.)
- Real-time data fetching
- Survey filters
- Complex authentication

### Map Demo (This Portfolio Version)
- ✅ File-based (no database needed)
- ✅ Works offline (after initial load)
- ✅ Same visual appearance
- ✅ Same interaction patterns
- ✅ Perfect for demos/testing
- ✅ Easy for others to try with their own data

## 🎓 Learning Exercise

Try modifying the sample data to:
1. Add a road near your home (use Google Maps to get coordinates)
2. Change condition values to see different colors
3. Add 10+ features and test filter performance
4. Create a polygon area (future enhancement)

## 🐛 Troubleshooting

### Map shows but features don't appear
- Check browser console for errors
- Verify coordinates are [longitude, latitude] (not reversed!)
- Ensure `layer` property matches supported types

### File upload fails
- Validate JSON at jsonlint.com
- Check file size (keep under 5MB for smooth performance)
- Ensure it's proper GeoJSON format

### Popup doesn't show
- Click directly on a feature
- Try zooming in closer
- Check if feature is filtered out by layer/condition controls

## 🎉 Success Checklist

- [x] ✅ Sample data file created (14 features)
- [x] ✅ Map component with full UI
- [x] ✅ Upload/download functionality
- [x] ✅ Layer visibility controls
- [x] ✅ Condition filters
- [x] ✅ Interactive popups
- [x] ✅ Auto-zoom to data
- [x] ✅ Statistics display
- [x] ✅ Legend with color codes
- [x] ✅ Responsive design
- [x] ✅ No TypeScript errors

## 🚀 Next Steps

Your map demo is ready! You can now:
1. Share it with others to test
2. Add more features to the sample data
3. Create custom datasets for different scenarios
4. Use it as a template for other projects

Enjoy your interactive map demo! 🗺️✨
