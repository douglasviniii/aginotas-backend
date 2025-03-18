import express from 'express';
import PagarmeController from '../Controllers/PagarmeController.ts';

const route = express.Router();

route.post('/create-plan',PagarmeController.CreatePlan);
route.get('/plans',PagarmeController.ListPlans);
route.delete('/delete/:id',PagarmeController.DeletePlan);

export default route;