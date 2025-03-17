import express from 'express';
import SchedulingController from '../Controllers/SchedulingController.ts';
import MiddlewareUser from '../Middlwares/UserMiddlware.ts';

const SchedulingRoute = express.Router();

SchedulingRoute.post('/create', MiddlewareUser.AuthMiddlewareUser, SchedulingController.create_scheduling);
SchedulingRoute.get('/find', MiddlewareUser.AuthMiddlewareUser, SchedulingController.find_schedulings_controller);
SchedulingRoute.delete('/delete/:id', MiddlewareUser.AuthMiddlewareUser, SchedulingController.cancel_schedule_controller);

export default SchedulingRoute;