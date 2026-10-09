import React, { useState } from 'react';
import { FloodIncident, HotspotZone } from '../types';
import { 
  Building2, 
  AlertTriangle, 
  Wrench, 
  Download, 
  CheckCircle, 
  Truck, 
  ShieldAlert, 
  Droplet,
  ExternalLink,
  Flame,
  ArrowUpRight
} from 'lucide-react';

interface AuthorityConsoleProps {
  incidents: FloodIncident[];
  hotspots: HotspotZone[];
  onUpdateAction: (
    incidentId: string,
    actionType: 'Pump Dispatched' | 'Traffic Diversion' | 'Inspection Scheduled' | 'Barricade Erected' | 'Drain Cleared',
    notes: string,
    authorityName: string
  ) => Promise<void>;
  onSelectIncident: (incident: FloodIncident) => void;
}

export const AuthorityConsole: React.FC<AuthorityConsoleProps> = ({
  incidents,
  hotspots,
  onUpdateAction,
  onSelectIncident,
}) => {
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(incidents[0]?.id || '');
  const [actionType, setActionType] = useState<'Pump Dispatched' | 'Traffic Diversion' | 'Inspection Scheduled' | 'Barricade Erected' | 'Drain Cleared'>('Pump Dispatched');
  const [authorityName, setAuthorityName] = useState('MCGM / BBMP Rapid Flood Response Cell');
  const [actionNotes, setActionNotes] = useState('Dispatching 500 HP mobile diesel pump truck to clear intake bottleneck.');
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState('');

  const activeIncidents = incidents.filter(i => i.status !== 'cleared');
  const highIncidents = incidents.filter(i => i.severity === 'high');

  const handleDispatchAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncidentId) return;
    setIsUpdating(true);
    setStatusFeedback('');
    try {
      await onUpdateAction(selectedIncidentId, actionType, actionNotes, authorityName);
      setStatusFeedback(`Success: Action "${actionType}" logged and broadcasted to commuters!`);
      setTimeout(() => setStatusFeedback(''), 4000);
    } catch (err: any) {
      setStatusFeedback(`Error: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleExportCSV = () => {
    const headers = 'ID,City,Location,Severity,WaterDepthCm,TrustScore,Status,ReportedAt\n';
    const rows = incidents.map(i => 
      `"${i.id}","${i.city}","${i.locationName.replace(/"/g, '""')}","${i.severity}",${i.waterDepthCm},${i.trustScore.score},"${i.status}","${i.reportedAt}"`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `floodlens_inspection_manifest_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Municipal Corporation & Disaster Response Desk · Demonstration Console
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Civic Operations & Chronic Hotspot Prioritization
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Cross-correlates citizen-verified waterlogging with historical drainage bottlenecks to dispatch dewatering assets and traffic diversions before underpass failure occurs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <Download className="w-4 h-4 text-teal-400" />
              <span>Export CSV Manifest</span>
            </button>
          </div>
        </div>

        {/* Priority Quick Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800">
          <div>
            <span className="text-[11px] text-slate-400 block">Critical Underpasses</span>
            <span className="text-2xl font-bold font-mono text-red-400 tabular-nums">
              {highIncidents.length}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block">Monitored Drain Sump Hotspots</span>
            <span className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
              {hotspots.length}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block">Active Municipal Teams</span>
            <span className="text-2xl font-bold font-mono text-teal-400 tabular-nums">
              14 Units
            </span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block">Average Response Latency</span>
            <span className="text-2xl font-bold font-mono text-slate-200 tabular-nums">
              18 mins
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Chronic Hotspot Prioritization Matrix + Dispatch Desk */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Chronic Hotspot Priority Table (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Chronic Monsoon Flood Hotspot Matrix
              </h3>
              <p className="text-xs text-slate-500">
                Ranked by recurrence frequency, elevation depression depth, and transit criticality.
              </p>
            </div>
            <span className="text-xs font-mono font-medium text-slate-500">
              {hotspots.length} Priority Zones
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-600 font-semibold">
                  <th className="py-2.5 px-3">Hotspot Zone</th>
                  <th className="py-2.5 px-3">City / Ward</th>
                  <th className="py-2.5 px-3">Inspection Priority</th>
                  <th className="py-2.5 px-3">Drainage Status</th>
                  <th className="py-2.5 px-3 text-right">Recurrence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {hotspots.map((hs) => {
                  const isCritical = hs.inspectionPriority.includes('Critical');
                  return (
                    <tr key={hs.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{hs.name}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {hs.criticalInfrastructureNearby}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-medium text-slate-800">{hs.city}</span>
                        <span className="block text-[11px] text-slate-500">{hs.ward}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1 font-semibold text-[11px] px-2 py-0.5 rounded border ${
                          isCritical
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {hs.inspectionPriority}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-slate-700 font-medium">{hs.drainageStatus}</span>
                        <span className="block text-[11px] text-slate-500 line-clamp-1">
                          {hs.recommendedMitigation}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-slate-800">
                        {hs.recurringIncidentsCount} times
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Real-time Dispatch Control Console */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between">
          <form onSubmit={handleDispatchAction} className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-teal-700" />
                <h3 className="font-bold text-sm text-slate-900">
                  Authority Action Dispatch
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Issue authoritative status updates visible to commuters and ward field crew.
              </p>
            </div>

            {statusFeedback && (
              <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-200 text-xs text-teal-900 font-medium">
                {statusFeedback}
              </div>
            )}

            {/* Select Target Incident */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Flood Incident *
              </label>
              <select
                value={selectedIncidentId}
                onChange={(e) => setSelectedIncidentId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              >
                {activeIncidents.map((inc) => (
                  <option key={inc.id} value={inc.id}>
                    [{inc.city}] {inc.locationName} ({inc.waterDepthCm}cm - {inc.severity})
                  </option>
                ))}
              </select>
            </div>

            {/* Action Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Operational Intervention *
              </label>
              <select
                value={actionType}
                onChange={(e) => setActionType(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              >
                <option value="Pump Dispatched">Dispatch Dewatering Pump Truck</option>
                <option value="Barricade Erected">Close Road & Erect Barricade</option>
                <option value="Traffic Diversion">Issue Traffic Police Diversion</option>
                <option value="Inspection Scheduled">Schedule Ward Engineer Inspection</option>
                <option value="Drain Cleared">Mark Submergence Cleared</option>
              </select>
            </div>

            {/* Authority Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Responding Authority / Cell
              </label>
              <input
                type="text"
                value={authorityName}
                onChange={(e) => setAuthorityName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>

            {/* Field Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dispatch Broadcast Notes
              </label>
              <textarea
                rows={3}
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdating || !selectedIncidentId}
              className="w-full py-2.5 px-4 bg-teal-700 hover:bg-teal-600 text-white font-semibold rounded-xl text-xs transition-colors shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>{isUpdating ? 'Broadcasting...' : 'Broadcast Operational Action'}</span>
            </button>
          </form>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            Actions update the live map and incident feed instantly for citizen awareness.
          </div>
        </div>
      </div>
    </div>
  );
};
