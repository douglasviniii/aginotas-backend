import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  name: string;
  cnpj: string;
  email: string;
  password: string;
  date_created: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, require: true },
  cnpj: { type: String, require: true },
  email: { type: String, require: true },
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
