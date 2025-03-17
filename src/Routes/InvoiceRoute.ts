import express from 'express';
import InvoiceController from '../Controllers/InvoiceController.ts';
import MiddlewareUser from '../Middlwares/UserMiddlware.ts';

const InvoiceRoute = express.Router();

InvoiceRoute.post('/create',MiddlewareUser,InvoiceController.create_invoice);
InvoiceRoute.get('/find',MiddlewareUser,InvoiceController.findinvoices);

export default InvoiceRoute;