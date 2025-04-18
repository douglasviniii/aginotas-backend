import mongoose from "mongoose";

const FinancialSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  customer: {type: Object, require: true},
  dueDate: {type: String, require: true},
  status: {type: String, require: true},
  value: {type: Number, require: true},
  description: {type: String, require: true},
});

const Financial = mongoose.model("Financial", FinancialSchema);

export default Financial;

