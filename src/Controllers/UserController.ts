import { Request, Response } from 'express';
import UserService from '../services/UserService.ts';
import SendEmailService from '../services/SendEmailService.ts';
import bcrypt from "bcrypt";
import PagarmeService from '../services/Pagarme.service.ts';

interface User {
  id_client_pagarme: string;
  name: string;
  cnpj: string;
  email: string;
  password: string;
  estado: string;
  cidade: string;
  inscricaoMunicipal: string;
}

interface CustomRequest extends Request {
  userObject?: {
    id: string;
    name: string;
    cnpj: string;
    inscricaoMunicipal: string;
    email: string;
  }; 
}

const create_user = async (req: Request<{}, {}, User>, res: Response) => {
  try {

    const {name,cnpj,email,password,estado,cidade,inscricaoMunicipal} = req.body;

    const response = await PagarmeService.CreateClient({name:name,email:email});

    if(response.id){
      const data: User = {
        id_client_pagarme: response.id, 
        name, 
        cnpj, 
        email, 
        password,
        estado,
        cidade,
        inscricaoMunicipal,
        
      };
      await UserService.CreateUserService(data);
      res.status(200).send({ message: 'Usuário criado com sucesso!' });
      return;
    }
    res.status(400).send({ message: 'Ocorreu um erro ao criar a conta do usuário!' });
    return;
  } catch (error) {
    res.status(500).send({
      message: 'Não foi possivel criar conta do usuário',
      error: error,
    });
    return;
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
    
        const token = await UserService.GeradorDeToken(user.id);
        const userdb = await UserService.FindUserByIdService(user.id);

        res.status(200).send({ token, userdb });        
    }catch(error){
        res.status(500).send("Falha na autênticação");
    }
}

const Update_User = async (req: CustomRequest, res: Response) =>{
  try {
    const data = req.body;
    const id = req.userObject?.id;

    if(!id){
      res.status(400).send({message: 'Id null'});
      return;
    }

    await UserService.UpdateUser(id, data);

    res.status(200).send({message: "Usuário atualizado com sucesso!"});
  } catch (error) {
    res.status(500).send({
      message: 'Não foi possivel atualizar conta do usuário',
      error: error,
    });    
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

const FindAllUser = async (req: Request, res: Response) =>{
  try {
    const user = await UserService.FindAllUsers();
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
  AuthUserController,
  Update_User,
  FindAllUser
};
