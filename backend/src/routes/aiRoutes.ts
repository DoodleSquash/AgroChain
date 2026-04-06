import { Router } from 'express';
import { getMarketPrices, evaluateBuyerRisk } from '../controllers/aiController';

const router = Router();

router.get('/market-prices', getMarketPrices);
router.post('/evaluate-buyer-risk', evaluateBuyerRisk);

export default router;
