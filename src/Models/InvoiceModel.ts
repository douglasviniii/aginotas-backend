import mongoose, { Document, Schema } from 'mongoose';
import { string } from 'zod';

export interface IInvoice extends Document {
  customer: mongoose.Types.ObjectId; 
  user: mongoose.Types.ObjectId; 
  content: Object;
  status: string;
}

const InvoiceSchema = new Schema<IInvoice>({
  customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: {type: Object, require: true},
  status: {type: String},
});

const InvoiceModel = mongoose.model<IInvoice>('Invoice', InvoiceSchema);

export default InvoiceModel;