import { Request, Response } from 'express';
import InvoiceService from '../services/InvoiceService.ts';
import NFseService from '../services/NFseService.ts';
import UserService from '../services/UserService.ts';
import CustomerService from '../services/CustomerService.ts'
import xml2js from 'xml2js';

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
          OutrasRetencoes: number;
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

async function UpdateNumbers(id: string): Promise<DataUpdateObject> {
  const lastInvoice = await InvoiceService.FindLastInvoice(id);

  if (!lastInvoice) {
    return { numeroLote: 50, identificacaoRpsnumero: 50 };
  }

  let numeroLote = lastInvoice.numeroLote + 1;
  let identificacaoRpsnumero = lastInvoice.identificacaoRpsnumero + 1;
  

  return { numeroLote, identificacaoRpsnumero };
}

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
        let { numeroLote, identificacaoRpsnumero } = await UpdateNumbers(id!);

        console.log('numeroLote', numeroLote);
        console.log('identificacaoRpsnumero', identificacaoRpsnumero);

        const customer = await CustomerService.FindCostumerByIdService(customer_id);

        if(!customer){
          res.status(400).send({message: 'User is no found!'});
          return;
        }
        const date = new Date();
        const options = { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' } as const;
        const formattedDate = new Intl.DateTimeFormat('en-CA', options).format(date);

        const data: GerarNfseEnvio = {
          Requerente: {
            Cnpj: user!.cnpj,  
            InscricaoMunicipal: user!.inscricaoMunicipal, 
            Senha: user!.senhaelotech,
            Homologa: user!.homologa 
          },
          LoteRps: {
            NumeroLote: numeroLote.toLocaleString(),
            Cnpj: user!.cnpj,
            InscricaoMunicipal: user!.inscricaoMunicipal, 
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
                ValorServicos: servico.valor_unitario * servico.quantidade,
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

        switch (user?.cidade) {
          case "Medianeira":

          const response = await NFseService.enviarNfse(data);

          const nfseGerada = await verificarNFSe(response); //Verificar se a Nota foi gerada ou não.
        
          if (!nfseGerada) {
              res.status(200).send({message: messageError});
              return;
          }
        
            await InvoiceService.CreateInvoiceService({
              customer: customer_id,
              user: user?.id,
              valor: (servico.valor_unitario * servico.quantidade) - (servico.desconto || 0),
              xml: response,
              data: data,
              numeroLote: numeroLote,
              identificacaoRpsnumero: identificacaoRpsnumero,
            });

            res.status(200).send({message: 'Nota Fiscal gerada com sucesso!'});
            return;

        default:
           res.status(400).send({message: "Não atende a cidade informada"});
           return;
        }      
      } catch (error) {
        res.status(500).send({message: 'Erro interno no servidor', error});
        return;
    }
}

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

    const substituirNfseEnvio: DataSubstituirNfse = {
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
        IdentificacaoNfse: {
        Numero: numeroNfse,
        CpfCnpj: {
          Cnpj: user!.cnpj,
        },
        InscricaoMunicipal: user!.inscricaoMunicipal,
        CodigoMunicipio: CodigoMunicipio,
        },
        ChaveAcesso: ChaveAcesso,
        CodigoCancelamento: 4,
      },
      },
      DeclaracaoPrestacaoServico: {
      InfDeclaracaoPrestacaoServico: {
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
          AliquotaPis: 0,
          RetidoPis: 2,
          ValorPis: 0,
          AliquotaCofins: 0,
          RetidoCofins: 2,
          ValorCofins: 0,
          AliquotaInss: 0,
          RetidoInss: 2,
          ValorInss: 0,
          AliquotaIr: 0,
          RetidoIr: 2,
          ValorIr: 0,
          AliquotaCsll: 0,
          RetidoCsll: 2,
          ValorCsll: 0,
          AliquotaCpp: 0,
          RetidoCpp: 2,
          ValorCpp: 0,
          OutrasRetencoes: 0,
          RetidoOutrasRetencoes: 2,
        },
        IssRetido: 2,
        Discriminacao: servico.Discriminacao,
        CodigoNbs: "",
        CodigoMunicipio: customer.address.cityCode,
        ExigibilidadeISS: 1,
        MunicipioIncidencia: customer.address.cityCode,
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
        InscricaoEstadual: customer.inscricaoEstadual,
        },
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
        DescontoIncondicionado: 0.0,
        DescontoCondicionado: 0.0,
        },
        IssRetido: 2,
        Discriminacao: servico.Discriminacao,
        CodigoMunicipio: customer.address.cityCode,
        ExigibilidadeISS: 1,
        MunicipioIncidencia: customer.address.cityCode,
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

    //console.log(JSON.stringify(substituirNfseEnvio, null, 2));

    const response = await NFseService.SubstituirNfse(substituirNfseEnvio);

    //console.log(response);

    const nfseGerada = await verificarNFSe(response);

    if (!nfseGerada) {
      res.status(200).send({message: messageError});
      return;
    }

    await InvoiceService.UpdateInvoice(IdInvoice, {xml: response, data: data, status: 'substituida'});
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
  findinvoices
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
