import mongoose, { Document, Schema } from 'mongoose';

export interface Scheduling extends Document {
  customer_id: String,
  user_id: String,
  billing_day: Number,
  start_date: String,
  end_date: String,
  data: {
    servico:{
    valor_unitario: number,
    quantidade: number,
    Discriminacao: string,
    item_lista: number,
    cnae: number,
    descricao: string,
    desconto: number,
    dateOfCompetence: String,
    ValorDeducoes: number,
    AliquotaPis: number;
    RetidoPis: number;
    ValorPis: number;
    AliquotaCofins: number;
    RetidoCofins: number;
    ValorCofins: number;
    AliquotaInss: number;
    RetidoInss: number;
    ValorInss: number;
    AliquotaIr: number;
    RetidoIr: number;
    ValorIr: number;
    AliquotaCsll: number;
    RetidoCsll: number;
    ValorCsll: number;
    AliquotaCpp: number;
    RetidoCpp: number;
    ValorCpp: number;
    RetidoOutrasRetencoes: number;
    Aliquota: number;
    DescontoIncondicionado: number;
    DescontoCondicionado: number;
    },
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
      desconto: {type: Number, required: true},
      dateOfCompetence: {type: String, required: true},
      ValorDeducoes: {type: Number, required: true},
      AliquotaPis:  {type: Number, required: true},
      RetidoPis: {type: Number, required: true},
      ValorPis: {type: Number, required: true},
      AliquotaCofins: {type: Number, required: true},
      RetidoCofins: {type: Number, required: true},
      ValorCofins: {type: Number, required: true},
      AliquotaInss: {type: Number, required: true},
      RetidoInss: {type: Number, required: true},
      ValorInss: {type: Number, required: true},
      AliquotaIr: {type: Number, required: true}, 
      RetidoIr: {type: Number, required: true},
      ValorIr: {type: Number, required: true},
      AliquotaCsll: {type: Number, required: true},
      RetidoCsll: {type: Number, required: true},
      ValorCsll: {type: Number, required: true},
      AliquotaCpp: {type: Number, required: true},
      RetidoCpp: {type: Number, required: true},
      ValorCpp: {type: Number, required: true},
      RetidoOutrasRetencoes: {type: Number, required: true},
      Aliquota: {type: Number, required: true},
      DescontoIncondicionado: {type: Number, required: true},
      DescontoCondicionado: {type: Number, required: true},
      IssRetido: {type: Number, required: true},
      },
    },
    valor: {type: Number, required: true},
    status: {type: String, default: 'programado'},
    date: {type: Date, default: Date.now},
})

const SchedulingModel = mongoose.model<Scheduling>('Scheduling', schedulingSchema);

export default SchedulingModel;