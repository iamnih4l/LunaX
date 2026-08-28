import type { ImageMetadata } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000';

export interface RegistrationResponse {
  job_id: string;
  status: string;
  estimated_time: number;
}

export async function startRegistration(source: ImageMetadata, reference: ImageMetadata): Promise<RegistrationResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      source_path: `data/raw/${source.filename}`,
      reference_path: `data/raw/${reference.filename}`,
      source_sensor: source.sensor,
      reference_sensor: reference.sensor,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to start registration job');
  }

  return response.json();
}

export function connectJobWebSocket(jobId: string, onMessage: (data: any) => void): WebSocket {
  const ws = new WebSocket(`${WS_BASE_URL}/api/v1/ws/jobs/${jobId}`);
  
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (e) {
      console.error('Error parsing WebSocket message', e);
    }
  };

  return ws;
}
