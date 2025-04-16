import express from 'express';
import UserController from '../Controllers/UserController.ts';
import AuthMiddlewareUser from '../Middlwares/UserMiddlware.ts';

const UserRoute = express.Router();

UserRoute.post('/auth', UserController.AuthUserController);
UserRoute.post('/create', UserController.create_user);
UserRoute.post('/find', UserController.Exist_user_controller);
UserRoute.patch('/update',AuthMiddlewareUser,UserController.Update_User);
UserRoute.patch('/update/:id',UserController.Update_User_byID);
UserRoute.post('/recover/email', UserController.Send_code_email);
UserRoute.put('/recover/password', UserController.Recover_Password);
UserRoute.get('/findall', UserController.FindAllUser);

UserRoute.post('/calcular-tributos', UserController.Calcular_Tributos);

export default UserRoute;
