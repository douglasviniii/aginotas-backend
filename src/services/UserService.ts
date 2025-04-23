import User from '../Models/UserModel.ts';
import jwt from 'jsonwebtoken';

interface UserData {
  email: string;
  password: string;
}

const CreateUserService = (data: UserData) => User.create(data);
const FindUserByIdService = (id: String) => User.findById(id);
const ExistUser = (email: String) => User.findOne({email: email});
const FindAllUsers = () => User.find();
const UpdatePasswordUserService = (password: String, email: String) => User.findOneAndUpdate({ email: email },{password});
const UpdateUser = (id: string, data: object) => User.findByIdAndUpdate(id, data);


const UpdateHistoryService = (id: String, date: Date) => User.updateOne({_id: id, "history.date": date}, { $inc: { "history.$.count": 1 } });
const AddHistoryService = (id: String, data: Object) => User.updateOne({_id: id}, { $push: { history: data} });


const Login = (email: String) => User.findOne({email: email}).select("password");

const GeradorDeToken = (id: string) =>
  jwt.sign({ id }, process.env.SECRET_KEY_JWT as string, { expiresIn: '1d' });

export default {CreateUserService,
  FindUserByIdService,
  UpdateHistoryService,
  AddHistoryService,
  ExistUser,
  UpdatePasswordUserService,
  Login,
  GeradorDeToken,
  FindAllUsers,
  UpdateUser
};
