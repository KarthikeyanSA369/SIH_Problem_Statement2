import React, { useState, useId } from 'react';
import {
  Sparkles,
  Calculator,
  QrCode,
  CheckCircle2,
  Box,
  Layers,
  ArrowRight,
  X,
  Copy,
  Check,
  Building2,
  MapPin,
  Compass,
  Sliders,
  Maximize2
} from 'lucide-react';
import { Parcel, Building, Floor, PropertyUnit } from '../types/property';
import confetti from 'canvas-confetti';

interface InputUlpinGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerateAndLoad: (newParcel: Parcel) => void;
}

export const InputUlpinGeneratorModal: React.FC<InputUlpinGeneratorModalProps> = ({
  isOpen,
  onClose,
  onGenerateAndLoad,
}) => {
  // Input parameters
  const [propertyName, setPropertyName] = useState('Surya Skyline Residency');
  const [stateCode, setStateCode] = useState('TN');
  const [district, setDistrict] = useState('Chennai');
  const [surveyNo, setSurveyNo] = useState('402/1A');
  const [lengthMeters, setLengthMeters] = useState<number>(24);
  const [widthMeters, setWidthMeters] = useState<number>(16);
  const [floorCount, setFloorCount] = useState<number>(5); // G + 4
  const [unitsPerFloor, setUnitsPerFloor] = useState<number>(3);
  const [selectedFloorNum, setSelectedFloorNum] = useState<number>(3);
  const [selectedUnitNum, setSelectedUnitNum] = useState<number>(2);
  const [propertyType, setPropertyType] = useState<'Residential' | 'Commercial'>('Residential');

  // Copy state
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Real-time calculations:
  // 1 meter = 3.28084 feet => 1 sq.m = 10.7639 sq.ft
  const footprintSqM = Math.round(lengthMeters * widthMeters);
  const footprintSqFt = Math.round(footprintSqM * 10.7639);
  const totalBuiltUpSqFt = Math.round(footprintSqFt * floorCount);
  
  // Floor area minus common circulation (corridors, lifts, stairs ~20%)
  const floorUsableSqFt = Math.round(footprintSqFt * 0.82);
  const unitAreaSqFt = Math.round(floorUsableSqFt / Math.max(unitsPerFloor, 1));
  const buildingHeightMeters = Math.round(floorCount * 3.3 * 10) / 10; // ~3.3m per storey

  // Deterministic clean ULPIN generation conforming to GovTech standards:
  // Format: ULPIN-{STATE}-{SURVEY_ENCODED}-F{FLOOR}-U{UNIT}
  const cleanSurvey = surveyNo.replace(/[^a-zA-Z0-9]/g, '');
  const parcelId = `PAR-${stateCode}-${cleanSurvey || '101'}`;
  const floorId = selectedFloorNum === 0 ? 'GF' : `F${String(selectedFloorNum).padStart(2, '0')}`;
  const unitCode = `U${String(selectedUnitNum).padStart(2, '0')}`;
  const unitNumberStr = `${selectedFloorNum === 0 ? 'G' : selectedFloorNum}${String(selectedUnitNum).padStart(2, '0')}`;
  const generatedUlpin = `ULPIN-${stateCode}-${cleanSurvey || '101'}-${floorId}-${unitCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedUlpin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateProperty = () => {
    // Generate complete 3D data structure for the 3D viewer
    const buildingId = `BLD-${cleanSurvey || '101'}`;

    const floors: Floor[] = [];
    for (let f = 0; f < floorCount; f++) {
      const flId = f === 0 ? 'GF' : `F${String(f).padStart(2, '0')}`;
      const flName = f === 0 ? 'Ground Floor' : `Floor ${f}`;
      const elevation = Math.round(f * 3.3 * 10) / 10;

      const units: PropertyUnit[] = [];
      for (let u = 1; u <= unitsPerFloor; u++) {
        const uId = `U${String(u).padStart(2, '0')}`;
        const uNum = `${f === 0 ? 'G' : f}${String(u).padStart(2, '0')}`;
        const uUlpin = `ULPIN-${stateCode}-${cleanSurvey || '101'}-${flId}-${uId}`;

        // Width and layout
        const unitWidth = (lengthMeters * 0.7) / unitsPerFloor;
        const unitDepth = widthMeters * 0.65;
        const xOffset = (u - (unitsPerFloor + 1) / 2) * (unitWidth + 0.5);

        units.push({
          id: uId,
          unitNumber: uNum,
          floorId: flId,
          floorNumber: f,
          buildingId,
          parcelId,
          ulpin: uUlpin,
          propertyType,
          areaSqFt: unitAreaSqFt,
          boundaryStatus: 'Verified',
          recordStatus: 'Matched',
          status: 'Verified',
          ownerName: `Owner of Unit ${uNum}`,
          registrationDate: '2026-03-15',
          deedNumber: `DEED-${stateCode}-2026-${uNum}`,
          coordinates: [13.0827, 80.2707],
          positionOffset: [xOffset, elevation + 0.3, 0],
          size: [unitWidth, 3.0, unitDepth],
        });
      }

      floors.push({
        id: flId,
        floorNumber: f,
        name: flName,
        elevationMeters: elevation,
        areaSqFt: footprintSqFt,
        verifiedUnitsCount: unitsPerFloor,
        conflictCount: 0,
        status: 'Verified',
        units,
      });
    }

    const newBuilding: Building = {
      id: buildingId,
      name: propertyName,
      parcelId,
      floorCount,
      unitCount: floorCount * unitsPerFloor,
      heightMeters: buildingHeightMeters,
      footprintAreaSqFt: footprintSqFt,
      completionYear: 2026,
      status: 'Verified',
      floors,
    };

    const newParcel: Parcel = {
      id: parcelId,
      ulpin: `ULPIN-${stateCode}-${cleanSurvey || '101'}`,
      name: propertyName,
      location: `${surveyNo}, Sector 4, ${district}`,
      district,
      state: stateCode === 'TN' ? 'Tamil Nadu' : stateCode === 'KA' ? 'Karnataka' : stateCode === 'MH' ? 'Maharashtra' : 'Delhi',
      pincode: '600001',
      coordinates: [13.0827, 80.2707],
      areaSqFt: footprintSqFt * 1.35, // with compound setbacks
      landUse: propertyType,
      verificationStatus: 'Verified',
      ownerRecord: 'Registered Patta / Title Deed',
      surveyNumber: surveyNo,
      subRegistrarOffice: `${district} Central SRO`,
      lastUpdated: 'Just now (AI Input Generator)',
      buildingCount: 1,
      polygon: [
        [13.0825, 80.2705],
        [13.0830, 80.2705],
        [13.0830, 80.2712],
        [13.0825, 80.2712],
      ],
      buildings: [newBuilding],
    };

    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 },
    });

    onGenerateAndLoad(newParcel);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 via-white to-blue-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-100/80 text-indigo-700 text-[10px] font-bold uppercase tracking-wider font-mono">
                <Sparkles className="w-3 h-3 text-indigo-600" />
                <span>Interactive Input & ULPIN Generator</span>
              </div>
              <h2 className="text-base font-bold text-slate-900 mt-0.5">
                Generate Area & 3D Vertical ULPIN
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: 2 Columns */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-5 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* Left Column: Form Inputs (7 cols) */}
          <div className="md:col-span-7 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              1. Property & Cadastral Details
            </div>

            {/* Property Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Property / Project Name
              </label>
              <input
                type="text"
                value={propertyName}
                onChange={(e) => setPropertyName(e.target.value)}
                placeholder="e.g. Skyline Towers Block B"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
              />
            </div>

            {/* State, District, Survey Number */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  State
                </label>
                <select
                  value={stateCode}
                  onChange={(e) => setStateCode(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="TN">Tamil Nadu (TN)</option>
                  <option value="KA">Karnataka (KA)</option>
                  <option value="MH">Maharashtra (MH)</option>
                  <option value="DL">Delhi (DL)</option>
                  <option value="TG">Telangana (TG)</option>
                  <option value="GJ">Gujarat (GJ)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  District
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Survey No.
                </label>
                <input
                  type="text"
                  value={surveyNo}
                  onChange={(e) => setSurveyNo(e.target.value)}
                  placeholder="e.g. 402/1A"
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 pt-2 border-t border-slate-100">
              2. Dimensions & Spatial Strata
            </div>

            {/* Length & Width in meters */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">Length (Meters)</label>
                  <span className="text-xs font-mono font-bold text-indigo-600">{lengthMeters}m</span>
                </div>
                <input
                  type="range"
                  min={12}
                  max={45}
                  value={lengthMeters}
                  onChange={(e) => setLengthMeters(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">Width (Meters)</label>
                  <span className="text-xs font-mono font-bold text-indigo-600">{widthMeters}m</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={35}
                  value={widthMeters}
                  onChange={(e) => setWidthMeters(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>
            </div>

            {/* Floors and Units per floor */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Storeys / Floors ({floorCount === 1 ? 'Ground Only' : `G + ${floorCount - 1}`})
                </label>
                <div className="flex items-center gap-1.5">
                  {[2, 3, 4, 5, 6].map((fl) => (
                    <button
                      key={fl}
                      type="button"
                      onClick={() => {
                        setFloorCount(fl);
                        if (selectedFloorNum >= fl) setSelectedFloorNum(fl - 1);
                      }}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        floorCount === fl
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {fl}F
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Units per Floor
                </label>
                <div className="flex items-center gap-1.5">
                  {[2, 3, 4].map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => {
                        setUnitsPerFloor(u);
                        if (selectedUnitNum > u) setSelectedUnitNum(u);
                      }}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        unitsPerFloor === u
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {u} Units
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Target Floor & Unit to Generate */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Target Floor
                </label>
                <select
                  value={selectedFloorNum}
                  onChange={(e) => setSelectedFloorNum(Number(e.target.value))}
                  className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-bold text-slate-900"
                >
                  {Array.from({ length: floorCount }).map((_, idx) => (
                    <option key={idx} value={idx}>
                      {idx === 0 ? 'Ground Floor (GF)' : `Floor ${idx} (Level ${idx})`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Target Unit
                </label>
                <select
                  value={selectedUnitNum}
                  onChange={(e) => setSelectedUnitNum(Number(e.target.value))}
                  className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-bold text-slate-900"
                >
                  {Array.from({ length: unitsPerFloor }).map((_, idx) => (
                    <option key={idx + 1} value={idx + 1}>
                      Unit {idx + 1} ({selectedFloorNum === 0 ? 'G' : selectedFloorNum}{String(idx + 1).padStart(2, '0')})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Right Column: Computed Area & Generated 3D ULPIN (5 cols) */}
          <div className="md:col-span-5 flex flex-col justify-between space-y-3.5 bg-indigo-50/40 p-4 rounded-xl border border-indigo-100">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Computed Spatial Output</span>
              </div>

              {/* Area Breakdown Cards */}
              <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                <div className="p-2.5 bg-white rounded-lg border border-indigo-100 shadow-2xs">
                  <span className="text-[10px] text-slate-400 block font-medium">Footprint Area</span>
                  <span className="font-bold text-slate-900 font-mono text-base">{footprintSqFt.toLocaleString()}</span>
                  <span className="text-[10px] text-slate-500"> sq.ft ({footprintSqM}m²)</span>
                </div>

                <div className="p-2.5 bg-white rounded-lg border border-indigo-100 shadow-2xs">
                  <span className="text-[10px] text-slate-400 block font-medium">Building Height</span>
                  <span className="font-bold text-slate-900 font-mono text-base">{buildingHeightMeters}m</span>
                  <span className="text-[10px] text-slate-500"> {floorCount} Levels</span>
                </div>

                <div className="p-2.5 bg-white rounded-lg border border-indigo-100 shadow-2xs">
                  <span className="text-[10px] text-slate-400 block font-medium">Unit Area (Unit {unitNumberStr})</span>
                  <span className="font-bold text-indigo-700 font-mono text-base">{unitAreaSqFt.toLocaleString()}</span>
                  <span className="text-[10px] text-slate-500"> sq.ft</span>
                </div>

                <div className="p-2.5 bg-white rounded-lg border border-indigo-100 shadow-2xs">
                  <span className="text-[10px] text-slate-400 block font-medium">Total Gross Area</span>
                  <span className="font-bold text-slate-900 font-mono text-base">{totalBuiltUpSqFt.toLocaleString()}</span>
                  <span className="text-[10px] text-slate-500"> sq.ft</span>
                </div>
              </div>

              {/* GENERATED 3D ULPIN HIGHLIGHT BOX */}
              <div className="mt-3.5 p-3.5 bg-white rounded-xl border border-indigo-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1">
                    <QrCode className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Official 3D ULPIN</span>
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 font-mono">
                    ✓ Verified Syntax
                  </span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg border border-indigo-100 font-mono font-bold text-xs text-indigo-950 break-all flex items-center justify-between gap-1">
                  <span>{generatedUlpin}</span>
                  <button
                    onClick={handleCopy}
                    className="p-1 hover:bg-slate-200 rounded text-slate-600 hover:text-slate-900 transition-colors shrink-0"
                    title="Copy ULPIN"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="text-[11px] text-slate-500 leading-snug">
                  Unique Bhu-Aadhaar vertical cadastral key linking 2D Survey Parcel <span className="font-semibold">{surveyNo}</span> to vertical level <span className="font-semibold">{floorId}</span> and unit <span className="font-semibold">{unitCode}</span>.
                </div>
              </div>
            </div>

            {/* Bottom Action: Load and View in 3D */}
            <div className="pt-2">
              <button
                onClick={handleCreateProperty}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs hover:gap-3"
              >
                <span>Generate & Load into 3D Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-[10px] text-slate-400 text-center mt-1.5">
                Renders a dynamic 3D model with your exact dimensions in real time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
