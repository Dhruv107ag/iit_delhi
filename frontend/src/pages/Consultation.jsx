import { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Send, User, MessageCircle, ArrowLeft, Search, Phone, Video, CheckCheck, ShieldCheck, MoreVertical } from 'lucide-react';
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
  const pollingRef = useRef(null);

  useEffect(() => {
    fetchInitialData();
    // Start polling every 3 seconds for new messages
    pollingRef.current = setInterval(() => {
       refreshCurrentChat();
    }, 3000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
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
        if (found) {
          setSelectedApp(found);
          setMessages(found.chatHistory || []);
        }
      } else if (apps.length > 0 && !selectedApp) {
        setSelectedApp(apps[0]);
        setMessages(apps[0].chatHistory || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const refreshCurrentChat = async () => {
    if (!selectedApp || !user) return;
    try {
      const res = await api.get(`/appointments/user`); // Refreshing to get latest history
      const apps = Array.isArray(res.data) ? res.data : [];
      const updated = apps.find(a => a._id === selectedApp._id);
      
      if (updated && updated.chatHistory.length !== messages.length) {
        setMessages(updated.chatHistory);
        setAppointments(apps);
      }
    } catch (err) {
      // Silently fail polling errors
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

    const currentMessages = [...messages, tempMsg];
    setMessages(currentMessages);
    const currentInput = input;
    setInput('');

    try {
      await api.post(`/appointments/${selectedApp._id}/chat`, {
        message: currentInput,
        sender: senderType
      });
      // Optionally refresh appointments list to show last message in sidebar
      fetchInitialData();
    } catch (err) {
      console.error('Failed to send message:', err);
    }
    scrollToBottom();
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-slate-100">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium font-outfit">Synchronizing Secure Connection...</p>
      </div>
    </div>
  );

  return (
    <div className="consultation-v2 section fade-in">
      <div className="whatsapp-container">
        {/* Sidebar */}
        <aside className="chat-sidebar">
          <div className="sidebar-header">
             <button className="back-circle" onClick={() => navigate(-1)} title="Back">
               <ArrowLeft size={20}/>
             </button>
             <div className="flex gap-4 text-slate-500">
               <MessageCircle size={20} className="cursor-pointer" />
               <MoreVertical size={20} className="cursor-pointer" />
             </div>
          </div>
          
          <div className="px-4 py-3 bg-[#f0f2f5] mb-2">
            <h2 className="text-xl font-bold text-[#111b21] mb-4">Chats</h2>
            <div className="search-inner">
              <Search size={18} />
              <input type="text" placeholder="Search conversations" />
            </div>
          </div>

          <div className="chat-list">
            {appointments.map(app => {
              const otherParty = user.role === 'doctor' ? app.userId?.name : app.doctorId?.name;
              const isActive = selectedApp?._id === app._id;
              return (
                <div 
                  key={app._id} 
                  className={`chat-list-item ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedApp(app);
                    setMessages(app.chatHistory || []);
                  }}
                >
                  <div className="item-avatar">
                    <User size={24} className="opacity-50" />
                  </div>
                  <div className="item-content">
                    <div className="item-top">
                      <span className="item-name">{otherParty || 'Unknown Client'}</span>
                      <span className="item-time">
                        {app.lastMessageTime ? new Date(app.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '---'}
                      </span>
                    </div>
                    <div className="item-bottom">
                      {app.lastMessage ? (
                        <>
                          <CheckCheck size={14} className="text-blue mr-1" />
                          <p className="item-msg">{app.lastMessage}</p>
                        </>
                      ) : (
                        <p className="item-msg italic">No messages yet</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {appointments.length === 0 && (
              <div className="p-8 text-center text-slate-400">
                <MessageCircle size={48} className="mx-auto mb-4 opacity-20" />
                <p>No active consultations found.</p>
              </div>
            )}
          </div>
        </aside>

        {/* Main Chat Area */}
        <main className="chat-main">
          {selectedApp ? (
            <>
              <header className="whatsapp-header">
                <div className="header-info">
                  <div className="header-avatar"><User size={24} className="opacity-50"/></div>
                  <div>
                    <h3>{user.role === 'doctor' ? selectedApp.userId?.name : selectedApp.doctorId?.name}</h3>
                    <p>Consultation Active</p>
                  </div>
                </div>
                <div className="header-actions">
                  <Video size={20} />
                  <Phone size={20} />
                  <Search size={20} />
                  <MoreVertical size={20} />
                </div>
              </header>

              <div className="whatsapp-messages">
                <div className="encryption-notice">
                   <ShieldCheck size={14} className="text-amber-500" />
                   Messages are end-to-end encrypted for your safety.
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
                <div className="whatsapp-input-wrapper">
                  <input 
                    type="text" 
                    placeholder="Type your medical query..." 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend(e)}
                  />
                </div>
                <button type="button" className="whatsapp-send-btn" onClick={handleSend}>
                  <Send size={20} />
                </button>
              </footer>
            </>
          ) : (
            <div className="no-chat-selected">
               <div className="empty-chat-illus">💬</div>
               <h2>MediConnect Web</h2>
               <p>Connect with your assigned healthcare professional. Send and receive secure encrypted messages easily from your browser.</p>
               <div className="mt-8 flex items-center gap-2 text-xs text-slate-400">
                 <ShieldCheck size={12}/> Secure Consultation Protocol Active
               </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
