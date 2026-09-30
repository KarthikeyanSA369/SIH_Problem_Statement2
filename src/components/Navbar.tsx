import React, { useState, useRef, useEffect } from 'react';
import { Parcel, PropertyUnit } from '../types/property';
import {
  Search,
  Bell,
  HelpCircle,
  User,
  Box,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Command,
  X
} from 'lucide-react';

interface NavbarProps {
  parcels: Parcel[];
  onSelectSearchResult: (type: 'parcel' | 'unit', id: string, floorId?: string) => void;
  onOpenAiAnalysis: () => void;
  onOpenHelp?: () => void;
  onOpenGenerator?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  parcels,
  onSelectSearchResult,
  onOpenAiAnalysis,
  onOpenHelp,
  onOpenGenerator,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter parcels and units based on search query
  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return { parcels: [] as Parcel[], units: [] as { unit: PropertyUnit; parcel: Parcel }[] };
    }
    const q = searchQuery.toLowerCase();

    const matchedParcels = parcels.filter(
      (p) =>
        p.id.toLowerCase().includes(q) ||
        p.ulpin.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.district.toLowerCase().includes(q)
    );

    const matchedUnits: { unit: PropertyUnit; parcel: Parcel }[] = [];
    parcels.forEach((p) => {
      p.buildings.forEach((b) => {
        b.floors.forEach((f) => {
          f.units.forEach((u) => {
            if (
              u.ulpin.toLowerCase().includes(q) ||
              u.unitNumber.toLowerCase().includes(q) ||
              u.ownerName.toLowerCase().includes(q)
            ) {
              matchedUnits.push({ unit: u, parcel: p });
            }
          });
        });
      });
    });

    return { parcels: matchedParcels, units: matchedUnits.slice(0, 6) };
  }, [searchQuery, parcels]);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6 gap-4">
        {/* Zone 1: Brand & GovTech Badge */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shadow-indigo-200">
            <Box className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-slate-900">
                3D ULPIN
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                SIH 2026
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              Vertical Property Intelligence Platform
            </div>
          </div>
        </div>

        {/* Zone 2: Global Search Bar */}
        <div ref={searchRef} className="relative flex-1 max-w-xl mx-2">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Search ULPIN, Parcel ID, Building, Unit, Owner..."
              className="w-full pl-10 pr-10 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs text-slate-800 placeholder:text-slate-400 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Suggestions Dropdown */}
          {isSearchOpen && searchQuery.trim() && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden divide-y divide-slate-100 z-50 animate-in fade-in-50 duration-150">
              {searchResults.parcels.length === 0 && searchResults.units.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">
                  No property records found matching "{searchQuery}"
                </div>
              ) : (
                <>
                  {/* Parcels section */}
                  {searchResults.parcels.length > 0 && (
                    <div className="p-2">
                      <div className="px-3 py-1 text-[10px] font-mono uppercase font-bold text-slate-400">
                        Land Parcels ({searchResults.parcels.length})
                      </div>
                      {searchResults.parcels.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => {
                            onSelectSearchResult('parcel', p.id);
                            setIsSearchOpen(false);
                            setSearchQuery('');
                          }}
                          className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 cursor-pointer text-xs group"
                        >
                          <div>
                            <div className="font-semibold text-slate-900 group-hover:text-indigo-600">
                              {p.name}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              {p.ulpin} · {p.district}, {p.state}
                            </div>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                            {p.id}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Units section */}
                  {searchResults.units.length > 0 && (
                    <div className="p-2">
                      <div className="px-3 py-1 text-[10px] font-mono uppercase font-bold text-slate-400">
                        Vertical Property Units ({searchResults.units.length})
                      </div>
                      {searchResults.units.map(({ unit, parcel }) => (
                        <div
                          key={unit.id}
                          onClick={() => {
                            onSelectSearchResult('unit', unit.id, unit.floorId);
                            setIsSearchOpen(false);
                            setSearchQuery('');
                          }}
                          className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 cursor-pointer text-xs group"
                        >
                          <div>
                            <div className="font-semibold text-slate-900 group-hover:text-indigo-600">
                              Unit {unit.unitNumber} (Floor {unit.floorNumber})
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              {unit.ulpin} · Owner: {unit.ownerName}
                            </div>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              unit.status === 'Verified'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-red-50 text-red-700'
                            }`}
                          >
                            {unit.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Zone 3: Quick Action Buttons & User Profile */}
        <div className="flex items-center gap-2.5 shrink-0">
          {onOpenGenerator && (
            <button
              onClick={onOpenGenerator}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg shadow-2xs transition-all hover:scale-[1.02]"
              title="Input dimensions and generate custom 3D ULPIN"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Generate ULPIN</span>
            </button>
          )}

          <button
            onClick={onOpenAiAnalysis}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Analysis</span>
          </button>

          <button
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
          </button>

          <button
            onClick={onOpenHelp}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            title="Help / Workflow Guide"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-slate-200 mx-0.5" />

          {/* User Profile */}
          <div className="flex items-center gap-2 pl-1 cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center font-bold text-xs text-slate-700">
              KN
            </div>
            <div className="hidden xl:block text-left text-xs leading-tight">
              <div className="font-semibold text-slate-900">K. Natesan</div>
              <div className="text-[11px] text-slate-500">Revenue Officer</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
