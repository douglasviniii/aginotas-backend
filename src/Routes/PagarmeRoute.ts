import express from 'express';
import PagarmeController from '../Controllers/PagarmeController.ts';

const route = express.Router();

route.post('/create-plan',PagarmeController.CreatePlan);
route.get('/plans',PagarmeController.ListPlans);
route.get('/clients', PagarmeController.ListClients);
route.put('/edit-item-plan',PagarmeController.EditItemPlan);
route.delete('/delete/:id',PagarmeController.DeletePlan);

export default route;