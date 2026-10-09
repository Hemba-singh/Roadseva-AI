import type { RoadReport } from '../types/index.js';

const QUEUE_STORAGE_KEY = 'roadseva_offline_queue';

export interface QueuedReport {
  tempId: string;
  createdAt: string;
  data: {
    citizenName: string;
    citizenContact?: string;
    imageUrl: string;
    description: string;
    latitude: number;
    longitude: number;
    locationLabel: string;
    district: string;
    defectType: string;
    aiAnalysis: unknown;
  };
}

export function getOfflineQueue(): QueuedReport[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveToOfflineQueue(reportData: QueuedReport['data']): QueuedReport {
  const current = getOfflineQueue();
  const newItem: QueuedReport = {
    tempId: `draft-${Date.now()}`,
    createdAt: new Date().toISOString(),
    data: reportData,
  };
  current.push(newItem);
  try {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(current));
  } catch (e) {
    console.error('Failed to save to local queue:', e);
  }
  return newItem;
}

export function removeFromOfflineQueue(tempId: string) {
  const current = getOfflineQueue();
  const filtered = current.filter((item) => item.tempId !== tempId);
  try {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed to update local queue:', e);
  }
}

export async function syncOfflineQueue(): Promise<RoadReport[]> {
  const queue = getOfflineQueue();
  if (queue.length === 0) return [];

  const synced: RoadReport[] = [];
  for (const item of queue) {
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.data),
      });
      if (res.ok) {
        const created: RoadReport = await res.json();
        synced.push(created);
        removeFromOfflineQueue(item.tempId);
      }
    } catch (e) {
      console.warn('Sync attempt failed for item:', item.tempId, e);
      break; // Stop if offline
    }
  }

  return synced;
}
