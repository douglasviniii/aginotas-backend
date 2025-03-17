import AdminModel from "../Models/AdminModel.ts";
import jwt from 'jsonwebtoken';

interface AdminData {
    email: string;
    password: string;
}

const CreateAdminService = (data: AdminData) => AdminModel.create(data);
const Login = (email: String) => AdminModel.findOne({email: email}).select("password");
const GeradorDeToken = (id: String) =>
    jwt.sign({ id: id }, `${process.env.SECRET_KEY_JWT}`, { expiresIn: 86400 }); //expira em 1d

export default {CreateAdminService,Login,GeradorDeToken};
