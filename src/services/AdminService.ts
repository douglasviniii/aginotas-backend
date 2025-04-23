import AdminModel from "../Models/AdminModel.ts";
import jwt from 'jsonwebtoken';

const CreateAdminService = (data: any) => AdminModel.create(data);
const FindUserByIdService = (id: String) => AdminModel.findById(id);
const UpdateAdmin = (id: string, data: object) => AdminModel.findByIdAndUpdate(id, data);
const Login = (email: String) => AdminModel.findOne({email: email}).select("password");
const GeradorDeToken = (id: String) =>
    jwt.sign({ id: id }, process.env.SECRET_KEY_JWT as string, { expiresIn: '1d' }); //expira em 1d

export default {CreateAdminService,UpdateAdmin,Login,GeradorDeToken,FindUserByIdService};
