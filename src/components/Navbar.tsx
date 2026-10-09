import React from 'react';
import { Menu, PlusCircle, Search, ShieldAlert, Download, SlidersHorizontal } from 'lucide-react';
import { ActiveTab } from './Sidebar';

interface NavbarProps {
  activeTab: ActiveTab;
  onOpenMobileMenu: () => void;
  onOpenReportModal: () => void;
  onOpenExportModal: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCity: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onOpenMobileMenu,
  onOpenReportModal,
  onOpenExportModal,
  searchQuery,
  onSearchChange,
  selectedCity,
}) => {
  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Street-Level Flood Intelligence Map';
      case 'incidents':
        return 'Crowdsourced Incident Feed & Verification';
      case 'authority':
        return 'Municipal Disaster Response & Hotspots';
      case 'trust_engine':
        return 'FloodLens TrustScore Algorithm Transparency';
      case 'aws_sam':
        return 'AWS SAM CLI Serverless Architecture';
      default:
        return 'Flood Intelligence';
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 flex items-center justify-between gap-4">
      {/* Zone 1: Mobile toggle + Breadcrumb Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>FloodLens</span>
            <span aria-hidden="true">/</span>
            <span className="font-medium text-teal-700 capitalize">
              {selectedCity === 'all' ? 'National Grid' : selectedCity}
            </span>
          </div>
          <h1 className="text-base font-bold text-slate-900 tracking-tight truncate">
            {getTabTitle()}
          </h1>
        </div>
      </div>

      {/* Zone 2: Search input */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search landmarks (e.g. Milan Subway, Bellandur, Silk Board)..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Zone 3: Primary Action & Export */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          onClick={onOpenExportModal}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
          title="Export Source Code & AWS SAM template"
        >
          <Download className="w-3.5 h-3.5 text-slate-600" />
          <span>Export Source</span>
        </button>

        <button
          onClick={onOpenReportModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-lg transition-colors shadow-sm shadow-teal-700/20 whitespace-nowrap"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Report Flooding</span>
        </button>
      </div>
    </header>
  );
};
