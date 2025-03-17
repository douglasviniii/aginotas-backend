import express from 'express';
import UserController from '../Controllers/UserController.ts';

const UserRoute = express.Router();

UserRoute.post('/auth', UserController.AuthUserController);
UserRoute.post('/create', UserController.create_user);
UserRoute.post('/find', UserController.Exist_user_controller);
UserRoute.post('/recover/email', UserController.Send_code_email);
UserRoute.put('/recover/password', UserController.Recover_Password);

export default UserRoute;
