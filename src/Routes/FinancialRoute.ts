import express from 'express';
import AuthMiddlewareUser from '../Middlwares/UserMiddlware.ts';
import FinancialController from '../Controllers/FinancialController.ts';

const Route = express.Router();

Route.get('/receipts',AuthMiddlewareUser, FinancialController.Receipts);
Route.post('/receive',AuthMiddlewareUser, FinancialController.Receive);
Route.put('/update/:id',AuthMiddlewareUser, FinancialController.Update);
Route.delete('/delete/:id',AuthMiddlewareUser, FinancialController.Delete);


/* Route.post('/installments',AuthMiddlewareUser);
Route.post('/recurrent',AuthMiddlewareUser);
Route.post('/amountpaid',AuthMiddlewareUser); */

export default Route;