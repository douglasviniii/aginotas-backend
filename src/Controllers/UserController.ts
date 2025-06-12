import { Request, Response } from 'express';
import UserService from '../services/UserService.ts';
import SendEmailService from '../services/SendEmailService.ts';
import bcrypt from "bcrypt";
import PagarmeService from '../services/Pagarme.service.ts';

type Anexo = 'III' | 'IV' | 'V';

interface Faixa {
  limiteInferior: number;
  limiteSuperior: number;
  aliquota: number;
  distribuicao: Record<string, number>;
}

interface User {
  id_client_pagarme: string;
  name: string;
  code:string;
  cnpj: string;
  email: string;
  password: string;
  estado: string;
  cidade: string;
  selectedCity: string;
  selectedState: string;
  inscricaoMunicipal: string;
  address:{
    line_1: string;
    line_2: string;
    zip_code: string;    
  }
  telefone:{
    country_code: string, 
    area_code: string, 
    number:string
  }
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

const create_user = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const response = await PagarmeService.CreateClient(data);

     if(response.id){
      const body = {
        id_client_pagarme: response.id, 
        name: data.name, 
        cnpj: data.cnpj.replace(/[^\d]/g, ''),
        email: data.email, 
        password: data.password,
        address: data.address,
        phones: data.telefone,
        estado: data.selectedState,
        cidade: data.selectedCity,
        inscricaoMunicipal: data.municipalRegistration,
        
      };
      const user_created = await UserService.CreateUserService(body);
      await SendEmailService.BoasVindas(data.email);
      res.status(200).send(user_created);
      return;
    }
    res.status(400).send({ message: 'Ocorreu um erro ao criar a conta do usuário!' });
    return
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
           res.status(404).send("Email ou senha inválidos");
           return;
        }
    
        if (!user) {
          res.status(404).send("Email ou senha inválidos");
          return;
        }
    
        const token = await UserService.GeradorDeToken(user.id);
        const userdb = await UserService.FindUserByIdService(user.id);

        if(!userdb){
          res.status(400).send({message: 'User not found!'});
          return;
        }

        if(userdb.status != 'active'){
          res.status(400).send({message: 'User not active!'});
          return;
        } 

/*         if(Data.email === 'contato@delvind.com' || Data.email === 'escritorio@delfoscontabilidade.com'){
          res.status(200).send({ token, userdb });  
          return;
        } */

        const subscription = await PagarmeService.GetSubscription(userdb.subscription_id);

         if(!subscription){
          res.status(400).send({message: 'Subscription not found!'});
          return;
        }

        if(subscription.status != 'future' && subscription.status != 'active'){
          res.status(400).send({message: 'Subscription inactive!'});
          return;
        }

        //res.status(200).send({ token, userdb }); 

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

const Update_User_byID = async (req: CustomRequest, res: Response) =>{
  try {
    const data = req.body;
    const id = req.params.id;

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

const Calcular_Tributos = async (req: Request, res: Response) =>{
  try {

    const {anexo, receitaBruta12Meses} = req.body;

    const tabelas: Record<Anexo, Faixa[]> = {
      III: [
        {
          limiteInferior: 0,
          limiteSuperior: 180_000,
          aliquota: 6,
          distribuicao: {
            IRPJ: 4,
            CSLL: 3.5,
            COFINS: 12.82,
            PIS: 2.78,
            CPP: 43.4,
            ISS: 33.5,
          },
        },
        {
          limiteInferior: 180_000.01,
          limiteSuperior: 360_000,
          aliquota: 11.2,
          distribuicao: {
            IRPJ: 4,
            CSLL: 3.5,
            COFINS: 14.05,
            PIS: 3.05,
            CPP: 43.4,
            ISS: 32,
          },
        },
        {
          limiteInferior: 360_000.01,
          limiteSuperior: 720_000,
          aliquota: 13.5,
          distribuicao: {
            IRPJ: 4,
            CSLL: 3.5,
            COFINS: 13.64,
            PIS: 2.96,
            CPP: 43.4,
            ISS: 32.5,
          },
        },
        {
          limiteInferior: 720_000.01,
          limiteSuperior: 1_800_000,
          aliquota: 16,
          distribuicao: {
            IRPJ: 4,
            CSLL: 3.5,
            COFINS: 13.64,
            PIS: 2.96,
            CPP: 43.4,
            ISS: 32.5,
          },
        },
        {
          limiteInferior: 1_800_000.01,
          limiteSuperior: 3_600_000,
          aliquota: 21,
          distribuicao: {
            IRPJ: 4,
            CSLL: 3.5,
            COFINS: 12.82,
            PIS: 2.78,
            CPP: 43.4,
            ISS: 33.5,
          },
        },
        {
          limiteInferior: 3_600_000.01,
          limiteSuperior: 4_800_000,
          aliquota: 33,
          distribuicao: {
            IRPJ: 35,
            CSLL: 15,
            COFINS: 16.03,
            PIS: 3.47,
            CPP: 30.5,
            ISS: 0,
          },
        },
      ],
      IV: [
        {
          limiteInferior: 0,
          limiteSuperior: 180_000,
          aliquota: 4.5,
          distribuicao: {
            IRPJ: 18.8,
            CSLL: 15.2,
            COFINS: 17.67,
            PIS: 3.83,
            ISS: 44.5,
          },
        },
        {
          limiteInferior: 180_000.01,
          limiteSuperior: 360_000,
          aliquota: 9,
          distribuicao: {
            IRPJ: 19.8,
            CSLL: 15.2,
            COFINS: 20.55,
            PIS: 4.45,
            ISS: 40,
          },
        },
        {
          limiteInferior: 360_000.01,
          limiteSuperior: 720_000,
          aliquota: 10.2,
          distribuicao: {
            IRPJ: 20.8,
            CSLL: 15.2,
            COFINS: 19.73,
            PIS: 4.27,
            ISS: 40,
          },
        },
        {
          limiteInferior: 720_000.01,
          limiteSuperior: 1_800_000,
          aliquota: 14,
          distribuicao: {
            IRPJ: 17.8,
            CSLL: 19.2,
            COFINS: 18.9,
            PIS: 4.1,
            ISS: 40,
          },
        },
        {
          limiteInferior: 1_800_000.01,
          limiteSuperior: 3_600_000,
          aliquota: 22,
          distribuicao: {
            IRPJ: 18.8,
            CSLL: 19.2,
            COFINS: 18.08,
            PIS: 3.92,
            ISS: 40,
          },
        },
        {
          limiteInferior: 3_600_000.01,
          limiteSuperior: 4_800_000,
          aliquota: 33,
          distribuicao: {
            IRPJ: 53.5,
            CSLL: 21.5,
            COFINS: 20.55,
            PIS: 4.45,
            ISS: 0,
          },
        },
      ],
      V: [
        {
          limiteInferior: 0,
          limiteSuperior: 180_000,
          aliquota: 15.5,
          distribuicao: {
            IRPJ: 25,
            CSLL: 15,
            COFINS: 14.1,
            PIS: 3.05,
            CPP: 28.85,
            ISS: 14,
          },
        },
        {
          limiteInferior: 180_000.01,
          limiteSuperior: 360_000,
          aliquota: 18,
          distribuicao: {
            IRPJ: 23,
            CSLL: 15,
            COFINS: 14.1,
            PIS: 3.05,
            CPP: 27.85,
            ISS: 17,
          },
        },
        {
          limiteInferior: 360_000.01,
          limiteSuperior: 720_000,
          aliquota: 19.5,
          distribuicao: {
            IRPJ: 24,
            CSLL: 15,
            COFINS: 14.92,
            PIS: 3.23,
            CPP: 23.85,
            ISS: 19,
          },
        },
        {
          limiteInferior: 720_000.01,
          limiteSuperior: 1_800_000,
          aliquota: 20.5,
          distribuicao: {
            IRPJ: 21,
            CSLL: 15,
            COFINS: 15.74,
            PIS: 3.41,
            CPP: 23.85,
            ISS: 21,
          },
        },
        {
          limiteInferior: 1_800_000.01,
          limiteSuperior: 3_600_000,
          aliquota: 23,
          distribuicao: {
            IRPJ: 23,
            CSLL: 12.5,
            COFINS: 14.1,
            PIS: 3.05,
            CPP: 23.85,
            ISS: 23.5,
          },
        },
        {
          limiteInferior: 3_600_000.01,
          limiteSuperior: 4_800_000,
          aliquota: 30.5,
          distribuicao: {
            IRPJ: 35,
            CSLL: 15.5,
            COFINS: 16.44,
            PIS: 3.56,
            CPP: 29.5,
            ISS: 0,
          },
        },
      ],
    };
    
    async function calcularTributacaoSimplesNacional(anexo: Anexo, receitaBruta12Meses: number) {
      const faixas = tabelas[anexo];
    
      const faixa = faixas.find(f =>
        receitaBruta12Meses >= f.limiteInferior && receitaBruta12Meses <= f.limiteSuperior
      );
    
      if (!faixa) throw new Error('Receita fora das faixas do Simples Nacional');
    
      return {
        aliquotaEfetiva: faixa.aliquota,
        distribuicao: faixa.distribuicao,
      };
    }
    const response = await calcularTributacaoSimplesNacional(anexo,receitaBruta12Meses)

    res.status(200).send(response);
  } catch (error) {
    res.status(500).send({message: 'Internal server error'});
    return;
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
  FindAllUser,
  Calcular_Tributos,
  Update_User_byID
};
