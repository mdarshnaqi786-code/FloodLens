import React, { useState } from 'react';
import { FloodIncident } from '../types';
import { 
  X, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  ThumbsUp, 
  Camera, 
  AlertTriangle, 
  HelpCircle, 
  Building2, 
  CheckCircle2, 
  Compass, 
  FileCheck,
  Info
} from 'lucide-react';

interface IncidentDetailPanelProps {
  incident: FloodIncident | null;
  onClose: () => void;
  onCorroborate: (id: string) => Promise<void>;
}

export const IncidentDetailPanel: React.FC<IncidentDetailPanelProps> = ({
  incident,
  onClose,
  onCorroborate,
}) => {
  const [isCorroborating, setIsCorroborating] = useState(false);
  const [hasJustCorroborated, setHasJustCorroborated] = useState(false);

  if (!incident) return null;

  const handleCorroborateClick = async () => {
    if (isCorroborating || hasJustCorroborated) return;
    setIsCorroborating(true);
    try {
      await onCorroborate(incident.id);
      setHasJustCorroborated(true);
    } finally {
      setIsCorroborating(false);
    }
  };

  const isHigh = incident.severity === 'high';
  const isMod = incident.severity === 'moderate';

  // Depth description helper
  const getDepthRisk = (depthCm: number) => {
    if (depthCm >= 60) {
      return { level: 'Extreme Danger', desc: 'Vehicles stall immediately; water will float passenger cars and swept-away risk.' };
    }
    if (depthCm >= 30) {
      return { level: 'High Hazard', desc: 'Exceeds exhaust/chassis level for two-wheelers and small cars; severe stall hazard.' };
    }
    return { level: 'Cautionary Pooling', desc: 'Passable with extreme caution for large vehicles; service lanes waterlogged.' };
  };

  const depthRisk = getDepthRisk(incident.waterDepthCm);

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-md flex flex-col h-full overflow-hidden">
      {/* Panel Header */}
      <div className="p-4 border-b border-slate-100 flex items-start justify-between gap-3 bg-slate-50/70">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span className="font-semibold text-slate-700">{incident.city}</span>
            <span aria-hidden="true">·</span>
            <span>{incident.wardOrDistrict}</span>
            <span aria-hidden="true">·</span>
            <span className="capitalize text-slate-600">{incident.roadType}</span>
          </div>
          <h3 className="text-base font-bold text-slate-900 leading-snug">
            {incident.title}
          </h3>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
          aria-label="Close panel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Top Severity & Depth Strip */}
        <div className="grid grid-cols-2 gap-3">
          {/* Severity card */}
          <div className={`p-3 rounded-xl border ${
            isHigh 
              ? 'bg-red-50/50 border-red-200 text-red-950' 
              : isMod 
                ? 'bg-amber-50/50 border-amber-200 text-amber-950' 
                : 'bg-teal-50/50 border-teal-200 text-teal-950'
          }`}>
            <span className="text-[11px] font-medium uppercase tracking-wider block mb-0.5 text-slate-500">
              Severity Level
            </span>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${
                isHigh ? 'bg-red-600' : isMod ? 'bg-amber-500' : 'bg-teal-600'
              }`} />
              <span className="font-bold text-sm capitalize">{incident.severity}</span>
            </div>
            <p className="text-[11px] text-slate-600 mt-1 leading-tight">
              {depthRisk.level}
            </p>
          </div>

          {/* Water Depth Gauge */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900">
            <span className="text-[11px] font-medium uppercase tracking-wider block mb-0.5 text-slate-500">
              Recorded Depth
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono tabular-nums">{incident.waterDepthCm}</span>
              <span className="text-xs text-slate-600 font-medium">cm (~{(incident.waterDepthCm / 2.54).toFixed(1)} in)</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className={`h-full rounded-full ${isHigh ? 'bg-red-600' : isMod ? 'bg-amber-500' : 'bg-teal-600'}`}
                style={{ width: `${Math.min(100, (incident.waterDepthCm / 100) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Location & Landmark */}
        <div className="space-y-1.5 text-xs">
          <div className="flex items-start gap-2 text-slate-700">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">{incident.locationName}</p>
              <p className="text-slate-500">{incident.landmark}</p>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Coordinates: {incident.coordinates[0].toFixed(4)}, {incident.coordinates[1].toFixed(4)}
              </p>
            </div>
          </div>
        </div>

        {/* Photo Display (if attached) */}
        {incident.photoUrl ? (
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-teal-600" />
                <span>Incident Photo</span>
              </span>
              <span className={`text-[11px] font-medium ${incident.isSampleData ? 'text-slate-500' : 'text-teal-700'}`}>
                {incident.isSampleData ? 'Illustrative Scenario Photo (Demo)' : 'Citizen Uploaded Photo'}
              </span>
            </div>
            <div className="relative rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-900 group">
              <img
                src={incident.photoUrl}
                alt={incident.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute bottom-2 left-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] px-2.5 py-1 rounded">
                {incident.isSampleData ? 'Demonstration scenario photo · Simulated timestamp' : `Submitted: ${incident.reportedAt}`}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-500 flex items-center gap-2">
            <Camera className="w-4 h-4 text-slate-400 shrink-0" />
            <span>No photo attached. Citizens in the vicinity can upload visual proof to raise TrustScore.</span>
          </div>
        )}

        {/* Description Note */}
        <div>
          <span className="text-xs font-semibold text-slate-700 block mb-1">
            Field Observation
          </span>
          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/60 p-3 rounded-lg border border-slate-100">
            {incident.description}
          </p>
        </div>

        {/* SIGNATURE FEATURE: FLOODLENS TRUSTSCORE BOX */}
        <div className="p-4 rounded-xl border border-teal-200 bg-gradient-to-br from-teal-50/60 via-white to-slate-50/60 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-teal-700" />
              <div>
                <h4 className="text-xs font-bold text-teal-950 uppercase tracking-wider">
                  FloodLens TrustScore
                </h4>
                <p className="text-[11px] text-teal-800 font-medium">
                  {incident.trustScore.confidenceLevel}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black font-mono text-teal-900 tabular-nums">
                {incident.trustScore.score}%
              </span>
              <span className="block text-[10px] text-slate-500">Confidence</span>
            </div>
          </div>

          {/* Explanation text */}
          <p className="text-xs text-slate-700 bg-white/90 p-2.5 rounded-lg border border-teal-100/80 leading-relaxed">
            {incident.trustScore.explanation}
          </p>

          {/* Transparent Reasoning Breakdown Factors */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-semibold text-slate-700 block">
              Confidence Reasoning Matrix:
            </span>
            {incident.trustScore.reasoningFactors.map((f, idx) => (
              <div 
                key={idx} 
                className="flex items-start gap-2 text-[11px] py-1 border-b border-teal-100/50 last:border-none"
              >
                <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                  f.impact === 'positive' 
                    ? 'bg-teal-600' 
                    : f.impact === 'negative' 
                      ? 'bg-red-500' 
                      : 'bg-slate-400'
                }`} />
                <div>
                  <span className="font-semibold text-slate-800">{f.factor}: </span>
                  <span className="text-slate-600">{f.detail}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Corroborate Action Button */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <div className="text-[11px] text-slate-500">
              <span className="font-mono font-bold text-slate-800 tabular-nums">
                {incident.corroborationCount}
              </span> {incident.isSampleData && !hasJustCorroborated ? 'simulated confirmations (Demo)' : 'citizen confirmations'}
            </div>

            <button
              onClick={handleCorroborateClick}
              disabled={isCorroborating || hasJustCorroborated}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                hasJustCorroborated
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-teal-700 hover:bg-teal-600 text-white shadow-xs'
              }`}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>{hasJustCorroborated ? 'Corroborated in Session!' : 'Corroborate Report'}</span>
            </button>
          </div>
        </div>

        {/* Authority Action (if exists) */}
        {incident.authorityAction && (
          <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/40 text-xs space-y-1.5">
            <div className="flex items-center justify-between text-blue-900 font-semibold">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-blue-700" />
                <span>Municipal Action: {incident.authorityAction.actionType}</span>
              </span>
              <span className="text-[11px] font-mono text-blue-700">
                {incident.authorityAction.updatedAt}
              </span>
            </div>
            <p className="text-slate-700 leading-relaxed">
              {incident.authorityAction.notes}
            </p>
            <p className="text-[11px] text-slate-500">
              Dispatched by: {incident.authorityAction.authorityName}
            </p>
          </div>
        )}

        {/* Sample data label */}
        {incident.isSampleData && (
          <div className="p-2.5 rounded-lg bg-amber-50/80 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-1.5">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>Demonstration Record: Seeded simulation data for WeMakeDevs Bharat Builds hackathon evaluation. Do not use for emergency evacuation routing.</span>
          </div>
        )}
      </div>
    </div>
  );
};
