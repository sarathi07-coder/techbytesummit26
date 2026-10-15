/**
 * REAGENTWATCH AI - DEXIE.JS OFFLINE INDEXEDDB QUEUE
 * Manages local edge storage and background synchronization for peri-urban offline use
 */

import Dexie, { Table } from 'dexie';
import { DegradationEvent } from '@/types/chemical';

export interface OfflineSyncQueueItem {
  id?: number;
  bottleId: string;
  eventType: string;
  voiceNoteText?: string;
  voiceLang?: string;
  photoBase64?: string;
  timestamp: string;
  synced: boolean;
}

export class ReagentWatchOfflineDB extends Dexie {
  syncQueue!: Table<OfflineSyncQueueItem, number>;

  constructor() {
    super('ReagentWatchOfflineDB');
    this.version(1).stores({
      syncQueue: '++id, bottleId, eventType, timestamp, synced',
    });
  }
}

export const offlineDB = new ReagentWatchOfflineDB();

/**
 * Enqueues an event locally on edge device
 */
export async function enqueueOfflineEvent(
  bottleId: string,
  eventType: string,
  voiceNoteText?: string,
  voiceLang: string = 'en',
  photoBase64?: string
): Promise<number> {
  const item: OfflineSyncQueueItem = {
    bottleId,
    eventType,
    voiceNoteText,
    voiceLang,
    photoBase64,
    timestamp: new Date().toISOString(),
    synced: false,
  };

  return await offlineDB.syncQueue.add(item);
}

/**
 * Retrieves all pending offline events waiting for network sync
 */
export async function getPendingOfflineEvents(): Promise<OfflineSyncQueueItem[]> {
  return await offlineDB.syncQueue.where('synced').equals(0).toArray();
}

/**
 * Marks items as synced
 */
export async function markEventsAsSynced(ids: number[]): Promise<void> {
  await offlineDB.syncQueue.bulkDelete(ids);
}
