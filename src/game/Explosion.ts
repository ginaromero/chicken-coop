export class Explosion {
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  private frameIndex: number = 0;
  private frameTimer: number = 0;
  private frameInterval: number = 50;
  private totalFrames: number = 8;
  
  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
  
  public update(deltaTime: number): void {
    this.frameTimer += deltaTime;
    if (this.frameTimer >= this.frameInterval) {
      this.frameTimer = 0;
      this.frameIndex++;
    }
  }
  
  public draw(ctx: CanvasRenderingContext2D, assetLoader: any): void {
    const explosionImage = assetLoader.getImage('explosion');
    
    if (explosionImage && this.frameIndex < this.totalFrames) {
      const frameWidth = explosionImage.width / this.totalFrames;
      ctx.drawImage(
        explosionImage,
        this.frameIndex * frameWidth,
        0,
        frameWidth,
        explosionImage.height,
        this.x,
        this.y,
        this.width,
        this.height
      );
    }
  }
  
  public isComplete(): boolean {
    return this.frameIndex >= this.totalFrames;
  }
}
