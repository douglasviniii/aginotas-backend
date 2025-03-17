import mongoose from "mongoose";

const TicketSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  messages: [
    {
      sender: { type: String, required: true },
      text: { type: String, required: true },
      timestamp: { type: Date, default: Date.now }
    }
  ],
  status: { type: String, enum: ["open", "closed"], default: "open" },
}, { timestamps: true });

const Ticket = mongoose.model("Ticket", TicketSchema);

export default Ticket;
