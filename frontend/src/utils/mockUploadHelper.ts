import type { ImageMetadata } from '../types';

export async function processUploadedImage(file: File, sensorOverride?: string): Promise<ImageMetadata> {
  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    
    img.onload = () => {
      // Determine pseudo-sensor based on file name or default to TMC2
      let sensor = (sensorOverride || 'TMC2') as 'OHRC' | 'TMC2' | 'IIRS';
      if (!sensorOverride) {
        if (file.name.toLowerCase().includes('ohrc')) sensor = 'OHRC';
        else if (file.name.toLowerCase().includes('iirs')) sensor = 'IIRS';
      }

      const id = `upload-${Date.now()}`;
      
      // Generate synthetic acquisition data (randomized within reasonable lunar limits)
      const latCenter = (Math.random() - 0.5) * 60; // -30 to +30
      const lonCenter = (Math.random() - 0.5) * 100; // -50 to +50
      
      resolve({
        id,
        sensor,
        filename: file.name,
        dimensions: { width: img.width, height: img.height },
        gsd: sensor === 'OHRC' ? 0.25 : sensor === 'IIRS' ? 80 : 5,
        previewUrl: objectUrl,
        footprint: {
          center: { lat: latCenter, lon: lonCenter },
          bounds: {
            north: latCenter + 1,
            south: latCenter - 1,
            east: lonCenter + 1,
            west: lonCenter - 1
          },
          vertices: [
            { lat: latCenter + 1, lon: lonCenter - 1 },
            { lat: latCenter + 1, lon: lonCenter + 1 },
            { lat: latCenter - 1, lon: lonCenter + 1 },
            { lat: latCenter - 1, lon: lonCenter - 1 }
          ]
        },
        acquisition: {
          orbitNumber: Math.floor(Math.random() * 5000) + 10000,
          acquisitionTime: new Date().toISOString(),
          sunElevation: 10 + Math.random() * 60,
          sunAzimuth: Math.random() * 360,
          incidenceAngle: 20 + Math.random() * 50,
          emissionAngle: Math.random() * 10,
          phaseAngle: 30 + Math.random() * 40,
          spacecraftAltitude: 100,
          viewingAngle: Math.random() * 5
        }
      });
    };
    
    img.src = objectUrl;
  });
}
