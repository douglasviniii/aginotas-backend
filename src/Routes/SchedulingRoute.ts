import express from 'express';
import SchedulingController from '../Controllers/SchedulingController.ts';
import MiddlewareUser from '../Middlwares/UserMiddlware.ts';
import AuthMiddlewareAdmin from '../Middlwares/AdminMiddlware.ts';

const SchedulingRoute = express.Router();

SchedulingRoute.post('/create', MiddlewareUser, SchedulingController.create_scheduling);
SchedulingRoute.post('/create-admin', AuthMiddlewareAdmin, SchedulingController.create_scheduling_admin);
SchedulingRoute.get('/find/:id', SchedulingController.find_schedulings_controller);
SchedulingRoute.delete('/delete/:id', MiddlewareUser, SchedulingController.cancel_schedule_controller);

export default SchedulingRoute;