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

// Zero-sum payoff: constant total per round (fixed pie)
const gamePayoff = {
  zeroSum: {
    // Key: yourMove (c=compete/grab), theirMove
    // Totals are always 10 to visualize a fixed pie
    cc: { you: 5, them: 5, total: 10 },
    cd: { you: 7, them: 3, total: 10 },
    dc: { you: 3, them: 7, total: 10 },
    dd: { you: 5, them: 5, total: 10 }
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
    mode: 'zero-sum',
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
  // In zero-sum mindset, opponent tends to grab more (compete)
  return Math.random() > 0.2 ? 'compete' : 'collab';
}

function processRound(yourMove) {
  gameState.yourMove = yourMove;
  gameState.theirMove = getOpponentMove(yourMove);

  const payoffSet = gamePayoff.zeroSum;
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

  // Update fixed pie split visualization if present
  const yourSliceEl = document.getElementById('split-your');
  const theirSliceEl = document.getElementById('split-their');
  const total = payoff.total || (payoff.you + payoff.them);
  if (yourSliceEl && theirSliceEl && total > 0) {
    const yourPct = Math.round((payoff.you / total) * 100);
    const theirPct = 100 - yourPct;
    yourSliceEl.style.width = yourPct + '%';
    theirSliceEl.style.width = theirPct + '%';
    yourSliceEl.textContent = yourPct + '%';
    theirSliceEl.textContent = theirPct + '%';
  }

  let insight = '';
  if (yourMove === 'compete' && gameState.theirMove === 'compete') {
    insight = '⚔️ Both tried to grab more. In a fixed pie, that leads to an equal split.';
  } else if (yourMove === 'collab' && gameState.theirMove === 'collab') {
    insight = '🤝 Both chose an equal split. In zero-sum settings, equality is fair but not larger.';
  } else if (yourMove === 'compete' && gameState.theirMove === 'collab') {
    insight = '😱 You grabbed a bigger slice while they accepted equality. Relative gain increases for you.';
  } else {
    insight = '😢 They grabbed a bigger slice while you accepted equality. Your relative position worsens.';
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
  const gap = gameState.yourScore - gameState.theirScore;
  if (gap > 3) {
    conclusion = '🏆 <strong>Relative win:</strong> You secured a larger share in a fixed pie. Zero-sum thinking prioritizes the gap over growing the pie.';
  } else if (gap < -3) {
    conclusion = '😔 <strong>Relative loss:</strong> They secured a larger share. In zero-sum settings, one\'s gain is necessarily the other\'s loss.';
  } else if (gap === 0) {
    conclusion = '🤝 <strong>Equal split:</strong> Fixed resources divided fairly. Zero-sum thinking keeps the pie constant—only the division changes.';
  } else {
    conclusion = '⚖️ <strong>Narrow gap:</strong> Small relative advantage. The total never changed; only who held more.';
  }

  document.getElementById('conclusion-text').innerHTML = conclusion;
  showScreen(gameContainer.results);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('start-zero-sum').addEventListener('click', () => startGame('zero-sum'));

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
