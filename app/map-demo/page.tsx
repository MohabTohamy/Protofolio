'use client';

export const dynamic = 'force-dynamic';

import { useState, useCallback, useRef } from 'react';
import Map, { Source, Layer, Popup, NavigationControl, ScaleControl, MapRef } from 'react-map-gl/maplibre';
import type { MapLayerMouseEvent } from 'react-map-gl/maplibre';
import { Section, SectionTitle, Card } from '@/components/UI';
import { Download, Upload, Layers, Filter, Info, MapPin } from 'lucide-react';
import 'maplibre-gl/dist/maplibre-gl.css';
import * as XLSX from 'xlsx';

// Types
interface MapFeature {
    type: "Feature";
    geometry: {
        type: "Point" | "LineString" | "Polygon";
        coordinates: number[] | number[][] | number[][][];
    };
    properties: {
        code?: string;
        name?: string;
        type?: string;
        layer?: string;
        value?: number;
        aci?: number;
        condition?: string;
        [key: string]: any;
    };
}

interface FeatureCollection {
    type: "FeatureCollection";
    features: MapFeature[];
    metadata?: Record<string, any>;
}

// Condition color mapping (matching MainMap.tsx)
const getConditionColor = (conditionKey: string): string => {
    const colorMap: Record<string, string> = {
        good: "#228B22",        // Dark green
        satisfactory: "#84CC16", // Lime green
        fair: "#FFEB3B",         // Yellow
        poor: "#FF6B6B",         // Light red
        very_poor: "#EF4444",    // Red
        serious: "#DC2626",      // Dark red
        failed: "#991B1B"        // Very dark red
    };
    return colorMap[conditionKey] || "#888888";
};

// Get condition from value based on layer type
const getConditionFromValue = (layerType: string, value: number): string => {
    const v = Number(value);

    // Asset layers (using ACI)
    const assetLayers = ['guardrail', 'curbstone', 'lightpoles', 'roadsigns', 'manhole', 'catchbasin', 'fence', 'bollards', 'distress'];
    if (assetLayers.includes(layerType)) {
        if (v > 70) return "good";
        if (v > 40) return "fair";
        return "poor";
    }

    // Pavement layers
    if (layerType === "iri") {
        if (v <= 2) return "good";
        if (v <= 3) return "fair";
        if (v <= 4) return "poor";
        return "very_poor";
    } else if (layerType === "pci" || layerType === "pqi") {
        if (v >= 85) return "good";
        if (v >= 70) return "satisfactory";
        if (v >= 55) return "fair";
        if (v >= 40) return "poor";
        if (v >= 25) return "very_poor";
        if (v >= 10) return "serious";
        return "failed";
    } else if (layerType === "fwd") {
        if (v <= 200) return "good";
        if (v <= 500) return "fair";
        if (v <= 700) return "poor";
        return "very_poor";
    } else if (layerType === "cft" || layerType === "gpr") {
        if (v >= 35) return "good";
        if (v >= 25) return "fair";
        if (v >= 15) return "poor";
        return "very_poor";
    }

    return "fair";
};

export default function MapDemoPage() {
    const mapRef = useRef<MapRef>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [mapData, setMapData] = useState<FeatureCollection | null>(null);
    const [selectedFeature, setSelectedFeature] = useState<{
        feature: MapFeature;
        lng: number;
        lat: number;
    } | null>(null);

    const [visibleLayers, setVisibleLayers] = useState<Set<string>>(new Set(['all']));
    const [selectedConditions, setSelectedConditions] = useState<Set<string>>(new Set(['all']));
    const [viewState, setViewState] = useState({
        longitude: 46.6753,
        latitude: 24.7136,
        zoom: 12
    });

    // Download sample data
    const handleDownloadSample = () => {
        const link = document.createElement('a');
        link.href = '/sample-map-data.json';
        link.download = 'sample-map-data.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Download real LCMS distress data (Excel)
    const handleDownloadExcel = () => {
        const link = document.createElement('a');
        link.href = '/MapTestFile.xlsx';
        link.download = 'MapTestFile.xlsx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Upload file handler (supports Excel .xlsx and JSON)
    const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const fileName = file.name.toLowerCase();
        const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                let data: FeatureCollection;

                if (isExcel) {
                    // Parse Excel file
                    const binaryStr = e.target?.result;
                    const workbook = XLSX.read(binaryStr, { type: 'binary' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

                    // Convert Excel rows to GeoJSON features
                    const features: MapFeature[] = jsonData.map((row, idx) => {
                        // Map severity to condition and value
                        const severity = String(row.severity_PCI || 'Med').trim();
                        const severityMap: Record<string, { condition: string; value: number }> = {
                            'Low': { condition: 'good', value: 75 },
                            'Med': { condition: 'fair', value: 55 },
                            'High': { condition: 'poor', value: 35 },
                            'Critical': { condition: 'very_poor', value: 15 }
                        };
                        const severityInfo = severityMap[severity] || { condition: 'fair', value: 50 };

                        return {
                            type: "Feature",
                            geometry: {
                                type: "Point",
                                coordinates: [Number(row.longitude), Number(row.latitude)]
                            },
                            properties: {
                                code: `DIST-${String(idx).padStart(5, '0')}`,
                                name: `${row.distressType_PCI || 'Distress'} - ${severity}`,
                                type: "distress",
                                layer: "distress",
                                value: severityInfo.value,
                                condition: severityInfo.condition,
                                // Include ALL Excel columns
                                ...Object.fromEntries(
                                    Object.entries(row).map(([key, value]) => [
                                        key,
                                        value === null || value === undefined ? '' : String(value)
                                    ])
                                )
                            }
                        };
                    });

                    data = {
                        type: "FeatureCollection",
                        features,
                        metadata: {
                            source: 'Excel Upload',
                            uploadedAt: new Date().toISOString(),
                            fileName: file.name
                        }
                    };

                    console.log(`Converted ${features.length} rows from Excel to GeoJSON`);
                } else {
                    // Parse JSON file
                    const content = e.target?.result as string;
                    data = JSON.parse(content) as FeatureCollection;

                    if (data.type !== 'FeatureCollection' || !Array.isArray(data.features)) {
                        alert('Invalid GeoJSON format. Please upload a valid FeatureCollection.');
                        return;
                    }
                }

                setMapData(data);

                // Auto-zoom to data bounds
                if (data.features.length > 0 && mapRef.current) {
                    const coords: [number, number][] = [];
                    data.features.forEach(f => {
                        if (f.geometry.type === 'Point') {
                            coords.push(f.geometry.coordinates as [number, number]);
                        } else if (f.geometry.type === 'LineString') {
                            (f.geometry.coordinates as number[][]).forEach(c => {
                                coords.push(c as [number, number]);
                            });
                        }
                    });

                    if (coords.length > 0) {
                        const bounds = coords.reduce((b, coord) => {
                            return [
                                [Math.min(b[0][0], coord[0]), Math.min(b[0][1], coord[1])],
                                [Math.max(b[1][0], coord[0]), Math.max(b[1][1], coord[1])]
                            ];
                        }, [[coords[0][0], coords[0][1]], [coords[0][0], coords[0][1]]]);

                        mapRef.current.fitBounds(
                            [[bounds[0][0], bounds[0][1]], [bounds[1][0], bounds[1][1]]],
                            { padding: 40, duration: 1000 }
                        );
                    }
                }

                alert(`Successfully loaded ${data.features.length} features from ${isExcel ? 'Excel' : 'JSON'} file!`);
            } catch (error) {
                console.error('Error parsing file:', error);
                alert(`Error parsing file: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        };

        // Read file based on type
        if (isExcel) {
            reader.readAsBinaryString(file);
        } else {
            reader.readAsText(file);
        }
    }, []);

    // Toggle layer visibility
    const toggleLayer = (layer: string) => {
        setVisibleLayers(prev => {
            const newSet = new Set(prev);
            if (layer === 'all') {
                return new Set(['all']);
            }
            newSet.delete('all');
            if (newSet.has(layer)) {
                newSet.delete(layer);
            } else {
                newSet.add(layer);
            }
            if (newSet.size === 0) {
                newSet.add('all');
            }
            return newSet;
        });
    };

    // Toggle condition filter
    const toggleCondition = (condition: string) => {
        setSelectedConditions(prev => {
            const newSet = new Set(prev);
            if (condition === 'all') {
                return new Set(['all']);
            }
            newSet.delete('all');
            if (newSet.has(condition)) {
                newSet.delete(condition);
            } else {
                newSet.add(condition);
            }
            if (newSet.size === 0) {
                newSet.add('all');
            }
            return newSet;
        });
    };

    // Filter features based on visibility and condition
    const filteredFeatures = mapData?.features.filter(feature => {
        const layer = feature.properties?.layer || 'unknown';
        const value = feature.properties?.value || feature.properties?.aci || 0;
        const condition = feature.properties?.condition || getConditionFromValue(layer, value);

        const layerVisible = visibleLayers.has('all') || visibleLayers.has(layer);
        const conditionVisible = selectedConditions.has('all') || selectedConditions.has(condition);

        return layerVisible && conditionVisible;
    }) || [];

    // Get unique layers from data
    const availableLayers = Array.from(new Set(mapData?.features.map(f => f.properties?.layer || 'unknown') || [])).sort();

    // Get unique conditions from data
    const availableConditions = Array.from(new Set(
        mapData?.features.map(f => {
            const layer = f.properties?.layer || 'unknown';
            const value = f.properties?.value || f.properties?.aci || 0;
            return f.properties?.condition || getConditionFromValue(layer, value);
        }) || []
    )).sort();

    // Create GeoJSON data for lines and points
    const lineFeatures = filteredFeatures.filter(f => f.geometry.type === 'LineString');
    const pointFeatures = filteredFeatures.filter(f => f.geometry.type === 'Point');

    const lineGeoJSON: FeatureCollection = {
        type: 'FeatureCollection',
        features: lineFeatures
    };

    const pointGeoJSON: FeatureCollection = {
        type: 'FeatureCollection',
        features: pointFeatures
    };

    // Map click handler
    const handleMapClick = useCallback((event: MapLayerMouseEvent) => {
        const feature = event.features?.[0];
        if (!feature) {
            setSelectedFeature(null);
            return;
        }

        setSelectedFeature({
            feature: feature as any,
            lng: event.lngLat.lng,
            lat: event.lngLat.lat
        });
    }, []);

    return (
        <div className="min-h-screen py-16">
            <Section>
                <SectionTitle subtitle="Visualize road infrastructure data from real-world LCMS surveys. Download sample data with 12,999 analyzed distress points, or upload your own Excel files with latitude/longitude coordinates.">
                    Interactive GIS Map Viewer
                </SectionTitle>

                <div className="grid lg:grid-cols-4 gap-6">
                    {/* Controls Panel */}
                    <div className="lg:col-span-1 space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
                        {/* File Controls */}
                        <Card>
                            <div className="flex items-center gap-2 mb-4">
                                <Upload className="w-5 h-5 text-primary" />
                                <h3 className="text-lg font-semibold">Get Started</h3>
                            </div>

                            <div className="space-y-3">
                                {/* Real-world data description */}
                                <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg text-sm">
                                    <p className="font-semibold text-accent mb-1">📊 Real-World LCMS Data</p>
                                    <p className="text-secondary/80 leading-relaxed">
                                        Download our sample dataset of <strong>12,999 road distress points</strong> from
                                        Aseer region, Saudi Arabia. This data has been professionally analyzed by
                                        pavement engineers using LCMS (Laser Crack Measurement System) technology.
                                    </p>
                                </div>

                                {/* Download Real Excel Data */}
                                <button
                                    onClick={handleDownloadExcel}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors font-medium"
                                >
                                    <Download className="w-4 h-4" />
                                    Download Real Data (Excel)
                                </button>

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-secondary/20"></div>
                                    </div>
                                    <div className="relative flex justify-center text-xs">
                                        <span className="px-2 bg-background text-secondary/60">or</span>
                                    </div>
                                </div>

                                {/* Download Sample JSON */}
                                <button
                                    onClick={handleDownloadSample}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-secondary/10 text-secondary border border-secondary/20 rounded-lg hover:bg-secondary/20 transition-colors"
                                >
                                    <Download className="w-4 h-4" />
                                    Download Sample (JSON)
                                </button>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".json,.geojson,.xlsx,.xls"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />

                                {/* Upload Button */}
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-black rounded-lg hover:bg-white/90 transition-colors font-medium"
                                >
                                    <Upload className="w-4 h-4" />
                                    Upload Your Data
                                </button>

                                {/* Instructions */}
                                <div className="pt-2 text-xs text-secondary/70 space-y-1">
                                    <p>✅ Supports: Excel (.xlsx, .xls) & GeoJSON</p>
                                    <p>📍 Excel must have: <code className="bg-secondary/10 px-1 rounded">latitude</code> & <code className="bg-secondary/10 px-1 rounded">longitude</code> columns</p>
                                </div>

                                {mapData && (
                                    <div className="mt-4 p-3 bg-secondary/10 rounded-lg">
                                        <p className="text-sm text-foreground/70">
                                            <strong>Loaded:</strong> {mapData.features.length} features
                                        </p>
                                        {mapData.metadata && (
                                            <p className="text-xs text-foreground/60 mt-1">
                                                {mapData.metadata.name}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Layer Control */}
                        {availableLayers.length > 0 && (
                            <Card>
                                <div className="flex items-center gap-2 mb-4">
                                    <Layers className="w-5 h-5 text-primary" />
                                    <h3 className="text-lg font-semibold">Layers</h3>
                                </div>

                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-secondary/5 rounded">
                                        <input
                                            type="checkbox"
                                            checked={visibleLayers.has('all')}
                                            onChange={() => toggleLayer('all')}
                                            className="w-4 h-4 accent-primary"
                                        />
                                        <span className="text-sm font-semibold">All Layers</span>
                                    </label>

                                    {availableLayers.map((layer) => {
                                        const isChecked = visibleLayers.has('all') || visibleLayers.has(layer);
                                        return (
                                            <label
                                                key={layer}
                                                className="flex items-center gap-2 cursor-pointer p-2 hover:bg-secondary/5 rounded"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => toggleLayer(layer)}
                                                    className="w-4 h-4 accent-primary"
                                                />
                                                <span className="text-sm capitalize">
                                                    {layer.replace(/([A-Z])/g, ' $1').trim()}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </Card>
                        )}

                        {/* Condition Filter */}
                        {availableConditions.length > 0 && (
                            <Card>
                                <div className="flex items-center gap-2 mb-4">
                                    <Filter className="w-5 h-5 text-accent" />
                                    <h3 className="text-lg font-semibold">Conditions</h3>
                                </div>

                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-secondary/5 rounded">
                                        <input
                                            type="checkbox"
                                            checked={selectedConditions.has('all')}
                                            onChange={() => toggleCondition('all')}
                                            className="w-4 h-4 accent-primary"
                                        />
                                        <span className="text-sm font-semibold">All Conditions</span>
                                    </label>

                                    {availableConditions.map((condition) => {
                                        const color = getConditionColor(condition);
                                        const isChecked = selectedConditions.has('all') || selectedConditions.has(condition);
                                        return (
                                            <label
                                                key={condition}
                                                className="flex items-center gap-2 cursor-pointer p-2 hover:bg-secondary/5 rounded"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => toggleCondition(condition)}
                                                    className="w-4 h-4 accent-primary"
                                                />
                                                <div
                                                    className="w-4 h-4 rounded"
                                                    style={{ backgroundColor: color }}
                                                />
                                                <span className="text-sm capitalize">
                                                    {condition.replace(/_/g, ' ')}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </Card>
                        )}

                        {/* Legend */}
                        {mapData && (
                            <Card>
                                <div className="flex items-center gap-2 mb-4">
                                    <Info className="w-5 h-5 text-primary" />
                                    <h3 className="text-lg font-semibold">Legend</h3>
                                </div>

                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded" style={{ backgroundColor: getConditionColor('good') }} />
                                        <span>Good (≥70)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded" style={{ backgroundColor: getConditionColor('satisfactory') }} />
                                        <span>Satisfactory (70-55)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded" style={{ backgroundColor: getConditionColor('fair') }} />
                                        <span>Fair (55-40)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded" style={{ backgroundColor: getConditionColor('poor') }} />
                                        <span>Poor (&lt;40)</span>
                                    </div>
                                </div>
                            </Card>
                        )}
                    </div>

                    {/* Map */}
                    <div className="lg:col-span-3">
                        <Card className="p-0 overflow-hidden">
                            <div className="h-[700px] relative">
                                <Map
                                    ref={mapRef}
                                    {...viewState}
                                    onMove={evt => setViewState(evt.viewState)}
                                    mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
                                    onClick={handleMapClick}
                                    interactiveLayerIds={['lines-layer', 'points-layer']}
                                    style={{ width: '100%', height: '100%' }}
                                >
                                    <NavigationControl position="top-right" />
                                    <ScaleControl position="bottom-right" />

                                    {/* Line Features */}
                                    {lineFeatures.length > 0 && (
                                        <Source id="lines-source" type="geojson" data={lineGeoJSON}>
                                            <Layer
                                                id="lines-layer"
                                                type="line"
                                                paint={{
                                                    'line-color': [
                                                        'match',
                                                        ['get', 'condition'],
                                                        'good', getConditionColor('good'),
                                                        'satisfactory', getConditionColor('satisfactory'),
                                                        'fair', getConditionColor('fair'),
                                                        'poor', getConditionColor('poor'),
                                                        'very_poor', getConditionColor('very_poor'),
                                                        'serious', getConditionColor('serious'),
                                                        'failed', getConditionColor('failed'),
                                                        '#888888'
                                                    ],
                                                    'line-width': 5,
                                                    'line-opacity': 0.8
                                                }}
                                            />
                                        </Source>
                                    )}

                                    {/* Point Features */}
                                    {pointFeatures.length > 0 && (
                                        <Source id="points-source" type="geojson" data={pointGeoJSON}>
                                            <Layer
                                                id="points-layer"
                                                type="circle"
                                                paint={{
                                                    'circle-color': [
                                                        'match',
                                                        ['get', 'condition'],
                                                        'good', getConditionColor('good'),
                                                        'satisfactory', getConditionColor('satisfactory'),
                                                        'fair', getConditionColor('fair'),
                                                        'poor', getConditionColor('poor'),
                                                        'very_poor', getConditionColor('very_poor'),
                                                        'serious', getConditionColor('serious'),
                                                        'failed', getConditionColor('failed'),
                                                        '#888888'
                                                    ],
                                                    'circle-radius': 8,
                                                    'circle-stroke-width': 2,
                                                    'circle-stroke-color': '#fff'
                                                }}
                                            />
                                        </Source>
                                    )}

                                    {/* Popup */}
                                    {selectedFeature && (
                                        <Popup
                                            longitude={selectedFeature.lng}
                                            latitude={selectedFeature.lat}
                                            onClose={() => setSelectedFeature(null)}
                                            closeOnClick={false}
                                            maxWidth="400px"
                                            className="custom-popup"
                                        >
                                            <div className="p-3 min-w-[250px] bg-black/95 text-white rounded-lg">
                                                <h3 className="font-bold text-lg mb-2 text-white">
                                                    {selectedFeature.feature.properties?.name || selectedFeature.feature.properties?.code || 'Feature'}
                                                </h3>
                                                <div className="space-y-1 text-sm">
                                                    {Object.entries(selectedFeature.feature.properties || {}).map(([key, value]) => (
                                                        key !== 'name' && (
                                                            <div key={key} className="flex justify-between gap-4">
                                                                <span className="font-medium capitalize text-gray-300">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                                                                <span className="text-gray-400">{String(value)}</span>
                                                            </div>
                                                        )
                                                    ))}
                                                </div>
                                            </div>
                                        </Popup>
                                    )}
                                </Map>

                                {/* Empty State */}
                                {!mapData && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/5 backdrop-blur-sm">
                                        <div className="text-center p-8 bg-background/90 rounded-lg border-2 border-dashed border-primary/20">
                                            <MapPin className="w-16 h-16 text-primary mx-auto mb-4" />
                                            <h3 className="text-xl font-bold mb-2">No Data Loaded</h3>
                                            <p className="text-foreground/70 mb-4">
                                                Download the sample data or upload your own GeoJSON file
                                            </p>
                                            <button
                                                onClick={handleDownloadSample}
                                                className="px-6 py-2.5 bg-white text-black rounded-lg hover:bg-white/90 transition-colors inline-flex items-center gap-2"
                                            >
                                                <Download className="w-4 h-4" />
                                                Get Sample Data
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Stats */}
                        {mapData && (
                            <div className="grid grid-cols-3 gap-4 mt-4">
                                <Card className="text-center">
                                    <p className="text-2xl font-bold text-primary">{filteredFeatures.length}</p>
                                    <p className="text-sm text-foreground/70">Visible Features</p>
                                </Card>
                                <Card className="text-center">
                                    <p className="text-2xl font-bold text-accent">{availableLayers.length}</p>
                                    <p className="text-sm text-foreground/70">Layers</p>
                                </Card>
                                <Card className="text-center">
                                    <p className="text-2xl font-bold text-secondary">{availableConditions.length}</p>
                                    <p className="text-sm text-foreground/70">Conditions</p>
                                </Card>
                            </div>
                        )}
                    </div>
                </div>
            </Section>
        </div>
    );
}
