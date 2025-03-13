
interface ImageAsset {
  name: string;
  src: string;
}

export class AssetLoader {
  private images: Map<string, HTMLImageElement> = new Map();
  private loadedCount: number = 0;
  private totalCount: number = 0;
  
  public loadImages(imageAssets: ImageAsset[]): void {
    this.totalCount = imageAssets.length;
    
    imageAssets.forEach(asset => {
      const img = new Image();
      img.src = asset.src;
      
      img.onload = () => {
        this.loadedCount++;
        this.images.set(asset.name, img);
      };
      
      img.onerror = () => {
        console.error(`Failed to load image: ${asset.src}`);
        this.loadedCount++;
      };
    });
  }
  
  public getImage(name: string): HTMLImageElement | undefined {
    return this.images.get(name);
  }