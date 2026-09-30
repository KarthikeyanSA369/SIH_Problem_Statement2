import React, { useState } from 'react';
import { Parcel, Building } from '../types/property';
import {
  FileText,
  Download,
  Eye,
  CheckCircle2,
  FileCheck,
  Building as BuildingIcon,
  Layers,
  AlertTriangle,
  Sparkles,
  Printer,
  X,
  QrCode
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ReportsPageProps {
  parcel: Parcel;
  building: Building;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ parcel, building }) => {
  const [previewReport, setPreviewReport] = useState<string | null>(null);

  const reports = [
    {
      id: 'rep-01',
      title: '3D Property Verification Certificate',
      desc: 'Official cadastral spatial certificate confirming 3D volumetric boundaries, floor levels, and vertical ULPIN linkage.',
      category: 'Certification',
      date: '28 Sep 2026',
      size: '2.4 MB PDF',
    },
    {
      id: 'rep-02',
      title: 'Vertical Parcel & Floor Schedule Report',
      desc: 'Comprehensive breakdown of all 5 floors (Ground to Floor 4) with unit area statements, deed cross-matches, and occupancy types.',
      category: 'Schedule',
      date: '28 Sep 2026',
      size: '1.8 MB PDF',
    },
    {
      id: 'rep-03',
      title: 'Spatial Conflict & Setback Audit Log',
      desc: 'Technical survey report documenting the 0.42m cantilever balcony overlap in Unit 302 and municipal waiver status.',
      category: 'Compliance',
      date: '28 Sep 2026',
      size: '980 KB PDF',
    },
    {
      id: 'rep-04',
      title: 'AI Multi-Sensor Detection Confidence Dossier',
      desc: 'Raw machine learning confidence metrics across Cartosat-3 UAV orthophotos and airborne LiDAR point cloud slices.',
      category: 'Telemetry',
      date: '28 Sep 2026',
      size: '3.1 MB PDF',
    },
    {
      id: 'rep-05',
      title: 'National 3D ULPIN Registry Export',
      desc: 'Standardized Land Administration Domain Model (LADM / ISO 19152) structured XML and CSV export for sub-registrar integration.',
      category: 'Data Exchange',
      date: '28 Sep 2026',
      size: '450 KB CSV/XML',
    },
    {
      id: 'rep-06',
      title: 'Town Planning Building Footprint Envelope',
      desc: 'Municipal setback compliance certificate for TS No. 42/1B, Race Course Road, Coimbatore.',
      category: 'Town Planning',
      date: '27 Sep 2026',
      size: '1.2 MB PDF',
    },
  ];

  const handleDownload = (title: string) => {
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
    });

    const docText = `GOVERNMENT OF INDIA - SMART INDIA HACKATHON 2026\n3D ULPIN GENERATION & VERTICAL PROPERTY MAPPING SYSTEM\n=======================================================\nREPORT: ${title.toUpperCase()}\nPARCEL: ${parcel.id} (${parcel.ulpin})\nBUILDING: ${building.name} (${building.id})\nTOTAL FLOORS: ${building.floorCount} (G+4)\nTOTAL UNITS: ${building.unitCount}\nDATE OF GENERATION: 28 September 2026\nSTATUS: VERIFIED & AUDITED`;

    const blob = new Blob([docText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-600 font-semibold uppercase">
            <span>Official Records & Dossiers</span>
            <span>·</span>
            <span>SIH 2026 GovTech Standard</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Cadastral & 3D Property Reports
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Download certified 3D property records, compliance certificates, and AI sensor validation logs.
          </p>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {reports.map((rep) => (
          <div
            key={rep.id}
            className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition-all"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-semibold uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                  {rep.category}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">{rep.date}</span>
              </div>

              <h3 className="text-base font-bold text-slate-900 mt-3">{rep.title}</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{rep.desc}</p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400">{rep.size}</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPreviewReport(rep.title)}
                  className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Preview Report"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDownload(rep.title)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Preview */}
      {previewReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">{previewReport}</h3>
              </div>
              <button
                onClick={() => setPreviewReport(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs font-mono text-slate-700">
              <div className="border border-slate-200 p-5 rounded-xl bg-slate-50/50 space-y-3">
                <div className="text-center pb-3 border-b border-slate-200">
                  <div className="text-sm font-bold text-slate-900">
                    GOVERNMENT OF INDIA · REVENUE & DISASTER MANAGEMENT
                  </div>
                  <div className="text-[11px] text-slate-500">
                    National 3D ULPIN Cadastral Spatial Registry
                  </div>
                </div>

                <div className="flex justify-between">
                  <span>PARCEL ULPIN: {parcel.ulpin}</span>
                  <span>BUILDING: {building.id}</span>
                </div>

                <div className="flex justify-between">
                  <span>LOCATION: {parcel.location}, {parcel.district}</span>
                  <span>SURVEY NO: {parcel.surveyNumber}</span>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <div className="font-bold text-slate-900 mb-1">VERTICAL SUB-DIVISION SCHEDULE:</div>
                  <div className="space-y-1 text-[11px] text-slate-600">
                    <div>· Floor 0 (Ground): 3 Units (G01 - G03) · 2,400 sq.ft · Verified</div>
                    <div>· Floor 1: 3 Units (101 - 103) · 2,400 sq.ft · Verified</div>
                    <div>· Floor 2: 3 Units (201 - 203) · 2,400 sq.ft · Verified</div>
                    <div>· Floor 3: 4 Units (301 - 304) · 2,400 sq.ft · Unit 302 Setback Reviewed</div>
                    <div>· Floor 4: 2 Units (401 - 402) · 2,400 sq.ft · Verified</div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                  <div className="text-[10px] text-slate-400">
                    Digitally signed by Cadastral AI Engine & Revenue Officer
                  </div>
                  <QrCode className="w-8 h-8 text-slate-800" />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setPreviewReport(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => handleDownload(previewReport)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Report</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
