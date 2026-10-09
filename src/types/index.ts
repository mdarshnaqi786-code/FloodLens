export type SeverityLevel = 'high' | 'moderate' | 'low';

export type RoadType = 'underpass' | 'arterial' | 'junction' | 'residential' | 'highway';

export type IncidentStatus = 'active' | 'receding' | 'cleared' | 'under_inspection';

export type ConfidenceCategory = 
  | 'High Confidence — Multi-Source'
  | 'Community Corroborated'
  | 'Single Unverified Report'
  | 'Stale / Needs Re-check';

export interface TrustScoreBreakdown {
  score: number; // 0 to 100
  confidenceLevel: ConfidenceCategory;
  freshnessMultiplier: number; // 0.0 to 1.0 based on elapsed time
  corroborationFactor: number; // boost based on adjacent reports
  evidenceBonus: number; // +15% if verified photo attached
  sourceCredibility: number; // verified warden, civil defense vs anonymous
  explanation: string;
  reasoningFactors: {
    factor: string;
    impact: 'positive' | 'neutral' | 'negative';
    detail: string;
  }[];
}

export interface FloodIncident {
  id: string;
  title: string;
  locationName: string;
  landmark: string;
  wardOrDistrict: string;
  city: 'Mumbai' | 'Bengaluru' | 'Chennai' | 'Delhi NCR' | 'Hyderabad';
  coordinates: [number, number]; // [lat, lng]
  severity: SeverityLevel;
  waterDepthCm: number;
  reportedAt: string; // ISO string or relative description
  timestamp: number; // ms epoch
  description: string;
  roadType: RoadType;
  status: IncidentStatus;
  photoUrl?: string;
  corroborationCount: number;
  corroborationIds?: string[];
  reportedBy: {
    name: string;
    role: 'Citizen Commuter' | 'Traffic Warden' | 'Flood Volunteer' | 'Municipal Field Officer';
    isVerifiedBadge: boolean;
  };
  trustScore: TrustScoreBreakdown;
  authorityAction?: {
    actionType: 'Pump Dispatched' | 'Traffic Diversion' | 'Inspection Scheduled' | 'Barricade Erected' | 'Drain Cleared';
    updatedAt: string;
    authorityName: string;
    notes: string;
  };
  isSampleData: boolean;
}

export interface HotspotZone {
  id: string;
  name: string;
  city: string;
  ward: string;
  vulnerabilityScore: number; // 1-100
  recurringIncidentsCount: number;
  criticalInfrastructureNearby: string;
  drainageStatus: 'Severely Blocked' | 'Surcharged Sump' | 'Pump Active' | 'Nominal Outfall';
  inspectionPriority: 'Critical (Immediate)' | 'High Priority' | 'Routine Monitoring';
  coordinates: [number, number];
  recommendedMitigation: string;
}

export interface IncidentFilters {
  searchQuery: string;
  selectedCity: string; // 'all' or city name
  severity: 'all' | SeverityLevel;
  roadType: 'all' | RoadType;
  minTrustScore: number;
  status: 'all' | IncidentStatus;
  sortBy: 'freshness' | 'severity' | 'trust' | 'depth';
}

export interface NewReportPayload {
  title: string;
  locationName: string;
  landmark: string;
  wardOrDistrict: string;
  city: 'Mumbai' | 'Bengaluru' | 'Chennai' | 'Delhi NCR' | 'Hyderabad';
  coordinates: [number, number];
  severity: SeverityLevel;
  waterDepthCm: number;
  roadType: RoadType;
  description: string;
  photoUrl?: string;
  reporterName: string;
  reporterRole: 'Citizen Commuter' | 'Traffic Warden' | 'Flood Volunteer' | 'Municipal Field Officer';
}
