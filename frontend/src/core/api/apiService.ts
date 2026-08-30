import type { InternalObservation, InternalJobStatus, RegistrationOptions } from '../types';

/**
 * The core API Adapter interface.
 * The UI components will ONLY interact with this interface.
 * We can swap the implementation from `MockClient` to `RealClient` without touching the UI.
 */
export interface ApiService {
  /**
   * Fetch available observations for the explorer
   */
  getAvailableObservations(): Promise<InternalObservation[]>;

  /**
   * Initiate a registration job between two observations
   */
  registerPair(
    source: InternalObservation,
    reference: InternalObservation,
    options: RegistrationOptions
  ): Promise<{ jobId: string; estimatedTime: number }>;

  /**
   * Poll for job status (fallback for WebSockets)
   */
  getJobStatus(jobId: string): Promise<InternalJobStatus>;

  /**
   * Connect to a WebSocket for real-time streaming of job status.
   * Returns a cleanup function to close the socket.
   */
  subscribeToJob(jobId: string, onUpdate: (status: InternalJobStatus) => void): () => void;
}
