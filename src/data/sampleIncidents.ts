import { FloodIncident, HotspotZone } from '../types';
import { calculateTrustScore } from '../utils/trustScore';

const now = Date.now();

// Image imports or direct paths
const imgMilan = '/src/assets/images/mumbai_underpass_flood_1791545823927.jpg';
const imgBellandur = '/src/assets/images/bengaluru_ringroad_flood_1791545845927.jpg';
const imgHindmata = '/src/assets/images/drainage_pump_inspection_1791545867557.jpg';

export const INITIAL_INCIDENTS: FloodIncident[] = [
  {
    id: 'fl-mum-01',
    title: 'Milan Subway Underpass Severe Submergence',
    locationName: 'Milan Subway Underpass, Santacruz West',
    landmark: 'Between Swami Vivekananda Rd & Western Express Highway',
    wardOrDistrict: 'Ward H/West',
    city: 'Mumbai',
    coordinates: [19.0833, 72.8415],
    severity: 'high',
    waterDepthCm: 75,
    reportedAt: '18 minutes ago',
    timestamp: now - 18 * 60 * 1000,
    description: 'Simulated demonstration incident: Underpass inundated in mock monsoon scenario. 75cm estimated water depth (Demo data). Traffic police diversion exercise active.',
    roadType: 'underpass',
    status: 'active',
    photoUrl: imgMilan,
    corroborationCount: 5,
    corroborationIds: ['c1', 'c2', 'c3', 'c4', 'c5'],
    reportedBy: {
      name: 'Rohan Deshmukh',
      role: 'Traffic Warden',
      isVerifiedBadge: true
    },
    trustScore: calculateTrustScore({
      reportedTimestamp: now - 18 * 60 * 1000,
      corroborationCount: 5,
      hasPhoto: true,
      reporterRole: 'Traffic Warden',
      waterDepthCm: 75,
      severity: 'high'
    }),
    authorityAction: {
      actionType: 'Barricade Erected',
      updatedAt: '12 mins ago',
      authorityName: 'Mumbai Traffic Police & MCGM Disaster Cell',
      notes: 'Subway traffic diverted via Khar Subway and Thackeray Flyover. Dewatering pump set 3 activated.'
    },
    isSampleData: true
  },
  {
    id: 'fl-blr-02',
    title: 'Bellandur Eco-Space Outer Ring Road Waterlogging',
    locationName: 'Outer Ring Road (ORR) near Eco-Space',
    landmark: 'Opposite Central Mall Bellandur, Marathahalli direction',
    wardOrDistrict: 'Mahadevapura Zone (Ward 150)',
    city: 'Bengaluru',
    coordinates: [12.9275, 77.6835],
    severity: 'high',
    waterDepthCm: 60,
    reportedAt: '35 minutes ago',
    timestamp: now - 35 * 60 * 1000,
    description: 'Simulated demonstration incident: Stormwater drain overflow scenario along service lane. 60cm estimated water depth (Demo data).',
    roadType: 'arterial',
    status: 'active',
    photoUrl: imgBellandur,
    corroborationCount: 4,
    corroborationIds: ['b1', 'b2', 'b3', 'b4'],
    reportedBy: {
      name: 'Sneha Rao',
      role: 'Citizen Commuter',
      isVerifiedBadge: false
    },
    trustScore: calculateTrustScore({
      reportedTimestamp: now - 35 * 60 * 1000,
      corroborationCount: 4,
      hasPhoto: true,
      reporterRole: 'Citizen Commuter',
      waterDepthCm: 60,
      severity: 'high'
    }),
    authorityAction: {
      actionType: 'Pump Dispatched',
      updatedAt: '20 mins ago',
      authorityName: 'BBMP Stormwater Drain (SWD) Wing',
      notes: 'Mobile dewatering truck dispatched to clear clogged culvert near Eco-space culvert.'
    },
    isSampleData: true
  },
  {
    id: 'fl-mum-03',
    title: 'Hindmata Flyover Base Water Accumulation',
    locationName: 'Hindmata Cinema Junction, Dadar East',
    landmark: 'Dr. Babasaheb Ambedkar Road, below Lalbaug flyover',
    wardOrDistrict: 'Ward F/South',
    city: 'Mumbai',
    coordinates: [19.0094, 72.8442],
    severity: 'moderate',
    waterDepthCm: 38,
    reportedAt: '52 minutes ago',
    timestamp: now - 52 * 60 * 1000,
    description: 'Simulated demonstration incident: Knee-height standing water scenario at Hindmata depression. 38cm estimated depth (Demo data).',
    roadType: 'junction',
    status: 'under_inspection',
    photoUrl: imgHindmata,
    corroborationCount: 3,
    corroborationIds: ['m1', 'm2', 'm3'],
    reportedBy: {
      name: 'Aditya Kadam',
      role: 'Municipal Field Officer',
      isVerifiedBadge: true
    },
    trustScore: calculateTrustScore({
      reportedTimestamp: now - 52 * 60 * 1000,
      corroborationCount: 3,
      hasPhoto: true,
      reporterRole: 'Municipal Field Officer',
      waterDepthCm: 38,
      severity: 'moderate'
    }),
    authorityAction: {
      actionType: 'Pump Dispatched',
      updatedAt: '30 mins ago',
      authorityName: 'MCGM Stormwater Management',
      notes: '3 heavy diesel booster pumps engaged discharging water into Pramod Mahajan park sump.'
    },
    isSampleData: true
  },
  {
    id: 'fl-chn-04',
    title: 'Velachery 100 Feet Road Flash Ponding',
    locationName: 'Velachery 100 Feet Bypass Road',
    landmark: 'Near Vijayanagar Bus Terminus & MRTS station',
    wardOrDistrict: 'Zone 13 (Adyar - Ward 177)',
    city: 'Chennai',
    coordinates: [12.9815, 80.2180],
    severity: 'moderate',
    waterDepthCm: 42,
    reportedAt: '1 hour 15m ago',
    timestamp: now - 75 * 60 * 1000,
    description: 'Simulated demonstration incident: Water backflow scenario from macro-drain during high surge. 42cm estimated depth (Demo data).',
    roadType: 'arterial',
    status: 'active',
    corroborationCount: 2,
    corroborationIds: ['c_chn_1', 'c_chn_2'],
    reportedBy: {
      name: 'Karthik Sridhar',
      role: 'Flood Volunteer',
      isVerifiedBadge: true
    },
    trustScore: calculateTrustScore({
      reportedTimestamp: now - 75 * 60 * 1000,
      corroborationCount: 2,
      hasPhoto: false,
      reporterRole: 'Flood Volunteer',
      waterDepthCm: 42,
      severity: 'moderate'
    }),
    isSampleData: true
  },
  {
    id: 'fl-del-05',
    title: 'Minto Bridge Underpass Water Pooling Alert',
    locationName: 'Minto Bridge Railway Underpass',
    landmark: 'Connecting Connaught Place Outer Circle to Kamla Market',
    wardOrDistrict: 'Central Delhi',
    city: 'Delhi NCR',
    coordinates: [28.6366, 77.2289],
    severity: 'high',
    waterDepthCm: 85,
    reportedAt: '2 hours ago',
    timestamp: now - 120 * 60 * 1000,
    description: 'Simulated demonstration incident: Underpass closure scenario during heavy rainfall. 85cm estimated water depth (Demo data).',
    roadType: 'underpass',
    status: 'under_inspection',
    corroborationCount: 3,
    corroborationIds: ['del1', 'del2', 'del3'],
    reportedBy: {
      name: 'Inspector Sandeep Tyagi',
      role: 'Municipal Field Officer',
      isVerifiedBadge: true
    },
    trustScore: calculateTrustScore({
      reportedTimestamp: now - 120 * 60 * 1000,
      corroborationCount: 3,
      hasPhoto: false,
      reporterRole: 'Municipal Field Officer',
      waterDepthCm: 85,
      severity: 'high'
    }),
    authorityAction: {
      actionType: 'Barricade Erected',
      updatedAt: '1h 45m ago',
      authorityName: 'Delhi Police & PWD Delhi',
      notes: 'Road strictly closed. Automated telemetry pump 4 and pump 5 discharging to Barapullah basin (Demo exercise).'
    },
    isSampleData: true
  },
  {
    id: 'fl-hyd-06',
    title: 'Tolichowki Flyover Underpass Surface Runoff',
    locationName: 'Tolichowki Main Road',
    landmark: 'Near Galaxy Theatre junction',
    wardOrDistrict: 'GHMC Khairatabad Zone',
    city: 'Hyderabad',
    coordinates: [17.4042, 78.4124],
    severity: 'low',
    waterDepthCm: 22,
    reportedAt: '3 hours ago',
    timestamp: now - 180 * 60 * 1000,
    description: 'Simulated demonstration incident: Minor curb runoff pooling. 22cm estimated depth (Demo data).',
    roadType: 'arterial',
    status: 'receding',
    corroborationCount: 1,
    corroborationIds: ['hyd1'],
    reportedBy: {
      name: 'Farhan Ali',
      role: 'Citizen Commuter',
      isVerifiedBadge: false
    },
    trustScore: calculateTrustScore({
      reportedTimestamp: now - 180 * 60 * 1000,
      corroborationCount: 1,
      hasPhoto: false,
      reporterRole: 'Citizen Commuter',
      waterDepthCm: 22,
      severity: 'low'
    }),
    isSampleData: true
  },
  {
    id: 'fl-blr-07',
    title: 'Silk Board Junction South Ramp Ponding',
    locationName: 'Central Silk Board Junction',
    landmark: 'Hosur Road flyover ramp & BTM Layout merge',
    wardOrDistrict: 'Bommanahalli Zone (Ward 174)',
    city: 'Bengaluru',
    coordinates: [12.9176, 77.6234],
    severity: 'moderate',
    waterDepthCm: 34,
    reportedAt: '4 hours ago',
    timestamp: now - 240 * 60 * 1000,
    description: 'Simulated demonstration incident: Waterlogging near metro construction pillar base. 34cm estimated depth (Demo data).',
    roadType: 'junction',
    status: 'active',
    corroborationCount: 2,
    corroborationIds: ['sb1', 'sb2'],
    reportedBy: {
      name: 'Vikram Menon',
      role: 'Citizen Commuter',
      isVerifiedBadge: false
    },
    trustScore: calculateTrustScore({
      reportedTimestamp: now - 240 * 60 * 1000,
      corroborationCount: 2,
      hasPhoto: false,
      reporterRole: 'Citizen Commuter',
      waterDepthCm: 34,
      severity: 'moderate'
    }),
    isSampleData: true
  },
  {
    id: 'fl-mum-08',
    title: 'Kurla West LBS Marg Water Stagnation',
    locationName: 'Lal Bahadur Shastri (LBS) Marg, Kurla West',
    landmark: 'Near Phoenix Marketcity mall junction',
    wardOrDistrict: 'Ward L',
    city: 'Mumbai',
    coordinates: [19.0716, 72.8841],
    severity: 'low',
    waterDepthCm: 18,
    reportedAt: '5 hours ago',
    timestamp: now - 300 * 60 * 1000,
    description: 'Simulated demonstration incident: Minor curb pooling on leftmost lane. 18cm estimated depth (Demo data).',
    roadType: 'arterial',
    status: 'receding',
    corroborationCount: 0,
    corroborationIds: [],
    reportedBy: {
      name: 'Ganesh Shinde',
      role: 'Citizen Commuter',
      isVerifiedBadge: false
    },
    trustScore: calculateTrustScore({
      reportedTimestamp: now - 300 * 60 * 1000,
      corroborationCount: 0,
      hasPhoto: false,
      reporterRole: 'Citizen Commuter',
      waterDepthCm: 18,
      severity: 'low'
    }),
    isSampleData: true
  }
];

export const HISTORIC_HOTSPOTS: HotspotZone[] = [
  {
    id: 'hs-mum-milan',
    name: 'Milan Subway Chronic Depression',
    city: 'Mumbai',
    ward: 'H/West (Santacruz)',
    vulnerabilityScore: 96,
    recurringIncidentsCount: 42,
    criticalInfrastructureNearby: 'Western Railway tracks, SV Road transit lifeline',
    drainageStatus: 'Severely Blocked',
    inspectionPriority: 'Critical (Immediate)',
    coordinates: [19.0833, 72.8415],
    recommendedMitigation: 'Deploy twin 500 HP submersible dewatering pumps; keep automated flood gate closed.'
  },
  {
    id: 'hs-blr-bellandur',
    name: 'Bellandur EcoSpace ORR Sump',
    city: 'Bengaluru',
    ward: 'Mahadevapura (Ward 150)',
    vulnerabilityScore: 92,
    recurringIncidentsCount: 38,
    criticalInfrastructureNearby: 'Tech corridor IT parks, BMTC trunk route',
    drainageStatus: 'Surcharged Sump',
    inspectionPriority: 'Critical (Immediate)',
    coordinates: [12.9275, 77.6835],
    recommendedMitigation: 'Dredge Rajakaluve (primary stormwater canal) bottlenecks and remove construction debris.'
  },
  {
    id: 'hs-del-minto',
    name: 'Minto Road Railway Underpass',
    city: 'Delhi NCR',
    ward: 'Central Zone',
    vulnerabilityScore: 89,
    recurringIncidentsCount: 31,
    criticalInfrastructureNearby: 'New Delhi Railway Station approach, Metro line',
    drainageStatus: 'Pump Active',
    inspectionPriority: 'Critical (Immediate)',
    coordinates: [28.6366, 77.2289],
    recommendedMitigation: 'Maintain telemetry sump pump auto-start sensor; reinforce physical warning gates.'
  },
  {
    id: 'hs-chn-velachery',
    name: 'Velachery Vijayanagar Basin',
    city: 'Chennai',
    ward: 'Zone 13 (Adyar)',
    vulnerabilityScore: 84,
    recurringIncidentsCount: 27,
    criticalInfrastructureNearby: 'MRTS station, residential dense settlements',
    drainageStatus: 'Surcharged Sump',
    inspectionPriority: 'High Priority',
    coordinates: [12.9815, 80.2180],
    recommendedMitigation: 'Ensure Pallikaranai marshland outfall sluice gates remain unobstructed by silt.'
  },
  {
    id: 'hs-mum-hindmata',
    name: 'Hindmata Dadar Retention Tank',
    city: 'Mumbai',
    ward: 'F/South (Dadar East)',
    vulnerabilityScore: 81,
    recurringIncidentsCount: 29,
    criticalInfrastructureNearby: 'KEM Hospital transit corridor, Dr BA Road',
    drainageStatus: 'Pump Active',
    inspectionPriority: 'High Priority',
    coordinates: [19.0094, 72.8442],
    recommendedMitigation: 'Expedite desilting of holding chamber conduits discharging to Mahapallika tank.'
  },
  {
    id: 'hs-blr-silkboard',
    name: 'Silk Board Junction Low-Lying Median',
    city: 'Bengaluru',
    ward: 'Bommanahalli (Ward 174)',
    vulnerabilityScore: 78,
    recurringIncidentsCount: 22,
    criticalInfrastructureNearby: 'Namma Metro Yellow Line interchange, Hosur Highway',
    drainageStatus: 'Severely Blocked',
    inspectionPriority: 'High Priority',
    coordinates: [12.9176, 77.6234],
    recommendedMitigation: 'Clear storm culverts blocked by utility duct construction.'
  }
];
