import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Game from '@/lib/models/Game';
import { successResponse, errorResponse } from '@/lib/utils/api-helpers';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const { id } = await params;
  const game = await Game.findById(id)
    .populate('agent1', 'name')
    .populate('agent2', 'name')
    .lean();
  if (!game)
    return errorResponse('Game not found', 'Check the game id', 404);
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
