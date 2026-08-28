/* ─── LunarGlobe ─── */
/* Interactive 3D Moon — the primary interface element */

import { useRef, useMemo, useState, useCallback, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useAppStore } from '../store/useAppStore';
import LunarFootprints from './LunarFootprints';

interface LunarGlobeProps {
  radius?: number;
  interactive?: boolean;
  sunDirection?: [number, number, number];
}

export default function LunarGlobe({
  radius = 2,
  interactive = true,
  sunDirection = [5, 2, 3],
}: LunarGlobeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const autoRotate = useAppStore((s) => s.globeAutoRotate);
  const [hoverCoords, setHoverCoords] = useState<{ lat: number; lon: number } | null>(null);

  /* Helper to convert 3D point to lat/lon */
  const pointToLatLon = useCallback((point: THREE.Vector3, r: number) => {
    // Normalizing point to globe coordinate system
    // Given the mesh is rotated -Math.PI/2 on Y, we need to adjust the calculation
    const localPoint = point.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
    const lat = 90 - (Math.acos(localPoint.y / r) * 180 / Math.PI);
    const lon = (Math.atan2(localPoint.z, -localPoint.x) * 180 / Math.PI) - 90;
    
    // Normalize lon to -180 to +180
    let normLon = lon;
    if (normLon < -180) normLon += 360;
    if (normLon > 180) normLon -= 360;
    
    return { lat, lon: normLon };
  }, []);

  const [moonTexture, setMoonTexture] = useState<THREE.Texture | null>(null);
  
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    const url = 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg';
    loader.load(url, (tex) => {
      tex.anisotropy = 16;
      tex.minFilter = THREE.LinearMipMapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      setMoonTexture(tex);
    });
  }, []);

  const proceduralTexture = useMemo(() => {
    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    /* Base lunar grey */
    ctx.fillStyle = '#8a8a8a';
    ctx.fillRect(0, 0, size, size);

    /* Large-scale maria (dark regions) */
    const mariaRegions = [
      { x: 350, y: 350, r: 160, color: '#5a5a60' },   /* Mare Imbrium */
      { x: 550, y: 420, r: 100, color: '#606066' },   /* Mare Serenitatis */
      { x: 620, y: 520, r: 120, color: '#585860' },   /* Mare Tranquillitatis */
      { x: 400, y: 550, r: 90, color: '#5c5c62' },    /* Oceanus Procellarum */
      { x: 300, y: 450, r: 70, color: '#5e5e64' },
      { x: 700, y: 380, r: 60, color: '#626268' },    /* Mare Crisium */
    ];

    mariaRegions.forEach(({ x, y, r, color }) => {
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, color);
      grad.addColorStop(0.7, color);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);
    });

    /* Craters */
    const rng = (seed: number) => {
      let s = seed;
      return () => {
        s = (s * 16807 + 0) % 2147483647;
        return s / 2147483647;
      };
    };
    const rand = rng(42);

    for (let i = 0; i < 400; i++) {
      const cx = rand() * size;
      const cy = rand() * size;
      const cr = 2 + rand() * 18;
      const brightness = 60 + rand() * 50;

      /* Crater rim (lighter) */
      ctx.beginPath();
      ctx.arc(cx, cy, cr, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${brightness + 40}, ${brightness + 40}, ${brightness + 38}, 0.4)`;
      ctx.lineWidth = 1;
      ctx.stroke();

      /* Crater floor (darker) */
      ctx.beginPath();
      ctx.arc(cx, cy, cr * 0.7, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${brightness - 20}, ${brightness - 20}, ${brightness - 22}, 0.3)`;
      ctx.fill();
    }

    /* Fine noise texture */
    const imageData = ctx.getImageData(0, 0, size, size);
    for (let i = 0; i < imageData.data.length; i += 4) {
      const noise = (rand() - 0.5) * 16;
      imageData.data[i] += noise;
      imageData.data[i + 1] += noise;
      imageData.data[i + 2] += noise;
    }
    ctx.putImageData(imageData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }, []);

  /* Bump map for subtle surface relief */
  const bumpTexture = useMemo(() => {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, size, size);

    const rng = (seed: number) => {
      let s = seed;
      return () => {
        s = (s * 16807 + 0) % 2147483647;
        return s / 2147483647;
      };
    };
    const rand = rng(99);

    for (let i = 0; i < 300; i++) {
      const cx = rand() * size;
      const cy = rand() * size;
      const cr = 2 + rand() * 12;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, cr);
      grad.addColorStop(0, '#404040');
      grad.addColorStop(0.5, '#606060');
      grad.addColorStop(0.8, '#909090');
      grad.addColorStop(1, '#808080');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, cr, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }, []);

  const glowMaterialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame(({ camera }, delta) => {
    if (meshRef.current && autoRotate && !interactive) {
      meshRef.current.rotation.y += delta * 0.05;
    }
    if (glowMaterialRef.current) {
      glowMaterialRef.current.uniforms.viewVector.value = camera.position;
    }
  });

  const normalizedSun = useMemo(() => {
    const v = new THREE.Vector3(...sunDirection).normalize();
    return v;
  }, [sunDirection]);

  return (
    <>
      {/* Directional light simulating the Sun */}
      <directionalLight
        position={[normalizedSun.x * 10, normalizedSun.y * 10, normalizedSun.z * 10]}
        intensity={1.2}
        color="#ffffff"
      />

      {/* Subtle ambient fill */}
      <ambientLight intensity={0.2} color="#ffffff" />

      {/* Rim light for atmosphere effect */}
      <pointLight
        position={[-normalizedSun.x * 8, normalizedSun.y * 4, -normalizedSun.z * 8]}
        intensity={0.3}
        color="#6688cc"
        distance={20}
      />

      {/* The Moon */}
      <mesh 
        ref={meshRef} 
        rotation={[0, -Math.PI / 2, 0]}
        onPointerMove={(e) => {
          if (interactive && e.point) {
            setHoverCoords(pointToLatLon(e.point, radius));
          }
        }}
        onPointerOut={() => setHoverCoords(null)}
      >
        <sphereGeometry args={[radius, 128, 128]} />
        {moonTexture ? (
          <meshPhongMaterial
            map={moonTexture}
            bumpMap={moonTexture}
            bumpScale={0.02}
            shininess={0}
          />
        ) : (
          <meshStandardMaterial
            map={proceduralTexture}
            bumpMap={bumpTexture}
            bumpScale={0.02}
            roughness={0.95}
            metalness={0.0}
          />
        )}
      </mesh>

      {/* Atmospheric Glow */}
      <mesh>
        <sphereGeometry args={[radius * 1.05, 64, 64]} />
        <shaderMaterial
          ref={glowMaterialRef}
          uniforms={{
            c: { value: 0.2 },
            p: { value: 4.5 },
            glowColor: { value: new THREE.Color(0x3a393b) },
            viewVector: { value: new THREE.Vector3() }
          }}
          vertexShader={`
            uniform vec3 viewVector;
            varying float intensity;
            void main() {
                vec3 vNormal = normalize( normalMatrix * normal );
                vec3 vNormel = normalize( normalMatrix * viewVector );
                intensity = pow( 0.6 - dot(vNormal, vNormel), 4.0 );
                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            }
          `}
          fragmentShader={`
            uniform vec3 glowColor;
            varying float intensity;
            void main() {
                vec3 glow = glowColor * intensity;
                gl_FragColor = vec4( glow, 1.0 );
            }
          `}
          side={THREE.BackSide}
          transparent={true}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Sensor Footprints */}
      <LunarFootprints radius={radius} />

      {/* Hover Coordinates HTML Overlay */}
      {hoverCoords && interactive && (
        <group position={[0, radius * 1.2, 0]}>
          <Html center style={{ pointerEvents: 'none' }}>
            <div style={{
              background: 'rgba(5, 5, 8, 0.85)',
              border: '1px solid var(--color-border)',
              padding: '4px 8px',
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              color: 'var(--color-text-secondary)',
              borderRadius: '2px',
              whiteSpace: 'nowrap',
              backdropFilter: 'blur(4px)',
            }}>
              LAT {hoverCoords.lat.toFixed(2)}° <br/> LON {hoverCoords.lon.toFixed(2)}°
            </div>
          </Html>
        </group>
      )}

      {/* Controls */}
      {interactive && (
        <OrbitControls
          enablePan={false}
          enableDamping
          dampingFactor={0.05}
          rotateSpeed={0.5}
          zoomSpeed={0.6}
          minDistance={radius * 1.5}
          maxDistance={radius * 5}
          autoRotate={autoRotate}
          autoRotateSpeed={0.3}
        />
      )}
    </>
  );
}
