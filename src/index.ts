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
import { createServer } from "http";
import { Server } from "socket.io";
import Ticket from "./Models/Ticket.ts";

dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();

const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

app.use('/user', UserRoute); 
app.use('/admin', AdminRoute); 
app.use('/customer', CustomerRoute); 
app.use('/invoice', InvoiceRoute);
app.use('/scheduling', SchedulingRoute); 


io.on("connection", (socket) => {
  console.log(`Novo usuário conectado: ${socket.id}`);

  // Usuário abre um ticket
  socket.on("open_ticket", async ({ userId, message }) => {
    try {
      let ticket = await Ticket.findOne({ userId, status: "open" });

      if (!ticket) {
        ticket = new Ticket({ userId, messages: [{ sender: "user", text: message }], status: "open" });
      } else {
        ticket.messages.push({ sender: "user", text: message });
      }

      await ticket.save();
      
      // Enviar somente para o usuário e para os admins
      socket.join(`ticket_${ticket._id}`); 
      io.to(`admins`).emit("new_ticket", ticket); // Notifica apenas admins
      io.to(`ticket_${ticket._id}`).emit("update_ticket", ticket); // Notifica usuário e admins
    } catch (error) {
      console.error("Erro ao abrir ticket:", error);
    }
  });

  // Usuário/Admin envia mensagem no ticket
  socket.on("send_message", async ({ ticketId, sender, message }) => {
    try {
      const ticket = await Ticket.findById(ticketId);
      if (!ticket) return;

      ticket.messages.push({ sender, text: message });
      await ticket.save();

      io.to(`ticket_${ticket._id}`).emit("update_ticket", ticket); // Atualiza apenas usuários e admins do ticket
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    }
  });

  // Admin fecha o ticket
  socket.on("close_ticket", async (ticketId) => {
    try {
      const ticket = await Ticket.findByIdAndUpdate(ticketId, { status: "closed" }, { new: true });
      if (ticket) {
        io.to(`ticket_${ticket._id}`).emit("update_ticket", ticket); // Apenas os envolvidos recebem
      }
    } catch (error) {
      console.error("Erro ao fechar ticket:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log(`Usuário desconectado: ${socket.id}`);
  });
});


server.listen(PORT, async () => {
  await DataBase(); 
   cron.schedule("0 0 * * *", async () => { //executar após a meia-noite
    await Scheduling.scheduling_controller(); // executando agendamentos
  }) 
  console.log(`Servidor rodando na porta ${PORT}`);
});