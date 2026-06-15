export const fallbackLaunches = [
  { name: 'FalconSat', date_utc: '2006-03-24T22:30:00.000Z', success: false, cores: [{ landing_success: false }] },
  { name: 'CRS-1', date_utc: '2012-10-08T00:35:00.000Z', success: true, cores: [{ landing_success: false }] },
  { name: 'OG2 Mission 2', date_utc: '2015-12-22T01:29:00.000Z', success: true, cores: [{ landing_success: true }] },
  { name: 'Bangabandhu-1', date_utc: '2018-05-11T20:14:00.000Z', success: true, cores: [{ landing_success: true }] },
  { name: 'Starlink V1 L1', date_utc: '2019-11-11T14:56:00.000Z', success: true, cores: [{ landing_success: true }] },
  { name: 'Crew-2', date_utc: '2021-04-23T09:49:02.000Z', success: true, cores: [{ landing_success: true }] },
  { name: 'Transporter-6', date_utc: '2023-01-03T14:56:00.000Z', success: true, cores: [{ landing_success: true }] },
  { name: 'USSF-124', date_utc: '2024-02-14T22:30:00.000Z', success: true, cores: [{ landing_success: true }] },
];

export const fallbackNextLaunch = {
  name: 'Matrix Relay Demonstration',
  date_utc: new Date(Date.now() + 1000 * 60 * 60 * 36 + 1000 * 57).toISOString(),
  details: 'Fallback telemetry packet: public API unavailable, countdown remains live.',
  flight_number: 999,
};

export const fallbackNeos = [
  { id: 'neo-01', name: '(2026 AX) Tactical Object', hazardous: false, velocity: 42620, missDistance: 2280000 },
  { id: 'neo-02', name: '(2026 BR7) Close Approach', hazardous: true, velocity: 71890, missDistance: 742000 },
  { id: 'neo-03', name: '(2026 CM) Survey Track', hazardous: false, velocity: 21940, missDistance: 5340000 },
  { id: 'neo-04', name: '(2026 DK4) Radar Candidate', hazardous: false, velocity: 55120, missDistance: 3940000 },
];

export const fallbackApod = {
  title: 'Cybernetic Earthrise Telemetry',
  date: new Date().toISOString().slice(0, 10),
  media_type: 'image',
  url: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1800&q=85',
  explanation:
    'A fallback astronomy wall image is active because NASA APOD did not respond. The dashboard keeps the visual channel online while flagging the source state.',
};

export const fallbackMarsPhotos = [
  {
    id: 10001,
    img_src: 'https://images-assets.nasa.gov/image/PIA19808/PIA19808~orig.jpg',
    earth_date: '2015-05-30',
    camera: { name: 'MAST', full_name: 'Mast Camera' },
    rover: { name: 'Curiosity' },
  },
  {
    id: 10002,
    img_src: 'https://images-assets.nasa.gov/image/PIA23378/PIA23378~orig.jpg',
    earth_date: '2019-06-18',
    camera: { name: 'FHAZ', full_name: 'Front Hazard Avoidance Camera' },
    rover: { name: 'Curiosity' },
  },
  {
    id: 10003,
    img_src: 'https://images-assets.nasa.gov/image/PIA24487/PIA24487~orig.jpg',
    earth_date: '2021-02-22',
    camera: { name: 'RHAZ', full_name: 'Rear Hazard Avoidance Camera' },
    rover: { name: 'Perseverance' },
  },
];

export const fallbackCores = [
  { serial: 'B1058', status: 'active', launches: ['demo-2', 'starlink'] },
  { serial: 'B1061', status: 'active', launches: ['crew-1', 'crew-2', 'crew-5'] },
  { serial: 'B1049', status: 'lost', launches: ['telstar', 'starlink'] },
  { serial: 'B1031', status: 'inactive', launches: ['nrol-76'] },
];

export const fallbackShips = [
  { name: 'A Shortfall of Gravitas', type: 'ASDS barge', active: true, home_port: 'Port Canaveral', status: 'At sea' },
  { name: 'Just Read the Instructions', type: 'ASDS barge', active: true, home_port: 'Port Canaveral', status: 'Standby' },
  { name: 'Of Course I Still Love You', type: 'ASDS barge', active: true, home_port: 'Long Beach', status: 'Pacific station' },
];

export const fallbackCmes = [
  {
    activityID: '2026-05-17T18:24:00-CME-001',
    startTime: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    note: 'Fallback CME packet: moderate solar ejecta modeled near Earth-directed corridor.',
    instruments: [{ displayName: 'SOHO: LASCO/C2' }],
  },
];

export const fallbackEpicImages = [
  {
    identifier: 'fallback-epic',
    image: 'epic_1b_20240319001743',
    date: '2024-03-19 00:17:43',
    caption: 'Fallback EPIC disk composite',
  },
];

export const fallbackPayloads = [
  { name: 'CRS-22 Dragon', type: 'Dragon 2.0', customers: ['NASA (CRS)'], orbit: 'ISS' },
  { name: 'Crew-7', type: 'Crew Dragon', customers: ['NASA', 'ESA', 'JAXA'], orbit: 'ISS' },
  { name: 'Starlink Group 6-1', type: 'Satellite', customers: ['SpaceX'], orbit: 'VLEO' },
  { name: 'GPS III SV04', type: 'Satellite', customers: ['USSF'], orbit: 'MEO' },
  { name: 'Intelsat G-31', type: 'Satellite', customers: ['Intelsat'], orbit: 'GTO' },
  { name: 'Transporter-7', type: 'Satellite', customers: ['Commercial', 'D-Orbit', 'Umbra'], orbit: 'SSO' },
];

export const fallbackStarlink = Array.from({ length: 420 }, (_, index) => {
  const golden = 137.508;
  return {
    id: `fallback-starlink-${index}`,
    spaceTrack: { OBJECT_NAME: `STARLINK-${5000 + index}` },
    latitude: ((index * 17.37) % 140) - 70,
    longitude: ((index * golden) % 360) - 180,
    height_km: 520 + (index % 9) * 12,
    velocity_kms: 7.6,
  };
});

const fleetSeeds = [
  ['STARLINK', 360],
  ['ONEWEB', 120],
  ['IRIDIUM', 66],
  ['O3B', 28],
  ['SWARM', 38],
  ['ORBCOMM', 32],
  ['NOAA', 18],
  ['NAVSTAR GPS', 42],
  ['ASTRANIS ARCTURUS', 8],
  ['UTILITYSAT', 5],
  ['PLANET', 90],
  ['LEMUR', 72],
  ['GLOBALSTAR', 46],
  ['INTELSAT', 40],
  ['SES', 36],
];

export const fallbackCelestrakActive = fleetSeeds.flatMap(([prefix, count], groupIndex) =>
  Array.from({ length: count }, (_, index) => ({
    OBJECT_NAME: `${prefix}-${String(index + 1).padStart(3, '0')}`,
    OBJECT_ID: `1998-${String(groupIndex).padStart(3, '0')}${String(index).padStart(3, '0')}`,
    NORAD_CAT_ID: groupIndex * 1000 + index,
    MEAN_MOTION: prefix.includes('ASTRANIS') || prefix.includes('UTILITYSAT') || prefix.includes('INTELSAT') || prefix.includes('SES') ? 1.0027 : prefix.includes('GPS') || prefix.includes('O3B') ? 2.006 : 15.1,
    INCLINATION: prefix.includes('ASTRANIS') || prefix.includes('UTILITYSAT') ? 0.05 : prefix.includes('GPS') ? 55 : 53 + (index % 8),
    RA_OF_ASC_NODE: (index * 17 + groupIndex * 11) % 360,
    ARG_OF_PERICENTER: (index * 23) % 360,
    MEAN_ANOMALY: (index * 29) % 360,
    ECCENTRICITY: 0.0001,
    EPOCH: new Date().toISOString(),
  })),
);
