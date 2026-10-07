const DB_NAME = "intercom-push-generator";
const STORE_NAME = "settings";
const ADDRESS_KEY = "addresses";
const ADDRESS_VERSION_KEY = "addresses-version";
export const BUNDLED_ADDRESS_VERSION = "2026-10-05-36999";

function openDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function loadAddresses(): Promise<string[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const request = tx.objectStore(STORE_NAME).get(ADDRESS_KEY);
    request.onsuccess = () => resolve(Array.isArray(request.result) ? request.result : []);
    request.onerror = () => reject(request.error);
  });
}

export async function loadAddressVersion(): Promise<string> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const request = tx.objectStore(STORE_NAME).get(ADDRESS_VERSION_KEY);
    request.onsuccess = () => resolve(typeof request.result === "string" ? request.result : "");
    request.onerror = () => reject(request.error);
  });
}

export async function saveAddresses(addresses: string[]) {
  const db = await openDb();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.put(addresses, ADDRESS_KEY);
    store.put(BUNDLED_ADDRESS_VERSION, ADDRESS_VERSION_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
