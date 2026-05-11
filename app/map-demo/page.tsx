'use client';

export const dynamic = 'force-dynamic';

import { useState, useCallback, useRef } from 'react';
import Map, { Source, Layer, Popup, NavigationControl, ScaleControl, MapRef } from 'react-map-gl/maplibre';
import type { MapLayerMouseEvent } from 'react-map-gl/maplibre';
import { Download, Upload, Layers, Filter, Info, MapPin, CheckCircle } from 'lucide-react';
import 'maplibre-gl/dist/maplibre-gl.css';
import * as XLSX from 'xlsx';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MapFeature {
    type: 'Feature';
    geometry: {
        type: 'Point' | 'LineString' | 'Polygon';
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
    type: 'FeatureCollection';
    features: MapFeature[];
    metadata?: Record<string, any>;
}

// ─── Condition helpers ────────────────────────────────────────────────────────

const CONDITION_COLORS: Record<string, string> = {
    good:         '#228B22',
    satisfactory: '#84CC16',
    fair:         '#FFEB3B',
    poor:         '#FF6B6B',
    very_poor:    '#EF4444',
    serious:      '#DC2626',
    failed:       '#991B1B',
};

const getConditionColor = (k: string) => CONDITION_COLORS[k] ?? '#888888';

const getConditionFromValue = (layerType: string, value: number): string => {
    const v = Number(value);
    const assetLayers = ['guardrail', 'curbstone', 'lightpoles', 'roadsigns', 'manhole', 'catchbasin', 'fence', 'bollards', 'distress'];
    if (assetLayers.includes(layerType)) {
        if (v > 70) return 'good';
        if (v > 40) return 'fair';
        return 'poor';
    }
    if (layerType === 'iri') {
        if (v <= 2) return 'good';
        if (v <= 3) return 'fair';
        if (v <= 4) return 'poor';
        return 'very_poor';
    }
    if (layerType === 'pci' || layerType === 'pqi') {
        if (v >= 85) return 'good';
        if (v >= 70) return 'satisfactory';
        if (v >= 55) return 'fair';
        if (v >= 40) return 'poor';
        if (v >= 25) return 'very_poor';
        if (v >= 10) return 'serious';
        return 'failed';
    }
    if (layerType === 'fwd') {
        if (v <= 200) return 'good';
        if (v <= 500) return 'fair';
        if (v <= 700) return 'poor';
        return 'very_poor';
    }
    if (layerType === 'cft' || layerType === 'gpr') {
        if (v >= 35) return 'good';
        if (v >= 25) return 'fair';
        if (v >= 15) return 'poor';
        return 'very_poor';
    }
    return 'fair';
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MapDemoPage() {
    const mapRef = useRef<MapRef>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [mapData, setMapData] = useState<FeatureCollection | null>(null);
    const [toast, setToast] = useState<string | null>(null);
    const [selectedFeature, setSelectedFeature] = useState<{
        feature: MapFeature;
        lng: number;
        lat: number;
    } | null>(null);

    const [visibleLayers, setVisibleLayers] = useState<Set<string>>(new Set(['all']));
    const [selectedConditions, setSelectedConditions] = useState<Set<string>>(new Set(['all']));
    const [viewState, setViewState] = useState({
        longitude: 46.6753,
        latitude:  24.7136,
        zoom:      12,
    });

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3500);
    };

    const handleDownloadExcel = () => {
        const link = document.createElement('a');
        link.href = '/MapTestFile.xlsx';
        link.download = 'MapTestFile.xlsx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDownloadSample = () => {
        const link = document.createElement('a');
        link.href = '/sample-map-data.json';
        link.download = 'sample-map-data.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const isExcel = /\.(xlsx|xls)$/i.test(file.name);
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                let data: FeatureCollection;

                if (isExcel) {
                    const workbook = XLSX.read(e.target?.result, { type: 'binary' });
                    const ws = workbook.Sheets[workbook.SheetNames[0]];
                    const rows = XLSX.utils.sheet_to_json(ws) as any[];

                    const severityMap: Record<string, { condition: string; value: number }> = {
                        Low:      { condition: 'good',      value: 75 },
                        Med:      { condition: 'fair',      value: 55 },
                        High:     { condition: 'poor',      value: 35 },
                        Critical: { condition: 'very_poor', value: 15 },
                    };

                    data = {
                        type: 'FeatureCollection',
                        features: rows.map((row, idx) => {
                            const sev = String(row.severity_PCI || 'Med').trim();
                            const info = severityMap[sev] ?? { condition: 'fair', value: 50 };
                            return {
                                type: 'Feature',
                                geometry: {
                                    type: 'Point',
                                    coordinates: [Number(row.longitude), Number(row.latitude)],
                                },
                                properties: {
                                    code: `DIST-${String(idx).padStart(5, '0')}`,
                                    name: `${row.distressType_PCI || 'Distress'} — ${sev}`,
                                    type: 'distress',
                                    layer: 'distress',
                                    value: info.value,
                                    condition: info.condition,
                                    ...Object.fromEntries(
                                        Object.entries(row).map(([k, v]) => [k, v == null ? '' : String(v)])
                                    ),
                                },
                            };
                        }),
                        metadata: { source: 'Excel', fileName: file.name, uploadedAt: new Date().toISOString() },
                    };
                } else {
                    data = JSON.parse(e.target?.result as string) as FeatureCollection;
                    if (data.type !== 'FeatureCollection' || !Array.isArray(data.features)) {
                        showToast('Invalid GeoJSON — upload a valid FeatureCollection.');
                        return;
                    }
                }

                setMapData(data);

                // Auto-fit bounds
                if (data.features.length > 0 && mapRef.current) {
                    const coords: [number, number][] = [];
                    data.features.forEach((f) => {
                        if (f.geometry.type === 'Point') {
                            coords.push(f.geometry.coordinates as [number, number]);
                        } else if (f.geometry.type === 'LineString') {
                            (f.geometry.coordinates as number[][]).forEach((c) =>
                                coords.push(c as [number, number])
                            );
                        }
                    });
                    if (coords.length > 0) {
                        const bounds = coords.reduce(
                            (b, [lng, lat]) => [
                                [Math.min(b[0][0], lng), Math.min(b[0][1], lat)],
                                [Math.max(b[1][0], lng), Math.max(b[1][1], lat)],
                            ],
                            [[coords[0][0], coords[0][1]], [coords[0][0], coords[0][1]]]
                        );
                        mapRef.current.fitBounds(
                            [[bounds[0][0], bounds[0][1]], [bounds[1][0], bounds[1][1]]],
                            { padding: 40, duration: 1000 }
                        );
                    }
                }

                showToast(`${data.features.length} features loaded from ${isExcel ? 'Excel' : 'JSON'}.`);
            } catch (err) {
                showToast(`Parse error: ${err instanceof Error ? err.message : 'unknown'}`);
            }
        };

        isExcel ? reader.readAsBinaryString(file) : reader.readAsText(file);
    }, []);

    const toggleLayer = (layer: string) => {
        setVisibleLayers((prev) => {
            const next = new Set(prev);
            if (layer === 'all') return new Set(['all']);
            next.delete('all');
            next.has(layer) ? next.delete(layer) : next.add(layer);
            return next.size === 0 ? new Set(['all']) : next;
        });
    };

    const toggleCondition = (condition: string) => {
        setSelectedConditions((prev) => {
            const next = new Set(prev);
            if (condition === 'all') return new Set(['all']);
            next.delete('all');
            next.has(condition) ? next.delete(condition) : next.add(condition);
            return next.size === 0 ? new Set(['all']) : next;
        });
    };

    const filteredFeatures = mapData?.features.filter((f) => {
        const layer = f.properties?.layer || 'unknown';
        const value = f.properties?.value || f.properties?.aci || 0;
        const cond  = f.properties?.condition || getConditionFromValue(layer, value);
        return (
            (visibleLayers.has('all') || visibleLayers.has(layer)) &&
            (selectedConditions.has('all') || selectedConditions.has(cond))
        );
    }) ?? [];

    const availableLayers = Array.from(
        new Set(mapData?.features.map((f) => f.properties?.layer || 'unknown') ?? [])
    ).sort();

    const availableConditions = Array.from(
        new Set(
            mapData?.features.map((f) => {
                const layer = f.properties?.layer || 'unknown';
                const value = f.properties?.value || f.properties?.aci || 0;
                return f.properties?.condition || getConditionFromValue(layer, value);
            }) ?? []
        )
    ).sort();

    const lineFeatures  = filteredFeatures.filter((f) => f.geometry.type === 'LineString');
    const pointFeatures = filteredFeatures.filter((f) => f.geometry.type === 'Point');

    const lineGeoJSON:  FeatureCollection = { type: 'FeatureCollection', features: lineFeatures };
    const pointGeoJSON: FeatureCollection = { type: 'FeatureCollection', features: pointFeatures };

    const handleMapClick = useCallback((event: MapLayerMouseEvent) => {
        const feature = event.features?.[0];
        if (!feature) { setSelectedFeature(null); return; }
        setSelectedFeature({ feature: feature as any, lng: event.lngLat.lng, lat: event.lngLat.lat });
    }, []);

    const paintMatch = (prop: string) => [
        'match', ['get', prop],
        'good',         getConditionColor('good'),
        'satisfactory', getConditionColor('satisfactory'),
        'fair',         getConditionColor('fair'),
        'poor',         getConditionColor('poor'),
        'very_poor',    getConditionColor('very_poor'),
        'serious',      getConditionColor('serious'),
        'failed',       getConditionColor('failed'),
        '#888888',
    ];

    return (
        <div className="min-h-screen pt-16 bg-[var(--bg)] text-[var(--fg)]">
            {/* Toast */}
            {toast && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2 px-4 py-2.5 bg-[var(--bg-elevated)] border border-[var(--hairline-strong)] rounded-md text-sm text-[var(--fg)] shadow-xl">
                    <CheckCircle className="w-4 h-4 text-[var(--accent)] shrink-0" />
                    {toast}
                </div>
            )}

            <div className="max-w-[90rem] mx-auto px-6 py-12">
                {/* Header */}
                <div className="mb-10">
                    <p className="eyebrow mb-3">GIS · pavement data · MapLibre GL</p>
                    <h1 className="font-display text-4xl md:text-5xl text-[var(--fg)] leading-[0.98] mb-4">
                        Interactive GIS Map Viewer
                    </h1>
                    <p className="text-[var(--fg-muted)] max-w-2xl leading-relaxed">
                        Visualize road infrastructure data from real-world LCMS surveys. Download
                        12,999 analyzed distress points from Aseer region, or upload your own
                        Excel / GeoJSON file.
                    </p>
                </div>

                <div className="grid lg:grid-cols-4 gap-6">
                    {/* ── Controls sidebar ── */}
                    <div className="lg:col-span-1 space-y-px max-h-[calc(100vh-220px)] overflow-y-auto">
                        {/* Upload / download */}
                        <div className="card-editorial p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <Upload className="w-4 h-4 text-[var(--accent)]" />
                                <p className="text-xs uppercase tracking-[0.16em] text-[var(--fg-muted)]">Data</p>
                            </div>

                            <p className="text-sm text-[var(--fg-muted)] leading-relaxed mb-4">
                                <strong className="text-[var(--fg)]">12,999 distress points</strong> from
                                Aseer region, professionally analyzed with LCMS technology.
                            </p>

                            <div className="space-y-2">
                                <button
                                    onClick={handleDownloadExcel}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--accent)] text-[var(--bg)] rounded text-xs uppercase tracking-[0.14em] hover:bg-[var(--accent)]/90 transition-colors font-medium"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    Download sample — Excel
                                </button>

                                <button
                                    onClick={handleDownloadSample}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-[var(--hairline-strong)] text-[var(--fg-muted)] rounded text-xs uppercase tracking-[0.14em] hover:border-[var(--fg)]/30 hover:text-[var(--fg)] transition-colors"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    Download sample — JSON
                                </button>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".json,.geojson,.xlsx,.xls"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />

                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-[var(--hairline-strong)] text-[var(--fg)] rounded text-xs uppercase tracking-[0.14em] hover:border-[var(--fg)]/50 transition-colors"
                                >
                                    <Upload className="w-3.5 h-3.5" />
                                    Upload your data
                                </button>
                            </div>

                            <p className="mt-4 text-[10px] font-mono text-[var(--fg-dim)] leading-relaxed">
                                Accepts: .xlsx, .xls, .json, .geojson
                                <br />
                                Excel requires <span className="text-[var(--fg)]/50">latitude</span> &amp;{' '}
                                <span className="text-[var(--fg)]/50">longitude</span> columns.
                            </p>

                            {mapData && (
                                <div className="mt-4 pt-4 border-t border-[var(--hairline)]">
                                    <p className="font-mono text-xs text-[var(--fg-dim)]">
                                        {mapData.features.length.toLocaleString()} features loaded
                                    </p>
                                    {mapData.metadata?.fileName && (
                                        <p className="font-mono text-[10px] text-[var(--fg-dim)]/60 mt-0.5">
                                            {mapData.metadata.fileName}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Layers */}
                        {availableLayers.length > 0 && (
                            <div className="card-editorial p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <Layers className="w-4 h-4 text-[var(--accent)]" />
                                    <p className="text-xs uppercase tracking-[0.16em] text-[var(--fg-muted)]">Layers</p>
                                </div>
                                <div className="space-y-1 max-h-48 overflow-y-auto">
                                    {[{ value: 'all', label: 'All layers' }, ...availableLayers.map((l) => ({ value: l, label: l.replace(/([A-Z])/g, ' $1').trim() }))].map(({ value, label }) => (
                                        <label key={value} className="flex items-center gap-2.5 cursor-pointer py-1.5 hover:text-[var(--fg)] transition-colors group">
                                            <div
                                                className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center transition-colors ${
                                                    visibleLayers.has('all') && value === 'all'
                                                        ? 'bg-[var(--accent)] border-[var(--accent)]'
                                                        : visibleLayers.has(value) && value !== 'all'
                                                        ? 'bg-[var(--accent)] border-[var(--accent)]'
                                                        : 'border-[var(--hairline-strong)] group-hover:border-[var(--fg)]/30'
                                                }`}
                                                onClick={() => toggleLayer(value)}
                                            >
                                                {(visibleLayers.has('all') || visibleLayers.has(value)) && (
                                                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                                                        <path d="M1 4l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                )}
                                            </div>
                                            <span className="text-xs text-[var(--fg-muted)] capitalize group-hover:text-[var(--fg)] transition-colors">{label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Conditions */}
                        {availableConditions.length > 0 && (
                            <div className="card-editorial p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <Filter className="w-4 h-4 text-[var(--accent)]" />
                                    <p className="text-xs uppercase tracking-[0.16em] text-[var(--fg-muted)]">Conditions</p>
                                </div>
                                <div className="space-y-1">
                                    {[{ value: 'all', label: 'All conditions', color: '' }, ...availableConditions.map((c) => ({ value: c, label: c.replace(/_/g, ' '), color: getConditionColor(c) }))].map(({ value, label, color }) => (
                                        <label key={value} className="flex items-center gap-2.5 cursor-pointer py-1.5 group" onClick={() => toggleCondition(value)}>
                                            <div
                                                className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center transition-colors ${
                                                    selectedConditions.has('all') && value === 'all'
                                                        ? 'bg-[var(--accent)] border-[var(--accent)]'
                                                        : selectedConditions.has(value) && value !== 'all'
                                                        ? 'bg-[var(--accent)] border-[var(--accent)]'
                                                        : 'border-[var(--hairline-strong)] group-hover:border-[var(--fg)]/30'
                                                }`}
                                            >
                                                {(selectedConditions.has('all') || selectedConditions.has(value)) && (
                                                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                                                        <path d="M1 4l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                )}
                                            </div>
                                            {color && <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />}
                                            <span className="text-xs text-[var(--fg-muted)] capitalize group-hover:text-[var(--fg)] transition-colors">{label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Legend */}
                        {mapData && (
                            <div className="card-editorial p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <Info className="w-4 h-4 text-[var(--accent)]" />
                                    <p className="text-xs uppercase tracking-[0.16em] text-[var(--fg-muted)]">Legend</p>
                                </div>
                                <div className="space-y-2">
                                    {[
                                        { key: 'good',         label: 'Good',         range: '≥ 70' },
                                        { key: 'satisfactory', label: 'Satisfactory', range: '70 – 55' },
                                        { key: 'fair',         label: 'Fair',         range: '55 – 40' },
                                        { key: 'poor',         label: 'Poor',         range: '< 40' },
                                    ].map(({ key, label, range }) => (
                                        <div key={key} className="flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: getConditionColor(key) }} />
                                                <span className="text-[var(--fg-muted)]">{label}</span>
                                            </div>
                                            <span className="font-mono text-[var(--fg-dim)]">{range}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Map ── */}
                    <div className="lg:col-span-3">
                        <div className="card-editorial overflow-hidden" style={{ padding: 0 }}>
                            <div className="h-[700px] relative">
                                <Map
                                    ref={mapRef}
                                    {...viewState}
                                    onMove={(evt) => setViewState(evt.viewState)}
                                    mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
                                    onClick={handleMapClick}
                                    interactiveLayerIds={['lines-layer', 'points-layer']}
                                    style={{ width: '100%', height: '100%' }}
                                >
                                    <NavigationControl position="top-right" />
                                    <ScaleControl position="bottom-right" />

                                    {lineFeatures.length > 0 && (
                                        <Source id="lines-source" type="geojson" data={lineGeoJSON as unknown as GeoJSON.FeatureCollection}>
                                            <Layer
                                                id="lines-layer"
                                                type="line"
                                                paint={{
                                                    'line-color': paintMatch('condition') as any,
                                                    'line-width': 5,
                                                    'line-opacity': 0.8,
                                                }}
                                            />
                                        </Source>
                                    )}

                                    {pointFeatures.length > 0 && (
                                        <Source id="points-source" type="geojson" data={pointGeoJSON as unknown as GeoJSON.FeatureCollection}>
                                            <Layer
                                                id="points-layer"
                                                type="circle"
                                                paint={{
                                                    'circle-color': paintMatch('condition') as any,
                                                    'circle-radius': 7,
                                                    'circle-stroke-width': 1.5,
                                                    'circle-stroke-color': 'rgba(245,241,234,0.25)',
                                                }}
                                            />
                                        </Source>
                                    )}

                                    {selectedFeature && (
                                        <Popup
                                            longitude={selectedFeature.lng}
                                            latitude={selectedFeature.lat}
                                            onClose={() => setSelectedFeature(null)}
                                            closeOnClick={false}
                                            maxWidth="380px"
                                        >
                                            <div className="p-3 min-w-[240px] bg-[#0E0D0B] border border-[rgba(245,241,234,0.12)] rounded text-[var(--fg)]">
                                                <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--fg-dim)] mb-1">
                                                    Feature detail
                                                </p>
                                                <h3 className="font-display text-lg text-[var(--fg)] mb-3 leading-tight">
                                                    {selectedFeature.feature.properties?.name ||
                                                        selectedFeature.feature.properties?.code ||
                                                        'Feature'}
                                                </h3>
                                                <div className="space-y-1.5 text-xs">
                                                    {Object.entries(selectedFeature.feature.properties || {})
                                                        .filter(([k]) => k !== 'name')
                                                        .slice(0, 12)
                                                        .map(([k, v]) => (
                                                            <div key={k} className="flex justify-between gap-4">
                                                                <span className="text-[var(--fg-dim)] capitalize">{k.replace(/([A-Z])/g, ' $1').trim()}</span>
                                                                <span className="text-[var(--fg-muted)] text-right truncate max-w-[120px]">{String(v)}</span>
                                                            </div>
                                                        ))}
                                                </div>
                                            </div>
                                        </Popup>
                                    )}
                                </Map>

                                {/* Empty state */}
                                {!mapData && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 pointer-events-none">
                                        <MapPin className="w-10 h-10 text-[var(--fg)]/20" />
                                        <div className="text-center">
                                            <p className="text-xs uppercase tracking-[0.18em] text-[var(--fg-dim)] mb-2">No data loaded</p>
                                            <p className="text-sm text-[var(--fg-muted)]">Download a sample or upload your own file.</p>
                                        </div>
                                        <button
                                            className="pointer-events-auto flex items-center gap-2 px-4 py-2.5 border border-[var(--hairline-strong)] text-xs uppercase tracking-[0.14em] text-[var(--fg-muted)] hover:text-[var(--fg)] hover:border-[var(--fg)]/30 transition-colors rounded"
                                            onClick={handleDownloadSample}
                                        >
                                            <Download className="w-3.5 h-3.5" />
                                            Get sample JSON
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Stats row */}
                        {mapData && (
                            <div className="grid grid-cols-3 gap-px mt-px">
                                {[
                                    { label: 'visible', value: filteredFeatures.length.toLocaleString() },
                                    { label: 'layers',  value: availableLayers.length },
                                    { label: 'conditions', value: availableConditions.length },
                                ].map(({ label, value }) => (
                                    <div key={label} className="card-editorial p-4 text-center">
                                        <p className="font-mono text-2xl text-[var(--accent)] tabular-nums">{value}</p>
                                        <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--fg-dim)] mt-1">{label}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
