import { Request, Response } from 'express';
import InvoiceService from '../services/InvoiceService.ts';
import NFseService from '../services/NFseService.ts';
import SendEmailService from '../services/SendEmailService.ts';
import UserService from '../services/UserService.ts';
import AdminService from '../services/AdminService.ts';
import CustomerService from '../services/CustomerService.ts'
import xml2js from 'xml2js';
import { readFile, writeFile } from "fs/promises";
import path from "path";
import puppeteer from "puppeteer";
import {JSDOM} from 'jsdom';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import * as pdf from 'html-pdf-node';
import QRCode from 'qrcode';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface CustomRequest extends Request {
    userObject?: {
      id: string;
      name: string;
      cnpj: string;
      inscricaoMunicipal: string;
      email: string;
      cidade: string;
      senhaelotech: string;
      homologa: boolean;
      IncentivoFiscal: number;
      RegimeEspecialTributacao: number;
      numeroLote: number;
      identificacaoRpsnumero: number;

    }; 
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


interface DataConsultaNFSE{
  NumeroRps: string;
  SerieRps: string;
  TipoRps: number;
  CnpjCpf: string;
  InscricaoMunicipal: string;
  Senha: string;
  Homologa: boolean;
}
interface DataCancelarNfseEnvio{
  IdInvoice: string;
  CpfCnpj: string;
  InscricaoMunicipal: string;
  Senha: string;
  Homologa: boolean;
  NumeroNfse: string;
  CpfCnpjNfse: string;
  InscricaoMunicipalNfse: string;
  CodigoMunicipioNfse: string;
  ChaveAcesso: string;
  CodigoCancelamento: number;
}

interface SubstituirNfseEnvio {
  IdentificacaoRequerente: {
    CpfCnpj: {
      Cnpj: string;
      Cpf?: string;
    };
    InscricaoMunicipal: string;
    Senha: string;
    Homologa: boolean;
  };
  Pedido: {
    InfPedidoCancelamento: {
      Id: string;
      IdentificacaoNfse: {
        Numero: string;
        CpfCnpj: {
          Cnpj: string;
          Cpf?: string; // Opcional caso seja CPF
        };
        InscricaoMunicipal: string;
        CodigoMunicipio: string;
      };
      ChaveAcesso: string;
      CodigoCancelamento: number; // 1 para substituição
      MotivoCancelamento?: string; // Opcional
    };
  };
  Rps: {
    InfDeclaracaoPrestacaoServico: {
      Id: string;
      Rps: {
        IdentificacaoRps: {
          Numero: string;
          Serie: string;
          Tipo: number; // 1-RPS, 2-NFSe conjugada, 3-Cupom
        };
        DataEmissao: string; // Formato ISO 8601 (YYYY-MM-DD)
        Status: number; // 1-Normal, 2-Cancelado
      };
      Competencia: string; // Formato YYYY-MM
      Servico: {
        Valores: {
          ValorServicos: number;
          ValorDeducoes: number;
          AliquotaPis: number;
          RetidoPis: number; // 1-Sim, 2-Não
          ValorPis: number;
          AliquotaCofins: number;
          RetidoCofins: number; // 1-Sim, 2-Não
          ValorCofins: number;
          AliquotaInss: number;
          RetidoInss: number; // 1-Sim, 2-Não
          ValorInss: number;
          AliquotaIr: number;
          RetidoIr: number; // 1-Sim, 2-Não
          ValorIr: number;
          AliquotaCsll: number;
          RetidoCsll: number; // 1-Sim, 2-Não
          ValorCsll: number;
          AliquotaCpp: number;
          RetidoCpp: number; // 1-Sim, 2-Não
          ValorCpp: number;
          RetidoOutrasRetencoes: number;
          Aliquota: number;
          DescontoIncondicionado: number;
          DescontoCondicionado: number;
        };
        IssRetido: number; // 1-Sim, 2-Não
        Discriminacao: string;
        CodigoMunicipio: string; // Código IBGE
        ExigibilidadeISS: number; // 1-Exigível, 2-Não incidência, 3-Isenção, etc.
        MunicipioIncidencia?: string; // Opcional - Código IBGE
        ListaItensServico: Array<{
          ItemListaServico: string; // Código do serviço
          CodigoCnae?: string; // Opcional
          Descricao: string;
          Tributavel: number; // 1-Sim, 2-Não
          Quantidade: number;
          ValorUnitario: number;
          ValorLiquido: number;
        }>;
      };
      Prestador: {
        CpfCnpj: {
          Cnpj: string;
          Cpf?: string; // Opcional caso seja CPF
        };
        InscricaoMunicipal: string;
      };
      Tomador: {
        IdentificacaoTomador: {
          CpfCnpj: {
            Cnpj?: string;
            Cpf?: string; // Um dos dois deve estar presente
          };
          InscricaoMunicipal?: string; // Opcional
          InscricaoEstadual?: string; // Opcional
        };
        RazaoSocial: string;
        Endereco: {
          Endereco: string;
          Numero: string;
          Complemento?: string; // Opcional
          Bairro: string;
          CodigoMunicipio: string; // Código IBGE
          Uf: string;
          Cep: string;
        };
        Contato: {
          Telefone?: string; // Opcional
          Email?: string; // Opcional
        };
      };
      RegimeEspecialTributacao?: number; // Opcional - 1-Microempresa municipal, 2-Estimativa, etc.
      IncentivoFiscal?: number; // Opcional - 1-Sim, 2-Não
      OutrasInformacoes?: string; // Opcional
    };
  };
  LoteRps?: { // Opcional para casos de envio em lote
    NumeroLote: string;
    Cnpj: string;
    InscricaoMunicipal: string;
    QuantidadeRps: number;
  };
}



interface DataSubstituirNfse {
  IdentificacaoRequerente: {
    CpfCnpj: {
      Cnpj: string;
    };
    InscricaoMunicipal: string;
    Senha: string;
    Homologa: boolean;
  };
  Pedido: {
    InfPedidoCancelamento: {
      IdentificacaoNfse: {
        Numero: string;
        CpfCnpj: {
          Cnpj: string;
        };
        InscricaoMunicipal: string;
        CodigoMunicipio: string;
      };
      ChaveAcesso: string;
      CodigoCancelamento: number;
    };
  };
  DeclaracaoPrestacaoServico: {
    InfDeclaracaoPrestacaoServico: {
      Rps: {
        IdentificacaoRps: {
          Numero: string;
          Serie: string;
          Tipo: number;
        };
        DataEmissao: string;
        Status: number;
      };
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
          Aliquota: number;
          DescontoIncondicionado: number;
          DescontoCondicionado: number;
          RetidoOutrasRetencoes: number;
        };
        IssRetido: number;
        Discriminacao: string;
        CodigoNbs: string;
        CodigoMunicipio: string;
        ExigibilidadeISS: number;
        MunicipioIncidencia: string;
        ListaItensServico: [
          ItemServico: {
            ItemListaServico: string;
            CodigoCnae: string;
            Descricao: string;
            Tributavel: number;
            Quantidade: number;
            ValorUnitario: number;
            ValorLiquido: number;
          }
        ];
      };
      Prestador: {
        CpfCnpj: {
          Cnpj: string;
        };
        InscricaoMunicipal: string;
      };
      Tomador: {
        IdentificacaoTomador: {
          CpfCnpj: {
            Cnpj: string;
          };
          InscricaoMunicipal: string;
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
        InscricaoEstadual: string;
      };
      IncentivoFiscal: number;
    };
  };
}

interface DataUpdateObject {
  numeroLote: number;
  identificacaoRpsnumero: number;
}

/* async function UpdateNumbers(id: string): Promise<DataUpdateObject> {
  const lastInvoice = await InvoiceService.FindLastInvoice(id);

  if (!lastInvoice) {
    return { numeroLote: 60, identificacaoRpsnumero: 60 };
  }

  let numeroLote = lastInvoice.numeroLote + 1;
  let identificacaoRpsnumero = lastInvoice.identificacaoRpsnumero + 1;
  

  return { numeroLote, identificacaoRpsnumero };
} */

const create_invoice = async (req: CustomRequest, res: Response) => {
    try {
        const user = req.userObject;
        const {customer_id, servico} = req.body;
        let messageError = '';
        
        if(!customer_id || !servico){
          res.status(400).send({message:'customer_id or service or taxation is null!'});
          return;
        }

        const id = user?.id;

        if(!id){
          res.status(400).send({message: 'User ID is no found!'});
          return;          
        }

        const customer = await CustomerService.FindCostumerByIdService(customer_id);

        if(!customer){
          res.status(400).send({message: 'User is no found!'});
          return;
        }
        
        const date = new Date();
        const options = { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' } as const;
        const formattedDate = new Intl.DateTimeFormat('en-CA', options).format(date);


        if(customer.cnpj != 'undefined' && customer.cpf === 'undefined'){

        const data: GerarNfseEnvio = {
          Requerente: {
            Cnpj: user!.cnpj,  
            InscricaoMunicipal: user!.inscricaoMunicipal, 
            Senha: user!.senhaelotech,
            Homologa: user!.homologa 
          },
          LoteRps: {
            NumeroLote: user.numeroLote.toLocaleString(),
            Cnpj: user!.cnpj,
            InscricaoMunicipal: user!.inscricaoMunicipal, 
            QuantidadeRps: 1,
          },
          Rps: {
            IdentificacaoRps: {
              Numero: user.identificacaoRpsnumero.toLocaleString(),
              Serie: "D",
              Tipo: 1,
            },
            DataEmissao: formattedDate,
            Status: 1,
            Competencia: servico.dateOfCompetence,
            Servico: {
              Valores: {
                ValorServicos: servico.valor_unitario * servico.quantidade,
                ValorDeducoes: servico.ValorDeducoes || 0,
                AliquotaPis: servico.AliquotaPis || 0,
                RetidoPis: servico.RetidoPis || 2,
                ValorPis: servico.ValorPis || 0,
                AliquotaCofins: servico.AliquotaCofins || 0,
                RetidoCofins: servico.RetidoCofins || 2,
                ValorCofins: servico.ValorCofins || 0,
                AliquotaInss: servico.AliquotaInss || 0,
                RetidoInss: servico.RetidoInss || 2,
                ValorInss: servico.ValorInss || 0,
                AliquotaIr: servico.AliquotaIr || 0, 
                RetidoIr: servico.RetidoIr || 2, 
                ValorIr: servico.ValorIr || 0,
                AliquotaCsll: servico.AliquotaCsll || 0,
                RetidoCsll: servico.RetidoCsll || 2,
                ValorCsll: servico.ValorCsll || 0,
                AliquotaCpp: servico.AliquotaCpp || 0,
                RetidoCpp: servico.RetidoCpp || 2,
                ValorCpp: servico.ValorCpp || 0,
                RetidoOutrasRetencoes: servico.RetidoOutrasRetencoes || 2,
                Aliquota: servico.Aliquota || 2,
                DescontoIncondicionado: servico.DescontoIncondicionado || 0.00,
                DescontoCondicionado: servico.DescontoCondicionado || 0.00,
              },
                IssRetido: servico.IssRetido || 2, 
                Discriminacao: servico.Discriminacao,
                CodigoMunicipio: '4115804', // Código de Medianeira
                ExigibilidadeISS: 1,
                MunicipioIncidencia: '4115804', // Código de Medianeira
                ListaItensServico: [
              {
                ItemListaServico: servico.item_lista,
                CodigoCnae: servico.cnae,
                Descricao: servico.descricao,
                Tributavel: 1,
                Quantidade: servico.quantidade,
                ValorUnitario: servico.valor_unitario,
                ValorLiquido: (servico.valor_unitario * servico.quantidade) - (servico.desconto || 0),
              },
              ],
            },
            Prestador: {
              Cnpj: user!.cnpj,  
              InscricaoMunicipal: user!.inscricaoMunicipal, 
            },
            Tomador: {
              IdentificacaoTomador: {
              CpfCnpj: customer.cnpj,
              InscricaoMunicipal: customer.inscricaoMunicipal,
              InscricaoEstadual: customer.inscricaoEstadual,
              },
              RazaoSocial: customer.name,
              Endereco: {
              Endereco: customer.address.street,
              Numero: customer.address.number,
              Bairro: customer.address.neighborhood,
              CodigoMunicipio: customer.address.cityCode,
              Uf: customer.address.state,
              Cep: customer.address.zipCode,
              },
              Contato: {
              Telefone: customer.phone,
              Email: customer.email,
              },         
            },
            RegimeEspecialTributacao: user!.RegimeEspecialTributacao,
            IncentivoFiscal: user!.IncentivoFiscal,
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
                          messageError = resposta["ns2:ListaMensagemRetorno"]["ns2:MensagemRetorno"]["ns2:Mensagem"];
                          return resolve(false);
                      }

                        if (resposta["ns2:ListaMensagemRetornoLote"]) {
                        console.error("Erro no lote da NFS-e:", resposta["ns2:ListaMensagemRetornoLote"]["ns2:MensagemRetorno"]);
                        const mensagens = resposta["ns2:ListaMensagemRetornoLote"]["ns2:MensagemRetorno"];
                        if (Array.isArray(mensagens)) {
                          messageError = mensagens.map((msg: any) => msg["ns2:Mensagem"]).join("; ");
                        } else {
                          messageError = mensagens["ns2:Mensagem"];
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

        //console.log("Objeto em JSON:", JSON.stringify(data, null, 2)); 

         switch (user?.cidade) {
          case "Medianeira":

          const response = await NFseService.enviarNfse(data);

          const nfseGerada = await verificarNFSe(response); //Verificar se a Nota foi gerada ou não.
        
          if (!nfseGerada) {
              await UserService.UpdateUser(user?.id, {numeroLote: user.numeroLote + 1 , identificacaoRpsnumero: user.identificacaoRpsnumero + 1});
              res.status(200).send({message: messageError});
              return;
          }
        
            const invoicebody = await InvoiceService.CreateInvoiceService({
              customer: customer_id,
              user: user?.id,
              valor: (servico.valor_unitario * servico.quantidade) - (servico.desconto || 0),
              xml: response,
              data: data,
              numeroLote: user.numeroLote,
              identificacaoRpsnumero: user.identificacaoRpsnumero,
            });

            await UserService.UpdateUser(user?.id, {numeroLote: user.numeroLote + 1 , identificacaoRpsnumero: user.identificacaoRpsnumero + 1});
            await SendEmailService.NfseEmitida(user.email);
            await SendEmailService.SendLinkToClientNfseEmitida(customer.email,invoicebody._id as string);
            res.status(200).send({message: 'Nota Fiscal gerada com sucesso!'});
            return;

        default:
           res.status(400).send({message: "Não atende a cidade informada"});
           return;
        }   

        }

        if(customer.cpf != 'undefined' && customer.cnpj === 'undefined'){

          const data: GerarNfseEnvioPessoaFisica = {
            Requerente: {
              Cnpj: user!.cnpj,  
              InscricaoMunicipal: user!.inscricaoMunicipal, 
              Senha: user!.senhaelotech,
              Homologa: user!.homologa 
            },
            LoteRps: {
              NumeroLote: user.numeroLote.toLocaleString(),
              Cnpj: user!.cnpj,
              InscricaoMunicipal: user!.inscricaoMunicipal, 
              QuantidadeRps: 1,
            },
            Rps: {
              IdentificacaoRps: {
                Numero: user.identificacaoRpsnumero.toLocaleString(),
                Serie: "D",
                Tipo: 1,
              },
              DataEmissao: formattedDate,
              Status: 1,
              Competencia: servico.dateOfCompetence,
              Servico: {
                Valores: {
                  ValorServicos: servico.valor_unitario * servico.quantidade,
                  ValorDeducoes: servico.ValorDeducoes || 0,
                  AliquotaPis: servico.AliquotaPis || 0,
                  RetidoPis: servico.RetidoPis || 2,
                  ValorPis: servico.ValorPis || 0,
                  AliquotaCofins: servico.AliquotaCofins || 0,
                  RetidoCofins: servico.RetidoCofins || 2,
                  ValorCofins: servico.ValorCofins || 0,
                  AliquotaInss: servico.AliquotaInss || 0,
                  RetidoInss: servico.RetidoInss || 2,
                  ValorInss: servico.ValorInss || 0,
                  AliquotaIr: servico.AliquotaIr || 0, 
                  RetidoIr: servico.RetidoIr || 2, 
                  ValorIr: servico.ValorIr || 0,
                  AliquotaCsll: servico.AliquotaCsll || 0,
                  RetidoCsll: servico.RetidoCsll || 2,
                  ValorCsll: servico.ValorCsll || 0,
                  AliquotaCpp: servico.AliquotaCpp || 0,
                  RetidoCpp: servico.RetidoCpp || 2,
                  ValorCpp: servico.ValorCpp || 0,
                  RetidoOutrasRetencoes: servico.RetidoOutrasRetencoes || 2,
                  Aliquota: servico.Aliquota || 2,
                  DescontoIncondicionado: servico.DescontoIncondicionado || 0.00,
                  DescontoCondicionado: servico.DescontoCondicionado || 0.00,
                },
                  IssRetido: servico.IssRetido || 2, 
                  Discriminacao: servico.Discriminacao,
                  CodigoMunicipio: '4115804', // Código de Medianeira
                  ExigibilidadeISS: 1,
                  MunicipioIncidencia: '4115804', // Código de Medianeira
                  ListaItensServico: [
                {
                  ItemListaServico: servico.item_lista,
                  CodigoCnae: servico.cnae,
                  Descricao: servico.descricao,
                  Tributavel: 1,
                  Quantidade: servico.quantidade,
                  ValorUnitario: servico.valor_unitario,
                  ValorLiquido: (servico.valor_unitario * servico.quantidade) - (servico.desconto || 0),
                },
                ],
              },
              Prestador: {
                Cnpj: user!.cnpj,  
                InscricaoMunicipal: user!.inscricaoMunicipal, 
              },
              Tomador: {
                IdentificacaoTomador: {
                CpfCnpj: customer.cpf,
                },
                RazaoSocial: customer.razaoSocial,
                Endereco: {
                Endereco: customer.address.street,
                Numero: customer.address.number,
                Bairro: customer.address.neighborhood,
                CodigoMunicipio: customer.address.cityCode,
                Uf: customer.address.state,
                Cep: customer.address.zipCode,
                },
                Contato: {
                Telefone: customer.phone,
                Email: customer.email,
                },         
              },
              RegimeEspecialTributacao: user!.RegimeEspecialTributacao,
              IncentivoFiscal: user!.IncentivoFiscal,
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
                            messageError = resposta["ns2:ListaMensagemRetorno"]["ns2:MensagemRetorno"]["ns2:Mensagem"];
                            return resolve(false);
                        }
  
                          if (resposta["ns2:ListaMensagemRetornoLote"]) {
                          console.error("Erro no lote da NFS-e:", resposta["ns2:ListaMensagemRetornoLote"]["ns2:MensagemRetorno"]);
                          const mensagens = resposta["ns2:ListaMensagemRetornoLote"]["ns2:MensagemRetorno"];
                          if (Array.isArray(mensagens)) {
                            messageError = mensagens.map((msg: any) => msg["ns2:Mensagem"]).join("; ");
                          } else {
                            messageError = mensagens["ns2:Mensagem"];
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
  
           switch (user?.cidade) {
            case "Medianeira":
  
            const response = await NFseService.enviarNfsePessoaFisica(data);
  
            const nfseGerada = await verificarNFSe(response); 
          
            if (!nfseGerada) {
                await UserService.UpdateUser(user?.id, {numeroLote: user.numeroLote + 1 , identificacaoRpsnumero: user.identificacaoRpsnumero + 1});
                res.status(200).send({message: messageError});
                return;
            }
          
              const invoicebody = await InvoiceService.CreateInvoiceService({
                customer: customer_id,
                user: user?.id,
                valor: (servico.valor_unitario * servico.quantidade) - (servico.desconto || 0),
                xml: response,
                data: data,
                numeroLote: user.numeroLote,
                identificacaoRpsnumero: user.identificacaoRpsnumero,
              });
  
              await UserService.UpdateUser(user?.id, {numeroLote: user.numeroLote + 1 , identificacaoRpsnumero: user.identificacaoRpsnumero + 1});
              await SendEmailService.NfseEmitida(user.email);
              await SendEmailService.SendLinkToClientNfseEmitida(customer.email,invoicebody._id as string);
              res.status(200).send({message: 'Nota Fiscal gerada com sucesso!'});
              return;
  
          default:
             res.status(400).send({message: "Não atende a cidade informada"});
             return;
          }  
  
        
        }
             

      } catch (error) {
        res.status(500).send({message: 'Erro interno no servidor', error});
        return;
    }
}

const create_invoice_admin = async (req: CustomRequest, res: Response) => {
  try {
      const user = req.userObject;
      const {customer, servico} = req.body;
      let messageError = '';

      //console.log(customer, servico);

      const id = user?.id;
      if(!id){
        res.status(400).send({message: 'User ID is no found!'});
        return;          
      }

      const date = new Date();
      const options = { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' } as const;
      const formattedDate = new Intl.DateTimeFormat('en-CA', options).format(date);

      const documento1 = customer.cnpjcpf.replace(/[.\/-]/g, '');
      if(documento1.length === 14){

      const data: GerarNfseEnvio = {
        Requerente: {
          Cnpj: user!.cnpj,  
          InscricaoMunicipal: user!.inscricaoMunicipal, 
          Senha: user!.senhaelotech,
          Homologa: user!.homologa 
        },
        LoteRps: {
          NumeroLote: user.numeroLote.toLocaleString(),
          Cnpj: user!.cnpj,
          InscricaoMunicipal: user!.inscricaoMunicipal, 
          QuantidadeRps: 1,
        },
        Rps: {
          IdentificacaoRps: {
            Numero: user.identificacaoRpsnumero.toLocaleString(),
            Serie: "D",
            Tipo: 1,
          },
          DataEmissao: formattedDate,
          Status: 1,
          Competencia: servico.dateOfCompetence,
          Servico: {
            Valores: {
              ValorServicos: servico.valor_unitario * servico.quantidade,
              ValorDeducoes: servico.ValorDeducoes || 0,
              AliquotaPis: servico.AliquotaPis || 0,
              RetidoPis: servico.RetidoPis || 2,
              ValorPis: servico.ValorPis || 0,
              AliquotaCofins: servico.AliquotaCofins || 0,
              RetidoCofins: servico.RetidoCofins || 2,
              ValorCofins: servico.ValorCofins || 0,
              AliquotaInss: servico.AliquotaInss || 0,
              RetidoInss: servico.RetidoInss || 2,
              ValorInss: servico.ValorInss || 0,
              AliquotaIr: servico.AliquotaIr || 0, 
              RetidoIr: servico.RetidoIr || 2, 
              ValorIr: servico.ValorIr || 0,
              AliquotaCsll: servico.AliquotaCsll || 0,
              RetidoCsll: servico.RetidoCsll || 2,
              ValorCsll: servico.ValorCsll || 0,
              AliquotaCpp: servico.AliquotaCpp || 0,
              RetidoCpp: servico.RetidoCpp || 2,
              ValorCpp: servico.ValorCpp || 0,
              RetidoOutrasRetencoes: servico.RetidoOutrasRetencoes || 2,
              Aliquota: servico.Aliquota || 2,
              DescontoIncondicionado: servico.DescontoIncondicionado || 0.00,
              DescontoCondicionado: servico.DescontoCondicionado || 0.00,
            },
              IssRetido: servico.IssRetido || 2, 
              Discriminacao: servico.Discriminacao,
              CodigoMunicipio: '4115804', // Código de Medianeira
              ExigibilidadeISS: 1,
              MunicipioIncidencia: '4115804', // Código de Medianeira
              ListaItensServico: [
            {
              ItemListaServico: servico.item_lista,
              CodigoCnae: servico.cnae,
              Descricao: servico.descricao,
              Tributavel: 1,
              Quantidade: servico.quantidade,
              ValorUnitario: servico.valor_unitario,
              ValorLiquido: (servico.valor_unitario * servico.quantidade) - (servico.desconto || 0),
            },
            ],
          },
          Prestador: {
            Cnpj: user!.cnpj,  
            InscricaoMunicipal: user!.inscricaoMunicipal, 
          },
          Tomador: {
            IdentificacaoTomador: {
            CpfCnpj: customer.cnpjcpf.replace(/[.\/-]/g, ''),
            InscricaoMunicipal: customer.InscricaoMunicipal,
            InscricaoEstadual: '',
            },
            RazaoSocial: customer.RazaoSocial,
            Endereco: {
            Endereco: customer.Endereco,
            Numero: customer.Numero,
            Bairro: customer.Bairro,
            CodigoMunicipio: customer.CodigoMunicipio,
            Uf: customer.Uf,
            Cep: customer.Cep,
            },
            Contato: {
            Telefone: customer.Telefone,
            Email: customer.Email,
            },         
          },
          RegimeEspecialTributacao: user!.RegimeEspecialTributacao,
          IncentivoFiscal: user!.IncentivoFiscal,
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
                        messageError = resposta["ns2:ListaMensagemRetorno"]["ns2:MensagemRetorno"]["ns2:Mensagem"];
                        return resolve(false);
                    }

                      if (resposta["ns2:ListaMensagemRetornoLote"]) {
                      console.error("Erro no lote da NFS-e:", resposta["ns2:ListaMensagemRetornoLote"]["ns2:MensagemRetorno"]);
                      const mensagens = resposta["ns2:ListaMensagemRetornoLote"]["ns2:MensagemRetorno"];
                      if (Array.isArray(mensagens)) {
                        messageError = mensagens.map((msg: any) => msg["ns2:Mensagem"]).join("; ");
                      } else {
                        messageError = mensagens["ns2:Mensagem"];
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

      //console.log("Objeto em JSON:", JSON.stringify(data, null, 2)); 

       switch (user?.cidade) {
        case "Medianeira":

        const response = await NFseService.enviarNfse(data);

        const nfseGerada = await verificarNFSe(response); //Verificar se a Nota foi gerada ou não.
      
        if (!nfseGerada) {
            await AdminService.UpdateAdmin(user?.id, {numeroLote: user.numeroLote + 1 , identificacaoRpsnumero: user.identificacaoRpsnumero + 1});
            res.status(200).send({message: messageError});
            return;
        }

          await InvoiceService.CreateInvoiceService({
            customer: customer._id,
            admin: user?.id,
            valor: (servico.valor_unitario * servico.quantidade) - (servico.desconto || 0),
            xml: response,
            data: data,
            numeroLote: user.numeroLote,
            identificacaoRpsnumero: user.identificacaoRpsnumero,
          });

          await AdminService.UpdateAdmin(user?.id, {numeroLote: user.numeroLote + 1 , identificacaoRpsnumero: user.identificacaoRpsnumero + 1});
          await SendEmailService.NfseEmitida(user.email);
          res.status(200).send({message: 'Nota Fiscal gerada com sucesso!'});
          return;

      default:
         res.status(400).send({message: "Não atende a cidade informada"});
         return;
      }   

      }

      const documento2 = customer.cnpjcpf.replace(/[.\/-]/g, '');
      if(documento2.cnpjcpf.length === 11){

        const data: GerarNfseEnvioPessoaFisica = {
          Requerente: {
            Cnpj: user!.cnpj,  
            InscricaoMunicipal: user!.inscricaoMunicipal, 
            Senha: user!.senhaelotech,
            Homologa: user!.homologa 
          },
          LoteRps: {
            NumeroLote: user.numeroLote.toLocaleString(),
            Cnpj: user!.cnpj,
            InscricaoMunicipal: user!.inscricaoMunicipal, 
            QuantidadeRps: 1,
          },
          Rps: {
            IdentificacaoRps: {
              Numero: user.identificacaoRpsnumero.toLocaleString(),
              Serie: "D",
              Tipo: 1,
            },
            DataEmissao: formattedDate,
            Status: 1,
            Competencia: servico.dateOfCompetence,
            Servico: {
              Valores: {
                ValorServicos: servico.valor_unitario * servico.quantidade,
                ValorDeducoes: servico.ValorDeducoes || 0,
                AliquotaPis: servico.AliquotaPis || 0,
                RetidoPis: servico.RetidoPis || 2,
                ValorPis: servico.ValorPis || 0,
                AliquotaCofins: servico.AliquotaCofins || 0,
                RetidoCofins: servico.RetidoCofins || 2,
                ValorCofins: servico.ValorCofins || 0,
                AliquotaInss: servico.AliquotaInss || 0,
                RetidoInss: servico.RetidoInss || 2,
                ValorInss: servico.ValorInss || 0,
                AliquotaIr: servico.AliquotaIr || 0, 
                RetidoIr: servico.RetidoIr || 2, 
                ValorIr: servico.ValorIr || 0,
                AliquotaCsll: servico.AliquotaCsll || 0,
                RetidoCsll: servico.RetidoCsll || 2,
                ValorCsll: servico.ValorCsll || 0,
                AliquotaCpp: servico.AliquotaCpp || 0,
                RetidoCpp: servico.RetidoCpp || 2,
                ValorCpp: servico.ValorCpp || 0,
                RetidoOutrasRetencoes: servico.RetidoOutrasRetencoes || 2,
                Aliquota: servico.Aliquota || 2,
                DescontoIncondicionado: servico.DescontoIncondicionado || 0.00,
                DescontoCondicionado: servico.DescontoCondicionado || 0.00,
              },
                IssRetido: servico.IssRetido || 2, 
                Discriminacao: servico.Discriminacao,
                CodigoMunicipio: '4115804', // Código de Medianeira
                ExigibilidadeISS: 1,
                MunicipioIncidencia: '4115804', // Código de Medianeira
                ListaItensServico: [
              {
                ItemListaServico: servico.item_lista,
                CodigoCnae: servico.cnae,
                Descricao: servico.descricao,
                Tributavel: 1,
                Quantidade: servico.quantidade,
                ValorUnitario: servico.valor_unitario,
                ValorLiquido: (servico.valor_unitario * servico.quantidade) - (servico.desconto || 0),
              },
              ],
            },
            Prestador: {
              Cnpj: user!.cnpj,  
              InscricaoMunicipal: user!.inscricaoMunicipal, 
            },
            Tomador: {
              IdentificacaoTomador: {
              CpfCnpj: customer.cnpjcpf.replace(/[.\/-]/g, ''),
              },
              RazaoSocial: customer.RazaoSocial,
              Endereco: {
              Endereco: customer.Endereco,
              Numero: customer.Numero,
              Bairro: customer.Bairro,
              CodigoMunicipio: customer.CodigoMunicipio,
              Uf: customer.Uf,
              Cep: customer.Cep,
              },
              Contato: {
              Telefone: customer.Telefone,
              Email: customer.Email,
              },         
            },
            RegimeEspecialTributacao: user!.RegimeEspecialTributacao,
            IncentivoFiscal: user!.IncentivoFiscal,
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
                          messageError = resposta["ns2:ListaMensagemRetorno"]["ns2:MensagemRetorno"]["ns2:Mensagem"];
                          return resolve(false);
                      }

                        if (resposta["ns2:ListaMensagemRetornoLote"]) {
                        console.error("Erro no lote da NFS-e:", resposta["ns2:ListaMensagemRetornoLote"]["ns2:MensagemRetorno"]);
                        const mensagens = resposta["ns2:ListaMensagemRetornoLote"]["ns2:MensagemRetorno"];
                        if (Array.isArray(mensagens)) {
                          messageError = mensagens.map((msg: any) => msg["ns2:Mensagem"]).join("; ");
                        } else {
                          messageError = mensagens["ns2:Mensagem"];
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

         switch (user?.cidade) {
          case "Medianeira":

          const response = await NFseService.enviarNfsePessoaFisica(data);

          const nfseGerada = await verificarNFSe(response); 
        
          if (!nfseGerada) {
              await AdminService.UpdateAdmin(user?.id, {numeroLote: user.numeroLote + 1 , identificacaoRpsnumero: user.identificacaoRpsnumero + 1});
              res.status(200).send({message: messageError});
              return;
          }
        
            await InvoiceService.CreateInvoiceService({
              customer: customer._id,
              admin: user?.id,
              valor: (servico.valor_unitario * servico.quantidade) - (servico.desconto || 0),
              xml: response,
              data: data,
              numeroLote: user.numeroLote,
              identificacaoRpsnumero: user.identificacaoRpsnumero,
            });

            await AdminService.UpdateAdmin(user?.id, {numeroLote: user.numeroLote + 1 , identificacaoRpsnumero: user.identificacaoRpsnumero + 1});
            await SendEmailService.NfseEmitida(user.email);
            res.status(200).send({message: 'Nota Fiscal gerada com sucesso!'});
            return;

        default:
           res.status(400).send({message: "Não atende a cidade informada"});
           return;
        }  

      
      }
           

    } catch (error) {
      res.status(500).send({message: 'Erro interno no servidor', error});
      return;
  }
}

const create_nfse_pdf = async (req: Request, res: Response) => {
  try {
    const data = req.body;

    //console.log(data);

    if (!data.xml) {
      return res.status(400).send({ message: 'XML é obrigatório' });
    }

    try {
      const domParser = new JSDOM().window.DOMParser;
      const xmlDoc = new domParser().parseFromString(data.xml, "text/xml");

      function getValue(tagName: string) {
        const elements = xmlDoc.getElementsByTagName(tagName);
        return elements.length > 0 ? elements[0].textContent : '';
      }

      function getTomadorValue(tagName: string) {
        const tomador = xmlDoc.getElementsByTagName("ns2:Tomador")[0];
        if (!tomador) return '';
        const elements = tomador.getElementsByTagName(tagName);
        return elements.length > 0 ? elements[0].textContent : '';
      }

      function getTomadorEndereco() {
        const endereco = xmlDoc.getElementsByTagName("ns2:Tomador")[0].getElementsByTagName("ns2:Endereco")[0];
        if (!endereco) return '';
        const logradouro = endereco.getElementsByTagName("ns2:Endereco")[0].textContent;
        const numero = endereco.getElementsByTagName("ns2:Numero")[0].textContent;
        const bairro = endereco.getElementsByTagName("ns2:Bairro")[0].textContent;
        return `${logradouro}, ${numero} - ${bairro}`;
      }

      function getPrestadorEndereco() {
        const endereco = xmlDoc.getElementsByTagName("ns2:PrestadorServico")[0].getElementsByTagName("ns2:Endereco")[0];
        if (!endereco) return '';
        const logradouro = endereco.getElementsByTagName("ns2:Endereco")[0].textContent;
        const numero = endereco.getElementsByTagName("ns2:Numero")[0].textContent;
        const bairro = endereco.getElementsByTagName("ns2:Bairro")[0].textContent;
        return `${logradouro}, ${numero} - ${bairro}`;
      }

      // Funções de formatação
      function formatCNPJ(cnpj: string) {
        if (!cnpj) return '';
        return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
      }

      function formatCurrency(value: string) {
        if (!value) return '0,00';
        const num = parseFloat(value);
        return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      }

      function formatPercentage(value: string) {
        if (!value) return '0,00';
        const num = parseFloat(value);
        return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      }

      function formatDate(dateStr: string) {
        if (!dateStr) return '';
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
      }

      const getValue2 = (tag: string): string => {
        const el = xmlDoc.getElementsByTagName(tag)[0];
        return el?.textContent?.trim() || "N/A";
      };

      const templatePath = path.join(__dirname, "..", "Nfse", "index.html");
      const cssPath = path.join(__dirname, "..", "Nfse", "styles.css");

      const [htmlTemplate, cssContent] = await Promise.all([
        readFile(templatePath, "utf-8"),
        readFile(cssPath, "utf-8")
      ]);

      // Substitua a tag <link> pelo CSS incorporado
      const htmlWithCss = htmlTemplate.replace(
        `<link rel="stylesheet" href="styles.css">`,
        `<style>${cssContent}</style>`
      );

      const generateQrCodeBase64 = async (url: string): Promise<string> => {
        try {
          const qrCodeBase64 = await QRCode.toDataURL(url); // Já retorna em base64 (data:image/png;base64,...)
          return qrCodeBase64;
        } catch (err) {
          console.error('Erro ao gerar QR Code:', err);
          throw err;
        }
      };

      function formatCpfCnpj(value: string): string {
        const cleaned = value.replace(/\D/g, '');
      
        if (cleaned.length === 11) {
          return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        }
      
        if (cleaned.length === 14) {
          return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
        }
        return value;
      }

      function formatCep(cep: string | undefined): string {
        if (!cep) return '';
        return cep.replace(/^(\d{5})(\d{3})$/, '$1-$2');
      }

      const numeroNfse = getValue("ns2:Numero");
      const codigoAutenticidade = getValue("ns2:CodigoVerificacao");
      const dataEmissao = getValue2("ns2:DataEmissao");
      const link = `https://www.aginotas.com.br/detalhesNfse/${data._id}`
      /* const link = `https://medianeira.oxy.elotech.com.br/iss/autenticar-documento-fiscal?cpfCnpjPrestador=${data.user.cnpj}&numeroNFSe=${numeroNfse}&codigoAutenticidade=${codigoAutenticidade}&dataEmissao=${dataEmissao}` */
      const qrcodelink = await generateQrCodeBase64(link);

      const documento = 
      data.customer.cnpj && data.customer.cnpj !== 'undefined'
        ? data.customer.cnpj
        : (data.customer.cpf && data.customer.cpf !== 'undefined'
            ? data.customer.cpf
            : null);

      const replacements = {
        "{{NUMERODORPS}}": data.data.Rps.IdentificacaoRps.Numero,
        "{{SERIERODORPS}}": data.data.Rps.IdentificacaoRps.Serie,
        "{{TIPOODORPS}}": data.data.Rps.IdentificacaoRps.Tipo,
        "{{QRCODE}}": `${qrcodelink}`,
        "{{LOGOEMPRESA}}": `${data.user.picture}`,
        "{{NUMERO}}": getValue("ns2:Numero"),
        "{{DATA_EMISSAO}}": formatDate(getValue2("ns2:DataEmissao")),
        "{{DATA_COMPETENCIA}}": formatDate(getValue2("ns2:Competencia")),
        "{{CODIGO_VERIFICACAO}}": getValue("ns2:CodigoVerificacao"),
        "{{RAZAO_SOCIAL_PRESTADOR}}": getValue("ns2:RazaoSocial"),
        "{{NOME_FANTASIA_PRESTADOR}}": '',
        "{{INSCRICAO_ESTADUAL_PRESTADOR}}": '',
        "{{MUNICIPIO_PRESTADOR}}": `${data.user.cidade}`,
        "{{UF_PRESTADOR}}": `${data.user.estado}`,
        "{{CNPJ/CPF_PRESTADOR}}": formatCpfCnpj(`${data.user.cnpj}`),
        "{{INSCRICAO_MUNICIPAL}}": `${data.user.inscricaoMunicipal}`,
        "{{ENDERECO_PRESTADOR}}": getPrestadorEndereco(),
        "{{CEP_PRESTADOR}}": formatCep(xmlDoc.getElementsByTagName("ns2:PrestadorServico")[0].getElementsByTagName("ns2:Endereco")[0].getElementsByTagName("ns2:Cep")[0].textContent?.trim()),
        "{{TELEFONE_PRESTADOR}}": getValue("ns2:Telefone"),
        "{{EMAIL_PRESTADOR}}": getValue("ns2:Email"),
        "{{DESCRICAO}}": getValue("ns2:Discriminacao"),
        "{{CNAE}}": getValue("ns2:CodigoCnae"),
        "{{VALOR_SERVICOS}}": formatCurrency(getValue2("ns2:ValorServicos")),
    /*         "{{ALIQUOTA}}": `${formatPercentage(getValue2("ns2:Aliquota"))}%`, */
        "{{BASE_CALCULO}}": formatCurrency(getValue2("ns2:BaseCalculo")),
         "{{VALOR_ISS}}": formatCurrency(getValue2("ns2:ValorIss")), 


        "{{TOMADOR_RAZAO_SOCIAL}}": getTomadorValue("ns2:RazaoSocial"),
        "{{TOMADOR_NOME_FANTASIA}}": '',
        "{{TOMADOR_CNPJ/CPF}}": formatCpfCnpj(`${documento}`),
        "{{TOMADOR_INSCRICAO_MUNICIPAL}}": getTomadorValue("ns2:InscricaoMunicipal"),
        "{{TOMADOR_INSCRICAO_ESTADUAL}}": '',
        "{{TOMADOR_PHONE}}": `${data.customer.phone}`,
        "{{TOMADOR_EMAIL}}": `${data.customer.email}`,
        "{{TOMADOR_ENDERECO}}": getTomadorEndereco(),
    /*         "{{TOMADOR_ENDERECO}}": `${data.customer.address.street}, ${data.customer.address.number} - ${data.customer.address.neighborhood}`, */
        "{{TOMADOR_CEP}}": formatCep(`${data.customer.address.zipCode}`),
        "{{TOMADOR_MUNICIPIO_UF}}": `${data.customer.address.city}/${data.customer.address.state}`,
        "{{CHAVE_ACESSO}}": getValue("ns2:ChaveAcesso"),

        "{{ITEM_SERVICO}}": xmlDoc.getElementsByTagName("ns2:ListaItensServico")[0].getElementsByTagName("ns2:ItemServico")[0].getElementsByTagName("ns2:Descricao")[0].textContent?.trim(),
        "{{ITEM_LISTA_SERVICO}}": xmlDoc.getElementsByTagName("ns2:ListaItensServico")[0].getElementsByTagName("ns2:ItemServico")[0].getElementsByTagName("ns2:ItemListaServico")[0].textContent?.trim(),
        "{{TRIBUTAVEL_ITEM_SERVICO}}": xmlDoc.getElementsByTagName("ns2:ListaItensServico")[0].getElementsByTagName("ns2:ItemServico")[0].getElementsByTagName("ns2:Tributavel")[0].textContent?.trim(),
        "{{QUANTIDADE_ITEM_SERVICO}}": xmlDoc.getElementsByTagName("ns2:ListaItensServico")[0].getElementsByTagName("ns2:ItemServico")[0].getElementsByTagName("ns2:Quantidade")[0].textContent?.trim(),
        "{{VALOR_UNI_ITEM_SERVICO}}": xmlDoc.getElementsByTagName("ns2:ListaItensServico")[0].getElementsByTagName("ns2:ItemServico")[0].getElementsByTagName("ns2:ValorUnitario")[0].textContent?.trim(),
        "{{VALOR_DESC_COND_ITEM_SERVICO}}": xmlDoc.getElementsByTagName("ns2:Servico")[0].getElementsByTagName("ns2:Valores")[0].getElementsByTagName("ns2:DescontoCondicionado")[0].textContent?.trim(),
        "{{VALOR_TOTAL_DESCONTO_ITEM_SERVICO}}": xmlDoc.getElementsByTagName("ns2:ListaItensServico")[0].getElementsByTagName("ns2:ItemServico")[0].getElementsByTagName("ns2:ValorDesconto")[0].textContent?.trim(),
        "{{VALOR_DESC_INC_ITEM_SERVICO}}": xmlDoc.getElementsByTagName("ns2:Servico")[0].getElementsByTagName("ns2:Valores")[0].getElementsByTagName("ns2:DescontoIncondicionado")[0].textContent?.trim(),
        "{{VALOR_LIQUIDO_ITEM_SERVICO}}": xmlDoc.getElementsByTagName("ns2:ListaItensServico")[0].getElementsByTagName("ns2:ItemServico")[0].getElementsByTagName("ns2:ValorLiquido")[0].textContent?.trim(),

        "{{VALOR_SERVICOS_VALORES}}": xmlDoc.getElementsByTagName("ns2:Servico")[0].getElementsByTagName("ns2:Valores")[0].getElementsByTagName("ns2:ValorServicos")[0].textContent?.trim(),
        "{{VALOR_DEDUCOES}}": xmlDoc.getElementsByTagName("ns2:Servico")[0].getElementsByTagName("ns2:Valores")[0].getElementsByTagName("ns2:ValorDeducoes")[0]?.textContent?.trim(),
        
        "{{ALIQUOTA_PIS}}": data.data.Rps.Servico.Valores.AliquotaPis,
        "{{RETIDO_PIS}}": data.data.Rps.Servico.Valores.RetidoPis === 1 ? 'Sim' : 'Não',    /* xmlDoc.getElementsByTagName("ns2:Servico")[0].getElementsByTagName("ns2:Valores")[0].getElementsByTagName("ns2:RetidoPis")[0]?.textContent?.trim(), */         
        "{{VALOR_PIS}}": xmlDoc.getElementsByTagName("ns2:Servico")[0].getElementsByTagName("ns2:Valores")[0].getElementsByTagName("ns2:ValorPis")[0]?.textContent?.trim(),
        
        "{{ALIQUOTA_COFINS}}": data.data.Rps.Servico.Valores.AliquotaCofins,
        "{{RETIDO_COFINS}}": data.data.Rps.Servico.Valores.RetidoCofins === 1 ? 'Sim' : 'Não',/*  xmlDoc.getElementsByTagName("ns2:Servico")[0].getElementsByTagName("ns2:Valores")[0].getElementsByTagName("ns2:RetidoCofins")[0]?.textContent?.trim() */
        "{{VALOR_COFINS}}": xmlDoc.getElementsByTagName("ns2:Servico")[0].getElementsByTagName("ns2:Valores")[0].getElementsByTagName("ns2:ValorCofins")[0]?.textContent?.trim(),
        
        "{{ALIQUOTA_INSS}}": data.data.Rps.Servico.Valores.AliquotaInss,
        "{{RETIDO_INSS}}": data.data.Rps.Servico.Valores.RetidoInss === 1 ? 'Sim' : 'Não'/* xmlDoc.getElementsByTagName("ns2:Servico")[0].getElementsByTagName("ns2:Valores")[0].getElementsByTagName("ns2:RetidoInss")[0]?.textContent?.trim() */,
        "{{VALOR_INSS}}": xmlDoc.getElementsByTagName("ns2:Servico")[0].getElementsByTagName("ns2:Valores")[0].getElementsByTagName("ns2:ValorInss")[0]?.textContent?.trim(),
        
        "{{ALIQUOTA_IR}}": data.data.Rps.Servico.Valores.AliquotaIr,
        "{{RETIDO_IR}}": data.data.Rps.Servico.Valores.AliquotaIr === 1 ? 'Sim' : 'Não'/* xmlDoc.getElementsByTagName("ns2:Servico")[0].getElementsByTagName("ns2:Valores")[0].getElementsByTagName("ns2:RetidoIr")[0]?.textContent?.trim() */,
        "{{VALOR_IR}}": xmlDoc.getElementsByTagName("ns2:Servico")[0].getElementsByTagName("ns2:Valores")[0].getElementsByTagName("ns2:ValorIr")[0]?.textContent?.trim(),
        
        "{{ALIQUOTA_CSLL}}": data.data.Rps.Servico.Valores.AliquotaCsll,
        "{{RETIDO_CSLL}}": data.data.Rps.Servico.Valores.AliquotaCsll === 1 ? 'Sim' : 'Não'/* xmlDoc.getElementsByTagName("ns2:Servico")[0].getElementsByTagName("ns2:Valores")[0].getElementsByTagName("ns2:RetidoCsll")[0]?.textContent?.trim() */,
        "{{VALOR_CSLL}}": xmlDoc.getElementsByTagName("ns2:Servico")[0].getElementsByTagName("ns2:Valores")[0].getElementsByTagName("ns2:ValorCsll")[0]?.textContent?.trim(),
        
        "{{ALIQUOTA_CPP}}": (data.data.Rps.Servico.Valores.AliquotaCpp.toFixed(2)),
        "{{RETIDO_CPP}}": data.data.Rps.Servico.Valores.AliquotaCpp === 1 ? 'Sim' : 'Não',
        "{{VALOR_CPP}}": xmlDoc.getElementsByTagName("ns2:Servico")[0].getElementsByTagName("ns2:Valores")[0].getElementsByTagName("ns2:ValorCpp")[0]?.textContent?.trim(),
        
        
        "{{OUTRAS_RETENCOES}}": xmlDoc.getElementsByTagName("ns2:Servico")[0].getElementsByTagName("ns2:Valores")[0].getElementsByTagName("ns2:OutrasRetencoes")[0]?.textContent?.trim(),
        "{{RETIDO_OUTRAS_RETENCOES}}": xmlDoc.getElementsByTagName("ns2:Servico")[0].getElementsByTagName("ns2:Valores")[0].getElementsByTagName("ns2:RetidoOutrasRetencoes")[0]?.textContent?.trim(),
        /* "{{VALOR_ISS}}": xmlDoc.getElementsByTagName("ns2:Servico")[0].getElementsByTagName("ns2:Valores")[0].getElementsByTagName("ns2:ValorIss")[0]?.textContent?.trim(), */
        "{{ALIQUOTA}}": xmlDoc.getElementsByTagName("ns2:Servico")[0].getElementsByTagName("ns2:Valores")[0].getElementsByTagName("ns2:Aliquota")[0]?.textContent?.trim(),

        "{{VALOR_LIQUIDO_NFSE}}": xmlDoc.getElementsByTagName("ns2:ValoresNfse")[0].getElementsByTagName("ns2:ValorLiquidoNfse")[0].textContent?.trim(),

      };

      const html = Object.entries(replacements).reduce(
        (acc, [key, value]) => acc.replace(new RegExp(key, 'g'), value),
        htmlWithCss
      );

      const file = { content: html }; // HTML final com CSS
      const options = { format: 'A4', printBackground: true };

      // Gerar o PDF diretamente e enviar na resposta
      pdf.generatePdf(file, options, (err, pdfBuffer) => {
        if (err) {
          console.error('Erro ao gerar PDF:', err);
          return res.status(500).send({ message: 'Erro ao gerar PDF' });
        }

        if (!pdfBuffer || pdfBuffer.length === 0) {
          return res.status(500).send({ message: 'PDF gerado está vazio' });
        }

        // Configuração dos headers para envio do PDF
        res.writeHead(200, {
          'Content-Type': 'application/pdf',
          'Content-Length': pdfBuffer.length,
          'Content-Disposition': 'attachment; filename=NFSe.pdf'
        });

        return res.end(pdfBuffer);
      });

    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      return res.status(500).send({ message: 'Erro ao gerar PDF' });
    }
  } catch (error) {
    console.error('Erro interno:', error);
    return res.status(500).send({ message: 'Erro interno no servidor' });
  }
};

const create_nfse_pdf_admin = async (req: Request, res: Response) => {
  try {
    const data = req.body;

    console.log(data);

    if (!data.xml) {
      return res.status(400).send({ message: 'XML é obrigatório' });
    }

    try {
      const domParser = new JSDOM().window.DOMParser;
      const xmlDoc = new domParser().parseFromString(data.xml, "text/xml");

      function getValue(tagName: string) {
        const elements = xmlDoc.getElementsByTagName(tagName);
        return elements.length > 0 ? elements[0].textContent : '';
      }

      function getTomadorValue(tagName: string) {
        const tomador = xmlDoc.getElementsByTagName("ns2:Tomador")[0];
        if (!tomador) return '';
        const elements = tomador.getElementsByTagName(tagName);
        return elements.length > 0 ? elements[0].textContent : '';
      }

      function getTomadorEndereco() {
        const endereco = xmlDoc.getElementsByTagName("ns2:Tomador")[0].getElementsByTagName("ns2:Endereco")[0];
        if (!endereco) return '';
        const logradouro = endereco.getElementsByTagName("ns2:Endereco")[0].textContent;
        const numero = endereco.getElementsByTagName("ns2:Numero")[0].textContent;
        const bairro = endereco.getElementsByTagName("ns2:Bairro")[0].textContent;
        return `${logradouro}, ${numero} - ${bairro}`;
      }

      function getPrestadorEndereco() {
        const endereco = xmlDoc.getElementsByTagName("ns2:PrestadorServico")[0].getElementsByTagName("ns2:Endereco")[0];
        if (!endereco) return '';
        const logradouro = endereco.getElementsByTagName("ns2:Endereco")[0].textContent;
        const numero = endereco.getElementsByTagName("ns2:Numero")[0].textContent;
        const bairro = endereco.getElementsByTagName("ns2:Bairro")[0].textContent;
        return `${logradouro}, ${numero} - ${bairro}`;
      }

      // Funções de formatação
      function formatCNPJ(cnpj: string) {
        if (!cnpj) return '';
        return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
      }

      function formatCurrency(value: string) {
        if (!value) return '0,00';
        const num = parseFloat(value);
        return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      }

      function formatPercentage(value: string) {
        if (!value) return '0,00';
        const num = parseFloat(value);
        return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      }

      function formatDate(dateStr: string) {
        if (!dateStr) return '';
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
      }

      const getValue2 = (tag: string): string => {
        const el = xmlDoc.getElementsByTagName(tag)[0];
        return el?.textContent?.trim() || "N/A";
      };

      const templatePath = path.join(__dirname, "..", "Nfse", "index.html");
      const cssPath = path.join(__dirname, "..", "Nfse", "styles.css");

      const [htmlTemplate, cssContent] = await Promise.all([
        readFile(templatePath, "utf-8"),
        readFile(cssPath, "utf-8")
      ]);

      // Substitua a tag <link> pelo CSS incorporado
      const htmlWithCss = htmlTemplate.replace(
        `<link rel="stylesheet" href="styles.css">`,
        `<style>${cssContent}</style>`
      );

      const generateQrCodeBase64 = async (url: string): Promise<string> => {
        try {
          const qrCodeBase64 = await QRCode.toDataURL(url); // Já retorna em base64 (data:image/png;base64,...)
          return qrCodeBase64;
        } catch (err) {
          console.error('Erro ao gerar QR Code:', err);
          throw err;
        }
      };

      function formatCpfCnpj(value: string): string {
        const cleaned = value.replace(/\D/g, '');
      
        if (cleaned.length === 11) {
          return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        }
      
        if (cleaned.length === 14) {
          return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
        }
        return value;
      }

      const numeroNfse = getValue("ns2:Numero");
      const codigoAutenticidade = getValue("ns2:CodigoVerificacao");
      const dataEmissao = getValue2("ns2:DataEmissao");
      const link = `https://www.aginotas.com.br/detalhesNfse/${data._id}`
      /* const link = `https://medianeira.oxy.elotech.com.br/iss/autenticar-documento-fiscal?cpfCnpjPrestador=${data.user.cnpj}&numeroNFSe=${numeroNfse}&codigoAutenticidade=${codigoAutenticidade}&dataEmissao=${dataEmissao}` */
      const qrcodelink = await generateQrCodeBase64(link);

      const documento = data.admin.cnpj;

      const replacements = {
        "{{NUMERODORPS}}": data.data.Rps.IdentificacaoRps.Numero,
        "{{SERIERODORPS}}": data.data.Rps.IdentificacaoRps.Serie,
        "{{TIPOODORPS}}": data.data.Rps.IdentificacaoRps.Tipo,
        "{{QRCODE}}": `${qrcodelink}`,
        "{{LOGOEMPRESA}}": `${data.admin.picture}`,
        "{{NUMERO}}": getValue("ns2:Numero"),
        "{{DATA_EMISSAO}}": formatDate(getValue2("ns2:DataEmissao")),
        "{{DATA_COMPETENCIA}}": formatDate(getValue2("ns2:Competencia")),
        "{{CODIGO_VERIFICACAO}}": getValue("ns2:CodigoVerificacao"),
        "{{RAZAO_SOCIAL_PRESTADOR}}": getValue("ns2:RazaoSocial"),
        "{{NOME_FANTASIA_PRESTADOR}}": '',
        "{{INSCRICAO_ESTADUAL_PRESTADOR}}": '',
        "{{MUNICIPIO_PRESTADOR}}": `${data.admin.cidade}`,
        "{{UF_PRESTADOR}}": `${data.admin.estado}`,
        "{{CNPJ/CPF_PRESTADOR}}": formatCpfCnpj(`${data.admin.cnpj}`),
        "{{INSCRICAO_MUNICIPAL}}": `${data.admin.inscricaoMunicipal}` || '',
        "{{ENDERECO_PRESTADOR}}": getPrestadorEndereco(),
        "{{CEP_PRESTADOR}}": xmlDoc.getElementsByTagName("ns2:PrestadorServico")[0].getElementsByTagName("ns2:Endereco")[0].getElementsByTagName("ns2:Cep")[0].textContent?.trim(),
        "{{TELEFONE_PRESTADOR}}": getValue("ns2:Telefone"),
        "{{EMAIL_PRESTADOR}}": getValue("ns2:Email"),
        "{{DESCRICAO}}": getValue("ns2:Discriminacao"),
        "{{CNAE}}": getValue("ns2:CodigoCnae"),
        "{{VALOR_SERVICOS}}": formatCurrency(getValue2("ns2:ValorServicos")),
/*         "{{ALIQUOTA}}": `${formatPercentage(getValue2("ns2:Aliquota"))}%`, */
        "{{BASE_CALCULO}}": formatCurrency(getValue2("ns2:BaseCalculo")),
/*         "{{VALOR_ISS}}": formatCurrency(getValue2("ns2:ValorIss")), */


        "{{TOMADOR_RAZAO_SOCIAL}}": getTomadorValue("ns2:RazaoSocial"),
        "{{TOMADOR_NOME_FANTASIA}}": '',
        "{{TOMADOR_CNPJ/CPF}}": formatCpfCnpj(`${documento}`),
        "{{TOMADOR_INSCRICAO_MUNICIPAL}}": getTomadorValue("ns2:InscricaoMunicipal"),
        "{{TOMADOR_INSCRICAO_ESTADUAL}}": '',
        "{{TOMADOR_PHONE}}": xmlDoc.getElementsByTagName("ns2:Tomador")[0].getElementsByTagName("ns2:Contato")[0].getElementsByTagName("ns2:Telefone")[0].textContent?.trim(),
        "{{TOMADOR_EMAIL}}": `${data.user.email}`,
        "{{TOMADOR_ENDERECO}}": getTomadorEndereco(),
/*         "{{TOMADOR_ENDERECO}}": `${data.customer.address.street}, ${data.customer.address.number} - ${data.customer.address.neighborhood}`, */
        "{{TOMADOR_CEP}}": xmlDoc.getElementsByTagName("ns2:Tomador")[0].getElementsByTagName("ns2:Endereco")[0].getElementsByTagName("ns2:Cep")[0].textContent?.trim(),
        "{{TOMADOR_MUNICIPIO_UF}}": `${data.user.cidade}/${data.user.estado}`,
        "{{CHAVE_ACESSO}}": getValue("ns2:ChaveAcesso"),

        "{{ITEM_SERVICO}}": xmlDoc.getElementsByTagName("ns2:ListaItensServico")[0].getElementsByTagName("ns2:ItemServico")[0].getElementsByTagName("ns2:Descricao")[0].textContent?.trim(),
        "{{ITEM_LISTA_SERVICO}}": xmlDoc.getElementsByTagName("ns2:ListaItensServico")[0].getElementsByTagName("ns2:ItemServico")[0].getElementsByTagName("ns2:ItemListaServico")[0].textContent?.trim(),
        "{{TRIBUTAVEL_ITEM_SERVICO}}": xmlDoc.getElementsByTagName("ns2:ListaItensServico")[0].getElementsByTagName("ns2:ItemServico")[0].getElementsByTagName("ns2:Tributavel")[0].textContent?.trim(),
        "{{QUANTIDADE_ITEM_SERVICO}}": xmlDoc.getElementsByTagName("ns2:ListaItensServico")[0].getElementsByTagName("ns2:ItemServico")[0].getElementsByTagName("ns2:Quantidade")[0].textContent?.trim(),
        "{{VALOR_UNI_ITEM_SERVICO}}": xmlDoc.getElementsByTagName("ns2:ListaItensServico")[0].getElementsByTagName("ns2:ItemServico")[0].getElementsByTagName("ns2:ValorUnitario")[0].textContent?.trim(),
        "{{VALOR_DESC_COND_ITEM_SERVICO}}": xmlDoc.getElementsByTagName("ns2:Servico")[0].getElementsByTagName("ns2:Valores")[0].getElementsByTagName("ns2:DescontoCondicionado")[0].textContent?.trim(),
        "{{VALOR_TOTAL_DESCONTO_ITEM_SERVICO}}": xmlDoc.getElementsByTagName("ns2:ListaItensServico")[0].getElementsByTagName("ns2:ItemServico")[0].getElementsByTagName("ns2:ValorDesconto")[0].textContent?.trim(),
        "{{VALOR_DESC_INC_ITEM_SERVICO}}": xmlDoc.getElementsByTagName("ns2:Servico")[0].getElementsByTagName("ns2:Valores")[0].getElementsByTagName("ns2:DescontoIncondicionado")[0].textContent?.trim(),
        "{{VALOR_LIQUIDO_ITEM_SERVICO}}": xmlDoc.getElementsByTagName("ns2:ListaItensServico")[0].getElementsByTagName("ns2:ItemServico")[0].getElementsByTagName("ns2:ValorLiquido")[0].textContent?.trim(),

        "{{VALOR_SERVICOS_VALORES}}": xmlDoc.getElementsByTagName("ns2:Servico")[0].getElementsByTagName("ns2:Valores")[0].getElementsByTagName("ns2:ValorServicos")[0].textContent?.trim(),
        "{{VALOR_DEDUCOES}}": xmlDoc.getElementsByTagName("ns2:Servico")[0].getElementsByTagName("ns2:Valores")[0].getElementsByTagName("ns2:ValorDeducoes")[0]?.textContent?.trim(),
        
        "{{ALIQUOTA_PIS}}": data.data.Rps.Servico.Valores.AliquotaPis,
        "{{RETIDO_PIS}}": data.data.Rps.Servico.Valores.RetidoPis === 1 ? 'Sim' : 'Não',    /* xmlDoc.getElementsByTagName("ns2:Servico")[0].getElementsByTagName("ns2:Valores")[0].getElementsByTagName("ns2:RetidoPis")[0]?.textContent?.trim(), */         
        "{{VALOR_PIS}}": xmlDoc.getElementsByTagName("ns2:Servico")[0].getElementsByTagName("ns2:Valores")[0].getElementsByTagName("ns2:ValorPis")[0]?.textContent?.trim(),
        
        "{{ALIQUOTA_COFINS}}": data.data.Rps.Servico.Valores.AliquotaCofins,
        "{{RETIDO_COFINS}}": data.data.Rps.Servico.Valores.RetidoCofins === 1 ? 'Sim' : 'Não',/*  xmlDoc.getElementsByTagName("ns2:Servico")[0].getElementsByTagName("ns2:Valores")[0].getElementsByTagName("ns2:RetidoCofins")[0]?.textContent?.trim() */
        "{{VALOR_COFINS}}": xmlDoc.getElementsByTagName("ns2:Servico")[0].getElementsByTagName("ns2:Valores")[0].getElementsByTagName("ns2:ValorCofins")[0]?.textContent?.trim(),
        
        "{{ALIQUOTA_INSS}}": data.data.Rps.Servico.Valores.AliquotaInss,
        "{{RETIDO_INSS}}": data.data.Rps.Servico.Valores.RetidoInss === 1 ? 'Sim' : 'Não'/* xmlDoc.getElementsByTagName("ns2:Servico")[0].getElementsByTagName("ns2:Valores")[0].getElementsByTagName("ns2:RetidoInss")[0]?.textContent?.trim() */,
        "{{VALOR_INSS}}": xmlDoc.getElementsByTagName("ns2:Servico")[0].getElementsByTagName("ns2:Valores")[0].getElementsByTagName("ns2:ValorInss")[0]?.textContent?.trim(),
        
        "{{ALIQUOTA_IR}}": data.data.Rps.Servico.Valores.AliquotaIr,
        "{{RETIDO_IR}}": data.data.Rps.Servico.Valores.AliquotaIr === 1 ? 'Sim' : 'Não'/* xmlDoc.getElementsByTagName("ns2:Servico")[0].getElementsByTagName("ns2:Valores")[0].getElementsByTagName("ns2:RetidoIr")[0]?.textContent?.trim() */,
        "{{VALOR_IR}}": xmlDoc.getElementsByTagName("ns2:Servico")[0].getElementsByTagName("ns2:Valores")[0].getElementsByTagName("ns2:ValorIr")[0]?.textContent?.trim(),
        
        "{{ALIQUOTA_CSLL}}": data.data.Rps.Servico.Valores.AliquotaCsll,
        "{{RETIDO_CSLL}}": data.data.Rps.Servico.Valores.AliquotaCsll === 1 ? 'Sim' : 'Não'/* xmlDoc.getElementsByTagName("ns2:Servico")[0].getElementsByTagName("ns2:Valores")[0].getElementsByTagName("ns2:RetidoCsll")[0]?.textContent?.trim() */,
        "{{VALOR_CSLL}}": xmlDoc.getElementsByTagName("ns2:Servico")[0].getElementsByTagName("ns2:Valores")[0].getElementsByTagName("ns2:ValorCsll")[0]?.textContent?.trim(),
        
        "{{ALIQUOTA_CPP}}": (data.data.Rps.Servico.Valores.AliquotaCpp.toFixed(2)),
        "{{RETIDO_CPP}}": data.data.Rps.Servico.Valores.AliquotaCpp === 1 ? 'Sim' : 'Não',
        "{{VALOR_CPP}}": xmlDoc.getElementsByTagName("ns2:Servico")[0].getElementsByTagName("ns2:Valores")[0].getElementsByTagName("ns2:ValorCpp")[0]?.textContent?.trim(),
        
        
        "{{OUTRAS_RETENCOES}}": xmlDoc.getElementsByTagName("ns2:Servico")[0].getElementsByTagName("ns2:Valores")[0].getElementsByTagName("ns2:OutrasRetencoes")[0]?.textContent?.trim(),
        "{{RETIDO_OUTRAS_RETENCOES}}": xmlDoc.getElementsByTagName("ns2:Servico")[0].getElementsByTagName("ns2:Valores")[0].getElementsByTagName("ns2:RetidoOutrasRetencoes")[0]?.textContent?.trim(),
        "{{VALOR_ISS}}": xmlDoc.getElementsByTagName("ns2:Servico")[0].getElementsByTagName("ns2:Valores")[0].getElementsByTagName("ns2:ValorIss")[0]?.textContent?.trim(),
        "{{ALIQUOTA}}": xmlDoc.getElementsByTagName("ns2:Servico")[0].getElementsByTagName("ns2:Valores")[0].getElementsByTagName("ns2:Aliquota")[0]?.textContent?.trim(),

        "{{VALOR_LIQUIDO_NFSE}}": xmlDoc.getElementsByTagName("ns2:ValoresNfse")[0].getElementsByTagName("ns2:ValorLiquidoNfse")[0].textContent?.trim(),

      };

      const html = Object.entries(replacements).reduce(
        (acc, [key, value]) => acc.replace(new RegExp(key, 'g'), value),
        htmlWithCss
      );

      const file = { content: html }; // HTML final com CSS
      const options = { format: 'A4', printBackground: true };

      // Gerar o PDF diretamente e enviar na resposta
      pdf.generatePdf(file, options, (err, pdfBuffer) => {
        if (err) {
          console.error('Erro ao gerar PDF:', err);
          return res.status(500).send({ message: 'Erro ao gerar PDF' });
        }

        if (!pdfBuffer || pdfBuffer.length === 0) {
          return res.status(500).send({ message: 'PDF gerado está vazio' });
        }

        // Configuração dos headers para envio do PDF
        res.writeHead(200, {
          'Content-Type': 'application/pdf',
          'Content-Length': pdfBuffer.length,
          'Content-Disposition': 'attachment; filename=NFSe.pdf'
        });

        return res.end(pdfBuffer);
      });

    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      return res.status(500).send({ message: 'Erro ao gerar PDF' });
    }
  } catch (error) {
    console.error('Erro interno:', error);
    return res.status(500).send({ message: 'Erro interno no servidor' });
  }
};

const cancel_invoice = async (req: CustomRequest, res: Response) => {
  try {
      const user = req.userObject;
      const body = req.body;
      let messageError = '';

      if(!user){
        res.status(400).send({message:'User not found!'});
        return;
      }

      async function verificarNFSe(xml: any): Promise<boolean> {
        return new Promise((resolve, reject) => {
            xml2js.parseString(xml, { explicitArray: false }, (err, result) => {
                if (err) return reject(err);
    
                try {
                    const body = result["SOAP-ENV:Envelope"]["SOAP-ENV:Body"];
                    const resposta = body["ns2:CancelarNfseResposta"];
                    
                    if (resposta["ns2:ListaMensagemRetorno"]) {
                        console.error("Erro no cancelamento da NFS-e:", resposta["ns2:ListaMensagemRetorno"]["ns2:MensagemRetorno"]);
                        messageError = resposta["ns2:ListaMensagemRetorno"]["ns2:MensagemRetorno"]["ns2:Correcao"];
                        return resolve(false);
                    }                   
                    return resolve(true);
                } catch (e) {
                    reject(e);
                }
            });
        });
      }

      const data: DataCancelarNfseEnvio = {
        IdInvoice: body.IdInvoice, 
        CpfCnpj: user!.cnpj,
        InscricaoMunicipal: user!.inscricaoMunicipal,
        Senha: user!.senhaelotech,
        Homologa: user!.homologa,
        NumeroNfse: body.NumeroNfse,
        CpfCnpjNfse: body.CpfCnpjNfse,
        InscricaoMunicipalNfse: body.InscricaoMunicipalNfse,
        CodigoMunicipioNfse: body.CodigoMunicipioNfse,
        ChaveAcesso: body.ChaveAcesso,
        CodigoCancelamento: 1,
      }

      const response = await NFseService.cancelarNfse(data);
      const nfseGerada = await verificarNFSe(response);

      if (!nfseGerada) {
        res.status(200).send({message: messageError});
        return;
      }

      const id = body.IdInvoice;
      await InvoiceService.UpdateInvoice(id,{status: 'cancelada', valor: 0});
      res.status(200).send({message: 'Nota Fiscal Cancelada com sucesso!'});
      
    } catch (error) {
      res.status(500).send({message: 'Não foi possivel cancelar Nota Fiscal', error});
  }
}

const cancel_invoice_admin = async (req: CustomRequest, res: Response) => {
  try {

      const {invoice, user} = req.body;
      let messageError = '';

      if(!user){
        res.status(400).send({message:'User not found!'});
        return;
      }

      async function verificarNFSe(xml: any): Promise<boolean> {
        return new Promise((resolve, reject) => {
            xml2js.parseString(xml, { explicitArray: false }, (err, result) => {
                if (err) return reject(err);
    
                try {
                    const body = result["SOAP-ENV:Envelope"]["SOAP-ENV:Body"];
                    const resposta = body["ns2:CancelarNfseResposta"];
                    
                    if (resposta["ns2:ListaMensagemRetorno"]) {
                        console.error("Erro no cancelamento da NFS-e:", resposta["ns2:ListaMensagemRetorno"]["ns2:MensagemRetorno"]);
                        messageError = resposta["ns2:ListaMensagemRetorno"]["ns2:MensagemRetorno"]["ns2:Correcao"];
                        return resolve(false);
                    }                   
                    return resolve(true);
                } catch (e) {
                    reject(e);
                }
            });
        });
      }

      const data: DataCancelarNfseEnvio = {
        IdInvoice: invoice.IdInvoice, 
        CpfCnpj: user!.cnpj,
        InscricaoMunicipal: user!.inscricaoMunicipal,
        Senha: user!.senhaelotech,
        Homologa: user!.homologa,
        NumeroNfse: invoice.NumeroNfse,
        CpfCnpjNfse: invoice.CpfCnpjNfse,
        InscricaoMunicipalNfse: invoice.InscricaoMunicipalNfse,
        CodigoMunicipioNfse: invoice.CodigoMunicipioNfse,
        ChaveAcesso: invoice.ChaveAcesso,
        CodigoCancelamento: 1,
      }

      const response = await NFseService.cancelarNfse(data);
      const nfseGerada = await verificarNFSe(response);

      if (!nfseGerada) {
        res.status(200).send({message: messageError});
        return;
      }

      const id = invoice.IdInvoice;
      await InvoiceService.UpdateInvoice(id,{status: 'cancelada', valor: 0});
      res.status(200).send({message: 'Nota Fiscal Cancelada com sucesso!'});
      
    } catch (error) {
      res.status(500).send({message: 'Não foi possivel cancelar Nota Fiscal', error});
  }
}

const replace_invoice = async  (req: CustomRequest, res: Response) => {
  try {
    const user = req.userObject;
    let messageError = '';

    const {
      IdInvoice,
      customer_id, 
      servico,
      numeroNfse,
      CodigoMunicipio,
      ChaveAcesso,
      NumeroLote,
      IdentificacaoRpsnumero,
    } = req.body;

    const date = new Date();
    const year = date.getFullYear(); 
    const month = String(date.getMonth() + 1).padStart(2, '0'); 
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;


    const customer = await CustomerService.FindCostumerByIdService(customer_id);

    if(!customer){
      res.status(400).send({message: 'User is no found!'});
      return;
    }

    const substituirNfseEnvio: SubstituirNfseEnvio = {
      IdentificacaoRequerente: {
        CpfCnpj: {
          Cnpj: user!.cnpj,
        },
        InscricaoMunicipal: user!.inscricaoMunicipal,
        Senha: user!.senhaelotech,
        Homologa: user!.homologa,
      },
      Pedido: {
        InfPedidoCancelamento: {
          Id: "pedido_" + numeroNfse, // Adicionado ID único para o pedido
          IdentificacaoNfse: {
            Numero: numeroNfse,
            CpfCnpj: {
              Cnpj: user!.cnpj,
            },
            InscricaoMunicipal: user!.inscricaoMunicipal,
            CodigoMunicipio: CodigoMunicipio,
          },
          ChaveAcesso: ChaveAcesso,
          CodigoCancelamento: 1, // 1 para substituição
          // Removido ChaveAcesso pois não está na interface
        },
      },
      Rps: { // Alterado de DeclaracaoPrestacaoServico para Rps
        InfDeclaracaoPrestacaoServico: {
          Id: "rps_" + IdentificacaoRpsnumero.toString(), // Adicionado ID único
          Rps: {
            IdentificacaoRps: {
              Numero: IdentificacaoRpsnumero.toString(),
              Serie: "D",
              Tipo: 1,
            },
            DataEmissao: formattedDate,
            Status: 1,
          },
          Competencia: formattedDate,
          Servico: {
            Valores: {
              ValorServicos: servico.valor_unitario * servico.quantidade,
              ValorDeducoes: servico.ValorDeducoes || 0,
              AliquotaPis: servico.AliquotaPis || 0,
              RetidoPis: servico.RetidoPis || 2,
              ValorPis: servico.ValorPis || 0,
              AliquotaCofins: servico.AliquotaCofins || 0,
              RetidoCofins: servico.RetidoCofins || 2,
              ValorCofins: servico.ValorCofins || 0,
              AliquotaInss: servico.AliquotaInss || 0,
              RetidoInss: servico.RetidoInss || 2,
              ValorInss: servico.ValorInss || 0,
              AliquotaIr: servico.AliquotaIr || 0, 
              RetidoIr: servico.RetidoIr || 2, 
              ValorIr: servico.ValorIr || 0,
              AliquotaCsll: servico.AliquotaCsll || 0,
              RetidoCsll: servico.RetidoCsll || 2,
              ValorCsll: servico.ValorCsll || 0,
              AliquotaCpp: servico.AliquotaCpp || 0,
              RetidoCpp: servico.RetidoCpp || 2,
              ValorCpp: servico.ValorCpp || 0,
              RetidoOutrasRetencoes: servico.RetidoOutrasRetencoes || 0, // Alterado para number
              Aliquota: servico.Aliquota || 2,
              DescontoIncondicionado: servico.DescontoIncondicionado || 0.00,
              DescontoCondicionado: servico.DescontoCondicionado || 0.00,
            },
            IssRetido: 2,
            Discriminacao: servico.Discriminacao,
            CodigoMunicipio: '4115804',
            ExigibilidadeISS: 1,
            MunicipioIncidencia: '4115804',
            ListaItensServico: [
              {
                ItemListaServico: servico.item_lista,
                CodigoCnae: servico.cnae,
                Descricao: servico.descricao,
                Tributavel: 1,
                Quantidade: servico.quantidade,
                ValorUnitario: servico.valor_unitario,
                ValorLiquido: (servico.valor_unitario * servico.quantidade) - (servico.desconto || 0),
              },
            ],
          },
          Prestador: {
            CpfCnpj: {
              Cnpj: user!.cnpj,
            },
            InscricaoMunicipal: user!.inscricaoMunicipal,
          },
          Tomador: {
            IdentificacaoTomador: {
              CpfCnpj: {
                Cnpj: customer.cnpj,
              },
              InscricaoMunicipal: customer.inscricaoMunicipal,
              InscricaoEstadual: customer.inscricaoEstadual || undefined, // Opcional
            },
            RazaoSocial: customer.name,
            Endereco: {
              Endereco: customer.address.street,
              Numero: customer.address.number,
              Bairro: customer.address.neighborhood,
              CodigoMunicipio: customer.address.cityCode,
              Uf: customer.address.state,
              Cep: customer.address.zipCode,
            },
            Contato: {
              Telefone: customer.phone || undefined, // Opcional
              Email: customer.email || undefined, // Opcional
            },
          },
          RegimeEspecialTributacao: user!.RegimeEspecialTributacao || undefined, // Opcional
          IncentivoFiscal: user!.IncentivoFiscal,
        },
      },
    };

    const data: GerarNfseEnvio = {
      Requerente: {
      Cnpj: user!.cnpj,
      InscricaoMunicipal: user!.inscricaoMunicipal,
      Senha: user!.senhaelotech,
      Homologa: user!.homologa,
      },
      LoteRps: {
      NumeroLote: NumeroLote.toString(),
      Cnpj: user!.cnpj,
      InscricaoMunicipal: user!.inscricaoMunicipal,
      QuantidadeRps: 1,
      },
      Rps: {
      IdentificacaoRps: {
        Numero: IdentificacaoRpsnumero.toString(),
        Serie: "D",
        Tipo: 1,
      },
      DataEmissao: formattedDate,
      Status: 1,
      Competencia: formattedDate,
      Servico: {
        Valores: {
          ValorServicos: servico.valor_unitario * servico.quantidade,
          ValorDeducoes: servico.ValorDeducoes || 0,
          AliquotaPis: servico.AliquotaPis || 0,
          RetidoPis: servico.RetidoPis || 2,
          ValorPis: servico.ValorPis || 0,
          AliquotaCofins: servico.AliquotaCofins || 0,
          RetidoCofins: servico.RetidoCofins || 2,
          ValorCofins: servico.ValorCofins || 0,
          AliquotaInss: servico.AliquotaInss || 0,
          RetidoInss: servico.RetidoInss || 2,
          ValorInss: servico.ValorInss || 0,
          AliquotaIr: servico.AliquotaIr || 0, 
          RetidoIr: servico.RetidoIr || 2, 
          ValorIr: servico.ValorIr || 0,
          AliquotaCsll: servico.AliquotaCsll || 0,
          RetidoCsll: servico.RetidoCsll || 2,
          ValorCsll: servico.ValorCsll || 0,
          AliquotaCpp: servico.AliquotaCpp || 0,
          RetidoCpp: servico.RetidoCpp || 2,
          ValorCpp: servico.ValorCpp || 0,
          RetidoOutrasRetencoes: servico.RetidoOutrasRetencoes || 2,
          Aliquota: servico.Aliquota || 2,
          DescontoIncondicionado: servico.DescontoIncondicionado || 0.00,
          DescontoCondicionado: servico.DescontoCondicionado || 0.00,
        },
        IssRetido: 2,
        Discriminacao: servico.Discriminacao,
        CodigoMunicipio: '4115804',
        ExigibilidadeISS: 1,
        MunicipioIncidencia: '4115804',
        ListaItensServico: [
        {
          ItemListaServico: servico.item_lista,
          CodigoCnae: servico.cnae,
          Descricao: servico.descricao,
          Tributavel: 1,
          Quantidade: servico.quantidade,
          ValorUnitario: servico.valor_unitario,
          ValorLiquido: (servico.valor_unitario * servico.quantidade) - (servico.desconto || 0),
        },
        ],
      },
      Prestador: {
        Cnpj: user!.cnpj,
        InscricaoMunicipal: user!.inscricaoMunicipal,
      },
      Tomador: {
        IdentificacaoTomador: {
        InscricaoMunicipal: customer.inscricaoMunicipal,
        InscricaoEstadual: customer.inscricaoEstadual,
        CpfCnpj: customer.cnpj,
        },
        RazaoSocial: customer.name,
        Endereco: {
        Endereco: customer.address.street,
        Numero: customer.address.number,
        Bairro: customer.address.neighborhood,
        CodigoMunicipio: customer.address.cityCode,
        Uf: customer.address.state,
        Cep: customer.address.zipCode,
        },
        Contato: {
        Telefone: customer.phone,
        Email: customer.email,
        },
      },
      RegimeEspecialTributacao: user!.RegimeEspecialTributacao,
      IncentivoFiscal: user!.IncentivoFiscal,
      },
    };

    async function verificarNFSe(xml: any) {
      return new Promise((resolve, reject) => {
          xml2js.parseString(xml, { explicitArray: false }, (err, result) => {
              if (err) return reject(err);
  
              try {
                  const body = result["SOAP-ENV:Envelope"]["SOAP-ENV:Body"];
                  const resposta = body["ns2:SubstituirNfseResposta"];
  
                  if (resposta["ns2:ListaMensagemRetorno"]) {
                      console.error("Erro na geração da NFS-e:", resposta["ns2:ListaMensagemRetorno"]["ns2:MensagemRetorno"]);
                      messageError = resposta["ns2:ListaMensagemRetorno"]["ns2:MensagemRetorno"]["ns2:Mensagem"];
                      return resolve(false);
                  }

                  if (resposta["ns2:ListaMensagemRetorno"]) {
                    const mensagemRetorno = resposta["ns2:ListaMensagemRetorno"]["ns2:MensagemRetorno"];
                    if (mensagemRetorno) {
                      console.error("Erro na substituição da NFS-e:", mensagemRetorno);
                      if (Array.isArray(mensagemRetorno)) {
                        messageError = mensagemRetorno.map((msg: any) => msg["ns2:Mensagem"]).join("; ");
                      } else {
                        messageError = mensagemRetorno["ns2:Mensagem"];
                      }
                      return resolve(false);
                    }
                  }

                  return resolve(true);
              } catch (e) {
                  reject(e);
              }
          });
      });
    } 

    console.log(JSON.stringify(substituirNfseEnvio, null, 2));

    const response = await NFseService.SubstituirNfse(substituirNfseEnvio);

    //console.log(response);

    const nfseGerada = await verificarNFSe(response);

     if (!nfseGerada) {
      res.status(200).send({message: messageError});
      return;
    } 
    const valor_total = servico.valor_unitario * servico.quantidade;
    await InvoiceService.UpdateInvoice(IdInvoice, {valor: valor_total,xml: response, data: data, status: 'substituida'});
    res.status(200).send({message: 'Nota Fiscal Substituida com sucesso!'});
    return;
  } catch (error) {
    res.status(500).send({message: 'Não foi possivel substituir Nota Fiscal', error});
}
}

const findinvoices = async (req: Request, res: Response) => {
  try{
    const invoices = await InvoiceService.FindAllInvoices();
    res.status(200).send(invoices);
  }catch(error){
    res.status(500).send({message: "Não foi possivel buscar as notas fiscais"});
  }
}

const findinvoicesuser = async (req: CustomRequest, res: Response) => {
  try{
    const user = req.userObject;
    const invoices = await InvoiceService.FindInvoices(user!.id);
    res.status(200).send(invoices);
  }catch(error){
    res.status(500).send({message: "Não foi possivel buscar as notas fiscais"});
  }
}

const findinvoicescustomer = async (req: CustomRequest, res: Response) => {
  try{
    const id = req.params.id;
    const invoices = await InvoiceService.FindInvoiceCustomer(id);
    res.status(200).send(invoices);
  }catch(error){
    res.status(500).send({message: "Não foi possivel buscar as notas fiscais"});
  }
}

const findinvoicescustomeradmin = async (req: CustomRequest, res: Response) => {
  try{
    const id = req.params.id;
    const invoices = await InvoiceService.FindInvoiceCustomerAdmin(id);
    res.status(200).send(invoices);
  }catch(error){
    res.status(500).send({message: "Não foi possivel buscar as notas fiscais"});
  }
}

const findinvoicesadmin = async (req: CustomRequest, res: Response) => {
  try{
    const id = req.params.id;
    const invoices = await InvoiceService.FindInvoices(id);
    res.status(200).send(invoices);
  }catch(error){
    res.status(500).send({message: "Não foi possivel buscar as notas fiscais"});
  }
}

const find_invoice = async (req: CustomRequest, res: Response) => {
  try{
    const id = req.params.id;

    if(!id){
      res.status(400).send({message: 'ID is not found!'});
      return;
    }

    const invoices = await InvoiceService.FindInvoice(id);
    res.status(200).send(invoices);
  }catch(error){
    res.status(500).send({message: "Não foi possivel buscar as notas fiscais"});
  }
}

/* INUTIL POR ENQUANTO */
const consult_invoice = async (req: CustomRequest, res: Response) => {
  try {
      //const user = req.userObject;
      //const body = req.body;

      const data: DataConsultaNFSE = {
        NumeroRps: '2',
        SerieRps: 'D',
        TipoRps: 1,
        CnpjCpf: '57278676000169',
        InscricaoMunicipal: '00898131',
        Senha: 'HHFTHGRB',
        Homologa: false,
      }

      const response = await NFseService.consultarNfse(data);

      res.status(200).send(response);
      
    } catch (error) {
      res.status(500).send({message: 'Não foi possivel consultar Nota Fiscal', error});
  }
}

export default 
{
  create_invoice,
  findinvoicesuser,
  consult_invoice,
  cancel_invoice,
  replace_invoice,
  findinvoicescustomer,
  findinvoices,
  find_invoice,
  create_nfse_pdf,
  create_invoice_admin,
  findinvoicesadmin,
  findinvoicescustomeradmin,
  cancel_invoice_admin,
  create_nfse_pdf_admin
};


/*         const body = {
          customer_id: 'id_do_cliente',
          servico: {
            Discriminacao: "CONTRATO MENSAL",
            descricao: "Desenvolvimento de sistema ERP",
            item_lista: "104",
            cnae: "6201501",
            quantidade: 1,
            valor_unitario: 1500.00,
            desconto: 0.00
          },
          tributacao: {
            iss_retido: 2,            // 1 para true e 2 para false
            aliquota_iss: 4.41,       // Alíquota do município do prestador
            retencoes: {
              irrf: 1.5,              // 1,5% se houver retenção
              pis: 0,
              cofins: 0
            }
          }          
        } */
