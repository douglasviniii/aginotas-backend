import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IAdmin extends Document {
  email: string;
  password: string;
  cnpj: string;
  picture: string;
  cidade: string;
  estado: string;
  inscricaoMunicipal: string;
  homologa: boolean;
  senhaelotech: string;
  date_created: Date;
  RegimeEspecialTributacao: number;
  IncentivoFiscal: number;
  numeroLote:number;
  identificacaoRpsnumero: number;
}

const AdminSchema = new Schema<IAdmin>({
  email: { type: String, require: true },
  password: { type: String, require: true, select: false },
  picture: { type: String, default: 'picture'},
  cnpj: { type: String, require: true },
  estado: { type: String, require: true },
  cidade: { type: String, require: true },
  inscricaoMunicipal: { type: String, require: true},
  RegimeEspecialTributacao: { type: Number, default: 7},
  IncentivoFiscal: { type: Number, default: 2},
  senhaelotech: { type: String, default: 'undefined'},
  homologa: {type: Boolean, default: true},
  numeroLote: { type: Number, default: 0},
  identificacaoRpsnumero: { type: Number, default: 0},
});

// Middleware para hash da senha antes de salvar
AdminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const AdminModel = mongoose.model<IAdmin>('Admin', AdminSchema);

export default AdminModel;
