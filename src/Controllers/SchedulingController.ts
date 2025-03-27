import { Request, Response } from 'express';
import SchedulingService from '../services/SchedulingService.ts';
import NFseService from '../services/NFseService.ts';
import UserService from '../services/UserService.ts';
import CustomerService from '../services/CustomerService.ts';
import SendEmailService from '../services/SendEmailService.ts';
import InvoiceService from '../services/InvoiceService.ts';


interface Dados {
  cnpj: string;
  inscricaoMunicipal: number;
  senha: string;
  ambiente: string;
  numeroLote: number;
  numeroRps: number;
  competencia: string;
  valorServico: number;
  aliquota: number;
  valorIss: number;
  discriminacao: string;
  codigoMunicipio: number;
  cpfCliente: string;
  nomeCliente: string;
  enderecoCliente: string;
  numeroEnderecoCliente: string;
  complementoEnderecoCliente: string;
  bairroCliente: string;
  codigoMunicipioCliente: number;
  ufCliente: string;
  cepCliente: string;
  telefoneCliente: string;
  emailCliente: string;
}

interface CustomRequest extends Request {
  userid?: string;
}

interface DataUpdateObject {
  numeroLote: number;
  identificacaoRpsnumero: number;
}

const create_scheduling = async (req: CustomRequest, res: Response) => {
  try {
    const data = req.body;

    if(!data.customer_id || !data.billing_day || !data.start_date || !data.end_date || !data.servico || !data.tributacao || !data.valor){
      res.status(400).send({message: 'Dados incompletos'});
      return;
    }

    const body = {
      customer_id: data.customer_id,
      user_id: req.userid,
      billing_day: data.billing_day,
      start_date: data.start_date,
      end_date: data.end_date,
      data: {
        servico: {
          Discriminacao: data.servico.Discriminacao,
          descricao: data.servico.descricao,
          item_lista: data.servico.item_lista,
          cnae: data.servico.cnae,
          quantidade: data.servico.quantidade,
          valor_unitario: data.servico.valor_unitario,
          desconto: data.servico.desconto,
        },
        tributacao: {
          iss_retido: data.tributacao.iss_retido, 
          aliquota_iss: data.tributacao.aliquota_iss, 
          retencoes: {
            irrf: data.tributacao.retencoes.irrf, 
            pis: data.tributacao.retencoes.pis,
            cofins: data.tributacao.retencoes.cofins,            
          }
        }
      },
      valor: data.valor,          
    } 

    await SchedulingService.CreateSchedulingService(body);
    res.status(200).send({ message: 'Agendamento criado com sucesso!' ,data});
  } catch (error) {
    res.status(500).send({
      message: 'Não foi possivel criar agendamento',
      error: error,
    });
  }
};

const scheduling_controller = async () =>{
  try {

    const schedulings = await SchedulingService.FindSchedulings();

    for(const schedule of schedulings){

      function isTodayDay(day: number): boolean {
        const today = new Date().getDate();
        return day === today;
      }

      function isWithinSchedule(startDate: string, endDate: string): boolean {
        const today = new Date(); 
        const start = new Date(`${startDate}T00:00:00`); // Data de início com horário fixo
        const end = new Date(`${endDate}T23:59:59`); // Data de fim com horário final do dia
      
        return today >= start && today <= end;
      }

      async function UpdateNumbers(id: string): Promise<DataUpdateObject> {
        const lastInvoice = await InvoiceService.FindLastInvoice(id);
      
        if (!lastInvoice) {
          return { numeroLote: 1, identificacaoRpsnumero:1 };
        }
      
        let numeroLote = lastInvoice.numeroLote + 1;
        let identificacaoRpsnumero = lastInvoice.identificacaoRpsnumero + 1;
        
      
        return { numeroLote, identificacaoRpsnumero };
      }

      if(isTodayDay(Number(schedule.billing_day)) && isWithinSchedule(`${schedule.start_date}`, `${schedule.end_date}`)){
        
        const db_user = await UserService.FindUserByIdService(schedule.user_id);
        const db_customer = await CustomerService.FindCostumerByIdService(schedule.customer_id);
        let { numeroLote, identificacaoRpsnumero } = await UpdateNumbers(`${schedule.user_id}`);

        if(!db_user || !db_customer){
          console.log('Usuário ou cliente não encontrado'); 
          return;
        }

        //await SendEmailService.SendEmailNFSe(`${'email'}`, 'nota gerada automaticamente');
      }
    }
  } catch (error) {
    console.log(error);
  }
}

const cancel_schedule_controller = async (req: Request, res: Response) =>{
  try {
    const id = req.params.id;
    await SchedulingService.DeleteScheduleService(id);
    res.status(201).send({ message: 'Agendamento cancelado com sucesso!'});
  } catch (error) {
    res.status(500).send({
      message: 'Não foi possivel cancelar agendamento',
      error: error,
    });    
  }
}

const find_schedulings_controller = async (req: Request, res: Response) =>{
  try{
    const schedulings = await SchedulingService.FindSchedulings();
    res.status(200).send(schedulings);
  }catch(error){
    res.status(500).send({message: "Não foi possivel buscar agendamentos"});
  }
}

export default 
{ 
  create_scheduling, 
  scheduling_controller,
  cancel_schedule_controller,
  find_schedulings_controller
};