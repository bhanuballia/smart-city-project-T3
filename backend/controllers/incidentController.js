// Create new incident
export const createIncident = async (req, res) => {
  try {
    const { type, location } = req.body;
    const incident = await Incident.create({ type, location });

    // 🔹 Emit to all clients
    req.app.get("io").emit("incident:new", incident);

    res.status(201).json(incident);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update incident status
export const updateIncidentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const incident = await Incident.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!incident) return res.status(404).json({ message: "Incident not found" });

    // 🔹 Emit update
    req.app.get("io").emit("incident:update", incident);

    res.json(incident);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete incident
export const deleteIncident = async (req, res) => {
  try {
    const { id } = req.params;
    const incident = await Incident.findByIdAndDelete(id);

    if (!incident) return res.status(404).json({ message: "Incident not found" });

    // 🔹 Emit delete
    req.app.get("io").emit("incident:delete", id);

    res.json({ message: "Incident deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
