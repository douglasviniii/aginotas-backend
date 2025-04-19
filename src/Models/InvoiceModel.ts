import mongoose, { Document, Schema } from 'mongoose';
import { string } from 'zod';

export interface IInvoice extends Document {
  customer: mongoose.Types.ObjectId; 
  admin: mongoose.Types.ObjectId; 
  user: mongoose.Types.ObjectId; 
  valor: number;
  xml: string;
  status: string;
  numeroLote: number;
  identificacaoRpsnumero: number;
  date: Date;
  data: object;
}

const InvoiceSchema = new Schema<IInvoice>({
  customer: { type: Schema.Types.ObjectId, ref: 'Customer'},
  admin: { type: Schema.Types.ObjectId, ref: 'Admin'},
  user: { type: Schema.Types.ObjectId, ref: 'User'},
  data: {type: Object, require: true},
  valor: {type: Number},
  xml: {type: String},
  status: {type: String, default: 'emitida'},
  numeroLote: {type: Number},
  identificacaoRpsnumero: {type: Number},
  date: {type: Date, default: Date.now},
});

const InvoiceModel = mongoose.model<IInvoice>('Invoice', InvoiceSchema);

export default InvoiceModel;