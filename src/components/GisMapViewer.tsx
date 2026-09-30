import React, { useState } from 'react';
import { Parcel } from '../types/property';
import {
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize,
  Compass,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Clock,
  MapPin,
  Building as BuildingIcon,
  ChevronRight,
  Info
} from 'lucide-react';

interface GisMapViewerProps {
  parcels: Parcel[];
  selectedParcelId: string;
  onSelectParcel: (parcelId: string) => void;
  onOpen3DProperty: (parcelId: string) => void;
}

export const GisMapViewer: React.FC<GisMapViewerProps> = ({
  parcels,
  selectedParcelId,
  onSelectParcel,
  onOpen3DProperty,
}) => {
  const [zoomLevel, setZoomLevel] = useState(16);
  const [layers, setLayers] = useState({
    parcels: true,
    buildings: true,
    boundaries: true,
    roads: true,
    satellite: false,
    grid: true,
  });

  const selectedParcel = parcels.find((p) => p.id === selectedParcelId) || parcels[0];

  const toggleLayer = (layerKey: keyof typeof layers) => {
    setLayers((prev) => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Verified':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified
          </span>
        );
      case 'Conflict':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <AlertTriangle className="w-3.5 h-3.5" />
            Conflict
          </span>
        );
      case 'Under Review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3.5 h-3.5" />
            Under Review
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            Pending
          </span>
        );
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col lg:flex-row gap-4 overflow-hidden">
      {/* Main Vector GIS Map Area */}
      <div className="relative flex-1 bg-slate-100 rounded-xl border border-slate-200 overflow-hidden min-h-[500px]">
        {/* Map Background Canvas/SVG */}
        <div
          className={`w-full h-full transition-colors duration-500 ${
            layers.satellite
              ? 'bg-[#1e293b]'
              : 'bg-[#f1f5f9]'
          } relative overflow-hidden`}
        >
          {/* Cadastral Grid Layer */}
          {layers.grid && (
            <div
              className="absolute inset-0 opacity-40 pointer-events-none"
              style={{
                backgroundImage: layers.satellite
                  ? 'radial-gradient(circle, #38bdf8 1px, transparent 1px)'
                  : 'radial-gradient(circle, #94a3b8 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />
          )}

          {/* Interactive GIS Vector Map SVG */}
          <svg
            className="w-full h-full cursor-grab active:cursor-grabbing"
            viewBox="0 0 1000 650"
            preserveAspectRatio="xMidYMid slice"
          >
            {/* Roads Layer */}
            {layers.roads && (
              <g className="roads" opacity={layers.satellite ? 0.4 : 0.85}>
                {/* Major Arterial Road */}
                <path
                  d="M -50 480 Q 300 450 600 480 T 1100 500"
                  stroke={layers.satellite ? '#64748b' : '#cbd5e1'}
                  strokeWidth="36"
                  fill="none"
                />
                <path
                  d="M -50 480 Q 300 450 600 480 T 1100 500"
                  stroke="#ffffff"
                  strokeWidth="2"
                  strokeDasharray="12 8"
                  fill="none"
                />

                {/* Secondary Access Avenue */}
                <path
                  d="M 460 -20 L 480 700"
                  stroke={layers.satellite ? '#64748b' : '#e2e8f0'}
                  strokeWidth="24"
                  fill="none"
                />
                <path
                  d="M 480 700 L 460 -20"
                  stroke="#94a3b8"
                  strokeWidth="1"
                  strokeDasharray="8 6"
                  fill="none"
                />

                {/* Cross Sector Lane */}
                <path
                  d="M 100 220 L 950 210"
                  stroke={layers.satellite ? '#475569' : '#e2e8f0'}
                  strokeWidth="18"
                  fill="none"
                />
              </g>
            )}

            {/* Parcels Polygons */}
            {layers.parcels && (
              <g className="parcels">
                {/* Primary Showcase Parcel: PAR-TN-123456 */}
                <g
                  onClick={() => onSelectParcel('PAR-TN-123456')}
                  className="cursor-pointer group transition-transform"
                >
                  <polygon
                    points="240,260 430,250 420,430 230,420"
                    fill={selectedParcelId === 'PAR-TN-123456' ? '#e0e7ff' : '#f8fafc'}
                    stroke={selectedParcelId === 'PAR-TN-123456' ? '#4f46e5' : '#ef4444'}
                    strokeWidth={selectedParcelId === 'PAR-TN-123456' ? '3' : '2'}
                    strokeDasharray={selectedParcelId === 'PAR-TN-123456' ? 'none' : '4 2'}
                    className="transition-colors group-hover:fill-indigo-50"
                  />
                  {layers.buildings && (
                    <rect
                      x="280"
                      y="290"
                      width="100"
                      height="90"
                      rx="4"
                      fill={selectedParcelId === 'PAR-TN-123456' ? '#4f46e5' : '#334155'}
                      opacity="0.85"
                    />
                  )}
                  <text
                    x="330"
                    y="342"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="11"
                    fontWeight="600"
                  >
                    BLD-123456
                  </text>
                  <text
                    x="330"
                    y="410"
                    textAnchor="middle"
                    fill="#4338ca"
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    PAR-TN-123456 (G+4)
                  </text>
                </g>

                {/* Surrounding Parcels */}
                {/* Parcel 2: Kaveri Riverfront */}
                <g
                  onClick={() => onSelectParcel('PAR-TN-992384')}
                  className="cursor-pointer group"
                >
                  <polygon
                    points="520,240 700,230 690,410 510,420"
                    fill={selectedParcelId === 'PAR-TN-992384' ? '#e0e7ff' : '#f8fafc'}
                    stroke={selectedParcelId === 'PAR-TN-992384' ? '#4f46e5' : '#f59e0b'}
                    strokeWidth="2"
                    className="group-hover:fill-slate-200 transition-colors"
                  />
                  {layers.buildings && (
                    <rect x="560" y="280" width="80" height="90" rx="3" fill="#64748b" opacity="0.6" />
                  )}
                  <text x="600" y="330" textAnchor="middle" fill="#ffffff" fontSize="10">
                    PAR-TN-992384
                  </text>
                </g>

                {/* Parcel 3: Commercial Plot */}
                <g
                  onClick={() => onSelectParcel('PAR-KA-883192')}
                  className="cursor-pointer group"
                >
                  <polygon
                    points="520,70 720,60 710,190 510,200"
                    fill={selectedParcelId === 'PAR-KA-883192' ? '#e0e7ff' : '#f0fdf4'}
                    stroke={selectedParcelId === 'PAR-KA-883192' ? '#4f46e5' : '#16a34a'}
                    strokeWidth="2"
                    className="group-hover:fill-emerald-100 transition-colors"
                  />
                  {layers.buildings && (
                    <rect x="560" y="90" width="110" height="70" rx="4" fill="#059669" opacity="0.75" />
                  )}
                  <text x="615" y="130" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="600">
                    PAR-KA-883192 (G+8)
                  </text>
                </g>

                {/* Parcel 4: Sri Meenakshi */}
                <g
                  onClick={() => onSelectParcel('PAR-TN-771920')}
                  className="cursor-pointer group"
                >
                  <polygon
                    points="220,70 410,65 415,200 225,205"
                    fill={selectedParcelId === 'PAR-TN-771920' ? '#e0e7ff' : '#fef2f2'}
                    stroke={selectedParcelId === 'PAR-TN-771920' ? '#4f46e5' : '#dc2626'}
                    strokeWidth="2"
                    className="group-hover:fill-red-100 transition-colors"
                  />
                  <text x="315" y="140" textAnchor="middle" fill="#991b1b" fontSize="10" fontWeight="600">
                    PAR-TN-771920
                  </text>
                </g>

                {/* Parcel 5: South Sector */}
                <polygon
                  points="760,250 940,240 930,420 750,430"
                  fill="#ffffff"
                  stroke="#94a3b8"
                  strokeWidth="1.5"
                  opacity="0.7"
                />
                <text x="840" y="340" textAnchor="middle" fill="#64748b" fontSize="10">
                  SURVEY-44/2
                </text>
              </g>
            )}

            {/* Selected Parcel Marker Pin */}
            {selectedParcel && (
              <g transform="translate(330, 275)">
                <circle cx="0" cy="0" r="14" fill="#4f46e5" opacity="0.2" className="animate-ping" />
                <circle cx="0" cy="0" r="7" fill="#4f46e5" />
                <circle cx="0" cy="0" r="3" fill="#ffffff" />
              </g>
            )}
          </svg>

          {/* Map Controls: Floating Top-Left Layers Dropdown / Toggles */}
          <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
            <div className="flex items-center gap-1.5 p-1 bg-white/95 backdrop-blur-md rounded-lg border border-slate-200 shadow-sm text-xs">
              <span className="px-2 py-1 font-semibold text-slate-700 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                <span>Layers</span>
              </span>
              <div className="w-px h-4 bg-slate-200" />
              <button
                onClick={() => toggleLayer('parcels')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                  layers.parcels ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Parcels
              </button>
              <button
                onClick={() => toggleLayer('buildings')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                  layers.buildings ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Buildings
              </button>
              <button
                onClick={() => toggleLayer('roads')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                  layers.roads ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Roads
              </button>
              <button
                onClick={() => toggleLayer('satellite')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                  layers.satellite ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Satellite
              </button>
            </div>
          </div>

          {/* Floating Zoom & Compass Controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-1.5 z-10">
            <div className="flex flex-col p-1 bg-white/95 backdrop-blur-md rounded-lg border border-slate-200 shadow-sm">
              <button
                onClick={() => setZoomLevel((z) => Math.min(z + 1, 20))}
                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomLevel((z) => Math.max(z - 1, 10))}
                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <div className="w-full h-px bg-slate-200 my-0.5" />
              <button
                onClick={() => setZoomLevel(16)}
                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                title="Reset Map"
              >
                <Compass className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Bottom Bar: Coordinates, Scale, and Status */}
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-slate-600 pointer-events-none z-10">
            <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm pointer-events-auto flex items-center gap-3 font-mono text-[11px]">
              <span>LAT: {selectedParcel.coordinates[0].toFixed(4)}°N</span>
              <span className="text-slate-300">|</span>
              <span>LNG: {selectedParcel.coordinates[1].toFixed(4)}°E</span>
              <span className="text-slate-300">|</span>
              <span>ZOOM: {zoomLevel}x</span>
            </div>

            <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm pointer-events-auto flex items-center gap-2">
              <span className="w-12 h-1 bg-slate-700 block" />
              <span className="text-[11px] font-mono">100m Cadastral Scale</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Drawer: Selected Parcel Information Panel */}
      <div className="w-full lg:w-96 bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between overflow-y-auto max-h-[650px]">
        <div>
          {/* Header */}
          <div className="flex items-start justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <div className="text-[11px] font-mono text-indigo-600 uppercase font-semibold">
                Cadastral Land Parcel
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">{selectedParcel.name}</h2>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{selectedParcel.location}, {selectedParcel.district}</span>
              </div>
            </div>
            <div>{getStatusBadge(selectedParcel.verificationStatus)}</div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3 my-4">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="text-[11px] text-slate-500">Parcel Area</div>
              <div className="text-base font-bold text-slate-900 font-mono mt-0.5">
                {selectedParcel.areaSqFt.toLocaleString()} sq.ft
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">~0.193 Acres</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="text-[11px] text-slate-500">Vertical Units</div>
              <div className="text-base font-bold text-slate-900 font-mono mt-0.5">
                {selectedParcel.buildings[0]?.unitCount || 15} Units
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                G + {selectedParcel.buildings[0]?.floorCount ? selectedParcel.buildings[0].floorCount - 1 : 4} Floors
              </div>
            </div>
          </div>

          {/* Detailed Property Identity Fields */}
          <div className="space-y-2.5 text-xs text-slate-600">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Cadastral ULPIN</span>
              <span className="font-mono font-semibold text-slate-900">{selectedParcel.ulpin}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Parcel ID</span>
              <span className="font-mono text-slate-900">{selectedParcel.id}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Survey Number</span>
              <span className="text-slate-900 font-medium">{selectedParcel.surveyNumber}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Land Use Category</span>
              <span className="text-slate-900 font-medium">{selectedParcel.landUse}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">SRO Registration</span>
              <span className="text-slate-900 font-medium text-right max-w-[180px] truncate">
                {selectedParcel.subRegistrarOffice}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span className="text-slate-500">Last Cadastral Sync</span>
              <span className="text-slate-600 text-right">{selectedParcel.lastUpdated}</span>
            </div>
          </div>

          {/* Conflict Alert if applicable */}
          {selectedParcel.verificationStatus === 'Conflict' && (
            <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200 text-xs flex items-start gap-2 text-red-800">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Vertical Spatial Discrepancy Detected</span>
                <span className="text-red-700 text-[11px] leading-tight block mt-0.5">
                  Balcony protrusion on Floor 3 violates master boundary plan by 0.42m.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Action Button: Open 3D Property Viewer */}
        <div className="mt-6 pt-4 border-t border-slate-100">
          <button
            onClick={() => onOpen3DProperty(selectedParcel.id)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg shadow-sm transition-colors group"
          >
            <span>Open 3D Property Model</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
