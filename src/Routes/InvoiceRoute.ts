import express from 'express';
import InvoiceController from '../Controllers/InvoiceController.ts';
import MiddlewareUser from '../Middlwares/UserMiddlware.ts';

const InvoiceRoute = express.Router();

InvoiceRoute.post('/create',MiddlewareUser.AuthMiddlewareUser,InvoiceController.create_invoice);
InvoiceRoute.get('/find',MiddlewareUser.AuthMiddlewareUser,InvoiceController.findinvoices);

export default InvoiceRoute;