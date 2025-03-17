import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import AdminService from '../services/AdminService.ts';
import UserService from '../services/UserService.ts';

const Create_Admin = async (req: Request, res: Response) => {
    try {
        const data = req.body;

        const email = data.email;
        const password = data.password;

        await AdminService.CreateAdminService({email, password});
        res.status(200).send({ message: 'Administrador criado com sucesso!' });
    } catch (error) {
        res.status(500).send({
            message: 'Não foi possivel criar conta do administrador',
            error: error,
          });        
    }
}

const AuthAdminController = async (req: Request, res: Response) => {
    try{
        const Data = req.body;

        const admin = await AdminService.Login(Data.email);
        const passwordIsValid = bcrypt.compareSync(Data.password, admin!.password);
    
        if (!passwordIsValid) {
          return res.status(404).send("Email ou senha inválidos");
        }
    
        if (!admin) {
          return res.status(404).send("Email ou senha inválidos");
        }
    
        const token = AdminService.GeradorDeToken(admin.id);
    
        res.status(200).send({ token });        
    }catch(error){
        res.status(500).send("Falha na autênticação");
    }
}

const FindAllUsers = async (req: Request, res: Response) =>{
    try {
        res.status(200).send(await UserService.FindAllUsers());
    } catch (error) {
        res.status(500).json({message:'Server internal error'});
    }
}

export default 
{
    Create_Admin,
    AuthAdminController,
    FindAllUsers
};