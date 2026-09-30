import React from 'react';
import {
  Sparkles,
  ArrowRight,
  X,
  MapPin,
  Building2,
  Layers,
  Box,
  QrCode,
  ShieldCheck
} from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartExploring: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onClose,
  onStartExploring,
}) => {
  if (!isOpen) return null;

  const steps = [
    { number: '1', title: 'Select a Property', desc: 'Choose a cadastral land parcel from the left registry', icon: <MapPin className="w-4 h-4 text-indigo-600" /> },
    { number: '2', title: 'Explore 3D Building', desc: 'Inspect spatial volume, height, and perimeter boundaries', icon: <Building2 className="w-4 h-4 text-blue-600" /> },
    { number: '3', title: 'Select a Floor', desc: 'Isolate vertical strata (e.g., Floor 3 residential level)', icon: <Layers className="w-4 h-4 text-emerald-600" /> },
    { number: '4', title: 'Select a Unit', desc: 'Click individual apartments to highlight 3D geometries', icon: <Box className="w-4 h-4 text-purple-600" /> },
    { number: '5', title: 'View 3D ULPIN', desc: 'Access 14-digit vertical property identifier & QR record', icon: <QrCode className="w-4 h-4 text-amber-600" /> },
    { number: '6', title: 'Validate & Review', desc: 'Audit vertical boundaries, setbacks, and LiDAR evidence', icon: <ShieldCheck className="w-4 h-4 text-rose-600" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header decoration */}
        <div className="p-6 bg-gradient-to-r from-indigo-50 via-white to-blue-50 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Smart India Hackathon 2026</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-white/80 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-xl font-bold text-slate-900 mt-3">
            Explore 3D Property Intelligence
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Transform conventional 2D cadastral land parcels into intelligent 3D vertical property representations with unique ULPIN linkages.
          </p>
        </div>

        {/* 6 Simple Steps */}
        <div className="p-6 space-y-3">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Quick 6-Step Interaction Flow
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {steps.map((s) => (
              <div
                key={s.number}
                className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-indigo-50/40 hover:border-indigo-100 transition-colors"
              >
                <div className="w-6 h-6 rounded-lg bg-white shadow-xs border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700 shrink-0">
                  {s.number}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    {s.icon}
                    <span>{s.title}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 leading-tight mt-0.5 line-clamp-1">
                    {s.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            One connected workspace for 3D mapping
          </span>
          <button
            onClick={() => {
              onClose();
              onStartExploring();
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all hover:gap-3"
          >
            <span>Start Exploring</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
