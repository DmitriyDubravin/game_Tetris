(function () {'use strict';}());
// 'use strict';



// SETTINGS

let figure;
let falling;
let app = document.querySelector('#board');
let nextBox = document.querySelector('.next-box');
let board = [];
let game = false;
let level = 1;
let score = 0;
let speed = 250;
let nextFigureName = randomFigureName();
let boardWidth = 20;
let boardHeight = 34;
let cellSize = 20;
let boardSize = boardWidth * boardHeight;

createBoard();



// keys handler
document.onkeydown = event => keyHandler(event);

function keyHandler(event) {
	var x = event.keyCode;
	if(x === 13) start(); // enter
	if(x === 32) pause(); // space bar
	if(x === 17) stop(); // ctrl
	if(game === true) {
		switch(x) {
			case 38: turn(); break; // arrow top
			case 39: shiftRight(); break; // arrow right
			case 40: shiftDown(); break; // arrow bottom
			case 37: shiftLeft(); break; // arrow left
		}
	}
}

// buttons handler
document.querySelector('.button.start').onclick = () => {start(); return false;};
document.querySelector('.button.pause').onclick = () => {pause(); return false;};
document.querySelector('.button.stop').onclick = () => {stop(); return false;};

document.querySelector('.button.cell-increase').onclick = () => {resize('cell-increase'); return false;};
document.querySelector('.button.cell-reduce').onclick = () => {resize('cell-reduce'); return false;};
document.querySelector('.button.width-increase').onclick = () => {resize('width-increase'); return false;};
document.querySelector('.button.width-reduce').onclick = () => {resize('width-reduce'); return false;};
document.querySelector('.button.height-increase').onclick = () => {resize('height-increase'); return false;};
document.querySelector('.button.height-reduce').onclick = () => {resize('height-reduce'); return false;};



// start game
function start() {
	resetGame();
	drawFigures();
	fallDown();
	game = true;
}

// stop game
function stop() {
	resetGame();
}

// pause game
function pause() {
	let buttonPause = document.querySelector('.button.pause');
	if(game === true) {
		clearInterval(falling);
		buttonPause.className = 'button pause active';
		buttonPause.innerHTML = 'Paused';
		game = false;
	} else {
		if(figure) {
			fallDown();
			buttonPause.className = 'button pause';
			buttonPause.innerHTML = 'Pause';
			game = true;
		}
	}
}

// game over
function gameOver() {
	// stop();
	figure = null;
	clearInterval(falling);
	game = false;
	document.querySelector('.msg').innerHTML = "Game over! :(";
}

// reset game
function resetGame() {
	game = false;
	figure = null;
	// stop falling
	clearInterval(falling);
	// clear score
	score = 0;
	document.querySelector('.score strong').innerHTML = 0;
	// clear level
	level = 1;
	document.querySelector('.level strong').innerHTML = 1;
	// reset pause button
	let buttonPause = document.querySelector('.button.pause');
	buttonPause.className = 'button pause';
	buttonPause.innerHTML = 'Pause';
	// clean 'next figure' box
	nextBox.innerHTML = '';
	document.querySelector('.msg').innerHTML = '';
	createBoard();
}



//// MOVES

// auto shift down
function fallDown() {
	falling = setInterval(() => {
		shiftDown();
	}, speed);
}

// shift down
function shiftDown() {
	// if there a place from bottom
	if(checkDown() === true) {
		// take current figure
		let figureCells = selectFigure();
		// for each cell of the figure
		figure.nums.forEach((num,i,arr) => {
			// increse index by row width
			arr[i] = num + boardWidth;
			// move to the bottom
			figureCells[i].style.top = board[num].y + cellSize + 'px';
		});
	} else {
		fixFigure();
	}
}

// shift to the left
function shiftLeft() {
	// if there a place from left
	if(checkLeft() === true) {
		// take current figure
		let figureCells = selectFigure();
		// for each cell of the figure
		figure.nums.forEach((num,i,arr) => {
			// reduce index
			arr[i] = num - 1;
			// move to the left
			figureCells[i].style.left = board[num].x - cellSize + 'px';
		});
	}
}

// shift to the right
function shiftRight() {
	// if there a place from right
	if(checkRight() === true) {
		// take current figure
		let figureCells = selectFigure();
		// for each cell of the figure
		figure.nums.forEach((num,i,arr) => {
			// increse index
			arr[i] = num + 1;
			// move to the right
			figureCells[i].style.left = board[num].x + cellSize + 'px';
		});
	}
}

// make turn
function turn() {
	// if there a place to turn
	if(checkTurn() === true) {
		// take current figure
		let figureNums = selectFigure();
		// for each cell of the figure
		figure.nums.forEach((num,i,arr) => {
			// calculate index after turn
			let newIndex = num + figure.turns[figure.turnPosition][i];
			// set new index
			arr[i] = newIndex;
			// set new coordinates
			figureNums[i].style.left = board[newIndex].x + 'px';
			figureNums[i].style.top = board[newIndex].y + 'px';
		});
		// set new figure turn position
		figure.turnPosition = figure.turnPosition === 3 ? 0 : figure.turnPosition + 1;
	}
}



//// CHECKS

// check if there a place for new figure
function checkEmpty() {
	return figure.nums.every(num => board[num].empty);
}

// check if there a place from bottom
function checkDown() {
	return figure.nums.every(num => {
		// calculate cell index after shift down
		let newIndex = num + boardWidth;
		// cell to the bottom is exists AND still empty
		return board[newIndex] && board[newIndex].empty !== false;
	});
}

// check if there a place from left
function checkLeft() {
	return figure.nums.every(num => {
		// calculate cell index after shift left
		let newIndex = num - 1;
		// cell to the left is... on the same row AND still empty
		return (newIndex + 1) % boardWidth !== 0 && board[newIndex].empty !== false;
	});
}

// check if there a place from right
function checkRight() {
	return figure.nums.every(num => {
		// calculate cell index after shift right
		let newIndex = num + 1;
		// cell to the right is... on the same row AND still empty
		return (newIndex % boardWidth !== 0) && board[newIndex].empty !== false;
	});
}

// check if there a place for turn
function checkTurn() {
	return figure.nums.every((num,i) => {
		// calculate cell index after turn
		let newIndex = num + figure.turns[figure.turnPosition][i];
		// if current cell is close to the left edge of the board
		if(num % boardWidth < boardWidth / 2) {
			// the cell after turn is exists and still empty AND it's not beyond the left edge
			return (board[newIndex] && board[newIndex].empty === true) && ((newIndex + 1) % boardWidth !== 0);
		// current cell is close to the right edge of the board
		} else {
			// the cell after turn is exists and still empty AND it's not beyond the right edge
			return (board[newIndex] && board[newIndex].empty === true) && (newIndex % boardWidth !== 0);
		}
	});
}



// ROBOTS

// board creator
function createBoard() {
	board = [];
	// create board
	for(let i = 0; i < boardSize; i++) {
		// calculate coordinates for every cell of the board
		let x = (i > boardWidth - 1 ? i - (Math.floor(i / boardWidth) * boardWidth) : i) * cellSize;
		let y = (i > boardWidth - 1 ? Math.floor(i / boardWidth) : 0) * cellSize;
		// fill the board with сoordinates and empty states
		board[i] = {x: x, y: y, empty: true};
	}

	// clear board
	app.innerHTML = '';
	// set board dimensions
	app.style.width = boardWidth * cellSize + 'px';
	app.style.height = boardHeight * cellSize + 'px';
	app.style.marginTop = -cellSize * 4 + 'px';
	// set guidelines
	for(let i = 0; i < boardWidth; i++) {
		let line = document.createElement('div');
		line.className = 'line';
		line.style.left = i * cellSize + 'px';
		line.style.width = cellSize + 'px';
		app.appendChild(line);
	}
}

// resizer
function resize(val) {
	switch(val) {
		case 'cell-increase':
			cellSize += 1;
			break;
		case 'cell-reduce':
			if(cellSize > 5) cellSize -= 1;
			break;
		case 'width-increase':
			boardWidth += 1;
			break;
		case 'width-reduce':
			if(boardWidth > 5) boardWidth -= 1;
			break;
		case 'height-increase':
			boardHeight += 1;
			break;
		case 'height-reduce':
			if(boardHeight > 19) boardHeight -= 1;
			break;
	}
	boardSize = boardWidth * boardHeight;
	resetGame();
}

// figure fixer
function fixFigure() {
	// stop falling
	clearInterval(falling);
	// if there a place for new figure
	if(checkEmpty() === true) {
		// select stopped figure
		let figureCells = selectFigure();
		// each cell of stopped figure
		figure.nums.forEach((num,i,arr) => {
			// fill 'empty' state of the board for current cell
			board[num].empty = false;
			// changes class of current cell
			figureCells[i].className = 'cell';
			// set board index to the cell
			figureCells[i].setAttribute('data-index', num);
			// after figure was totally stoped
			if(i === arr.length - 1) {
				// check and remove filled rows
				removeFilledRows();
				// draw new figures
				drawFigures();
				// start falling of new figure
				fallDown();
			}
		});
	} else {
		// if there is no place for new figure
		gameOver();
	}
}

// figures drawer
function drawFigures() {
	// get figure from figures set
	figure = chooseFigure(nextFigureName);
	// draw each cell of figure on board
	figure.nums.forEach(num => {
		drawFigure(app,num,figure.color);
	});
	// turn figure on start random times
	for(let i = 0; i <= randomFigureTurn(); i++) {
		turn();
	}

	// chose random name for the next figure
	nextFigureName = randomFigureName();
	// clean 'next figure' box
	nextBox.innerHTML = '';
	// get figure from figures set with no offsets
	let nextFigure = chooseFigure(nextFigureName,0,0);
	// draw each cell of next figure inside 'next figure' box
	nextFigure.nums.forEach(num => {
		drawFigure(nextBox,num,nextFigure.color);
	});
}

// filled rows remover
function removeFilledRows() {
	// search for filled rows
	let filledRows = findFilledRows();

	// if filled rows was found
	if(filledRows.length !== 0) {
		filledRows.forEach((filledRowfirstCellIndex,filledRowIndex) => {
			// index of the first cell of filled row
			// should be increased depending of the number of already deleted rows
			// because all rows above were pushed down
			let firstCellIndex = filledRowfirstCellIndex + boardWidth * filledRowIndex;

			// moving 'empty' states down
			// check all board
			for(let i = boardSize - 1; i >= 0; i--) {
				// if cell is above the filled row and under the first row
				if(i < firstCellIndex && i >= boardWidth) {
					// move 'empty' state of this cell to 1 row down
					board[i + boardWidth].empty = board[i].empty;
				}
			}

			// find all filled cells
			let filledCells = document.querySelectorAll('#board .cell');
			// for every filled cell
			for(let i = 0; i < filledCells.length; i++) {
				// find out data-index number of current cell
				let currentIndex = +(filledCells[i].dataset.index);
				// if current cell is above the filled row
				if(currentIndex < firstCellIndex) {
					// increase data-index of current cell by the width of row
					filledCells[i].setAttribute('data-index', currentIndex + boardWidth);
					// push down current cell by the cell size
					let newTop = board[currentIndex].y + cellSize + 'px';
					filledCells[i].style.top = newTop;
				} else {
					// if current cell is on the filled row
					if(currentIndex >= firstCellIndex && currentIndex < firstCellIndex + boardWidth) {
						// remove current cell
						app.removeChild(filledCells[i]);
					}
				}
			}
		});

		// count the score
		countScore(filledRows.length);

		// find out level
		clarifyLevel(score);
	}
}

// filled rows searcher
function findFilledRows() {
	let filledRows = [];
	// search through the first cells of each row
	for(let x = boardSize - boardWidth; x >= 0; x -= boardWidth) {
		// if the first cell is filled
		if(board[x].empty === false) {
			// check the rest cells of the current row
			for(let y = 0; y < boardWidth; y++) {
				if(board[x + y].empty === true) {
					// if empty cell was found, stop row checking
					break;
				} else {
					// if reached the last cell of the row, and no empty cells was found
					if(y === boardWidth - 1) {
						// remember index of the first cell of filled row
						filledRows.push(x);
					}
				}
			}
		}
	}
	// return array of indexes of the first cells of filled rows
	return filledRows;
}

// score counter
function countScore(filledRowsNum) {
	// add score depending of number of removed rows
	switch(filledRowsNum) {
		case 1: score += 100; break;
		case 2: score += 400; break;
		case 3: score += 900; break;
		case 4: score += 1200; break;
	}
	// show new score on board
	document.querySelector('.score strong').innerHTML = score;
}

// level recognizer
function clarifyLevel(score) {
	// set level and speed depending of the score
	if(score >= 4000 && level !== 5) {
		level = 5;
		speed = 50;
	} else if(score >= 3000 && level !== 4) {
		level = 4;
		speed = 100;
	} else if(score >= 2000 && level !== 3) {
		level = 3;
		speed = 150;
	} else if(score >= 1000 && level !== 2) {
		level = 2;
		speed = 200;
	}
	// show new level on board
	document.querySelector('.level strong').innerHTML = level;
}



// SECONDARY FUNCTIONS

// select figure
function selectFigure() {
	return document.querySelectorAll('#board .figure');
}

// draw figure
function drawFigure(place,num,color) {
	let cell = document.createElement('div');
	cell.className = 'figure';
	cell.style.left = board[num].x + 'px';
	cell.style.top = board[num].y + 'px';
	cell.style.width = cellSize + 'px';
	cell.style.height = cellSize + 'px';
	cell.style.backgroundColor = color;
	place.appendChild(cell);
}

// shuffle array
function shuffle(arr) {
	for (let i = arr.length; i; i--) {
		let j = Math.floor(Math.random() * i);
		[arr[i - 1], arr[j]] = [arr[j], arr[i - 1]];
	}
	return arr;
}

// get random figure name
function randomFigureName() {
	return shuffle(['i','j','l','o','s','t','z'])[0];
}

// get random figure turn
function randomFigureTurn() {
	return shuffle(['0','1','2','3'])[0];
}



// FIGURES SET

function chooseFigure(name,x,y) {
	let sx = x !== undefined ? x : Math.floor(boardWidth / 2) - 1;
	let sy = y !== undefined && y >= boardWidth ? y : boardWidth;
	let figureTemplate;

	switch(name) {
		case 'i':
			figureTemplate = {
				color: '#b4a42b',
				nums: [sx + sy, sx + sy + 1, sx + sy + 2, sx + sy + 3],
				turnPosition: 0,
				turns: [
					[-sy + 2, 1, sy, sy * 2 - 1],
					[sy + 1, 0, -sy - 1, -sy * 2 - 2],
					[sy * 2 - 1, sy, 1, -sy + 2],
					[-sy * 2 - 2, -sy - 1, 0, sy + 1]
				]
			};
			break;
		case 'j':
			figureTemplate = {
				color: '#858d66',
				nums: [sx + sy * 2, sx + 1 + sy * 2, sx + 2 + sy * 2, sx + 2 + sy * 3],
				turnPosition: 0,
				turns: [
					[-sy + 1, 0, sy - 1, -2],
					[sy + 1, 0, -sy - 1, -sy * 2],
					[sy - 1, 0, -sy + 1, 2],
					[-sy - 1, 0, sy + 1, sy * 2]
				]
			};
			break;
		case 'l':
			figureTemplate = {
				color: '#717845',
				nums: [sx + sy * 2, sx + sy * 3, sx + 1 + sy * 2, sx + 2 + sy * 2],
				turnPosition: 0,
				turns: [
					[-sy + 1, -sy * 2, 0, sy - 1],
					[sy + 1, 2, 0, -sy - 1],
					[sy - 1, sy * 2, 0, -sy + 1],
					[-sy - 1, -2, 0, sy + 1]
				]
			};
			break;
		case 'o':
			figureTemplate = {
				color: '#7b6c05',
				nums: [sx + sy * 2, sx + sy * 3, sx + 1 + sy * 2, sx + 1 + sy * 3],
				turnPosition: 0,
				turns: [
					[0, 0, 0, 0],
					[0, 0, 0, 0],
					[0, 0, 0, 0],
					[0, 0, 0, 0]
				]
			};
			break;
		case 's':
			figureTemplate = {
				color: '#5a6636',
				nums: [sx + sy * 2, sx + 1 + sy, sx + 1 + sy * 2, sx + 2 + sy],
				turnPosition: 0,
				turns: [
					[-sy + 1, sy + 1, 0 , sy * 2],
					[1, -1, -sy, -sy - 2],
					[sy * 2, 0, sy + 1, -sy + 1],
					[-sy - 2, -sy, -1, 1]
				]
			};
			break;
		case 't':
			figureTemplate = {
				color: '#404d1f',
				nums: [sx + sy * 2, sx + 1 + sy * 2, sx + 1 + sy * 3, sx + 2 + sy * 2],
				turnPosition: 0,
				turns: [
					[-sy + 1, 0, -sy - 1, sy - 1],
					[sy + 1, 0, -sy + 1, -sy - 1],
					[sy - 1, 0, sy + 1, -sy + 1],
					[-sy - 1, 0, sy - 1, sy + 1]
				]
			};
			break;
		case 'z':
			figureTemplate = {
				color: '#21360d',
				nums: [sx + sy, sx + 1 + sy, sx + 1 + sy * 2, sx + 2 + sy * 2],
				turnPosition: 0,
				turns: [
					[1, sy, -1, sy - 2],
					[sy + 1, 0, -sy + 1, -sy * 2],
					[sy - 2, -1, sy, 1],
					[-sy * 2, -sy + 1, 0, sy + 1]
				]
			};
			break;
	}
	return figureTemplate;
}


