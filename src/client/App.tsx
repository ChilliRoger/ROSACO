import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import meme1 from '../assets/meme1.png';
import meme2 from '../assets/meme2.png';
import { Round, Caption } from '../shared/types/api';

type Phase = 'submission' | 'voting' | 'results';

interface LeaderboardEntry {
  userId: string;
  wins: number;
}

// Sample meme rounds
const roundsData: Round[] = [
  { id: '1', memeUrl: meme1, captions: [], status: 'submission' },
  { id: '2', memeUrl: meme2, captions: [], status: 'submission' },
];

export const App = () => {
  const [roundIndex, setRoundIndex] = useState(0);
  const [round, setRound] = useState<Round>(roundsData[0]!);
  const [captionText, setCaptionText] = useState('');
  const [phase, setPhase] = useState<Phase>('submission');
  const [timeLeft, setTimeLeft] = useState(30); // seconds
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // Timer logic
  useEffect(() => {
    if (phase === 'results') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          nextPhase();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase]);

  // Add a caption
  const addCaption = () => {
    if (!captionText.trim() || phase !== 'submission') return;

    const newCaption: Caption = {
      id: Date.now().toString(),
      text: captionText,
      votes: 0,
      userId: 'guest',
    };

    setRound((prev) => ({ ...prev, captions: [...prev.captions, newCaption] }));
    setCaptionText('');
  };

  // Vote for a caption
  const voteCaption = (id: string) => {
    if (phase !== 'voting') return;
    setRound((prev) => ({
      ...prev,
      captions: prev.captions.map((c) =>
        c.id === id ? { ...c, votes: c.votes + 1 } : c
      ),
    }));
  };

  // Move to next phase
  const nextPhase = () => {
    if (phase === 'submission') {
      setPhase('voting');
      setTimeLeft(30);
    } else if (phase === 'voting') {
      setPhase('results');
      announceWinner();
    }
  };

  // Announce winner
  const announceWinner = () => {
    if (round.captions.length === 0) return;

    const winner = round.captions.reduce((max, c) =>
      c.votes > max.votes ? c : max
    );

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    // Update leaderboard
    setLeaderboard((prev) => {
      const existing = prev.find((l) => l.userId === winner.userId);
      if (existing) {
        return prev.map((l) =>
          l.userId === winner.userId ? { ...l, wins: l.wins + 1 } : l
        );
      } else {
        return [...prev, { userId: winner.userId, wins: 1 }];
      }
    });

    // Auto-move to next round after 5 sec
    setTimeout(() => {
      const nextIndex = roundIndex + 1;
      if (nextIndex < roundsData.length) {
        setRoundIndex(nextIndex);
        const nextRound = roundsData[nextIndex];
        if (nextRound) {
          setRound(nextRound);
        }
        setPhase('submission');
        setTimeLeft(30);
      } else {
        // End of rounds
        setPhase('submission');
      }
    }, 5000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-6">
      <h1 className="text-2xl font-bold text-gray-800">🔥 Chaos Caption Clash 🔥</h1>

      <img
        src={round.memeUrl}
        alt="Meme"
        className="max-w-sm rounded-xl shadow-md"
      />

      <p className="font-bold">
        {phase === 'submission' && `Submit your caption! ⏰ ${timeLeft}s`}
        {phase === 'voting' && `Voting phase! ⏰ ${timeLeft}s`}
        {phase === 'results' && '🏆 Results!'}
      </p>

      {phase === 'submission' && (
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Write your caption..."
            value={captionText}
            onChange={(e) => setCaptionText(e.target.value)}
            className="px-3 py-2 border rounded-md"
          />
          <button
            onClick={addCaption}
            className="bg-red-600 text-white px-4 py-2 rounded-md"
          >
            Submit
          </button>
        </div>
      )}

      <div className="w-full max-w-md">
        {round.captions.map((c) => (
          <div
            key={c.id}
            className="flex justify-between items-center p-2 border-b"
          >
            <span>{c.text}</span>
            {phase === 'voting' && (
              <button
                onClick={() => voteCaption(c.id)}
                className="bg-gray-200 px-2 py-1 rounded-md"
              >
                👍 {c.votes}
              </button>
            )}
            {phase === 'results' && <span>Votes: {c.votes}</span>}
          </div>
        ))}
      </div>

      {phase === 'results' && round.captions.length > 0 && (
        <h2 className="text-xl font-bold text-green-600 mt-4">
          🏆 WINNER:{" "}
          {round.captions.reduce((max, c) => (c.votes > max.votes ? c : max))
            .text}
        </h2>
      )}

      <div className="mt-6 w-full max-w-md">
        <h3 className="font-bold">Leaderboard</h3>
        {leaderboard.map((l) => (
          <div key={l.userId} className="flex justify-between border-b p-2">
            <span>{l.userId}</span>
            <span>Wins: {l.wins}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
