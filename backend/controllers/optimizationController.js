import axios from "axios";

const OPTIMIZER_URL = process.env.OPTIMIZER_URL || "http://localhost:8000";

export const optimizeWasteRouting = async (req, res) => {
  try {
    const url = `${OPTIMIZER_URL}/waste-routing`;
    const { data } = await axios.post(url, req.body, { timeout: 30000 });
    return res.json(data);
  } catch (error) {
    const status = error.response?.status || 500;
    return res.status(status).json({
      error: "Failed to optimize waste routing",
      details: error.response?.data || error.message,
    });
  }
};

export const optimizeEnergyBalance = async (req, res) => {
  try {
    const url = `${OPTIMIZER_URL}/energy-balance`;
    const { data } = await axios.post(url, req.body, { timeout: 30000 });
    return res.json(data);
  } catch (error) {
    const status = error.response?.status || 500;
    return res.status(status).json({
      error: "Failed to optimize energy balance",
      details: error.response?.data || error.message,
    });
  }
};

export default {
  optimizeWasteRouting,
  optimizeEnergyBalance,
};


