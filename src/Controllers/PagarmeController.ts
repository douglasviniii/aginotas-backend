import { Request, Response } from 'express';
import PagarmeService from '../services/Pagarme.service.ts';

//PLANOS
const CreatePlan = async (req: Request, res: Response) => {
    try {
        const data = req.body;

        if(data){
          const response = await PagarmeService.CreatePlan(data);
          res.status(200).send({message: 'Plan created with success', response });
          return;
        }
        res.status(400).send({message: 'Occurred an error when created plan'});
      } catch (error) {
        res.status(500).send({message: 'Internal server error', error});
    }
}

const ListPlans = async (req: Request, res: Response) => {
  try {

    const response = await PagarmeService.ListPlans();
    res.status(200).send(response);
    return;

  } catch (error) {
    res.status(500).send({message: 'Internal server error', error});
    return;    
  }
}

const DeletePlan = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    await PagarmeService.DeletePlan(id);
    res.status(200).send({message:'Plan deleted of with success'});
    return;
  } catch (error) {
    res.status(500).send({message: 'Internal server error', error});
    return;    
  }
}

const EditItemPlan = async (req: Request, res: Response) => {
  try {
      const data = req.body;

      if(data){
        const response = await PagarmeService.EditItemPlan(data);
        res.status(200).send({message: 'Plan updated with success', response });
        return;
      }
      res.status(400).send({message: 'Occurred an error when update plan'});
    } catch (error) {
      res.status(500).send({message: 'Internal server error', error});
  }
}

//CLIENTE
const ListClients = async (req: Request, res: Response) => {
  try {

    const response = await PagarmeService.ListClients();
    res.status(200).send(response);
    return;

  } catch (error) {
    res.status(500).send({message: 'Internal server error', error});
    return;    
  }
}

//ASSINATURA
const CreateSubscription = async (req: Request, res: Response) => {
  try {
      const data = req.body;

      const exmp = {
      card: {
        number: '4350870594383048',
        holder_name: 'Edvandro D P Lopes',
        exp_month: 3,
        exp_year: 30,
        cvv: '022'
      },
      installments: 1,
      plan_id: 'plan_2kjb0w9U1Mf6OVxY',
      payment_method: 'credit_card',
      customer_id: 'cus_pLb0QbjHrHoQzkZV'
    }

      if(data){
        const response = await PagarmeService.CreateSubscription(data);
        res.status(200).send({message: 'Subscription created with success', response });
        return;
      }
      res.status(400).send({message: 'Occurred an error when created Subscription'});
    } catch (error) {
      res.status(500).send({message: 'Internal server error', error});
  }
}

const GetSubscription = async (req: Request, res: Response) => {
  try {
      const id = req.params.id;

      if(id){
        const response = await PagarmeService.GetSubscription(id);
        res.status(200).send(response);
        return;
      }
      res.status(400).send({message: 'Occurred an error when find Subscription'});
    } catch (error) {
      res.status(500).send({message: 'Internal server error', error});
  }
}

const GetAllSubscriptions = async (req: Request, res: Response) => {
  try {
      const response = await PagarmeService.GetAllSubscriptions();
      res.status(200).send(response);
      return;
    } catch (error) {
      res.status(500).send({message: 'Internal server error', error});
  }
}

const CancelSubscription = async (req: Request, res: Response) => {
  try {
      const id = req.params.id;
      const response = await PagarmeService.CancelSubscription(id);
      res.status(200).send({message: 'Subscription deleted with success', response});
      return;

    } catch (error) {
      res.status(500).send({message: 'Internal server error', error});
  }
}

const UpdateCardSubscription = async (req: Request, res: Response) => {
  try {
      const data = req.body;

      if(data){
        const response = await PagarmeService.UpdateCardSubscription(data);
        res.status(200).send({message: 'Card updated with success', response });
        return;
      }
      res.status(400).send({message: 'Occurred an error when update card'});
    } catch (error) {
      res.status(500).send({message: 'Internal server error', error});
  }
}

export default 
{
  CreatePlan,
  ListPlans,
  DeletePlan,
  EditItemPlan,
  ListClients,
  CreateSubscription,
  GetSubscription,
  CancelSubscription,
  GetAllSubscriptions,
  UpdateCardSubscription
};