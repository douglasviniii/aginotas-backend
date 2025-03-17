import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IAdmin extends Document {
  email: string;
  password: string
}

const AdminSchema = new Schema<IAdmin>({
  email: { type: String, require: true },
  password: { type: String, require: true, select: false }
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
