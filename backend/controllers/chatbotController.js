// controllers/chatbotController.js

// Chat with the bot
export const chatWithBot = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // 🔹 Here you can integrate OpenAI API or your custom chatbot logic
    const reply = `You said: ${message}`; // placeholder response

    res.json({ reply });
  } catch (err) {
    console.error("Chatbot error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get quick suggestions
export const getSuggestions = async (req, res) => {
  try {
    const suggestions = [
      "What's the traffic like?",
      "Show me energy usage.",
      "Report a waste issue.",
      "Emergency contacts?",
    ];
    res.json({ suggestions });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get chatbot statistics
export const getChatbotStats = async (req, res) => {
  try {
    const stats = {
      totalChats: 120,
      activeUsers: 45,
      avgResponseTime: "1.2s",
    };
    res.json({ stats });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
