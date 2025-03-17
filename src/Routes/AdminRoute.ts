import express from 'express';
import AdminController from '../Controllers/AdminController.ts';

const AdminRoute = express.Router();

AdminRoute.post('/auth', AdminController.AuthAdminController);
AdminRoute.post('/create', AdminController.Create_Admin);
AdminRoute.get('/findallusers', AdminController.FindAllUsers);

export default AdminRoute;