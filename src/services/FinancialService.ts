import Financial from "../Models/FinancialModel.ts";

const Allreceipts = (id: string) => Financial.find({_id: id});

const Receive = (data: object) => Financial.create(data);

const UpdateStatus = (status: String, id: String) => Financial.findOneAndUpdate({ _id: id },{status});

const Delete = (id: string) => Financial.deleteOne({_id: id});

export default {
    Allreceipts,
    Receive,
    UpdateStatus,
    Delete
}