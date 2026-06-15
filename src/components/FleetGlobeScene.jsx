import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

function makeEarthTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const context = canvas.getContext('2d');
  context.fillStyle = '#010201';
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.strokeStyle = 'rgba(0,255,102,0.24)';
  context.lineWidth = 1;
  for (let x = 0; x <= canvas.width; x += 64) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, canvas.height);
    context.stroke();
  }
  for (let y = 0; y <= canvas.height; y += 32) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(canvas.width, y);
    context.stroke();
  }

  const continents = [
    [[170, 160], [235, 110], [310, 140], [335, 210], [288, 265], [204, 246]],
    [[410, 132], [500, 108], [595, 160], [570, 235], [475, 246], [392, 198]],
    [[548, 255], [635, 270], [705, 345], [656, 420], [550, 386]],
    [[690, 140], [815, 112], [906, 172], [874, 246], [744, 238]],
    [[795, 292], [892, 310], [928, 390], [832, 432], [770, 366]],
  ];
  context.fillStyle = 'rgba(0,255,102,0.18)';
  context.strokeStyle = 'rgba(0,255,102,0.62)';
  continents.forEach((shape) => {
    context.beginPath();
    shape.forEach(([x, y], index) => {
      if (index === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    });
    context.closePath();
    context.fill();
    context.stroke();
  });

  context.fillStyle = 'rgba(190,242,100,0.72)';
  for (let i = 0; i < 1500; i += 1) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    if ((x > 150 && x < 930 && y > 95 && y < 440) || i % 5 === 0) {
      context.fillRect(x, y, Math.random() * 1.9 + 0.35, Math.random() * 1.4 + 0.35);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function orbitalRadius(satellite, orbit) {
  if (orbit === 'GEO') return 6.2;
  if (orbit === 'MEO') return 4.45;
  const meanMotion = Number(satellite.MEAN_MOTION ?? satellite.mean_motion);
  if (!Number.isFinite(meanMotion) || meanMotion <= 0) return 2.38;
  const earthMu = 398600.4418;
  const radiansPerSecond = (meanMotion * Math.PI * 2) / 86400;
  const semiMajorAxisKm = Math.cbrt(earthMu / (radiansPerSecond * radiansPerSecond));
  const altitudeKm = Math.max(180, semiMajorAxisKm - 6371);
  return Math.min(3.1, Math.max(2.22, 2.08 + altitudeKm / 2600));
}

function satelliteVector(satellite, index) {
  const orbit = satellite.__orbit;
  const radius = orbitalRadius(satellite, orbit);
  if (orbit === 'GEO') {
    const longitude = ((Number(satellite.RA_OF_ASC_NODE) || index * 31) + (Number(satellite.MEAN_ANOMALY) || 0)) * (Math.PI / 180);
    return new THREE.Vector3(Math.cos(longitude) * radius, 0, Math.sin(longitude) * radius);
  }

  const inclination = ((Number(satellite.INCLINATION) || (orbit === 'MEO' ? 55 : 53)) * Math.PI) / 180;
  const node = ((Number(satellite.RA_OF_ASC_NODE) || index * 17.508) * Math.PI) / 180;
  const anomaly = ((Number(satellite.MEAN_ANOMALY) || index * 29.17) * Math.PI) / 180;
  const x = radius * Math.cos(anomaly);
  const y = radius * Math.sin(anomaly) * Math.sin(inclination);
  const z = radius * Math.sin(anomaly) * Math.cos(inclination);
  return new THREE.Vector3(x, y, z).applyAxisAngle(new THREE.Vector3(0, 1, 0), node);
}

function FleetEarth({ rotationRef }) {
  const group = useRef();
  const texture = useMemo(() => makeEarthTexture(), []);

  useFrame((_, delta) => {
    rotationRef.current += delta * 0.045;
    group.current.rotation.y = rotationRef.current;
  });

  return (
    <group ref={group}>
      <mesh>
        <sphereGeometry args={[2, 128, 128]} />
        <meshStandardMaterial map={texture} color="#07351f" roughness={0.78} metalness={0.05} emissive="#002f16" emissiveIntensity={0.38} />
      </mesh>
      <mesh>
        <sphereGeometry args={[2.018, 96, 96]} />
        <meshBasicMaterial color="#00ff66" wireframe transparent opacity={0.14} />
      </mesh>
      <mesh>
        <sphereGeometry args={[2.11, 96, 96]} />
        <meshBasicMaterial color="#00ff66" transparent opacity={0.055} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

function FleetParticles({ satellites, rotationRef }) {
  const mesh = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const material = useMemo(() => new THREE.MeshBasicMaterial({ color: '#00ff66', toneMapped: false }), []);
  const positions = useMemo(() => satellites.slice(0, 1800).map((satellite, index) => satelliteVector(satellite, index)), [satellites]);

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    positions.forEach((position, index) => {
      const satellite = satellites[index];
      const speed = satellite.__orbit === 'GEO' ? 0 : satellite.__orbit === 'MEO' ? 0.035 : 0.18;
      const geolockAngle = satellite.__orbit === 'GEO' ? rotationRef.current : elapsed * speed + index * 0.0006;
      dummy.position.copy(position).applyAxisAngle(new THREE.Vector3(0, 1, 0), geolockAngle);
      dummy.scale.setScalar(satellite.__orbit === 'GEO' ? 0.055 : satellite.__orbit === 'MEO' ? 0.036 : 0.025);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(index, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[null, null, positions.length]}>
      <sphereGeometry args={[1, 10, 10]} />
      <primitive object={material} attach="material" />
    </instancedMesh>
  );
}

function OrbitBands() {
  return (
    <group>
      {[2.4, 4.45, 6.2].map((radius) => (
        <mesh key={radius} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[radius, 0.004, 8, 180]} />
          <meshBasicMaterial color={radius > 5 ? '#bef264' : '#00ff66'} transparent opacity={radius > 5 ? 0.42 : 0.22} />
        </mesh>
      ))}
    </group>
  );
}

export default function FleetGlobeScene({ satellites }) {
  const rotationRef = useRef(0);

  return (
    <Canvas camera={{ position: [0, 3.4, 10.2], fov: 45 }} gl={{ antialias: true, alpha: true }} dpr={[1, 1.75]}>
      <color attach="background" args={['#000000']} />
      <ambientLight intensity={0.36} />
      <pointLight position={[5, 4, 5]} intensity={28} color="#00ff66" />
      <pointLight position={[-6, -2, -4]} intensity={12} color="#bef264" />
      <Stars radius={95} depth={52} count={4200} factor={3.4} saturation={0} fade speed={0.25} />
      <FleetEarth rotationRef={rotationRef} />
      <OrbitBands />
      <FleetParticles satellites={satellites} rotationRef={rotationRef} />
      <OrbitControls enableDamping dampingFactor={0.06} minDistance={4} maxDistance={18} />
    </Canvas>
  );
}
