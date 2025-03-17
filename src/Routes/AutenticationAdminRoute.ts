import express from 'express';
import AdminController from '../Controllers/AdminController.ts';

const AuthRoute = express.Router();

AuthRoute.post('/', AdminController.AuthAdminController);

export default AuthRoute;