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
  zeroSum: {
    cc: { you: 3, them: 3 },
    cd: { you: 6, them: 0 },
    dc: { you: 0, them: 6 },
    dd: { you: 1, them: 1 }
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
    yourScore: 0,
    theirScore: 0,
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
  if (gameState.mode === 'zero-sum') {
    return Math.random() > 0.3 ? 'compete' : 'collab';
  } else {
    return Math.random() > 0.2 ? 'collab' : 'compete';
  }
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
  document.getElementById('your-move-display').textContent = yourMove === 'compete' ? '⚔️ Compete' : '🤝 Collaborate';
  document.getElementById('their-move-display').textContent = gameState.theirMove === 'compete' ? '⚔️ Compete' : '🤝 Collaborate';
  document.getElementById('round-your-gain').textContent = '+' + payoff.you;
  document.getElementById('round-their-gain').textContent = '+' + payoff.them;

  let insight = '';
  if (yourMove === 'compete' && gameState.theirMove === 'compete') {
    insight = '⚔️ Both competed! The market shrinks. Low gains for both.';
  } else if (yourMove === 'collab' && gameState.theirMove === 'collab') {
    insight = '🤝 Both collaborated! The market grows. High gains for everyone.';
  } else if (yourMove === 'compete' && gameState.theirMove === 'collab') {
    insight = '😱 You exploited their trust. You won this round, but trust is broken.';
  } else {
    insight = '😢 They exploited your trust. Your collaborative approach backfired.';
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
  document.getElementById('start-zero-sum').addEventListener('click', () => startGame('zero-sum'));
  document.getElementById('start-positive-sum').addEventListener('click', () => startGame('positive-sum'));

  document.getElementById('choice-compete').addEventListener('click', () => processRound('compete'));
  document.getElementById('choice-collab').addEventListener('click', () => processRound('collab'));

  document.getElementById('next-round-btn').addEventListener('click', () => {
    if (gameState.round < 3) {
      gameState.round++;
      updateScoreDisplay();
      gameContainer.choicePhase.style.display = 'block';
      gameContainer.resultPhase.style.display = 'none';
    } else {
      endGame();
    }
  });

  document.getElementById('play-again-btn').addEventListener('click', () => {
    showScreen(gameContainer.start);
  });
});
