import React, { useState } from 'react';
import { Parcel, Building, Floor, PropertyUnit } from '../types/property';
import { ThreePropertyViewer } from './ThreePropertyViewer';
import { GisMapViewer } from './GisMapViewer';
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Box,
  MapPin,
  Building2,
  Copy,
  Check,
  QrCode,
  FileText,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Compass,
  Eye,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  X,
  ExternalLink,
  ChevronRight,
  Info,
  Sliders,
  CheckCheck,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface PropertiesWorkspaceProps {
  parcels: Parcel[];
  selectedParcelId: string;
  selectedFloorId: string | null;
  selectedUnitId: string | null;
  onSelectParcel: (parcelId: string) => void;
  onSelectFloor: (floorId: string | null) => void;
  onSelectUnit: (unitId: string | null, floorId?: string) => void;
  onOpenUlpinModal: (unit: PropertyUnit) => void;
  onOpenReportModal?: () => void;
  onOpenGenerator?: () => void;
  // External demo mode triggers
  validationDrawerOpen?: boolean;
  onToggleValidationDrawer?: (open: boolean) => void;
  evidenceDrawerOpen?: boolean;
  onToggleEvidenceDrawer?: (open: boolean) => void;
}

export const PropertiesWorkspace: React.FC<PropertiesWorkspaceProps> = ({
  parcels,
  selectedParcelId,
  selectedFloorId,
  selectedUnitId,
  onSelectParcel,
  onSelectFloor,
  onSelectUnit,
  onOpenUlpinModal,
  onOpenReportModal,
  onOpenGenerator,
  validationDrawerOpen: controlledValidationOpen,
  onToggleValidationDrawer,
  evidenceDrawerOpen: controlledEvidenceOpen,
  onToggleEvidenceDrawer,
}) => {
  // View mode: 3D View (default) or 2D Map
  const [viewMode, setViewMode] = useState<'3d' | 'map'>('3d');

  // Search & Filter for Left Property List
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'review' | 'conflict'>('all');

  // 3D Controls State
  const [isExploded, setIsExploded] = useState(false);
  const [isolateFloor, setIsolateFloor] = useState(false);
  const [showBoundaries, setShowBoundaries] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  const [zoomSignal, setZoomSignal] = useState(0);
  const [resetSignal, setResetSignal] = useState(0);

  // First-time instruction hint
  const [showHint, setShowHint] = useState(true);

  // Copy toast state
  const [copiedUlpin, setCopiedUlpin] = useState(false);

  // Fullscreen 3D View mode
  const [isViewerFullscreen, setIsViewerFullscreen] = useState(false);

  // Escape key listener to exit fullscreen
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isViewerFullscreen) {
        setIsViewerFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isViewerFullscreen]);

  // Local drawer states (fallback if not controlled)
  const [localValidationOpen, setLocalValidationOpen] = useState(false);
  const [localEvidenceOpen, setLocalEvidenceOpen] = useState(false);

  const isValidationOpen = controlledValidationOpen ?? localValidationOpen;
  const isEvidenceOpen = controlledEvidenceOpen ?? localEvidenceOpen;

  const setValidationOpen = (open: boolean) => {
    if (onToggleValidationDrawer) onToggleValidationDrawer(open);
    else setLocalValidationOpen(open);
  };

  const setEvidenceOpen = (open: boolean) => {
    if (onToggleEvidenceDrawer) onToggleEvidenceDrawer(open);
    else setLocalEvidenceOpen(open);
  };

  // Find active Parcel, Building, Floor, and Unit
  const currentParcel = parcels.find((p) => p.id === selectedParcelId) || parcels[0];
  const currentBuilding = currentParcel?.buildings[0] || parcels[0].buildings[0];
  const activeFloor = currentBuilding.floors.find((f) => f.id === selectedFloorId) || null;
  const activeUnit = currentBuilding.floors
    .flatMap((f) => f.units)
    .find((u) => u.id === selectedUnitId) || null;

  // Filter properties
  const filteredParcels = parcels.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      p.ulpin.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (statusFilter === 'verified') return p.verificationStatus === 'Verified';
    if (statusFilter === 'conflict') return p.verificationStatus === 'Conflict';
    if (statusFilter === 'review') return p.verificationStatus === 'Under Review' || p.verificationStatus === 'Partially Verified';
    return true;
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUlpin(true);
    setTimeout(() => setCopiedUlpin(false), 2000);
  };

  // Step indicator calculation (1 to 6)
  const getActiveStep = () => {
    if (isValidationOpen || isEvidenceOpen) return 6;
    if (activeUnit) return 5; // Unit selected -> viewing ULPIN
    if (activeFloor) return 3; // Floor selected
    if (currentBuilding) return 2; // Building selected
    return 1; // Parcel selected
  };
  const activeStep = getActiveStep();

  // Floor buttons reverse order: Top floor (F4) down to GF
  const sortedFloors = [...currentBuilding.floors].reverse();

  return (
    <div className="flex-1 flex flex-col h-full gap-3 overflow-hidden">
      {/* 1. TOP STEP INDICATOR: 1 Parcel → 2 Building → 3 Floor → 4 Unit → 5 ULPIN → 6 Validate */}
      {!isViewerFullscreen && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs px-4 py-2.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-3 overflow-x-auto no-scrollbar w-full">
            {[
              { step: 1, label: 'Parcel', sub: currentParcel.id },
              { step: 2, label: 'Building', sub: currentBuilding.name.split(' ')[0] },
              { step: 3, label: 'Floor', sub: activeFloor ? activeFloor.name : 'Select floor' },
              { step: 4, label: 'Unit', sub: activeUnit ? `Unit ${activeUnit.unitNumber}` : 'Select unit' },
              { step: 5, label: 'ULPIN', sub: activeUnit ? 'Mapped' : 'Pending' },
              { step: 6, label: 'Validate', sub: isValidationOpen ? 'In Review' : 'Check status' },
            ].map((item, idx, arr) => {
              const isCompleted = activeStep > item.step;
              const isCurrent = activeStep === item.step;

              return (
                <React.Fragment key={item.step}>
                  <button
                    onClick={() => {
                      if (item.step === 1) {
                        onSelectFloor(null);
                        onSelectUnit(null);
                        setValidationOpen(false);
                        setEvidenceOpen(false);
                      } else if (item.step === 2) {
                        onSelectFloor(null);
                        onSelectUnit(null);
                      } else if (item.step === 3 && !activeFloor) {
                        onSelectFloor('F03');
                      } else if (item.step === 4 && !activeUnit) {
                        onSelectFloor('F03');
                        onSelectUnit('U02', 'F03');
                      } else if (item.step === 5 && activeUnit) {
                        onOpenUlpinModal(activeUnit);
                      } else if (item.step === 6) {
                        setValidationOpen(true);
                      }
                    }}
                    className={`flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs transition-all shrink-0 ${
                      isCurrent
                        ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200'
                        : isCompleted
                        ? 'text-slate-700 hover:bg-slate-50 font-medium'
                        : 'text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-500 text-white'
                          : isCurrent
                          ? 'bg-indigo-600 text-white ring-2 ring-indigo-200'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {isCompleted ? <Check className="w-3 h-3" /> : item.step}
                    </span>
                    <div className="flex flex-col text-left leading-tight">
                      <span className="text-[11px] font-semibold">{item.label}</span>
                      <span className="text-[9px] opacity-75 font-mono truncate max-w-[80px]">
                        {item.sub}
                      </span>
                    </div>
                  </button>

                  {idx < arr.length - 1 && (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Quick Help Link */}
          <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-slate-200 text-xs shrink-0">
            <span className="text-slate-400 text-[11px]">Workflow:</span>
            <span className="font-semibold text-slate-700 text-[11px]">2D → 3D → Unit ULPIN</span>
          </div>
        </div>
      )}

      {/* 2. MAIN 3-PANEL CONNECTED WORKSPACE */}
      <div className={`flex-1 grid grid-cols-1 ${isViewerFullscreen ? 'lg:grid-cols-1' : 'lg:grid-cols-12'} gap-3 min-h-0 overflow-hidden`}>
        {/* ======================================================== */}
        {/* LEFT COLUMN (3/12): Simple Property List & Search        */}
        {/* ======================================================== */}
        {!isViewerFullscreen && (
          <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 shadow-2xs p-3 flex flex-col min-h-0 overflow-hidden">
          {/* Header with Title & Input Generator Button */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Cadastral Registry
            </span>
            {onOpenGenerator && (
              <button
                onClick={onOpenGenerator}
                className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-lg border border-indigo-200 transition-colors"
                title="Input your own dimensions to calculate area and generate 3D ULPIN"
              >
                <span>+ Custom Input</span>
              </button>
            )}
          </div>

          {/* Search Box */}
          <div className="relative mb-2.5">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search property, Parcel ID or ULPIN..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white text-slate-800 placeholder-slate-400"
            />
          </div>

          {/* Simple Status Filter Tabs */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-lg text-[11px] font-semibold mb-2.5 shrink-0">
            {(['all', 'verified', 'review', 'conflict'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`py-1 rounded capitalize transition-all text-center truncate ${
                  statusFilter === filter
                    ? 'bg-white text-indigo-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {filter === 'all' ? 'All' : filter}
              </button>
            ))}
          </div>

          {/* Property List */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
            {filteredParcels.map((p) => {
              const isSelected = p.id === selectedParcelId;
              const isConflict = p.verificationStatus === 'Conflict';
              const isVerified = p.verificationStatus === 'Verified';

              return (
                <div
                  key={p.id}
                  onClick={() => {
                    onSelectParcel(p.id);
                    onSelectFloor(null);
                    onSelectUnit(null);
                    setShowHint(false);
                  }}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-50/80 border-indigo-300 shadow-xs ring-1 ring-indigo-200'
                      : 'bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-slate-900 truncate flex items-center gap-1.5">
                        <Building2 className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                        <span className="truncate">{p.name}</span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                        {p.id}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 flex items-center gap-1 ${
                        isVerified
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : isConflict
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {isVerified ? (
                        <Check className="w-2.5 h-2.5" />
                      ) : isConflict ? (
                        <AlertTriangle className="w-2.5 h-2.5" />
                      ) : (
                        <span>⚠</span>
                      )}
                      <span>{p.verificationStatus}</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-2 pt-1.5 border-t border-slate-100/70">
                    <span className="truncate max-w-[150px]">{p.ulpin}</span>
                    <span className="text-slate-500 font-semibold">{p.buildings[0]?.floorCount || 1}F · {p.buildings[0]?.unitCount || 1}U</span>
                  </div>
                </div>
              );
            })}

            {filteredParcels.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-400">
                No matching properties found.
              </div>
            )}
          </div>
        </div>
        )}

        {/* ======================================================== */}
        {/* CENTER COLUMN: Main 3D / 2D Visualization Area          */}
        {/* ======================================================== */}
        <div className={`${isViewerFullscreen ? 'lg:col-span-1 h-full' : 'lg:col-span-6'} bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col min-h-0 overflow-hidden relative`}>
          {/* Top Control Bar: Mode Toggle [ 2D MAP ] [ 3D VIEW ] + Clean Toolbar */}
          <div className="p-2.5 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-2 shrink-0 z-10">
            {/* View Mode Switcher */}
            <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200">
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-md transition-all ${
                  viewMode === 'map'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>2D MAP</span>
              </button>
              <button
                onClick={() => setViewMode('3d')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-md transition-all ${
                  viewMode === '3d'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Box className="w-3.5 h-3.5" />
                <span>3D VIEW</span>
              </button>
            </div>

            {/* Property Headline Badge */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-800">
              <span className="font-bold text-slate-900">{currentBuilding.name}</span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-500">{currentBuilding.floorCount} Floors</span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-500">{currentBuilding.unitCount} Units</span>
            </div>

            {/* Clean 3D Toolbar: Rotate, Zoom+, Zoom-, Reset, Explode, Units */}
            {viewMode === '3d' && (
              <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
                <button
                  onClick={() => setAutoRotate(!autoRotate)}
                  className={`p-1.5 rounded-md transition-colors ${
                    autoRotate ? 'bg-indigo-100 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                  title="↻ Toggle Auto-Rotate"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setZoomSignal((prev) => prev + 1)}
                  className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-md transition-colors"
                  title="＋ Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setZoomSignal((prev) => prev - 1)}
                  className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-md transition-colors"
                  title="− Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => {
                    setResetSignal((prev) => prev + 1);
                    onSelectFloor(null);
                    onSelectUnit(null);
                    setIsExploded(false);
                    setIsolateFloor(false);
                  }}
                  className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-md transition-colors"
                  title="⌂ Reset Camera"
                >
                  <Compass className="w-3.5 h-3.5" />
                </button>

                <div className="w-px h-3.5 bg-slate-200 mx-0.5" />

                {/* Explode Floors Toggle */}
                <button
                  onClick={() => setIsExploded(!isExploded)}
                  className={`flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-md transition-all ${
                    isExploded
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                  title="▱ Separate floor plates vertically"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">{isExploded ? 'Collapse' : 'Explode'}</span>
                </button>

                {/* Toggle Boundaries */}
                <button
                  onClick={() => setShowBoundaries(!showBoundaries)}
                  className={`p-1.5 rounded-md transition-colors ${
                    showBoundaries ? 'bg-indigo-50 text-indigo-700' : 'text-slate-400 hover:bg-slate-200'
                  }`}
                  title="□ Toggle Unit Boundaries"
                >
                  <Box className="w-3.5 h-3.5" />
                </button>

                <div className="w-px h-3.5 bg-slate-200 mx-0.5" />

                {/* Fullscreen 3D View Toggle */}
                <button
                  onClick={() => setIsViewerFullscreen(!isViewerFullscreen)}
                  className={`p-1.5 rounded-md transition-all flex items-center gap-1 ${
                    isViewerFullscreen
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-200'
                  }`}
                  title={isViewerFullscreen ? 'Exit Full Screen (Esc)' : 'Expand to Full Screen'}
                >
                  {isViewerFullscreen ? (
                    <Minimize2 className="w-3.5 h-3.5" />
                  ) : (
                    <Maximize2 className="w-3.5 h-3.5" />
                  )}
                  <span className="hidden xl:inline text-[11px] font-bold">
                    {isViewerFullscreen ? 'Exit' : 'Full Screen'}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Center Visualization Canvas */}
          <div className="flex-1 relative min-h-0 overflow-hidden bg-slate-50">
            {viewMode === '3d' ? (
              <>
                <ThreePropertyViewer
                  building={currentBuilding}
                  selectedFloorId={selectedFloorId}
                  selectedUnitId={selectedUnitId}
                  isExploded={isExploded}
                  isolateFloor={isolateFloor}
                  showBoundaries={showBoundaries}
                  onSelectFloor={(flId) => {
                    onSelectFloor(flId);
                    setShowHint(false);
                  }}
                  onSelectUnit={(uId, flId) => {
                    onSelectUnit(uId, flId);
                    setShowHint(false);
                  }}
                  onToggleExplode={() => setIsExploded(!isExploded)}
                  onToggleIsolate={() => setIsolateFloor(!isolateFloor)}
                  onToggleBoundaries={() => setShowBoundaries(!showBoundaries)}
                  hideTopBar={true}
                  autoRotate={autoRotate}
                  zoomSignal={zoomSignal}
                  resetSignal={resetSignal}
                />

                {/* First-time Interaction Hint (Disappears after first click) */}
                {showHint && (
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-slate-900/85 backdrop-blur-md px-3 py-1 rounded-full border border-slate-700/60 shadow-md text-[11px] font-medium text-slate-200 flex items-center gap-2 transition-all">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                    <span>Click any floor or unit to inspect vertical geometry</span>
                    <button
                      onClick={() => setShowHint(false)}
                      className="ml-0.5 p-0.5 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white"
                      title="Dismiss hint"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* Vertical Floor Selector Beside Building: F5, F4, F3, F2, F1, GF */}
                <div className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-1.5 p-1 bg-white/90 backdrop-blur-md rounded-xl border border-slate-200 shadow-sm">
                  <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 text-center py-0.5">
                    Floor
                  </div>
                  {sortedFloors.map((fl) => {
                    const isSelected = selectedFloorId === fl.id;
                    const hasConflict = fl.conflictCount > 0;
                    const floorLabel = fl.floorNumber === 0 ? 'GF' : `F${fl.floorNumber}`;

                    return (
                      <button
                        key={fl.id}
                        onClick={() => {
                          onSelectFloor(fl.id);
                          onSelectUnit(null);
                          setShowHint(false);
                        }}
                        className={`w-9 h-8 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center relative ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-xs scale-105 ring-2 ring-indigo-200'
                            : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                        }`}
                        title={`${fl.name} (${fl.units.length} Units)`}
                      >
                        <span>{floorLabel}</span>
                        {hasConflict && (
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 absolute top-1 right-1" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Horizontal Unit Selector Bar (When a floor is selected) */}
                {activeFloor && (
                  <div className="absolute bottom-9 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 p-1.5 bg-white/95 backdrop-blur-md rounded-xl border border-slate-200/90 shadow-md">
                    <span className="text-xs font-bold text-slate-800 uppercase px-2 border-r border-slate-200">
                      {activeFloor.name}:
                    </span>
                    <div className="flex items-center gap-1.5">
                      {activeFloor.units.map((u) => {
                        const isUnitSelected = selectedUnitId === u.id;
                        const isConflict = u.status === 'Conflict';
                        return (
                          <button
                            key={u.id}
                            onClick={() => {
                              onSelectUnit(u.id, activeFloor.id);
                              setShowHint(false);
                            }}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                              isUnitSelected
                                ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-200'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            <span>Unit {u.unitNumber}</span>
                            <span className={isConflict ? 'text-red-500 font-bold' : 'text-emerald-500 font-bold'}>
                              {isConflict ? '⚠' : '✓'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Fullscreen Floating Mini HUD for Active Unit / ULPIN */}
                {isViewerFullscreen && activeUnit && (
                  <div className="absolute top-4 right-4 z-20 w-80 bg-white/95 backdrop-blur-md rounded-xl border border-slate-200 p-3 shadow-lg animate-in fade-in slide-in-from-top-2 duration-150 space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-xs font-bold text-slate-900">Unit {activeUnit.unitNumber} ({activeFloor?.name})</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        activeUnit.status === 'Verified' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {activeUnit.status}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 font-mono text-xs font-bold text-indigo-900 break-all flex items-center justify-between gap-1">
                      <span>{activeUnit.ulpin}</span>
                      <button
                        onClick={() => handleCopy(activeUnit.ulpin)}
                        className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-800 shrink-0"
                        title="Copy ULPIN"
                      >
                        {copiedUlpin ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                      <span>Area: <strong className="text-slate-800 font-mono">{activeUnit.areaSqFt} sq.ft</strong></span>
                      <button
                        onClick={() => onOpenUlpinModal(activeUnit)}
                        className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline"
                      >
                        View Smart Record →
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* 2D GIS Map Mode */
              <div className="w-full h-full">
                <GisMapViewer
                  parcels={parcels}
                  selectedParcelId={selectedParcelId}
                  onSelectParcel={(pId) => {
                    onSelectParcel(pId);
                    onSelectFloor(null);
                    onSelectUnit(null);
                  }}
                  onOpen3DProperty={(pId) => {
                    onSelectParcel(pId);
                    setViewMode('3d');
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN (3/12): Dynamic Contextual Property Panel   */}
        {/* ======================================================== */}
        {!isViewerFullscreen && (
          <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 shadow-2xs p-3.5 flex flex-col justify-between min-h-0 overflow-hidden relative">
          {/* Scrollable details content */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-3.5 custom-scrollbar">
            {/* LEVEL 3: UNIT SELECTED (Most Granular) */}
            {activeUnit ? (
              <div className="space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Unit Details
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      activeUnit.status === 'Verified'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    {activeUnit.status === 'Verified' ? '✓ Verified' : '⚠ Review Required'}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Unit {activeUnit.unitNumber}
                  </h3>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {activeFloor?.name} · {currentBuilding.name}
                  </div>
                </div>

                {/* PROMINENT ULPIN BOX */}
                <div className="p-3 bg-gradient-to-br from-indigo-50/80 via-white to-blue-50/80 rounded-xl border border-indigo-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1">
                      <QrCode className="w-3 h-3 text-indigo-600" />
                      <span>Vertical 3D ULPIN</span>
                    </span>
                    <span className="text-[10px] font-mono text-indigo-600 bg-indigo-100/70 px-1.5 py-0.2 rounded font-bold">
                      14-DIGIT PIN
                    </span>
                  </div>

                  <div className="font-mono font-bold text-xs text-slate-900 break-all bg-white p-2 rounded-lg border border-indigo-100 flex items-center justify-between">
                    <span>{activeUnit.ulpin}</span>
                    <button
                      onClick={() => handleCopy(activeUnit.ulpin)}
                      className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-900 transition-colors"
                      title="Copy ULPIN"
                    >
                      {copiedUlpin ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <button
                    onClick={() => onOpenUlpinModal(activeUnit)}
                    className="w-full py-1.5 px-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Full Smart Record</span>
                  </button>
                </div>

                {/* Spatial Specs */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-400 text-[10px] block">Super Built-up Area</span>
                    <span className="font-bold text-slate-900 font-mono text-sm">{activeUnit.areaSqFt}</span>
                    <span className="text-slate-400 text-[10px]"> sq.ft</span>
                  </div>

                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-400 text-[10px] block">Property Type</span>
                    <span className="font-bold text-slate-900 text-xs">{activeUnit.propertyType}</span>
                  </div>

                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 col-span-2">
                    <span className="text-slate-400 text-[10px] block">Registered Owner</span>
                    <span className="font-bold text-slate-900 text-xs">{activeUnit.ownerName}</span>
                    <span className="text-slate-400 text-[10px] block mt-0.5 font-mono">{activeUnit.deedNumber}</span>
                  </div>
                </div>

                {/* Conflict Callout (If conflict exists) */}
                {activeUnit.conflictDetails && (
                  <div className="p-2.5 bg-red-50/80 border border-red-200 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-red-700 font-bold text-xs">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>Spatial Conflict Detected</span>
                    </div>
                    <p className="text-[11px] text-red-600 leading-snug">
                      {activeUnit.conflictDetails.issue}
                    </p>
                    <div className="flex items-center gap-2 pt-1 text-[10px] font-mono text-red-700">
                      <span>Risk: {activeUnit.conflictDetails.riskLevel}</span>
                      <span>·</span>
                      <span>Tolerance: +{activeUnit.conflictDetails.toleranceExceededCm}cm</span>
                    </div>
                  </div>
                )}
              </div>
            ) : activeFloor ? (
              /* LEVEL 2: FLOOR SELECTED */
              <div className="space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Floor Details
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-500">
                    Elev: {activeFloor.elevationMeters}m
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {activeFloor.name}
                  </h3>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {currentBuilding.name} · {activeFloor.units.length} Units Mapped
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-400 text-[10px] block">Floor Area</span>
                    <span className="font-bold text-slate-900 font-mono text-sm">{activeFloor.areaSqFt}</span>
                    <span className="text-slate-400 text-[10px]"> sq.ft</span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-400 text-[10px] block">Verification</span>
                    <div className="flex items-center gap-1.5 font-bold text-xs mt-1">
                      <span className="text-emerald-600">{activeFloor.verifiedUnitsCount} ✓</span>
                      <span className="text-slate-300">|</span>
                      <span className={activeFloor.conflictCount > 0 ? 'text-red-600' : 'text-slate-500'}>
                        {activeFloor.conflictCount} ⚠
                      </span>
                    </div>
                  </div>
                </div>

                {/* Units on this floor */}
                <div>
                  <div className="text-xs font-bold text-slate-700 mb-1.5">
                    Units on this floor:
                  </div>
                  <div className="space-y-1">
                    {activeFloor.units.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => onSelectUnit(u.id, activeFloor.id)}
                        className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-indigo-50 border border-slate-100 transition-colors text-left"
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${u.status === 'Conflict' ? 'bg-red-500' : 'bg-emerald-500'}`} />
                          <span className="text-xs font-bold text-slate-800">Unit {u.unitNumber}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500">{u.areaSqFt} sq.ft</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-2.5 bg-indigo-50/60 rounded-lg border border-indigo-100 text-[11px] text-indigo-800">
                  💡 Click an individual unit above or in the 3D model to view its unique ULPIN.
                </div>
              </div>
            ) : (
              /* LEVEL 1: BUILDING OVERVIEW (Default) */
              <div className="space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Building Details
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {currentBuilding.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {currentBuilding.name}
                  </h3>
                  <div className="text-xs text-slate-500 mt-0.5 font-mono">
                    ID: {currentBuilding.id}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-400 text-[10px] block">Floors (Levels)</span>
                    <span className="font-bold text-slate-900 text-sm">{currentBuilding.floorCount}</span>
                    <span className="text-slate-400 text-[10px]"> Storeys</span>
                  </div>

                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-400 text-[10px] block">Total Units</span>
                    <span className="font-bold text-slate-900 text-sm">{currentBuilding.unitCount}</span>
                    <span className="text-slate-400 text-[10px]"> Units</span>
                  </div>

                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-400 text-[10px] block">Building Height</span>
                    <span className="font-bold text-slate-900 font-mono text-sm">{currentBuilding.heightMeters}</span>
                    <span className="text-slate-400 text-[10px]"> meters</span>
                  </div>

                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-400 text-[10px] block">Footprint Area</span>
                    <span className="font-bold text-slate-900 font-mono text-sm">{currentBuilding.footprintAreaSqFt}</span>
                    <span className="text-slate-400 text-[10px]"> sq.ft</span>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Cadastral Location</div>
                  <div className="font-semibold text-slate-800">{currentParcel.location}</div>
                  <div className="text-slate-500 text-[11px]">{currentParcel.district}, {currentParcel.state}</div>
                </div>

                <div className="p-2.5 bg-indigo-50/60 rounded-xl border border-indigo-100 text-[11px] text-indigo-900">
                  Select any floor from the vertical selector or click a floor in the 3D model to drill down.
                </div>
              </div>
            )}
          </div>

          {/* CLEAR ACTION BAR AT BOTTOM */}
          <div className="pt-3 border-t border-slate-200 space-y-2 shrink-0">
            {/* 1. Validate Property Button */}
            <div className="relative group">
              <button
                onClick={() => setValidationOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Validate Property</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* 2. View Evidence */}
              <button
                onClick={() => setEvidenceOpen(true)}
                className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                <span>Evidence</span>
              </button>

              {/* 3. Generate Report */}
              <button
                onClick={onOpenReportModal}
                className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>Report</span>
              </button>
            </div>
          </div>

          {/* ======================================================== */}
          {/* SLIDE-OVER VALIDATION DRAWER (In-Workspace)             */}
          {/* ======================================================== */}
          {isValidationOpen && (
            <div className="absolute inset-0 bg-white z-30 p-4 flex flex-col justify-between animate-in slide-in-from-right duration-200 border-l border-slate-200">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    <span className="font-bold text-xs text-slate-900 uppercase tracking-wide">
                      Property Validation
                    </span>
                  </div>
                  <button
                    onClick={() => setValidationOpen(false)}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Validation Checklist */}
                <div className="mt-3 space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Automated GIS Audits
                  </div>

                  {[
                    { label: 'Parcel Boundary', ok: true, note: 'GPS Polygon matched' },
                    { label: 'Building Geometry', ok: true, note: 'Height & volume approved' },
                    { label: 'Floor Structure', ok: true, note: 'Slab elevation verified' },
                    { label: 'ULPIN Mapping', ok: true, note: '14-digit code linked' },
                    { label: 'Unit Boundary', ok: false, note: 'Setback margin discrepancy' },
                  ].map((chk, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className={chk.ok ? 'text-emerald-600 font-bold' : 'text-amber-500 font-bold'}>
                          {chk.ok ? '✓' : '⚠'}
                        </span>
                        <span className="font-semibold text-slate-800">{chk.label}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{chk.note}</span>
                    </div>
                  ))}
                </div>

                {/* 1 Conflict Detected Summary */}
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-red-700 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>1 Conflict Detected</span>
                    </span>
                    <span className="text-[10px] font-bold bg-red-100 text-red-800 px-1.5 py-0.5 rounded">
                      Medium Risk
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-800">
                    Unit 302 · Floor 3
                  </div>
                  <div className="text-[11px] text-red-600 leading-snug">
                    Spatial boundary overlap with external setback corridor & cadastral vertical line (+42cm).
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <button
                  onClick={() => {
                    setValidationOpen(false);
                    setEvidenceOpen(true);
                  }}
                  className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Review Evidence</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      alert('3D ULPIN approved and recorded in official cadastral registry.');
                      setValidationOpen(false);
                    }}
                    className="py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors shadow-2xs"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      alert('Sent for field re-survey with cadastral inspector notes.');
                      setValidationOpen(false);
                    }}
                    className="py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors border border-slate-200"
                  >
                    Send for Review
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* SLIDE-OVER EVIDENCE DRAWER (In-Workspace)                */}
          {/* ======================================================== */}
          {isEvidenceOpen && (
            <div className="absolute inset-0 bg-white z-30 p-4 flex flex-col justify-between animate-in slide-in-from-right duration-200 border-l border-slate-200">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    <span className="font-bold text-xs text-slate-900 uppercase tracking-wide">
                      Evidence & Telemetry
                    </span>
                  </div>
                  <button
                    onClick={() => setEvidenceOpen(false)}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-3 space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Multi-Sensor Telemetry
                  </div>

                  {[
                    { title: 'AI Detection', status: 'Verified', detail: 'Footprint match 98.4%' },
                    { title: 'Building Boundary', status: 'Verified', detail: 'Height 16.5m vs plan' },
                    { title: 'Floor Data', status: 'Verified', detail: 'LiDAR G+4 levels detected' },
                    { title: 'Unit Geometry', status: 'Review', detail: 'Unit 302 +42cm setback overlap' },
                    { title: 'Land Record', status: 'Verified', detail: 'Patta No. 1824 matched' },
                  ].map((evd, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-slate-800">{evd.title}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{evd.detail}</div>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          evd.status === 'Verified'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {evd.status === 'Verified' ? '✓ Verified' : '⚠ Review'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <button
                  onClick={() => {
                    alert('Official 3D ULPIN approved with conditional discrepancy clearance.');
                    setEvidenceOpen(false);
                  }}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors shadow-2xs"
                >
                  Approve 3D ULPIN
                </button>
                <button
                  onClick={() => {
                    alert('Re-survey order dispatched to local Revenue Survey team.');
                    setEvidenceOpen(false);
                  }}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors border border-slate-200"
                >
                  Send for Re-Survey
                </button>
              </div>
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
};
