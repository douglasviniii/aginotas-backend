import mongoose, { Document, Schema } from 'mongoose';

export interface ICustomer extends Document {
  user: mongoose.Types.ObjectId; 
  name: string;
  cnpj: string;
  cpf: string;
  razaoSocial: string;
  nomeFantasia: string;
  inscricaoMunicipal: string;
  inscricaoEstadual: string;
  email: string;
  phone: string;
  status: string;
  address: {
    street: string,
    number: string,
    neighborhood: string,
    cityCode: string,
    city: string,
    state: string,
    zipCode: string,    
  };
}

const CustomerSchema = new Schema<ICustomer>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String},
  cnpj: { type: String},
  cpf: { type: String},
  razaoSocial: { type: String},
  nomeFantasia: { type: String},
  inscricaoMunicipal: { type: String},
  inscricaoEstadual: { type: String},
  email: { type: String, required: true, unique: true },
  phone: { type: String},
  status: {type: String},
  address: { 
    street: { type: String},
    number: { type: String},
    neighborhood: { type: String},
    cityCode: { type: String},
    city: { type: String},
    state: { type: String},
    zipCode: { type: String},
   },
});

const CustomerModel = mongoose.model<ICustomer>('Customer', CustomerSchema);

export default CustomerModel;
