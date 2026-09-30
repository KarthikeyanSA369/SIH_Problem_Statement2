import React, { useState } from 'react';
import { Parcel, Building, Floor, PropertyUnit } from '../types/property';
import { ThreePropertyViewer } from './ThreePropertyViewer';
import {
  ChevronRight,
  ChevronDown,
  Layers,
  Box,
  ShieldCheck,
  AlertTriangle,
  Building as BuildingIcon,
  MapPin,
  ExternalLink,
  Copy,
  Check,
  QrCode,
  FileText,
  Sliders,
  Sparkles,
  Info
} from 'lucide-react';

interface ThreePropertyPageProps {
  parcel: Parcel;
  building: Building;
  selectedFloorId: string | null;
  selectedUnitId: string | null;
  isExploded: boolean;
  isolateFloor: boolean;
  showBoundaries: boolean;
  onSelectFloor: (floorId: string | null) => void;
  onSelectUnit: (unitId: string | null, floorId?: string) => void;
  onToggleExplode: () => void;
  onToggleIsolate: () => void;
  onToggleBoundaries: () => void;
  onOpenUlpinDetails: (unit: PropertyUnit) => void;
  onNavigateToValidation: () => void;
  onNavigateToEvidence: () => void;
  onRunAiAnalysis?: () => void;
}

export const ThreePropertyPage: React.FC<ThreePropertyPageProps> = ({
  parcel,
  building,
  selectedFloorId,
  selectedUnitId,
  isExploded,
  isolateFloor,
  showBoundaries,
  onSelectFloor,
  onSelectUnit,
  onToggleExplode,
  onToggleIsolate,
  onToggleBoundaries,
  onOpenUlpinDetails,
  onNavigateToValidation,
  onNavigateToEvidence,
  onRunAiAnalysis,
}) => {
  const [expandedFloors, setExpandedFloors] = useState<Record<string, boolean>>({
    F03: true,
    F01: true,
  });
  const [copiedUlpin, setCopiedUlpin] = useState(false);

  const toggleFloorExpand = (floorId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedFloors((prev) => ({ ...prev, [floorId]: !prev[floorId] }));
  };

  // Find active floor and unit objects
  const activeFloor = building.floors.find((f) => f.id === selectedFloorId) || null;
  const activeUnit =
    building.floors
      .flatMap((f) => f.units)
      .find((u) => u.id === selectedUnitId) || null;

  const handleCopyUlpin = (ulpin: string) => {
    navigator.clipboard.writeText(ulpin);
    setCopiedUlpin(true);
    setTimeout(() => setCopiedUlpin(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full gap-4">
      {/* Top Breadcrumb Bar */}
      <div className="flex items-center justify-between px-1 text-xs">
        <div className="flex items-center gap-2 text-slate-500 font-mono">
          <span className="font-semibold text-slate-900">{parcel.id}</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-slate-900">{building.name}</span>
          {activeFloor && (
            <>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-indigo-600 font-bold">{activeFloor.name}</span>
            </>
          )}
          {activeUnit && (
            <>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-indigo-600 font-bold">Unit {activeUnit.unitNumber}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-mono">ULPIN:</span>
          <span className="font-mono font-semibold text-slate-900">
            {activeUnit ? activeUnit.ulpin : parcel.ulpin}
          </span>
          <button
            onClick={() => handleCopyUlpin(activeUnit ? activeUnit.ulpin : parcel.ulpin)}
            className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
            title="Copy ULPIN"
          >
            {copiedUlpin ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main 3-Column Layout: Navigator, 3D Canvas, Details Drawer */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[560px]">
        {/* LEFT COLUMN (2.5 / 12): Vertical Cadastral Tree Navigator */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col justify-between overflow-y-auto max-h-[720px]">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wide">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>Property Hierarchy</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">G+4 Levels</span>
            </div>

            {/* Tree root: Parcel */}
            <div className="mt-3 space-y-1">
              <div
                onClick={() => {
                  onSelectFloor(null);
                  onSelectUnit(null);
                }}
                className={`p-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center justify-between ${
                  !selectedFloorId && !selectedUnitId
                    ? 'bg-indigo-50 text-indigo-900 border border-indigo-200'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="truncate">{parcel.name}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Plot</span>
              </div>

              {/* Floors List (Reverse ordered top-to-bottom) */}
              <div className="pl-3 border-l-2 border-slate-100 ml-2 mt-1 space-y-1">
                {[...building.floors].reverse().map((floor) => {
                  const isSelected = selectedFloorId === floor.id;
                  const isExpanded = expandedFloors[floor.id] ?? false;

                  return (
                    <div key={floor.id} className="space-y-0.5">
                      {/* Floor Row */}
                      <div
                        onClick={() => {
                          onSelectFloor(floor.id);
                          onSelectUnit(null);
                        }}
                        className={`p-2 rounded-lg text-xs cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-indigo-600 text-white font-bold shadow-xs'
                            : 'text-slate-800 hover:bg-slate-100 font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => toggleFloorExpand(floor.id, e)}
                            className="p-0.5 hover:opacity-75"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <span>{floor.name}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          {floor.conflictCount > 0 && (
                            <span
                              className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                isSelected ? 'bg-red-500 text-white' : 'bg-red-100 text-red-700'
                              }`}
                            >
                              1 Conflict
                            </span>
                          )}
                          <span
                            className={`text-[10px] font-mono ${
                              isSelected ? 'text-indigo-200' : 'text-slate-400'
                            }`}
                          >
                            {floor.units.length}U
                          </span>
                        </div>
                      </div>

                      {/* Units within floor */}
                      {isExpanded && (
                        <div className="pl-5 space-y-0.5 py-0.5">
                          {floor.units.map((unit) => {
                            const isUnitSelected = selectedUnitId === unit.id;
                            const isConflict = unit.status === 'Conflict';

                            return (
                              <div
                                key={unit.id}
                                onClick={() => {
                                  onSelectFloor(floor.id);
                                  onSelectUnit(unit.id, floor.id);
                                }}
                                className={`px-2.5 py-1.5 rounded-md text-xs cursor-pointer transition-colors flex items-center justify-between ${
                                  isUnitSelected
                                    ? 'bg-indigo-100 text-indigo-900 font-bold border border-indigo-300'
                                    : 'text-slate-600 hover:bg-slate-50'
                                }`}
                              >
                                <div className="flex items-center gap-1.5">
                                  <div
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      isConflict
                                        ? 'bg-red-500'
                                        : isUnitSelected
                                        ? 'bg-indigo-600'
                                        : 'bg-emerald-500'
                                    }`}
                                  />
                                  <span>Unit {unit.unitNumber}</span>
                                </div>
                                <span className="text-[10px] font-mono text-slate-400">
                                  {unit.areaSqFt} sq.ft
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Helper at bottom of navigator */}
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
            <div className="font-semibold text-slate-700">GIS Interaction Tip</div>
            <p className="leading-snug">
              Click individual 3D units directly in the viewport or use the hierarchy tree to inspect property deeds.
            </p>
          </div>
        </div>

        {/* CENTER COLUMN (6 / 12): Three.js Spatial 3D Canvas */}
        <div className="lg:col-span-6 h-full flex flex-col">
          <ThreePropertyViewer
            building={building}
            selectedFloorId={selectedFloorId}
            selectedUnitId={selectedUnitId}
            isExploded={isExploded}
            isolateFloor={isolateFloor}
            showBoundaries={showBoundaries}
            onSelectFloor={onSelectFloor}
            onSelectUnit={onSelectUnit}
            onToggleExplode={onToggleExplode}
            onToggleIsolate={onToggleIsolate}
            onToggleBoundaries={onToggleBoundaries}
            onRunAiAnalysis={onRunAiAnalysis}
          />
        </div>

        {/* RIGHT COLUMN (3 / 12): Detailed Property / Floor / Unit Inspector */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col justify-between overflow-y-auto max-h-[720px]">
          {/* Case 1: Unit Selected */}
          {activeUnit ? (
            <div className="space-y-4">
              {/* Unit Header */}
              <div className="pb-3 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-semibold uppercase text-indigo-600">
                    Floor {activeUnit.floorNumber} · Vertical Unit
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      activeUnit.status === 'Verified'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    {activeUnit.status}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mt-1">
                  Unit {activeUnit.unitNumber}
                </h2>
                <div className="font-mono text-xs text-slate-500 break-all mt-1 bg-slate-50 p-2 rounded border border-slate-100">
                  {activeUnit.ulpin}
                </div>
              </div>

              {/* Conflict Box if unit is Unit 302 */}
              {activeUnit.conflictDetails && (
                <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-xs text-red-800 space-y-1.5">
                  <div className="font-bold flex items-center gap-1.5 text-red-700">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Spatial Boundary Conflict</span>
                  </div>
                  <p className="text-[11px] text-red-700 leading-tight">
                    {activeUnit.conflictDetails.issue}
                  </p>
                  <div className="flex items-center justify-between pt-1 text-[10px] font-mono">
                    <span>Tolerance: +42 cm</span>
                    <button
                      onClick={onNavigateToEvidence}
                      className="font-bold underline text-red-800 hover:text-red-950"
                    >
                      View Sensor Evidence
                    </button>
                  </div>
                </div>
              )}

              {/* Unit Properties */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Super Built-up Area:</span>
                  <span className="font-mono font-bold text-slate-900">{activeUnit.areaSqFt} sq.ft</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Property Use:</span>
                  <span className="font-semibold text-slate-900">{activeUnit.propertyType}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Registered Owner:</span>
                  <span className="font-medium text-slate-900 text-right truncate max-w-[150px]">
                    {activeUnit.ownerName}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Registration Deed:</span>
                  <span className="font-mono text-slate-900">{activeUnit.deedNumber}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Boundary Extents:</span>
                  <span className="font-mono text-slate-900">
                    {activeUnit.size[0]}m × {activeUnit.size[2]}m
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Record Match:</span>
                  <span className="text-emerald-600 font-semibold">{activeUnit.recordStatus}</span>
                </div>
              </div>

              {/* Action Buttons for Unit */}
              <div className="pt-2 space-y-2">
                <button
                  onClick={() => onOpenUlpinDetails(activeUnit)}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>View 3D ULPIN Identity Card</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={onNavigateToEvidence}
                    className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium rounded-lg text-center transition-colors"
                  >
                    View Evidence
                  </button>
                  <button
                    onClick={onNavigateToValidation}
                    className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium rounded-lg text-center transition-colors"
                  >
                    Run Validation
                  </button>
                </div>
              </div>
            </div>
          ) : activeFloor ? (
            /* Case 2: Floor Selected */
            <div className="space-y-4">
              <div className="pb-3 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-semibold uppercase text-indigo-600">
                    Vertical Level
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      activeFloor.conflictCount > 0
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {activeFloor.status}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mt-1">{activeFloor.name}</h2>
                <div className="text-xs text-slate-500 mt-0.5">
                  Elevation: <strong className="font-mono text-slate-800">{activeFloor.elevationMeters}m AGL</strong>
                </div>
              </div>

              {/* Floor stats */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-slate-400 text-[10px]">Floor Plate Area</div>
                  <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                    {activeFloor.areaSqFt} sq.ft
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-slate-400 text-[10px]">Total Units</div>
                  <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                    {activeFloor.units.length} Units
                  </div>
                </div>
              </div>

              {/* Units summary list */}
              <div>
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Units on this Floor
                </div>
                <div className="space-y-1.5">
                  {activeFloor.units.map((u) => (
                    <div
                      key={u.id}
                      onClick={() => onSelectUnit(u.id, activeFloor.id)}
                      className="p-2 bg-slate-50 hover:bg-indigo-50 rounded-lg border border-slate-100 hover:border-indigo-200 cursor-pointer text-xs flex items-center justify-between transition-colors"
                    >
                      <div>
                        <div className="font-semibold text-slate-900">Unit {u.unitNumber}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{u.areaSqFt} sq.ft · {u.propertyType}</div>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          u.status === 'Verified'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {u.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={onToggleIsolate}
                className="w-full py-2 px-3 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors"
              >
                {isolateFloor ? 'Disable Floor Isolation' : 'Isolate This Floor in 3D'}
              </button>
            </div>
          ) : (
            /* Case 3: Entire Building / Parcel Overview */
            <div className="space-y-4">
              <div className="pb-3 border-b border-slate-100">
                <span className="text-[11px] font-mono font-semibold uppercase text-indigo-600">
                  Building Information
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-1">{building.name}</h2>
                <div className="text-xs text-slate-500 mt-0.5">
                  Parcel: <span className="font-mono text-slate-800">{parcel.id}</span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Total Height:</span>
                  <span className="font-mono font-bold text-slate-900">{building.heightMeters} m</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Floor Count:</span>
                  <span className="font-mono font-bold text-slate-900">{building.floorCount} Floors (G+4)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Total Units:</span>
                  <span className="font-mono font-bold text-slate-900">{building.unitCount} Units</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Footprint Area:</span>
                  <span className="font-mono font-bold text-slate-900">{building.footprintAreaSqFt} sq.ft</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Parcel Land Use:</span>
                  <span className="font-semibold text-slate-900">{parcel.landUse}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Town Survey No:</span>
                  <span className="text-slate-900 font-medium">{parcel.surveyNumber}</span>
                </div>
              </div>

              <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-100 text-xs space-y-1">
                <div className="font-semibold text-indigo-900">Vertical Exploded View</div>
                <p className="text-slate-600 text-[11px]">
                  Click "Explode Floors" on the top control bar to inspect internal floor slabs and sub-divided units.
                </p>
                <button
                  onClick={onToggleExplode}
                  className="mt-2 w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  {isExploded ? 'Collapse Floors' : 'Explode Floors Now'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
