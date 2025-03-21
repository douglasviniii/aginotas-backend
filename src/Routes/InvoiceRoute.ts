import express from 'express';
import InvoiceController from '../Controllers/InvoiceController.ts';
import MiddlewareUser from '../Middlwares/UserMiddlware.ts';

const InvoiceRoute = express.Router();

InvoiceRoute.post('/create',InvoiceController.create_invoice);
InvoiceRoute.get('/consult',InvoiceController.consult_invoice);

export default InvoiceRoute;