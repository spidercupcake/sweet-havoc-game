import React, { useState, useEffect } from "react";

const sweetTypes = ["🍬", "🍭", "🍫", "🍪", "🍩"];

const width = 8;
const cellSize = 50;

export default function App() {
  const [board, setBoard] = useState([]);
  const [score, setScore] = useState(0);
  const [selectedSweet, setSelectedSweet] = useState(null);
  const [isSwapping, setIsSwapping] = useState(false);

  useEffect(() => {
    initializeBoard();
  }, []);

  const initializeBoard = () => {
    let newBoard = [];
    for (let i = 0; i < width * width; i++) {
      let sweet;
      do {
        sweet = sweetTypes[Math.floor(Math.random() * sweetTypes.length)];
      } while (
        (i % width >= 2 &&
          sweet === newBoard[i - 1] &&
          sweet === newBoard[i - 2]) ||
        (i >= width * 2 &&
          sweet === newBoard[i - width] &&
          sweet === newBoard[i - width * 2])
      );
      newBoard.push(sweet);
    }
    setBoard(newBoard);
    setScore(0);
    setSelectedSweet(null);
  };

  const handleSweetClick = (index) => {
    if (isSwapping) return;

    if (selectedSweet === null) {
      setSelectedSweet(index);
    } else {
      if (isAdjacent(selectedSweet, index)) {
        swapSweets(selectedSweet, index);
        setSelectedSweet(null);
      } else {
        setSelectedSweet(index);
      }
    }
  };

  const isAdjacent = (index1, index2) => {
    const row1 = Math.floor(index1 / width);
    const col1 = index1 % width;
    const row2 = Math.floor(index2 / width);
    const col2 = index2 % width;

    return (
      (Math.abs(row1 - row2) === 1 && col1 === col2) ||
      (Math.abs(col1 - col2) === 1 && row1 === row2)
    );
  };

  const swapSweets = (index1, index2) => {
    setIsSwapping(true);
    const newBoard = [...board];
    const temp = newBoard[index1];
    newBoard[index1] = newBoard[index2];
    newBoard[index2] = temp;
    setBoard(newBoard);

    setTimeout(() => {
      const matchResult = checkForMatches(newBoard);
      if (!matchResult.matchFound) {
        // If no match, swap back
        newBoard[index2] = newBoard[index1];
        newBoard[index1] = temp;
        setBoard(newBoard);
      } else {
        setScore((prevScore) => prevScore + matchResult.score);
        fillBoard(matchResult.newBoard);
      }
      setIsSwapping(false);
    }, 600);
  };

  const checkForMatches = (currentBoard) => {
    const newBoard = [...currentBoard];
    let matchFound = false;
    let score = 0;

    // Check horizontal matches
    for (let i = 0; i < width * width; i += width) {
      for (let j = 0; j < width - 2; j++) {
        const sweet = newBoard[i + j];
        let matchLength = 1;
        while (
          j + matchLength < width &&
          newBoard[i + j + matchLength] === sweet
        ) {
          matchLength++;
        }
        if (matchLength >= 3) {
          for (let k = 0; k < matchLength; k++) {
            newBoard[i + j + k] = "";
          }
          score += calculateScore(matchLength);
          matchFound = true;
          j += matchLength - 1;
        }
      }
    }

    // Check vertical matches
    for (let i = 0; i < width; i++) {
      for (let j = 0; j < width * (width - 2); j += width) {
        const sweet = newBoard[i + j];
        let matchLength = 1;
        while (
          j + matchLength * width < width * width &&
          newBoard[i + j + matchLength * width] === sweet
        ) {
          matchLength++;
        }
        if (matchLength >= 3) {
          for (let k = 0; k < matchLength; k++) {
            newBoard[i + j + k * width] = "";
          }
          score += calculateScore(matchLength);
          matchFound = true;
          j += (matchLength - 1) * width;
        }
      }
    }

    return { matchFound, newBoard, score };
  };

  const calculateScore = (matchLength) => {
    return matchLength * 10;
  };

  const fillBoard = (currentBoard) => {
    const newBoard = [...currentBoard];
    for (let col = 0; col < width; col++) {
      let emptySpaces = 0;
      for (let row = width - 1; row >= 0; row--) {
        const index = row * width + col;
        if (newBoard[index] === "") {
          emptySpaces++;
        } else if (emptySpaces > 0) {
          newBoard[index + emptySpaces * width] = newBoard[index];
          newBoard[index] = "";
        }
      }
      for (let row = 0; row < emptySpaces; row++) {
        newBoard[row * width + col] =
          sweetTypes[Math.floor(Math.random() * sweetTypes.length)];
      }
    }
    setBoard(newBoard);

    // Check for cascading matches
    setTimeout(() => {
      const matchResult = checkForMatches(newBoard);
      if (matchResult.matchFound) {
        setScore((prevScore) => prevScore + matchResult.score);
        fillBoard(matchResult.newBoard);
      }
    }, 300);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "linear-gradient(to right, #fbc2eb, #a6c1ee)",
      }}
    >
      <h1
        style={{
          fontSize: "2.5rem",
          fontWeight: "bold",
          marginBottom: "1rem",
          color: "white",
        }}
      >
        Sweet Havoc
      </h1>
      <div
        style={{
          marginBottom: "1rem",
          fontSize: "1.25rem",
          fontWeight: "semibold",
          color: "white",
        }}
      >
        Score: {score}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${width}, ${cellSize}px)`,
          gap: "4px",
          padding: "8px",
          background: "white",
          borderRadius: "8px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        {board.map((sweet, index) => (
          <button
            key={index}
            style={{
              width: "48px",
              height: "48px",
              fontSize: "1.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "4px",
              transition: "all 0.3s",
              border: selectedSweet === index ? "4px solid #3b82f6" : "none",
              cursor: isSwapping ? "not-allowed" : "pointer",
              background: "white",
            }}
            onClick={() => handleSweetClick(index)}
            disabled={isSwapping}
          >
            {sweet}
          </button>
        ))}
      </div>
      <button
        style={{
          marginTop: "1rem",
          background: "linear-gradient(to right, #ff758c, #ff7eb3)",
          color: "white",
          fontWeight: "bold",
          padding: "0.5rem 1rem",
          borderRadius: "0.25rem",
          border: "none",
          cursor: "pointer",
        }}
        onClick={initializeBoard}
      >
        New Game
      </button>
    </div>
  );
}
