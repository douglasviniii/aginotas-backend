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
import PagarmeRoute from './Routes/PagarmeRoute.ts';
import ElotechRoute from './Routes/ElotechRoute.ts';
import FinancialRoute from './Routes/FinancialRoute.ts';
import { createServer } from "http";
import { Server } from "socket.io";
import Ticket from "./Models/Ticket.ts";
import MiddlewareUser from './Middlwares/UserMiddlware.ts';
import { Request, Response } from 'express';

dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST", "UPDATE", "DELETE", "PUT"], 
    allowedHeaders: ["Content-Type"], 
    credentials: true 
  }
});

app.use(cors({origin: '*'}));
app.use(express.json());

app.use('/user', UserRoute); 
app.use('/admin', AdminRoute); 
app.use('/customer', CustomerRoute); 
app.use('/invoice', InvoiceRoute);
app.use('/pagarme', PagarmeRoute);
app.use('/scheduling', SchedulingRoute); 
app.use('/elotech', ElotechRoute);
app.use('/financial', FinancialRoute);

interface CustomRequest extends Request {
    userid?: string; 
}

app.get("/user/tickets", MiddlewareUser, async (req: CustomRequest, res: Response) => {
  try {
      const userId = req.userid;

      const tickets = await Ticket.find({ userId: userId }).populate("userId");

      if (!tickets.length) {
          res.status(404).json({ message: "Nenhum ticket encontrado para este usuário." });
          return;
      }

      res.status(200).json(tickets);
  } catch (error) {
      res.status(500).json({ message: "Erro ao buscar tickets.", error });
  }
});

app.get("/admin/tickets", async (req, res) => {
  try {
      const tickets = await Ticket.find({ status: "open" }).populate("userId");

      if (!tickets.length) {
          res.status(404).json({ message: "Nenhum ticket aberto encontrado." });
          return;
      }

      res.json(tickets);
  } catch (error) {
      res.status(500).json({ message: "Erro ao buscar tickets.", error });
  }
});

io.on("connection", (socket) => {

  socket.on("open_ticket", async ({ userId, message }) => {
    try {
      let ticket = await Ticket.findOne({ userId, status: "open" });

      if (!ticket) {
        ticket = new Ticket({ userId, messages: [{ sender: "user", text: message }], status: "open" });
      } else {
        ticket.messages.push({ sender: "user", text: message });
      }

      await ticket.save();
      
      socket.join(`ticket_${ticket._id}`); 
      io.to(`admins`).emit("new_ticket", ticket); 
      io.to(`ticket_${ticket._id}`).emit("update_ticket", ticket);
    } catch (error) {
      console.error("Erro ao abrir ticket:", error);
    }
  });

  socket.on("send_message", async ({ ticketId, sender, message }) => {
    try {
      const ticket = await Ticket.findById(ticketId);
      if (!ticket) return;

      ticket.messages.push({ sender, text: message });
      await ticket.save();

      io.to(`ticket_${ticket._id}`).emit("update_ticket", ticket);
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    }
  });

  socket.on("close_ticket", async (ticketId) => {
    try {
/*       const ticket = await Ticket.findByIdAndUpdate(ticketId, { status: "closed" }, { new: true });

      if (ticket) {
        io.to(`ticket_${ticket._id}`).emit("update_ticket", ticket);
      } */
      await Ticket.findByIdAndDelete(ticketId);
      console.log(`Ticket ${ticketId} foi excluído.`);
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
  cron.schedule("0 0 * * *", async () => { 
   await Scheduling.scheduling_controller(); // executando agendamentos
  }, {
   timezone: "America/Sao_Paulo" 
  });
  console.log(`Servidor rodando na porta ${PORT}`);
});