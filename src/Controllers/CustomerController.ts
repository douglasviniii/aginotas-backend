import { Request, Response } from 'express';
import CustomerService from '../services/CustomerService.ts';

interface CustomRequest extends Request {
    userObject?: {
      id: string;
      email: string;
      subscription: Object;
      customers: Object;
    }; 
}

const create_customer = async (req: CustomRequest, res: Response) => {
    try{
        const body = req.body;
        const user = req.userObject;

        const data = {
          user: user!.id,
          name: body.name,
          cnpj: body.cnpj,
          email: body.email,
          phone: body.phone,
          inscricaoMunicipal: body.inscricaoMunicipal,
          status: 'active',
          address: {
            street: body.address.street,
            number: body.address.number,
            neighborhood: body.address.neighborhood,
            cityCode: body.address.cityCode,
            city: body.address.city,
            state: body.address.state,
            zipCode: body.address.zipCode,
          },
        };
        const customer = await CustomerService.CreateCustomer(data);
        res.status(200).send({message: 'Cliente cadastrado com sucesso!', customer});

    }catch(error){
    res.status(500).send({
        message: 'Não foi possivel criar conta do cliente',
        error: error,        
    });
    }
}

const findcustomers = async (req: Request, res: Response) => {
  try{
    const customers = await CustomerService.FindCustomer();
    res.status(200).send(customers);
  }catch(error){
    res.status(500).send({message: "Não foi possivel buscar clientes"});
  }
}

const findcustomersactives = async (req: Request, res: Response) => {
  try{
    const customers = await CustomerService.FindCustomerActive();
    res.status(200).send(customers);
  }catch(error){
    res.status(500).send({message: "Não foi possivel buscar clientes ativos"});
  }
}

const deletecustomer = async (req: Request, res: Response) =>{
  try{
    const id = req.params.id;
    await CustomerService.DeleteCustomer(id);
    res.status(200).send({message: "Cliente excluido com sucesso"});
  }catch(error){
    res.status(500).send({message: "Não foi possivel exluir cliente"});
  }
}

const desactivatecustomer = async (req: Request, res: Response) =>{
  try{
    const id = req.params.id;
    const body = req.body;
    const status = body.status;
    
    await CustomerService.DeactivateCustomer(id, status);
    res.status(200).send({message: "Cliente desativado com sucesso"});
  }catch(error){
    res.status(500).send({message: "Não foi possivel desativar cliente"});
  }
}

export default 
{
  create_customer, 
  findcustomers,
  deletecustomer,
  desactivatecustomer,
  findcustomersactives
};