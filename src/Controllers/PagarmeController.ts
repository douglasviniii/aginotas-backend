import { Request, Response } from 'express';
import PagarmeService from '../services/Pagarme.service.ts';

const CreatePlan = async (req: Request, res: Response) => {
    try {
        const {
          name, 
          price,
          trial_period_days,
          billing_days,
          statement_descriptor
        } = req.body;

        if(name && price && trial_period_days && billing_days && statement_descriptor){

          const response = await PagarmeService.CreatePlan({
            name, 
            price,
            trial_period_days,
            billing_days,
            statement_descriptor
          });
  
          res.status(200).send({message: 'Plan created with success', response });
          return;
        }
        res.status(400).send({message: 'Occurred an error when create plan'});
        return;

      } catch (error) {
        res.status(500).send({message: 'Internal server error', error});
        return;
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
    res.status(200);
    return;
  } catch (error) {
    res.status(500).send({message: 'Internal server error', error});
    return;    
  }
}

export default 
{
  CreatePlan,
  ListPlans,
  DeletePlan
};