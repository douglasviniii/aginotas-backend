import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  id_client_pagarme: string;
  name: string;
  cnpj: string;
  email: string;
  inscricaoMunicipal: string;
  password: string;
  senhaelotech: string;
  date_created: Date;
}

const UserSchema = new Schema<IUser>({
  id_client_pagarme: { type: String, require: true },
  name: { type: String, require: true },
  cnpj: { type: String, require: true },
  inscricaoMunicipal: { type: String, require: true },
  senhaelotech: { type: String, require: true },
  email: { type: String, require: true, unique:true },
  password: { type: String, require: true, select: false },
  date_created: { type: Date, default: Date.now }
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
