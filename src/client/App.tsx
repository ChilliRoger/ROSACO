import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import './index.css';

type Color = 'red' | 'green' | 'blue' | 'yellow';

const COLORS: Color[] = ['red', 'green', 'blue', 'yellow'];

const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

const colorFrequencies: Record<Color, number> = {
  red: 261.6,
  green: 329.6,
  blue: 392.0,
  yellow: 523.3,
};

const playTone = (frequency: number, duration = 300) => {
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);

  gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
  oscillator.start();
  oscillator.stop(audioCtx.currentTime + duration / 1000);
};

const playErrorSound = () => {
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.type = 'sawtooth';
  oscillator.frequency.setValueAtTime(100, audioCtx.currentTime);
  gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.6);
};

// 🎯 Roast messages pool
const ROAST_MESSAGES: string[] = [
  "Wow… failed already? Even goldfish have better memory.🐟",
  "Round over? Your brain just rage-quit.🤯",
  "That was so short even TikTok wouldn’t accept it.📱",
  "Your memory buffer overflowed faster than my patience.⚡",
  "You play like your brain is running on Windows 95.💾",
  "Forgot that already? Alzheimer’s speedrun champion!🏆",
  "If memory was money, you’d be broke.💸",
  "Congratulations, you officially outsmarted a potato.🥔",
  "I’ve seen squirrels stash nuts better than you stash patterns.🐿️",
  "Bruh… Simon says ‘uninstall yourself.’💀",
  "Your brain’s RAM? More like ROM: Read-ONLY Mistakes.🖥️",
  "Was that a memory lapse or a full system crash?🔥",
  "Even copy-paste requires more effort.📋",
  "Your memory is so bad, I bet you forgot your own high score.🤡",
  "Next time try writing it on your hand.✍️",
  "Neural network? More like neural *notwork*.🤖",
  "Memory leak detected. Please restart player.🔁",
  "Don’t worry, failing early builds character… right?😬",
  "You couldn’t remember 3 colors? Oof.🌈",
  "That was so fast, I thought this was a demo version.🎮",
  "Your short-term memory is shorter than a Vine.📹",
  "Bruh, even my calculator has more memory.🧮",
  "Did your brain just rage quit?😤",
  "That was like a speedrun of disappointment.🏃‍♂️💨",
  "I’ve seen AI chatbots do better.🤖",
  "If forgetting was an Olympic sport, you’d take gold.🥇",
  "Your neurons called… they’re on strike.🚧",
  "Do you practice forgetting or does it just come naturally?🤔",
  "Legend says you’re still loading…⏳",
  "Bro, even ‘Baby Shark’ has more complexity.🦈",
  "That loss was sponsored by BrainLag™.🧠🐌",
  "Your memory is like a Snapchat… gone in 2 seconds.👻",
  "Did you seriously just choke on *round one*?😭",
  "Your recall ability just rage quit.🛑",
  "This wasn’t memory training, this was memory deleting.❌",
  "You lost so fast, I thought my code had a bug.🐞",
  "Don’t worry, we’ll send flowers to your memory’s funeral.⚰️",
  "That was tragic… but at least entertaining.🍿",
  "Somewhere out there, a goldfish is laughing at you.🐠",
  "Your brain is like Internet Explorer: always lagging.🌐",
];

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
  const [showGuide, setShowGuide] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [roastMsg, setRoastMsg] = useState<string>("");

  useEffect(() => {
    if (!gameStarted || playerTurn || gameOver) return;

    let newColor: Color;

    if (round <= 3) {
      do {
        newColor = COLORS[Math.floor(Math.random() * COLORS.length)];
      } while (sequence.length > 0 && newColor === sequence[sequence.length - 1]);
    } else if (round <= 6) {
      if (Math.random() < 0.3 && sequence.length > 0) {
        newColor = sequence[sequence.length - 1];
      } else {
        const filtered = COLORS.filter(c => c !== sequence[sequence.length - 1]);
        newColor = filtered[Math.floor(Math.random() * filtered.length)];
      }
    } else {
      newColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    }

    const newSequence = [...sequence, newColor];
    setSequence(newSequence);
    flashSequence(newSequence);
  }, [round, gameStarted]);

  const flashSequence = async (seq: Color[]) => {
    setMessage('Watch the sequence!');
    setPlayerTurn(false);

    // Progressive speed increase
    let flashDuration = Math.max(200, 600 - round * 30);
    let pauseDuration = Math.max(100, 200 - round * 10);

    for (let i = 0; i < seq.length; i++) {
      setFlashingIndex(i);
      playTone(colorFrequencies[seq[i]]);
      await new Promise((r) => setTimeout(r, flashDuration));
      setFlashingIndex(null);
      await new Promise((r) => setTimeout(r, pauseDuration));
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
      setMessage(`❌Game Over! Final Score: ${score}`);
      setPlayerTurn(false);
      setGameOver(true);
      playErrorSound();

      // Pick a random roast
      const roast = ROAST_MESSAGES[Math.floor(Math.random() * ROAST_MESSAGES.length)];
      setRoastMsg(roast);

      setHighScore(prev => {
        if (score > prev) {
          confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
          setIsNewHighScore(true);
          return score;
        }
        return prev;
      });

      return;
    }

    playTone(colorFrequencies[color]);
    setScore(prev => prev + 1);

    if (newPlayerSeq.length === sequence.length) {
      setMessage('✅Correct! Next round.');
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
    setScore(0);
    setIsNewHighScore(false);
    setRoastMsg("");
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
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-6 bg-white relative">
        <button
          onClick={() => setShowGuide(true)}
          className="absolute top-4 right-4 px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          How to Play
        </button>

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

        {showGuide && (
          <div className="guide-overlay">
            <div className="guide-box">
              <h2>How to Play</h2>
              <ul>
                <li>👀 Watch the flashing color sequence.</li>
                <li>🎯 Repeat the sequence by tapping the colors in order.</li>
                <li>✅ Each correct tap gives +1 point.</li>
                <li>⚡ Rounds get harder: Easy → Medium → Hard.</li>
                <li>❌ One mistake ends the game.</li>
              </ul>
              <button onClick={() => setShowGuide(false)}>Close</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-6 bg-white">
        <h1 className="text-3xl font-bold text-black">❌Game Over!</h1>
        <p className="text-xl text-black">Your Score: {score}</p>
        <p className="text-xl text-black">High Score: {highScore}</p>
        {isNewHighScore && (
          <p className="text-2xl font-bold text-green-600 animate-pulse">
            🎉 New High Score!
          </p>
        )}
        {roastMsg && (
          <p className="text-lg font-semibold text-red-600 italic max-w-lg text-center">
            🔥{roastMsg}
          </p>
        )}
        <button
          onClick={restartGame}
          className="mt-4 px-6 py-3 bg-red-600 text-white rounded-md text-lg"
        >
          Restart
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-6 bg-white relative">
      {/* Score & High Score Row */}
      <div className="absolute top-4 left-0 w-full flex justify-between px-6 text-lg font-bold text-black">
        <span>Score: {score}</span>
        <span>High Score: {highScore}</span>
      </div>

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
    </div>
  );
};
