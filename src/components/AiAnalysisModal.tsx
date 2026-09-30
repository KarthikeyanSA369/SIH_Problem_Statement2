import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Box,
  Layers,
  Building as BuildingIcon,
  ShieldCheck,
  ArrowRight,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AiAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const ANALYSIS_STEPS = [
  { id: 1, label: 'Loading Cadastral & Satellite Spatial Data', progress: 14, desc: 'Fetching 2cm Orthophoto and Town Survey boundaries...' },
  { id: 2, label: 'Detecting Building Footprint & Extents', progress: 32, desc: 'AI Convolutional Network segmenting building envelope...' },
  { id: 3, label: 'Estimating Building Height via LiDAR Point Cloud', progress: 50, desc: 'Calculating building apex height: 16.5m AGL...' },
  { id: 4, label: 'Detecting Floor Slabs & Vertical Levels', progress: 68, desc: 'Identified 5 horizontal planar slabs (Ground + 4 Floors)...' },
  { id: 5, label: 'Identifying Individual Units & Partitions', progress: 84, desc: 'Segmenting internal walls: 15 vertical units detected...' },
  { id: 6, label: 'Boundary & Cadastral Setback Validation', progress: 94, desc: 'Evaluating unit envelopes against approved survey plans...' },
  { id: 7, label: 'Generating 3D ULPIN Hierarchical Identifiers', progress: 100, desc: 'Assigning 14-digit survey + floor + unit IDs...' },
];

export const AiAnalysisModal: React.FC<AiAnalysisModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(12);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStepIndex(0);
      setProgress(12);
      setIsFinished(false);
      return;
    }

    let timer: NodeJS.Timeout;
    const runSimulation = (step: number) => {
      if (step < ANALYSIS_STEPS.length) {
        timer = setTimeout(() => {
          setCurrentStepIndex(step);
          setProgress(ANALYSIS_STEPS[step].progress);
          runSimulation(step + 1);
        }, 650);
      } else {
        timer = setTimeout(() => {
          setIsFinished(true);
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 },
          });
        }, 500);
      }
    };

    runSimulation(0);

    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-600 text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                AI 3D Spatial Property Analysis
              </h3>
              <p className="text-xs text-slate-500">
                Automated 2D Parcel to 3D Vertical Property Reconstruction
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Progress Bar & Percentage */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
              <span className="text-slate-700 flex items-center gap-1.5">
                {!isFinished ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                )}
                <span>{isFinished ? 'Analysis Completed' : 'AI Spatial Processing in progress...'}</span>
              </span>
              <span className="font-mono font-bold text-indigo-600">{progress}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className="h-full bg-indigo-600 transition-all duration-300 ease-out rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Current Step Callout */}
          {!isFinished && (
            <div className="p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs">
              <div className="text-[11px] font-mono text-indigo-600 uppercase font-semibold">
                Current Step {currentStepIndex + 1} of {ANALYSIS_STEPS.length}
              </div>
              <div className="font-bold text-slate-900 mt-0.5">
                {ANALYSIS_STEPS[currentStepIndex]?.label}
              </div>
              <div className="text-slate-500 text-[11px] mt-1 font-mono">
                {ANALYSIS_STEPS[currentStepIndex]?.desc}
              </div>
            </div>
          )}

          {/* Step Pipeline List */}
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {ANALYSIS_STEPS.map((step, idx) => {
              const isPast = isFinished || idx < currentStepIndex;
              const isCurrent = !isFinished && idx === currentStepIndex;
              return (
                <div
                  key={step.id}
                  className={`flex items-center justify-between p-2 rounded-lg text-xs transition-colors ${
                    isCurrent
                      ? 'bg-slate-100 font-semibold text-slate-900'
                      : isPast
                      ? 'text-slate-600'
                      : 'text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {isPast ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : isCurrent ? (
                      <Loader2 className="w-4 h-4 text-indigo-600 animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                    )}
                    <span className="truncate max-w-[340px]">{step.label}</span>
                  </div>
                  <span className="font-mono text-[11px]">
                    {isPast ? 'Done' : isCurrent ? 'Active' : 'Pending'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Completed Summary Card */}
          {isFinished && (
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 animate-in fade-in duration-300">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wide mb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>AI Spatial Extraction Completed Successfully</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2.5 bg-white rounded-lg border border-emerald-100 shadow-xs">
                  <div className="text-[10px] text-slate-500">Buildings</div>
                  <div className="text-base font-bold text-slate-900 font-mono mt-0.5">1</div>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-emerald-100 shadow-xs">
                  <div className="text-[10px] text-slate-500">Floors</div>
                  <div className="text-base font-bold text-slate-900 font-mono mt-0.5">5 (G+4)</div>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-emerald-100 shadow-xs">
                  <div className="text-[10px] text-slate-500">Units</div>
                  <div className="text-base font-bold text-slate-900 font-mono mt-0.5">15</div>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-red-100 shadow-xs">
                  <div className="text-[10px] text-red-600">Conflicts</div>
                  <div className="text-base font-bold text-red-600 font-mono mt-0.5">1</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={!isFinished}
            onClick={() => {
              onClose();
              onComplete();
            }}
            className={`flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg shadow-sm transition-all ${
              isFinished
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>View 3D Result</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
