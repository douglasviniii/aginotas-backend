import express from 'express';
import AuthMiddlewareUser from '../Middlwares/UserMiddlware.ts';
import FinancialController from '../Controllers/FinancialController.ts';

const Route = express.Router();

Route.get('/receipts',AuthMiddlewareUser, FinancialController.Receipts);
Route.post('/create',AuthMiddlewareUser, FinancialController.Receive);
Route.post('/lastmonthpaid/:id', FinancialController.LastMonthPaid);
Route.put('/update/:id',AuthMiddlewareUser, FinancialController.Update);
Route.put('/isdesactivated/:id',FinancialController.isDesactivated);
Route.delete('/delete/:id',AuthMiddlewareUser, FinancialController.Delete);


/* Route.post('/installments',AuthMiddlewareUser);
Route.post('/recurrent',AuthMiddlewareUser);
Route.post('/amountpaid',AuthMiddlewareUser); */

export default Route;