export class PowerUp {
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public type: string;
  private speed: number = 0.1;
  private rotation: number = 0;
  private rotationSpeed: number = 0.05;
  private colors: { [key: string]: string } = {
    rapidFire: '#ff9900',
    extraLife: '#ff5555',
    shield: '#00ffff'
  };
  
  constructor(x: number, y: number, width: number, height: number, type: string) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.type = type;
  }
  
  public update(deltaTime: number): void {
    this.y += this.speed * deltaTime;
    this.rotation += this.rotationSpeed * deltaTime / 100;
  }
  
  public draw(ctx: CanvasRenderingContext2D, assetLoader: any): void {
    ctx.save();
    
    // Set rotation center
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.rotate(this.rotation);
    
    // Draw power-up
    ctx.fillStyle = this.colors[this.type] || '#ffffff';
    ctx.beginPath();
    ctx.moveTo(-this.width / 2, 0);
    ctx.lineTo(0, -this.height / 2);
    ctx.lineTo(this.width / 2, 0);
    ctx.lineTo(0, this.height / 2);
    ctx.closePath();
    ctx.fill();
    
    // Add glow effect
    ctx.shadowColor = this.colors[this.type] || '#ffffff';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Draw icon based on type
    ctx.fillStyle = '#ffffff';
    if (this.type === 'rapidFire') {
      // Draw lightning bolt
      ctx.beginPath();
      ctx.moveTo(-5, -8);
      ctx.lineTo(2, -2);
      ctx.lineTo(-2, 2);
      ctx.lineTo(5, 8);
      ctx.lineTo(0, 0);
      ctx.lineTo(5, -5);
      ctx.closePath();
      ctx.fill();
    } else if (this.type === 'extraLife') {
      // Draw heart
      ctx.beginPath();
      ctx.moveTo(0, 5);
      ctx.bezierCurveTo(0, 3, -5, -1, -5, -5);
      ctx.bezierCurveTo(-5, -8, 0, -8, 0, -5);
      ctx.bezierCurveTo(0, -8, 5, -8, 5, -5);
      ctx.bezierCurveTo(5, -1, 0, 3, 0, 5);
      ctx.closePath();
      ctx.fill();
    } else if (this.type === 'shield') {
      // Draw shield
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    
    ctx.restore();
  }
}
