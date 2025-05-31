import express from 'express';
import PagarmeController from '../Controllers/PagarmeController.ts';

const route = express.Router();

//cliente
route.get('/clients', PagarmeController.ListClients);

//planos
route.post('/create-plan',PagarmeController.CreatePlan);
route.get('/plans',PagarmeController.ListPlans);
route.put('/edit-item-plan',PagarmeController.EditItemPlan);
route.put('/edit-plan',PagarmeController.EditPlan);
route.delete('/delete/:id',PagarmeController.DeletePlan);

//assinaturas
route.post('/create-subscription', PagarmeController.CreateSubscription);
route.get('/get-subscription/:id', PagarmeController.GetSubscription);
route.get('/get-all-subscriptions', PagarmeController.GetAllSubscriptions);
route.patch('/update-subscription/:id', PagarmeController.UpdateCardSubscription);
route.delete('/cancel-subscription/:id', PagarmeController.CancelSubscription);

export default route;