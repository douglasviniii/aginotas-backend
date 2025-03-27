import mongoose, { Document, Schema } from 'mongoose';

export interface Scheduling extends Document {
  customer_id: String,
  user_id: String,
  billing_day: Number,
  //amount: Number,
  start_date: String,
  end_date: String,
  data: Object,
  valor: Number,
  status: String,
  date: Date
/*   description: String,
  item_lista_servico: String,
  codigo_cnae: String,
  customer_data: {
    cpfCnpj: String,
    razaoSocial: String,
    inscricaoMunicipal: String,
    email: String,
    endereco: {
      endereco: String,
      numero: Number,
      bairro: String,
      codigoMunicipio: String,
      cidadeNome: String,
      uf: String,
      cep: String,
    },
    telefone: String,
  } */
}

const schedulingSchema = new Schema<Scheduling>({
    customer_id: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    billing_day: { type: Number, required: true },
    start_date: { type: String, required: true},
    end_date: { type: String, required: true},
    data: {type: Object, require: true},
    valor: {type: Number},
    status: {type: String, default: 'programado'},
    date: {type: Date, default: Date.now},
    
/*     customer_data: {
      cpfCnpj: { type: String, required: true},
      razaoSocial: { type: String, required: true},
      inscricaoMunicipal: { type: String, required: true},
      email: { type: String, required: true},
      endereco: {
        endereco: { type: String, required: true},
        numero: { type: Number, required: true},
        bairro: { type: String, required: true},
        codigoMunicipio: { type: String, required: true},
        cidadeNome: { type: String, required: true},
        uf: { type: String, required: true},
        cep: { type: String, required: true},
      },
      telefone: { type: String, required: true},
    } */
})

const SchedulingModel = mongoose.model<Scheduling>('Scheduling', schedulingSchema);

export default SchedulingModel;