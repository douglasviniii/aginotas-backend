import { Request, Response } from 'express';
import UserService from '../services/UserService.ts';
import SendEmailService from '../services/SendEmailService.ts';
import bcrypt from "bcrypt";

interface User {
  name: string;
  cnpj: string;
  email: string;
  password: string;
}

const create_user = async (req: Request<{}, {}, User>, res: Response) => {
  try {
    const Data = req.body;

    const name = Data.name;
    const cnpj = Data.cnpj;
    const email = Data.email;
    const password = Data.password;

    const data: User = {name, cnpj, email, password};

    await UserService.CreateUserService(data);

    res.status(200).send({ message: 'Usuário criado com sucesso!' });
  } catch (error) {
    res.status(500).send({
      message: 'Não foi possivel criar conta do usuário',
      error: error,
    });
  }
};

const AuthUserController = async (req: Request, res: Response) => {
    try{
        const Data = req.body;

        const user = await UserService.Login(Data.email);
        const passwordIsValid = bcrypt.compareSync(Data.password, user!.password);
    
        if (!passwordIsValid) {
          return res.status(404).send("Email ou senha inválidos");
        }
    
        if (!user) {
          return res.status(404).send("Email ou senha inválidos");
        }
    
        const token = UserService.GeradorDeToken(user.id);
    
        res.status(200).send({ token });        
    }catch(error){
        res.status(500).send("Falha na autênticação");
    }
}

const Exist_user_controller = async (req: Request, res: Response) =>{
  try {
    const data = req.body;
    const user = await UserService.ExistUser(data.email);
    res.status(200).send(user);
  } catch (error) {
    res.status(500).send({
      message: 'Não foi possivel encontrar conta do usuário',
      error: error,
    });    
  }
}

const Send_code_email = async (req: Request, res: Response) =>{
  try {
    const data = req.body;
    console.log(data);
    await SendEmailService.SendEmail(data.email, data.verificador);
    res.status(200).send({message: "Código enviado com sucesso!"});
  } catch (error) {
    res.status(500).send({
      message: 'Não foi possivel encontrar conta do usuário',
      error: error,
    });    
  }
}

const Recover_Password = async (req: Request, res: Response) =>{
  try {
    const data = req.body;
    
    const Senha = await bcrypt.hash(data.password, 10);
  
    const password = Senha;
    const email = data.email;

    await UserService.UpdatePasswordUserService(password, email);
    res.status(200).send({message: "Senha atualizada com sucesso!"});
  } catch (error) {
    res.status(500).send({
      message: 'Não foi possivel mudar a senha',
      error: error,
    });      
  }
}
export default 
{ 
  create_user,
  Exist_user_controller,
  Send_code_email,
  Recover_Password,
  AuthUserController
};
