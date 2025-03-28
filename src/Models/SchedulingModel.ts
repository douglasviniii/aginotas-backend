import mongoose, { Document, Schema } from 'mongoose';

export interface Scheduling extends Document {
  customer_id: String,
  user_id: String,
  billing_day: Number,
  start_date: String,
  end_date: String,
  data: {
    valor_unitario: number,
    quantidade: number,
    Discriminacao: string,
    item_lista: number,
    cnae: number,
    descricao: string,
    desconto: number,
  },
  valor: Number,
  status: String,
  date: Date

}

const schedulingSchema = new Schema<Scheduling>({
    customer_id: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    billing_day: { type: Number, required: true },
    start_date: { type: String, required: true},
    end_date: { type: String, required: true},
    data: {
      servico: {
      valor_unitario: {type: Number, required: true},
      quantidade: {type: Number, required: true},
      Discriminacao: {type: String, required: true},
      item_lista: {type: Number, required: true},
      cnae: {type: Number, required: true},
      descricao: {type: String, required: true},
      desconto: {type: Number, required: true}
      },
    },
    valor: {type: Number, required: true},
    status: {type: String, default: 'programado'},
    date: {type: Date, default: Date.now},
})

const SchedulingModel = mongoose.model<Scheduling>('Scheduling', schedulingSchema);

export default SchedulingModel;