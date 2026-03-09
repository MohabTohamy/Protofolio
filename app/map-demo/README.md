# Interactive Map Demo - README

## Overview
A fully functional interactive GIS map with file upload/download capabilities, designed to visualize infrastructure data without requiring a database. Users can download sample data, upload their own GeoJSON files, and interact with features on the map.

## Features

### 🗺️ Map Visualization
- **Interactive MapGL** powered by Mapbox GL
- **Pan & Zoom** controls with navigation
- **Satellite/Dark basemap** options
- **Feature clicking** with detailed popups
- **Auto-zoom** to loaded data bounds

### 📁 File Management
- **Download Sample Data**: Get a pre-configured GeoJSON file with sample infrastructure data
- **Upload Custom Data**: Load your own GeoJSON files for visualization
- **Flexible Format**: Supports both `.json` and `.geojson` files

### 🎨 Data Features
The sample data includes:
- **Pavement Layers**: PCI, IRI (road condition indices)
- **Asset Layers**: Guardrails, Curb Stones, Light Poles, Road Signs, Manholes, Catch Basins
- **Condition-based Coloring**: Automatic color coding based on values
  - Green: Good condition (≥70)
  - Yellow: Fair condition (40-70)
  - Red: Poor condition (<40)

### 🎛️ Interactive Controls
1. **Layer Visibility**
   - Toggle individual layers on/off
   - "All Layers" option for quick enable/disable
   - Dynamic layer list based on uploaded data

2. **Condition Filtering**
   - Filter features by condition (Good, Fair, Poor, etc.)
   - Visual color indicators for each condition
   - "All Conditions" for quick reset

3. **Legend**
   - Color-coded condition guide
   - Value ranges for each condition
   - Always visible when data is loaded

### 📊 Statistics Display
- **Visible Features Count**: Real-time count of filtered features
- **Active Layers**: Number of layer types in dataset
- **Condition Types**: Variety of conditions present

## How to Use

### Step 1: Access the Map
Navigate to `/map-demo` in your application.

### Step 2: Download Sample Data
1. Click the **"Download Sample Data"** button
2. Save the `sample-map-data.json` file to your computer
3. (Optional) Modify the file to test different scenarios

### Step 3: Upload Data
1. Click **"Upload Data File"** button
2. Select your GeoJSON file (`.json` or `.geojson`)
3. Map will automatically load and zoom to your data
4. Features will appear with condition-based colors

### Step 4: Interact with Features
- **Click any feature** (road, asset) to see its properties
- **View detailed information** in popup windows
- **Use layer controls** to show/hide specific data types
- **Apply filters** to focus on specific conditions

### Step 5: Filter & Analyze
- **Toggle layers** to isolate specific infrastructure types
- **Filter by condition** to focus on problem areas
- **View statistics** to understand your dataset

## Data Format

### GeoJSON Structure
```json
{
  "type": "FeatureCollection",
  "metadata": {
    "name": "Your Dataset Name",
    "description": "Description of your data"
  },
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "LineString" | "Point",
        "coordinates": [[lng, lat], ...] | [lng, lat]
      },
      "properties": {
        "code": "Unique ID",
        "name": "Feature name",
        "type": "pavement" | "asset",
        "layer": "pci" | "iri" | "guardrail" | etc.,
        "value": 85,
        "condition": "good" | "fair" | "poor",
        "...": "other custom properties"
      }
    }
  ]
}
```

### Required Properties
- `code`: Unique identifier
- `layer`: Type of data (pci, iri, guardrail, lightpoles, etc.)
- `value` or `aci`: Numeric condition value (0-100)
- `condition`: String condition (good, fair, poor, etc.) - optional, will be calculated from value

### Geometry Types Supported
- **LineString**: For roads, guardrails, curbs
- **Point**: For poles, signs, manholes, catch basins

### Coordinates
- Format: `[longitude, latitude]` (WGS84)
- Example: `[46.6753, 24.7136]` (Riyadh, Saudi Arabia)

## Customization

### Adding Your Own Data
1. Create a GeoJSON file with your coordinates
2. Add properties for each feature:
   - `layer`: Choose from existing types or create new ones
   - `value`: Condition score (0-100)
   - `condition`: Optional, will auto-calculate
3. Upload the file to see it visualized

### Modifying Sample Data
1. Download the sample data file
2. Edit in any text editor
3. Change coordinates, values, or add new features
4. Upload the modified file to test

### Example: Adding a New Road Segment
```json
{
  "type": "Feature",
  "geometry": {
    "type": "LineString",
    "coordinates": [
      [46.6850, 24.7200],
      [46.6860, 24.7210],
      [46.6870, 24.7220]
    ]
  },
  "properties": {
    "code": "MY-ROAD-001",
    "name": "My Custom Road",
    "type": "pavement",
    "layer": "pci",
    "lane": "1",
    "value": 75,
    "condition": "good",
    "surveyDate": "2026-03-08"
  }
}
```

## Technical Details

### Technologies Used
- **React Map GL**: React wrapper for Mapbox GL
- **Mapbox GL JS**: Map rendering engine
- **Next.js 14**: Application framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling

### Performance
- **Client-side rendering**: All processing happens in browser
- **No database required**: Works entirely with files
- **Efficient filtering**: Real-time layer and condition filtering
- **Responsive design**: Works on desktop and tablet

### Browser Compatibility
- Chrome/Edge (recommended)
- Firefox
- Safari
- Requires WebGL support

## Troubleshooting

### Map Not Loading
- Check browser console for errors
- Ensure you have internet connection (for basemap tiles)
- Verify Mapbox token is configured

### File Upload Fails
- Ensure file is valid JSON format
- Check that structure matches GeoJSON specification
- Verify coordinates are in [longitude, latitude] format
- File size should be reasonable (<10MB for smooth performance)

### Features Not Appearing
- Check layer visibility controls
- Verify condition filters aren't excluding features
- Ensure coordinates are within valid ranges
  - Longitude: -180 to 180
  - Latitude: -90 to 90

### Popup Not Showing
- Click directly on a feature (line or point)
- Try zooming in closer to the feature
- Close existing popup before clicking another feature

## Future Enhancements
- [ ] Export filtered data back to GeoJSON
- [ ] Multiple basemap options
- [ ] Drawing tools to create new features
- [ ] Measurement tools (distance, area)
- [ ] Print/export map views
- [ ] Advanced statistics and charts
- [ ] 3D terrain visualization

## License
This demo is part of the engineering portfolio project.

## Support
For questions or issues, please refer to the main project documentation.
