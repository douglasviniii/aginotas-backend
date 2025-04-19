import express from 'express';
import SchedulingController from '../Controllers/SchedulingController.ts';
import MiddlewareUser from '../Middlwares/UserMiddlware.ts';
import AuthMiddlewareAdmin from '../Middlwares/AdminMiddlware.ts';

const SchedulingRoute = express.Router();

SchedulingRoute.post('/create', MiddlewareUser, SchedulingController.create_scheduling);
SchedulingRoute.post('/create-admin', AuthMiddlewareAdmin, SchedulingController.create_scheduling_admin);
SchedulingRoute.get('/find/:id', SchedulingController.find_schedulings_controller);
SchedulingRoute.get('/find-user/:id', SchedulingController.find_schedulings_controller_byIDUser);
SchedulingRoute.delete('/delete/:id', SchedulingController.cancel_schedule_controller);
SchedulingRoute.delete('/deletebyid/:id', SchedulingController.cancel_schedule_controller_ById);

export default SchedulingRoute;