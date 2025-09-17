// Create new traffic alert
export const createTrafficAlert = async (req, res) => {
  try {
    const { location, severity, message } = req.body;
    const alert = await Traffic.create({ location, severity, message });

    // 🔹 Emit new alert
    req.app.get("io").emit("traffic:new", alert);

    res.status(201).json(alert);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
