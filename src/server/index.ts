import express from 'express';
import fetch from 'node-fetch'; // npm install node-fetch
import { redis, createServer, getServerPort } from '@devvit/web/server';
import { Round, Caption } from '../shared/types/api';

const app = express();
app.use(express.json());

// Local memes fallback
const LOCAL_MEMES = [
  '/memes/meme1.png',
  '/memes/meme2.png',
  '/memes/meme3.png',
];

// Utility to get current round
async function getRound(): Promise<Round> {
  const roundData = await redis.get('currentRound');
  if (roundData) {
    const round = JSON.parse(roundData) as Round;
    // Reset if last round was results
    if (round.status === 'results') {
      const newRound: Round = {
        id: '1',
        memeUrl: LOCAL_MEMES[0],
        captions: [],
        status: 'submission',
      };
      await redis.set('currentRound', JSON.stringify(newRound));
      return newRound;
    }
    return round;
  }

  // No round exists, create new
  const round: Round = { id: '1', memeUrl: LOCAL_MEMES[0], captions: [], status: 'submission' };
  await redis.set('currentRound', JSON.stringify(round));
  return round;
}

// Get current round
app.get('/api/round', async (_req, res) => {
  const round = await getRound();
  res.json({ round });
});

// Submit caption
app.post('/api/caption', async (req, res) => {
  const round = await getRound();
  if (round.status !== 'submission') return res.status(400).json({ error: 'Not in submission phase' });

  const newCaption: Caption = {
    id: Date.now().toString(),
    text: req.body.text,
    votes: 0,
    userId: 'guest', // Devvit context not used here
  };

  round.captions.push(newCaption);
  await redis.set('currentRound', JSON.stringify(round));
  res.json({ type: 'caption', round });
});

// Vote caption
app.post('/api/vote', async (req, res) => {
  const round = await getRound();
  if (round.status !== 'voting') return res.status(400).json({ error: 'Not in voting phase' });

  round.captions = round.captions.map((c) =>
    c.id === req.body.id ? { ...c, votes: c.votes + 1 } : c
  );

  await redis.set('currentRound', JSON.stringify(round));
  res.json({ type: 'vote', round });
});

// Move to next phase / round
app.post('/api/next-round', async (_req, res) => {
  let round = await getRound();

  if (round.status === 'submission') {
    round.status = 'voting';
  } else if (round.status === 'voting') {
    round.status = 'results';
  } else if (round.status === 'results') {
    // Try fetching meme from Meme API
    let memeUrl = '';
    try {
      const response = await fetch('https://meme-api.com/gimme');
      const data = await response.json() as any;
      const memeUrl = data.url || LOCAL_MEMES[Math.floor(Math.random() * LOCAL_MEMES.length)];

    } catch (err) {
      console.log('Meme API failed, using local meme.');
    }

    if (!memeUrl) {
      const idx = Math.floor(Math.random() * LOCAL_MEMES.length);
      memeUrl = LOCAL_MEMES[idx];
    }

    // Next round
    const nextIndex = parseInt(round.id) + 1;
    round = {
      id: nextIndex.toString(),
      memeUrl,
      captions: [],
      status: 'submission',
    };
  }

  await redis.set('currentRound', JSON.stringify(round));
  res.json({ type: 'next-round', round });
});

// Start server
const port = getServerPort();
const server = createServer(app);
server.listen(port, () => console.log(`[DEVVIT] Server running on ${port}`));
