import { Request, Response } from 'express';
import SchedulingService from '../services/SchedulingService.ts';
import NFseService from '../services/NFseService.ts';
import UserService from '../services/UserService.ts';
import SendEmailService from '../services/SendEmailService.ts';

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

const create_scheduling = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    await SchedulingService.CreateSchedulingService(data);
    res.status(201).send({ message: 'Agendamento criado com sucesso!' ,data});
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

      if(isTodayDay(Number(schedule.billing_day)) && isWithinSchedule(`${schedule.start_date}`, `${schedule.end_date}`)){
        console.log(`Gerando nota fiscal para o cliente: ${schedule.customer_id}`);
        const db_user = await UserService.FindUserByIdService(schedule.user_id);

        const date = new Date();
        const formattedDate = date.toLocaleString("pt-BR", { 
          timeZone: "America/Sao_Paulo"
        });

        const dados = {
          numeroLote: '123',
          cnpjPrestador: '12345678000199',
          inscricaoMunicipal: '123456',
          numeroRps: '456',
          dataEmissao: formattedDate,
          valor: 100.0,
          aliquota: 2.0,
          valorIss: 2.0,
          itemListaServico: '01.01',
          descricaoServico: 'Serviço de exemplo',
          codigoMunicipio: '3106200',
          cnpjTomador: '98765432000199',
          razaoTomador: 'Cliente Exemplo Ltda',
          endereco: 'Rua Exemplo, 123',
          numero: '123',
          bairro: 'Centro',
          uf: 'MG',
          cep: '30130000',
          telefone: '31999999999',
          email: 'cliente@exemplo.com'
        };

        //const response = await NFseService.enviarNfse(dados);

        await SendEmailService.SendEmailNFSe(`${schedule.customer_data.email}`, 'nota gerada automaticamente');

        const data = {
          customer: schedule.customer_id,
          user: schedule.user_id,
          content: {
            file: 'nota fiscal pdf',
            value: 20.00,
            date: formattedDate,
            status: 'Entregue',
            link: 'https://www.google.com',
          },
        }

        //await InvoiceService.CreateInvoiceService(data); //salvar no banco de dados

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