import {Request, Response} from 'express';
import FinancialService from '../services/FinancialService.ts';

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
        } = req.body;

        if(!customer || !dueDate || !status || !value){
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
        });
        res.status(200).send(response);
    } catch (error) {
        res.status(500).send({message: 'internal server error', error});
    }
}

const Update = async (req: CustomRequest, res: Response) => {
    try {
        const {status} = req.body;
        console.log(status);
        const id = req.params.id;
        if(!id){
            res.status(400).send({message: 'id user is null'});
            return;
        }
        await FinancialService.UpdateStatus(status, id);
        res.status(200);
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


export default{
    Receipts,
    Receive,
    Update,
    Delete
}