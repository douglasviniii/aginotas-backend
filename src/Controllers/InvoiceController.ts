import { Request, Response } from 'express';
import InvoiceService from '../services/InvoiceService.ts';
import NFseService from '../services/NFseService.ts';

interface CustomRequest extends Request {
    userObject?: {
      id: string;
      name: string;
      cnpj: string;
      inscricaoMunicipal: string;
      email: string;
      cidade: string;
      senhaelotech: string;
      homologa: string;
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
    throw new Error("Nenhuma invoice encontrada.");
  }

  let numeroLote = lastInvoice.numeroLote + 1;
  let identificacaoRpsnumero = lastInvoice.identificacaoRpsnumero + 1;
  

  return { numeroLote, identificacaoRpsnumero };
}


const create_invoice = async (req: CustomRequest, res: Response) => {
    try {
        const user = req.userObject;
        const body = req.body;
        
        const id = user?.id;
        let { numeroLote, identificacaoRpsnumero } = await UpdateNumbers(id!);

        const date = new Date();
        const year = date.getFullYear(); 
        const month = String(date.getMonth() + 1).padStart(2, '0'); 
        const day = String(date.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;

        const data: GerarNfseEnvio = {
          Requerente: {
            Cnpj: "57278676000169", // user?.cnpj
            InscricaoMunicipal: "00898131", // user?.inscricaoMunicipal
            Senha: "KK89BRGH", // user?.senhaelotech
            Homologa: true, // user?.homologa
          },
          LoteRps: {
            NumeroLote: numeroLote.toLocaleString(),
            Cnpj: "57278676000169", // user?.cnpj
            InscricaoMunicipal: "00898131", // user?.inscricaoMunicipal
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
                ValorServicos: 20.00,
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
              Discriminacao: "CONTRATO MENSAL",
              CodigoMunicipio: "4115804",
              ExigibilidadeISS: 1,
              MunicipioIncidencia: "4115804",
              ListaItensServico: [
                {
                  ItemListaServico: "104",
                  CodigoCnae: "6201501",
                  Descricao: "servico",
                  Tributavel: "1",
                  Quantidade: 1.0,
                  ValorUnitario: 20.00,
                  ValorDesconto: 0.00,
                  ValorLiquido: 20.00,
                },
              ],
            },
            Prestador: {
              Cnpj: "57278676000169", // user?.cnpj
              InscricaoMunicipal: "00898131", // user?.inscricaoMunicipal
            },
            Tomador: {
              IdentificacaoTomador: {
                Cnpj: "11769293000192",
              },
              RazaoSocial: "CONTROLAREP PONTOS DE ACESSO EIRELI",
              Endereco: {
                Endereco: "AV ROBERT KOCH",
                Numero: "1330",
                Bairro: "OPERARIA",
                CodigoMunicipio: "4113700",
                Uf: "PR",
                Cep: "86038350",
              },
              Contato: {
                Telefone: "4304330326176",
                Email: "everton@publitechsistemas.com.br",
              },
            },
            RegimeEspecialTributacao: 7,
            IncentivoFiscal: 2,
          },
        };

        const response = await NFseService.enviarNfse(data);
        res.status(200).send(response);


/*        switch (user?.cidade) {
          case "Medianeira":
            console.log(body);
             const response = await NFseService.enviarNfse(data);
      
            await InvoiceService.CreateInvoiceService({
              customer: body.customer,
              user: user?.id,
              xml: response,
              data: data,
              numeroLote: numeroLote,
              identificacaoRpsnumero: identificacaoRpsnumero,
            });  
        
            res.status(200).send(body);
            break;

        case "Cascavel":
          //--------
          break;

        default:
           res.status(400).send({message: "Não atende a cidade do usuário"});
           return;
        } 

        return;    */   
      } catch (error) {
        res.status(500).send({message: 'Não foi possivel criar nota fiscal', error});
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



/* AINDA INUTILIZAVEL */
const findinvoices = async (req: CustomRequest, res: Response) => {
  try{
    const user = req.userObject;
    const invoices = await InvoiceService.FindInvoices(user!.id);
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
  findinvoices,
  consult_invoice,
  cancel_invoice,
  replace_invoice
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