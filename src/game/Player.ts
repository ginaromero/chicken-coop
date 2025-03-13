import { Game } from './Game';
import { Projectile } from './Projectile';

export class Player {
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  private speed: number = 0.3;
  private movingLeft: boolean = false;
  private movingRight: boolean = false;
  private game: Game;
  private shootCooldown: number = 500;
  private lastShootTime: number = 0;
  private rapidFireActive: boolean = false;
  private rapidFireTimer: number = 0;
  private rapidFireDuration: number = 5000;
  private shieldActive: boolean = false;
  private shieldTimer: number = 0;
  private shieldDuration: number = 8000;
  private frameIndex: number = 0;
  private frameTimer: number = 0;
  private frameInterval: number = 150;
  private totalFrames: number = 2;
  
  constructor(x: number, y: number, width: number, height: number, game: Game) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.game = game;
  }
  
  public update(deltaTime: number): void {
    // Handle movement
    if (this.movingLeft) {
      this.x -= this.speed * deltaTime;
    }
    if (this.movingRight) {
      this.x += this.speed * deltaTime;
    }
    
    // Keep player within canvas bounds
    const canvas = this.game.getCanvas();
    if (this.x < 0) {
      this.x = 0;
    } else if (this.x + this.width > canvas.width) {
      this.x = canvas.width - this.width;
    }
    
    // Update rapid fire timer
    if (this.rapidFireActive) {
      this.rapidFireTimer += deltaTime;
      if (this.rapidFireTimer >= this.rapidFireDuration) {
        this.rapidFireActive = false;
        this.rapidFireTimer = 0;
      }
    }
    
    // Update shield timer
    if (this.shieldActive) {
      this.shieldTimer += deltaTime;
      if (this.shieldTimer >= this.shieldDuration) {
        this.shieldActive = false;
        this.shieldTimer = 0;
      }
    }
    
    // Update animation
    this.frameTimer += deltaTime;
    if (this.frameTimer >= this.frameInterval) {
      this.frameTimer = 0;
      this.frameIndex = (this.frameIndex + 1) % this.totalFrames;
    }
  }
  
  public draw(ctx: CanvasRenderingContext2D, assetLoader: any): void {
    const chickenImage = assetLoader.getImage('chicken');
    
    if (chickenImage) {
      // Draw chicken with animation
      const frameWidth = chickenImage.width / this.totalFrames;
      ctx.drawImage(
        chickenImage,
        this.frameIndex * frameWidth,
        0,
        frameWidth,
        chickenImage.height,
        this.x,
        this.y,
        this.width,
        this.height
      );
      
      // Draw shield if active
      if (this.shieldActive) {
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 1.5, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.7)';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Add glow effect
        ctx.shadowColor = 'rgba(0, 255, 255, 0.7)';
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    }
  }
  
  public shoot(): void {
    const currentTime = performance.now();
    const cooldown = this.rapidFireActive ? this.shootCooldown / 3 : this.shootCooldown;
    
    if (currentTime - this.lastShootTime >= cooldown) {
      // Create egg projectile
      const projectile = new Projectile(
        this.x + this.width / 2 - 10,
        this.y,
        20,
        30,
        -0.5,
        true
      );
      
      this.game.addProjectile(projectile);
      this.lastShootTime = currentTime;
      
      // Play shoot sound
      this.game.getAudioManager().play('shoot', false, 0.3);
    }
  }
  
  public setMovingLeft(moving: boolean): void {
    this.movingLeft = moving;
  }
  
  public setMovingRight(moving: boolean): void {
    this.movingRight = moving;
  }
  
  public activateRapidFire(): void {
    this.rapidFireActive = true;
    this.rapidFireTimer = 0;
  }
  
  public activateShield(): void {
    this.shieldActive = true;
    this.shieldTimer = 0;
  }
  
  public hasShield(): boolean {
    return this.shieldActive;
  }
}
