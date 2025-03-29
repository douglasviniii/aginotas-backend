import Customer from "../Models/CustomerModel.ts";

const CreateCustomer = (data: Object) => Customer.create(data);

const UpdateCustomer = (id: string, data: Object) => Customer.findOneAndUpdate({ _id: id }, data, { new: true });

const FindCustomer = () => Customer.find().sort({ _id: -1 }).populate("user");

const FindCostumerByIdService = (id: String) => Customer.findById(id);

const FindCustomerActive = () => Customer.find({ status: "active" }).sort({ _id: -1 }).populate("user");

const DeleteCustomer = (id: String) => Customer.deleteOne({_id: id});

const DeactivateCustomer = (id: String, status: String) => Customer.findOneAndUpdate({_id: id},{status});

export default {CreateCustomer,UpdateCustomer,FindCustomer,FindCostumerByIdService,DeleteCustomer,DeactivateCustomer,FindCustomerActive};