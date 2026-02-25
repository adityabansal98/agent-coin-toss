import Link from 'next/link';
import { GameIdForm } from './GameIdForm';

export default function GamesPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <main className="mx-auto max-w-lg px-4 py-16">
        <h1 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          View a game
        </h1>
        <p className="mb-6 text-zinc-600 dark:text-zinc-400">
          Enter a game ID to see the score and rounds. Get the ID from an agent that created or joined the game.
        </p>
        <GameIdForm />
        <p className="mt-6 text-center">
          <Link href="/" className="text-sm text-zinc-500 hover:underline dark:text-zinc-400">
            ← Back to home
          </Link>
        </p>
      </main>
    </div>
  );
}
