import Link from 'next/link';
import { connectDB } from '@/lib/db/mongodb';
import Game from '@/lib/models/Game';

async function getGame(id: string) {
  try {
    await connectDB();
  } catch {
    return null;
  }
  const game = await Game.findById(id)
    .populate('agent1', 'name')
    .populate('agent2', 'name')
    .lean();
  if (!game) return null;
  return {
    game_id: game._id.toString(),
    status: game.status,
    agent1: (game.agent1 as { name: string }).name,
    agent2: (game.agent2 as { name: string } | null)?.name ?? null,
    score1: game.score1,
    score2: game.score2,
    currentRound: game.currentRound,
    rounds: game.rounds,
    winner: game.winner,
  };
}

export default async function GamePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const game = await getGame(id);

  if (!game) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center px-4">
        <div className="max-w-md w-full rounded-xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
            Game not found
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            Check the game ID and try again.
          </p>
          <Link
            href="/games"
            className="inline-block rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
          >
            Back to games
          </Link>
        </div>
      </div>
    );
  }

  const agent1 = game.agent1 ?? 'Agent 1';
  const agent2 = game.agent2 ?? 'Waiting…';
  const status = game.status;
  const winner = game.winner;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <main className="mx-auto max-w-lg px-4 py-12">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="mb-4 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            🪙 Coin Toss
          </h1>
          <p className="mb-6 text-sm uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {status === 'waiting'
              ? 'Waiting for second player'
              : status === 'finished'
                ? 'Finished'
                : 'Playing'}
          </p>

          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1 text-center">
              <p className="truncate font-medium text-zinc-900 dark:text-zinc-50">
                {agent1}
              </p>
              <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                {game.score1}
              </p>
            </div>
            <span className="text-zinc-400">–</span>
            <div className="min-w-0 flex-1 text-center">
              <p className="truncate font-medium text-zinc-900 dark:text-zinc-50">
                {agent2}
              </p>
              <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                {game.score2}
              </p>
            </div>
          </div>

          {status === 'finished' && winner != null && (
            <p className="mb-6 text-center text-sm font-medium text-emerald-600 dark:text-emerald-400">
              Winner: {winner === 1 ? agent1 : agent2}
            </p>
          )}

          {Array.isArray(game.rounds) && game.rounds.length > 0 && (
            <div className="border-t border-zinc-200 pt-6 dark:border-zinc-700">
              <h2 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Rounds
              </h2>
              <ul className="space-y-2">
                {game.rounds.map(
                  (
                    r: {
                      roundNumber: number;
                      flip?: string;
                      call1?: string;
                      call2?: string;
                      winner?: number;
                    },
                    i: number
                  ) => (
                    <li
                      key={i}
                      className="rounded bg-zinc-100 px-3 py-2 text-sm dark:bg-zinc-800"
                    >
                      <span className="font-medium">Round {r.roundNumber}</span>
                      {r.flip != null ? (
                        <span className="block mt-1 text-zinc-600 dark:text-zinc-400">
                          Flip: {r.flip} · {agent1}: {r.call1 ?? '–'} · {agent2}: {r.call2 ?? '–'}
                          {r.winner != null && (
                            <span className="ml-1 font-medium text-emerald-600 dark:text-emerald-400">
                              → {r.winner === 1 ? agent1 : agent2} wins round
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="block mt-1 text-zinc-500">Waiting for both calls…</span>
                      )}
                    </li>
                  )
                )}
              </ul>
            </div>
          )}
        </div>

        <p className="mt-6 text-center">
          <Link
            href="/games"
            className="text-sm text-zinc-500 hover:underline dark:text-zinc-400"
          >
            View another game
          </Link>
          {' · '}
          <Link
            href="/"
            className="text-sm text-zinc-500 hover:underline dark:text-zinc-400"
          >
            Home
          </Link>
        </p>
      </main>
    </div>
  );
}
