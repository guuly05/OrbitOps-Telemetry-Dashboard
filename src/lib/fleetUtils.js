export const fleetDefinitions = [
  { id: 'starlink', name: 'SpaceX Starlink', orbit: 'LEO', patterns: ['STARLINK'], color: '#00ff66' },
  { id: 'oneweb', name: 'Eutelsat OneWeb', orbit: 'LEO', patterns: ['ONEWEB'], color: '#34d399' },
  { id: 'iridium', name: 'Iridium Communications', orbit: 'LEO', patterns: ['IRIDIUM'], color: '#6ee7b7' },
  { id: 'o3b-ses', name: 'O3b / SES', orbit: 'MEO', patterns: ['O3B', 'SES'], color: '#bef264' },
  { id: 'swarm', name: 'Swarm Technologies', orbit: 'LEO', patterns: ['SWARM'], color: '#00ff66' },
  { id: 'orbcomm', name: 'Orbcomm', orbit: 'LEO', patterns: ['ORBCOMM'], color: '#22c55e' },
  { id: 'noaa', name: 'NOAA', orbit: 'LEO', patterns: ['NOAA'], color: '#86efac' },
  { id: 'gps', name: 'GPS Constellations', orbit: 'MEO', patterns: ['NAVSTAR', 'GPS'], color: '#a3e635' },
  { id: 'astranis', name: 'Astranis Space Technologies', orbit: 'GEO', patterns: ['ASTRANIS', 'ARCTURUS', 'UTILITYSAT'], color: '#00ff66' },
  { id: 'planet', name: 'Planet Labs', orbit: 'LEO', patterns: ['PLANET', 'FLOCK'], color: '#10b981' },
  { id: 'spire', name: 'Spire Lemur', orbit: 'LEO', patterns: ['LEMUR'], color: '#4ade80' },
  { id: 'globalstar', name: 'Globalstar', orbit: 'LEO', patterns: ['GLOBALSTAR'], color: '#bbf7d0' },
  { id: 'intelsat', name: 'Intelsat', orbit: 'GEO', patterns: ['INTELSAT'], color: '#84cc16' },
  { id: 'galileo', name: 'Galileo Navigation', orbit: 'MEO', patterns: ['GALILEO'], color: '#d9f99d' },
  { id: 'landsat', name: 'Landsat Survey Fleet', orbit: 'LEO', patterns: ['LANDSAT'], color: '#16a34a' },
];

export function groupSatellitesByFleet(catalog = []) {
  return fleetDefinitions.map((fleet) => {
    const satellites = catalog.filter((satellite) => {
      const objectName = String(satellite.OBJECT_NAME ?? satellite.object_name ?? '').toUpperCase();
      return fleet.patterns.some((pattern) => objectName.includes(pattern));
    });
    return { ...fleet, satellites, count: satellites.length };
  });
}

export function selectedFleetSatellites(groups, selectedIds) {
  const selected = new Set(selectedIds);
  return groups
    .filter((group) => selected.has(group.id))
    .flatMap((group) =>
      group.satellites.map((satellite, index) => ({
        ...satellite,
        __fleetId: group.id,
        __fleetName: group.name,
        __orbit: group.orbit,
        __color: group.color,
        __localIndex: index,
      })),
    );
}

export function orbitClassTone(orbit) {
  if (orbit === 'GEO') return 'yellow';
  if (orbit === 'MEO') return 'green';
  return 'green';
}
