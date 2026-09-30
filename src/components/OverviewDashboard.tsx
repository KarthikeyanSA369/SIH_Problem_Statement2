import React from 'react';
import { GlobalStats, Parcel } from '../types/property';
import {
  Building2,
  Box,
  Layers,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  Play,
  MapPin,
  Clock,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface OverviewDashboardProps {
  stats: GlobalStats;
  parcels: Parcel[];
  onOpenWorkspace: (parcelId?: string) => void;
  onStartDemo: () => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  stats,
  parcels,
  onOpenWorkspace,
  onStartDemo,
}) => {
  const recentActivities = [
    {
      id: 'act-1',
      title: 'Unit 302 Boundary Discrepancy',
      property: 'Green Residency Block A',
      time: '12 mins ago',
      type: 'conflict',
      note: '42cm cantilever setback overlap with vertical cadastre line',
    },
    {
      id: 'act-2',
      title: 'Floor 2 Strata Verified',
      property: 'Green Residency Block A',
      time: '45 mins ago',
      type: 'verified',
      note: '3 residential units matched with registered deed records',
    },
    {
      id: 'act-3',
      title: 'LiDAR Building Height Extracted',
      property: 'Lakshmi Towers',
      time: '2 hours ago',
      type: 'info',
      note: '18.2m G+4 structure reconstructed from aerial survey point cloud',
    },
    {
      id: 'act-4',
      title: '3D ULPIN Issued',
      property: 'Royal Tech Residency',
      time: '4 hours ago',
      type: 'verified',
      note: 'ULPIN-KA-987654-F04-U02 registered in digital cadastre',
    },
  ];

  return (
    <div className="space-y-5">
      {/* 1. Header Banner with Single Primary Call to Action */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        {/* Subtle grid pattern background */}
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        <div className="relative z-10 max-w-xl space-y-1.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold font-mono uppercase">
            <span>GovTech Spatial GIS · Smart India Hackathon</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            3D ULPIN & Vertical Property Intelligence
          </h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            Transform conventional 2D cadastral land parcels into intelligent 3D property models with multi-floor sub-division tracking, unique ULPIN linkages, and spatial conflict verification.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="relative z-10 flex flex-wrap items-center gap-3 shrink-0">
          {/* Main Workspace Button */}
          <button
            onClick={() => onOpenWorkspace('PAR-TN-123456')}
            className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all hover:scale-[1.02] hover:gap-3"
          >
            <span>Open Property Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* One-Click Demo Mode Button */}
          <button
            onClick={onStartDemo}
            className="flex items-center gap-2 px-4 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 transition-all hover:scale-[1.02]"
            title="Auto-demonstrate complete workflow: Parcel → Building → Floor → Unit → ULPIN → Validation"
          >
            <Play className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
            <span>Start Demo</span>
          </button>
        </div>
      </div>

      {/* 2. Top 4 Clean Summary Cards (Section 16 requirement) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Properties */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold text-slate-600">Total Properties</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Box className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
              {stats.totalParcels.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 mt-1 font-semibold">
              <TrendingUp className="w-3 h-3" />
              <span>+12.4% this month</span>
            </div>
          </div>
        </div>

        {/* Verified */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold text-slate-600">Verified Properties</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
              {stats.verifiedProperties.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 mt-1 font-semibold">
              <span>88.3% compliance rate</span>
            </div>
          </div>
        </div>

        {/* Under Review */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold text-slate-600">Under Review</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
              714
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1 font-medium">
              <span>In surveyor review queue</span>
            </div>
          </div>
        </div>

        {/* Conflicts */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold text-slate-600">Spatial Conflicts</span>
            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-red-600 font-mono tracking-tight">
              {stats.conflicts}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-red-600 mt-1 font-semibold">
              <span>Requires field verification</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Row: Recent Properties Table + Recent Validation Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Recent Properties Table (7 cols) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-2xs p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Recent Cadastral Properties</h2>
                <p className="text-xs text-slate-500">Latest 2D parcels processed into 3D multi-strata buildings</p>
              </div>
              <button
                onClick={() => onOpenWorkspace()}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <span>View All in Workspace</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 pr-3">Property Name</th>
                    <th className="py-2.5 px-3">Parcel ID</th>
                    <th className="py-2.5 px-3">ULPIN</th>
                    <th className="py-2.5 px-3 text-center">Levels / Units</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 pl-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parcels.map((p) => {
                    const isVerified = p.verificationStatus === 'Verified';
                    const isConflict = p.verificationStatus === 'Conflict';
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 pr-3 font-bold text-slate-900 truncate max-w-[150px]">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            <span className="truncate">{p.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-600">{p.id}</td>
                        <td className="py-3 px-3 font-mono text-slate-500 truncate max-w-[140px]">{p.ulpin}</td>
                        <td className="py-3 px-3 text-center font-mono font-semibold text-slate-700">
                          {p.buildings[0]?.floorCount || 1}F · {p.buildings[0]?.unitCount || 1}U
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1 ${
                              isVerified
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : isConflict
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            <span>{p.verificationStatus}</span>
                          </span>
                        </td>
                        <td className="py-3 pl-3 text-right">
                          <button
                            onClick={() => onOpenWorkspace(p.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-xs transition-colors"
                          >
                            <span>Inspect</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Recent Validation Activity (5 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-2xs p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Recent Validation Activity</h2>
                <p className="text-xs text-slate-500">Live surveyor audits & automated checks</p>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                Live Audit
              </span>
            </div>

            <div className="mt-3 space-y-3">
              {recentActivities.map((act) => (
                <div
                  key={act.id}
                  className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {act.title}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">
                      {act.time}
                    </span>
                  </div>
                  <div className="text-[11px] font-semibold text-indigo-600">
                    {act.property}
                  </div>
                  <div className="text-[11px] text-slate-500 leading-tight">
                    {act.note}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 mt-4">
            <button
              onClick={() => onOpenWorkspace('PAR-TN-123456')}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Explore All in Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
