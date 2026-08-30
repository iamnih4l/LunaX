import type { ApiService } from './apiService';
import type { InternalObservation, InternalJobStatus, RegistrationOptions } from '../types';

/**
 * Mock implementation of the ApiService for development, testing,
 * and ensuring the frontend never blanks out even if backend is completely down.
 */
export class MockClient implements ApiService {
  
  async getAvailableObservations(): Promise<InternalObservation[]> {
    // Simulate network delay
    await new Promise(r => setTimeout(r, 800));
    return [
      {
        id: 'obs-ohrc-1',
        datasetId: 'ch2_ohrc_ncp_20200115T034512.pds4',
        sensor: 'OHRC',
        previewUrl: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg',
        gsd: 0.25,
        acquisitionTime: '2020-01-15T03:45:12Z',
        footprint: {
          center: { lat: 32.8, lon: -15.6 },
          vertices: [
            { lat: 33.2, lon: -16.0 }, { lat: 33.2, lon: -15.2 },
            { lat: 32.4, lon: -15.2 }, { lat: 32.4, lon: -16.0 },
          ]
        }
      },
      {
        id: 'obs-tmc-1',
        datasetId: 'ch2_tmc2_ncp_20200218T091034.pds4',
        sensor: 'TMC2',
        previewUrl: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg',
        gsd: 5.0,
        acquisitionTime: '2020-02-18T09:10:34Z',
        footprint: {
          center: { lat: 33.0, lon: -15.5 },
          vertices: [
            { lat: 34.5, lon: -17.0 }, { lat: 34.5, lon: -14.0 },
            { lat: 31.5, lon: -14.0 }, { lat: 31.5, lon: -17.0 },
          ]
        }
      },
      {
        id: 'obs-iirs-1',
        datasetId: 'ch2_iirs_ncp_20200305T142256.pds4',
        sensor: 'IIRS',
        previewUrl: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg',
        gsd: 80.0,
        acquisitionTime: '2020-03-05T14:22:56Z',
        footprint: {
          center: { lat: 32.5, lon: -15.8 },
          vertices: [
            { lat: 34.0, lon: -17.1 }, { lat: 34.0, lon: -14.5 },
            { lat: 31.0, lon: -14.5 }, { lat: 31.0, lon: -17.1 },
          ]
        }
      },
      {
        id: 'obs-ohrc-2',
        datasetId: 'ch2_ohrc_ncp_20200512T112233.pds4',
        sensor: 'OHRC',
        previewUrl: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg',
        gsd: 0.25,
        acquisitionTime: '2020-05-12T11:22:33Z',
        footprint: {
          center: { lat: 32.1, lon: -14.2 },
          vertices: [
            { lat: 33.5, lon: -15.0 }, { lat: 33.5, lon: -13.0 },
            { lat: 31.0, lon: -13.0 }, { lat: 31.0, lon: -15.0 },
          ]
        }
      }
    ];
  }

  async registerPair(_source: InternalObservation, _reference: InternalObservation, _options: RegistrationOptions) {
    await new Promise(r => setTimeout(r, 1000));
    return {
      jobId: `mock-job-${Date.now()}`,
      estimatedTime: 15.0
    };
  }

  async getJobStatus(jobId: string): Promise<InternalJobStatus> {
    return {
      jobId,
      status: 'PROCESSING',
      progress: 50,
      stageName: 'MOCK_PROCESSING',
      message: 'Running mock processing...'
    };
  }

  subscribeToJob(jobId: string, onUpdate: (status: InternalJobStatus) => void): () => void {
    let progress = 0;
    const stages = ['INGESTION', 'PREPROCESSING', 'FEATURE_MATCHING', 'REGISTRATION', 'EVALUATION'];
    
    const interval = setInterval(() => {
      progress += 10;
      const stageIdx = Math.min(Math.floor(progress / 20), stages.length - 1);
      
      if (progress >= 100) {
        onUpdate({
          jobId,
          status: 'COMPLETED',
          progress: 100,
          stageName: 'COMPLETED',
          message: 'Mock registration complete.',
          metrics: {
            rmse: 0.45,
            inlierRatio: 0.88,
            totalMatches: 2104,
            inlierCount: 1850
          }
        });
        clearInterval(interval);
      } else {
        onUpdate({
          jobId,
          status: 'PROCESSING',
          progress,
          stageName: stages[stageIdx],
          message: `Running ${stages[stageIdx]}...`
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }
}

// Singleton export
export const mockApiService = new MockClient();
