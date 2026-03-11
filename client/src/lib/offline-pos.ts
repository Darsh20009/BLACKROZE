import { db } from './db/dexie-db';
import type { LocalProduct, LocalInvoice, SyncItem } from './db/dexie-db';

export type { LocalProduct, LocalInvoice, SyncItem };

const TENANT_ID = () => {
  try {
    const emp = JSON.parse(localStorage.getItem('currentEmployee') || '{}');
    return emp?.tenantId || 'demo-tenant';
  } catch { return 'demo-tenant'; }
};

const BRANCH_ID = () => {
  try {
    const emp = JSON.parse(localStorage.getItem('currentEmployee') || '{}');
    return emp?.branchId || 'main';
  } catch { return 'main'; }
};

export async function cacheProducts(products: any[]): Promise<void> {
  try {
    const tenantId = TENANT_ID();
    const records: LocalProduct[] = products.map(p => ({
      id: p.id,
      nameAr: p.nameAr,
      price: Number(p.price),
      category: p.category || 'other',
      imageUrl: p.imageUrl,
      isAvailable: p.isAvailable ? 1 : 0,
      tenantId,
      availableSizes: p.availableSizes,
      updatedAt: Date.now(),
    }));
    await db.products.bulkPut(records);
  } catch (err) {
    console.warn('[OfflinePOS] cacheProducts error:', err);
  }
}

export async function getCachedProducts(): Promise<LocalProduct[]> {
  try {
    const tenantId = TENANT_ID();
    return await db.products.where('tenantId').equals(tenantId).toArray();
  } catch { return []; }
}

export async function saveOfflineOrder(orderData: any): Promise<string> {
  const tempId = `OFFLINE-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const tenantId = TENANT_ID();
  const branchId = BRANCH_ID();

  const invoice: LocalInvoice = {
    tempId,
    items: orderData.items,
    totalAmount: orderData.total,
    paymentMethod: orderData.paymentMethod,
    createdAt: Date.now(),
    status: 'pending',
    tenantId,
    branchId,
  };

  await db.invoices.add(invoice);

  const syncItem: SyncItem = {
    type: 'CREATE_ORDER',
    payload: { ...orderData, tempId, tenantId, branchId },
    status: 'pending',
    retryCount: 0,
    createdAt: Date.now(),
  };
  await db.syncQueue.add(syncItem);

  return tempId;
}

export async function getPendingOrdersCount(): Promise<number> {
  try {
    return await db.syncQueue.where('status').equals('pending').count();
  } catch { return 0; }
}

export async function getPendingOrders(): Promise<SyncItem[]> {
  try {
    return await db.syncQueue.where('status').equals('pending').sortBy('createdAt');
  } catch { return []; }
}

export async function syncOfflineOrders(
  onProgress?: (synced: number, total: number) => void
): Promise<{ synced: number; failed: number }> {
  const pending = await getPendingOrders();
  let synced = 0;
  let failed = 0;

  for (let i = 0; i < pending.length; i++) {
    const item = pending[i];
    try {
      await db.syncQueue.update(item.id!, { status: 'processing' });

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(item.payload),
      });

      if (res.ok) {
        const result = await res.json();
        await db.syncQueue.delete(item.id!);
        await db.invoices.where('tempId').equals(item.payload.tempId).modify({ status: 'synced' });
        synced++;
      } else {
        const retryCount = (item.retryCount || 0) + 1;
        if (retryCount >= 5) {
          await db.syncQueue.update(item.id!, { status: 'failed', retryCount });
        } else {
          await db.syncQueue.update(item.id!, { status: 'pending', retryCount });
        }
        failed++;
      }
    } catch {
      const retryCount = (item.retryCount || 0) + 1;
      await db.syncQueue.update(item.id!, { status: 'pending', retryCount });
      failed++;
    }

    onProgress?.(synced + failed, pending.length);
  }

  return { synced, failed };
}

export async function clearSyncedOrders(): Promise<void> {
  try {
    await db.invoices.where('status').equals('synced').delete();
  } catch {}
}

export async function getFailedOrders(): Promise<SyncItem[]> {
  try {
    return await db.syncQueue.where('status').equals('failed').toArray();
  } catch { return []; }
}

export async function retryFailedOrders(): Promise<void> {
  try {
    await db.syncQueue.where('status').equals('failed').modify({ status: 'pending', retryCount: 0 });
  } catch {}
}
