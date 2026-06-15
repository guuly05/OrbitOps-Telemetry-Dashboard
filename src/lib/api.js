import {
  fallbackApod,
  fallbackCelestrakActive,
  fallbackCmes,
  fallbackCores,
  fallbackEpicImages,
  fallbackLaunches,
  fallbackMarsPhotos,
  fallbackNeos,
  fallbackNextLaunch,
  fallbackPayloads,
  fallbackShips,
  fallbackStarlink,
} from '../data/fallbacks';

const NASA_KEY = import.meta.env.VITE_NASA_API_KEY?.trim() || 'DEMO_KEY';
const SPACEX = 'https://api.spacexdata.com/v4';

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function daysAgoIso(days, baseDate = new Date()) {
  const date = new Date(baseDate);
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}

export function archiveDate(year, month = 5, day = 18) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function neowsArchiveDate(year) {
  return archiveDate(year, 1, 1);
}

export function donkiRangeForYear(year) {
  const currentYear = new Date().getUTCFullYear();
  if (year >= currentYear) {
    return { startDate: daysAgoIso(7), endDate: todayIso() };
  }
  return { startDate: archiveDate(year, 6, 1), endDate: archiveDate(year, 6, 14) };
}

export function marsSolForYear(rover, year) {
  const landings = {
    curiosity: Date.UTC(2012, 7, 6),
    perseverance: Date.UTC(2021, 1, 18),
  };
  const landing = landings[rover.toLowerCase()] ?? landings.curiosity;
  const target = Date.UTC(year, 5, 1);
  const earthDays = Math.max(0, (target - landing) / 86_400_000);
  return Math.max(0, Math.round(earthDays / 1.02749125));
}

export async function fetchJson(url, fallback, label) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`${label} returned ${response.status}`);
    }
    return { data: await response.json(), fallback: false, error: null };
  } catch (error) {
    return { data: fallback, fallback: true, error: error.message };
  }
}

export const api = {
  nextLaunch: () => fetchJson(`${SPACEX}/launches/next`, fallbackNextLaunch, 'SpaceX next launch'),
  launches: () => fetchJson(`${SPACEX}/launches`, fallbackLaunches, 'SpaceX launch history'),
  neos: (date = todayIso()) =>
    fetchJson(
      `https://api.nasa.gov/neo/rest/v1/feed?start_date=${date}&end_date=${date}&api_key=${NASA_KEY}`,
      { near_earth_objects: { [date]: fallbackNeos } },
      'NASA NeoWs',
    ),
  apod: (date = todayIso()) =>
    fetchJson(`https://api.nasa.gov/planetary/apod?date=${date}&api_key=${NASA_KEY}`, fallbackApod, 'NASA APOD'),
  marsPhotos: (rover = 'curiosity', camera = 'MAST', sol = 1000) =>
    fetchJson(
      `https://api.nasa.gov/mars-photos/api/v1/rovers/${rover.toLowerCase()}/photos?sol=${sol}&camera=${camera}&api_key=${NASA_KEY}`,
      { photos: fallbackMarsPhotos.filter((photo) => photo.camera.name === camera || photo.rover.name.toLowerCase() === rover.toLowerCase()) },
      'NASA Mars Rover Photos',
    ),
  cores: () => fetchJson(`${SPACEX}/cores`, fallbackCores, 'SpaceX cores'),
  ships: () => fetchJson(`${SPACEX}/ships`, fallbackShips, 'SpaceX ships'),
  cmes: (year = new Date().getUTCFullYear()) => {
    const { startDate, endDate } = donkiRangeForYear(year);
    return fetchJson(
      `https://api.nasa.gov/DONKI/CME?startDate=${startDate}&endDate=${endDate}&api_key=${NASA_KEY}`,
      fallbackCmes,
      'NASA DONKI CME',
    );
  },
  solarFlares: (year = new Date().getUTCFullYear()) => {
    const { startDate, endDate } = donkiRangeForYear(year);
    return fetchJson(
      `https://api.nasa.gov/DONKI/FLR?startDate=${startDate}&endDate=${endDate}&api_key=${NASA_KEY}`,
      [],
      'NASA DONKI Solar Flare',
    );
  },
  geomagneticStorms: (year = new Date().getUTCFullYear()) => {
    const { startDate, endDate } = donkiRangeForYear(year);
    return fetchJson(
      `https://api.nasa.gov/DONKI/GST?startDate=${startDate}&endDate=${endDate}&api_key=${NASA_KEY}`,
      [],
      'NASA DONKI Geomagnetic Storm',
    );
  },
  epicImages: () =>
    fetchJson(`https://api.nasa.gov/EPIC/api/natural/images?api_key=${NASA_KEY}`, fallbackEpicImages, 'NASA EPIC'),
  payloads: () => fetchJson(`${SPACEX}/payloads`, fallbackPayloads, 'SpaceX payloads'),
  starlink: () => fetchJson(`${SPACEX}/starlink`, fallbackStarlink, 'SpaceX Starlink'),
  celestrakActive: () =>
    fetchJson('https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=json', fallbackCelestrakActive, 'CelesTrak active satellites'),
};

export function normalizeNeos(feed) {
  const objects = feed?.near_earth_objects ?? {};
  return Object.values(objects)
    .flat()
    .map((neo, index) => {
      const approach = neo.close_approach_data?.[0] ?? {};
      return {
        id: neo.id ?? `neo-${index}`,
        name: neo.name,
        hazardous: Boolean(neo.is_potentially_hazardous_asteroid ?? neo.hazardous),
        velocity: Number(approach.relative_velocity?.kilometers_per_hour ?? neo.velocity ?? 0),
        missDistance: Number(approach.miss_distance?.kilometers ?? neo.missDistance ?? 0),
      };
    })
    .sort((a, b) => a.missDistance - b.missDistance);
}

export function epicImageUrl(image) {
  if (!image?.date || image.identifier === 'fallback-epic') {
    return 'https://images-assets.nasa.gov/image/iss056e201248/iss056e201248~orig.jpg';
  }
  const [date] = image.date.split(' ');
  const [year, month, day] = date.split('-');
  return `https://api.nasa.gov/EPIC/archive/natural/${year}/${month}/${day}/png/${image.image}.png?api_key=${NASA_KEY}`;
}
