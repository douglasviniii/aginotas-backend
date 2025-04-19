import { Request, Response } from 'express';
import SchedulingService from '../services/SchedulingService.ts';
import NFseService from '../services/NFseService.ts';
import UserService from '../services/UserService.ts';
import CustomerService from '../services/CustomerService.ts';
import SendEmailService from '../services/SendEmailService.ts';
import InvoiceService from '../services/InvoiceService.ts';
import xml2js from 'xml2js';
import { Console } from 'console';
import AdminService from '../services/AdminService.ts';


interface CustomRequest extends Request {
  userid?: string;
  numeroLote?: number;
  identificacaoRpsnumero?: number;
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
        ValorPis: number;
        AliquotaCofins: number;
        RetidoCofins: number;
        ValorCofins: number;
        AliquotaInss: number;
        RetidoInss: number;
        ValorInss: number;
        AliquotaIr: number;
        RetidoIr: number;
        ValorIr: number;
        AliquotaCsll: number;
        RetidoCsll: number;
        ValorCsll: number;
        AliquotaCpp: number;
        RetidoCpp: number;
        ValorCpp: number;
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
        ValorLiquido: number;
      }>;
    };
    Prestador: {
      Cnpj: string;
      InscricaoMunicipal: string;
    };
    Tomador: {
      IdentificacaoTomador: {
        InscricaoMunicipal: string;
        InscricaoEstadual: string;
        CpfCnpj: string;
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

interface GerarNfseEnvioPessoaFisica {
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
        ValorPis: number;
        AliquotaCofins: number;
        RetidoCofins: number;
        ValorCofins: number;
        AliquotaInss: number;
        RetidoInss: number;
        ValorInss: number;
        AliquotaIr: number;
        RetidoIr: number;
        ValorIr: number;
        AliquotaCsll: number;
        RetidoCsll: number;
        ValorCsll: number;
        AliquotaCpp: number;
        RetidoCpp: number;
        ValorCpp: number;
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
        ValorLiquido: number;
      }>;
    };
    Prestador: {
      Cnpj: string;
      InscricaoMunicipal: string;
    };
    Tomador: {
      IdentificacaoTomador: {
        CpfCnpj: string;
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

    console.log(data);

    if(!data){
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
          Discriminacao: data.data.servico.Discriminacao,
          descricao: data.data.servico.descricao,
          item_lista: data.data.servico.item_lista,
          cnae: data.data.servico.cnae,
          quantidade: data.data.servico.quantidade,
          valor_unitario: data.data.servico.valor_unitario,
          desconto: data.data.servico.desconto,
          dateOfCompetence: data.data.servico.dateOfCompetence,
          ValorDeducoes: data.data.servico.ValorDeducoes,
          AliquotaPis: data.data.servico.AliquotaPis,
          RetidoPis: data.data.servico.RetidoPis,
          ValorPis: data.data.servico.ValorPis,
          AliquotaCofins: data.data.servico.AliquotaCofins,
          RetidoCofins: data.data.servico.RetidoCofins,
          ValorCofins: data.data.servico.ValorCofins,
          AliquotaInss: data.data.servico.AliquotaInss,
          RetidoInss: data.data.servico.RetidoInss,
          ValorInss: data.data.servico.ValorInss,
          AliquotaIr: data.data.servico.AliquotaIr, 
          RetidoIr: data.data.servico.RetidoIr,
          ValorIr: data.data.servico.ValorIr,
          AliquotaCsll: data.data.servico.AliquotaCsll,
          RetidoCsll: data.data.servico.RetidoCsll,
          ValorCsll: data.data.servico.ValorCsll,
          AliquotaCpp: data.data.servico.AliquotaCpp,
          RetidoCpp: data.data.servico.RetidoCpp,
          ValorCpp: data.data.servico.ValorCpp,
          RetidoOutrasRetencoes: data.data.servico.RetidoOutrasRetencoes,
          Aliquota: data.data.servico.Aliquota,
          DescontoIncondicionado: data.data.servico.DescontoIncondicionado,
          DescontoCondicionado: data.data.servico.DescontoCondicionado,
          IssRetido: data.data.servico.IssRetido,
        },
      },
      valor: data.valor,          
    } 

    await SchedulingService.CreateSchedulingService(body);
    res.status(200).send({ message: 'Agendamento criado com sucesso!'});

  } catch (error) {
    res.status(500).send({
      message: 'Não foi possivel criar agendamento',
      error: error,
    });
  }
};

const create_scheduling_admin = async (req: CustomRequest, res: Response) => {
  try {
    const data = req.body;

    console.log(data);

    if(!data){
      res.status(400).send({message: 'Dados incompletos'});
      return;
    }

    const body = {
      user_id: data.customer._id, // só o id do user
      user_customer: data.customer, // objeto de user
      admin_id: req.userid,
      billing_day: data.billing_day,
      start_date: data.start_date,
      end_date: data.end_date,
      data: {
        servico: {
          Discriminacao: data.data.servico.Discriminacao,
          descricao: data.data.servico.descricao,
          item_lista: data.data.servico.item_lista,
          cnae: data.data.servico.cnae,
          quantidade: data.data.servico.quantidade,
          valor_unitario: data.data.servico.valor_unitario,
          desconto: data.data.servico.desconto,
          dateOfCompetence: data.data.servico.dateOfCompetence,
          ValorDeducoes: data.data.servico.ValorDeducoes,
          AliquotaPis: data.data.servico.AliquotaPis,
          RetidoPis: data.data.servico.RetidoPis,
          ValorPis: data.data.servico.ValorPis,
          AliquotaCofins: data.data.servico.AliquotaCofins,
          RetidoCofins: data.data.servico.RetidoCofins,
          ValorCofins: data.data.servico.ValorCofins,
          AliquotaInss: data.data.servico.AliquotaInss,
          RetidoInss: data.data.servico.RetidoInss,
          ValorInss: data.data.servico.ValorInss,
          AliquotaIr: data.data.servico.AliquotaIr, 
          RetidoIr: data.data.servico.RetidoIr,
          ValorIr: data.data.servico.ValorIr,
          AliquotaCsll: data.data.servico.AliquotaCsll,
          RetidoCsll: data.data.servico.RetidoCsll,
          ValorCsll: data.data.servico.ValorCsll,
          AliquotaCpp: data.data.servico.AliquotaCpp,
          RetidoCpp: data.data.servico.RetidoCpp,
          ValorCpp: data.data.servico.ValorCpp,
          RetidoOutrasRetencoes: data.data.servico.RetidoOutrasRetencoes,
          Aliquota: data.data.servico.Aliquota,
          DescontoIncondicionado: data.data.servico.DescontoIncondicionado,
          DescontoCondicionado: data.data.servico.DescontoCondicionado,
          IssRetido: data.data.servico.IssRetido,
        },
      },
      valor: data.valor,         
    } 

    await SchedulingService.CreateSchedulingService(body);
    res.status(200).send({ message: 'Agendamento criado com sucesso!'});

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
        const today = new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" });
        const todayDate = new Date(today).getDate();
        return day === todayDate;
      }

      function isWithinSchedule(startDate: string, endDate: string): boolean {
        const today = new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" });
        const todayDate = new Date(today);
        const start = new Date(`${startDate}T00:00:00-03:00`); // Data de início com horário fixo no fuso de São Paulo
        const end = new Date(`${endDate}T23:59:59-03:00`); // Data de fim com horário final do dia no fuso de São Paulo
      
        return todayDate >= start && todayDate <= end;
      }

/*       async function UpdateNumbers(id: string): Promise<DataUpdateObject> {
        const lastInvoice = await InvoiceService.FindLastInvoice(id);
      
        if (!lastInvoice) {
          return { numeroLote: 60, identificacaoRpsnumero:60 };
        }
      
        let numeroLote = lastInvoice.numeroLote + 1;
        let identificacaoRpsnumero = lastInvoice.identificacaoRpsnumero + 1;
        
      
        return { numeroLote, identificacaoRpsnumero };
      } */

        console.log('Agendamento:', schedule);

        console.log('Dia de hoje:', new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
        console.log('Dia de vencimento:', schedule.billing_day);
        console.log('Data de início:', schedule.start_date);
        console.log('Data de fim:', schedule.end_date);
        console.log('Dentro do agendamento:', isWithinSchedule(`${schedule.start_date}`, `${schedule.end_date}`));
        console.log('Hoje é o dia de vencimento:', isTodayDay(Number(schedule.billing_day)));


      if(isTodayDay(Number(schedule.billing_day)) && isWithinSchedule(`${schedule.start_date}`, `${schedule.end_date}`)){
        
        const db_user = await UserService.FindUserByIdService(schedule.user_id);
        const db_customer = await CustomerService.FindCostumerByIdService(schedule.customer_id);

        /* let { numeroLote, identificacaoRpsnumero } = await UpdateNumbers(`${schedule.user_id}`); */

        if(!db_user || !db_customer){
          console.log('Usuário ou cliente não encontrado'); 
          return;
        }

        const date = new Date();
        const options = { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' } as const;
        const formattedDate = new Intl.DateTimeFormat('en-CA', options).format(date);

        //console.log(JSON.stringify(schedule, null, 2));

      if(db_customer.cnpj != 'undefined' && db_customer.cpf === 'undefined'){

        const data: GerarNfseEnvio = {
          Requerente: {
            Cnpj: db_user!.cnpj,
            InscricaoMunicipal: db_user!.inscricaoMunicipal,
            Senha: db_user!.senhaelotech,
            Homologa: db_user!.homologa,
          },
          LoteRps: {
            NumeroLote: db_user.numeroLote.toString(),
            Cnpj: db_user!.cnpj,
            InscricaoMunicipal: db_user!.inscricaoMunicipal,
            QuantidadeRps: 1,
          },
          Rps: {
            IdentificacaoRps: {
              Numero: db_user.identificacaoRpsnumero.toString(),
              Serie: "D",
              Tipo: 1,
            },
            DataEmissao: formattedDate,
            Status: 1,
            Competencia: schedule.data.servico.dateOfCompetence.toString(), /* schedule.data.servico.dateOfCompetence.toString() */
            Servico: {
              Valores: {
              ValorServicos: schedule.data.servico.valor_unitario * schedule.data.servico.quantidade,
              ValorDeducoes: schedule.data.servico.ValorDeducoes || 0,
              AliquotaPis: schedule.data.servico.AliquotaPis || 0,
              RetidoPis: schedule.data.servico.RetidoPis || 2,
              ValorPis: schedule.data.servico.ValorPis || 0,
              AliquotaCofins: schedule.data.servico.AliquotaCofins || 0,
              RetidoCofins: schedule.data.servico.RetidoCofins || 2,
              ValorCofins: schedule.data.servico.ValorCofins || 0,
              AliquotaInss: schedule.data.servico.AliquotaInss || 0,
              RetidoInss: schedule.data.servico.RetidoInss || 2,
              ValorInss: schedule.data.servico.ValorInss || 0,
              AliquotaIr: schedule.data.servico.AliquotaIr || 0, 
              RetidoIr: schedule.data.servico.RetidoIr || 2, 
              ValorIr: schedule.data.servico.ValorIr || 0,
              AliquotaCsll: schedule.data.servico.AliquotaCsll || 0,
              RetidoCsll: schedule.data.servico.RetidoCsll || 2,
              ValorCsll: schedule.data.servico.ValorCsll || 0,
              AliquotaCpp: schedule.data.servico.AliquotaCpp || 0,
              RetidoCpp: schedule.data.servico.RetidoCpp || 2,
              ValorCpp: schedule.data.servico.ValorCpp || 0,
              RetidoOutrasRetencoes: schedule.data.servico.RetidoOutrasRetencoes || 2,
              Aliquota: schedule.data.servico.Aliquota || 2,
              DescontoIncondicionado: schedule.data.servico.DescontoIncondicionado || 0.00,
              DescontoCondicionado: schedule.data.servico.DescontoCondicionado || 0.00,
              },
              IssRetido: 2,
              Discriminacao: schedule.data.servico.Discriminacao,
              CodigoMunicipio: "4115804", // CÓDIGO DE MEDIANEIRA
              ExigibilidadeISS: 1,
              MunicipioIncidencia: "4115804", // CÓDIGO DE MEDIANEIRA
              ListaItensServico: [
          {
            ItemListaServico: (schedule.data.servico.item_lista).toString(),
            CodigoCnae: (schedule.data.servico.cnae).toString(),
            Descricao: schedule.data.servico.descricao,
            Tributavel: 1,
            Quantidade: schedule.data.servico.quantidade,
            ValorUnitario: schedule.data.servico.valor_unitario,
            ValorLiquido:
              schedule.data.servico.valor_unitario * schedule.data.servico.quantidade -
              (schedule.data.servico.desconto || 0),
          },
              ],
            },
            Prestador: {
              Cnpj: db_user!.cnpj,
              InscricaoMunicipal: db_user!.inscricaoMunicipal,
            },
            Tomador: {
              IdentificacaoTomador: {
              CpfCnpj: db_customer.cnpj,
              InscricaoMunicipal: db_customer.inscricaoMunicipal,
              InscricaoEstadual: db_customer.inscricaoEstadual,
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
                          console.log(resposta["ns2:ListaMensagemRetorno"]["ns2:MensagemRetorno"]["ns2:Mensagem"]);
                          return resolve(false);
                      }

                        if (resposta["ns2:ListaMensagemRetornoLote"]) {
                        console.error("Erro no lote da NFS-e:", resposta["ns2:ListaMensagemRetornoLote"]["ns2:MensagemRetorno"]);
                        const mensagens = resposta["ns2:ListaMensagemRetornoLote"]["ns2:MensagemRetorno"];
                        if (Array.isArray(mensagens)) {
                          console.log(mensagens.map((msg: any) => msg["ns2:Mensagem"]).join("; "));
                        } else {
                          console.log(mensagens["ns2:Mensagem"]);
                        }
                        return resolve(false);
                        }

                      return resolve(true);
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
            await UserService.UpdateUser(`${db_user._id}`, {numeroLote: db_user.numeroLote + 1 , identificacaoRpsnumero: db_user.identificacaoRpsnumero + 1});
            console.log("Erro na emissão da NFS-e. Verifique os dados.");
            return;
          }
        
          await InvoiceService.CreateInvoiceService({
            customer: db_customer._id,
            user: db_user._id,
            valor: (schedule.data.servico.valor_unitario * schedule.data.servico.quantidade) - (schedule.data.servico.desconto || 0),
            xml: response,
            data: data,
            numeroLote: /* numeroLote */ db_user.numeroLote,
            identificacaoRpsnumero: /* identificacaoRpsnumero */ db_user.identificacaoRpsnumero,
          });  

          await UserService.UpdateUser(`${db_user._id}`, {numeroLote: db_user.numeroLote + 1 , identificacaoRpsnumero: db_user.identificacaoRpsnumero + 1});
          await SendEmailService.NfseEmitida(`${db_user.email}`); 
          console.log('Nota Fiscal gerada com sucesso!');
          return;
          default:
          console.log("Não atende a cidade informada");
          return;
        } 
      }

      if(db_customer.cpf != 'undefined' && db_customer.cnpj === 'undefined'){
        
        const data: GerarNfseEnvioPessoaFisica = {
          Requerente: {
            Cnpj: db_user!.cnpj,
            InscricaoMunicipal: db_user!.inscricaoMunicipal,
            Senha: db_user!.senhaelotech,
            Homologa: db_user!.homologa,
          },
          LoteRps: {
            NumeroLote: /* numeroLote.toString() */ db_user.numeroLote.toString(),
            Cnpj: db_user!.cnpj,
            InscricaoMunicipal: db_user!.inscricaoMunicipal,
            QuantidadeRps: 1,
          },
          Rps: {
            IdentificacaoRps: {
              Numero: /* identificacaoRpsnumero.toString() */ db_user.identificacaoRpsnumero.toString(),
              Serie: "D",
              Tipo: 1,
            },
            DataEmissao: formattedDate,
            Status: 1,
            Competencia: schedule.data.servico.dateOfCompetence.toString(),
            Servico: {
              Valores: {
                ValorServicos: schedule.data.servico.valor_unitario * schedule.data.servico.quantidade,
                ValorDeducoes: schedule.data.servico.ValorDeducoes || 0,
                AliquotaPis: schedule.data.servico.AliquotaPis || 0,
                RetidoPis: schedule.data.servico.RetidoPis || 2,
                ValorPis: schedule.data.servico.ValorPis || 0,
                AliquotaCofins: schedule.data.servico.AliquotaCofins || 0,
                RetidoCofins: schedule.data.servico.RetidoCofins || 2,
                ValorCofins: schedule.data.servico.ValorCofins || 0,
                AliquotaInss: schedule.data.servico.AliquotaInss || 0,
                RetidoInss: schedule.data.servico.RetidoInss || 2,
                ValorInss: schedule.data.servico.ValorInss || 0,
                AliquotaIr: schedule.data.servico.AliquotaIr || 0, 
                RetidoIr: schedule.data.servico.RetidoIr || 2, 
                ValorIr: schedule.data.servico.ValorIr || 0,
                AliquotaCsll: schedule.data.servico.AliquotaCsll || 0,
                RetidoCsll: schedule.data.servico.RetidoCsll || 2,
                ValorCsll: schedule.data.servico.ValorCsll || 0,
                AliquotaCpp: schedule.data.servico.AliquotaCpp || 0,
                RetidoCpp: schedule.data.servico.RetidoCpp || 2,
                ValorCpp: schedule.data.servico.ValorCpp || 0,
                RetidoOutrasRetencoes: schedule.data.servico.RetidoOutrasRetencoes || 2,
                Aliquota: schedule.data.servico.Aliquota || 2,
                DescontoIncondicionado: schedule.data.servico.DescontoIncondicionado || 0.00,
                DescontoCondicionado: schedule.data.servico.DescontoCondicionado || 0.00,
              },
              IssRetido: 2,
              Discriminacao: schedule.data.servico.Discriminacao,
              CodigoMunicipio: "4115804", // CÓDIGO DE MEDIANEIRA
              ExigibilidadeISS: 1,
              MunicipioIncidencia: "4115804", // CÓDIGO DE MEDIANEIRA
              ListaItensServico: [
          {
            ItemListaServico: (schedule.data.servico.item_lista).toString(),
            CodigoCnae: (schedule.data.servico.cnae).toString(),
            Descricao: schedule.data.servico.descricao,
            Tributavel: 1,
            Quantidade: schedule.data.servico.quantidade,
            ValorUnitario: schedule.data.servico.valor_unitario,
            ValorLiquido:
              schedule.data.servico.valor_unitario * schedule.data.servico.quantidade -
              (schedule.data.servico.desconto || 0),
          },
              ],
            },
            Prestador: {
              Cnpj: db_user!.cnpj,
              InscricaoMunicipal: db_user!.inscricaoMunicipal,
            },
            Tomador: {
              IdentificacaoTomador: {
              CpfCnpj: db_customer.cnpj,
              },
              RazaoSocial: db_customer.razaoSocial,
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
                          console.log(resposta["ns2:ListaMensagemRetorno"]["ns2:MensagemRetorno"]["ns2:Mensagem"]);
                          return resolve(false);
                      }

                        if (resposta["ns2:ListaMensagemRetornoLote"]) {
                        console.error("Erro no lote da NFS-e:", resposta["ns2:ListaMensagemRetornoLote"]["ns2:MensagemRetorno"]);
                        const mensagens = resposta["ns2:ListaMensagemRetornoLote"]["ns2:MensagemRetorno"];
                        if (Array.isArray(mensagens)) {
                          console.log(mensagens.map((msg: any) => msg["ns2:Mensagem"]).join("; "));
                        } else {
                          console.log(mensagens["ns2:Mensagem"]);
                        }
                        return resolve(false);
                        }

                      return resolve(true);
                  } catch (e) {
                      reject(e);
                  }
              });
          });
        }  

        switch (db_user?.cidade) {
          case "Medianeira":
        
          const response = await NFseService.enviarNfsePessoaFisica(data);
          const nfseGerada = await verificarNFSe(response); //Verificar se a Nota foi gerada ou não.
                
          if (!nfseGerada) {
            await UserService.UpdateUser(`${db_user._id}`, {numeroLote: db_user.numeroLote + 1 , identificacaoRpsnumero: db_user.identificacaoRpsnumero + 1});
            console.log("Erro na emissão da NFS-e. Verifique os dados.");
            return;
          }
        
          await InvoiceService.CreateInvoiceService({
            customer: db_customer._id,
            user: db_user._id,
            valor: (schedule.data.servico.valor_unitario * schedule.data.servico.quantidade) - (schedule.data.servico.desconto || 0),
            xml: response,
            data: data,
            numeroLote: db_user.numeroLote,
            identificacaoRpsnumero: db_user.identificacaoRpsnumero,
          });  

          await UserService.UpdateUser(`${db_user._id}`, {numeroLote: db_user.numeroLote + 1 , identificacaoRpsnumero: db_user.identificacaoRpsnumero + 1});
          await SendEmailService.NfseEmitida(`${db_user.email}`); 
          console.log('Nota Fiscal gerada com sucesso!');
          return;
          default:
          console.log("Não atende a cidade informada");
          return;
        } 
      }
    }
    console.log('Nenhum agendamento encontrado!');
    }
  } catch (error) {
    console.log(error);
  }
}

const scheduling_controller_admin = async () =>{
  try {

    const schedulings = await SchedulingService.FindSchedulings();

    for(const schedule of schedulings){

      function isTodayDay(day: number): boolean {
        const today = new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" });
        const todayDate = new Date(today).getDate();
        return day === todayDate;
      }

      function isWithinSchedule(startDate: string, endDate: string): boolean {
        const today = new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" });
        const todayDate = new Date(today);
        const start = new Date(`${startDate}T00:00:00-03:00`); // Data de início com horário fixo no fuso de São Paulo
        const end = new Date(`${endDate}T23:59:59-03:00`); // Data de fim com horário final do dia no fuso de São Paulo
      
        return todayDate >= start && todayDate <= end;
      }


        console.log('Agendamento:', schedule);

        console.log('Dia de hoje:', new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
        console.log('Dia de vencimento:', schedule.billing_day);
        console.log('Data de início:', schedule.start_date);
        console.log('Data de fim:', schedule.end_date);
        console.log('Dentro do agendamento:', isWithinSchedule(`${schedule.start_date}`, `${schedule.end_date}`));
        console.log('Hoje é o dia de vencimento:', isTodayDay(Number(schedule.billing_day)));


      if(isTodayDay(Number(schedule.billing_day)) && isWithinSchedule(`${schedule.start_date}`, `${schedule.end_date}`)){
        
        const db_user = await UserService.FindUserByIdService(schedule.user_id);
        /* const db_customer = await CustomerService.FindCostumerByIdService(schedule.customer_id); */
        const db_admin = await AdminService.FindUserByIdService(schedule.admin_id);


        if(!db_user || !db_admin){
          console.log('Usuário ou cliente não encontrado'); 
          return;
        }

        const date = new Date();
        const options = { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' } as const;
        const formattedDate = new Intl.DateTimeFormat('en-CA', options).format(date);

        //console.log(JSON.stringify(schedule, null, 2));
        const documento1 = db_user.cnpj.replace(/[.\/-]/g, '');
        if(documento1.length === 14){

        const data: GerarNfseEnvio = {
          Requerente: {
            Cnpj: db_admin!.cnpj,
            InscricaoMunicipal: db_admin!.inscricaoMunicipal,
            Senha: db_admin!.senhaelotech,
            Homologa: db_admin!.homologa,
          },
          LoteRps: {
            NumeroLote: db_admin.numeroLote.toString(),
            Cnpj: db_admin!.cnpj,
            InscricaoMunicipal: db_admin!.inscricaoMunicipal,
            QuantidadeRps: 1,
          },
          Rps: {
            IdentificacaoRps: {
              Numero: db_admin.identificacaoRpsnumero.toString(),
              Serie: "D",
              Tipo: 1,
            },
            DataEmissao: formattedDate,
            Status: 1,
            Competencia: schedule.data.servico.dateOfCompetence.toString(), /* schedule.data.servico.dateOfCompetence.toString() */
            Servico: {
              Valores: {
              ValorServicos: schedule.data.servico.valor_unitario * schedule.data.servico.quantidade,
              ValorDeducoes: schedule.data.servico.ValorDeducoes || 0,
              AliquotaPis: schedule.data.servico.AliquotaPis || 0,
              RetidoPis: schedule.data.servico.RetidoPis || 2,
              ValorPis: schedule.data.servico.ValorPis || 0,
              AliquotaCofins: schedule.data.servico.AliquotaCofins || 0,
              RetidoCofins: schedule.data.servico.RetidoCofins || 2,
              ValorCofins: schedule.data.servico.ValorCofins || 0,
              AliquotaInss: schedule.data.servico.AliquotaInss || 0,
              RetidoInss: schedule.data.servico.RetidoInss || 2,
              ValorInss: schedule.data.servico.ValorInss || 0,
              AliquotaIr: schedule.data.servico.AliquotaIr || 0, 
              RetidoIr: schedule.data.servico.RetidoIr || 2, 
              ValorIr: schedule.data.servico.ValorIr || 0,
              AliquotaCsll: schedule.data.servico.AliquotaCsll || 0,
              RetidoCsll: schedule.data.servico.RetidoCsll || 2,
              ValorCsll: schedule.data.servico.ValorCsll || 0,
              AliquotaCpp: schedule.data.servico.AliquotaCpp || 0,
              RetidoCpp: schedule.data.servico.RetidoCpp || 2,
              ValorCpp: schedule.data.servico.ValorCpp || 0,
              RetidoOutrasRetencoes: schedule.data.servico.RetidoOutrasRetencoes || 2,
              Aliquota: schedule.data.servico.Aliquota || 2,
              DescontoIncondicionado: schedule.data.servico.DescontoIncondicionado || 0.00,
              DescontoCondicionado: schedule.data.servico.DescontoCondicionado || 0.00,
              },
              IssRetido: 2,
              Discriminacao: schedule.data.servico.Discriminacao,
              CodigoMunicipio: "4115804", // CÓDIGO DE MEDIANEIRA
              ExigibilidadeISS: 1,
              MunicipioIncidencia: "4115804", // CÓDIGO DE MEDIANEIRA
              ListaItensServico: [
          {
            ItemListaServico: (schedule.data.servico.item_lista).toString(),
            CodigoCnae: (schedule.data.servico.cnae).toString(),
            Descricao: schedule.data.servico.descricao,
            Tributavel: 1,
            Quantidade: schedule.data.servico.quantidade,
            ValorUnitario: schedule.data.servico.valor_unitario,
            ValorLiquido:
              schedule.data.servico.valor_unitario * schedule.data.servico.quantidade -
              (schedule.data.servico.desconto || 0),
          },
              ],
            },
            Prestador: {
              Cnpj: db_admin!.cnpj,
              InscricaoMunicipal: db_admin!.inscricaoMunicipal,
            },
            Tomador: {
              IdentificacaoTomador: {
              CpfCnpj: db_user.cnpj,
              InscricaoMunicipal: db_user.inscricaoMunicipal,
              InscricaoEstadual: '',
              },
              RazaoSocial: db_user.name,
              Endereco: {
              Endereco: schedule.user_customer.Endereco,
              Numero: schedule.user_customer.Numero,
              Bairro: schedule.user_customer.Bairro,
              CodigoMunicipio: schedule.user_customer.CodigoMunicipio,
              Uf: schedule.user_customer.Uf,
              Cep: schedule.user_customer.Cep,
              },
              Contato: {
              Telefone: schedule.user_customer.Telefone,
              Email: schedule.user_customer.Email,
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
                          console.log(resposta["ns2:ListaMensagemRetorno"]["ns2:MensagemRetorno"]["ns2:Mensagem"]);
                          return resolve(false);
                      }

                        if (resposta["ns2:ListaMensagemRetornoLote"]) {
                        console.error("Erro no lote da NFS-e:", resposta["ns2:ListaMensagemRetornoLote"]["ns2:MensagemRetorno"]);
                        const mensagens = resposta["ns2:ListaMensagemRetornoLote"]["ns2:MensagemRetorno"];
                        if (Array.isArray(mensagens)) {
                          console.log(mensagens.map((msg: any) => msg["ns2:Mensagem"]).join("; "));
                        } else {
                          console.log(mensagens["ns2:Mensagem"]);
                        }
                        return resolve(false);
                        }

                      return resolve(true);
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
            await AdminService.UpdateAdmin(`${db_admin._id}`, {numeroLote: db_admin.numeroLote + 1 , identificacaoRpsnumero: db_admin.identificacaoRpsnumero + 1});
            console.log("Erro na emissão da NFS-e. Verifique os dados.");
            return;
          }
        
          await InvoiceService.CreateInvoiceService({
            user: schedule.user_id,
            admin: db_admin?._id,
            valor: (schedule.data.servico.valor_unitario * schedule.data.servico.quantidade) - (schedule.data.servico.desconto || 0),
            xml: response,
            data: data,
            numeroLote: db_admin.numeroLote,
            identificacaoRpsnumero: db_admin.identificacaoRpsnumero,
          });  

          await AdminService.UpdateAdmin(`${db_admin._id}`, {numeroLote: db_admin.numeroLote + 1 , identificacaoRpsnumero: db_admin.identificacaoRpsnumero + 1});
          await SendEmailService.NfseEmitida(`${db_user.email}`); 
          console.log('Nota Fiscal gerada com sucesso!');
          return;
          default:
          console.log("Não atende a cidade informada");
          return;
        } 
        }

        const documento2 = db_user.cnpj.replace(/[.\/-]/g, '');
        if(documento2.length === 11){
        
        const data: GerarNfseEnvioPessoaFisica = {
          Requerente: {
            Cnpj: db_admin!.cnpj,
            InscricaoMunicipal: db_admin!.inscricaoMunicipal,
            Senha: db_admin!.senhaelotech,
            Homologa: db_admin!.homologa,
          },
          LoteRps: {
            NumeroLote: db_admin.numeroLote.toString(),
            Cnpj: db_admin!.cnpj,
            InscricaoMunicipal: db_admin!.inscricaoMunicipal,
            QuantidadeRps: 1,
          },
          Rps: {
            IdentificacaoRps: {
              Numero: db_admin.identificacaoRpsnumero.toString(),
              Serie: "D",
              Tipo: 1,
            },
            DataEmissao: formattedDate,
            Status: 1,
            Competencia: schedule.data.servico.dateOfCompetence.toString(),
            Servico: {
              Valores: {
                ValorServicos: schedule.data.servico.valor_unitario * schedule.data.servico.quantidade,
                ValorDeducoes: schedule.data.servico.ValorDeducoes || 0,
                AliquotaPis: schedule.data.servico.AliquotaPis || 0,
                RetidoPis: schedule.data.servico.RetidoPis || 2,
                ValorPis: schedule.data.servico.ValorPis || 0,
                AliquotaCofins: schedule.data.servico.AliquotaCofins || 0,
                RetidoCofins: schedule.data.servico.RetidoCofins || 2,
                ValorCofins: schedule.data.servico.ValorCofins || 0,
                AliquotaInss: schedule.data.servico.AliquotaInss || 0,
                RetidoInss: schedule.data.servico.RetidoInss || 2,
                ValorInss: schedule.data.servico.ValorInss || 0,
                AliquotaIr: schedule.data.servico.AliquotaIr || 0, 
                RetidoIr: schedule.data.servico.RetidoIr || 2, 
                ValorIr: schedule.data.servico.ValorIr || 0,
                AliquotaCsll: schedule.data.servico.AliquotaCsll || 0,
                RetidoCsll: schedule.data.servico.RetidoCsll || 2,
                ValorCsll: schedule.data.servico.ValorCsll || 0,
                AliquotaCpp: schedule.data.servico.AliquotaCpp || 0,
                RetidoCpp: schedule.data.servico.RetidoCpp || 2,
                ValorCpp: schedule.data.servico.ValorCpp || 0,
                RetidoOutrasRetencoes: schedule.data.servico.RetidoOutrasRetencoes || 2,
                Aliquota: schedule.data.servico.Aliquota || 2,
                DescontoIncondicionado: schedule.data.servico.DescontoIncondicionado || 0.00,
                DescontoCondicionado: schedule.data.servico.DescontoCondicionado || 0.00,
              },
              IssRetido: 2,
              Discriminacao: schedule.data.servico.Discriminacao,
              CodigoMunicipio: "4115804", // CÓDIGO DE MEDIANEIRA
              ExigibilidadeISS: 1,
              MunicipioIncidencia: "4115804", // CÓDIGO DE MEDIANEIRA
              ListaItensServico: [
          {
            ItemListaServico: (schedule.data.servico.item_lista).toString(),
            CodigoCnae: (schedule.data.servico.cnae).toString(),
            Descricao: schedule.data.servico.descricao,
            Tributavel: 1,
            Quantidade: schedule.data.servico.quantidade,
            ValorUnitario: schedule.data.servico.valor_unitario,
            ValorLiquido:
              schedule.data.servico.valor_unitario * schedule.data.servico.quantidade -
              (schedule.data.servico.desconto || 0),
          },
              ],
            },
            Prestador: {
              Cnpj: db_user!.cnpj,
              InscricaoMunicipal: db_user!.inscricaoMunicipal,
            },
            Tomador: {
              IdentificacaoTomador: {
              CpfCnpj: db_user.cnpj,
              },
              RazaoSocial: db_user.name,
              Endereco: {
              Endereco: schedule.user_customer.Endereco,
              Numero: schedule.user_customer.Numero,
              Bairro: schedule.user_customer.Bairro,
              CodigoMunicipio: schedule.user_customer.CodigoMunicipio,
              Uf: schedule.user_customer.Uf,
              Cep: schedule.user_customer.Cep,
              },
              Contato: {
              Telefone: schedule.user_customer.Telefone,
              Email: schedule.user_customer.Email,
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
                          console.log(resposta["ns2:ListaMensagemRetorno"]["ns2:MensagemRetorno"]["ns2:Mensagem"]);
                          return resolve(false);
                      }

                        if (resposta["ns2:ListaMensagemRetornoLote"]) {
                        console.error("Erro no lote da NFS-e:", resposta["ns2:ListaMensagemRetornoLote"]["ns2:MensagemRetorno"]);
                        const mensagens = resposta["ns2:ListaMensagemRetornoLote"]["ns2:MensagemRetorno"];
                        if (Array.isArray(mensagens)) {
                          console.log(mensagens.map((msg: any) => msg["ns2:Mensagem"]).join("; "));
                        } else {
                          console.log(mensagens["ns2:Mensagem"]);
                        }
                        return resolve(false);
                        }

                      return resolve(true);
                  } catch (e) {
                      reject(e);
                  }
              });
          });
        }  

        switch (db_user?.cidade) {
          case "Medianeira":
        
          const response = await NFseService.enviarNfsePessoaFisica(data);
          const nfseGerada = await verificarNFSe(response); //Verificar se a Nota foi gerada ou não.
                
          if (!nfseGerada) {
            await AdminService.UpdateAdmin(`${db_admin?._id}`, {numeroLote: db_admin.numeroLote + 1 , identificacaoRpsnumero: db_admin.identificacaoRpsnumero + 1});
            console.log("Erro na emissão da NFS-e. Verifique os dados.");
            return;
          }
        
          await InvoiceService.CreateInvoiceService({
            user: schedule.user_id,
            admin: db_admin?._id,
            valor: (schedule.data.servico.valor_unitario * schedule.data.servico.quantidade) - (schedule.data.servico.desconto || 0),
            xml: response,
            data: data,
            numeroLote: db_admin.numeroLote,
            identificacaoRpsnumero: db_admin.identificacaoRpsnumero,
          });  

          await AdminService.UpdateAdmin(`${db_admin?._id}`, {numeroLote: db_admin.numeroLote + 1 , identificacaoRpsnumero: db_admin.identificacaoRpsnumero + 1});
          await SendEmailService.NfseEmitida(`${db_user.email}`); 
          console.log('Nota Fiscal gerada com sucesso!');
          return;
          default:
          console.log("Não atende a cidade informada");
          return;
        } 
      }
    }
    console.log('Nenhum agendamento encontrado!');
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
    const id = req.params.id;

    if(!id){
      res.status(400).send({message: 'Dados incompletos'});
      return;
    }

    const schedulings = await SchedulingService.FindSchedulingsByCustomer(id);
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
  find_schedulings_controller,
  create_scheduling_admin,
  scheduling_controller_admin
};