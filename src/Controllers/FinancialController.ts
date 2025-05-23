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
           typeofcharge,
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
            typeofcharge,
        });
        res.status(200).send(response);
    } catch (error) {
        res.status(500).send({message: 'internal server error', error});
    }
}

const LastMonthPaid = async (req: CustomRequest, res: Response) => {
    try {
        const id = req.params.id;

        const invoice = await FinancialService.FindById(id);

        if(!invoice){
            res.status(400).send({message:'Invoice Null'});
            return;
        }

        const currentDueDate = new Date(invoice.dueDate!); 
        currentDueDate.setMonth(currentDueDate.getMonth() + 1); 
        const newDueDate = currentDueDate.toISOString().split('T')[0]; 

        const paymentDate = new Date().toISOString().split("T")[0]; // "2025-11-21"
        const data = paymentDate;

        const status = 'Pago';

        const response = await FinancialService.LastMonthPaid(id,data,status);
        await FinancialService.UpdateDueDate(newDueDate,id);
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

const isDesactivated = async (req: CustomRequest, res: Response) => {
    try {
        const {isDesactivated} = req.body;

        const id = req.params.id;

        if(!id){
            res.status(400).send({message: 'id user is null'});
            return;
        }
        await FinancialService.UpdateisDesactivated(isDesactivated, id);
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

            if (dueDate < today && receipt.status != 'Pago' && receipt.status != 'Atrasado' ) {
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
    ExpirationCheck,
    LastMonthPaid,
    isDesactivated
}