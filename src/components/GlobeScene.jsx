import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line, OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

function latLongToVector3(latitude, longitude, radius) {
  const phi = (90 - latitude) * (Math.PI / 180);
  const theta = (longitude + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

function Earth() {
  const group = useRef();
  const gridTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const context = canvas.getContext('2d');
    context.fillStyle = '#020302';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = 'rgba(0,255,102,0.42)';
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
    context.fillStyle = 'rgba(0,255,102,0.65)';
    for (let i = 0; i < 900; i += 1) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      context.fillRect(x, y, Math.random() * 2 + 0.4, Math.random() * 1.6 + 0.4);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);

  useFrame((_, delta) => {
    group.current.rotation.y += delta * 0.035;
  });

  return (
    <group ref={group}>
      <mesh>
        <sphereGeometry args={[2, 96, 96]} />
        <meshStandardMaterial map={gridTexture} color="#06351e" roughness={0.82} metalness={0.08} emissive="#003817" emissiveIntensity={0.38} />
      </mesh>
      <mesh>
        <sphereGeometry args={[2.015, 96, 96]} />
        <meshBasicMaterial color="#00ff66" wireframe transparent opacity={0.13} />
      </mesh>
      <mesh>
        <sphereGeometry args={[2.08, 96, 96]} />
        <meshBasicMaterial color="#00ff66" transparent opacity={0.055} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

function SatelliteShell({ satellites }) {
  const mesh = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const positions = useMemo(() => {
    return satellites.slice(0, 900).map((satellite, index) => {
      const latitude = Number.isFinite(satellite.latitude) ? satellite.latitude : ((index * 23.7) % 140) - 70;
      const longitude = Number.isFinite(satellite.longitude) ? satellite.longitude : ((index * 137.5) % 360) - 180;
      const height = Number.isFinite(satellite.height_km) ? satellite.height_km : 540;
      const radius = 2.22 + Math.min(Math.max(height, 320), 620) / 2200;
      return latLongToVector3(latitude, longitude, radius);
    });
  }, [satellites]);

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    positions.forEach((position, index) => {
      const angle = elapsed * 0.05 + index * 0.0009;
      dummy.position.copy(position).applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
      dummy.scale.setScalar(index % 7 === 0 ? 0.033 : 0.022);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(index, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[null, null, positions.length]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color="#00ff66" toneMapped={false} />
    </instancedMesh>
  );
}

function AsteroidVectors({ neos }) {
  const paths = useMemo(() => {
    return neos.slice(0, 7).map((neo, index) => {
      const offset = 2.7 + index * 0.28;
      const z = (index - 3) * 0.45;
      return [
        new THREE.Vector3(-5.2, offset - index * 0.34, z),
        new THREE.Vector3(-1.2, offset * 0.22, z * 0.35),
        new THREE.Vector3(5.2, -offset + index * 0.28, -z),
      ];
    });
  }, [neos]);

  return (
    <>
      {paths.map((points, index) => (
        <Line key={index} points={points} color={neos[index]?.hazardous ? '#ff3333' : '#f87171'} lineWidth={neos[index]?.hazardous ? 3 : 1.5} transparent opacity={0.78} />
      ))}
    </>
  );
}

export default function GlobeScene({ satellites, neos }) {
  return (
    <Canvas camera={{ position: [0, 2.6, 7.4], fov: 48 }} gl={{ antialias: true, alpha: true }} dpr={[1, 1.8]}>
      <color attach="background" args={['#000000']} />
      <ambientLight intensity={0.34} />
      <pointLight position={[4, 4, 5]} intensity={24} color="#00ff66" />
      <pointLight position={[-5, -3, -4]} intensity={10} color="#f87171" />
      <Stars radius={80} depth={40} count={3600} factor={3} saturation={0} fade speed={0.35} />
      <Earth />
      <SatelliteShell satellites={satellites} />
      <AsteroidVectors neos={neos} />
      <OrbitControls enableDamping dampingFactor={0.065} minDistance={3.2} maxDistance={12} />
    </Canvas>
  );
}
