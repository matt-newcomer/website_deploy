const GAME_DIV_ID = "conways_game_of_life_wrapper";
const BUTTON_DIV_ID = "button_overflow";
const CELL_WIDTH = 10;
const FRAME_RATE = 10;
const BUTTON_WIDTH = 60;
const BUTTON_HEIGHT = 30;
const BUTTON_H_PADDING = 5;
let columns, rows;
let board, next;
let paused = false;
let wrapping_div;
let clearButton, pauseButton, resetButton;

// Initial board width and height, updated on first draw
let width = 0;
let height = 0;

function setup() {
  frameRate(FRAME_RATE);

  const canvas = createCanvas(width, height);
  canvas.parent(GAME_DIV_ID);
  canvas.mousePressed(toggleCell);

  // Store the DOM element once for use when the window is resized
  wrapping_div = document.getElementById(GAME_DIV_ID);

  clearButton = createButton('Clear');
  clearButton.parent(BUTTON_DIV_ID);
  clearButton.size(BUTTON_WIDTH, BUTTON_HEIGHT)
  clearButton.position(0, 0, 'relative');
  clearButton.mousePressed(clearGame);

  pauseButton = createButton('Pause');
  pauseButton.parent(BUTTON_DIV_ID);
  pauseButton.position(clearButton.x + BUTTON_H_PADDING, 0, 'relative');
  pauseButton.size(BUTTON_WIDTH, BUTTON_HEIGHT);
  pauseButton.mousePressed(toggleGamePause);

  resetButton = createButton('Reset');
  resetButton.parent(BUTTON_DIV_ID);
  resetButton.position(pauseButton.x + BUTTON_H_PADDING, 0, 'relative');
  resetButton.size(BUTTON_WIDTH, BUTTON_HEIGHT);
  resetButton.mousePressed(resetGame);

  initialize(true);
}

function updateCanvasSize() {
  let position_info = wrapping_div.getBoundingClientRect();
  width = Math.floor(position_info.width / CELL_WIDTH) * CELL_WIDTH
  height = 600;
  resizeCanvas(width, height);
}

function updateGridSize() {
  columns = floor(width / CELL_WIDTH);
  rows = floor(height / CELL_WIDTH);
}

//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

function resetGame() {
  if (!paused) toggleGamePause();
  initialize(true);
}

function clearGame() {
  if (!paused) toggleGamePause();
  initialize(false);
}

function toggleGamePause() {
  paused = !paused;
  pauseButton.html(paused ? "Play" : "Pause");
}

//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

function windowResized() {
  clearGame()
}

function toggleCell() {
  if (!paused) return;
  let cell_x = floor(mouseX / CELL_WIDTH)
  let cell_y = floor(mouseY / CELL_WIDTH)
  board[cell_x][cell_y] = 1 - board[cell_x][cell_y];
}

function createBoards() {
  board = new Array(columns);
  next = new Array(columns);
  for (let i = 0; i < columns; i++) {
    board[i] = new Array(rows);
    next[i] = new Array(rows);
  }
}

// Fill board randomly if desired
function initialize(shouldRandomize) {
  updateCanvasSize()
  updateGridSize()
  createBoards()

  for (let i = 0; i < columns; i++) {
    for (let j = 0; j < rows; j++) {
      board[i][j] = shouldRandomize ? floor(random(2)) : 0;
      next[i][j] = 0;
    }
  }
}

function draw() {
  background(255);
  for (let i = 0; i < columns; i++) {
    for (let j = 0; j < rows; j++) {
      if ((board[i][j] == 1)) fill(0);
      else fill(255);
      stroke(0);
      rect(i * CELL_WIDTH, j * CELL_WIDTH, CELL_WIDTH - 1, CELL_WIDTH - 1);
    }
  }
  if (paused) return;
  generate();
}

function generate() {

  // Loop through every spot in our 2D array and check spots neighbors
  for (let x = 0; x < columns; x++) {
    for (let y = 0; y < rows; y++) {
      // Add up all the states in a 3x3 surrounding grid
      let neighbors = 0;
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          var mod_x = x + i < 0 ? x + i + columns : (x + i) % columns;
          var mod_y = y + j < 0 ? y + j + rows : (y + j) % rows;
          neighbors += board[mod_x][mod_y];
        }
      }

      // A little trick to subtract the current cell's state since
      // we added it in the above loop
      neighbors -= board[x][y];
      // Rules of Life
      if ((board[x][y] == 1) && (neighbors < 2)) next[x][y] = 0;           // Loneliness
      else if ((board[x][y] == 1) && (neighbors > 3)) next[x][y] = 0;           // Overpopulation
      else if ((board[x][y] == 0) && (neighbors == 3)) next[x][y] = 1;           // Reproduction
      else next[x][y] = board[x][y]; // Stasis
    }
  }

  // Swap!
  let temp = board;
  board = next;
  next = temp;
}

