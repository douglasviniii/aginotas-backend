import express from 'express';
import InvoiceController from '../Controllers/InvoiceController.ts';
import MiddlewareUser from '../Middlwares/UserMiddlware.ts';

const InvoiceRoute = express.Router();

InvoiceRoute.post('/create',MiddlewareUser,InvoiceController.create_invoice);
InvoiceRoute.post('/cancel',MiddlewareUser,InvoiceController.cancel_invoice);
InvoiceRoute.post('/replace',MiddlewareUser,InvoiceController.replace_invoice);


InvoiceRoute.post('/consult',InvoiceController.consult_invoice);


export default InvoiceRoute;