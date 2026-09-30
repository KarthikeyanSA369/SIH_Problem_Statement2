import React, { useState, useEffect, useRef } from 'react';
import { MOCK_PARCELS, GLOBAL_STATS } from './data/mockData';
import { PropertyUnit, Parcel, Building, Floor } from './types/property';
import { Navbar } from './components/Navbar';
import { Sidebar, NavTab } from './components/Sidebar';
import { OverviewDashboard } from './components/OverviewDashboard';
import { PropertiesWorkspace } from './components/PropertiesWorkspace';
import { GisMapViewer } from './components/GisMapViewer';
import { ValidationPage } from './components/ValidationPage';
import { EvidenceReviewPage } from './components/EvidenceReviewPage';
import { ReportsPage } from './components/ReportsPage';
import { SettingsPage } from './components/SettingsPage';
import { UlpinDetailsModal } from './components/UlpinDetailsModal';
import { AiAnalysisModal } from './components/AiAnalysisModal';
import { WelcomeModal } from './components/WelcomeModal';
import { OneClickDemoController, DEMO_STAGES } from './components/OneClickDemoController';
import { InputUlpinGeneratorModal } from './components/InputUlpinGeneratorModal';
import confetti from 'canvas-confetti';

export default function App() {
  // Dynamic Parcels list (allows user custom input parcels to be added & visualized live)
  const [parcels, setParcels] = useState<Parcel[]>(MOCK_PARCELS);

  // Navigation & View States: 'overview' | 'properties' | 'map' | 'validation' | 'evidence' | 'reports' | 'settings'
  const [currentTab, setCurrentTab] = useState<NavTab>('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Property Selection States
  const [selectedParcelId, setSelectedParcelId] = useState<string>('PAR-TN-123456');
  const [selectedFloorId, setSelectedFloorId] = useState<string | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);

  // Workspace Drawer controls
  const [validationDrawerOpen, setValidationDrawerOpen] = useState(false);
  const [evidenceDrawerOpen, setEvidenceDrawerOpen] = useState(false);

  // Modals
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isUlpinModalOpen, setIsUlpinModalOpen] = useState(false);
  const [isGeneratorModalOpen, setIsGeneratorModalOpen] = useState(false);
  const [activeUlpinUnit, setActiveUlpinUnit] = useState<PropertyUnit | null>(null);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);

  // Demo Mode State Machine
  const [isDemoRunning, setIsDemoRunning] = useState(false);
  const [demoStageIndex, setDemoStageIndex] = useState(0);
  const [demoIsPlaying, setDemoIsPlaying] = useState(false);

  // Active Parcel and Building references
  const currentParcel = parcels.find((p) => p.id === selectedParcelId) || parcels[0];
  const currentBuilding = currentParcel?.buildings[0] || parcels[0]?.buildings[0];

  // Helper to open ULPIN modal
  const handleOpenUlpinDetails = (unit: PropertyUnit) => {
    setActiveUlpinUnit(unit);
    setIsUlpinModalOpen(true);
  };

  // Add custom generated parcel and immediately load into 3D view
  const handleGenerateAndLoad = (newParcel: Parcel) => {
    setParcels((prev) => [newParcel, ...prev]);
    setSelectedParcelId(newParcel.id);
    const firstBuilding = newParcel.buildings[0];
    if (firstBuilding && firstBuilding.floors.length > 0) {
      const targetFloor = firstBuilding.floors[firstBuilding.floors.length > 2 ? 2 : 0];
      setSelectedFloorId(targetFloor.id);
      if (targetFloor.units.length > 0) {
        setSelectedUnitId(targetFloor.units[0].id);
      }
    }
    setCurrentTab('properties');
  };

  // Search selection handler
  const handleSelectSearchResult = (type: 'parcel' | 'unit', id: string, floorId?: string) => {
    if (type === 'parcel') {
      setSelectedParcelId(id);
      setSelectedFloorId(null);
      setSelectedUnitId(null);
      setCurrentTab('properties');
    } else {
      setSelectedParcelId('PAR-TN-123456');
      if (floorId) setSelectedFloorId(floorId);
      setSelectedUnitId(id);
      setCurrentTab('properties');
    }
  };

  // Start 1-Click Demo from Dashboard
  const handleStartDemo = () => {
    setIsDemoRunning(true);
    setDemoStageIndex(0);
    setDemoIsPlaying(true);
    setCurrentTab('properties');
    applyDemoStage(0);
  };

  // Exit Demo Mode
  const handleExitDemo = () => {
    setIsDemoRunning(false);
    setDemoIsPlaying(false);
    setValidationDrawerOpen(false);
    setEvidenceDrawerOpen(false);
  };

  // Apply Demo Stage State
  const applyDemoStage = (index: number) => {
    const stage = DEMO_STAGES[index];
    if (!stage) return;

    setSelectedParcelId('PAR-TN-123456');
    setSelectedFloorId(stage.floorId);
    setSelectedUnitId(stage.unitId);
    setValidationDrawerOpen(!!stage.showValidation);
    setEvidenceDrawerOpen(!!stage.showEvidence);

    if (stage.id === 5) {
      // Trigger subtle celebration when ULPIN is linked
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    }
  };

  // Timer loop for Demo Mode
  useEffect(() => {
    if (!isDemoRunning || !demoIsPlaying) return;

    const timer = setInterval(() => {
      setDemoStageIndex((prev) => {
        if (prev < DEMO_STAGES.length - 1) {
          const next = prev + 1;
          applyDemoStage(next);
          return next;
        } else {
          setDemoIsPlaying(false);
          return prev;
        }
      });
    }, 4000);

    return () => clearInterval(timer);
  }, [isDemoRunning, demoIsPlaying]);

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-hidden">
      {/* Top Bar: Clean logo, global search, quick actions, help */}
      <Navbar
        parcels={parcels}
        onSelectSearchResult={handleSelectSearchResult}
        onOpenAiAnalysis={() => setIsAiModalOpen(true)}
        onOpenHelp={() => setIsWelcomeModalOpen(true)}
        onOpenGenerator={() => setIsGeneratorModalOpen(true)}
      />

      {/* Main Container with Simplified 6-Item Sidebar + Content Area */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Collapsible Left Sidebar (Dashboard, Properties, 2D Map, Validation, Evidence, Reports) */}
        <Sidebar
          currentTab={currentTab}
          onTabChange={(tab) => {
            setCurrentTab(tab);
            if (isDemoRunning) handleExitDemo();
          }}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          conflictCount={1}
          onOpenHelp={() => setIsWelcomeModalOpen(true)}
        />

        {/* Primary Page Content Area */}
        <main className="flex-1 min-h-0 overflow-y-auto p-3 lg:p-4 bg-slate-50 flex flex-col">
          <div className="w-full h-full flex flex-col">
            {/* 1. Dashboard (Simple overview, stats, recent properties, [Open Property Workspace]) */}
            {currentTab === 'overview' && (
              <OverviewDashboard
                stats={GLOBAL_STATS}
                parcels={parcels}
                onOpenWorkspace={(pId) => {
                  if (pId) setSelectedParcelId(pId);
                  setCurrentTab('properties');
                }}
                onStartDemo={handleStartDemo}
              />
            )}

            {/* 2. Flagship Unified Properties Workspace (Left: List, Center: 3D/2D, Right: Details) */}
            {currentTab === 'properties' && (
              <PropertiesWorkspace
                parcels={parcels}
                selectedParcelId={selectedParcelId}
                selectedFloorId={selectedFloorId}
                selectedUnitId={selectedUnitId}
                onSelectParcel={(pId) => setSelectedParcelId(pId)}
                onSelectFloor={(flId) => setSelectedFloorId(flId)}
                onSelectUnit={(uId, flId) => {
                  setSelectedUnitId(uId);
                  if (flId) setSelectedFloorId(flId);
                }}
                onOpenUlpinModal={handleOpenUlpinDetails}
                onOpenReportModal={() => setCurrentTab('reports')}
                onOpenGenerator={() => setIsGeneratorModalOpen(true)}
                validationDrawerOpen={validationDrawerOpen}
                onToggleValidationDrawer={(open) => setValidationDrawerOpen(open)}
                evidenceDrawerOpen={evidenceDrawerOpen}
                onToggleEvidenceDrawer={(open) => setEvidenceDrawerOpen(open)}
              />
            )}

            {/* 3. 2D GIS Map Dedicated View */}
            {currentTab === 'map' && (
              <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                <GisMapViewer
                  parcels={parcels}
                  selectedParcelId={selectedParcelId}
                  onSelectParcel={(pId) => setSelectedParcelId(pId)}
                  onOpen3DProperty={(pId) => {
                    setSelectedParcelId(pId);
                    setCurrentTab('properties');
                  }}
                />
              </div>
            )}

            {/* 4. Full Validation Audits Page */}
            {currentTab === 'validation' && (
              <ValidationPage
                parcel={currentParcel}
                building={currentBuilding}
                onNavigateToEvidence={() => setCurrentTab('evidence')}
                onNavigateTo3D={(uId, flId) => {
                  if (flId) setSelectedFloorId(flId);
                  if (uId) setSelectedUnitId(uId);
                  setCurrentTab('properties');
                }}
              />
            )}

            {/* 5. Full Evidence & Human Review Page */}
            {currentTab === 'evidence' && (
              <EvidenceReviewPage
                parcel={currentParcel}
                building={currentBuilding}
                onApproveAll={() => {
                  confetti({
                    particleCount: 90,
                    spread: 80,
                    origin: { y: 0.6 },
                  });
                }}
              />
            )}

            {/* 6. Official Reports Page */}
            {currentTab === 'reports' && (
              <ReportsPage parcel={currentParcel} building={currentBuilding} />
            )}

            {/* 7. Settings Page */}
            {currentTab === 'settings' && <SettingsPage />}
          </div>
        </main>
      </div>

      {/* One-Click Demo Mode Controller (Floats cleanly at bottom when running) */}
      {isDemoRunning && (
        <OneClickDemoController
          currentStageIndex={demoStageIndex}
          isPlaying={demoIsPlaying}
          onTogglePlay={() => setDemoIsPlaying(!demoIsPlaying)}
          onNextStage={() => {
            if (demoStageIndex < DEMO_STAGES.length - 1) {
              const next = demoStageIndex + 1;
              setDemoStageIndex(next);
              applyDemoStage(next);
            }
          }}
          onPrevStage={() => {
            if (demoStageIndex > 0) {
              const prev = demoStageIndex - 1;
              setDemoStageIndex(prev);
              applyDemoStage(prev);
            }
          }}
          onExitDemo={handleExitDemo}
          onSelectStage={(idx) => {
            setDemoStageIndex(idx);
            applyDemoStage(idx);
          }}
        />
      )}

      {/* First-Time User Welcome Modal (Explains 6 simple steps) */}
      <WelcomeModal
        isOpen={isWelcomeModalOpen}
        onClose={() => setIsWelcomeModalOpen(false)}
        onStartExploring={() => {
          setIsWelcomeModalOpen(false);
          setCurrentTab('properties');
        }}
      />

      {/* Dedicated ULPIN Identity Modal */}
      {activeUlpinUnit && (
        <UlpinDetailsModal
          unit={activeUlpinUnit}
          floor={currentBuilding.floors.find((f) => f.id === activeUlpinUnit.floorId)}
          building={currentBuilding}
          parcel={currentParcel}
          isOpen={isUlpinModalOpen}
          onClose={() => setIsUlpinModalOpen(false)}
          onViewEvidence={() => {
            setIsUlpinModalOpen(false);
            setEvidenceDrawerOpen(true);
          }}
          onValidate={() => {
            setIsUlpinModalOpen(false);
            setValidationDrawerOpen(true);
          }}
        />
      )}

      {/* AI Spatial Reconstruction Pipeline Modal */}
      <AiAnalysisModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onComplete={() => {
          setSelectedParcelId('PAR-TN-123456');
          setSelectedFloorId('F03');
          setSelectedUnitId('U02');
          setCurrentTab('properties');
        }}
      />

      {/* Interactive Area & 3D ULPIN Custom Input Generator */}
      <InputUlpinGeneratorModal
        isOpen={isGeneratorModalOpen}
        onClose={() => setIsGeneratorModalOpen(false)}
        onGenerateAndLoad={handleGenerateAndLoad}
      />
    </div>
  );
}
