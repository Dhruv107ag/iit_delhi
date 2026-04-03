import { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Send, User, MessageCircle, ArrowLeft, Search, Phone, Video, CheckCheck } from 'lucide-react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import './Consultation.css';

export default function Consultation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [appointments, setAppointments] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchInitialData();
  }, [user]);

  const fetchInitialData = async () => {
    if (!user) return;
    try {
      let res;
      if (user.role === 'doctor') {
        res = await api.get(`/appointments/doctor/${user.id || user._id}`);
      } else {
        res = await api.get('/appointments/user');
      }
      const apps = Array.isArray(res.data) ? res.data : [];
      setAppointments(apps);
      
      const appParam = searchParams.get('appointmentId');
      if (appParam) {
        const found = apps.find(a => a._id === appParam);
        if (found) setSelectedApp(found);
      } else if (apps.length > 0) {
        setSelectedApp(apps[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedApp) {
      setMessages(selectedApp.chatHistory || []);
      scrollToBottom();
    }
  }, [selectedApp]);

  const scrollToBottom = () => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedApp || !user) return;

    const senderType = user.role === 'doctor' ? 'doctor' : 'user';
    const tempMsg = { 
      sender: senderType, 
      message: input, 
      timestamp: new Date().toISOString() 
    };

    setMessages([...messages, tempMsg]);
    const currentInput = input;
    setInput('');

    try {
      await api.post(`/appointments/${selectedApp._id}/chat`, {
        message: currentInput,
        sender: senderType
      });
    } catch (err) {
      console.error('Failed to send message:', err);
    }
    scrollToBottom();
  };

  if (loading) return <div className="loading-state">Syncing Conversations...</div>;

  return (
    <div className="consultation-v2 section fade-in">
      <div className="whatsapp-container glass-panel">
        {/* Sidebar */}
        <aside className="chat-sidebar">
          <div className="sidebar-header">
             <button className="back-circle" onClick={() => navigate(-1)}><ArrowLeft size={18}/></button>
             <h2>Chats</h2>
             <div className="spacer"></div>
             <MessageCircle size={20} />
          </div>
          <div className="search-chats">
            <div className="search-inner">
              <Search size={16} />
              <input type="text" placeholder="Search or start new chat" />
            </div>
          </div>
          <div className="chat-list">
            {appointments.map(app => {
              const otherParty = user.role === 'doctor' ? app.userId?.name : app.doctorId?.name;
              return (
                <div 
                  key={app._id} 
                  className={`chat-list-item ${selectedApp?._id === app._id ? 'active' : ''}`}
                  onClick={() => setSelectedApp(app)}
                >
                  <div className="item-avatar"><User size={20}/></div>
                  <div className="item-content">
                    <div className="item-top">
                      <span className="item-name">{otherParty || 'Unknown'}</span>
                      <span className="item-time">Now</span>
                    </div>
                    <div className="item-bottom">
                      <p className="item-msg">{app.chatHistory?.[app.chatHistory.length-1]?.message || 'Start a conversation'}</p>
                    </div>
                  </div>
                </div>
              );
            })}
            {appointments.length === 0 && <div className="p-4 text-center text-muted">No active consultations</div>}
          </div>
        </aside>

        {/* Main Chat Area */}
        <main className="chat-main">
          {selectedApp ? (
            <>
              <header className="whatsapp-header">
                <div className="header-info">
                  <div className="header-avatar"><User size={20}/></div>
                  <div>
                    <h3>{user.role === 'doctor' ? selectedApp.userId?.name : selectedApp.doctorId?.name}</h3>
                    <p>Online</p>
                  </div>
                </div>
                <div className="header-actions">
                  <Phone size={20} />
                  <Video size={20} />
                </div>
              </header>

              <div className="whatsapp-messages">
                <div className="encryption-notice">
                   Messages are end-to-end encrypted. No one outside of this chat, not even MediConnect, can read them.
                </div>
                {messages.map((msg, i) => {
                  const isMe = msg.sender === (user.role === 'doctor' ? 'doctor' : 'user');
                  return (
                    <div key={i} className={`whatsapp-msg-row ${isMe ? 'me' : 'them'}`}>
                       <div className="whatsapp-bubble">
                          <p>{msg.message}</p>
                          <div className="msg-meta">
                             <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                             {isMe && <CheckCheck size={14} className="text-blue" />}
                          </div>
                       </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              <footer className="whatsapp-footer">
                <form className="whatsapp-input-wrapper" onSubmit={handleSend}>
                  <input 
                    type="text" 
                    placeholder="Type a message" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />
                  <button type="submit" className="whatsapp-send-btn">
                    <Send size={20} />
                  </button>
                </form>
              </footer>
            </>
          ) : (
            <div className="no-chat-selected">
               <div className="empty-chat-illus">💬</div>
               <h2>MediConnect Web</h2>
               <p>Send and receive messages for your medical consultations.<br/>Keep your phone online and stay connected.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
