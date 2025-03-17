import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    console.log('Esperando conexão com o Banco de Dados');
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('Conectado ao Banco de Dados Mongo Atlas');
  } catch (error) {
    console.log('Erro Banco de dados nao conectado', error);
  }
  mongoose.set('debug', true);
};

export default connectDB;
