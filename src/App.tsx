import React, { useState, useEffect, useMemo } from 'react';
import { 
  FloodIncident, 
  HotspotZone, 
  NewReportPayload, 
  SeverityLevel, 
  RoadType 
} from './types';
import { incidentService } from './services/api';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { IncidentStats } from './components/IncidentStats';
import { MapView } from './components/MapView';
import { IncidentList } from './components/IncidentList';
import { IncidentDetailPanel } from './components/IncidentDetailPanel';
import { ReportFloodModal } from './components/ReportFloodModal';
import { AuthorityConsole } from './components/AuthorityConsole';
import { TrustScoreExplainer } from './components/TrustScoreExplainer';
import { AwsSamModal } from './components/AwsSamModal';
import { LiveRainfallWidget } from './components/LiveRainfallWidget';
import { CIVIC_SAFETY_NOTICE } from './utils/trustScore';
import { 
  ShieldAlert, 
  PlusCircle, 
  Layers, 
  Sparkles, 
  RefreshCw,
  Info,
  MapPin
} from 'lucide-react';

export default function App() {
  const [incidents, setIncidents] = useState<FloodIncident[]>([]);
  const [hotspots, setHotspots] = useState<HotspotZone[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Navigation & View State
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<FloodIncident | null>(null);

  // Filters State
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<'all' | SeverityLevel>('all');
  const [roadTypeFilter, setRoadTypeFilter] = useState<'all' | RoadType>('all');
  const [sortBy, setSortBy] = useState<'freshness' | 'severity' | 'trust' | 'depth'>('freshness');

  // Modals & Map interactions
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isAwsModalOpen, setIsAwsModalOpen] = useState(false);
  const [showHotspotsOnMap, setShowHotspotsOnMap] = useState(true);
  const [isPinDropping, setIsPinDropping] = useState(false);
  const [droppedCoords, setDroppedCoords] = useState<[number, number] | null>(null);

  // When city changes, auto-select an incident from that city if current is in another city
  const handleSelectCity = (city: string) => {
    setSelectedCity(city);
    if (city !== 'all') {
      const match = incidents.find((i) => i.city.toLowerCase() === city.toLowerCase());
      if (match) {
        setSelectedIncident(match);
      }
    }
  };
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [fetchedIncidents, fetchedHotspots] = await Promise.all([
        incidentService.getIncidents(),
        incidentService.getHotspots(),
      ]);
      setIncidents(fetchedIncidents);
      setHotspots(fetchedHotspots);
      if (fetchedIncidents.length > 0 && !selectedIncident) {
        setSelectedIncident(fetchedIncidents[0]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter and sort incidents
  const filteredIncidents = useMemo(() => {
    return incidents
      .filter((inc) => {
        // City filter
        if (selectedCity !== 'all' && inc.city.toLowerCase() !== selectedCity.toLowerCase()) {
          return false;
        }
        // Severity filter
        if (severityFilter !== 'all' && inc.severity !== severityFilter) {
          return false;
        }
        // Road type filter
        if (roadTypeFilter !== 'all' && inc.roadType !== roadTypeFilter) {
          return false;
        }
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = inc.title.toLowerCase().includes(q);
          const matchLoc = inc.locationName.toLowerCase().includes(q);
          const matchLandmark = inc.landmark.toLowerCase().includes(q);
          const matchWard = inc.wardOrDistrict.toLowerCase().includes(q);
          const matchCity = inc.city.toLowerCase().includes(q);
          if (!matchTitle && !matchLoc && !matchLandmark && !matchWard && !matchCity) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'severity') {
          const weight = { high: 3, moderate: 2, low: 1 };
          return weight[b.severity] - weight[a.severity];
        }
        if (sortBy === 'depth') {
          return b.waterDepthCm - a.waterDepthCm;
        }
        if (sortBy === 'trust') {
          return b.trustScore.score - a.trustScore.score;
        }
        // default freshness
        return b.timestamp - a.timestamp;
      });
  }, [incidents, selectedCity, severityFilter, roadTypeFilter, searchQuery, sortBy]);

  // Submit report handler
  const handleReportSubmit = async (payload: NewReportPayload) => {
    const newInc = await incidentService.submitReport(payload);
    // Reload state
    const updated = await incidentService.getIncidents();
    setIncidents(updated);
    setSelectedIncident(newInc);
    setDroppedCoords(null);
    setIsPinDropping(false);
  };

  // Corroborate report handler
  const handleCorroborate = async (incidentId: string) => {
    const updated = await incidentService.corroborateIncident(incidentId);
    setIncidents((prev) => prev.map((i) => (i.id === incidentId ? updated : i)));
    setSelectedIncident(updated);
  };

  // Authority action update handler
  const handleAuthorityAction = async (
    incidentId: string,
    actionType: 'Pump Dispatched' | 'Traffic Diversion' | 'Inspection Scheduled' | 'Barricade Erected' | 'Drain Cleared',
    notes: string,
    authorityName: string
  ) => {
    const updated = await incidentService.updateAuthorityAction(incidentId, actionType, notes, authorityName);
    setIncidents((prev) => prev.map((i) => (i.id === incidentId ? updated : i)));
    if (selectedIncident?.id === incidentId) {
      setSelectedIncident(updated);
    }
  };

  // Reset to initial sample data
  const handleResetData = async () => {
    incidentService.resetToSampleData();
    await loadData();
  };

  // Map click handler for dropping pin
  const handleMapClickDropPin = (coords: [number, number]) => {
    if (isPinDropping) {
      setDroppedCoords(coords);
      setIsPinDropping(false);
      setIsReportModalOpen(true);
    }
  };

  const highSeverityCount = incidents.filter((i) => i.severity === 'high').length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        selectedCity={selectedCity}
        onSelectCity={handleSelectCity}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onResetData={handleResetData}
        totalIncidentsCount={incidents.length}
        highSeverityCount={highSeverityCount}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0 min-h-screen">
        {/* Top Navbar */}
        <Navbar
          activeTab={activeTab}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenReportModal={() => setIsReportModalOpen(true)}
          onOpenExportModal={() => setIsAwsModalOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCity={selectedCity}
        />

        {/* Global Civic Safety Alert Banner */}
        <div className="bg-amber-500/10 border-b border-amber-200/80 px-4 lg:px-8 py-2 text-xs text-amber-950 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
            <span className="font-semibold">Civic Guardrail:</span>
            <span>{CIVIC_SAFETY_NOTICE.NO_SAFE_ROUTING}</span>
          </div>
          <span className="text-[11px] text-amber-900/80 font-mono hidden md:inline">
            Demonstration Dataset · Hackathon Edition
          </span>
        </div>

        {/* Main View Router */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <div className="space-y-4">
              {/* Stats Bar */}
              <IncidentStats incidents={filteredIncidents} />

              {/* Live Rainfall Intelligence Widget */}
              <LiveRainfallWidget selectedCity={selectedCity} />

              {/* Main Split: Interactive Leaflet Map + Side Feed / Detail Panel */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-270px)] min-h-[580px]">
                {/* Large Interactive Leaflet Map (7 cols) */}
                <div className="lg:col-span-7 h-full flex flex-col">
                  <MapView
                    incidents={filteredIncidents}
                    hotspots={hotspots}
                    selectedIncident={selectedIncident}
                    onSelectIncident={setSelectedIncident}
                    selectedCity={selectedCity}
                    isPinDropping={isPinDropping}
                    droppedCoords={droppedCoords}
                    onMapClickDropPin={handleMapClickDropPin}
                    showHotspots={showHotspotsOnMap}
                    onToggleHotspots={() => setShowHotspotsOnMap(!showHotspotsOnMap)}
                  />
                </div>

                {/* Side Split: Incident Feed or Selected Detail (5 cols) */}
                <div className="lg:col-span-5 h-full flex flex-col">
                  {selectedIncident ? (
                    <IncidentDetailPanel
                      incident={selectedIncident}
                      onClose={() => setSelectedIncident(null)}
                      onCorroborate={handleCorroborate}
                    />
                  ) : (
                    <IncidentList
                      incidents={filteredIncidents}
                      selectedIncident={selectedIncident}
                      onSelectIncident={setSelectedIncident}
                      severityFilter={severityFilter}
                      onSeverityFilterChange={setSeverityFilter}
                      roadTypeFilter={roadTypeFilter}
                      onRoadTypeFilterChange={setRoadTypeFilter}
                      sortBy={sortBy}
                      onSortByChange={setSortBy}
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'incidents' && (
            <div className="max-w-6xl mx-auto space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Comprehensive Incident Feed & Verification
                  </h2>
                  <p className="text-xs text-slate-500">
                    All crowdsourced inundation observations sorted by temporal decay and corroboration.
                  </p>
                </div>
                <button
                  onClick={() => setIsReportModalOpen(true)}
                  className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Report New Inundation</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
                <div className="lg:col-span-6">
                  <IncidentList
                    incidents={filteredIncidents}
                    selectedIncident={selectedIncident}
                    onSelectIncident={setSelectedIncident}
                    severityFilter={severityFilter}
                    onSeverityFilterChange={setSeverityFilter}
                    roadTypeFilter={roadTypeFilter}
                    onRoadTypeFilterChange={setRoadTypeFilter}
                    sortBy={sortBy}
                    onSortByChange={setSortBy}
                  />
                </div>
                <div className="lg:col-span-6">
                  {selectedIncident ? (
                    <IncidentDetailPanel
                      incident={selectedIncident}
                      onClose={() => setSelectedIncident(null)}
                      onCorroborate={handleCorroborate}
                    />
                  ) : (
                    <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 h-full flex flex-col items-center justify-center space-y-2">
                      <MapPin className="w-8 h-8 text-slate-300" />
                      <p className="text-sm font-semibold text-slate-700">Select an incident to view deep intelligence</p>
                      <p className="text-xs text-slate-400">
                        View photographic proof, road topography, and the full TrustScore reasoning breakdown.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'authority' && (
            <div className="max-w-6xl mx-auto">
              <AuthorityConsole
                incidents={incidents}
                hotspots={hotspots}
                onUpdateAction={handleAuthorityAction}
                onSelectIncident={(inc) => {
                  setSelectedIncident(inc);
                  setActiveTab('dashboard');
                }}
              />
            </div>
          )}

          {activeTab === 'trust_engine' && (
            <div className="py-2">
              <TrustScoreExplainer />
            </div>
          )}

          {activeTab === 'aws_sam' && (
            <div className="max-w-5xl mx-auto">
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                      AWS SAM CLI Serverless Architecture Blueprint
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Designed for production scale with Amazon API Gateway, Node.js 20 Lambda functions, DynamoDB, and Amazon S3.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsAwsModalOpen(true)}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-xl shadow-sm cursor-pointer"
                  >
                    View SAM Template & Export Guide
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="text-xs font-bold text-teal-800 uppercase tracking-wider block">1. Serverless Ingestion</span>
                    <h4 className="text-sm font-bold text-slate-900">HTTP API Gateway</h4>
                    <p className="text-xs text-slate-600">
                      Ultra-low latency ingress with CORS handling and auto-scaling to absorb sudden report spikes during monsoon cloudbursts.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="text-xs font-bold text-teal-800 uppercase tracking-wider block">2. Scoring Engine</span>
                    <h4 className="text-sm font-bold text-slate-900">AWS Lambda (ARM64)</h4>
                    <p className="text-xs text-slate-600">
                      Executes the deterministic FloodLens TrustScore algorithm, calculating spatial proximity and temporal decay in sub-30ms.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="text-xs font-bold text-teal-800 uppercase tracking-wider block">3. Ephemeral Persistence</span>
                    <h4 className="text-sm font-bold text-slate-900">DynamoDB with TTL</h4>
                    <p className="text-xs text-slate-600">
                      Stores reports partitioned by City and GeoHash with automatic Time-to-Live (TTL) deletion after 48 hours to prevent stale ghost records.
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-slate-900 text-slate-200 space-y-3 font-mono text-xs">
                  <span className="text-teal-400 font-bold block">// Quick Deploy via AWS SAM CLI</span>
                  <div className="text-slate-400 space-y-1">
                    <div># 1. Build serverless artifacts</div>
                    <div className="text-white">$ sam build</div>
                    <div className="pt-2"># 2. Deploy guided CloudFormation stack</div>
                    <div className="text-white">$ sam deploy --guided</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Report Flood Submission Modal */}
      <ReportFloodModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={handleReportSubmit}
        droppedCoords={droppedCoords}
        onActivatePinDrop={() => {
          setIsPinDropping(true);
          setActiveTab('dashboard');
        }}
        selectedCity={selectedCity}
      />

      {/* AWS SAM Architecture & Code Export Modal */}
      <AwsSamModal
        isOpen={isAwsModalOpen}
        onClose={() => setIsAwsModalOpen(false)}
      />
    </div>
  );
}
