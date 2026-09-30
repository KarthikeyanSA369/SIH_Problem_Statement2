import React, { useEffect, useState } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  X,
  Sparkles,
  CheckCircle2,
  Layers,
  Box,
  MapPin,
  ShieldCheck,
  ShieldAlert,
  QrCode
} from 'lucide-react';

export interface DemoStep {
  id: number;
  title: string;
  subtitle: string;
  tab: 'properties';
  floorId: string | null;
  unitId: string | null;
  isExploded?: boolean;
  showValidation?: boolean;
  showEvidence?: boolean;
  showUlpinModal?: boolean;
}

export const DEMO_STAGES: DemoStep[] = [
  {
    id: 1,
    title: '1. Select Cadastral Parcel',
    subtitle: 'Viewing Green Residency Block A (PAR-TN-123456) in Tamil Nadu Cadastre',
    tab: 'properties',
    floorId: null,
    unitId: null,
    isExploded: false,
    showValidation: false,
    showEvidence: false,
  },
  {
    id: 2,
    title: '2. 3D Building Reconstruction',
    subtitle: 'Reconstructed G+4 storey spatial envelope (16.5m height, 15 vertical units)',
    tab: 'properties',
    floorId: null,
    unitId: null,
    isExploded: false,
    showValidation: false,
    showEvidence: false,
  },
  {
    id: 3,
    title: '3. Select Floor 3 Strata',
    subtitle: 'Smoothly focusing on residential Level 3 and isolating floor plate',
    tab: 'properties',
    floorId: 'F03',
    unitId: null,
    isExploded: true,
    showValidation: false,
    showEvidence: false,
  },
  {
    id: 4,
    title: '4. Select Unit 302',
    subtitle: 'Highlighting interior unit spatial geometry (820 sq.ft residential unit)',
    tab: 'properties',
    floorId: 'F03',
    unitId: 'U02',
    isExploded: true,
    showValidation: false,
    showEvidence: false,
  },
  {
    id: 5,
    title: '5. Vertical ULPIN Linkage',
    subtitle: 'Assigned unique 14-digit identifier: ULPIN-TN-123456-F03-U02',
    tab: 'properties',
    floorId: 'F03',
    unitId: 'U02',
    isExploded: true,
    showValidation: false,
    showEvidence: false,
  },
  {
    id: 6,
    title: '6. Spatial Boundary Validation',
    subtitle: 'Running automated vertical setback, ceiling height, and cadastral audits',
    tab: 'properties',
    floorId: 'F03',
    unitId: 'U02',
    isExploded: true,
    showValidation: true,
    showEvidence: false,
  },
  {
    id: 7,
    title: '7. Conflict Detected: Unit 302',
    subtitle: 'Medium-risk boundary overlap (+42cm cantilever setback protrusion)',
    tab: 'properties',
    floorId: 'F03',
    unitId: 'U02',
    isExploded: true,
    showValidation: true,
    showEvidence: false,
  },
  {
    id: 8,
    title: '8. Multi-Sensor Evidence Review',
    subtitle: 'Cross-verifying with LiDAR point-cloud, drone survey, and Revenue records',
    tab: 'properties',
    floorId: 'F03',
    unitId: 'U02',
    isExploded: true,
    showValidation: false,
    showEvidence: true,
  },
];

interface OneClickDemoControllerProps {
  currentStageIndex: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNextStage: () => void;
  onPrevStage: () => void;
  onExitDemo: () => void;
  onSelectStage: (index: number) => void;
}

export const OneClickDemoController: React.FC<OneClickDemoControllerProps> = ({
  currentStageIndex,
  isPlaying,
  onTogglePlay,
  onNextStage,
  onPrevStage,
  onExitDemo,
  onSelectStage,
}) => {
  const currentStage = DEMO_STAGES[currentStageIndex] || DEMO_STAGES[0];
  const progressPercent = ((currentStageIndex + 1) / DEMO_STAGES.length) * 100;

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4 animate-in slide-in-from-bottom duration-300">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-300 shadow-2xl p-3.5 space-y-2.5">
        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-indigo-600 h-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Content row */}
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 font-mono">
                DEMO {currentStageIndex + 1}/{DEMO_STAGES.length}
              </span>
              <span className="font-bold text-xs text-slate-900 truncate">
                {currentStage.title}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 truncate mt-0.5">
              {currentStage.subtitle}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={onPrevStage}
              disabled={currentStageIndex === 0}
              className="p-1.5 text-slate-500 hover:text-slate-900 disabled:opacity-30 rounded-lg hover:bg-slate-100"
              title="Previous Step"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={onTogglePlay}
              className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors"
              title={isPlaying ? 'Pause Demo' : 'Resume Demo'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
            </button>

            <button
              onClick={onNextStage}
              disabled={currentStageIndex === DEMO_STAGES.length - 1}
              className="p-1.5 text-slate-500 hover:text-slate-900 disabled:opacity-30 rounded-lg hover:bg-slate-100"
              title="Next Step"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <div className="w-px h-4 bg-slate-200 mx-1" />

            <button
              onClick={onExitDemo}
              className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              title="Exit Demo Mode"
            >
              <X className="w-3.5 h-3.5" />
              <span>Exit</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
