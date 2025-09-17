import React, { useState, useEffect } from 'react';
import './index.css';

type Color = 'red' | 'green' | 'blue' | 'yellow';

const COLORS: Color[] = ['red', 'green', 'blue', 'yellow'];

export const App = () => {
  const [sequence, setSequence] = useState<Color[]>([]);
  const [playerSequence, setPlayerSequence] = useState<Color[]>([]);
  const [round, setRound] = useState(1);
  const [message, setMessage] = useState('');
  const [flashingIndex, setFlashingIndex] = useState<number | null>(null);
  const [playerTurn, setPlayerTurn] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Start new round
  useEffect(() => {
    if (!gameStarted || playerTurn || gameOver) return;

    let newColor: Color;

    if (round <= 3) {
      // Easy: don't allow repeating the same color twice
      do {
        newColor = COLORS[Math.floor(Math.random() * COLORS.length)];
      } while (sequence.length > 0 && newColor === sequence[sequence.length - 1]);
    } else if (round <= 6) {
      // Medium: small chance of repeating
      if (Math.random() < 0.3 && sequence.length > 0) {
        newColor = sequence[sequence.length - 1];
      } else {
        const filtered = COLORS.filter(c => c !== sequence[sequence.length - 1]);
        newColor = filtered[Math.floor(Math.random() * filtered.length)];
      }
    } else {
      // Hard: fully random (repeats allowed)
      newColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    }

    const newSequence = [...sequence, newColor];
    setSequence(newSequence);
    flashSequence(newSequence);
  }, [round, gameStarted]);

  const flashSequence = async (seq: Color[]) => {
    setMessage('Watch the sequence!');
    setPlayerTurn(false);
    for (let i = 0; i < seq.length; i++) {
      setFlashingIndex(i);
      await new Promise((r) => setTimeout(r, 600));
      setFlashingIndex(null);
      await new Promise((r) => setTimeout(r, 200));
    }
    setMessage('Your turn!');
    setPlayerSequence([]);
    setPlayerTurn(true);
  };

  const handleClick = (color: Color) => {
    if (!playerTurn) return;
    const newPlayerSeq = [...playerSequence, color];
    setPlayerSequence(newPlayerSeq);

    const currentIndex = newPlayerSeq.length - 1;
    if (newPlayerSeq[currentIndex] !== sequence[currentIndex]) {
      setMessage('❌ Wrong! Game Over.');
      setPlayerTurn(false);
      setGameOver(true);
      return;
    }

    if (newPlayerSeq.length === sequence.length) {
      setMessage('✅ Correct! Next round...');
      setPlayerTurn(false);
      setTimeout(() => setRound(round + 1), 1000);
    }
  };

  const restartGame = () => {
    setSequence([]);
    setPlayerSequence([]);
    setRound(1);
    setMessage('');
    setGameOver(false);
    setPlayerTurn(false);
    setGameStarted(false);
    setCountdown(null);
  };

  const startGame = () => {
    setCountdown(3);
    let timer = 3;

    const interval = setInterval(() => {
      timer -= 1;
      if (timer === 0) {
        clearInterval(interval);
        setCountdown(null);
        setGameStarted(true);
        setMessage('Watch the sequence!');
      } else {
        setCountdown(timer);
        setMessage(`Starting in ${timer}...`);
      }
    }, 1000);
  };

  if (!gameStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-6 bg-white">
        <h1 className="text-3xl font-bold text-black">🎨ROSACO</h1>

        {countdown !== null ? (
          <p className="text-2xl font-bold text-black">{countdown}</p>
        ) : (
          <button
            onClick={startGame}
            className="mt-4 px-6 py-3 bg-green-600 text-white rounded-md text-lg"
          >
            Start Game
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-6 bg-white">
      <h1 className="text-3xl font-bold text-black">🎨ROSACO</h1>
      <p className="text-black text-xl">{message}</p>

      <div className="grid grid-cols-2 gap-4 mt-4">
        {COLORS.map((color) => (
          <button
            key={color}
            onClick={() => handleClick(color)}
            style={{
              width: 100,
              height: 100,
              backgroundColor: color,
              boxShadow:
                flashingIndex !== null && sequence[flashingIndex] === color
                  ? '0 0 30px 15px white'
                  : 'none',
              border: '2px solid black',
              borderRadius: 12,
              transition: 'box-shadow 0.2s, transform 0.2s',
              transform:
                flashingIndex !== null && sequence[flashingIndex] === color
                  ? 'scale(1.2)'
                  : 'scale(1)',
              cursor: gameOver ? 'not-allowed' : 'pointer',
            }}
            disabled={gameOver}
          />
        ))}
      </div>

      <p className="text-black mt-4 text-lg">Round: {round}</p>

      {gameOver && (
        <button
          onClick={restartGame}
          className="mt-4 px-6 py-3 bg-red-600 text-white rounded-md text-lg"
        >
          Restart Game
        </button>
      )}
    </div>
  );
};