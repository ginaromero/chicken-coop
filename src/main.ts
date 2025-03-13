import './style.css';
import { Game } from './game/Game';

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const game = new Game();
  
  // Set up event listeners for game controls
  const startButton = document.getElementById('start-button') as HTMLButtonElement;
  const restartButton = document.getElementById('restart-button') as HTMLButtonElement;
  
  startButton.addEventListener('click', () => {
    game.start();
  });
  
  restartButton.addEventListener('click', () => {
    game.restart();
  });
  
  // Initialize the game
  game.init();
});
