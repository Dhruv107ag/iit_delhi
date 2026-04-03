import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import './Chatbot.css';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hello! I am MediBot. How can I help you navigate MediConnect today? (e.g. "How do I book a doctor?", "What to do for an overdose?")'
    }
  ]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const generateBotResponse = (userMsg) => {
    const msg = userMsg.toLowerCase();
    
    if (msg.includes('overdose') || msg.includes('poison') || msg.includes('emergency')) {
      return "⚠️ 🚨 MEDICAL EMERGENCY: If you suspect a drug overdose, please call emergency services (like 112 or 911) or your local poison control center IMMEDIATELY. Do not wait.";
    }
    
    if (msg.includes('book') || msg.includes('appointment') || msg.includes('doctor')) {
      return "To book an appointment, go to the top 'Doctors' tab in the Search area. From there, you can view available doctors and click 'Book Now'.";
    }

    if (msg.includes('medicine') || msg.includes('pharmacy') || msg.includes('store') || msg.includes('buy')) {
      return "You can check the local availability of medicines by navigating to the 'Pharmacies' tab. You'll see which verified stores currently have stock.";
    }

    if (msg.includes('review') || msg.includes('rating') || msg.includes('feedback')) {
      return "You can leave a review by clicking the 'Review' button on any Doctor or Pharmacy card in the Search section. Your reviews are tracked in your User Dashboard.";
    }

    if (msg.includes('login') || msg.includes('register') || msg.includes('account')) {
      return "If you are unregistered, click the Login/Register button at the top right. Once signed in, you will be automatically routed to your dedicated patient or medical dashboard.";
    }

    if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
      return "Hello there! I'm here to guide you around our platform. Need to find a doctor or pharmacy?";
    }

    return "I am a simple website guide. I can help you find doctors, book appointments, or search for medicines. For detailed medical advice, please consult one of our verified doctors!";
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMsgs = [...messages, { sender: 'user', text: input }];
    setMessages(newMsgs);
    setInput('');

    // Simulate typing delay
    setTimeout(() => {
      const responseText = generateBotResponse(input);
      setMessages((prev) => [...prev, { sender: 'bot', text: responseText }]);
    }, 600);
  };

  return (
    <div className="chatbot-wrapper">
      <button 
        className={`chatbot-trigger shadow-xl ${isOpen ? 'hidden' : 'flex'}`} 
        onClick={() => setIsOpen(true)}
      >
        <MessageCircle size={28} />
      </button>

      <div className={`chatbot-window glass-panel shadow-2xl ${isOpen ? 'open' : 'closed'}`}>
        <div className="chatbot-header">
          <div className="chatbot-header-info">
            <div className="bot-avatar">
              <Bot size={20} />
            </div>
            <div>
               <h4>MediBot Support</h4>
               <span className="online-status">● Online</span>
            </div>
          </div>
          <button className="close-bot text-slate-400 hover:text-white" onClick={() => setIsOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="chatbot-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`bot-msg-row ${msg.sender === 'user' ? 'me' : 'them'}`}>
              <div className="bot-bubble">
                <p>{msg.text}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form className="chatbot-footer" onSubmit={handleSend}>
          <input 
            type="text" 
            placeholder="Ask a question..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" disabled={!input.trim()}>
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
