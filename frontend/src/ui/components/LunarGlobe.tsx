import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useAppStore } from '../../store/useAppStore';

export default function LunarGlobe() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { setHoverCoordinates, targetCoordinates, setTargetCoordinates } = useAppStore();
  
  // Using high-res public textures for the moon
  const [colorMap, bumpMap] = useTexture([
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg',
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg' 
  ]);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.0005; // Slow cinematic rotation
    }
  });

  const handlePointerMove = (e: any) => {
    e.stopPropagation();
    // e.point is the intersection point in world space
    // Since sphere is at [0,0,0], we can just normalize it
    const pt = new THREE.Vector3(e.point.x, e.point.y, e.point.z).normalize();
    
    // Convert to spherical coordinates (Lat/Lon)
    // Adjusting based on how Three.js sets up the axes
    const lat = Math.asin(pt.y) * (180 / Math.PI);
    const lon = Math.atan2(pt.x, pt.z) * (180 / Math.PI);
    
    setHoverCoordinates({ lat, lon });
  };

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    const pt = new THREE.Vector3(e.point.x, e.point.y, e.point.z).normalize();
    const lat = Math.asin(pt.y) * (180 / Math.PI);
    const lon = Math.atan2(pt.x, pt.z) * (180 / Math.PI);
    setTargetCoordinates({ lat, lon });
  };

  const handlePointerOut = () => {
    setHoverCoordinates(null);
  };

  return (
    <>
      <ambientLight intensity={0.1} />
      <directionalLight position={[5, 3, 5]} intensity={1.5} />
      
      <mesh 
        ref={meshRef} 
        position={[0, 0, 0]}
        onPointerMove={handlePointerMove}
        onPointerOut={handlePointerOut}
        onPointerDown={handlePointerDown}
      >
        <sphereGeometry args={[2, 128, 128]} />
        <meshStandardMaterial 
          map={colorMap} 
          bumpMap={bumpMap} 
          bumpScale={0.02}
          roughness={0.7}
          metalness={0.2}
        />
      </mesh>

      {/* Targeting Reticle */}
      {targetCoordinates && (
        <mesh 
          position={[
            2.02 * Math.cos(targetCoordinates.lat * Math.PI/180) * Math.sin(targetCoordinates.lon * Math.PI/180),
            2.02 * Math.sin(targetCoordinates.lat * Math.PI/180),
            2.02 * Math.cos(targetCoordinates.lat * Math.PI/180) * Math.cos(targetCoordinates.lon * Math.PI/180)
          ]}
        >
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshBasicMaterial color="#ff5500" transparent opacity={0.9} />
        </mesh>
      )}
      
      <OrbitControls 
        enablePan={true} 
        enableZoom={true} 
        enableRotate={true}
        minDistance={2.5}
        maxDistance={10}
      />
    </>
  );
}
