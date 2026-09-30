import React, { useState } from 'react';
import { PropertyUnit, Parcel, Building, Floor } from '../types/property';
import {
  X,
  Copy,
  Check,
  QrCode,
  Download,
  ShieldCheck,
  AlertTriangle,
  Building as BuildingIcon,
  Layers,
  MapPin,
  Calendar,
  FileText,
  User,
  Share2
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface UlpinDetailsModalProps {
  unit: PropertyUnit;
  floor?: Floor;
  building?: Building;
  parcel?: Parcel;
  isOpen: boolean;
  onClose: () => void;
  onViewEvidence?: () => void;
  onValidate?: () => void;
}

export const UlpinDetailsModal: React.FC<UlpinDetailsModalProps> = ({
  unit,
  floor,
  building,
  parcel,
  isOpen,
  onClose,
  onViewEvidence,
  onValidate,
}) => {
  const [copied, setCopied] = useState(false);
  const [showQrExpanded, setShowQrExpanded] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(unit.ulpin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCertificate = () => {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
    });

    const certContent = `GOVERNMENT OF INDIA - BHARAT GIS REGISTRY\n3D UNIQUE LAND PARCEL IDENTIFICATION NUMBER (3D-ULPIN) RECORD\n--------------------------------------------------------------\n3D ULPIN: ${unit.ulpin}\nPARCEL ID: ${unit.parcelId}\nBUILDING ID: ${unit.buildingId}\nFLOOR: Floor ${unit.floorNumber} (${unit.floorId})\nUNIT: Unit ${unit.unitNumber} (${unit.id})\nTYPE: ${unit.propertyType}\nSUPER BUILT-UP AREA: ${unit.areaSqFt} sq.ft\nREGISTERED OWNER: ${unit.ownerName}\nDEED REGISTRATION: ${unit.deedNumber} (${unit.registrationDate})\nCOORDINATES: ${unit.coordinates[0]} N, ${unit.coordinates[1]} E\nSTATUS: ${unit.status}\nAUTHENTICATED VIA: Smart India Hackathon 2026 - 3D GIS Engine\nDATE OF ISSUANCE: 28 September 2026`;

    const blob = new Blob([certContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `3D-ULPIN-${unit.ulpin}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
              3D
            </div>
            <div>
              <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wide">
                Digital Property Identity
              </span>
              <h3 className="text-base font-bold text-slate-900">
                Unit {unit.unitNumber} · 3D ULPIN Registry
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Main Digital Identity Card (Physical Smart Card Style - Light Theme GovTech) */}
          <div className="relative p-6 rounded-2xl bg-gradient-to-br from-indigo-50/90 via-white to-blue-50/90 text-slate-900 shadow-sm overflow-hidden border-2 border-indigo-200">
            {/* Background Pattern */}
            <div
              className="absolute inset-0 opacity-25 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)',
                backgroundSize: '16px 16px',
              }}
            />

            <div className="relative z-10 flex flex-col justify-between gap-5">
              {/* Top Card Row */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[10px] uppercase font-mono tracking-widest text-indigo-700 font-bold">
                    Republic of India · National GIS Cadastre
                  </div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">
                    Vertical Property Certificate
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded text-[11px] font-bold tracking-wide uppercase ${
                      unit.status === 'Verified'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-red-100 text-red-800 border border-red-300'
                    }`}
                  >
                    {unit.status}
                  </span>
                </div>
              </div>

              {/* 3D ULPIN Display */}
              <div className="bg-white/95 rounded-xl p-3.5 border border-indigo-200 shadow-xs">
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold font-mono">
                  Unique Land Parcel Identifier (Vertical 3D)
                </div>
                <div className="flex items-center justify-between mt-1">
                  <div className="font-mono text-lg font-bold tracking-tight text-indigo-950 select-all">
                    {unit.ulpin}
                  </div>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Card Footer: Metadata Grid & QR Code */}
              <div className="grid grid-cols-4 gap-2 text-xs pt-2 border-t border-slate-200">
                <div>
                  <div className="text-[10px] text-slate-500 font-medium">Floor Level</div>
                  <div className="font-mono font-bold text-slate-900">Floor {unit.floorNumber}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-medium">Unit Number</div>
                  <div className="font-mono font-bold text-slate-900">{unit.unitNumber}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-medium">Super Area</div>
                  <div className="font-mono font-bold text-slate-900">{unit.areaSqFt} sq.ft</div>
                </div>
                <div className="flex justify-end">
                  <div className="w-12 h-12 bg-white p-1 rounded-md shadow-xs border border-slate-200 flex items-center justify-center">
                    <QrCode className="w-full h-full text-indigo-900" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Spatial Lineage Breakdown */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              Vertical Hierarchy & Cadastral Lineage
            </h4>
            <div className="grid grid-cols-4 gap-2">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                <div className="text-[10px] text-slate-500 uppercase font-mono">1. Parcel</div>
                <div className="text-xs font-bold font-mono text-slate-900 mt-1 truncate">
                  {unit.parcelId}
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                <div className="text-[10px] text-slate-500 uppercase font-mono">2. Building</div>
                <div className="text-xs font-bold font-mono text-slate-900 mt-1 truncate">
                  {unit.buildingId}
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                <div className="text-[10px] text-slate-500 uppercase font-mono">3. Floor</div>
                <div className="text-xs font-bold font-mono text-slate-900 mt-1 truncate">
                  {unit.floorId} (L{unit.floorNumber})
                </div>
              </div>
              <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200 text-center">
                <div className="text-[10px] text-indigo-600 uppercase font-mono font-bold">4. Unit</div>
                <div className="text-xs font-bold font-mono text-indigo-900 mt-1 truncate">
                  {unit.id} ({unit.unitNumber})
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Property & Deed Attributes */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="font-semibold text-slate-900 flex items-center gap-1.5 pb-2 border-b border-slate-200">
                <User className="w-3.5 h-3.5 text-indigo-600" />
                <span>Ownership & Registration</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Registered Owner:</span>
                <span className="font-medium text-slate-900 text-right">{unit.ownerName}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Deed Document:</span>
                <span className="font-mono text-slate-900">{unit.deedNumber}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Registration Date:</span>
                <span className="text-slate-800">{unit.registrationDate}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Cadastral Match:</span>
                <span className="text-emerald-700 font-semibold">{unit.recordStatus}</span>
              </div>
            </div>

            <div className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="font-semibold text-slate-900 flex items-center gap-1.5 pb-2 border-b border-slate-200">
                <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                <span>Spatial Geometries & Coordinates</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Latitude / Longitude:</span>
                <span className="font-mono text-slate-900">
                  {unit.coordinates[0].toFixed(5)}, {unit.coordinates[1].toFixed(5)}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Vertical Offset (Z):</span>
                <span className="font-mono text-slate-900">
                  {floor ? `${floor.elevationMeters.toFixed(1)}m AGL` : '10.3m AGL'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Unit Dimensions:</span>
                <span className="font-mono text-slate-900">
                  {unit.size[0]}m × {unit.size[1]}m × {unit.size[2]}m
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Boundary Status:</span>
                <span
                  className={`font-semibold ${
                    unit.boundaryStatus === 'Verified' ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  {unit.boundaryStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Conflict details card if exists */}
          {unit.conflictDetails && (
            <div className="p-4 bg-red-50 rounded-xl border border-red-200 text-xs">
              <div className="flex items-center gap-2 text-red-800 font-bold mb-1">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>Conflict Detected: {unit.conflictDetails.issue}</span>
              </div>
              <p className="text-red-700 mb-2">
                Risk Level: <strong className="uppercase">{unit.conflictDetails.riskLevel}</strong> · Tolerance
                Exceeded: <strong>{unit.conflictDetails.toleranceExceededCm} cm</strong>
              </p>
              <div className="text-[11px] text-red-800 bg-red-100/70 p-2.5 rounded-lg border border-red-200">
                <strong>Recommended Action:</strong> {unit.conflictDetails.recommendedAction}
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Buttons */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCertificate}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              <span>Download Record</span>
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 shadow-sm transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied' : 'Copy ULPIN'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {onViewEvidence && (
              <button
                onClick={() => {
                  onClose();
                  onViewEvidence();
                }}
                className="px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors"
              >
                View Evidence
              </button>
            )}
            {onValidate && (
              <button
                onClick={() => {
                  onClose();
                  onValidate();
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
              >
                Validate Property
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
