import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ImageCacheService {
  private dbName = 'YsuImageCache';
  private storeName = 'images';
  private db: IDBDatabase | null = null;
  
  constructor() {
    this.initDb();
  }
  
  private initDb(): void {
    const request = indexedDB.open(this.dbName, 1);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(this.storeName)) {
        db.createObjectStore(this.storeName, { keyPath: 'url' });
      }
    };
    
    request.onsuccess = (event) => {
      this.db = (event.target as IDBOpenDBRequest).result;
    };
    
    request.onerror = (event) => {
      console.error('Error opening image cache database', event);
    };
  }
  
  getImage(url: string): Observable<string | null> {
    if (!this.db) {
      return of(null);
    }
    
    return from(new Promise<string | null>((resolve) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(url);
      
      request.onsuccess = () => {
        const data = request.result;
        if (data) {
          resolve(data.dataUrl);
        } else {
          resolve(null);
        }
      };
      
      request.onerror = () => {
        resolve(null);
      };
    }));
  }
  
  cacheImage(url: string, dataUrl: string): Observable<boolean> {
    if (!this.db) {
      return of(false);
    }
    
    return from(new Promise<boolean>((resolve) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put({ url, dataUrl });
      
      request.onsuccess = () => {
        resolve(true);
      };
      
      request.onerror = () => {
        resolve(false);
      };
    }));
  }
  
  fetchAndCacheImage(url: string): Observable<string> {
    return this.getImage(url).pipe(
      catchError(() => of(null)),
      map(cachedImage => {
        if (cachedImage) {
          return cachedImage;
        }
        
        return this.fetchImage(url);
      })
    );
  }
  
  private fetchImage(url: string): string {
    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          this.cacheImage(url, base64data).subscribe();
        };
        reader.readAsDataURL(blob);
      })
      .catch(error => {
        console.error('Error fetching image for cache', error);
      });
    
    return url;
  }
  
  clearOldCache(maxAge: number = 7 * 24 * 60 * 60 * 1000): void {
    if (!this.db) return;
    
    const transaction = this.db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);
    const request = store.openCursor();
    
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        const timestamp = cursor.value.timestamp || Date.now();
        if (Date.now() - timestamp > maxAge) {
          cursor.delete();
        }
        cursor.continue();
      }
    };
  }
}