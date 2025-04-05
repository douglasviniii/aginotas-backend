import SchedulingModel from "../Models/SchedulingModel.ts";

const CreateSchedulingService = (data: Object) => SchedulingModel.create(data);

const FindSchedulings = (id: string) => SchedulingModel.find({_id: id}).sort({ _id: -1 });

const UpdateStartDateService = (id: String, start_date: String) => SchedulingModel.findOneAndUpdate({_id: id},{start_date});

const DeleteScheduleService = (id: String) => SchedulingModel.deleteOne({customer_id: id});

export default {CreateSchedulingService,FindSchedulings,UpdateStartDateService,DeleteScheduleService};