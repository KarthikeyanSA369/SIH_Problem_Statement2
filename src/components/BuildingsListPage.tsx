import React from 'react';
import { Parcel } from '../types/property';
import { Building2, Box, Layers, ShieldCheck, AlertTriangle, ArrowRight } from 'lucide-react';

interface BuildingsListPageProps {
  parcels: Parcel[];
  onOpen3D: (parcelId: string) => void;
}

export const BuildingsListPage: React.FC<BuildingsListPageProps> = ({ parcels, onOpen3D }) => {
  const allBuildings = parcels.flatMap((p) =>
    p.buildings.map((b) => ({ ...b, parcel: p }))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-600 font-semibold uppercase">
            <span>Spatial Footprint Inventory</span>
            <span>·</span>
            <span>Vertical Structures</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Buildings & Multi-Floor Structures
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Registered 3D building envelopes with LiDAR height profiles and floor counts.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-mono uppercase text-[11px] border-b border-slate-200">
            <tr>
              <th className="px-6 py-3">Building ID</th>
              <th className="px-6 py-3">Structure Name</th>
              <th className="px-6 py-3">Parent Parcel</th>
              <th className="px-6 py-3">Height (LiDAR)</th>
              <th className="px-6 py-3">Floors</th>
              <th className="px-6 py-3">Units</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">3D Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {allBuildings.map((bld) => (
              <tr key={bld.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-6 py-3.5 font-mono font-semibold text-indigo-900">
                  {bld.id}
                </td>
                <td className="px-6 py-3.5 font-bold text-slate-900">
                  {bld.name}
                </td>
                <td className="px-6 py-3.5 font-mono text-slate-500">
                  {bld.parcel.id} ({bld.parcel.district})
                </td>
                <td className="px-6 py-3.5 font-mono font-semibold text-slate-800">
                  {bld.heightMeters} m
                </td>
                <td className="px-6 py-3.5 font-mono">
                  {bld.floorCount} Floors (G+{bld.floorCount - 1})
                </td>
                <td className="px-6 py-3.5 font-mono">
                  {bld.unitCount} Units
                </td>
                <td className="px-6 py-3.5">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold border ${
                      bld.status === 'Verified'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}
                  >
                    {bld.status}
                  </span>
                </td>
                <td className="px-6 py-3.5 text-right">
                  <button
                    onClick={() => onOpen3D(bld.parcel.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg text-xs transition-colors"
                  >
                    <Box className="w-3.5 h-3.5" />
                    <span>View 3D</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
