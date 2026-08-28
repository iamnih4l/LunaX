import { useMemo } from 'react';
import * as THREE from 'three';
import { useAppStore } from '../store/useAppStore';
import { DEMO_OBSERVATIONS, SENSORS } from '../api/mock';

interface LunarFootprintsProps {
  radius: number;
}

export default function LunarFootprints({ radius }: LunarFootprintsProps) {
  const activeLayers = useAppStore((s) => s.activeLayers);
  
  const footprints = useMemo(() => {
    return DEMO_OBSERVATIONS.map((obs) => {
      const sensor = SENSORS[obs.sensor];
      
      // Determine color based on sensor
      let color = '#ffffff';
      if (obs.sensor === 'OHRC') color = 'var(--color-ohrc)';
      else if (obs.sensor === 'TMC2') color = 'var(--color-tmc)';
      else if (obs.sensor === 'IIRS') color = 'var(--color-iirs)';

      // Convert lat/lon to 3D Cartesian coordinates
      // Latitude is from equator, Longitude from prime meridian
      const points = obs.footprint.vertices.map((v) => {
        const phi = (90 - v.lat) * (Math.PI / 180);
        const theta = (v.lon + 90) * (Math.PI / 180);

        // Add a slight offset (1.001) to the radius so lines hover slightly above the sphere
        const r = radius * 1.001; 
        
        return new THREE.Vector3(
          -(r * Math.sin(phi) * Math.cos(theta)),
          r * Math.cos(phi),
          r * Math.sin(phi) * Math.sin(theta)
        );
      });
      
      // Close the loop
      if (points.length > 0) {
        points.push(points[0]);
      }

      const geometry = new THREE.BufferGeometry().setFromPoints(points);

      return {
        id: obs.id,
        sensorName: sensor.name,
        geometry,
        color,
      };
    });
  }, [radius]);

  if (!activeLayers.has('footprints')) {
    return null;
  }

  return (
    <group>
      {footprints.map((fp) => (
        // @ts-ignore
        <line key={fp.id} geometry={fp.geometry}>
          <lineBasicMaterial color={fp.color} linewidth={2} transparent opacity={0.8} />
        </line>
      ))}
    </group>
  );
}
