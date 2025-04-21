import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  id_client_pagarme: string;
  subscription_id: string;
  name: string;
  cnpj: string;
  picture: string;
  cidade: string;
  email: string;
  estado: string;
  inscricaoMunicipal: string;
  password: string;
  homologa: boolean;
  senhaelotech: string;
  date_created: Date;
  RegimeEspecialTributacao: number;
  IncentivoFiscal: number;
  status: string;

  numeroLote:number;
  identificacaoRpsnumero: number;
}

const UserSchema = new Schema<IUser>({
  id_client_pagarme: { type: String, require: true },
  subscription_id: { type: String, default: 'undefined'},

  name: { type: String, require: true },
  email: { type: String, require: true},
  picture: { type: String, default: 'picture'},
  password: { type: String, require: true, select: false },

  cnpj: { type: String, require: true },
  estado: { type: String, require: true },
  cidade: { type: String, require: true },
  inscricaoMunicipal: { type: String, require: true},

  RegimeEspecialTributacao: { type: Number, default: 7},
  IncentivoFiscal: { type: Number, default: 2},

  senhaelotech: { type: String, default: 'undefined'},
  homologa: {type: Boolean, default: true},

  date_created: { type: Date, default: Date.now },
  status: {type: String, default: 'active'},

  numeroLote: { type: Number, default: 0},
  identificacaoRpsnumero: { type: Number, default: 0},
});

// Middleware para hash da senha antes de salvar
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const UserModel = mongoose.model<IUser>('User', UserSchema);

export default UserModel;
