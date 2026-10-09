import React from 'react';
import { 
  Map, 
  ListFilter, 
  Building2, 
  ShieldCheck, 
  CloudSun, 
  Terminal, 
  PlusCircle, 
  RotateCcw,
  Waves,
  ChevronRight,
  Info
} from 'lucide-react';

export type ActiveTab = 'dashboard' | 'incidents' | 'authority' | 'trust_engine' | 'aws_sam';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  selectedCity: string;
  onSelectCity: (city: string) => void;
  onOpenReportModal: () => void;
  onResetData: () => void;
  totalIncidentsCount: number;
  highSeverityCount: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

const CITIES = ['All Cities', 'Mumbai', 'Bengaluru', 'Chennai', 'Delhi NCR', 'Hyderabad'];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  selectedCity,
  onSelectCity,
  onOpenReportModal,
  onResetData,
  totalIncidentsCount,
  highSeverityCount,
  isOpenMobile,
  onCloseMobile,
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#0B132B] text-slate-300 flex flex-col border-r border-slate-800
        transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-inner">
              <Waves className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-white tracking-tight">FloodLens</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-teal-400 bg-teal-950/80 px-1.5 py-0.5 rounded border border-teal-800/60">
                  Civic AI
                </span>
              </div>
              <p className="text-xs text-slate-400">Street-Level Intelligence</p>
            </div>
          </div>

          {/* Hackathon Callout */}
          <div className="mt-4 p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400">
            <span className="text-teal-300 font-semibold block mb-0.5">WeMakeDevs Bharat Builds</span>
            <span>Environmental Hacks · Monsoon Resilience</span>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="p-4">
          <button
            onClick={() => {
              onOpenReportModal();
              onCloseMobile();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-teal-900/30 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report Flooding</span>
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
          {/* Main Navigation */}
          <div>
            <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Navigation
            </div>
            <nav className="space-y-1">
              <button
                onClick={() => {
                  onSelectTab('dashboard');
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'dashboard'
                    ? 'bg-slate-800/90 text-white border border-slate-700/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Map className={`w-4 h-4 ${activeTab === 'dashboard' ? 'text-teal-400' : 'text-slate-400'}`} />
                  <span>Map & Dashboard</span>
                </div>
                <span className="text-xs font-mono tabular-nums text-slate-400">{totalIncidentsCount}</span>
              </button>

              <button
                onClick={() => {
                  onSelectTab('incidents');
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'incidents'
                    ? 'bg-slate-800/90 text-white border border-slate-700/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ListFilter className={`w-4 h-4 ${activeTab === 'incidents' ? 'text-teal-400' : 'text-slate-400'}`} />
                  <span>Incident Feed</span>
                </div>
                {highSeverityCount > 0 && (
                  <span className="text-[10px] font-semibold font-mono bg-red-950 text-red-300 border border-red-800/60 px-1.5 py-0.5 rounded">
                    {highSeverityCount} severe
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  onSelectTab('authority');
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'authority'
                    ? 'bg-slate-800/90 text-white border border-slate-700/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Building2 className={`w-4 h-4 ${activeTab === 'authority' ? 'text-teal-400' : 'text-slate-400'}`} />
                  <span>Authority Console</span>
                </div>
                <span className="text-[10px] font-mono text-teal-300 bg-teal-950/50 px-1 rounded">Disaster Ops</span>
              </button>

              <button
                onClick={() => {
                  onSelectTab('trust_engine');
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'trust_engine'
                    ? 'bg-slate-800/90 text-white border border-slate-700/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className={`w-4 h-4 ${activeTab === 'trust_engine' ? 'text-teal-400' : 'text-slate-400'}`} />
                  <span>TrustScore Engine</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </button>

              <button
                onClick={() => {
                  onSelectTab('aws_sam');
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'aws_sam'
                    ? 'bg-slate-800/90 text-white border border-slate-700/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Terminal className={`w-4 h-4 ${activeTab === 'aws_sam' ? 'text-teal-400' : 'text-slate-400'}`} />
                  <span>AWS SAM CLI & Export</span>
                </div>
                <span className="text-[10px] font-mono text-amber-300 bg-amber-950/40 px-1 rounded">Backend Spec</span>
              </button>
            </nav>
          </div>

          {/* City Filter Selection */}
          <div>
            <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Monsoon City Zone</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 px-1">
              {CITIES.map((city) => {
                const isSelected = selectedCity === (city === 'All Cities' ? 'all' : city);
                return (
                  <button
                    key={city}
                    onClick={() => {
                      onSelectCity(city === 'All Cities' ? 'all' : city);
                    }}
                    className={`px-2.5 py-1.5 rounded-md text-xs font-medium text-left truncate transition-colors ${
                      isSelected
                        ? 'bg-teal-900/60 text-teal-200 border border-teal-700/80 shadow-xs'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    {city}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Info & Reset */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-slate-500" />
              <span>Demo dataset active</span>
            </span>
            <button
              onClick={onResetData}
              title="Reset demonstration data to initial sample state"
              className="text-slate-400 hover:text-teal-400 transition-colors flex items-center gap-1 text-[11px]"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
          <div className="text-[10px] text-slate-500 leading-tight">
            Bharat Builds Environmental Hacks · OpenStreetMap Engine
          </div>
        </div>
      </aside>
    </>
  );
};
