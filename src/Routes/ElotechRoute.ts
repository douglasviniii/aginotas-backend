import express from 'express';
import ElotechController from '../Controllers/ElotechController.ts';

const router = express.Router();

router.get('/cnaes', ElotechController.Cnaes);
router.get('/servicos', ElotechController.Servicos);
router.get('/servicosporcnae/:id', ElotechController.ServicosPorCNAE);

export default router;