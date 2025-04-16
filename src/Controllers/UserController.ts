import { Request, Response } from 'express';
import UserService from '../services/UserService.ts';
import SendEmailService from '../services/SendEmailService.ts';
import bcrypt from "bcrypt";
import PagarmeService from '../services/Pagarme.service.ts';

interface DistribuicaoTributos {
  [key: string]: number;
}

interface Faixa {
  faixa: number;
  receitaBrutaMaxima: number;
  aliquota: number;
  valorADeduzir: number;
  distribuicao: DistribuicaoTributos;
}

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
        cnpj: cnpj.replace(/[^\d]/g, ''),
        email, 
        password,
        estado,
        cidade,
        inscricaoMunicipal,
        
      };
      const user_created = await UserService.CreateUserService(data);
      await SendEmailService.BoasVindas(email);
      res.status(200).send(user_created);
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

        if(Data.email === 'contato@delvind.com'){
          res.status(200).send({ token, userdb });  
          return;
        }

        const subscription = await PagarmeService.GetSubscription(userdb.subscription_id);

         if(!subscription){
          res.status(400).send({message: 'Subscription not found!'});
          return;
        }

        if(subscription.status != 'future' && subscription.status != 'active'){
          res.status(400).send({message: 'Subscription inactive!'});
          return;
        }

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

    const { anexo, receitaBruta12Meses, receitaMes } = req.body;

    const anexos: Record<string, Faixa[]> = {
      "Anexo III": [
        {
          faixa: 1,
          receitaBrutaMaxima: 180000,
          aliquota: 0.06,
          valorADeduzir: 0,
          distribuicao: {
            IRPJ: 0.04,
            CSLL: 0.035,
            Cofins: 0.1282,
            PIS: 0.0278,
            CPP: 0.434,
            ISS: 0.335
          }
        },
        {
          faixa: 2,
          receitaBrutaMaxima: 360000,
          aliquota: 0.112,
          valorADeduzir: 9360,
          distribuicao: {
            IRPJ: 0.043,
            CSLL: 0.035,
            Cofins: 0.125,
            PIS: 0.027,
            CPP: 0.434,
            ISS: 0.336
          }
        },
        {
          faixa: 3,
          receitaBrutaMaxima: 720000,
          aliquota: 0.135,
          valorADeduzir: 17640,
          distribuicao: {
            IRPJ: 0.045,
            CSLL: 0.035,
            Cofins: 0.125,
            PIS: 0.027,
            CPP: 0.434,
            ISS: 0.334
          }
        },
        {
          faixa: 4,
          receitaBrutaMaxima: 1800000,
          aliquota: 0.16,
          valorADeduzir: 35640,
          distribuicao: {
            IRPJ: 0.045,
            CSLL: 0.035,
            Cofins: 0.12,
            PIS: 0.025,
            CPP: 0.42,
            ISS: 0.355
          }
        },
        {
          faixa: 5,
          receitaBrutaMaxima: 3600000,
          aliquota: 0.21,
          valorADeduzir: 125640,
          distribuicao: {
            IRPJ: 0.05,
            CSLL: 0.035,
            Cofins: 0.11,
            PIS: 0.024,
            CPP: 0.375,
            ISS: 0.406
          }
        },
        {
          faixa: 6,
          receitaBrutaMaxima: 4800000,
          aliquota: 0.33,
          valorADeduzir: 648000,
          distribuicao: {
            IRPJ: 0.05,
            CSLL: 0.035,
            Cofins: 0.11,
            PIS: 0.024,
            CPP: 0.255,
            ISS: 0.526
          }
        }
      ],
      "Anexo IV": [
        {
          faixa: 1,
          receitaBrutaMaxima: 180000,
          aliquota: 0.045,
          valorADeduzir: 0,
          distribuicao: {
            IRPJ: 0.28,
            CSLL: 0.13,
            Cofins: 0.289,
            PIS: 0.061,
            INSS: 0.24
          }
        },
        {
          faixa: 2,
          receitaBrutaMaxima: 360000,
          aliquota: 0.09,
          valorADeduzir: 8100,
          distribuicao: {
            IRPJ: 0.28,
            CSLL: 0.13,
            Cofins: 0.289,
            PIS: 0.061,
            INSS: 0.24
          }
        },
        {
          faixa: 3,
          receitaBrutaMaxima: 720000,
          aliquota: 0.102,
          valorADeduzir: 12420,
          distribuicao: {
            IRPJ: 0.28,
            CSLL: 0.13,
            Cofins: 0.289,
            PIS: 0.061,
            INSS: 0.24
          }
        },
        {
          faixa: 4,
          receitaBrutaMaxima: 1800000,
          aliquota: 0.14,
          valorADeduzir: 39780,
          distribuicao: {
            IRPJ: 0.28,
            CSLL: 0.13,
            Cofins: 0.289,
            PIS: 0.061,
            INSS: 0.24
          }
        },
        {
          faixa: 5,
          receitaBrutaMaxima: 3600000,
          aliquota: 0.22,
          valorADeduzir: 183780,
          distribuicao: {
            IRPJ: 0.28,
            CSLL: 0.13,
            Cofins: 0.289,
            PIS: 0.061,
            INSS: 0.24
          }
        },
        {
          faixa: 6,
          receitaBrutaMaxima: 4800000,
          aliquota: 0.33,
          valorADeduzir: 828000,
          distribuicao: {
            IRPJ: 0.28,
            CSLL: 0.13,
            Cofins: 0.289,
            PIS: 0.061,
            INSS: 0.24
          }
        }
      ],
      "Anexo V": [
        {
          faixa: 1,
          receitaBrutaMaxima: 180000,
          aliquota: 0.15,
          valorADeduzir: 0,
          distribuicao: {
            IRPJ: 0.35,
            CSLL: 0.15,
            Cofins: 0.16,
            PIS: 0.035,
            CPP: 0.3
          }
        },
        {
          faixa: 2,
          receitaBrutaMaxima: 360000,
          aliquota: 0.18,
          valorADeduzir: 4500,
          distribuicao: {
            IRPJ: 0.35,
            CSLL: 0.15,
            Cofins: 0.16,
            PIS: 0.035,
            CPP: 0.3
          }
        },
        {
          faixa: 3,
          receitaBrutaMaxima: 720000,
          aliquota: 0.195,
          valorADeduzir: 9900,
          distribuicao: {
            IRPJ: 0.35,
            CSLL: 0.15,
            Cofins: 0.16,
            PIS: 0.035,
            CPP: 0.3
          }
        },
        {
          faixa: 4,
          receitaBrutaMaxima: 1800000,
          aliquota: 0.21,
          valorADeduzir: 17100,
          distribuicao: {
            IRPJ: 0.35,
            CSLL: 0.15,
            Cofins: 0.16,
            PIS: 0.035,
            CPP: 0.3
          }
        },
        {
          faixa: 5,
          receitaBrutaMaxima: 3600000,
          aliquota: 0.23,
          valorADeduzir: 62100,
          distribuicao: {
            IRPJ: 0.35,
            CSLL: 0.15,
            Cofins: 0.16,
            PIS: 0.035,
            CPP: 0.3
          }
        },
        {
          faixa: 6,
          receitaBrutaMaxima: 4800000,
          aliquota: 0.305,
          valorADeduzir: 540000,
          distribuicao: {
            IRPJ: 0.35,
            CSLL: 0.15,
            Cofins: 0.16,
            PIS: 0.035,
            CPP: 0.3
          }
        }
      ]
    }

    async function calcularTributacaoSimplesNacional(
      anexo: keyof typeof anexos,
      receitaBruta12Meses: number,
      receitaMes: number
    ) {
      const faixas = anexos[anexo];
      const faixa = faixas.find(f => receitaBruta12Meses <= f.receitaBrutaMaxima);
    
      if (!faixa) {
        throw new Error("Receita bruta fora do limite do Simples Nacional.");
      }
    
      const { aliquota, valorADeduzir, distribuicao } = faixa;
      const aliquotaEfetiva = (receitaBruta12Meses * aliquota - valorADeduzir) / receitaBruta12Meses;
      const totalTributos = receitaMes * aliquotaEfetiva;
    
      const distribuicaoPorImposto: DistribuicaoTributos = {};
      Object.entries(distribuicao).forEach(([imposto, percentual]) => {
        distribuicaoPorImposto[imposto] = Number((totalTributos * percentual).toFixed(2));
      });
    
      return {
        faixa: faixa.faixa,
        receitaBruta12Meses,
        receitaMes,
        aliquotaNominal: aliquota,
        valorADeduzir,
        aliquotaEfetiva: Number(aliquotaEfetiva.toFixed(4)),
        totalTributos: Number(totalTributos.toFixed(2)),
        distribuicaoPorImposto
      };
    }
    
    const resultado = await calcularTributacaoSimplesNacional(anexo, receitaBruta12Meses, receitaMes);

    res.status(200).send(resultado);
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
