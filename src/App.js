import { useState } from "react";

function Square({ type, value, onSquareClick }) {
  return (
    <button className={type} onClick={onSquareClick}>
      {value}
    </button>
  );
}

// return indices of winning row or -1 if draw
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];

    // check for win
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return lines[i];
    }
  }

  return null;
}

function Board({ xIsNext, squares, onPlay }) {
  const xMove = "X";
  const oMove = "O";

  function handleClick(i) {
    // return early if square is marked or win
    if (squares[i] || calculateWinner(squares)) {
      return;
    }
    const nextSquares = squares.slice();

    if (xIsNext) {
      nextSquares[i] = xMove;
    } else {
      nextSquares[i] = oMove;
    }
    onPlay(nextSquares);
  }

  function isBoardFilled(squares) {
    for (const square of squares) {
      if (!square) {
        return false;
      }
    }
    return true;
  }

  // winner details
  const winRow = calculateWinner(squares);
  const boardFilled = isBoardFilled(squares);
  let status;

  if (winRow) {
    status = "Winner: " + squares[winRow[0]];
  }

  if (!winRow && boardFilled) {
    status = "Draw!";
  }

  if (!winRow && !boardFilled) {
    status = "Next player: " + (xIsNext ? "X" : "O");
  }

  let groupSize = 3; // 3x3 grid
  const boardRows = squares
    .map((square, index) => {
      let squareType = "square";

      if (winRow && winRow.includes(index)) {
        squareType = [squareType, "win"].join(" ");
      }

      return (
        <Square
          key={index}
          type={squareType}
          value={square}
          onSquareClick={() => handleClick(index)}
        />
      );
    })
    .reduce((board, square, index) => {
      // group squares in groups of <groupSize>
      index % groupSize === 0 && board.push([]);
      // push square on end of board
      board[board.length - 1].push(square);
      return board;
    }, [])
    .map((rowContent, index) => {
      // for every group of squares, add the board row
      return (
        <div key={index} className="board-row">
          {rowContent}
        </div>
      );
    });

  return (
    <>
      <div className="status">{status}</div>
      <div className="board">{boardRows}</div>
    </>
  );
}

function GameInfo({ history, jumpTo }) {
  const [ascendingOrder, setOrder] = useState(true);
  let currentMoveNum = history.length - 1;

  function getCurrentMoveIndex(previousBoard, currentBoard) {
    for (let i = 0; i < currentBoard.length; ++i) {
      if (currentBoard[i] !== previousBoard[i]) {
        return i;
      }
    }
  }

  function getMoveLocation(index) {
    // (col,row)
    return [index % 3 + 1, Math.floor(index / 3) + 1];
  }

  // handle time travel buttons/description
  function displayTimeTravelButtons(moveLocation, move) {
    let description;
    let moveDisplay;

    // past/future moves
    if (move !== currentMoveNum) {
      if (move > 0) {
        description = `Go to move #${move}: ${
          move % 2 === 0 ? "O" : "X"
        } at (${moveLocation})`;
      }

      if (move === 0) {
        description = "Go to game start";
      }
      moveDisplay = <button onClick={() => jumpTo(move)}>{description}</button>;
    }

    // for the current move only, show “You are at move #…” instead of a button
    if (move === currentMoveNum) {
      description = "You are at move #" + move;
      moveDisplay = <div className="status">{description}</div>;
    }

    return moveDisplay;
  }

  function displayGameInfo(history) {
    let gameInfo = [];
    let moveLocations = [];

    for (let i = 0; i < history.length; ++i) {
      // first move is null
      if (i === 0) {
        moveLocations.push(null);
      } else {
        moveLocations.push(getMoveLocation(getCurrentMoveIndex(history[i - 1], history[i])));
      }
    }

    // build time travel buttons/descriptions
    let moves = history.map((board, moveNum, history) => {
      return (
        <li key={moveNum}>
          {displayTimeTravelButtons(moveLocations[moveNum], moveNum)}
        </li>
      );
    });

    if (!ascendingOrder) {
      moves = moves.reverse();
    }
    moves = <ol>{moves}</ol>;

    // hook up/build sort button
    let order = ascendingOrder ? "Ascending" : "Descending";
    let orderButton = (
      <button onClick={() => setOrder(!ascendingOrder)}>{order}</button>
    );

    gameInfo.push(moves, orderButton);

    return gameInfo.map((info, index) => {
      return (
        <div key={index} className="game-info-col">
          {info}
        </div>
      );
    });
  }

  return <>{displayGameInfo(history)}</>;
}

// main
export default function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

  function getNextHistory(currentMove, currentHistory, nextMoveSquares) {
    return [...currentHistory.slice(0, currentMove + 1), nextMoveSquares];
  }

  function handlePlay(nextSquares) {
    // save history up to this point
    const nextHistory = getNextHistory(currentMove, history, nextSquares);
    // const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    // append nextSquares array to history array
    setHistory(nextHistory);
    // current move = present move
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  return (
    <div className="game">
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      <div className="game-info">
        <GameInfo history={history} jumpTo={jumpTo} />
      </div>
    </div>
  );
}
