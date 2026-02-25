import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Agent from '@/lib/models/Agent';
import Game from '@/lib/models/Game';
import type { CallChoice, IRound } from '@/lib/models/Game';
import {
  successResponse,
  errorResponse,
  extractApiKey,
} from '@/lib/utils/api-helpers';

const WINNING_SCORE = 3;

function resolveRound(game: InstanceType<typeof Game>) {
  const round = game.rounds[game.rounds.length - 1];
  if (round.call1 === undefined || round.call2 === undefined) return;
  const flip = round.flip as CallChoice;
  if (round.call1 === flip) game.score1 += 1;
  if (round.call2 === flip) game.score2 += 1;
  if (round.call1 === flip && round.call2 !== flip) round.winner = 1;
  else if (round.call2 === flip && round.call1 !== flip) round.winner = 2;
  if (game.score1 >= WINNING_SCORE) {
    game.winner = 1;
    game.status = 'finished';
  } else if (game.score2 >= WINNING_SCORE) {
    game.winner = 2;
    game.status = 'finished';
  } else {
    game.currentRound += 1;
  }
}

export async function POST(
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
  const { call } = (await req.json()) as { call?: string };
  const callNorm = call?.toLowerCase() as CallChoice | undefined;
  if (callNorm !== 'heads' && callNorm !== 'tails')
    return errorResponse(
      'Invalid call',
      'Send {"call": "heads"} or {"call": "tails"}',
      400
    );
  const { id } = await params;
  const game = await Game.findById(id);
  if (!game)
    return errorResponse('Game not found', 'Check the game id', 404);
  if (game.status !== 'playing')
    return errorResponse(
      'Game not active',
      'Game is waiting for a second player or already finished',
      400
    );
  const isAgent1 = game.agent1.toString() === agent._id.toString();
  const isAgent2 = game.agent2?.toString() === agent._id.toString();
  if (!isAgent1 && !isAgent2)
    return errorResponse('Forbidden', 'You are not in this game', 403);

  let roundIndex = game.rounds.findIndex((r: IRound) => r.roundNumber === game.currentRound);
  if (roundIndex === -1) {
    game.rounds.push({ roundNumber: game.currentRound } as IRound);
    roundIndex = game.rounds.length - 1;
  }
  const round = game.rounds[roundIndex];

  if (isAgent1) {
    if (round.call1 !== undefined)
      return errorResponse('Already called', 'You already submitted a call for this round', 400);
    round.call1 = callNorm;
  } else {
    if (round.call2 !== undefined)
      return errorResponse('Already called', 'You already submitted a call for this round', 400);
    round.call2 = callNorm;
  }

  if (round.call1 !== undefined && round.call2 !== undefined) {
    round.flip = (Math.random() < 0.5 ? 'heads' : 'tails') as CallChoice;
    resolveRound(game);
  }

  await game.save();

  return successResponse({
    message: 'Call recorded',
    game_id: game._id.toString(),
    status: game.status,
    score1: game.score1,
    score2: game.score2,
    currentRound: game.currentRound,
    winner: game.winner,
    round_result:
      round.flip !== undefined
        ? { flip: round.flip, call1: round.call1, call2: round.call2, roundWinner: round.winner }
        : undefined,
  });
}
