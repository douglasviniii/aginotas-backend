import {Request, Response} from 'express';
import FinancialService from '../services/FinancialService.ts';
import { DateTime } from "luxon";

interface CustomRequest extends Request {
    userid?: string;
}

const Receipts = async (req: CustomRequest, res: Response) => {
    try {
        const id = req.userid;

        if(!id){
            res.status(400).send({message: 'id is null'});
            return;
        }

        const response = await FinancialService.Allreceipts(id);
        res.status(200).send(response);
    } catch (error) {
        res.status(500).send({message: 'internal server error', error});
    }
}

const Receive = async (req: CustomRequest, res: Response) => {
    try {
        const {
           customer,
           dueDate,
           status,
           value,
           description,
        } = req.body;

        if(!customer || !dueDate || !status || !value || !description){
            res.status(400).send({message: 'data is null'});
            return;            
        }

        const userid = req.userid;
        if(!userid){
            res.status(400).send({message: 'id user is null'});
            return;
        }

        const response = await FinancialService.Receive({
            userId: userid,
            customer,
            dueDate,
            status,
            value,
            description,
        });
        res.status(200).send(response);
    } catch (error) {
        res.status(500).send({message: 'internal server error', error});
    }
}

const Update = async (req: CustomRequest, res: Response) => {
    try {
        const {status} = req.body;

        const id = req.params.id;
        if(!id){
            res.status(400).send({message: 'id user is null'});
            return;
        }
        await FinancialService.UpdateStatus(status, id);
        res.status(200).send({message: "updated with success"});
    } catch (error) {
        res.status(500).send({message: 'internal server error', error});
    }
}

const Delete = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;

        if(!id){
            res.status(400).send({message: 'id is null'});
            return;
        }
        await FinancialService.Delete(id);
        res.status(200).send({message: "deleted with success"});
    } catch (error) {
        res.status(500).send({message: 'internal server error', error});
    }
}

const ExpirationCheck = async () => {
    try {
        const Receipts = await FinancialService.VerifyReceipts();

        const today = DateTime.now().setZone("America/Sao_Paulo").startOf("day");

        for (const receipt of Receipts) {
            if (receipt.dueDate) {
            const dueDate = DateTime.fromISO(receipt.dueDate, { zone: "America/Sao_Paulo" }).startOf("day");

            if (dueDate < today && receipt.status != 'Atrasado') {
                const status = "Atrasado";
                const id = receipt._id;
                await FinancialService.UpdateStatus(status, `${id}`);
                console.log("Status do receipt atualizado para atrasado!");
            }
            }
        }
        
    } catch (error) {
        console.error('Erro ao verificação validade da cobrança!', error);
        return;
    }
}


export default{
    Receipts,
    Receive,
    Update,
    Delete,
    ExpirationCheck
}