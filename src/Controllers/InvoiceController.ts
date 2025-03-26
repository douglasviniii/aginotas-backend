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
        Tributavel: string;
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
    Cnpj: string;
    InscricaoMunicipal: string;
    Senha: string;
    Homologa: boolean;
  };
  Pedido: {
    InfPedidoCancelamento: {
      IdentificacaoNfse: {
        Numero: string;
        Cnpj: string;
        InscricaoMunicipal: string;
        CodigoMunicipio: string;
      };
      ChaveAcesso: string;
      CodigoCancelamento: string;
    };
  };
  DeclaracaoPrestacaoServico: {
    InfDeclaracaoPrestacaoServico: {
      Rps: {
        IdentificacaoRps: {
          Numero: string;
          Serie: string;
          Tipo: string;
        };
        DataEmissao: string;
        Status: string;
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
        ListaItensServico: {
          ItemServico: {
            ItemListaServico: string;
            CodigoCnae: string;
            Descricao: string;
            Tributavel: string;
            Quantidade: number;
            ValorUnitario: number;
            ValorLiquido: number;
          };
        };
      };
      Prestador: {
        Cnpj: string;
        InscricaoMunicipal: string;
      };
      Tomador: {
        IdentificacaoTomador: {
          Cnpj: string;
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
    return { numeroLote: 1, identificacaoRpsnumero:1 };
  }

  let numeroLote = lastInvoice.numeroLote + 1;
  let identificacaoRpsnumero = lastInvoice.identificacaoRpsnumero + 1;
  

  return { numeroLote, identificacaoRpsnumero };
}


const create_invoice = async (req: CustomRequest, res: Response) => {
    try {
        const user = req.userObject;
        const {customer_id, servico, tributacao} = req.body;
        
        if(!customer_id || !servico || !tributacao){
          res.status(400).send({message:'customer_id or service or taxation is null!'});
          return;
        }

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

        const id = user?.id;
        let { numeroLote, identificacaoRpsnumero } = await UpdateNumbers(id!);

        const customer = await CustomerService.FindCostumerByIdService(customer_id);

        if(!customer){
          res.status(400).send({message: 'User is no found!'});
          return;
        }

        const date = new Date();
        const year = date.getFullYear(); 
        const month = String(date.getMonth() + 1).padStart(2, '0'); 
        const day = String(date.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;

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
                ValorDeducoes: servico.desconto || 0.00,
                AliquotaPis: 0,
                RetidoPis: 2,
                AliquotaCofins: 0,
                RetidoCofins: 2,
                AliquotaInss: 0,
                RetidoInss: 2,
                AliquotaIr: tributacao.retencoes.irrf || 0, 
                RetidoIr: tributacao.retencoes.irrf > 0 ? 1 : 2, 
                AliquotaCsll: 0,
                RetidoCsll: 2,
                RetidoCpp: 2,
                RetidoOutrasRetencoes: 2,
                Aliquota: tributacao.aliquota_iss,
                DescontoIncondicionado: 0.00,
                DescontoCondicionado: 0.00,
              },
              IssRetido: tributacao.iss_retido ? 1 : 2, 
              Discriminacao: servico.Discriminacao,
              CodigoMunicipio: customer.address.cityCode,
              ExigibilidadeISS: 1,
              MunicipioIncidencia: customer.address.cityCode,
              ListaItensServico: [
                {
                  ItemListaServico: servico.item_lista,
                  CodigoCnae: servico.cnae,
                  Descricao: servico.descricao,
                  Tributavel: "1",
                  Quantidade: servico.quantidade,
                  ValorUnitario: servico.valor_unitario,
                  ValorDesconto: servico.desconto || 0.00,
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
                Cnpj: customer.cnpj,
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

        switch (user?.cidade) {
          case "Medianeira":

          const response = await NFseService.enviarNfse(data);

          const nfseGerada = await verificarNFSe(response);
        
          if (!nfseGerada) {
              res.status(400).send({ message: "Erro na emissão da NFS-e. Verifique os dados." });
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
            break;

        default:
           res.status(400).send({message: "Não atende a cidade informada"});
           return;
        } 

        return;      
      } catch (error) {
        res.status(500).send({message: 'Não foi possivel gerar a nota fiscal', error});
        return;
    }
}

const cancel_invoice = async (req: CustomRequest, res: Response) => {
  try {
      const user = req.userObject;
      const body = req.body;

      const data: DataCancelarNfseEnvio = {
        IdInvoice: 't4tg4ergfe45tr43t3e4', //body.IdInvoice
        CpfCnpj: '57278676000169', //user.cnpj
        InscricaoMunicipal: '00898131', //user.inscricaoMunicipal
        Senha: 'KK89BRGH', //user.senhaelotech
        Homologa: true, //user.homologa
        NumeroNfse: '', //body.NumeroNfse
        CpfCnpjNfse: '', //body.CpfCnpjNfse
        InscricaoMunicipalNfse: '', //body.InscricaoMunicipalNfse
        CodigoMunicipioNfse: '', //body.CodigoMunicipioNfse
        ChaveAcesso: '', //body.ChaveAcesso
        CodigoCancelamento: 1, //body.CodigoCancelamento
      }

      const response = await NFseService.cancelarNfse(data);

      const id = body.IdInvoice;
      await InvoiceService.DeleteInvoice(id);

      res.status(200).send({message: 'Nota Fiscal Cancelada com sucesso!'});
      
    } catch (error) {
      res.status(500).send({message: 'Não foi possivel cancelar Nota Fiscal', error});
  }
}

const replace_invoice = async  (req: CustomRequest, res: Response) => {
  try {
    const user = req.userObject;
    const body = req.body;

    const data: DataSubstituirNfse = {
      IdentificacaoRequerente: {
        Cnpj: "12345678000199",
        InscricaoMunicipal: "98765",
        Senha: "senha123",
        Homologa: false,
      },
      Pedido: {
        InfPedidoCancelamento: {
          IdentificacaoNfse: {
            Numero: "5678",
            Cnpj: "12345678000199",
            InscricaoMunicipal: "98765",
            CodigoMunicipio: "1234567",
          },
          ChaveAcesso: "abcd1234efgh5678ijkl9012mnop3456",
          CodigoCancelamento: "1",
        },
      },
      DeclaracaoPrestacaoServico: {
        InfDeclaracaoPrestacaoServico: {
          Rps: {
            IdentificacaoRps: {
              Numero: "100",
              Serie: "A1",
              Tipo: "1",
            },
            DataEmissao: "2025-03-23",
            Status: "1",
          },
          Competencia: "2025-03-01",
          Servico: {
            Valores: {
              ValorServicos: 500.0,
              AliquotaPis: 1.5,
              RetidoPis: 0,
              ValorPis: 7.5,
              AliquotaCofins: 3.0,
              RetidoCofins: 0,
              ValorCofins: 15.0,
              AliquotaInss: 5.0,
              RetidoInss: 1,
              ValorInss: 25.0,
              AliquotaIr: 2.5,
              RetidoIr: 1,
              ValorIr: 12.5,
              AliquotaCsll: 1.0,
              RetidoCsll: 1,
              ValorCsll: 5.0,
              AliquotaCpp: 0.8,
              RetidoCpp: 1,
              ValorCpp: 4.0,
              OutrasRetencoes: 2.0,
              RetidoOutrasRetencoes: 0,
            },
            IssRetido: 1,
            Discriminacao: "Serviço de desenvolvimento de software",
            CodigoNbs: "1.0022",
            CodigoMunicipio: "1234567",
            ExigibilidadeISS: 1,
            MunicipioIncidencia: "1234567",
            ListaItensServico: {
              ItemServico: {
                ItemListaServico: "501",
                CodigoCnae: "6201500",
                Descricao: "Desenvolvimento de software sob encomenda",
                Tributavel: "1",
                Quantidade: 1,
                ValorUnitario: 500.0,
                ValorLiquido: 500.0,
              },
            },
          },
          Prestador: {
            Cnpj: "12345678000199",
            InscricaoMunicipal: "98765",
          },
          Tomador: {
            IdentificacaoTomador: {
              Cnpj: "98765432000188",
              InscricaoMunicipal: "54321",
            },
            RazaoSocial: "Empresa Fictícia LTDA",
            Endereco: {
              Endereco: "Rua Exemplo",
              Numero: "123",
              Bairro: "Centro",
              CodigoMunicipio: "1234567",
              Uf: "SP",
              Cep: "01001000",
            },
            Contato: {
              Telefone: "11987654321",
              Email: "contato@empresa.com",
            },
            InscricaoEstadual: "54321",
          },
          IncentivoFiscal: 0,
        },
      },
    };

    const response = await NFseService.SubstituirNfse(data);
    
    const dataupdate = {
      xml: response,
    }

    const IdInvoice = body.IdInvoice;

    await InvoiceService.UpdateInvoice(IdInvoice, dataupdate);
    res.status(200).send(response);
    
  } catch (error) {
    res.status(500).send({message: 'Não foi possivel substituir Nota Fiscal', error});
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
  findinvoicescustomer
};











/*                 {
                  itemListaServico: "802",
                  codigoCnae: "6201502",
                  descricao: "deducao",
                  tributavel: "2",
                  quantidade: "1.00000",
                  valorUnitario: "50.00000",
                  valorDesconto: "0.00",
                  valorLiquido: "50.00",
                  dadosDeducao: {
                    tipoDeducao: "M",
                    cpf: "00936697989",
                    valorTotalNotaFiscal: "50.00",
                    valorADeduzir: "50.00"
                  }
                } */