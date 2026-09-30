import React, { useState } from 'react';
import { Parcel } from '../types/property';
import {
  MapPin,
  Box,
  Map,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

interface ParcelsListPageProps {
  parcels: Parcel[];
  onOpen3D: (parcelId: string) => void;
  onOpenMap: (parcelId: string) => void;
}

export const ParcelsListPage: React.FC<ParcelsListPageProps> = ({
  parcels,
  onOpen3D,
  onOpenMap,
}) => {
  const [filterState, setFilterState] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  const filtered = parcels.filter((p) => {
    if (filterState !== 'all' && p.state !== filterState) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        p.id.toLowerCase().includes(q) ||
        p.ulpin.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.district.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-600 font-semibold uppercase">
            <span>Cadastral Master Registry</span>
            <span>·</span>
            <span>2D Land Parcels</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Land Parcels & Cadastre Records
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Registered 2D land parcels linked with vertical building footprints and ULPIN IDs.
          </p>
        </div>

        {/* Search & State Filter */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter parcels..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
            <button
              onClick={() => setFilterState('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filterState === 'all' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600'
              }`}
            >
              All States
            </button>
            <button
              onClick={() => setFilterState('Tamil Nadu')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filterState === 'Tamil Nadu' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600'
              }`}
            >
              Tamil Nadu
            </button>
            <button
              onClick={() => setFilterState('Karnataka')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filterState === 'Karnataka' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600'
              }`}
            >
              Karnataka
            </button>
            <button
              onClick={() => setFilterState('Maharashtra')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filterState === 'Maharashtra' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600'
              }`}
            >
              Maharashtra
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Parcels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((parcel) => (
          <div
            key={parcel.id}
            className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-mono text-indigo-600 font-semibold uppercase">
                    {parcel.id}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">{parcel.name}</h3>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    parcel.verificationStatus === 'Verified'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : parcel.verificationStatus === 'Conflict'
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {parcel.verificationStatus}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{parcel.location}, {parcel.district}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 my-4 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <div className="text-[10px] text-slate-400">Total Plot Area</div>
                  <div className="font-mono font-bold text-slate-900 mt-0.5">
                    {parcel.areaSqFt.toLocaleString()} sq.ft
                  </div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <div className="text-[10px] text-slate-400">Land Use</div>
                  <div className="font-semibold text-slate-900 mt-0.5">{parcel.landUse}</div>
                </div>
              </div>

              <div className="text-xs text-slate-600 space-y-1 font-mono">
                <div>Survey: {parcel.surveyNumber}</div>
                <div className="truncate text-slate-400 text-[11px]">{parcel.subRegistrarOffice}</div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => onOpenMap(parcel.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <Map className="w-3.5 h-3.5 text-slate-500" />
                <span>2D Map</span>
              </button>
              <button
                onClick={() => onOpen3D(parcel.id)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
              >
                <Box className="w-3.5 h-3.5" />
                <span>Open 3D Model</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
