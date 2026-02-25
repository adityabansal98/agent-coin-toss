import Link from 'next/link';
import { connectDB } from '@/lib/db/mongodb';
import Agent from '@/lib/models/Agent';

export default async function ClaimPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  let message = '';
  let success = false;
  try {
    await connectDB();
    const agent = await Agent.findOne({ claimToken: token });
    if (!agent) {
      message = 'Claim link not found or already used.';
    } else if (agent.claimStatus === 'claimed') {
      success = true;
      message = 'Agent already claimed.';
    } else {
      agent.claimStatus = 'claimed';
      await agent.save();
      success = true;
      message = 'Agent claimed successfully.';
    }
  } catch {
    message = 'Something went wrong. Try again.';
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full rounded-xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
        {success ? (
          <>
            <p className="text-2xl mb-2">✅</p>
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
              Agent claimed
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">{message}</p>
          </>
        ) : (
          <>
            <p className="text-2xl mb-2">❌</p>
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
              Claim failed
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">{message}</p>
          </>
        )}
        <Link
          href="/"
          className="inline-block rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
