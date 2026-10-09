import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Camera, 
  AlertTriangle, 
  Check, 
  Loader2, 
  Crosshair, 
  UploadCloud, 
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { NewReportPayload, RoadType, SeverityLevel } from '../types';

interface ReportFloodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (report: NewReportPayload) => Promise<void>;
  droppedCoords: [number, number] | null;
  onActivatePinDrop: () => void;
  selectedCity: string;
}

// Preset Indian city coordinates
const CITY_COORDINATES: Record<string, [number, number]> = {
  Mumbai: [19.0760, 72.8777],
  Bengaluru: [12.9716, 77.5946],
  Chennai: [13.0827, 80.2707],
  'Delhi NCR': [28.6139, 77.2090],
  Hyderabad: [17.3850, 78.4867],
};

const SAMPLE_PHOTO_PRESETS = [
  { label: 'Submerged Underpass', url: '/src/assets/images/mumbai_underpass_flood_1791545823927.jpg' },
  { label: 'Waterlogged Arterial Road', url: '/src/assets/images/bengaluru_ringroad_flood_1791545845927.jpg' },
  { label: 'Drainage Overflow Junction', url: '/src/assets/images/drainage_pump_inspection_1791545867557.jpg' },
];

export const ReportFloodModal: React.FC<ReportFloodModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  droppedCoords,
  onActivatePinDrop,
  selectedCity,
}) => {
  const defaultCity = (selectedCity !== 'all' ? selectedCity : 'Mumbai') as any;

  const [title, setTitle] = useState('');
  const [locationName, setLocationName] = useState('');
  const [landmark, setLandmark] = useState('');
  const [wardOrDistrict, setWardOrDistrict] = useState('');
  const [city, setCity] = useState<'Mumbai' | 'Bengaluru' | 'Chennai' | 'Delhi NCR' | 'Hyderabad'>(defaultCity);
  const [severity, setSeverity] = useState<SeverityLevel>('moderate');
  const [waterDepthCm, setWaterDepthCm] = useState(40);
  const [roadType, setRoadType] = useState<RoadType>('arterial');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterRole, setReporterRole] = useState<'Citizen Commuter' | 'Traffic Warden' | 'Flood Volunteer' | 'Municipal Field Officer'>('Citizen Commuter');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Sync city when modal opens or selectedCity changes
  React.useEffect(() => {
    if (selectedCity && selectedCity !== 'all') {
      setCity(selectedCity as any);
    }
  }, [selectedCity, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Validation
    if (!title.trim()) {
      setErrorMessage('Please provide an incident title (e.g. "Milan Subway severe waterlogging").');
      return;
    }
    if (!locationName.trim()) {
      setErrorMessage('Please specify the road or location name.');
      return;
    }
    if (!description.trim() || description.length < 10) {
      setErrorMessage('Please provide a brief description (at least 10 characters) of the flood situation.');
      return;
    }

    // Determine coordinates: use droppedCoords if user clicked on map, else slight jitter from city center
    let coords: [number, number];
    if (droppedCoords) {
      coords = droppedCoords;
    } else {
      const base = CITY_COORDINATES[city] || [19.0760, 72.8777];
      // small deterministic offset so markers don't overlap completely
      coords = [base[0] + (Math.random() - 0.5) * 0.05, base[1] + (Math.random() - 0.5) * 0.05];
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        locationName: locationName.trim(),
        landmark: landmark.trim() || 'Near main intersection',
        wardOrDistrict: wardOrDistrict.trim() || 'Central Ward',
        city,
        coordinates: coords,
        severity,
        waterDepthCm,
        roadType,
        description: description.trim(),
        photoUrl: photoUrl || undefined,
        reporterName: reporterName.trim() || 'Citizen Contributor',
        reporterRole,
      });

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        // Reset form
        setTitle('');
        setLocationName('');
        setLandmark('');
        setDescription('');
        setPhotoUrl('');
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setPhotoUrl(uploadEvent.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-pulse" />
              <h3 className="font-bold text-base text-slate-900">
                Report Street Flooding
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Submit crowdsourced inundation data to alert commuters and disaster authorities.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Banner */}
        {isSuccess ? (
          <div className="p-8 text-center space-y-3 my-auto">
            <div className="w-12 h-12 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Report Successfully Logged</h4>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Your report has been indexed, scored with the FloodLens TrustScore algorithm, and rendered on the street intelligence map!
            </p>
          </div>
        ) : (
          /* Form Body */
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* City & Ward */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  City Zone *
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                >
                  <option value="Mumbai">Mumbai (Western & Eastern Suburbs)</option>
                  <option value="Bengaluru">Bengaluru (Mahadevapura / ORR)</option>
                  <option value="Chennai">Chennai (Velachery / Adyar)</option>
                  <option value="Delhi NCR">Delhi NCR (Yamuna / Rail Underpasses)</option>
                  <option value="Hyderabad">Hyderabad (Khairatabad / Serilingampally)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ward / District
                </label>
                <input
                  type="text"
                  value={wardOrDistrict}
                  onChange={(e) => setWardOrDistrict(e.target.value)}
                  placeholder="e.g. Ward H/West or Zone 13"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>
            </div>

            {/* Title & Location Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Incident Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Heavy waterlogging near Milan Subway ramp"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Street / Road Name *
                </label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g. SV Road Underpass approach"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Prominent Landmark
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Opposite Metro Pillar 142"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>
            </div>

            {/* Map Pin Dropper helper */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
                <span className="text-slate-700">
                  {droppedCoords 
                    ? `Pin dropped: [${droppedCoords[0].toFixed(4)}, ${droppedCoords[1].toFixed(4)}]` 
                    : 'Location pinpoint: Auto-placed near city center'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onActivatePinDrop();
                  onClose();
                }}
                className="px-2.5 py-1 text-[11px] font-semibold text-teal-800 bg-teal-100 hover:bg-teal-200 rounded-md transition-colors cursor-pointer"
              >
                Drop Pin on Map
              </button>
            </div>

            {/* Severity & Road Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Severity Level *
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setSeverity('high')}
                    className={`py-2 px-1 rounded-lg border font-semibold text-center transition-all cursor-pointer ${
                      severity === 'high'
                        ? 'bg-red-600 text-white border-red-700 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-red-50'
                    }`}
                  >
                    High (&gt;50cm)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSeverity('moderate')}
                    className={`py-2 px-1 rounded-lg border font-semibold text-center transition-all cursor-pointer ${
                      severity === 'moderate'
                        ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50'
                    }`}
                  >
                    Moderate
                  </button>
                  <button
                    type="button"
                    onClick={() => setSeverity('low')}
                    className={`py-2 px-1 rounded-lg border font-semibold text-center transition-all cursor-pointer ${
                      severity === 'low'
                        ? 'bg-teal-600 text-white border-teal-700 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-teal-50'
                    }`}
                  >
                    Low
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Road Topography
                </label>
                <select
                  value={roadType}
                  onChange={(e) => setRoadType(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                >
                  <option value="underpass">Railway / Highway Underpass (High Risk)</option>
                  <option value="arterial">Major Arterial / Ring Road</option>
                  <option value="junction">Traffic Junction / Roundabout</option>
                  <option value="residential">Residential Lane / Colony</option>
                  <option value="highway">National Highway Corridor</option>
                </select>
              </div>
            </div>

            {/* Estimated Water Depth Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Estimated Water Depth</span>
                <span className="font-mono text-teal-800 text-sm font-bold tabular-nums">
                  {waterDepthCm} cm (~{(waterDepthCm / 2.54).toFixed(0)} inches)
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="120"
                step="5"
                value={waterDepthCm}
                onChange={(e) => setWaterDepthCm(Number(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-600 mt-1">
                <span>Ankle (10cm)</span>
                <span>Knee (45cm)</span>
                <span>Waist (80cm)</span>
                <span>Submerged (120cm+)</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Detailed Field Description *
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe current traffic conditions, stalled vehicles, whether pumps are active, or nearby drain blockage..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>

            {/* Photo Evidence with presets or file */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-teal-600" />
                  <span>Attach Photographic Evidence (+16% TrustScore Bonus)</span>
                </label>
                {photoUrl && (
                  <button
                    type="button"
                    onClick={() => setPhotoUrl('')}
                    className="text-[11px] text-red-500 hover:text-red-700"
                  >
                    Remove photo
                  </button>
                )}
              </div>

              {/* Photo Presets or Upload button */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 cursor-pointer transition-colors">
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload image from device</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <span className="text-xs text-slate-400">or use demo photo:</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {SAMPLE_PHOTO_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPhotoUrl(preset.url)}
                      className={`text-left p-1.5 rounded-lg border text-[11px] truncate transition-all cursor-pointer ${
                        photoUrl === preset.url
                          ? 'border-teal-600 bg-teal-50/50 text-teal-900 font-semibold ring-1 ring-teal-500'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {photoUrl && (
                  <div className="mt-2 relative rounded-lg overflow-hidden border border-slate-200 max-h-32 aspect-video">
                    <img
                      src={photoUrl}
                      alt="Evidence preview"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Reporter details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reporter Name / Alias
                </label>
                <input
                  type="text"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reporter Role
                </label>
                <select
                  value={reporterRole}
                  onChange={(e) => setReporterRole(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                >
                  <option value="Citizen Commuter">Citizen Commuter</option>
                  <option value="Traffic Warden">Traffic Warden</option>
                  <option value="Flood Volunteer">Civil Defense / NGO Volunteer</option>
                  <option value="Municipal Field Officer">Municipal Field Officer</option>
                </select>
              </div>
            </div>

            {/* Ethical Guardrail Reminder */}
            <div className="p-3 rounded-xl bg-slate-100 text-slate-600 text-[11px] leading-relaxed border border-slate-200">
              <span className="font-semibold text-slate-800 block mb-0.5">
                Responsible Civic Reporting:
              </span>
              Do not risk personal safety to capture photographs. Never attempt to wade into submerged underpasses.
            </div>

            {/* Submit button bar */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-xl transition-all shadow-md shadow-teal-700/20 flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Submitting Report...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Publish Flood Report</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
