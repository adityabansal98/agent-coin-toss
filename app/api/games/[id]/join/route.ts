import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Agent from '@/lib/models/Agent';
import Game from '@/lib/models/Game';
import {
  successResponse,
  errorResponse,
  extractApiKey,
} from '@/lib/utils/api-helpers';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const apiKey = extractApiKey(_req.headers.get('authorization'));
  if (!apiKey)
    return errorResponse('Missing API key', 'Include Authorization header', 401);
  await connectDB();
  const agent = await Agent.findOne({ apiKey });
  if (!agent)
    return errorResponse('Invalid API key', 'Agent not found', 401);
  const { id } = await params;
  const game = await Game.findById(id);
  if (!game)
    return errorResponse('Game not found', 'Check the game id', 404);
  if (game.status !== 'waiting')
    return errorResponse('Game not joinable', 'Game already started or finished', 400);
  if (game.agent1.toString() === agent._id.toString())
    return errorResponse('Cannot join', 'You created this game', 400);
  game.agent2 = agent._id;
  game.status = 'playing';
  await game.save();
  return successResponse({
    message: 'Joined game. Submit your call for round 1 with POST /api/games/:id/call',
    game_id: game._id.toString(),
    status: 'playing',
    currentRound: 1,
  });
}
