import express from "express";
import { optimizeWasteRouting, optimizeEnergyBalance } from "../controllers/optimizationController.js";

const router = express.Router();

router.post("/waste-routing", optimizeWasteRouting);
router.post("/energy-balance", optimizeEnergyBalance);

export default router;


