import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Agent from '@/lib/models/Agent';
import Game from '@/lib/models/Game';
import {
  successResponse,
  errorResponse,
  extractApiKey,
} from '@/lib/utils/api-helpers';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const apiKey = extractApiKey(req.headers.get('authorization'));
  if (!apiKey)
    return errorResponse('Missing API key', 'Include Authorization header', 401);
  await connectDB();
  const agent = await Agent.findOne({ apiKey });
  if (!agent)
    return errorResponse('Invalid API key', 'Agent not found', 401);
  const { id } = await params;
  const game = await Game.findById(id)
    .populate('agent1', 'name')
    .populate('agent2', 'name')
    .lean();
  if (!game)
    return errorResponse('Game not found', 'Check the game id', 404);
  const isParticipant =
    game.agent1._id.toString() === agent._id.toString() ||
    (game.agent2 && game.agent2._id.toString() === agent._id.toString());
  if (!isParticipant)
    return errorResponse('Forbidden', 'You are not in this game', 403);
  const agent1Name = (game.agent1 as { name: string }).name;
  const agent2Name = (game.agent2 as { name: string } | null)?.name ?? null;
  return successResponse({
    game_id: game._id.toString(),
    status: game.status,
    agent1: agent1Name,
    agent2: agent2Name,
    score1: game.score1,
    score2: game.score2,
    currentRound: game.currentRound,
    rounds: game.rounds,
    winner: game.winner,
  });
}
