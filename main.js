// game object

// gameboard object - IIFE - only need a single instance

// Gameboard represents the state of the grid
// Each square holds a cell (0 = )
// mark method allows cells to be added to a square

const Gameboard = (() => {


    const rows = 3;
    const columns = 3;
    const grid = [];

    //2d array represents the state of the grid
    //row 0 represents the top, column 0 the left-most
    for (let i = 0; i < rows; i++) {
        grid[i] = [];
        for (let j = 0; j < columns; j++) {
            grid[i].push(Cell());
        }
    }


    //method: getting the entire grid for the ui to render
    const getGrid = () => grid;

    const addMark = (row, column, player) => {
        if (grid[row][column].getValue() === 0) {
            grid[row][column].addMark(player);
        }
    }
    //temporary method: console tool to visualize board before UI is built
    const printGrid = () => {
        const gridWithCellValue = grid.map((row) => row.map((cell) => cell.getValue()))

        console.log(gridWithCellValue);
    };

    return{ getGrid, printGrid, addMark };
})();


//cell represents one square, can have values 0 (no mark), 1 (player 1s mark), 2 (player twos mark)
function Cell() {
    let value = 0;

    const addMark = (player) => {
        value = player;
    };

    const getValue = () => value;

    return {
        addMark, 
        getValue
    };
}
// player object

function GameController(
    playerOneName = "Player X",
    playerTwoName = "Player O"
) {
    const grid = Gameboard;

    const players = [
        {
            name: playerOneName,
            token: 1
        },
        {
            name: playerTwoName, 
            token: 2
        }
    ];

    let activePlayer = players[0];

    const switchPlayerTurn = () => {
        activePlayer = activePlayer === players[0] ? players[1] : players[0];
    };
    const getActivePlayer = () => activePlayer;

    const printNewRound = () => {
        grid.printGrid();
        console.log(`${getActivePlayer().name}'s turn.`);
    };





    const playRound = (row, column) => {
        console.log(`Marked cell Row: ${row}, Column: ${column} for ${getActivePlayer().name}`);
        grid.addMark(row, column, getActivePlayer().token);

        if (!checkWin(row, column) && !checkTie(row, column)) {
            switchPlayerTurn();
            printNewRound();
        }
    };

    //win conditions
    const checkWin = (row, column) => {
        const gridValues = ((row, column) => {return grid.getGrid()[row][column].getValue()});
        if (
            (gridValues(row, 0) == gridValues(row, 1) && gridValues(row, 1) == gridValues(row, 2)) ||
            ((gridValues(0, column) == gridValues(1, column)) && (gridValues(1, column) == gridValues(2, column))) ||
            ((gridValues(0, 0) == gridValues(1, 1) && gridValues(1, 1) == gridValues(2, 2)) && (gridValues(0, 0) == getActivePlayer().token)) ||
            (((gridValues(0, 2) == gridValues(1, 1)) && (gridValues(1, 1) == gridValues(2, 0))) && (gridValues(0, 2) == getActivePlayer().token))) 
            {
                return true;
            }
        else {
            return false;
        }
    }

    const checkTie = (row, column) => {
        const gridValues = ((row, column) => {return grid.getGrid()[row][column].getValue()});
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (gridValues(i, j) === 0) {
                    return false;
                }
            }
        }
        return true;
    }

    const resetBoard = () => {
        grid.getGrid().forEach(row => {
            row.forEach(cell =>
                cell.addMark(0)
            )
        }) 
    }

    //initial play game message
    printNewRound();

    return {
        playRound,
        getActivePlayer,
        getGrid: grid.getGrid,
        checkWin,
        checkTie,
        resetBoard
    };
}

function displayController() {
    const playerTurnDiv = document.querySelector(".turn");
    const boardDiv = document.querySelector(".board");
    const newGameButton = document.querySelector("#newGame");
    const playerOneNameInput = document.querySelector("#p1");
    const playerTwoNameInput = document.querySelector("#p2");
    let game = GameController();

    const updateScreen = () => {
        //clear the board
        boardDiv.textContent = "";

        //get newest board and player turn
        const grid = game.getGrid();
        const activePlayer = game.getActivePlayer();

        //display the player's turn
        playerTurnDiv.textContent = `${activePlayer.name}'s turn`

        //render board squares
        grid.forEach((row, rowIndex) => {
            row.forEach((cell, index) => {
                const cellButton = document.createElement("button");
                cellButton.classList.add("cell");
                cellButton.dataset.row = rowIndex;
                cellButton.dataset.column = index;

                if (rowIndex == 0) {
                    cellButton.classList.add("gridTopRow");
                }
                if (rowIndex == 2) {
                    cellButton.classList.add("gridBottomRow");
                }
                if (index == 0) {
                    cellButton.classList.add("gridLeftCol");
                }
                if (index == 2) {
                    cellButton.classList.add("gridRightCol");
                }
                if (cell.getValue() === 1) {
                    cellButton.textContent = "X";
                }
                else if (cell.getValue() === 2) {
                    cellButton.textContent = "O";
                }
                else {
                    cellButton.textContent = ""
                }
                boardDiv.appendChild(cellButton);
            })
        })
    }

    function clearScreen() {
        const cellButtons = document.querySelectorAll(".cell");
        cellButtons.forEach(cellButton => {
            cellButton.textContent = "";
        })
    }
    //add event listener for board
    function clickHandlerGrid(e) {
        const selectedRow = e.target.dataset.row;
        const selectedColumn = e.target.dataset.column;

        if ([1, 2].includes(game.getGrid()[selectedRow][selectedColumn].getValue())) {
            console.log("invalid selection");
            e.target.classList.add("bad");
        }

        else {
            game.playRound(selectedRow, selectedColumn);
            updateScreen();
            if(game.checkWin(selectedRow, selectedColumn)) {
                playerTurnDiv.textContent = `${game.getActivePlayer().name} Wins!`
                newGameButton.classList.remove("hidden")
                playerOneNameInput.classList.remove("hidden")
                playerTwoNameInput.classList.remove("hidden")
                boardDiv.removeEventListener("click", clickHandlerGrid);

            }
            else if(game.checkTie(selectedRow, selectedColumn)) {
                playerTurnDiv.textContent = `Tie!`
                newGameButton.classList.remove("hidden")
            }
        };
    }


    function clickHandlerNewGame(e) {
        newGameButton.classList.add("hidden");
        game.resetBoard();
        clearScreen();
        game = GameController(playerOneNameInput.value, playerTwoNameInput.value);
        updateScreen();
        boardDiv.addEventListener("click", clickHandlerGrid);
        playerOneNameInput.classList.add("hidden");
        playerTwoNameInput.classList.add("hidden");
    }
    newGameButton.addEventListener("click", clickHandlerNewGame);

}

displayController();