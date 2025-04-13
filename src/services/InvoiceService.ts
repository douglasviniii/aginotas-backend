import Invoice from "../Models/InvoiceModel.ts";

const CreateInvoiceService = (data: Object) => Invoice.create(data);
const DeleteInvoice = (id: string) => Invoice.deleteOne({_id: id});
const UpdateInvoice = (id: string, data: object) => Invoice.findByIdAndUpdate(id, data);

const FindInvoice = (id: string) => Invoice.findById(id).populate("user").populate("customer");
const FindInvoiceCustomer = (id: string) => Invoice.find({customer: id}).sort({ _id: -1 }).populate("user").populate("customer");
const FindInvoices = (id: String) => Invoice.find({user: id}).sort({ _id: -1 }).populate("user").populate("customer");
const FindAllInvoices = () => Invoice.find().populate("user").populate("customer");
const FindLastInvoice = (id: String) => Invoice.findOne({user: id}).sort({ date: -1 }).limit(1);

export default {CreateInvoiceService,FindInvoices,FindInvoice,FindInvoiceCustomer,FindAllInvoices,FindLastInvoice,DeleteInvoice,UpdateInvoice};