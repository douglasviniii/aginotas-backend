import { Request, Response } from 'express';
import InvoiceService from '../services/InvoiceService.ts';
import NFseService from '../services/NFseService.ts';
import { parseStringPromise } from 'xml2js';

interface CustomRequest extends Request {
    userObject?: {
      id: string;
      email: string;
      subscription: Object;
      history: [
        {
          date: Date,
          count: Number,
        }
      ];
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
      CodigoCancelamento: string;
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
          ValorServicos: string;
          AliquotaPis: string;
          RetidoPis: string;
          ValorPis: string;
          AliquotaCofins: string;
          RetidoCofins: string;
          ValorCofins: string;
          AliquotaInss: string;
          RetidoInss: string;
          ValorInss: string;
          AliquotaIr: string;
          RetidoIr: string;
          ValorIr: string;
          AliquotaCsll: string;
          RetidoCsll: string;
          ValorCsll: string;
          AliquotaCpp: string;
          RetidoCpp: string;
          ValorCpp: string;
          OutrasRetencoes: string;
          RetidoOutrasRetencoes: string;
        };
        IssRetido: string;
        Discriminacao: string;
        CodigoNbs: string;
        CodigoMunicipio: string;
        ExigibilidadeISS: string;
        MunicipioIncidencia: string;
        ListaItensServico: {
          ItemServico: {
            ItemListaServico: string;
            CodigoCnae: string;
            Descricao: string;
            Tributavel: string;
            Quantidade: string;
            ValorUnitario: string;
            ValorLiquido: string;
          };
        };
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
      IncentivoFiscal: string;
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

        const data = {
          requerente: {
            cnpj: "57278676000169",
            inscricaoMunicipal: "00898131",
            senha: "KK89BRGH",
            homologa: true
          },
          loteRps: {
            numeroLote: numeroLote.toLocaleString(),
            cnpj: "57278676000169",
            inscricaoMunicipal: "00898131",
            quantidadeRps: 1
          },
          rps: {
            identificacaoRps: {
              numero: identificacaoRpsnumero.toLocaleString(),
              serie: "D",
              tipo: 1
            },
            dataEmissao: formattedDate,
            status: 1,
            competencia: formattedDate,
            servico: {
              valores: {
                valorServicos: "20.00",
                valorDeducoes: "0",
                aliquotaPis: "0",
                retidoPis: "2",
                aliquotaCofins: "0",
                retidoCofins: "2",
                aliquotaInss: "0",
                retidoInss: "2",
                aliquotaIr: "0",
                retidoIr: "2",
                aliquotaCsll: "0",
                retidoCsll: "2",
                retidoCpp: "2",
                retidoOutrasRetencoes: "2",
                aliquota: "4.41",
                descontoIncondicionado: "0.00",
                descontoCondicionado: "0.00"
              },
              issRetido: "2",
              discriminacao: "CONTRATO MENSAL",
              codigoMunicipio: "4115804",
              exigibilidadeISS: "1",
              municipioIncidencia: "4115804",
              listaItensServico: [
                {
                  itemListaServico: "104",
                  codigoCnae: "6201501",
                  descricao: "servico",
                  tributavel: "1",
                  quantidade: "1.00000",
                  valorUnitario: "20.00000",
                  valorDesconto: "0.00",
                  valorLiquido: "20.00"
                },
              ]
            },
            prestador: {
              cnpj: "57278676000169",
              inscricaoMunicipal: "00898131"
            },
            tomador: {
              identificacaoTomador: {
                cnpj: "11769293000192"
              },
              razaoSocial: "CONTROLAREP PONTOS DE ACESSO EIRELI",
              endereco: {
                endereco: "AV ROBERT KOCH",
                numero: "1330",
                bairro: "OPERARIA",
                codigoMunicipio: "4113700",
                uf: "PR",
                cep: "86038350"
              },
              contato: {
                telefone: "4304330326176",
                email: "everton@publitechsistemas.com.br"
              }
            },
            regimeEspecialTributacao: "7",
            incentivoFiscal: "2"
          }
        };

        const response = await NFseService.enviarNfse(data);
      
          await InvoiceService.CreateInvoiceService({
          customer:'67ba46a3128021bfdb2781b6',
          user: user?.id,
          xml: response,
          data: data,
          numeroLote: numeroLote,
          identificacaoRpsnumero: identificacaoRpsnumero,
        }); 


        res.status(200).send(response);
        return;
        
      } catch (error) {
        res.status(500).send({message: 'Não foi possivel criar nota fiscal', error});
        return;
    }
}

const cancel_invoice = async (req: CustomRequest, res: Response) => {
  try {
      //const user = req.userObject;
      //const body = req.body;

      const data: DataCancelarNfseEnvio = {
        CpfCnpj: '57278676000169',
        InscricaoMunicipal: '00898131',
        Senha: 'KK89BRGH',
        Homologa: true,
        NumeroNfse: '',
        CpfCnpjNfse: '',
        InscricaoMunicipalNfse: '',
        CodigoMunicipioNfse: '',
        ChaveAcesso: '',
        CodigoCancelamento: 1,
      }

      const response = await NFseService.cancelarNfse(data);

      res.status(200).send(response);
      
    } catch (error) {
      res.status(500).send({message: 'Não foi possivel consultar Nota Fiscal', error});
  }
}

const replace_invoice = async  (req: CustomRequest, res: Response) => {
  try {
    //const user = req.userObject;
    //const body = req.body;

    const data: DataSubstituirNfse = {
      IdentificacaoRequerente: {
          CpfCnpj: { Cnpj: "57278676000169" },
          InscricaoMunicipal: "00898131",
          Senha: "KK89BRGH",
          Homologa: true
      },
      Pedido: {
          InfPedidoCancelamento: {
              IdentificacaoNfse: {
                  Numero: "1049",
                  CpfCnpj: { Cnpj: "02847928000131" },
                  InscricaoMunicipal: "1047",
                  CodigoMunicipio: "4119905"
              },
              ChaveAcesso: "27a68ba3b8b01ae40648b52f5485ec03",
              CodigoCancelamento: "4"
          }
      },
      DeclaracaoPrestacaoServico: {
          InfDeclaracaoPrestacaoServico: {
              Rps: {
                  IdentificacaoRps: {
                      Numero: "6",
                      Serie: "RPS",
                      Tipo: 1
                  },
                  DataEmissao: "2017-03-23",
                  Status: 1
              },
              Competencia: "2017-03-01",
              Servico: {
                  Valores: {
                      ValorServicos: "1000.00",
                      AliquotaPis: "1",
                      RetidoPis: "2",
                      ValorPis: "10",
                      AliquotaCofins: "1.84",
                      RetidoCofins: "2",
                      ValorCofins: "18.40",
                      AliquotaInss: "2.11",
                      RetidoInss: "2",
                      ValorInss: "21.10",
                      AliquotaIr: "2.49",
                      RetidoIr: "2",
                      ValorIr: "24.90",
                      AliquotaCsll: "0.5",
                      RetidoCsll: "2",
                      ValorCsll: "5",
                      AliquotaCpp: "0.7",
                      RetidoCpp: "2",
                      ValorCpp: "7",
                      OutrasRetencoes: "9",
                      RetidoOutrasRetencoes: "2"
                  },
                  IssRetido: "2",
                  Discriminacao: "TESTE",
                  CodigoNbs: "1.0022",
                  CodigoMunicipio: "4119905",
                  ExigibilidadeISS: "1",
                  MunicipioIncidencia: "4119905",
                  ListaItensServico: {
                      ItemServico: {
                          ItemListaServico: "408",
                          CodigoCnae: "8630503",
                          Descricao: "TERAPIA",
                          Tributavel: "1",
                          Quantidade: "1",
                          ValorUnitario: "1000.00",
                          ValorLiquido: "1000.00"
                      }
                  }
              },
              Prestador: {
                  CpfCnpj: { Cnpj: "02847928000131" },
                  InscricaoMunicipal: "59939"
              },
              Tomador: {
                  IdentificacaoTomador: {
                      CpfCnpj: { Cnpj: "03584427001659" },
                      InscricaoMunicipal: "47246"
                  },
                  RazaoSocial: "SERVICO SOCIAL DO COMERCIO",
                  Endereco: {
                      Endereco: "THEODORO ROSAS",
                      Numero: "1247",
                      Bairro: "CENTRO",
                      CodigoMunicipio: "4119905",
                      Uf: "PR",
                      Cep: "84010180"
                  },
                  Contato: {
                      Telefone: "42 32225432",
                      Email: "teste@elotech.com.br"
                  },
                  InscricaoEstadual: "47246"
              },
              IncentivoFiscal: "2"
          }
      }
  };

    const response = await NFseService.SubstituirNfse(data);

    res.status(200).send(response);
    
  } catch (error) {
    res.status(500).send({message: 'Não foi possivel consultar Nota Fiscal', error});
}
}




const findinvoices = async (req: CustomRequest, res: Response) => {
  try{
    const user = req.userObject;
    const invoices = await InvoiceService.FindInvoices(user!.id);
    res.status(200).send(invoices);
  }catch(error){
    res.status(500).send({message: "Não foi possivel buscar as notas fiscais"});
  }
}
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