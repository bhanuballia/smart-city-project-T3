import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your Smart City Assistant. I can help you with information about traffic, air quality, energy, waste management, emergency services, and more. How can I assist you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const smartCityKnowledge = {
    traffic: {
      keywords: ['traffic', 'road', 'congestion', 'jam', 'vehicle', 'transport', 'bus', 'metro'],
      responses: [
        "Our smart traffic management system monitors real-time traffic flow across the city. You can check current traffic conditions on the dashboard.",
        "Traffic lights are synchronized using AI to optimize flow. During peak hours, the system automatically adjusts timing.",
        "We have dedicated bus lanes and cycle tracks to promote sustainable transportation.",
        "Emergency vehicles get priority routing through our smart traffic system.",
        "Real-time traffic updates are available through our mobile app and website."
      ]
    },
    air: {
      keywords: ['air', 'quality', 'pollution', 'aqi', 'smog', 'breathing', 'atmosphere'],
      responses: [
        "Our air quality monitoring network covers 50+ locations across the city with real-time data.",
        "Current AQI levels are displayed on the dashboard. We recommend staying indoors when AQI exceeds 150.",
        "The city has implemented green corridors and increased tree plantation to improve air quality.",
        "Industrial emissions are monitored 24/7 to ensure compliance with environmental standards.",
        "We have air purifiers installed at major intersections and public spaces."
      ]
    },
    energy: {
      keywords: ['energy', 'power', 'electricity', 'solar', 'renewable', 'consumption', 'grid'],
      responses: [
        "Smart City Lucknow uses 40% renewable energy including solar panels on government buildings.",
        "Smart meters help residents track and optimize their energy consumption.",
        "Street lights are LED-based with automatic dimming based on traffic and time.",
        "We have solar-powered charging stations for electric vehicles across the city.",
        "Energy consumption data is available in real-time on our dashboard."
      ]
    },
    waste: {
      keywords: ['waste', 'garbage', 'recycling', 'disposal', 'clean', 'trash', 'bin'],
      responses: [
        "Smart waste bins with sensors alert when they need to be emptied, optimizing collection routes.",
        "We have separate collection for organic, recyclable, and hazardous waste.",
        "Waste-to-energy plants convert organic waste into electricity for the city.",
        "Citizens can report waste-related issues through our mobile app or website.",
        "Composting facilities are available in each ward for organic waste processing."
      ]
    },
    emergency: {
      keywords: ['emergency', 'police', 'fire', 'ambulance', 'help', 'urgent', 'accident', 'crisis'],
      responses: [
        "Emergency services can be reached at 100 (Police), 101 (Fire), 102 (Ambulance).",
        "Our smart emergency response system automatically routes the nearest available unit.",
        "Emergency buttons are installed at key locations throughout the city.",
        "Real-time incident tracking helps coordinate multi-agency responses.",
        "You can also report emergencies through our mobile app with GPS location."
      ]
    },
    places: {
      keywords: ['places', 'tourist', 'attractions', 'famous', 'visit', 'landmarks', 'sightseeing'],
      responses: [
        "Popular places include Bara Imambara, Chota Imambara, Rumi Darwaza, and Ambedkar Memorial Park.",
        "You can find detailed information about famous places on our 'Famous Places' page.",
        "We offer guided tours and have information kiosks at major tourist spots.",
        "Smart parking systems help visitors find available parking near attractions.",
        "Virtual reality tours are available for some historical monuments."
      ]
    },
    services: {
      keywords: ['services', 'government', 'office', 'document', 'certificate', 'license', 'permit'],
      responses: [
        "All government services are available online through our e-governance portal.",
        "Citizen service centers are located in each ward for in-person assistance.",
        "Digital lockers store important documents securely online.",
        "Most services can be completed within 24-48 hours through our online system.",
        "You can track application status in real-time through our portal."
      ]
    },
    general: {
      keywords: ['hello', 'hi', 'help', 'information', 'what', 'how', 'where', 'welcome'],
      responses: [
        "Welcome to Smart City Lucknow! I'm here to help you with information about our smart city services.",
        "You can ask me about traffic, air quality, energy, waste management, emergency services, or famous places.",
        "For detailed information, visit our dashboard or specific service pages.",
        "Is there anything specific about our smart city that you'd like to know?",
        "I can provide real-time information about various city services and facilities."
      ]
    }
  };

  const getBotResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    // Check for keywords in each category
    for (const [category, data] of Object.entries(smartCityKnowledge)) {
      if (data.keywords.some(keyword => message.includes(keyword))) {
        const randomResponse = data.responses[Math.floor(Math.random() * data.responses.length)];
        return randomResponse;
      }
    }
    
    // Default response if no specific category matches
    return "I understand you're asking about Smart City Lucknow. Could you be more specific? I can help with traffic, air quality, energy, waste management, emergency services, famous places, or government services.";
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        text: getBotResponse(inputMessage),
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    "What's the current traffic situation?",
    "How is the air quality today?",
    "Tell me about energy usage",
    "Where can I find famous places?",
    "How do I report an emergency?"
  ];

  return (
    <>
      {/* Chat Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 flex items-center justify-center"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 z-40 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold">SC</span>
                </div>
                <div>
                  <h3 className="font-semibold">Smart City Assistant</h3>
                  <p className="text-xs text-blue-100">Online</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-100 text-gray-800 p-3 rounded-2xl">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions */}
            {messages.length === 1 && (
              <div className="p-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2">Quick questions:</p>
                <div className="flex flex-wrap gap-2">
                  {quickQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => setInputMessage(question)}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-full transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me about Smart City services..."
                  className="flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
