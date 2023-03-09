const GAME_DIV_ID = "conways_game_of_life_wrapper";
const BUTTON_DIV_ID = "button_overflow";

const FRAME_RATE = 10;

const CELL_WIDTH = 10;

const BUTTON_WIDTH = 60;
const BUTTON_MIN_WIDTH = 40;
const BUTTON_HEIGHT = 30;
const BUTTON_PADDING = 5;
const STATE_FIELD_WIDTH = 250;
const STATE_FIELD_MIN_WIDTH = 150;

const MAX_CANVAS_HEIGHT = 600;
const MAX_CANVAS_WIDTH = 600;

let columns, rows;
let board, next;
let paused = false;
let wrapping_div;
let clearButton, pauseButton, resetButton, importButton, exportButton, stateField;

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
  setButtonStyle(clearButton);
  clearButton.mousePressed(clearGame);

  pauseButton = createButton('Pause');
  pauseButton.parent(BUTTON_DIV_ID);
  setButtonStyle(pauseButton);
  pauseButton.mousePressed(toggleGamePause);

  resetButton = createButton('Reset');
  resetButton.parent(BUTTON_DIV_ID);
  setButtonStyle(resetButton);
  resetButton.mousePressed(resetGame);

  exportButton = createButton('Export');
  exportButton.parent(BUTTON_DIV_ID);
  setButtonStyle(exportButton);
  exportButton.mousePressed(exportGameState);
  toggleButtonAvailability(exportButton);

  importButton = createButton('Import');
  importButton.parent(BUTTON_DIV_ID);
  setButtonStyle(importButton);
  importButton.mousePressed(importGameState);
  toggleButtonAvailability(importButton);

  stateField = createInput();
  stateField.parent(BUTTON_DIV_ID);
  setFieldStyle(stateField)

  initialize(true);
}

function updateCanvasSize() {
  let position_info = wrapping_div.getBoundingClientRect();
  width = Math.min(Math.floor(position_info.width / CELL_WIDTH) * CELL_WIDTH, MAX_CANVAS_WIDTH);
  height = MAX_CANVAS_HEIGHT;
  resizeCanvas(width, height);
}

function updateGridSize() {
  columns = floor(width / CELL_WIDTH);
  rows = floor(height / CELL_WIDTH);
}

//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

function setButtonStyle(button) {
  button.elt.style = `width: ${BUTTON_WIDTH}px; min-width: ${BUTTON_MIN_WIDTH}px; height: ${BUTTON_HEIGHT}px; margin: ${BUTTON_PADDING}px; display: block;`
}

function setFieldStyle(field) {
  field.elt.style = `width: ${STATE_FIELD_WIDTH}px; min-width: ${STATE_FIELD_MIN_WIDTH}px; height: ${BUTTON_HEIGHT}px; margin: ${BUTTON_PADDING}px; display: block;`
}

function toggleButtonAvailability(button) {
  button.elt.disabled = !button.elt.disabled;
}

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
  toggleButtonAvailability(exportButton);
  toggleButtonAvailability(importButton);
}

/*
 * Transform the current board state into a base32 string in the following format
 * width*height@base32 data
 */
function exportGameState() {
  if (!paused) toggleGamePause();
  let boardState = board.toString().replaceAll(',', '');
  let base32 = ''
  for (let index = 0; index < boardState.length; index += 5) {
    let substr = boardState.substring(index, index + 5);
    base32 += parseInt(substr, 2).toString(32);
  }
  stateField.value(`${columns}*${rows}@${base32}`);
}

/*
 * Parse the base32 data and update the board state to match
 */
function importGameState() {
  if (!paused) toggleGamePause();
  base32 = stateField.value();
  if (base32 === "") {
    alert("No import string provided.");
    return;
  }

  let asterisk_index = base32.indexOf("*")
  let at_index = base32.indexOf("@");
  if (asterisk_index <= 0 || at_index === -1 || at_index === asterisk_index + 1) {
    alert("The base32 encoded string you provided is missing at least one dimension.")
    return;
  }
  let state_columns = base32.substring(0, asterisk_index)
  let state_rows = base32.substring(asterisk_index + 1, at_index);

  if (columns < state_columns) {
    alert("The width of the current grid is not large enough to import this game state.");
    return;
  }
  if (rows < state_rows) {
    alert("The height of the current grid is not large enough to import this game state.");
    return;
  }

  let x = 0;
  let y = 0;

  for (let substr of base32.substring(at_index + 1)) {
    digit = parseInt(substr, 32);
    digit = digit.toString(2).padStart(5, '0');
    for (let bit of digit) {
      board[x][y] = parseInt(bit, 2)
      if (y === state_rows - 1) {
        y = 0
        x += 1;
      }
      else {
        y++;
      }
    }
  }
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
  for (let x = 0; x < columns; x++) {
    for (let y = 0; y < rows; y++) {
      if ((board[x][y] == 1)) fill(0);
      else fill(255);
      stroke(0);
      rect(x * CELL_WIDTH, y * CELL_WIDTH, CELL_WIDTH - 1, CELL_WIDTH - 1);
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

