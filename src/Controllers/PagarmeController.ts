import { Request, Response } from 'express';
import PagarmeService from '../services/Pagarme.service.ts';
import UserService from '../services/UserService.ts';

interface CustomerData {
  card:{
    number: String;
    holder_name: String;
    exp_month: Number;
    exp_year: Number;
    cvv: String;
  },
  installments: Number;
  plan_id: String;
  payment_method: String;
  customer_id: String;
}

//PLANOS
const CreatePlan = async (req: Request, res: Response) => {
    try {
        const data = req.body;
        console.log(data);

        if(data){
          const response = await PagarmeService.CreatePlan(data);
          console.log(response);
          res.status(200).send({message: 'Plan created with success', response });
          return;
        }
        res.status(400).send({message: 'Occurred an error when created plan'});
      } catch (error) {
        console.error(error);
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
      console.log(data);
      
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

      if(!data){
        res.status(400).send({message: 'Invalid data'});
        return;
      }

      const subscription: CustomerData = {
      card: {
        number: data.cardNumber,
        holder_name: data.holderName,
        exp_month: data.expMonth,
        exp_year: data.expYear,
        cvv: data.cvv
      },
      installments: 1,
      plan_id: data.id_plan,
      payment_method: 'credit_card',
      customer_id: data.id_customer
    }

      if(data){
        const response = await PagarmeService.CreateSubscription(subscription);
        const idUser = data.idUser;
        await UserService.UpdateUser(idUser, {subscription_id: response.id})
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