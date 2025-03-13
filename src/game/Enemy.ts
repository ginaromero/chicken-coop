import { Game } from './Game';
import { Projectile } from './Projectile';

export class Enemy {
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public type: string;
  public health: number;
  private game: Game;
  private animationFrame: number = 0;
  private animationTimer: number = 0;
  private animationInterval: number = 200;
  private totalFrames: number = 2;
  
  constructor(x: number, y: number, width: number, height: number, type: string, game: Game, health: number = 1) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.type = type;
    this.game = game;
    this.health = health;
  }
  
  public update(deltaTime: number): void {
    // Update animation
    this.animationTimer += deltaTime;
    if (this.animationTimer >= this.animationInterval) {
      this.animationTimer = 0;
      this.animationFrame = (this.animationFrame + 1) % this.totalFrames;
    }
  }
  
  public draw(ctx: CanvasRenderingContext2D, assetLoader: any): void {
    const enemyImage = assetLoader.getImage(this.type);
    
    if (enemyImage) {
      // Draw enemy with animation
      const frameWidth = enemyImage.width / this.totalFrames;
      ctx.drawImage(
        enemyImage,
        this.animationFrame * frameWidth,
        0,
        frameWidth,
        enemyImage.height,
        this.x,
        this.y,
        this.width,
        this.height
      );
      
      // Draw health bar if health > 1
      if (this.health > 1) {
        const healthBarWidth = this.width * 0.8;
        const healthBarHeight = 5;
        const healthBarX = this.x + (this.width - healthBarWidth) / 2;
        const healthBarY = this.y - 10;
        
        // Background
        ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
        
        // Health
        ctx.fillStyle = 'rgba(0, 255, 0, 0.7)';
        ctx.fillRect(
          healthBarX,
          healthBarY,
          healthBarWidth * (this.health / (this.health + 1)),
          healthBarHeight
        );
      }
    }
  }
  
  public shoot(): void {
    // Create projectile
    const projectile = new Projectile(
      this.x + this.width / 2 - 5,
      this.y + this.height,
      10,
      20,
      0.3,
      false
    );
    
    this.game.addProjectile(projectile);
  }
  
  public takeDamage(): void {
    this.health--;
  }
}
