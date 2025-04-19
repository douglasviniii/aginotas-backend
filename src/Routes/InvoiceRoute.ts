import express from 'express';
import InvoiceController from '../Controllers/InvoiceController.ts';
import MiddlewareUser from '../Middlwares/UserMiddlware.ts';
import AuthMiddlewareAdmin from '../Middlwares/AdminMiddlware.ts';

const InvoiceRoute = express.Router();

InvoiceRoute.post('/create',MiddlewareUser,InvoiceController.create_invoice);

InvoiceRoute.post('/create-admin',AuthMiddlewareAdmin,InvoiceController.create_invoice_admin);
InvoiceRoute.post('/cancel',MiddlewareUser,InvoiceController.cancel_invoice);
InvoiceRoute.post('/cancel-admin',InvoiceController.cancel_invoice_admin);
InvoiceRoute.post('/replace',MiddlewareUser,InvoiceController.replace_invoice);
InvoiceRoute.post('/nfsepdf', InvoiceController.create_nfse_pdf);
InvoiceRoute.post('/nfsepdf-admin', InvoiceController.create_nfse_pdf_admin);

InvoiceRoute.get('/find/:id',InvoiceController.find_invoice);
InvoiceRoute.get('/find',InvoiceController.findinvoices);
InvoiceRoute.get('/findinvoices',MiddlewareUser,InvoiceController.findinvoicesuser);
InvoiceRoute.get('/findinvoicescustomer/:id',InvoiceController.findinvoicescustomer);
InvoiceRoute.get('/findinvoicescustomeradmin/:id',InvoiceController.findinvoicescustomeradmin);
InvoiceRoute.get('/findinvoicesadmin/:id',InvoiceController.findinvoicesadmin);

//InvoiceRoute.post('/consult',InvoiceController.consult_invoice);


export default InvoiceRoute;