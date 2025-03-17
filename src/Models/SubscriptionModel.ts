import mongoose, { Document, Schema } from 'mongoose';

export interface ISubscription extends Document {
  user: mongoose.Types.ObjectId;
  plan: string;
  status: 'active' | 'inactive' | 'canceled';
  expiresAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  plan: { type: String, required: true, enum: ['basic', 'premium'] },
  status: {
    type: String,
    required: true,
    enum: ['active', 'inactive', 'canceled'],
    default: 'active',
  },
  expiresAt: { type: Date, required: true },
});

const SubscriptionModel = mongoose.model<ISubscription>(
  'Subscription',
  SubscriptionSchema
);

export default SubscriptionModel;
