import { LogisticsOrder, DeliveryNoteDoc } from '../types/logistics';
import { INITIAL_ORDERS, SAMPLE_DELIVERY_NOTES } from './mockData';

const ORDERS_STORAGE_KEY = 'noa_saban_orders_sheet_live_v4';
const DOCS_STORAGE_KEY = 'noa_saban_docs_sheet_live_v4';
const OFFLINE_QUEUE_KEY = 'noa_saban_offline_queue_v4';

// Purge legacy storage keys that held outdated mock orders
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('noa_saban_orders_v1');
    localStorage.removeItem('noa_saban_orders_v2');
    localStorage.removeItem('noa_saban_orders_v3');
  } catch {
    // Ignore in non-browser environments
  }
}

export function getStoredOrders(): LogisticsOrder[] {
  if (typeof window === 'undefined') return INITIAL_ORDERS;
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(INITIAL_ORDERS));
      return INITIAL_ORDERS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length > 5 || !parsed.some((o: any) => o.orderNumber === '6215184' || o.orderNumber === '6215180' || o.orderNumber === '6215178')) {
      // Reset to authentic 3 orders from Noa sheet
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(INITIAL_ORDERS));
      return INITIAL_ORDERS;
    }
    return parsed;
  } catch {
    return INITIAL_ORDERS;
  }
}

export function saveStoredOrders(orders: LogisticsOrder[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  window.dispatchEvent(new CustomEvent('orders_updated', { detail: orders }));
}

export function updateSingleOrder(updatedOrder: LogisticsOrder): void {
  const all = getStoredOrders();
  const index = all.findIndex(o => o.id === updatedOrder.id || o.orderNumber === updatedOrder.orderNumber);
  if (index >= 0) {
    all[index] = updatedOrder;
  } else {
    all.unshift(updatedOrder);
  }
  saveStoredOrders(all);
}

export function deleteSingleOrder(orderIdOrNumber: string): void {
  const all = getStoredOrders();
  const filtered = all.filter(o => o.id !== orderIdOrNumber && o.orderNumber !== orderIdOrNumber);
  saveStoredOrders(filtered);
}

export function getStoredDocs(): DeliveryNoteDoc[] {
  if (typeof window === 'undefined') return SAMPLE_DELIVERY_NOTES;
  try {
    const raw = localStorage.getItem(DOCS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(DOCS_STORAGE_KEY, JSON.stringify(SAMPLE_DELIVERY_NOTES));
      return SAMPLE_DELIVERY_NOTES;
    }
    return JSON.parse(raw);
  } catch {
    return SAMPLE_DELIVERY_NOTES;
  }
}

export function saveStoredDocs(docs: DeliveryNoteDoc[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DOCS_STORAGE_KEY, JSON.stringify(docs));
  window.dispatchEvent(new CustomEvent('docs_updated', { detail: docs }));
}

export function addOfflineQueueItem(item: { type: string; payload: any; timestamp: number }) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]';
    const queue = JSON.parse(raw);
    queue.push(item);
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    window.dispatchEvent(new CustomEvent('offline_queue_updated', { detail: queue }));
  } catch (err) {
    console.error('Failed to enqueue offline item', err);
  }
}

export function getOfflineQueueCount(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]';
    const queue = JSON.parse(raw);
    return queue.length;
  } catch {
    return 0;
  }
}

export function clearOfflineQueue(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify([]));
  window.dispatchEvent(new CustomEvent('offline_queue_updated', { detail: [] }));
}
