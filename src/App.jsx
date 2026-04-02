"" 
import { useState, useRef, useEffect } from "react";

// ============================================================
//  CONFIG — Choose your API provider
// ============================================================
const API_PROVIDER = "grok"; // "anthropic" | "openai" | "grok"
const API_KEY = import.meta.env.VITE_GROK_API_KEY || "xai-J2SsDkcf2dksyo6XfmN1y0OrvsBrOtHv1b1BIxSl6t1DWXRiGicssVcVlMP39kAzmO1zdHmp2zi2ulOH"; // Get from https://console.x.ai
// ============================================================

// Provider configs — Grok is now included!
const PROVIDERS = {
  anthropic: {
    url:   "https://api.anthropic.com/v1/messages",
    model: "claude-3-sonnet-20241022",
    headers: (key) => ({
      "Content-Type":            "application/json",
      "x-api-key":               key,
      "anthropic-version":       "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    }),
    body: (history, systemPrompt) => JSON.stringify({
      model:      "claude-3-sonnet-20241022",
      max_tokens: 1000,
      stream:     true,
      system:     systemPrompt,
      messages:   history,
    }),
    extractDelta: (evt) => evt?.delta?.text || "",
  },
  
  openai: {
    url:   "https://api.openai.com/v1/chat/completions",
    model: "gpt-4o",
    headers: (key) => ({
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${key}`,
    }),
    body: (history, systemPrompt) => JSON.stringify({
      model:      "gpt-4o",
      max_tokens: 1000,
      stream:     true,
      messages:   [{ role: "system", content: systemPrompt }, ...history],
    }),
    extractDelta: (evt) => evt?.choices?.[0]?.delta?.content || "",
  },
  
  // 🆓 GROK AI (xAI) - Free tier available!
  grok: {
    url:   "https://api.x.ai/v1/chat/completions",
    model: "grok-beta", // or "grok-2-latest" for newest version
    headers: (key) => ({
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${key}`,
    }),
    body: (history, systemPrompt) => JSON.stringify({
      model:      "grok-beta",
      max_tokens: 1000,
      stream:     true,
      temperature: 0.7,
      messages:   [{ role: "system", content: systemPrompt }, ...history],
    }),
    extractDelta: (evt) => evt?.choices?.[0]?.delta?.content || "",
  },
};

// ── System Prompt ─────────────────────────────────────────────
const SYSTEM_PROMPT = `You are MediAssist, an AI health assistant for an Indian online medical store.
Help users by:
1. Suggesting OTC medicines for mild, common symptoms
2. Escalating to a specialist doctor when needed

RESPONSE FORMAT — always respond in this JSON only, no extra text:
{
  "mode": "medicine" | "escalate" | "clarify",
  "confidence": 0.0 to 1.0,
  "summary": "1-2 line plain English summary",
  "medicines": [{ "name": "Brand (Generic)", "dosage": "...", "duration": "...", "warning": "..." }],
  "escalate_reason": "why escalating (only if mode is escalate)",
  "escalate_specialty": "e.g. Cardiologist (only if mode is escalate)",
  "clarification_question": "single follow-up question (only if mode is clarify)",
  "general_advice": "home care tips + always end with: This is not a substitute for professional medical advice."
}

SUGGEST MEDICINES when: mild cold, headache, fever, acidity, loose motion, minor allergies. OTC India only.
ESCALATE when: chest pain, breathing difficulty, neurological symptoms, fever 103F+ for 3+ days, infants under 2, pregnancy, drug interactions, blood in stool/urine/vomit, severe abdominal pain, mental health crisis, user asks for doctor, confidence < 0.6.
CLARIFY when: too vague — ask ONE focused question only.
NEVER: prescribe antibiotics/steroids/opioids, diagnose a disease, dismiss serious symptoms.
CONTEXT: India-based users. Use brand + generic names. Clear English even for Hinglish input.`;

// ── Doctors data ──────────────────────────────────────────────
const DOCTORS = {
  default:       [{ initials:"PM", name:"Dr. Priya Mehta",  specialty:"General Physician", exp:"8 yrs",  status:"Available now", bg:"#E1F5EE", fg:"#085041" }, { initials:"RV", name:"Dr. Raj Verma",   specialty:"Internal Medicine", exp:"12 yrs", status:"In 10 min",    bg:"#E6F1FB", fg:"#042C53" }],
  Cardiologist:  [{ initials:"AK", name:"Dr. Anil Kumar",   specialty:"Cardiologist",       exp:"14 yrs", status:"Available now", bg:"#FAECE7", fg:"#4A1B0C" }, { initials:"SR", name:"Dr. Sunita Rao",  specialty:"Cardiologist",       exp:"9 yrs",  status:"Available now", bg:"#FAECE7", fg:"#4A1B0C" }],
  Dermatologist: [{ initials:"NJ", name:"Dr. Nisha Joshi",  specialty:"Dermatologist",      exp:"7 yrs",  status:"Available now", bg:"#EEEDFE", fg:"#26215C" }],
  Paediatrician: [{ initials:"NK", name:"Dr. Neha Kapoor",  specialty:"Paediatrician",      exp:"6 yrs",  status:"Available now", bg:"#EAF3DE", fg:"#173404" }],
};
function getDoctors(specialty) {
  if (!specialty) return DOCTORS.default;
  for (const key of Object.keys(DOCTORS))
    if (specialty.toLowerCase().includes(key.toLowerCase())) return DOCTORS[key];
  return DOCTORS.default;
}

const QUICK_REPLIES = ["I have a headache and mild fever", "I need Paracetamol 500mg", "Chest pain and breathlessness", "Talk to a doctor"];

// ── Sub-components ────────────────────────────────────────────
function BotAvatar() {
  return <div style={{ width:28, height:28, borderRadius:"50%", background:"#D1FAE5", color:"#065F46", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, flexShrink:0 }}>M</div>;
}

function TypingIndicator() {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 14px", background:"#F8F9FA", borderRadius:14, maxWidth:80, border:"0.5px solid #E5E7EB" }}>
      {[0,1,2].map(i => <span key={i} style={{ width:7, height:7, borderRadius:"50%", background:"#9CA3AF", display:"inline-block", animation:"mediPulse 1.2s infinite", animationDelay:`${i*0.2}s` }} />)}
    </div>
  );
}

function Badge({ label, bg, color }) {
  return <span style={{ fontSize:10, fontWeight:600, background:bg, color, padding:"3px 10px", borderRadius:20, letterSpacing:0.4, textTransform:"uppercase", display:"inline-block", marginBottom:8 }}>{label}</span>;
}

function MedicineBubble({ medicines, summary, general_advice }) {
  return (
    <div>
      <Badge label="Medicine Suggestion" bg="#DCFCE7" color="#166534" />
      <p style={{ fontSize:13, color:"#374151", marginBottom:12, lineHeight:1.5 }}>{summary}</p>
      {medicines?.map((med, i) => (
        <div key={i} style={{ background:"#fff", border:"0.5px solid #D1FAE5", borderLeft:"3px solid #10B981", borderRadius:10, padding:"10px 12px", marginBottom:8 }}>
          <p style={{ fontWeight:600, fontSize:13, color:"#111827", marginBottom:2 }}>{med.name}</p>
          <p style={{ fontSize:12, color:"#6B7280", marginBottom:2 }}><span style={{ color:"#059669", fontWeight:500 }}>Dose: </span>{med.dosage}</p>
          <p style={{ fontSize:12, color:"#6B7280", marginBottom:med.warning?2:0 }}><span style={{ color:"#059669", fontWeight:500 }}>Duration: </span>{med.duration}</p>
          {med.warning && <p style={{ fontSize:11, color:"#B45309", marginTop:4, background:"#FFFBEB", padding:"4px 8px", borderRadius:6 }}>{med.warning}</p>}
        </div>
      ))}
      {general_advice && <p style={{ fontSize:12, color:"#6B7280", marginTop:8, fontStyle:"italic", lineHeight:1.5 }}>{general_advice}</p>}
    </div>
  );
}

function EscalateBubble({ escalate_reason, escalate_specialty, summary }) {
  const doctors = getDoctors(escalate_specialty);
  return (
    <div>
      <Badge label="Doctor Connect" bg="#FEE2E2" color="#991B1B" />
      <p style={{ fontSize:13, color:"#374151", marginBottom:6, lineHeight:1.5 }}>{summary}</p>
      {escalate_reason && <p style={{ fontSize:12, color:"#B91C1C", background:"#FEF2F2", padding:"6px 10px", borderRadius:8, marginBottom:10, border:"0.5px solid #FECACA" }}>{escalate_reason}</p>}
      <p style={{ fontSize:12, fontWeight:600, color:"#374151", marginBottom:6 }}>Available {escalate_specialty || "Specialists"}:</p>
      <div style={{ border:"0.5px solid #E5E7EB", borderRadius:10, overflow:"hidden" }}>
        {doctors.map((doc, i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderBottom:i<doctors.length-1?"0.5px solid #F3F4F6":"none", cursor:"pointer", background:"#fff", transition:"background 0.15s" }}
            onMouseEnter={e=>e.currentTarget.style.background="#F9FAFB"}
            onMouseLeave={e=>e.currentTarget.style.background="#fff"}>
            <div style={{ width:34, height:34, borderRadius:"50%", background:doc.bg, color:doc.fg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, flexShrink:0 }}>{doc.initials}</div>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:13, fontWeight:600, color:"#111827" }}>{doc.name}</p>
              <p style={{ fontSize:11, color:"#6B7280" }}>{doc.specialty} · {doc.exp} exp</p>
            </div>
            <span style={{ fontSize:10, fontWeight:600, padding:"3px 9px", borderRadius:20, background:"#DCFCE7", color:"#166534" }}>{doc.status}</span>
          </div>
        ))}
      </div>
      <p style={{ fontSize:11, color:"#9CA3AF", marginTop:8 }}>Emergency? Call <strong style={{ color:"#DC2626" }}>108</strong> immediately.</p>
    </div>
  );
}

function ClarifyBubble({ clarification_question, summary }) {
  return (
    <div>
      <Badge label="Follow-up" bg="#EFF6FF" color="#1E40AF" />
      {summary && <p style={{ fontSize:13, color:"#374151", marginBottom:8, lineHeight:1.5 }}>{summary}</p>}
      <p style={{ fontSize:13, color:"#1D4ED8", lineHeight:1.5 }}>{clarification_question}</p>
    </div>
  );
}

function MessageBubble({ msg }) {
  if (msg.role === "user") {
    return (
      <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:12 }}>
        <div style={{ maxWidth:"75%", background:"linear-gradient(135deg,#059669,#10B981)", color:"#fff", borderRadius:"18px 18px 4px 18px", padding:"10px 14px", fontSize:13.5, lineHeight:1.55 }}>{msg.content}</div>
      </div>
    );
  }
  if (msg.type === "typing") return (
    <div style={{ display:"flex", gap:8, alignItems:"flex-end", marginBottom:12 }}><BotAvatar /><TypingIndicator /></div>
  );

  const bubbleBase = { maxWidth:"80%", background:"#fff", border:"0.5px solid #E5E7EB", borderRadius:"4px 18px 18px 18px", padding:"12px 14px" };

  if (msg.streaming) return (
    <div style={{ display:"flex", gap:8, alignItems:"flex-start", marginBottom:12 }}>
      <BotAvatar />
      <div style={{ ...bubbleBase, fontSize:13, lineHeight:1.6, color:"#6B7280", fontFamily:"monospace", wordBreak:"break-word" }}>
        {msg.content}
        <span style={{ display:"inline-block", width:2, height:"1em", background:"#10B981", marginLeft:2, verticalAlign:"text-bottom", animation:"mediCursor 0.8s step-end infinite" }} />
      </div>
    </div>
  );

  const p = msg.parsed;
  return (
    <div style={{ display:"flex", gap:8, alignItems:"flex-start", marginBottom:12 }}>
      <BotAvatar />
      <div style={{ ...bubbleBase, fontSize:13.5, lineHeight:1.55, color:"#111827" }}>
        {p?.mode === "medicine"  ? <MedicineBubble  {...p} /> :
         p?.mode === "escalate"  ? <EscalateBubble  {...p} /> :
         p?.mode === "clarify"   ? <ClarifyBubble   {...p} /> :
         <p style={{ fontSize:13, color:"#374151", margin:0 }}>{msg.content}</p>}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────
export default function MediAssistChat() {
  const [messages, setMessages]               = useState([{ id:"init", role:"assistant", content:"Hello! I'm MediAssist, your health companion. Describe your symptoms and I'll suggest medicines, or connect you with a specialist doctor.", parsed:null }]);
  const [input,    setInput]                  = useState("");
  const [loading,  setLoading]                = useState(false);
  const [showQuick,setShowQuick]              = useState(true);
  const [history,  setHistory]                = useState([]);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages]);

  async function callAPI(userMessage) {
    const provider   = PROVIDERS[API_PROVIDER];
    const newHistory = [...history, { role:"user", content:userMessage }];
    const botMsgId   = Date.now() + 1;

    // Show streaming bubble right away
    setMessages(prev => [...prev.filter(m => m.id !== "typing"), { id:botMsgId, role:"assistant", content:"", parsed:null, streaming:true }]);

    // 30s timeout for Grok (sometimes slower)
    const ctrl    = new AbortController();
    const timer   = setTimeout(() => ctrl.abort(), 30000);

    let response;
    try {
      response = await fetch(provider.url, {
        method:  "POST",
        signal:  ctrl.signal,
        headers: provider.headers(API_KEY),
        body:    provider.body(newHistory, SYSTEM_PROMPT),
      });
    } finally {
      clearTimeout(timer);
    }

    if (!response.ok) {
      const err = await response.text().catch(() => "");
      throw new Error(`${API_PROVIDER} API ${response.status}: ${err}`);
    }

    // Stream SSE — each provider has its own delta path
    const reader  = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText  = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      for (const line of decoder.decode(value, { stream:true }).split("\n")) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6).trim();
        if (data === "[DONE]") continue;
        try {
          const delta = provider.extractDelta(JSON.parse(data));
          if (!delta) continue;
          fullText += delta;
          setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, content:fullText } : m));
        } catch { /* skip malformed chunk */ }
      }
    }

    // Parse JSON — fall back gracefully if model returns non-JSON
    let parsed;
    try {
      const cleanJson = fullText.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(cleanJson);
    } catch {
      parsed = { mode:"clarify", summary:fullText, clarification_question:"Could you please provide more details about your symptoms?" };
    }

    setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, content:parsed?.summary || fullText, parsed, streaming:false } : m));
    setHistory([...newHistory, { role:"assistant", content:parsed?.summary || fullText }]);
  }

  async function handleSend(text) {
    const userText = (text || input).trim();
    if (!userText || loading) return;
    setInput("");
    setShowQuick(false);
    setMessages(prev => [...prev, { id:Date.now(), role:"user", content:userText }, { id:"typing", role:"assistant", type:"typing" }]);
    setLoading(true);
    try {
      await callAPI(userText);
    } catch (err) {
      console.error("API Error:", err);
      const msg = err.name === "AbortError"
        ? "Response took too long — please try again. Emergency? Call 108."
        : `Could not connect to ${API_PROVIDER}. Please check your API key and internet connection. Emergency? Call 108.`;
      setMessages(prev => [...prev.filter(m => m.id !== "typing" && !m.streaming), { id:Date.now()+2, role:"assistant", content:msg, parsed:{ mode:"clarify", summary:msg, clarification_question:"" }, streaming:false }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  const providerNames = {
    anthropic: "Claude",
    openai: "GPT-4o",
    grok: "Grok 🆓"
  };
  const providerLabel = providerNames[API_PROVIDER] || "AI";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes mediPulse{0%,60%,100%{transform:translateY(0);opacity:.4}30%{transform:translateY(-5px);opacity:1}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes mediCursor{0%,100%{opacity:1}50%{opacity:0}}
        .medi-msg{animation:fadeUp 0.25s ease forwards}
        .medi-input:focus{outline:none;box-shadow:0 0 0 2px #A7F3D0}
        .medi-qr:hover{background:#F0FDF4!important;border-color:#6EE7B7!important;color:#065F46!important}
        .medi-send:hover{background:#047857!important}
        .medi-send:active{transform:scale(0.95)}
      `}</style>

      <div style={{ fontFamily:"'DM Sans',sans-serif", display:"flex", flexDirection:"column", height:580, maxWidth:420, width:"100%", background:"#FAFAFA", border:"0.5px solid #E5E7EB", borderRadius:20, overflow:"hidden", boxShadow:"0 4px 24px rgba(0,0,0,0.06)" }}>

        {/* Header */}
        <div style={{ padding:"14px 18px", background:"#fff", borderBottom:"0.5px solid #F0F0F0", display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:38, height:38, borderRadius:"50%", background:"linear-gradient(135deg,#059669,#34D399)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:17, flexShrink:0 }}>+</div>
          <div style={{ flex:1 }}>
            <p style={{ fontWeight:600, fontSize:15, color:"#111827", margin:0 }}>MediAssist AI</p>
            <p style={{ fontSize:11, color:"#10B981", margin:0, fontWeight:500 }}>Online · Health companion</p>
          </div>
          <div style={{ fontSize:11, color:"#6B7280", background:"#F3F4F6", padding:"4px 10px", borderRadius:20 }}>
            Powered by {providerLabel}
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex:1, overflowY:"auto", padding:"16px 14px", display:"flex", flexDirection:"column" }}>
          {messages.map(msg => <div key={msg.id} className="medi-msg"><MessageBubble msg={msg} /></div>)}
          <div ref={bottomRef} />
        </div>

        {/* Quick replies */}
        {showQuick && (
          <div style={{ padding:"0 14px 10px", display:"flex", flexWrap:"wrap", gap:6 }}>
            {QUICK_REPLIES.map(qr => (
              <button key={qr} className="medi-qr" onClick={() => handleSend(qr)}
                style={{ fontSize:11.5, padding:"5px 12px", borderRadius:20, border:"0.5px solid #D1FAE5", background:"#fff", color:"#065F46", cursor:"pointer", fontFamily:"inherit", fontWeight:500, transition:"all 0.15s" }}>
                {qr}
              </button>
            ))}
          </div>
        )}

        {/* Input bar */}
        <div style={{ display:"flex", gap:8, alignItems:"center", padding:"10px 14px", background:"#fff", borderTop:"0.5px solid #F0F0F0" }}>
          <input ref={inputRef} className="medi-input" value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            placeholder="Describe symptoms or search medicine..."
            disabled={loading}
            style={{ flex:1, padding:"9px 14px", borderRadius:24, border:"0.5px solid #D1FAE5", background:"#F9FAFB", fontSize:13.5, color:"#111827", fontFamily:"inherit", transition:"box-shadow 0.2s" }}
          />
          <button className="medi-send" onClick={() => handleSend()} disabled={loading || !input.trim()}
            style={{ width:38, height:38, borderRadius:"50%", background:loading||!input.trim()?"#A7F3D0":"#059669", border:"none", cursor:loading||!input.trim()?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"background 0.15s", flexShrink:0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
