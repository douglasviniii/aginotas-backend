import AdminModel from "../Models/AdminModel.ts";
import jwt from 'jsonwebtoken';

const CreateAdminService = (data: any) => AdminModel.create(data);
const FindUserByIdService = (id: String) => AdminModel.findById(id);
const Login = (email: String) => AdminModel.findOne({email: email}).select("password");
const GeradorDeToken = (id: String) =>
    jwt.sign({ id: id }, `${process.env.SECRET_KEY_JWT}`, { expiresIn: 86400 }); //expira em 1d

export default {CreateAdminService,Login,GeradorDeToken,FindUserByIdService};
