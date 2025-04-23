import Financial from "../Models/FinancialModel.ts";

const Allreceipts = (id: string) => Financial.find({userId: id});

const FindById = (id: string) => Financial.findById(id);

const VerifyReceipts = () => Financial.find();

const Receive = (data: object) => Financial.create(data);

const UpdateStatus = (status: String, id: String) => Financial.findOneAndUpdate({ _id: id },{status});

const UpdateDueDate = (dueDate: String, id: String) => Financial.findOneAndUpdate({ _id: id },{dueDate});

const UpdateisDesactivated = (isDesactivated: Boolean, id: String) => Financial.findOneAndUpdate({ _id: id },{isDesactivated});

const Delete = (id: string) => Financial.deleteOne({_id: id});

const LastMonthPaid = (id: string, data: string, status: string) => Financial.findByIdAndUpdate(id,{$push: {paymentHistory: {date: data,status: status}}});


export default {
    Allreceipts,
    Receive,
    UpdateStatus,
    Delete,
    VerifyReceipts,
    LastMonthPaid,
    UpdateisDesactivated,
    FindById,
    UpdateDueDate
}