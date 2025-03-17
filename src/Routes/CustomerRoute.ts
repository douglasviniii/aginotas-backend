import express from 'express';
import CustomerController from '../Controllers/CustomerController.ts';
import MiddlewareUser from '../Middlwares/UserMiddlware.ts';

const CustomerRoute = express.Router();

CustomerRoute.post('/create', MiddlewareUser.AuthMiddlewareUser,CustomerController.create_customer);
CustomerRoute.get('/find', MiddlewareUser.AuthMiddlewareUser, CustomerController.findcustomers);
CustomerRoute.get('/actives', MiddlewareUser.AuthMiddlewareUser, CustomerController.findcustomersactives);
CustomerRoute.delete('/delete/:id', MiddlewareUser.AuthMiddlewareUser,CustomerController.deletecustomer);
CustomerRoute.put('/changestatus/:id', MiddlewareUser.AuthMiddlewareUser,CustomerController.desactivatecustomer);

export default CustomerRoute;