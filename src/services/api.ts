import { FloodIncident, HotspotZone, NewReportPayload } from '../types';
import { INITIAL_INCIDENTS, HISTORIC_HOTSPOTS } from '../data/sampleIncidents';
import { calculateTrustScore } from '../utils/trustScore';

const STORAGE_KEY = 'floodlens_incidents_v2';
const HOTSPOTS_KEY = 'floodlens_hotspots_v1';

// Check if an external AWS SAM Lambda API URL is configured in environment
export const AWS_API_BASE_URL = import.meta.env.VITE_AWS_API_BASE_URL || '';
export const IS_AWS_CONNECTED = Boolean(AWS_API_BASE_URL && AWS_API_BASE_URL.startsWith('http'));

class IncidentService {
  private getStoredIncidents(): FloodIncident[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // fallback
    }
    // initialize
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_INCIDENTS));
    return INITIAL_INCIDENTS;
  }

  private saveIncidents(incidents: FloodIncident[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(incidents));
    } catch (err) {
      console.error('Failed to save incidents to localStorage', err);
    }
  }

  public async getIncidents(): Promise<FloodIncident[]> {
    // If AWS SAM API URL is configured, route to live Lambda endpoint
    if (IS_AWS_CONNECTED) {
      try {
        const response = await fetch(`${AWS_API_BASE_URL}/api/v1/incidents`);
        if (response.ok) {
          const data = await response.json();
          return data;
        }
      } catch (err) {
        console.warn('AWS Lambda endpoint unreachable, falling back to local dataset:', err);
      }
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        const incidents = this.getStoredIncidents();
        // Dynamically update TrustScores based on real elapsed time
        const updated = incidents.map(inc => ({
          ...inc,
          trustScore: calculateTrustScore({
            reportedTimestamp: inc.timestamp,
            corroborationCount: inc.corroborationCount,
            hasPhoto: Boolean(inc.photoUrl),
            reporterRole: inc.reportedBy.role,
            waterDepthCm: inc.waterDepthCm,
            severity: inc.severity
          })
        }));
        resolve(updated);
      }, 50);
    });
  }

  public getHotspots(): Promise<HotspotZone[]> {
    return new Promise((resolve) => {
      resolve(HISTORIC_HOTSPOTS);
    });
  }

  public async submitReport(payload: NewReportPayload): Promise<FloodIncident> {
    const timestamp = Date.now();
    const hasPhoto = Boolean(payload.photoUrl);

    // If AWS SAM API URL is configured, route to live Lambda endpoint
    if (IS_AWS_CONNECTED) {
      try {
        const response = await fetch(`${AWS_API_BASE_URL}/api/v1/reports`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (response.ok) {
          const liveIncident = await response.json();
          return liveIncident;
        }
      } catch (err) {
        console.warn('AWS Lambda report submission failed, falling back to local persistence:', err);
      }
    }
    
    // Check if there are existing active reports nearby (< 600m) to auto-corroborate
    const existing = this.getStoredIncidents();
    const nearbyReports = existing.filter(inc => {
      const dLat = Math.abs(inc.coordinates[0] - payload.coordinates[0]);
      const dLng = Math.abs(inc.coordinates[1] - payload.coordinates[1]);
      // Approx 0.005 deg is ~550m
      return dLat < 0.006 && dLng < 0.006 && inc.city === payload.city;
    });

    const initialCorroboration = nearbyReports.length;

    const trustScore = calculateTrustScore({
      reportedTimestamp: timestamp,
      corroborationCount: initialCorroboration,
      hasPhoto,
      reporterRole: payload.reporterRole,
      waterDepthCm: payload.waterDepthCm,
      severity: payload.severity
    });

    const newIncident: FloodIncident = {
      id: `fl-rep-${Date.now().toString(36)}`,
      title: payload.title,
      locationName: payload.locationName,
      landmark: payload.landmark,
      wardOrDistrict: payload.wardOrDistrict,
      city: payload.city,
      coordinates: payload.coordinates,
      severity: payload.severity,
      waterDepthCm: payload.waterDepthCm,
      reportedAt: 'Just now',
      timestamp,
      description: payload.description,
      roadType: payload.roadType,
      status: 'active',
      photoUrl: payload.photoUrl,
      corroborationCount: initialCorroboration,
      corroborationIds: nearbyReports.map(n => n.id),
      reportedBy: {
        name: payload.reporterName || 'Anonymous Citizen',
        role: payload.reporterRole,
        isVerifiedBadge: payload.reporterRole !== 'Citizen Commuter'
      },
      trustScore,
      isSampleData: false
    };

    const updatedList = [newIncident, ...existing];
    this.saveIncidents(updatedList);

    return newIncident;
  }

  public async corroborateIncident(incidentId: string): Promise<FloodIncident> {
    const existing = this.getStoredIncidents();
    const index = existing.findIndex(i => i.id === incidentId);
    if (index === -1) throw new Error('Incident not found');

    const inc = existing[index];
    const newCorroborationCount = inc.corroborationCount + 1;

    const newTrustScore = calculateTrustScore({
      reportedTimestamp: inc.timestamp,
      corroborationCount: newCorroborationCount,
      hasPhoto: Boolean(inc.photoUrl),
      reporterRole: inc.reportedBy.role,
      waterDepthCm: inc.waterDepthCm,
      severity: inc.severity
    });

    const updated: FloodIncident = {
      ...inc,
      corroborationCount: newCorroborationCount,
      trustScore: newTrustScore
    };

    existing[index] = updated;
    this.saveIncidents(existing);
    return updated;
  }

  public async updateAuthorityAction(
    incidentId: string, 
    actionType: 'Pump Dispatched' | 'Traffic Diversion' | 'Inspection Scheduled' | 'Barricade Erected' | 'Drain Cleared',
    notes: string,
    authorityName: string
  ): Promise<FloodIncident> {
    const existing = this.getStoredIncidents();
    const index = existing.findIndex(i => i.id === incidentId);
    if (index === -1) throw new Error('Incident not found');

    const inc = existing[index];
    let newStatus = inc.status;
    if (actionType === 'Drain Cleared') {
      newStatus = 'cleared';
    } else if (actionType === 'Pump Dispatched' || actionType === 'Traffic Diversion') {
      newStatus = 'under_inspection';
    }

    const updated: FloodIncident = {
      ...inc,
      status: newStatus,
      authorityAction: {
        actionType,
        updatedAt: 'Just now',
        authorityName,
        notes
      }
    };

    existing[index] = updated;
    this.saveIncidents(existing);
    return updated;
  }

  public resetToSampleData(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_INCIDENTS));
  }
}

export const incidentService = new IncidentService();
