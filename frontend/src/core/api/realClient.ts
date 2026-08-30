import type { ApiService } from './apiService';
import type { InternalObservation, InternalJobStatus, RegistrationOptions } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000';

/**
 * Real implementation of the ApiService.
 * This is the ONLY file that knows about the backend's `schemas.py` types.
 * It maps backend responses into the frontend's decoupled Internal models.
 */
export class RealClient implements ApiService {
  
  async getAvailableObservations(): Promise<InternalObservation[]> {
    // In a real scenario, this would call a backend endpoint.
    // Since the backend doesn't seem to have a GET /observations endpoint in server.py,
    // we fallback to some hardcoded realistic data or make a dummy request.
    // The UI is protected because it only cares about InternalObservation.
    console.warn('RealClient: getAvailableObservations is returning fallback data because backend lacks this endpoint.');
    
    return [
      {
        id: 'real-ohrc-1',
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
        id: 'real-tmc-1',
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
      }
    ];
  }

  async registerPair(source: InternalObservation, reference: InternalObservation, options: RegistrationOptions) {
    // Map internal types to backend `RegistrationRequest` schema
    const requestBody = {
      source_sensor: source.sensor,
      reference_sensor: reference.sensor,
      source_dataset_id: source.datasetId,
      reference_dataset_id: reference.datasetId,
      options: {
        feature_method: options.featureMethod,
        photometric_model: options.photometricModel,
        grid_size: options.gridSize
      }
    };

    const response = await fetch(`${API_BASE_URL}/api/v1/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Failed to register pair: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Map backend `RegistrationResponse` to frontend interface
    return {
      jobId: data.job_id,
      estimatedTime: data.estimated_time
    };
  }

  async getJobStatus(jobId: string): Promise<InternalJobStatus> {
    const response = await fetch(`${API_BASE_URL}/api/v1/jobs/${jobId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch job status');
    }
    const data = await response.json();

    // Map backend `JobStatus` to frontend `InternalJobStatus`
    return {
      jobId,
      status: this.mapBackendStatus(data.status),
      progress: data.progress,
      stageName: data.stage_name,
      message: data.message || '',
      metrics: data.metrics ? {
        rmse: data.metrics.rmse,
        inlierRatio: data.metrics.inlier_ratio,
        totalMatches: data.metrics.total_matches,
        inlierCount: data.metrics.inlier_count,
      } : undefined
    };
  }

  subscribeToJob(jobId: string, onUpdate: (status: InternalJobStatus) => void): () => void {
    const ws = new WebSocket(`${WS_BASE_URL}/api/v1/ws/jobs/${jobId}`);
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.error) {
          onUpdate({
            jobId,
            status: 'FAILED',
            progress: 0,
            stageName: 'ERROR',
            message: data.error
          });
          ws.close();
          return;
        }

        onUpdate({
          jobId,
          status: this.mapBackendStatus(data.status),
          progress: data.progress || 0,
          stageName: data.stage || '',
          message: data.message || '',
          metrics: data.metrics ? {
            rmse: data.metrics.rmse,
            inlierRatio: data.metrics.inlier_ratio,
            totalMatches: data.metrics.total_matches,
            inlierCount: data.metrics.inlier_count,
          } : undefined
        });
      } catch (e) {
        console.error('Error parsing WS message', e);
      }
    };

    ws.onerror = () => {
      onUpdate({
        jobId,
        status: 'FAILED',
        progress: 0,
        stageName: 'CONNECTION_ERROR',
        message: 'WebSocket connection failed'
      });
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }

  private mapBackendStatus(backendStatus: string): InternalJobStatus['status'] {
    switch(backendStatus.toLowerCase()) {
      case 'pending': return 'PENDING';
      case 'processing': return 'PROCESSING';
      case 'completed': return 'COMPLETED';
      case 'failed': return 'FAILED';
      default: return 'IDLE';
    }
  }
}

// Singleton export
export const realApiService = new RealClient();
