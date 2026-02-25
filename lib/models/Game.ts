import mongoose, { Schema, Document, Types } from 'mongoose';

export type CallChoice = 'heads' | 'tails';

export interface IRound {
  roundNumber: number;
  flip?: CallChoice;
  call1?: CallChoice;
  call2?: CallChoice;
  winner?: 1 | 2; // 1 = agent1, 2 = agent2
}

export interface IGame extends Document {
  status: 'waiting' | 'playing' | 'finished';
  agent1: Types.ObjectId;
  agent2?: Types.ObjectId;
  score1: number;
  score2: number;
  rounds: IRound[];
  currentRound: number;
  winner?: 1 | 2;
  createdAt: Date;
  updatedAt: Date;
}

const RoundSchema = new Schema<IRound>(
  {
    roundNumber: { type: Number, required: true },
    flip: { type: String, enum: ['heads', 'tails'], required: false },
    call1: { type: String, enum: ['heads', 'tails'] },
    call2: { type: String, enum: ['heads', 'tails'] },
    winner: { type: Number, enum: [1, 2] },
  },
  { _id: false }
);

const GameSchema = new Schema<IGame>(
  {
    status: { type: String, enum: ['waiting', 'playing', 'finished'], default: 'waiting' },
    agent1: { type: Schema.Types.ObjectId, ref: 'Agent', required: true },
    agent2: { type: Schema.Types.ObjectId, ref: 'Agent' },
    score1: { type: Number, default: 0 },
    score2: { type: Number, default: 0 },
    rounds: [RoundSchema],
    currentRound: { type: Number, default: 1 },
    winner: { type: Number, enum: [1, 2] },
  },
  { timestamps: true }
);

export default mongoose.models.Game || mongoose.model<IGame>('Game', GameSchema);
