let currentBoard = {};

async function startNewGame() {
  response = await fetch(`/start-game`);
  const { game_id } = await response.json();
  window.open(`/game/${game_id}`, "_self");
}

document.getElementById('start-new-game-button').addEventListener('click', startNewGame);
