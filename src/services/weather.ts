export interface HourlyPrecipitation {
  label: string; // e.g. "+1h", "+2h" or "14:00"
  isoTime: string;
  precipitationMm: number;
}

export interface LiveRainfallData {
  city: string;
  latitude: number;
  longitude: number;
  currentPrecipitationMm: number;
  hourlyForecast: HourlyPrecipitation[]; // next 6 hours
  lastUpdatedTimestamp: number;
  lastUpdatedFormatted: string;
  isStale: boolean;
  status: 'live' | 'stale' | 'error';
  errorMessage?: string;
}

export const CITY_COORDINATES_MAP: Record<string, { name: string; lat: number; lng: number }> = {
  Mumbai: { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
  Bengaluru: { name: 'Bengaluru', lat: 12.9716, lng: 77.5946 },
  Chennai: { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
  'Delhi NCR': { name: 'Delhi NCR', lat: 28.6139, lng: 77.2090 },
  Hyderabad: { name: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
  all: { name: 'National Grid (Mumbai Reference)', lat: 19.0760, lng: 72.8777 }
};

/**
 * Fetch real-time rainfall data from Open-Meteo free forecast API
 * No API key required.
 */
export async function fetchLiveRainfall(
  cityName: string,
  signal?: AbortSignal
): Promise<LiveRainfallData> {
  const target = CITY_COORDINATES_MAP[cityName] || CITY_COORDINATES_MAP['Mumbai'];
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${target.lat}&longitude=${target.lng}&current=precipitation,rain&hourly=precipitation&forecast_days=2&timezone=auto`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    },
    signal
  });

  if (!response.ok) {
    throw new Error(`Open-Meteo returned status ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  if (!data || !data.current || !data.hourly) {
    throw new Error('Incomplete weather payload received from Open-Meteo');
  }

  const currentMm = typeof data.current.precipitation === 'number' 
    ? Math.max(0, data.current.precipitation) 
    : 0;

  // Find index for current hour or closest hour
  const hourlyTimes: string[] = data.hourly.time || [];
  const hourlyPrecip: number[] = data.hourly.precipitation || [];
  const currentTimeIso = data.current.time;

  let startIndex = hourlyTimes.findIndex(t => t >= currentTimeIso);
  if (startIndex === -1) {
    startIndex = 0;
  }

  // Extract next 6 hours
  const hourlyForecast: HourlyPrecipitation[] = [];
  for (let i = 1; i <= 6; i++) {
    const idx = startIndex + i;
    if (idx < hourlyTimes.length) {
      const rawIso = hourlyTimes[idx];
      let timeLabel = `+${i}h`;
      try {
        const d = new Date(rawIso);
        timeLabel = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
      } catch {
        // fallback
      }
      hourlyForecast.push({
        label: timeLabel,
        isoTime: rawIso,
        precipitationMm: typeof hourlyPrecip[idx] === 'number' ? Math.max(0, hourlyPrecip[idx]) : 0
      });
    }
  }

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

  return {
    city: target.name,
    latitude: target.lat,
    longitude: target.lng,
    currentPrecipitationMm: currentMm,
    hourlyForecast,
    lastUpdatedTimestamp: Date.now(),
    lastUpdatedFormatted: timeStr,
    isStale: false,
    status: 'live'
  };
}
