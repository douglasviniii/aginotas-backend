import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import AdminService from '../services/AdminService.ts';
import UserService from '../services/UserService.ts';
import InvoiceService from '../services/InvoiceService.ts';

const Create_Admin = async (req: Request, res: Response) => {
    try {
        const data = req.body;
        await AdminService.CreateAdminService(data);
        res.status(200).send({ message: 'Administrador criado com sucesso!' });
    } catch (error) {
        res.status(500).send({
            message: 'Não foi possivel criar conta do administrador',
            error: error,
          });        
    }
}

const Update_Admin_byID = async (req: Request, res: Response) =>{
  try {
    const data = req.body;
    const id = req.params.id;

    if(!id){
      res.status(400).send({message: 'Id null'});
      return;
    }
    await AdminService.UpdateAdmin(id, data);
    res.status(200).send({message: "Admin atualizado com sucesso!"});
  } catch (error) {
    res.status(500).send({
      message: 'Não foi possivel atualizar conta do usuário',
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
    
        const token = await AdminService.GeradorDeToken(admin.id);
        const userdb = await AdminService.FindUserByIdService(admin.id);
    
        res.status(200).send({ token,userdb });        
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

const FindAllInvoicesCreated = async (req: Request, res: Response) =>{
    try {
        res.status(200).send(await InvoiceService.FindAllInvoices());
    } catch (error) {
        res.status(500).json({message:'Server internal error'});
    }
}

export default 
{
    Create_Admin,
    AuthAdminController,
    FindAllUsers,
    FindAllInvoicesCreated,
    Update_Admin_byID
};