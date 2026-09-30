import React from 'react';
import {
  LayoutDashboard,
  Box,
  Map,
  ShieldAlert,
  FileCheck,
  FileText,
  Settings,
  HelpCircle,
  User,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export type NavTab =
  | 'overview'
  | 'properties'
  | 'map'
  | 'validation'
  | 'evidence'
  | 'reports'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  conflictCount?: number;
  onOpenHelp?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  isCollapsed,
  onToggleCollapse,
  conflictCount = 1,
  onOpenHelp,
}) => {
  const mainNavItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'overview', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4 shrink-0" /> },
    { id: 'properties', label: 'Properties', icon: <Box className="w-4 h-4 shrink-0" /> },
    { id: 'map', label: '2D Map', icon: <Map className="w-4 h-4 shrink-0" /> },
    {
      id: 'validation',
      label: 'Validation',
      icon: <ShieldAlert className="w-4 h-4 shrink-0" />,
      badge: conflictCount,
    },
    { id: 'evidence', label: 'Evidence', icon: <FileCheck className="w-4 h-4 shrink-0" /> },
    { id: 'reports', label: 'Reports', icon: <FileText className="w-4 h-4 shrink-0" /> },
  ];

  return (
    <aside
      className={`relative bg-white border-r border-slate-200 transition-all duration-300 flex flex-col justify-between shrink-0 z-30 select-none ${
        isCollapsed ? 'w-16' : 'w-56'
      }`}
    >
      {/* Top Nav Items */}
      <div className="p-3 space-y-1">
        <div className={`px-2 py-1 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 ${isCollapsed ? 'text-center' : ''}`}>
          {isCollapsed ? '•••' : 'Workspace'}
        </div>

        {mainNavItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <div key={item.id} className="relative group">
              <button
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all relative ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {item.icon}
                {!isCollapsed && <span className="truncate">{item.label}</span>}

                {/* Active Indicator bar */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-600 rounded-r" />
                )}

                {/* Badge for conflicts */}
                {!isCollapsed && item.badge && item.badge > 0 && (
                  <span className="ml-auto px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-red-100 text-red-700 font-mono">
                    {item.badge}
                  </span>
                )}

                {isCollapsed && item.badge && item.badge > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
                )}
              </button>

              {/* Tooltip when collapsed */}
              {isCollapsed && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-medium rounded-md whitespace-nowrap shadow-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                  {item.label}
                  {item.badge && item.badge > 0 && ` (${item.badge})`}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Nav Items: Settings, Help, Profile, Collapse */}
      <div className="p-3 border-t border-slate-200 space-y-1">
        {/* Settings */}
        <div className="relative group">
          <button
            onClick={() => onTabChange('settings')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              currentTab === 'settings'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Settings className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Settings</span>}
          </button>
          {isCollapsed && (
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-medium rounded-md whitespace-nowrap shadow-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
              Settings
            </div>
          )}
        </div>

        {/* Help / Guide */}
        <div className="relative group">
          <button
            onClick={onOpenHelp}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all"
          >
            <HelpCircle className="w-4 h-4 shrink-0 text-indigo-500" />
            {!isCollapsed && <span>Workflow Guide</span>}
          </button>
          {isCollapsed && (
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-medium rounded-md whitespace-nowrap shadow-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
              Workflow Guide
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-50 transition-colors">
            <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0 border border-indigo-200">
              <User className="w-3.5 h-3.5" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-800 truncate leading-tight">Cadastral Officer</div>
                <div className="text-[10px] text-slate-400 truncate">TN Survey Dept</div>
              </div>
            )}
          </div>
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={onToggleCollapse}
          className="flex items-center justify-center p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors w-full mt-1"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!isCollapsed && <span className="text-xs ml-2 font-medium">Collapse Menu</span>}
        </button>
      </div>
    </aside>
  );
};
