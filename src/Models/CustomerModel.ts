import mongoose, { Document, Schema } from 'mongoose';

export interface ICustomer extends Document {
  user: mongoose.Types.ObjectId; 
  name: string;
  cnpj: string;
  inscricaoMunicipal: string;
  email: string;
  phone: string;
  status: String;
  address: object;
}

const CustomerSchema = new Schema<ICustomer>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  cnpj: { type: String, required: true },
  inscricaoMunicipal: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
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
