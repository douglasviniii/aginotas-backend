import mongoose from "mongoose";

const FinancialSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  customer: {type: Object, require: true},
  creationDate: {type: String, default: () => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // "YYYY-MM-DD"
  },
  },
  dueDate: {type: String, require: true},
  status: {type: String, require: true},
  value: {type: Number, require: true},
  description: {type: String, require: true},

  isDesactivated: {type: Boolean, default: false},
  typeofcharge: {type: String, default: ''},

  paymentHistory: [{
    date: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      default: '',
    }
  }]
});

const Financial = mongoose.model("Financial", FinancialSchema);

export default Financial;

