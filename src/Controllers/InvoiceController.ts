import { Request, Response } from 'express';
import InvoiceService from '../services/InvoiceService.ts';
import NFseService from '../services/NFseService.ts';

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

let numeroLote = 8;
let identificacaoRpsnumero = 1;

const create_invoice = async (req: CustomRequest, res: Response) => {
    try {
        const user = req.userObject;
        const body = req.body;

        const date = new Date();
        const year = date.getFullYear(); 
        const month = String(date.getMonth() + 1).padStart(2, '0'); 
        const day = String(date.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;

        const data = {
          requerente: {
            cnpj: "57278676000169",
            inscricaoMunicipal: "00898131",
            senha: "HHFTHGRB",
            homologa: false
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
                valorServicos: "200.00",
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
                  valorUnitario: "200.00000",
                  valorDesconto: "0.00",
                  valorLiquido: "200.00"
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

        numeroLote += 1;
        identificacaoRpsnumero += 1;

/*         await InvoiceService.CreateInvoiceService({
          customer:'',
          user: '',
          valor: 0,
          xml: '',
          numeroLote: numeroLote,
          identificacaoRpsnumero: identificacaoRpsnumero,
        }); */

        res.status(200).send(response);
        return;
      } catch (error) {
        res.status(500).send({message: 'Não foi possivel criar nota fiscal', error});
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

const cancel_invoice = async (req: CustomRequest, res: Response) => {
  try {
      //const user = req.userObject;
      //const body = req.body;

      const data: DataCancelarNfseEnvio = {
        CpfCnpj: '',
        InscricaoMunicipal: '',
        Senha: '',
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

const findinvoices = async (req: CustomRequest, res: Response) => {
  try{
    const user = req.userObject;
    const invoices = await InvoiceService.FindInvoices(user!.id);
    res.status(200).send(invoices);
  }catch(error){
    res.status(500).send({message: "Não foi possivel buscar as notas fiscais"});
  }
}

export default 
{
  create_invoice,
  findinvoices,
  consult_invoice,
  cancel_invoice
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