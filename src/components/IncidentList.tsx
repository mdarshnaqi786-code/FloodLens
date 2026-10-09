import React from 'react';
import { FloodIncident, SeverityLevel, RoadType } from '../types';
import { 
  Filter, 
  MapPin, 
  Camera, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  ArrowUpDown,
  Building,
  Droplets
} from 'lucide-react';

interface IncidentListProps {
  incidents: FloodIncident[];
  selectedIncident: FloodIncident | null;
  onSelectIncident: (incident: FloodIncident) => void;
  severityFilter: 'all' | SeverityLevel;
  onSeverityFilterChange: (s: 'all' | SeverityLevel) => void;
  roadTypeFilter: 'all' | RoadType;
  onRoadTypeFilterChange: (r: 'all' | RoadType) => void;
  sortBy: 'freshness' | 'severity' | 'trust' | 'depth';
  onSortByChange: (s: 'freshness' | 'severity' | 'trust' | 'depth') => void;
}

export const IncidentList: React.FC<IncidentListProps> = ({
  incidents,
  selectedIncident,
  onSelectIncident,
  severityFilter,
  onSeverityFilterChange,
  roadTypeFilter,
  onRoadTypeFilterChange,
  sortBy,
  onSortByChange,
}) => {
  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Header and Filter Controls */}
      <div className="p-4 border-b border-slate-100 space-y-3 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-slate-900">Incident Feed</h3>
            <span className="text-xs text-slate-500 font-mono tabular-nums">
              ({incidents.length} results)
            </span>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value as any)}
              className="bg-white border border-slate-200 rounded-md px-2 py-1 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="freshness">Sort by Freshness</option>
              <option value="severity">Sort by Severity</option>
              <option value="depth">Sort by Water Depth</option>
              <option value="trust">Sort by TrustScore</option>
            </select>
          </div>
        </div>

        {/* Filter Segmented Buttons */}
        <div className="flex flex-wrap items-center gap-1 text-xs">
          <button
            onClick={() => onSeverityFilterChange('all')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
              severityFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Severity
          </button>
          <button
            onClick={() => onSeverityFilterChange('high')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
              severityFilter === 'high'
                ? 'bg-red-600 text-white'
                : 'bg-white border border-slate-200 text-red-600 hover:bg-red-50'
            }`}
          >
            High (&gt;50cm)
          </button>
          <button
            onClick={() => onSeverityFilterChange('moderate')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
              severityFilter === 'moderate'
                ? 'bg-amber-600 text-white'
                : 'bg-white border border-slate-200 text-amber-700 hover:bg-amber-50'
            }`}
          >
            Moderate
          </button>
          <button
            onClick={() => onSeverityFilterChange('low')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
              severityFilter === 'low'
                ? 'bg-teal-700 text-white'
                : 'bg-white border border-slate-200 text-teal-800 hover:bg-teal-50'
            }`}
          >
            Low
          </button>
        </div>
      </div>

      {/* Incident List Body */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {incidents.length === 0 ? (
          <div className="p-8 text-center text-slate-500 space-y-2">
            <Droplets className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-medium text-slate-700">No matching incidents found</p>
            <p className="text-xs text-slate-400">
              Try adjusting your search criteria or city filter.
            </p>
          </div>
        ) : (
          incidents.map((incident) => {
            const isSelected = selectedIncident?.id === incident.id;
            const isHigh = incident.severity === 'high';
            const isMod = incident.severity === 'moderate';

            return (
              <div
                key={incident.id}
                onClick={() => onSelectIncident(incident)}
                className={`p-3.5 hover:bg-slate-50/80 transition-colors cursor-pointer ${
                  isSelected ? 'bg-teal-50/40 border-l-2 border-teal-600' : ''
                }`}
              >
                {/* Unboxed Metadata Line */}
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-semibold text-slate-700">{incident.city}</span>
                    <span aria-hidden="true">·</span>
                    <span className="truncate">{incident.wardOrDistrict}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 font-mono text-[11px]">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{incident.reportedAt}</span>
                  </div>
                </div>

                {/* Incident Title */}
                <h4 className="text-sm font-bold text-slate-900 leading-snug mb-1">
                  {incident.title}
                </h4>

                {/* Landmark line */}
                <p className="text-xs text-slate-600 line-clamp-1 mb-2">
                  <span className="text-slate-400">Landmark: </span>
                  {incident.landmark}
                </p>

                {/* Bottom Metrics Bar */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-3">
                    {/* Severity indicator */}
                    <div className="flex items-center gap-1">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isHigh ? 'bg-red-600' : isMod ? 'bg-amber-500' : 'bg-teal-600'
                        }`}
                      />
                      <span
                        className={`font-semibold capitalize text-[11px] ${
                          isHigh ? 'text-red-700' : isMod ? 'text-amber-800' : 'text-teal-800'
                        }`}
                      >
                        {incident.severity}
                      </span>
                    </div>

                    {/* Depth */}
                    <span className="font-mono text-slate-700 tabular-nums text-[11px]">
                      {incident.waterDepthCm} cm deep
                    </span>

                    {incident.isSampleData && (
                      <span className="text-[10px] text-slate-400 font-medium">
                        (Demo)
                      </span>
                    )}

                    {/* Photo Tag */}
                    {incident.photoUrl && (
                      <span className="flex items-center gap-0.5 text-[11px] text-slate-500">
                        <Camera className="w-3 h-3 text-slate-400" />
                        <span>Photo</span>
                      </span>
                    )}
                  </div>

                  {/* TrustScore */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-400">TrustScore</span>
                    <span className="font-mono font-bold text-xs text-teal-800 tabular-nums">
                      {incident.trustScore.score}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
