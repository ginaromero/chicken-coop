export class Projectile {
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public speed: number;
  public isPlayerProjectile: boolean;
  private rotation: number = 0;
  private rotationSpeed: number = 0.1;
  
  constructor(x: number, y: number, width: number, height: number, speed: number, isPlayerProjectile: boolean) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = speed;
    this.isPlayerProjectile = isPlayerProjectile;
  }
  
  public update(deltaTime: number): void {
    this.y += this.speed * deltaTime;
    
    // Rotate egg projectiles
    if (this.isPlayerProjectile) {
      this.rotation += this.rotationSpeed * deltaTime / 100;
    }
  }
  
  public draw(ctx: CanvasRenderingContext2D, assetLoader: any): void {
    ctx.save();
    
    if (this.isPlayerProjectile) {
      // Draw player projectile (egg)
      const eggImage = assetLoader.getImage('egg');
      
      if (eggImage) {
        // Set rotation center
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotation);
        ctx.drawImage(
          eggImage,
          -this.width / 2,
          -this.height / 2,
          this.width,
          this.height
        );
      }
    } else {
      // Draw enemy projectile
      ctx.fillStyle = '#ff5555';
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x + this.width / 2, this.y + this.height);
      ctx.lineTo(this.x + this.width, this.y);
      ctx.closePath();
      ctx.fill();
      
      // Add glow effect
      ctx.shadowColor = '#ff0000';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    
    ctx.restore();
  }
}
