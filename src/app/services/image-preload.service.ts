import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImagePreloadService {
  private preloadedImages: Set<string> = new Set();
  private priorityQueue: string[] = [];
  private isPreloading = false;
  private maxConcurrentPreloads = 3;
  
  constructor() {}
  
  addImages(urls: string[], isPriority = false): void {
    if (!urls || urls.length === 0) return;
    
    // Filter out already preloaded or queued images
    const newUrls = urls.filter(url => !this.preloadedImages.has(url) && !this.priorityQueue.includes(url));
    
    if (newUrls.length === 0) return;
    
    if (isPriority) {
      // Add to the beginning of the queue
      this.priorityQueue.unshift(...newUrls);
    } else {
      // Add to the end of the queue
      this.priorityQueue.push(...newUrls);
    }
    
    // Start preloading if not already in progress
    if (!this.isPreloading) {
      this.preloadNextBatch();
    }
  }
  
  isImagePreloaded(url: string): boolean {
    return this.preloadedImages.has(url);
  }
  
  private preloadNextBatch(): void {
    this.isPreloading = true;
    
    // Get the next batch of images to preload
    const batch = this.priorityQueue.splice(0, this.maxConcurrentPreloads);
    
    if (batch.length === 0) {
      this.isPreloading = false;
      return;
    }
    
    // Preload each image in the batch
    const preloadPromises = batch.map(url => this.preloadImage(url));
    
    // When all images in this batch are preloaded, move to the next batch
    Promise.all(preloadPromises).then(() => {
      if (this.priorityQueue.length > 0) {
        // Continue with next batch
        this.preloadNextBatch();
      } else {
        // No more images to preload
        this.isPreloading = false;
      }
    });
  }
  
  private preloadImage(url: string): Promise<void> {
    return new Promise((resolve) => {
      if (!url || this.preloadedImages.has(url)) {
        resolve();
        return;
      }
      
      const img = new Image();
      
      img.onload = () => {
        this.preloadedImages.add(url);
        resolve();
      };
      
      img.onerror = () => {
        resolve();
      };
      
      img.src = url;
    });
  }
}