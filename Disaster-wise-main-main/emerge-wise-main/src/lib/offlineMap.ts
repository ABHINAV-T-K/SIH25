interface OfflineRoute {
  id: string;
  name: string;
  from_location: string;
  to_location: string;
  current_status: 'open' | 'congested' | 'closed';
  distance_km: number;
  estimated_time_minutes: number;
  coordinates?: [number, number][];
  cached_at: string;
}

interface OfflineMapTile {
  url: string;
  x: number;
  y: number;
  z: number;
  blob: Blob;
}

class OfflineMapManager {
  private dbName = 'EvacuationRoutesDB';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('routes')) {
          db.createObjectStore('routes', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('mapTiles')) {
          const tileStore = db.createObjectStore('mapTiles', { keyPath: ['x', 'y', 'z'] });
          tileStore.createIndex('url', 'url', { unique: false });
        }
      };
    });
  }

  async saveRoute(route: OfflineRoute): Promise<void> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['routes'], 'readwrite');
      const store = transaction.objectStore('routes');
      
      const routeWithTimestamp = {
        ...route,
        cached_at: new Date().toISOString()
      };
      
      const request = store.put(routeWithTimestamp);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getOfflineRoutes(): Promise<OfflineRoute[]> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['routes'], 'readonly');
      const store = transaction.objectStore('routes');
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async saveMapTile(tile: OfflineMapTile): Promise<void> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['mapTiles'], 'readwrite');
      const store = transaction.objectStore('mapTiles');
      const request = store.put(tile);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getMapTile(x: number, y: number, z: number): Promise<OfflineMapTile | null> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['mapTiles'], 'readonly');
      const store = transaction.objectStore('mapTiles');
      const request = store.get([x, y, z]);
      
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async cacheMapArea(bounds: google.maps.LatLngBounds, zoomLevels: number[] = [10, 12, 14]): Promise<void> {
    const promises: Promise<void>[] = [];
    
    for (const zoom of zoomLevels) {
      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();
      
      const minTileX = Math.floor((sw.lng() + 180) / 360 * Math.pow(2, zoom));
      const maxTileX = Math.floor((ne.lng() + 180) / 360 * Math.pow(2, zoom));
      const minTileY = Math.floor((1 - Math.log(Math.tan(ne.lat() * Math.PI / 180) + 1 / Math.cos(ne.lat() * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
      const maxTileY = Math.floor((1 - Math.log(Math.tan(sw.lat() * Math.PI / 180) + 1 / Math.cos(sw.lat() * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
      
      for (let x = minTileX; x <= maxTileX; x++) {
        for (let y = minTileY; y <= maxTileY; y++) {
          const tileUrl = `https://mt1.google.com/vt/lyrs=m&x=${x}&y=${y}&z=${zoom}`;
          
          promises.push(
            fetch(tileUrl)
              .then(response => response.blob())
              .then(blob => this.saveMapTile({ url: tileUrl, x, y, z: zoom, blob }))
              .catch(error => console.warn(`Failed to cache tile ${x},${y},${zoom}:`, error))
          );
        }
      }
    }
    
    await Promise.allSettled(promises);
  }

  async clearOldCache(maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<void> {
    if (!this.db) await this.initDB();
    
    const cutoffDate = new Date(Date.now() - maxAge).toISOString();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['routes'], 'readwrite');
      const store = transaction.objectStore('routes');
      const request = store.openCursor();
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const route = cursor.value;
          if (route.cached_at < cutoffDate) {
            cursor.delete();
          }
          cursor.continue();
        } else {
          resolve();
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }
}

export const offlineMapManager = new OfflineMapManager();

// Utility functions
export const isOnline = (): boolean => navigator.onLine;

export const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

export const findNearestSafeRoute = (
  userLat: number,
  userLng: number,
  routes: OfflineRoute[]
): OfflineRoute | null => {
  let nearestRoute: OfflineRoute | null = null;
  let minDistance = Infinity;

  routes.forEach(route => {
    if (route.current_status === 'open' && route.coordinates && route.coordinates.length > 0) {
      const [routeLng, routeLat] = route.coordinates[0];
      const distance = getDistanceFromLatLonInKm(userLat, userLng, routeLat, routeLng);
      
      if (distance < minDistance) {
        minDistance = distance;
        nearestRoute = route;
      }
    }
  });

  return nearestRoute;
};
