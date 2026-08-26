import { Bot, Send, Sparkles, User } from 'lucide-react';
import { useState } from 'react';

export default function AIAgent() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hello! I am the CivicSight AI. I have analyzed INC-8492 and INC-8491. Would you like me to draft official civic repair orders for these critical potholes?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { role: 'user', text: input }]);
    setInput('');
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Drafting repair orders now. Assigning to the downtown maintenance crew. I will email the supervisor the drafted documents for signature.' }]);
    }, 1000);
  };

  return (
    <div className="glass-panel agent-container">
      <div className="panel-header">
        <h2 className="panel-title"><Sparkles size={20} style={{ color: 'var(--accent-color)' }} /> AI Civic Agent</h2>
      </div>
      <div className="panel-content flex-col justify-between" style={{ padding: '1.5rem 1.5rem 0 1.5rem', flex: 1, overflowY: 'hidden' }}>
        <div className="flex-col" style={{ flex: 1, overflowY: 'auto' }}>
          {messages.map((msg, idx) => (
            <div key={idx} className={`chat-message ${msg.role}`}>
              {msg.role === 'assistant' ? (
                 <div className="chat-avatar"><Bot size={20} color="white" /></div>
              ) : (
                 <div className="chat-avatar user"><User size={20} color="white" /></div>
              )}
              <div className="chat-bubble">
                {msg.text}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="chat-input-container">
        <input 
          type="text" 
          className="chat-input" 
          placeholder="Ask the AI to draft an order..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
        />
        <button className="btn" onClick={handleSend} style={{ padding: '0.75rem 1rem' }}>
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
