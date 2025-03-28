import { Request, Response } from 'express';
import SchedulingService from '../services/SchedulingService.ts';
import NFseService from '../services/NFseService.ts';
import UserService from '../services/UserService.ts';
import CustomerService from '../services/CustomerService.ts';
import SendEmailService from '../services/SendEmailService.ts';
import InvoiceService from '../services/InvoiceService.ts';
import xml2js from 'xml2js';


interface CustomRequest extends Request {
  userid?: string;
}

interface DataUpdateObject {
  numeroLote: number;
  identificacaoRpsnumero: number;
}

interface GerarNfseEnvio {
  Requerente: {
    Cnpj: string;
    InscricaoMunicipal: string;
    Senha: string;
    Homologa: boolean;
  };
  LoteRps: {
    NumeroLote: string;
    Cnpj: string;
    InscricaoMunicipal: string;
    QuantidadeRps: number;
  };
  Rps: {
    IdentificacaoRps: {
      Numero: string;
      Serie: string;
      Tipo: number;
    };
    DataEmissao: string;
    Status: number;
    Competencia: string;
    Servico: {
      Valores: {
        ValorServicos: number;
        ValorDeducoes: number;
        AliquotaPis: number;
        RetidoPis: number;
        AliquotaCofins: number;
        RetidoCofins: number;
        AliquotaInss: number;
        RetidoInss: number;
        AliquotaIr: number;
        RetidoIr: number;
        AliquotaCsll: number;
        RetidoCsll: number;
        RetidoCpp: number;
        RetidoOutrasRetencoes: number;
        Aliquota: number;
        DescontoIncondicionado: number;
        DescontoCondicionado: number;
      };
      IssRetido: number;
      Discriminacao: string;
      CodigoMunicipio: string;
      ExigibilidadeISS: number;
      MunicipioIncidencia: string;
      ListaItensServico: Array<{
        ItemListaServico: string;
        CodigoCnae: string;
        Descricao: string;
        Tributavel: number;
        Quantidade: number;
        ValorUnitario: number;
        ValorDesconto: number;
        ValorLiquido: number;
        DadosDeducao?: {
          TipoDeducao: string;
          Cpf: string;
          ValorTotalNotaFiscal: number;
          ValorADeduzir: number;
        };
      }>;
    };
    Prestador: {
      Cnpj: string;
      InscricaoMunicipal: string;
    };
    Tomador: {
      IdentificacaoTomador: {
        Cnpj: string;
      };
      RazaoSocial: string;
      Endereco: {
        Endereco: string;
        Numero: string;
        Bairro: string;
        CodigoMunicipio: string;
        Uf: string;
        Cep: string;
      };
      Contato: {
        Telefone: string;
        Email: string;
      };
    };
    RegimeEspecialTributacao: number;
    IncentivoFiscal: number;
  };
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

        const date = new Date();
        const year = date.getFullYear(); 
        const month = String(date.getMonth() + 1).padStart(2, '0'); 
        const day = String(date.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;

        const data: GerarNfseEnvio = {
          Requerente: {
                    Cnpj: db_user!.cnpj,  
                    InscricaoMunicipal: db_user!.inscricaoMunicipal, 
                    Senha: db_user!.senhaelotech,
                    Homologa: db_user!.homologa 
           },
          LoteRps: {
                    NumeroLote: numeroLote.toLocaleString(),
                    Cnpj: db_user!.cnpj,
                    InscricaoMunicipal: db_user!.inscricaoMunicipal, 
                    QuantidadeRps: 1,
          },
          Rps: {
                    IdentificacaoRps: {
                      Numero: identificacaoRpsnumero.toLocaleString(),
                      Serie: "D",
                      Tipo: 1,
                    },
                    DataEmissao: formattedDate,
                    Status: 1,
                    Competencia: formattedDate,
                    Servico: {
                      Valores: {
                        ValorServicos: schedule.data.valor_unitario * schedule.data.quantidade,
                        ValorDeducoes: 0,
                        AliquotaPis: 0,
                        RetidoPis: 2,
                        AliquotaCofins: 0,
                        RetidoCofins: 2,
                        AliquotaInss: 0,
                        RetidoInss: 2,
                        AliquotaIr: 0, 
                        RetidoIr: 2, 
                        AliquotaCsll: 0,
                        RetidoCsll: 2,
                        RetidoCpp: 2,
                        RetidoOutrasRetencoes: 2,
                        Aliquota: 4.41,
                        DescontoIncondicionado: 0.00,
                        DescontoCondicionado: 0.00,
                      },
                      IssRetido: 2, 
                      Discriminacao: String(schedule.data.Discriminacao),
                      CodigoMunicipio: db_customer.address.cityCode,
                      ExigibilidadeISS: 1,
                      MunicipioIncidencia: db_customer.address.cityCode,
                      ListaItensServico: [
                        {
                          ItemListaServico: String(schedule.data.item_lista),
                          CodigoCnae: String(schedule.data.cnae),
                          Descricao: String(schedule.data.descricao),
                          Tributavel: 1,
                          Quantidade: schedule.data.quantidade,
                          ValorUnitario: schedule.data.valor_unitario,
                          ValorDesconto: schedule.data.desconto, 
                          ValorLiquido: (schedule.data.valor_unitario * schedule.data.quantidade) - (schedule.data.desconto || 0), 
                        },
                      ],
                    },
                    Prestador: {
                      Cnpj: db_user!.cnpj,  
                      InscricaoMunicipal: db_user!.inscricaoMunicipal, 
                    },
                    Tomador: {
                      IdentificacaoTomador: {
                        Cnpj: db_customer.cnpj,
                      },
                      RazaoSocial: db_customer.name,
                      Endereco: {
                        Endereco: db_customer.address.street,
                        Numero: db_customer.address.number,
                        Bairro: db_customer.address.neighborhood,
                        CodigoMunicipio: db_customer.address.cityCode,
                        Uf: db_customer.address.state,
                        Cep: db_customer.address.zipCode,
                      },
                      Contato: {
                        Telefone: db_customer.phone,
                        Email: db_customer.email,
                      },
                    },
                    RegimeEspecialTributacao: db_user!.RegimeEspecialTributacao,
                    IncentivoFiscal: db_user!.IncentivoFiscal,
          },
        };
        
        async function verificarNFSe(xml: any) {
                  return new Promise((resolve, reject) => {
                      xml2js.parseString(xml, { explicitArray: false }, (err, result) => {
                          if (err) return reject(err);
              
                          try {
                              const body = result["SOAP-ENV:Envelope"]["SOAP-ENV:Body"];
                              const resposta = body["ns2:EnviarLoteRpsSincronoResposta"];
              
                              if (resposta["ns2:ListaMensagemRetorno"]) {
                                  console.error("Erro na geração da NFS-e:", resposta["ns2:ListaMensagemRetorno"]["ns2:MensagemRetorno"]);
                                  return resolve(false);
                              }
        
                              if (resposta["ns2:Nfse"]) {
                                  return resolve(true);
                              }
              
                              resolve(false); 
                          } catch (e) {
                              reject(e);
                          }
                      });
                  });
        }  

        switch (db_user?.cidade) {
          case "Medianeira":
        
          const response = await NFseService.enviarNfse(data);
          const nfseGerada = await verificarNFSe(response); //Verificar se a Nota foi gerada ou não.
                
          if (!nfseGerada) {
            console.log("Erro na emissão da NFS-e. Verifique os dados.");
            return;
          }
        
          await InvoiceService.CreateInvoiceService({
            customer: db_customer._id,
            user: db_user._id,
            valor: (schedule.data.valor_unitario * schedule.data.quantidade) - (schedule.data.desconto || 0),
            xml: response,
            data: data,
            numeroLote: numeroLote,
            identificacaoRpsnumero: identificacaoRpsnumero,
          });  

          await SendEmailService.SendEmailNFSe(`${db_customer.email}`, 'nota gerada automaticamente'); 

          console.log('Nota Fiscal gerada com sucesso!');
          break;
          default:
          console.log("Não atende a cidade informada");
          return;
        } 
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