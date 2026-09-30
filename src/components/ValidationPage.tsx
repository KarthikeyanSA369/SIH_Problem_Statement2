import React, { useState } from 'react';
import { Parcel, Building, PropertyUnit } from '../types/property';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileCheck,
  ArrowRight,
  Eye,
  Sliders,
  Sparkles,
  ChevronRight,
  Info,
  Clock,
  Layers,
  Building as BuildingIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ValidationPageProps {
  parcel: Parcel;
  building: Building;
  onNavigateToEvidence: () => void;
  onNavigateTo3D: (unitId?: string, floorId?: string) => void;
}

export const ValidationPage: React.FC<ValidationPageProps> = ({
  parcel,
  building,
  onNavigateToEvidence,
  onNavigateTo3D,
}) => {
  const [conflictResolved, setConflictResolved] = useState(false);
  const [reviewNote, setReviewNote] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'conflicts' | 'passed'>('all');

  const conflictUnit = building.floors
    .flatMap((f) => f.units)
    .find((u) => u.status === 'Conflict') || building.floors[3].units[1];

  const handleResolveConflict = () => {
    setConflictResolved(true);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  const validationChecks = [
    {
      id: 'chk-01',
      title: 'Cadastral Boundary & Setback Verification',
      category: 'Parcel Level',
      status: 'Passed',
      tolerance: '± 2.5 cm',
      actual: '1.2 cm RMSE',
      details: 'Building outer footprint strictly complies with municipal town planning setbacks on North, South, and West axes.',
      method: 'High-Res Orthophoto + Revenue Record Overlay',
    },
    {
      id: 'chk-02',
      title: 'Building Geometry & Height Envelope',
      category: 'Building Level',
      status: 'Passed',
      tolerance: '17.0 m Max Permissible',
      actual: '16.5 m Apex',
      details: 'Apex height confirmed via LiDAR point cloud density matching approved structural drawing.',
      method: 'Airborne LiDAR Point Density (35 pts/m²)',
    },
    {
      id: 'chk-03',
      title: 'Vertical Floor Slab Separation',
      category: 'Floor Level',
      status: 'Passed',
      tolerance: '3.3 m ± 0.1 m',
      actual: '3.3 m uniform',
      details: 'All 5 horizontal floor slabs (Ground + 4) identified with clear inter-floor clearance.',
      method: 'Vertical Point Slice Fourier Analysis',
    },
    {
      id: 'chk-04',
      title: 'Unit Spatial Boundary & Corridor Overlap',
      category: 'Unit Level',
      status: conflictResolved ? 'Passed' : 'Conflict',
      tolerance: '0.0 cm Overlap',
      actual: conflictResolved ? '0.0 cm (Field Adjusted)' : '+42.0 cm Overlap',
      details: conflictResolved
        ? 'Balcony cantilever overhang approved per municipal waiver amendment #409.'
        : 'Unit 302 cantilever balcony extends beyond registered cadastral setback line by 0.42m eastward.',
      method: '3D Spatial Topology Polygon Intersection',
    },
    {
      id: 'chk-05',
      title: '3D ULPIN Registry & Syntax Mapping',
      category: 'Registry Level',
      status: 'Passed',
      tolerance: '100% Unique',
      actual: '15 of 15 Linked',
      details: 'Every 3D vertical unit generated a valid 14-digit survey root + vertical level and unit suffix.',
      method: 'National ULPIN Standard v2.4 Generator',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-600 font-semibold uppercase">
            <span>Spatial Rule Engine</span>
            <span>·</span>
            <span>SIH 2026 GovTech Standard</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Cadastral & Vertical Spatial Validation
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Automated compliance evaluation of 3D spatial properties against master land records.
          </p>
        </div>

        {/* Status Chip cluster */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-slate-200 shadow-xs text-xs">
            <span className="text-slate-500">Validation Score:</span>
            <span className="font-bold text-slate-900 font-mono">
              {conflictResolved ? '100%' : '92%'}
            </span>
          </div>

          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold ${
              conflictResolved
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-red-50 text-red-700 border-red-200'
            }`}
          >
            {conflictResolved ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>All Checks Passed</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>1 Active Spatial Conflict</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Hero Conflict Alert Box if not resolved */}
      {!conflictResolved && (
        <div className="p-5 bg-gradient-to-r from-red-50 via-red-50/70 to-white rounded-xl border border-red-200 shadow-xs">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-100 rounded-lg text-red-600 shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold uppercase text-red-700">
                    High Priority Spatial Conflict
                  </span>
                  <span className="px-2 py-0.5 bg-red-100 text-red-800 text-[10px] font-bold rounded">
                    Risk: Medium
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Unit 302: Cantilever Balcony Boundary Overlap
                </h3>
                <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                  The 3D envelope for unit <code className="font-mono text-red-700 bg-red-100/50 px-1 py-0.5 rounded">{conflictUnit.ulpin}</code> extends <strong>0.42m</strong> beyond the approved vertical setback corridor into the common air rights zone.
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-500 mt-3 font-mono">
                  <span>Detected By: AI Spatial Analysis (LiDAR + Plan Vectorizer)</span>
                  <span>·</span>
                  <span>Tolerance Exceeded: +42 cm</span>
                </div>
              </div>
            </div>

            {/* Action buttons on conflict */}
            <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0">
              <button
                onClick={() => onNavigateTo3D(conflictUnit.id, conflictUnit.floorId)}
                className="w-full sm:w-auto px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 shadow-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Eye className="w-3.5 h-3.5 text-indigo-600" />
                <span>Locate in 3D</span>
              </button>
              <button
                onClick={onNavigateToEvidence}
                className="w-full sm:w-auto px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors"
              >
                Review Evidence
              </button>
              <button
                onClick={handleResolveConflict}
                className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
              >
                Approve Exception
              </button>
            </div>
          </div>
        </div>
      )}

      {conflictResolved && (
        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold text-sm block">Spatial Conflict Resolved</span>
              <span className="text-emerald-700">
                Unit 302 cantilever exception verified and registered under Municipal Exemption Order #409.
              </span>
            </div>
          </div>
          <button
            onClick={() => setConflictResolved(false)}
            className="px-3 py-1.5 text-xs text-emerald-800 bg-white rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors"
          >
            Reopen Review
          </button>
        </div>
      )}

      {/* Validation Checks Table / Cards */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Rule Execution Audit Log
            </h2>
            <p className="text-xs text-slate-500">
              5 automated geometric and topological rule tests executed
            </p>
          </div>

          {/* Segmented Filter Control */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 font-medium rounded-md transition-colors ${
                activeTab === 'all'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All (5)
            </button>
            <button
              onClick={() => setActiveTab('conflicts')}
              className={`px-3 py-1 font-medium rounded-md transition-colors ${
                activeTab === 'conflicts'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Conflicts ({conflictResolved ? 0 : 1})
            </button>
            <button
              onClick={() => setActiveTab('passed')}
              className={`px-3 py-1 font-medium rounded-md transition-colors ${
                activeTab === 'passed'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Passed ({conflictResolved ? 5 : 4})
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {validationChecks
            .filter((c) => {
              if (activeTab === 'conflicts') return c.status === 'Conflict';
              if (activeTab === 'passed') return c.status === 'Passed';
              return true;
            })
            .map((check) => (
              <div
                key={check.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
              >
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-semibold text-slate-500 uppercase">
                      {check.category}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-[11px] font-mono text-slate-400">{check.method}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{check.title}</h4>
                  <p className="text-xs text-slate-600">{check.details}</p>
                  <div className="flex items-center gap-4 text-xs font-mono text-slate-500 pt-1">
                    <span>Tolerance Limit: {check.tolerance}</span>
                    <span>·</span>
                    <span>Actual Reading: {check.actual}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {check.status === 'Passed' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Passed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                      Conflict
                    </span>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
