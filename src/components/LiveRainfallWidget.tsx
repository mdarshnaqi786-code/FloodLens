import React, { useEffect, useState, useRef, useCallback } from 'react';
import { 
  CloudRain, 
  RefreshCw, 
  AlertCircle, 
  ExternalLink, 
  Clock, 
  Info,
  Droplets,
  Calendar
} from 'lucide-react';
import { fetchLiveRainfall, LiveRainfallData } from '../services/weather';

interface LiveRainfallWidgetProps {
  selectedCity: string;
}

export const LiveRainfallWidget: React.FC<LiveRainfallWidgetProps> = ({ selectedCity }) => {
  const [weatherData, setWeatherData] = useState<LiveRainfallData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const loadWeather = useCallback(async (cityName: string, isManual = false) => {
    // Cancel in-flight request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    if (!isManual) {
      setErrorMessage(null);
    }

    // Set 8-second safety timeout
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 8000);

    try {
      const data = await fetchLiveRainfall(cityName, controller.signal);
      clearTimeout(timeoutId);
      setWeatherData(data);
      setErrorMessage(null);
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        // Ignored or timed out
        if (!weatherData) {
          setErrorMessage('Weather data request timed out.');
        }
      } else {
        const msg = err.message || 'Weather data unavailable';
        setErrorMessage(msg);
        // If we already have previous data, mark it as stale
        if (weatherData) {
          setWeatherData({
            ...weatherData,
            isStale: true,
            status: 'stale'
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [weatherData]);

  // Refetch when selectedCity changes
  useEffect(() => {
    loadWeather(selectedCity);

    // Periodic auto-refresh every 5 minutes (300,000 ms)
    const intervalId = setInterval(() => {
      loadWeather(selectedCity);
    }, 5 * 60 * 1000);

    return () => {
      clearInterval(intervalId);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [selectedCity]);

  // Rain severity classification
  const getPrecipitationSeverity = (mm: number) => {
    if (mm >= 15) return { label: 'Heavy Cloudburst', color: 'text-red-700 bg-red-50 border-red-200' };
    if (mm >= 5) return { label: 'Moderate Rain', color: 'text-amber-800 bg-amber-50 border-amber-200' };
    if (mm > 0.1) return { label: 'Light Drizzle', color: 'text-teal-800 bg-teal-50 border-teal-200' };
    return { label: 'Dry / No Active Rain', color: 'text-slate-600 bg-slate-50 border-slate-200' };
  };

  const currentPrecip = weatherData ? weatherData.currentPrecipitationMm : 0;
  const currentSeverity = getPrecipitationSeverity(currentPrecip);

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-3.5 sm:p-4 text-xs transition-all">
      {/* Top Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-50 border border-teal-200/60 text-teal-700">
            <CloudRain className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 text-sm">
                Live Rainfall Intelligence
              </span>
              <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-1.5 py-0.5 rounded border border-slate-200">
                Open-Meteo
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Station Location: <span className="font-medium text-slate-700">{weatherData?.city || (selectedCity === 'all' ? 'National Grid' : selectedCity)}</span>
            </p>
          </div>
        </div>

        {/* Status indicator & Manual Refresh */}
        <div className="flex items-center gap-2">
          {weatherData ? (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {weatherData.isStale 
                  ? `Stale (${weatherData.lastUpdatedFormatted})` 
                  : `Updated ${weatherData.lastUpdatedFormatted}`}
              </span>
            </div>
          ) : (
            <span className="text-[11px] text-slate-400">Loading forecast...</span>
          )}

          <button
            onClick={() => loadWeather(selectedCity, true)}
            disabled={isLoading}
            title="Refresh live rainfall from Open-Meteo"
            className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Refresh rainfall data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-teal-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Body: Current Reading + Next 6 Hours Forecast */}
      {errorMessage && !weatherData ? (
        <div className="py-3 px-3 mt-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between text-amber-900">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Weather data unavailable ({errorMessage}).</span>
          </div>
          <button
            onClick={() => loadWeather(selectedCity, true)}
            className="text-[11px] font-semibold underline text-amber-800 hover:text-amber-950 cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="pt-3 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Current Reading (4 cols) */}
          <div className="md:col-span-4 flex items-center justify-between p-2.5 bg-slate-50/70 rounded-lg border border-slate-200/80">
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">
                Current Precipitation
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-xl font-bold font-mono text-slate-900 tabular-nums">
                  {weatherData ? weatherData.currentPrecipitationMm.toFixed(1) : '--'}
                </span>
                <span className="text-xs font-medium text-slate-600">mm/h</span>
              </div>
            </div>
            <div className={`px-2 py-1 rounded text-[10px] font-semibold border ${currentSeverity.color}`}>
              {currentSeverity.label}
            </div>
          </div>

          {/* Next 6 Hours Forecast Strip (8 cols) */}
          <div className="md:col-span-8">
            <div className="flex items-center justify-between mb-1 text-[11px] text-slate-500">
              <span className="font-semibold text-slate-700 flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-blue-500" />
                <span>Next 6 Hours Precipitation Forecast</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">hourly mm</span>
            </div>

            <div className="grid grid-cols-6 gap-1.5">
              {weatherData?.hourlyForecast && weatherData.hourlyForecast.length > 0 ? (
                weatherData.hourlyForecast.map((hour, idx) => {
                  const isHigh = hour.precipitationMm >= 5;
                  const isModerate = hour.precipitationMm > 0.5;
                  return (
                    <div 
                      key={idx} 
                      className={`p-1.5 rounded-lg border text-center transition-colors ${
                        isHigh 
                          ? 'bg-red-50/60 border-red-200 text-red-950' 
                          : isModerate 
                            ? 'bg-amber-50/60 border-amber-200 text-amber-950' 
                            : 'bg-slate-50/70 border-slate-200 text-slate-800'
                      }`}
                    >
                      <span className="block text-[10px] text-slate-500 truncate font-mono">
                        {hour.label}
                      </span>
                      <span className="block text-xs font-bold font-mono tabular-nums mt-0.5">
                        {hour.precipitationMm.toFixed(1)}
                      </span>
                    </div>
                  );
                })
              ) : (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="p-2 rounded bg-slate-50 border border-slate-100 text-center text-slate-300">
                    <span className="block text-[10px] font-mono">+--h</span>
                    <span className="block text-xs font-mono">--</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mandatory Civic Disclaimer */}
      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-start gap-1.5 text-[10px] text-slate-500 leading-normal">
        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
        <span>
          <strong className="text-slate-600">Meteorological Grounding:</strong> Live rainfall data from Open-Meteo measures atmospheric precipitation and is kept strictly separate from street-level flood reports. Water accumulation depends on ground topography, drain clogs, and local elevation.
        </span>
      </div>
    </div>
  );
};
