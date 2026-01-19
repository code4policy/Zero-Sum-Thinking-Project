// Game containers and state
const gameContainer = {
  start: document.getElementById('game-start'),
  playing: document.getElementById('game-playing'),
  results: document.getElementById('game-results'),
  choicePhase: document.getElementById('choice-phase'),
  resultPhase: document.getElementById('result-phase')
};

let gameState = {
  mode: null,
  round: 1,
  yourScore: 0,
  theirScore: 0,
  yourMove: null,
  theirMove: null,
  history: []
};

const gamePayoff = {
  // Zero-sum: total always equals 0 (what you gain, they lose)
  zeroSum: {
    cc: { you: -5, them: -5 },  // Both attack: costly battle, both lose customers to market chaos
    cd: { you: 10, them: -10 }, // You attack, they defend: you steal their customers
    dc: { you: -10, them: 10 }, // You defend, they attack: they steal your customers
    dd: { you: 0, them: 0 }     // Both defend: market stable, no change
  },
  positiveSum: {
    cc: { you: 6, them: 6 },
    cd: { you: 4, them: 8 },
    dc: { you: 8, them: 4 },
    dd: { you: 2, them: 2 }
  }
};

function showScreen(screen) {
  gameContainer.start.style.display = 'none';
  gameContainer.playing.style.display = 'none';
  gameContainer.results.style.display = 'none';
  screen.style.display = 'block';
}

function startGame(mode) {
  gameState = {
    mode: mode,
    round: 1,
    yourScore: 50,  // Start with 50 customers each
    theirScore: 50,
    yourMove: null,
    theirMove: null,
    history: []
  };
  showScreen(gameContainer.playing);
  gameContainer.resultPhase.style.display = 'none';
  gameContainer.choicePhase.style.display = 'block';
  updateScoreDisplay();
}

function updateScoreDisplay() {
  document.getElementById('round-number').textContent = gameState.round;
  document.getElementById('your-score').textContent = gameState.yourScore;
  document.getElementById('their-score').textContent = gameState.theirScore;
}

function getOpponentMove(yourMove) {
  // Opponent has a mixed strategy: 50% chance to attack, 50% to defend
  // This creates unpredictability and demonstrates the zero-sum dynamic
  return Math.random() > 0.5 ? 'compete' : 'collab';
}

function processRound(yourMove) {
  gameState.yourMove = yourMove;
  gameState.theirMove = getOpponentMove(yourMove);

  const payoffSet = gameState.mode === 'zero-sum' ? gamePayoff.zeroSum : gamePayoff.positiveSum;
  const key = (yourMove === 'compete' ? 'c' : 'd') + (gameState.theirMove === 'compete' ? 'c' : 'd');
  const payoff = payoffSet[key];

  gameState.yourScore += payoff.you;
  gameState.theirScore += payoff.them;
  gameState.history.push({ your: yourMove, their: gameState.theirMove, payoff });

  // Display results
  document.getElementById('your-move-display').textContent = yourMove === 'compete' ? '⚔️ Attack' : '🛡️ Defend';
  document.getElementById('their-move-display').textContent = gameState.theirMove === 'compete' ? '⚔️ Attack' : '🛡️ Defend';
  document.getElementById('round-your-gain').textContent = (payoff.you >= 0 ? '+' : '') + payoff.you;
  document.getElementById('round-their-gain').textContent = (payoff.them >= 0 ? '+' : '') + payoff.them;

  let insight = '';
  if (yourMove === 'compete' && gameState.theirMove === 'compete') {
    insight = '⚔️ Both attacked! Costly battle. Low gains for both.';
  } else if (yourMove === 'collab' && gameState.theirMove === 'collab') {
    insight = '🛡️ Both defended! Market stable. Moderate gains for everyone.';
  } else if (yourMove === 'compete' && gameState.theirMove === 'collab') {
    insight = '😈 You attacked while they defended! You stole their customers.';
  } else {
    insight = '😢 They attacked while you defended! They stole your customers.';
  }
  document.getElementById('round-insight').innerHTML = '<strong style="color: #f97316;">💡</strong> ' + insight;

  updateScoreDisplay();
  gameContainer.choicePhase.style.display = 'none';
  gameContainer.resultPhase.style.display = 'block';
}

function endGame() {
  document.getElementById('final-your-score').textContent = gameState.yourScore;
  document.getElementById('final-their-score').textContent = gameState.theirScore;

  let conclusion = '';
  if (gameState.yourScore > gameState.theirScore + 5) {
    conclusion = '🏆 <strong>You won through competition!</strong> But this mindset often leads to mutual destruction in real situations. In zero-sum thinking, everyone loses in the long run.';
  } else if (gameState.yourScore < gameState.theirScore - 5) {
    conclusion = '😔 <strong>You lost because you trusted too much.</strong> But collaboration works best when both parties are committed to mutual benefit.';
  } else if (gameState.yourScore > gameState.theirScore) {
    conclusion = '⚡ <strong>You slightly won!</strong> Your strategy had moments of success, but the key insight: if both had collaborated, you\'d both have higher scores.';
  } else if (gameState.yourScore < gameState.theirScore) {
    conclusion = '🤔 <strong>They slightly won.</strong> This shows the reality of the prisoner\'s dilemma: individual incentives vs. collective benefit.';
  } else {
    conclusion = '🤝 <strong>It\'s a tie!</strong> Balanced strategies can lead to equal outcomes, but maximum mutual benefit comes from cooperation.';
  }

  document.getElementById('conclusion-text').innerHTML = conclusion;
  showScreen(gameContainer.results);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
  // Start game button - now a single button that starts the zero-sum game
  const startBtn = document.getElementById('start-game');
  if (startBtn) {
    startBtn.addEventListener('click', () => startGame('zero-sum'));
  }

  // Choice buttons - Attack = compete, Defend = collab
  const attackBtn = document.getElementById('choice-attack');
  const defendBtn = document.getElementById('choice-defend');
  if (attackBtn) {
    attackBtn.addEventListener('click', () => processRound('compete'));
  }
  if (defendBtn) {
    defendBtn.addEventListener('click', () => processRound('collab'));
  }

  // Next round button
  const nextRoundBtn = document.getElementById('next-round-btn');
  if (nextRoundBtn) {
    nextRoundBtn.addEventListener('click', () => {
      gameState.round++;
      updateScoreDisplay();
      gameContainer.choicePhase.style.display = 'block';
      gameContainer.resultPhase.style.display = 'none';
    });
  }

  // End game button
  const endGameBtn = document.getElementById('end-game-btn');
  if (endGameBtn) {
    endGameBtn.addEventListener('click', () => endGame());
  }

  // Play again button
  const playAgainBtn = document.getElementById('play-again-btn');
  if (playAgainBtn) {
    playAgainBtn.addEventListener('click', () => {
      showScreen(gameContainer.start);
    });
  }
});
