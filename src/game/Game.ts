import { Player } from './Player';
import { Enemy } from './Enemy';
import { Projectile } from './Projectile';
import { Explosion } from './Explosion';
import { PowerUp } from './PowerUp';
import { AssetLoader } from '../utils/AssetLoader';
import { AudioManager } from '../utils/AudioManager';
import { CollisionDetector } from '../utils/CollisionDetector';

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private player: Player;
  private enemies: Enemy[] = [];
  private projectiles: Projectile[] = [];
  private explosions: Explosion[] = [];
  private powerUps: PowerUp[] = [];
  private score: number = 0;
  private lives: number = 3;
  private level: number = 1;
  private gameOver: boolean = false;
  private gameActive: boolean = false;
  private lastEnemySpawn: number = 0;
  private enemySpawnInterval: number = 1500;
  private lastFrameTime: number = 0;
  private assetLoader: AssetLoader;
  private audioManager: AudioManager;
  private collisionDetector: CollisionDetector;
  private enemyTypes: string[] = ['cow', 'pig', 'sheep', 'goat', 'duck'];
  private enemyDirection: number = 1;
  private enemyDropAmount: number = 20;
  private enemyMoveTimer: number = 0;
  private enemyMoveInterval: number = 1000;
  private backgroundPosition: number = 0;
  
  constructor() {
    this.canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    this.assetLoader = new AssetLoader();
    this.audioManager = new AudioManager();
    this.collisionDetector = new CollisionDetector();
    
    // Set canvas dimensions
    this.canvas.width = 800;
    this.canvas.height = 600;
    
    // Create player
    this.player = new Player(
      this.canvas.width / 2 - 30,
      this.canvas.height - 100,
      60,
      60,
      this
    );
  }
  
  public init(): void {
    // Load all game assets
    this.assetLoader.loadImages([
      { name: 'chicken', src: '/assets/chicken.png' },
      { name: 'egg', src: '/assets/egg.png' },
      { name: 'cow', src: '/assets/cow.png' },
      { name: 'pig', src: '/assets/pig.png' },
      { name: 'sheep', src: '/assets/sheep.png' },
      { name: 'goat', src: '/assets/goat.png' },
      { name: 'duck', src: '/assets/duck.png' },
      { name: 'explosion', src: '/assets/explosion.png' },
      { name: 'powerUp', src: '/assets/powerup.png' },
      { name: 'background', src: '/assets/space-background.png' }
    ]);
    
    this.audioManager.loadSounds([
      { name: 'shoot', src: '/assets/sounds/shoot.mp3' },
      { name: 'explosion', src: '/assets/sounds/explosion.mp3' },
      { name: 'powerUp', src: '/assets/sounds/powerup.mp3' },
      { name: 'hit', src: '/assets/sounds/hit.mp3' },
      { name: 'gameOver', src: '/assets/sounds/gameover.mp3' },
      { name: 'background', src: '/assets/sounds/background.mp3' }
    ]);
    
    // Set up event listeners
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));
  }
  
  public start(): void {
    if (this.gameActive) return;
    
    // Hide start screen and show game UI
    const startScreen = document.getElementById('start-screen') as HTMLElement;
    const gameUI = document.getElementById('game-ui') as HTMLElement;
    
    startScreen.classList.add('hidden');
    gameUI.classList.remove('hidden');
    
    // Reset game state
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.gameOver = false;
    this.gameActive = true;
    this.enemies = [];
    this.projectiles = [];
    this.explosions = [];
    this.powerUps = [];
    this.enemySpawnInterval = 1500;
    
    // Create initial enemies
    this.createEnemyWave();
    
    // Play background music
    this.audioManager.play('background', true, 0.5);
    
    // Start game loop
    this.lastFrameTime = performance.now();
    requestAnimationFrame(this.gameLoop.bind(this));
    
    // Update UI
    this.updateScoreDisplay();
    this.updateLivesDisplay();
  }
  
  public restart(): void {
    const gameOverScreen = document.getElementById('game-over-screen') as HTMLElement;
    gameOverScreen.classList.add('hidden');
    this.start();
  }
  
  private gameLoop(timestamp: number): void {
    if (!this.gameActive) return;
    
    // Calculate delta time
    const deltaTime = timestamp - this.lastFrameTime;
    this.lastFrameTime = timestamp;
    
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw scrolling background
    this.drawBackground(deltaTime);
    
    // Update and draw player
    this.player.update(deltaTime);
    this.player.draw(this.ctx, this.assetLoader);
    
    // Update and draw projectiles
    this.updateProjectiles(deltaTime);
    
    // Update and draw enemies
    this.updateEnemies(deltaTime);
    
    // Update and draw explosions
    this.updateExplosions(deltaTime);
    
    // Update and draw power-ups
    this.updatePowerUps(deltaTime);
    
    // Check collisions
    this.checkCollisions();
    
    // Spawn new enemies if needed
    this.spawnEnemies(timestamp);
    
    // Check if level is complete
    if (this.enemies.length === 0) {
      this.levelUp();
    }
    
    // Continue game loop if game is still active
    if (this.gameActive) {
      requestAnimationFrame(this.gameLoop.bind(this));
    }
  }
  
  private drawBackground(deltaTime: number): void {
    // Scroll background slowly
    this.backgroundPosition += 0.05 * deltaTime;
    if (this.backgroundPosition >= this.canvas.height) {
      this.backgroundPosition = 0;
    }
    
    const backgroundImage = this.assetLoader.getImage('background');
    if (backgroundImage) {
      // Draw background twice to create seamless scrolling
      this.ctx.drawImage(backgroundImage, 0, this.backgroundPosition - this.canvas.height, this.canvas.width, this.canvas.height);
      this.ctx.drawImage(backgroundImage, 0, this.backgroundPosition, this.canvas.width, this.canvas.height);
    }
  }
  
  private updateProjectiles(deltaTime: number): void {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i];
      projectile.update(deltaTime);
      projectile.draw(this.ctx, this.assetLoader);
      
      // Remove projectiles that are out of bounds
      if (projectile.y < -projectile.height || projectile.y > this.canvas.height) {
        this.projectiles.splice(i, 1);
      }
    }
  }
  
  private updateEnemies(deltaTime: number): void {
    // Move enemies as a group
    this.enemyMoveTimer += deltaTime;
    
    if (this.enemyMoveTimer >= this.enemyMoveInterval) {
      this.enemyMoveTimer = 0;
      
      // Check if any enemy has reached the edge
      let reachedEdge = false;
      for (const enemy of this.enemies) {
        if ((enemy.x <= 20 && this.enemyDirection < 0) || 
            (enemy.x >= this.canvas.width - enemy.width - 20 && this.enemyDirection > 0)) {
          reachedEdge = true;
          break;
        }
      }
      
      // If reached edge, change direction and move down
      if (reachedEdge) {
        this.enemyDirection *= -1;
        for (const enemy of this.enemies) {
          enemy.y += this.enemyDropAmount;
        }
      } else {
        // Move horizontally
        for (const enemy of this.enemies) {
          enemy.x += 20 * this.enemyDirection;
        }
      }
    }
    
    // Update and draw each enemy
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      enemy.update(deltaTime);
      enemy.draw(this.ctx, this.assetLoader);
      
      // Check if enemy has reached the bottom
      if (enemy.y + enemy.height > this.canvas.height - 50) {
        this.loseLife();
        this.enemies.splice(i, 1);
        this.createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
      }
      
      // Random enemy shooting
      if (Math.random() < 0.001 * deltaTime) {
        enemy.shoot();
      }
    }
  }
  
  private updateExplosions(deltaTime: number): void {
    for (let i = this.explosions.length - 1; i >= 0; i--) {
      const explosion = this.explosions[i];
      explosion.update(deltaTime);
      explosion.draw(this.ctx, this.assetLoader);
      
      // Remove completed explosions
      if (explosion.isComplete()) {
        this.explosions.splice(i, 1);
      }
    }
  }
  
  private updatePowerUps(deltaTime: number): void {
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const powerUp = this.powerUps[i];
      powerUp.update(deltaTime);
      powerUp.draw(this.ctx, this.assetLoader);
      
      // Remove power-ups that are out of bounds
      if (powerUp.y > this.canvas.height) {
        this.powerUps.splice(i, 1);
      }
    }
  }
  
  private checkCollisions(): void {
    // Check player projectiles vs enemies
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i];
      
      // Skip enemy projectiles
      if (!projectile.isPlayerProjectile) continue;
      
      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const enemy = this.enemies[j];
        
        if (this.collisionDetector.checkCollision(projectile, enemy)) {
          // Remove projectile
          this.projectiles.splice(i, 1);
          
          // Damage enemy
          enemy.takeDamage();
          
          // If enemy is destroyed
          if (enemy.health <= 0) {
            // Remove enemy
            this.enemies.splice(j, 1);
            
            // Create explosion
            this.createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
            
            // Play explosion sound
            this.audioManager.play('explosion');
            
            // Add score
            this.addScore(100);
            
            // Chance to drop power-up
            if (Math.random() < 0.2) {
              this.createPowerUp(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
            }
          } else {
            // Play hit sound
            this.audioManager.play('hit');
          }
          
          break;
        }
      }
    }
    
    // Check enemy projectiles vs player
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i];
      
      // Skip player projectiles
      if (projectile.isPlayerProjectile) continue;
      
      if (this.collisionDetector.checkCollision(projectile, this.player)) {
        // Remove projectile
        this.projectiles.splice(i, 1);
        
        // Player takes damage
        this.loseLife();
      }
    }
    
    // Check player vs power-ups
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const powerUp = this.powerUps[i];
      
      if (this.collisionDetector.checkCollision(powerUp, this.player)) {
        // Remove power-up
        this.powerUps.splice(i, 1);
        
        // Apply power-up effect
        this.applyPowerUp(powerUp.type);
        
        // Play power-up sound
        this.audioManager.play('powerUp');
      }
    }
    
    // Check player vs enemies (collision)
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      
      if (this.collisionDetector.checkCollision(enemy, this.player)) {
        // Remove enemy
        this.enemies.splice(i, 1);
        
        // Create explosion
        this.createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
        
        // Player takes damage
        this.loseLife();
      }
    }
  }
  
  private spawnEnemies(timestamp: number): void {
    // Only spawn new enemies if there are none left
    if (this.enemies.length === 0 && timestamp - this.lastEnemySpawn > this.enemySpawnInterval) {
      this.createEnemyWave();
      this.lastEnemySpawn = timestamp;
    }
  }
  
  private createEnemyWave(): void {
    const rows = Math.min(3 + Math.floor(this.level / 2), 5);
    const cols = Math.min(6 + Math.floor(this.level / 3), 10);
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const enemyType = this.enemyTypes[Math.floor(Math.random() * this.enemyTypes.length)];
        const enemy = new Enemy(
          50 + col * 70,
          50 + row * 60,
          50,
          50,
          enemyType,
          this,
          1 + Math.floor(this.level / 3)
        );
        this.enemies.push(enemy);
      }
    }
  }
  
  private levelUp(): void {
    this.level++;
    this.enemySpawnInterval = Math.max(1500 - (this.level * 100), 500);
    this.enemyMoveInterval = Math.max(1000 - (this.level * 50), 300);
    
    // Create new wave of enemies
    this.createEnemyWave();
  }
  
  private loseLife(): void {
    this.lives--;
    this.updateLivesDisplay();
    
    // Play hit sound
    this.audioManager.play('hit');
    
    // Check for game over
    if (this.lives <= 0) {
      this.endGame();
    }
  }
  
  private endGame(): void {
    this.gameActive = false;
    this.gameOver = true;
    
    // Stop background music
    this.audioManager.stop('background');
    
    // Play game over sound
    this.audioManager.play('gameOver');
    
    // Show game over screen
    const gameUI = document.getElementById('game-ui') as HTMLElement;
    const gameOverScreen = document.getElementById('game-over-screen') as HTMLElement;
    const finalScoreElement = document.getElementById('final-score') as HTMLElement;
    
    gameUI.classList.add('hidden');
    gameOverScreen.classList.remove('hidden');
    finalScoreElement.textContent = this.score.toString();
  }
  
  private addScore(points: number): void {
    this.score += points;
    this.updateScoreDisplay();
  }
  
  private updateScoreDisplay(): void {
    const scoreElement = document.getElementById('score') as HTMLElement;
    scoreElement.textContent = `Score: ${this.score}`;
  }
  
  private updateLivesDisplay(): void {
    const livesElement = document.getElementById('lives') as HTMLElement;
    livesElement.textContent = `Lives: ${this.lives}`;
    
    // Add pulse animation
    livesElement.classList.add('pulse');
    setTimeout(() => {
      livesElement.classList.remove('pulse');
    }, 500);
  }
  
  private createExplosion(x: number, y: number): void {
    const explosion = new Explosion(x - 25, y - 25, 50, 50);
    this.explosions.push(explosion);
  }
  
  private createPowerUp(x: number, y: number): void {
    const types = ['rapidFire', 'extraLife', 'shield'];
    const type = types[Math.floor(Math.random() * types.length)];
    const powerUp = new PowerUp(x - 15, y, 30, 30, type);
    this.powerUps.push(powerUp);
  }
  
  private applyPowerUp(type: string): void {
    switch (type) {
      case 'rapidFire':
        this.player.activateRapidFire();
        break;
      case 'extraLife':
        this.lives = Math.min(this.lives + 1, 5);
        this.updateLivesDisplay();
        break;
      case 'shield':
        this.player.activateShield();
        break;
    }
  }
  
  private handleKeyDown(e: KeyboardEvent): void {
    if (!this.gameActive) return;
    
    switch (e.key) {
      case 'ArrowLeft':
      case 'a':
        this.player.setMovingLeft(true);
        break;
      case 'ArrowRight':
      case 'd':
        this.player.setMovingRight(true);
        break;
      case ' ':
      case 'ArrowUp':
      case 'w':
        this.player.shoot();
        break;
    }
  }
  
  private handleKeyUp(e: KeyboardEvent): void {
    if (!this.gameActive) return;
    
    switch (e.key) {
      case 'ArrowLeft':
      case 'a':
        this.player.setMovingLeft(false);
        break;
      case 'ArrowRight':
      case 'd':
        this.player.setMovingRight(false);
        break;
    }
  }
  
  // Public methods for other classes to use
  public addProjectile(projectile: Projectile): void {
    this.projectiles.push(projectile);
  }
  
  public getAudioManager(): AudioManager {
    return this.audioManager;
  }
  
  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }
}
