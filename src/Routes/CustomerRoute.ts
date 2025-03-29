import express from 'express';
import CustomerController from '../Controllers/CustomerController.ts';
import MiddlewareUser from '../Middlwares/UserMiddlware.ts';

const CustomerRoute = express.Router();

CustomerRoute.post('/create', MiddlewareUser,CustomerController.create_customer);
CustomerRoute.get('/find', MiddlewareUser, CustomerController.findcustomers);
CustomerRoute.get('/actives', MiddlewareUser, CustomerController.findcustomersactives);
CustomerRoute.delete('/delete/:id', MiddlewareUser,CustomerController.deletecustomer);
CustomerRoute.patch('/update/:id', MiddlewareUser,CustomerController.updatecustomer);
CustomerRoute.put('/changestatus/:id', MiddlewareUser,CustomerController.desactivatecustomer);

export default CustomerRoute;