import React, { useState } from 'react';
import { Settings, Save, Check, RefreshCw, Database, Layers, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

export const SettingsPage: React.FC = () => {
  const [crs, setCrs] = useState('EPSG:4326 (WGS 84)');
  const [toleranceCm, setToleranceCm] = useState(10);
  const [lidarDensity, setLidarDensity] = useState('35 pts/m² (High Density)');
  const [ulpinVersion, setUlpinVersion] = useState('v2.4 - ISO 19152 LADM Aligned');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.6 },
    });
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2 text-xs font-mono text-indigo-600 font-semibold uppercase">
          <span>System Configuration</span>
          <span>·</span>
          <span>GovTech GIS Parameters</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">
          Spatial Engine & ULPIN Standards
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Configure spatial reference systems, AI conflict tolerance thresholds, and national cadastral standards.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            Coordinate Reference System (CRS)
          </h3>
          <p className="text-xs text-slate-500 mb-3">
            Primary projection used for 2D parcel polygons and 3D volumetric coordinates.
          </p>
          <select
            value={crs}
            onChange={(e) => setCrs(e.target.value)}
            className="w-full max-w-md p-2 text-xs bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option>EPSG:4326 (WGS 84 Geographic)</option>
            <option>EPSG:3857 (WGS 84 / Pseudo-Mercator)</option>
            <option>EPSG:32643 (UTM Zone 43N - Peninsular India)</option>
            <option>EPSG:7760 (India National CRS)</option>
          </select>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            Boundary Conflict Tolerance Threshold
          </h3>
          <p className="text-xs text-slate-500 mb-3">
            Maximum permissible deviation (in cm) before flagging a vertical setback conflict.
          </p>
          <div className="flex items-center gap-4 max-w-md">
            <input
              type="range"
              min={2}
              max={30}
              value={toleranceCm}
              onChange={(e) => setToleranceCm(Number(e.target.value))}
              className="flex-1 accent-indigo-600"
            />
            <span className="font-mono font-bold text-sm text-slate-900 w-16">
              ± {toleranceCm} cm
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Deviations above {toleranceCm} cm trigger automatic human officer review.
          </span>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            LiDAR Point Cloud Resolution Tier
          </h3>
          <p className="text-xs text-slate-500 mb-3">
            Sampling density for automated building height and floor slab Fourier detection.
          </p>
          <select
            value={lidarDensity}
            onChange={(e) => setLidarDensity(e.target.value)}
            className="w-full max-w-md p-2 text-xs bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option>35 pts/m² (High Density - Airborne Survey)</option>
            <option>50 pts/m² (Ultra-High - Drone UAV LiDAR)</option>
            <option>15 pts/m² (Standard - Regional Ortho)</option>
          </select>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            National 3D ULPIN Schema Format
          </h3>
          <p className="text-xs text-slate-500 mb-3">
            Hierarchical alphanumeric encoding syntax for vertical property units.
          </p>
          <div className="p-3 bg-slate-50 rounded-lg font-mono text-xs text-slate-700 max-w-md border border-slate-200">
            ULPIN-[STATE]-[PARCEL_14_DIGIT]-F[FLOOR_2D]-U[UNIT_2D]
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
          >
            {saved ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
            <span>{saved ? 'Settings Saved' : 'Save GovTech Parameters'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
