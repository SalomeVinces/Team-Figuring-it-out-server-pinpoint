import express from 'express';
import { getLandingData } from '../services/landing_services.js';

const router = express.Router();

router.get('/:stateCode', getLandingData);

export default router;