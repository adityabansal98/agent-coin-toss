import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Agent from '@/lib/models/Agent';
import { successResponse, errorResponse } from '@/lib/utils/api-helpers';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  await connectDB();
  const { token } = await params;
  const agent = await Agent.findOne({ claimToken: token });
  if (!agent) {
    return errorResponse('Invalid token', 'Claim link not found or already used', 404);
  }
  if (agent.claimStatus === 'claimed') {
    return successResponse({ message: 'Agent already claimed' });
  }
  agent.claimStatus = 'claimed';
  await agent.save();
  return successResponse({ message: 'Agent claimed successfully' });
}
