import React, { useState } from 'react';
import { Parcel, Building, PropertyUnit } from '../types/property';
import {
  FileText,
  Camera,
  Layers,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  Send,
  Download,
  Eye,
  Sliders,
  Maximize2
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface EvidenceReviewPageProps {
  parcel: Parcel;
  building: Building;
  onApproveAll?: () => void;
}

export const EvidenceReviewPage: React.FC<EvidenceReviewPageProps> = ({
  parcel,
  building,
  onApproveAll,
}) => {
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string>('evd-3');
  const [auditStatus, setAuditStatus] = useState<'Pending' | 'Approved' | 'Sent for Survey'>('Pending');
  const [officerNotes, setOfficerNotes] = useState(
    'Reviewed cantilever balcony extension for Unit 302 against Town Survey register 42/1B. Verified structural sanction plan amendment.'
  );

  const handleApprove = () => {
    setAuditStatus('Approved');
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
    });
    if (onApproveAll) onApproveAll();
  };

  const handleSendForSurvey = () => {
    setAuditStatus('Sent for Survey');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-600 font-semibold uppercase">
            <span>GovTech Cadastral Verification</span>
            <span>·</span>
            <span>Multi-Modal Spatial Audit</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Evidence & Human Officer Review
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Cross-examine AI detection confidence scores against raw sensor telemetry, LiDAR profiles, and deed documents.
          </p>
        </div>

        {/* Audit Status Banner */}
        <div className="flex items-center gap-2">
          {auditStatus === 'Approved' ? (
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Property Approved by Revenue Officer</span>
            </div>
          ) : auditStatus === 'Sent for Survey' ? (
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Dispatched for Physical Total Station Survey</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold">
              <UserCheck className="w-4 h-4 text-indigo-600" />
              <span>Awaiting Human Officer Sign-off</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Review Grid: Evidence Cards on Left, High-Res Telemetry Viewer on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Evidence Records List */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs">
            Multi-Modal Evidence Dossier
          </h2>

          {/* Evidence 1: Building Boundary */}
          <div
            onClick={() => setSelectedEvidenceId('evd-1')}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              selectedEvidenceId === 'evd-1'
                ? 'bg-indigo-50/70 border-indigo-300 shadow-xs'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase font-semibold text-slate-500">
                  Sensor: Cartosat-3 + UAV (2cm GSD)
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                  Building Footprint & Envelope
                </h3>
              </div>
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                96.8% Confidence
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-2">
              Deep convolutional segmentation matches master cadastral survey plot boundary with 1.8cm precision.
            </p>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-100 font-mono">
              <span>Status: AI Verified</span>
              <span>28 Sep 2026, 09:12 AM</span>
            </div>
          </div>

          {/* Evidence 2: Floor Count / LiDAR */}
          <div
            onClick={() => setSelectedEvidenceId('evd-2')}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              selectedEvidenceId === 'evd-2'
                ? 'bg-indigo-50/70 border-indigo-300 shadow-xs'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase font-semibold text-slate-500">
                  Sensor: Airborne LiDAR Point Cloud
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                  Floor Count & Vertical Elevation Slabs
                </h3>
              </div>
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                94.2% Confidence
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-2">
              Detected 5 horizontal planar reflective planes at 3.3m height increments up to 16.5m apex.
            </p>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-100 font-mono">
              <span>Status: AI Verified</span>
              <span>28 Sep 2026, 09:45 AM</span>
            </div>
          </div>

          {/* Evidence 3: Unit Boundary Overlap */}
          <div
            onClick={() => setSelectedEvidenceId('evd-3')}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              selectedEvidenceId === 'evd-3'
                ? 'bg-indigo-50/70 border-indigo-300 shadow-xs ring-1 ring-indigo-500'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase font-semibold text-red-600">
                  Sensor: Deed OCR + Spatial Vectorizer
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                  Unit 302 Cantilever Boundary Overlap
                </h3>
              </div>
              <span className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                <AlertTriangle className="w-3.5 h-3.5" />
                72.4% Confidence
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-2">
              Balcony cantilever projects 0.42m beyond standard vertical plot boundary. Requires human review.
            </p>
            <div className="flex items-center justify-between text-[11px] text-red-600 font-medium mt-3 pt-2 border-t border-slate-100 font-mono">
              <span>Action: Requires Officer Review</span>
              <span>28 Sep 2026, 10:14 AM</span>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Telemetry Inspection & Officer Sign-off */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Telemetry Viewer Header */}
            <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <Camera className="w-4 h-4 text-indigo-600" />
                <span>
                  {selectedEvidenceId === 'evd-1'
                    ? 'Satellite Orthophoto (2cm GSD) vs Cadastral Polygon'
                    : selectedEvidenceId === 'evd-2'
                    ? 'LiDAR Point Cloud Vertical Cross-Section'
                    : 'Unit 302 Registered Floor Plan vs 3D Extrusion Overlap'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                <span>ZOOM: 100%</span>
              </div>
            </div>

            {/* Simulated High-Res Sensor Canvas - Light Theme GIS Engineering */}
            <div className="relative bg-slate-50 border-y border-slate-200 h-72 flex items-center justify-center overflow-hidden">
              {selectedEvidenceId === 'evd-1' && (
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* Simulated Orthophoto with vector outline */}
                  <div
                    className="absolute inset-0 opacity-30"
                    style={{
                      backgroundImage: 'radial-gradient(circle, #64748b 1px, transparent 1px)',
                      backgroundSize: '20px 20px',
                    }}
                  />
                  <div className="relative w-72 h-48 border-2 border-emerald-600 bg-emerald-50/70 rounded-xl flex items-center justify-center text-center p-4 shadow-xs">
                    <div>
                      <div className="text-emerald-800 font-mono text-xs font-bold">
                        Cadastral Boundary Match · Verified
                      </div>
                      <div className="text-xs text-slate-700 mt-1">
                        Footprint: 2,400 sq.ft · Setback margin: 1.5m
                      </div>
                      <div className="mt-2 inline-block px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] rounded font-mono font-semibold border border-emerald-300">
                        RMSE Error: 0.018m (Within 2.5cm tolerance)
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedEvidenceId === 'evd-2' && (
                <div className="relative w-full h-full p-6 flex flex-col justify-between">
                  <div className="text-xs text-indigo-900 font-mono flex items-center justify-between font-bold">
                    <span>LiDAR Vertical Profile: Elevation Axis</span>
                    <span className="text-slate-600">Density: 35.2 pts/m²</span>
                  </div>

                  {/* Visual LiDAR slabs representation */}
                  <div className="space-y-3.5 my-auto w-3/4 mx-auto">
                    {[
                      { name: 'Roof Slab (Apex: 16.5m)', color: 'bg-indigo-600' },
                      { name: 'Floor 4 (13.2m)', color: 'bg-indigo-500' },
                      { name: 'Floor 3 (9.9m)', color: 'bg-blue-600' },
                      { name: 'Floor 2 (6.6m)', color: 'bg-indigo-400' },
                      { name: 'Floor 1 (3.3m)', color: 'bg-blue-400' },
                      { name: 'Ground Slab (0.0m AGL)', color: 'bg-emerald-600' },
                    ].map((lvl, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-[11px] font-mono text-slate-700 font-semibold w-36 truncate">{lvl.name}</span>
                        <div className={`h-2 flex-1 rounded ${lvl.color} shadow-xs`} />
                      </div>
                    ))}
                  </div>

                  <div className="text-[11px] font-mono text-slate-500 flex justify-between border-t border-slate-200 pt-2">
                    <span>Elevation Range: 0.0m - 16.5m</span>
                    <span>Inter-floor Height: 3.30m constant</span>
                  </div>
                </div>
              )}

              {selectedEvidenceId === 'evd-3' && (
                <div className="relative w-full h-full p-4 flex flex-col justify-between">
                  <div className="text-xs text-amber-900 font-mono flex items-center justify-between font-bold">
                    <span>Unit 302 Architectural Vector vs Cadastral Setback</span>
                    <span className="text-red-700 bg-red-100 px-2 py-0.5 rounded font-mono font-bold">DISCREPANCY: +0.42m</span>
                  </div>

                  {/* Overlap Diagram */}
                  <div className="relative w-80 h-40 mx-auto border-2 border-dashed border-slate-300 rounded-xl bg-white p-3 flex items-center justify-center shadow-xs">
                    <div className="w-56 h-28 border-2 border-indigo-600 bg-indigo-50/60 relative rounded-sm flex items-center justify-center">
                      <div className="text-[11px] text-indigo-900 font-bold font-mono p-1">Approved Unit 302 (780 sq.ft)</div>
                      {/* Overhanging Balcony Slice */}
                      <div className="absolute -right-8 top-0 bottom-0 w-8 border-2 border-red-500 bg-red-100 flex items-center justify-center animate-pulse rounded-r-sm">
                        <span className="text-[10px] text-red-800 font-bold -rotate-90">0.42m</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] font-mono text-slate-600 text-center">
                    Red zone indicates cantilever balcony exceeding registered vertical parcel setback line.
                  </div>
                </div>
              )}
            </div>

            {/* Officer Audit Notes & Decision Panel */}
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Revenue Officer Audit Notes
                </label>
                <textarea
                  rows={3}
                  value={officerNotes}
                  onChange={(e) => setOfficerNotes(e.target.value)}
                  className="w-full text-xs p-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                />
              </div>

              {/* Audit Metadata */}
              <div className="grid grid-cols-3 gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-600">
                <div>
                  <div className="text-[10px] text-slate-400 font-mono uppercase">Detected By</div>
                  <div className="font-semibold text-slate-900 mt-0.5">AI Spatial Model v2.4</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-mono uppercase">Assigned Officer</div>
                  <div className="font-semibold text-slate-900 mt-0.5">K. S. Narayanan (SRO)</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-mono uppercase">Timestamp</div>
                  <div className="font-semibold text-slate-900 mt-0.5">28 Sep 2026, 10:42 AM</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={handleSendForSurvey}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send for Field Survey</span>
                </button>
                <button
                  onClick={handleApprove}
                  className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve & Finalize 3D ULPIN</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
