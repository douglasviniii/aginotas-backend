import SchedulingModel from "../Models/SchedulingModel.ts";

const CreateSchedulingService = (data: Object) => SchedulingModel.create(data);

const FindSchedulings = () => SchedulingModel.find().sort({ _id: -1 });

const FindSchedulingsByCustomer = (id: string) => SchedulingModel.find({customer_id: id}).sort({ _id: -1 });

const FindSchedulingsByUser = (id: string) => SchedulingModel.find({user_id: id}).sort({ _id: -1 });

const UpdateStartDateService = (id: String, start_date: String) => SchedulingModel.findOneAndUpdate({_id: id},{start_date});

const DeleteScheduleService = (id: String) => SchedulingModel.deleteOne({customer_id: id});

const DeleteScheduleServiceById = (id: String) => SchedulingModel.deleteOne({_id: id});

export default {
    CreateSchedulingService,
    FindSchedulingsByCustomer,
    FindSchedulingsByUser,
    FindSchedulings,
    UpdateStartDateService,
    DeleteScheduleService,
    DeleteScheduleServiceById
};