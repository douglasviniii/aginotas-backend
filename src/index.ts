import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import DataBase from './Database/DataBase.ts';
import UserRoute from './Routes/UserRoute.ts';
import CustomerRoute from './Routes/CustomerRoute.ts';
import InvoiceRoute from './Routes/InvoiceRoute.ts';
import SchedulingRoute from './Routes/SchedulingRoute.ts';
import Scheduling from './Controllers/SchedulingController.ts'
import AdminRoute from './Routes/AdminRoute.ts';

dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(express.json());

app.use('/user', UserRoute); 
app.use('/admin', AdminRoute); 
app.use('/customer', CustomerRoute); 
app.use('/invoice', InvoiceRoute);
app.use('/scheduling', SchedulingRoute); 

app.listen(PORT, async () => {
  await DataBase(); 
   cron.schedule("0 0 * * *", async () => { //executar após a meia-noite
    await Scheduling.scheduling_controller(); // executando agendamentos
  }) 
  console.log(`Servidor rodando na porta ${PORT}`);
});