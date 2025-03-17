import axios from "axios";
import Invoice from "../Models/InvoiceModel.ts";

const CreateInvoiceService = (data: Object) => Invoice.create(data);
const FindInvoices = (id: String) => Invoice.find({user: id}).sort({ _id: -1 }).populate("user").populate("customer");

export default {CreateInvoiceService,FindInvoices};