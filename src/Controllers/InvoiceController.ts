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

const create_invoice = async (req: CustomRequest, res: Response) => {
    try {
        const user = req.userObject;
        const body = req.body;

        const date = new Date();
        const formattedDate = date.toLocaleString("pt-BR", { 
          timeZone: "America/Sao_Paulo"
        });

        const dados = {
          numeroLote: '123',

          cnpjPrestador: '23.631.375/0001-55',
          inscricaoMunicipal: '898131', 

          numeroRps: '456',
          dataEmissao: formattedDate,
          valor: 100.0,
          aliquota: 2.0,
          valorIss: 2.0,
          itemListaServico: '01.01',
          descricaoServico: 'Serviço de exemplo',
          codigoMunicipio: '3106200',
          cnpjTomador: '11.769.293/0001-92',
          razaoTomador: 'Cliente Exemplo Ltda',
          endereco: 'Rua Exemplo, 123',
          numero: '123',
          bairro: 'Centro',
          uf: 'MG',
          cep: '30130000',
          telefone: '31999999999',
          email: 'cliente@exemplo.com'

        };

        const response = await NFseService.enviarNfse(dados);
        res.status(200).send({message: 'Nota Fiscal gerada com sucesso', response });

      } catch (error) {
        res.status(500).send({message: 'Não foi possivel criar nota fiscal', error});
    }
}

const consult_invoice = async (req: CustomRequest, res: Response) => {
  try {
      const user = req.userObject;
      const body = req.body;

      const numeroNfse = '0000';
      const cnpjPrestador = '12.345.678/0001-99';

      const response = await NFseService.consultarNfse(numeroNfse, cnpjPrestador);

      res.status(200).send({message: 'Consulta realiza com sucesso', response });
      
    } catch (error) {
      res.status(500).send({message: 'Não foi possivel consultar Nota Fiscal', error});
  }
}

const cancel_invoice = async (req: CustomRequest, res: Response) => {
  try {
      const user = req.userObject;
      const body = req.body;

      const numeroNfse = '0000';
      const cnpjPrestador = '12.345.678/0001-99';
      const justificativa = 'blablabla';

      const response = await NFseService.cancelarNfse(numeroNfse,cnpjPrestador,justificativa);

      res.status(200).send({message: 'Consulta realiza com sucesso', response });
      
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