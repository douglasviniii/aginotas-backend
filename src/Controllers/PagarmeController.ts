import { Request, Response } from 'express';
import PagarmeService from '../services/Pagarme.service.ts';

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

export default 
{
  CreatePlan,
  ListPlans,
  DeletePlan,
  EditItemPlan
};