import mongoose from "mongoose";

const TicketSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  messages: [
    {
      sender: { type: String, required: true },
      senderName: { type: String },
      text: { type: String },
      timestamp: { type: Date, default: Date.now },
      media: {
        imageBase64: { type: String } // imagem em base64 como string
      }
    }
  ],
  status: { type: String, enum: ["open", "closed"], default: "open" },
}, { timestamps: true });

const Ticket = mongoose.model("Ticket", TicketSchema);

export default Ticket;
