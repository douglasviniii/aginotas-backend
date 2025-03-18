import express from 'express';
import PagarmeController from '../Controllers/PagarmeController.ts';

const route = express.Router();

//cliente
route.get('/clients', PagarmeController.ListClients);

//planos
route.post('/create-plan',PagarmeController.CreatePlan);
route.get('/plans',PagarmeController.ListPlans);
route.put('/edit-item-plan',PagarmeController.EditItemPlan);
route.delete('/delete/:id',PagarmeController.DeletePlan);

//assinaturas
route.post('/create-subscription', PagarmeController.CreateSubscription);

export default route;