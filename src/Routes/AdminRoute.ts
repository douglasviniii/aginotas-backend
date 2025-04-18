import express from 'express';
import AdminController from '../Controllers/AdminController.ts';

const AdminRoute = express.Router();

AdminRoute.post('/auth', AdminController.AuthAdminController);
AdminRoute.post('/create', AdminController.Create_Admin);
AdminRoute.patch('/update/:id', AdminController.Update_Admin_byID);
AdminRoute.get('/findallusers', AdminController.FindAllUsers);
AdminRoute.get('/findallinvoices', AdminController.FindAllInvoicesCreated);
AdminRoute.get('/findallinvoices', AdminController.FindAllInvoicesCreated);

export default AdminRoute;