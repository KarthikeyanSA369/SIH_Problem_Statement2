import React, { useState } from 'react';
import { Parcel, Building, PropertyUnit } from '../types/property';
import { Layers, Box, ShieldCheck, AlertTriangle, QrCode, Search } from 'lucide-react';

interface FloorsUnitsPageProps {
  parcel: Parcel;
  building: Building;
  onOpenUnit3D: (unitId: string, floorId: string) => void;
  onOpenUlpinDetails: (unit: PropertyUnit) => void;
}

export const FloorsUnitsPage: React.FC<FloorsUnitsPageProps> = ({
  parcel,
  building,
  onOpenUnit3D,
  onOpenUlpinDetails,
}) => {
  const [selectedFloorFilter, setSelectedFloorFilter] = useState<string>('all');

  const allUnits = building.floors.flatMap((f) =>
    f.units.map((u) => ({ ...u, floorName: f.name, floorElevation: f.elevationMeters }))
  );

  const filteredUnits = selectedFloorFilter === 'all'
    ? allUnits
    : allUnits.filter((u) => u.floorId === selectedFloorFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-600 font-semibold uppercase">
            <span>Vertical Property Schedule</span>
            <span>·</span>
            <span>Building BLD-123456</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Floors & Sub-Divided Units Schedule
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Complete registry of all 15 vertical units mapped to individual 3D ULPIN numbers.
          </p>
        </div>

        {/* Floor Filter */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
          <button
            onClick={() => setSelectedFloorFilter('all')}
            className={`px-3 py-1 font-medium rounded-md transition-colors ${
              selectedFloorFilter === 'all' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600'
            }`}
          >
            All Floors
          </button>
          {building.floors.map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFloorFilter(f.id)}
              className={`px-3 py-1 font-medium rounded-md transition-colors ${
                selectedFloorFilter === f.id ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600'
              }`}
            >
              {f.name}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-mono uppercase text-[11px] border-b border-slate-200">
            <tr>
              <th className="px-6 py-3">Unit</th>
              <th className="px-6 py-3">3D ULPIN</th>
              <th className="px-6 py-3">Floor Level</th>
              <th className="px-6 py-3">Area (sq.ft)</th>
              <th className="px-6 py-3">Property Type</th>
              <th className="px-6 py-3">Registered Owner</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredUnits.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-6 py-3.5 font-bold text-slate-900">
                  Unit {u.unitNumber}
                </td>
                <td className="px-6 py-3.5 font-mono text-indigo-900 font-semibold">
                  {u.ulpin}
                </td>
                <td className="px-6 py-3.5">
                  <span className="font-medium text-slate-900">{u.floorName}</span>
                  <span className="text-[10px] text-slate-400 font-mono block">({u.floorElevation}m AGL)</span>
                </td>
                <td className="px-6 py-3.5 font-mono font-bold text-slate-800">
                  {u.areaSqFt}
                </td>
                <td className="px-6 py-3.5">
                  {u.propertyType}
                </td>
                <td className="px-6 py-3.5 text-slate-800">
                  {u.ownerName}
                </td>
                <td className="px-6 py-3.5">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold border ${
                      u.status === 'Verified'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}
                  >
                    {u.status}
                  </span>
                </td>
                <td className="px-6 py-3.5 text-right space-x-2">
                  <button
                    onClick={() => onOpenUlpinDetails(u)}
                    className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"
                    title="View ULPIN Card"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onOpenUnit3D(u.id, u.floorId)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-md text-xs transition-colors"
                  >
                    <Box className="w-3.5 h-3.5" />
                    <span>3D</span>
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
