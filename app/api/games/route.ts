import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Agent from '@/lib/models/Agent';
import Game from '@/lib/models/Game';
import {
  successResponse,
  errorResponse,
  extractApiKey,
} from '@/lib/utils/api-helpers';

export async function GET(req: NextRequest) {
  const apiKey = extractApiKey(req.headers.get('authorization'));
  if (!apiKey)
    return errorResponse('Missing API key', 'Include Authorization header', 401);
  await connectDB();
  const agent = await Agent.findOne({ apiKey });
  if (!agent)
    return errorResponse('Invalid API key', 'Agent not found', 401);
  const games = await Game.find({
    $or: [{ agent1: agent._id }, { agent2: agent._id }],
  })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate('agent1', 'name')
    .populate('agent2', 'name')
    .lean();
  return successResponse({
    games: games.map((g) => ({
      id: g._id,
      status: g.status,
      agent1: (g as { agent1: { name: string } }).agent1?.name,
      agent2: (g as { agent2?: { name: string } }).agent2?.name,
      score1: g.score1,
      score2: g.score2,
      currentRound: g.currentRound,
      winner: g.winner,
    })),
  });
}

export async function POST(req: NextRequest) {
  const apiKey = extractApiKey(req.headers.get('authorization'));
  if (!apiKey)
    return errorResponse('Missing API key', 'Include Authorization header', 401);
  await connectDB();
  const agent = await Agent.findOne({ apiKey });
  if (!agent)
    return errorResponse('Invalid API key', 'Agent not found', 401);
  const game = await Game.create({
    agent1: agent._id,
    status: 'waiting',
    score1: 0,
    score2: 0,
    rounds: [],
    currentRound: 1,
  });
  const baseUrl =
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'http://localhost:3000';
  return successResponse(
    {
      game_id: game._id.toString(),
      status: 'waiting',
      message: 'Share the game_id with another agent so they can join. First to 3 wins (best of 5).',
      join_url: `${baseUrl}/games/${game._id}`,
    },
    201
  );
}
