import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from './ThemeProvider';
import TemplateRenderer from './TemplateRenderer';

const SAMPLE_TEMPLATES = [
  {
    id: 'pitch-deck',
    name: 'Pitch Deck',
    category: 'business',
    template: {
      title: 'Business Pitch Deck',
      subtitle: '12 slides for startups',
      elements: [
        { type: 'heading', text: 'Innoveta', color: '#ffffff', fontSize: 42, x: 50, y: 45 },
        { type: 'paragraph', text: 'Building the future of technology', color: 'rgba(255,255,255,0.7)', fontSize: 18, x: 50, y: 55 },
        { type: 'button', text: 'Get Started', bg: '#38bdf8', color: '#ffffff', fontSize: 15, x: 50, y: 68 },
      ],
      background: { type: 'gradient', from: '#0f172a', to: '#1e293b' },
      fonts: { heading: 'Inter', body: 'Inter' },
      style: { borderRadius: 16, padding: 40, textAlign: 'center' },
    },
  },
  {
    id: 'social-media',
    name: 'Social Media Post',
    category: 'social',
    template: {
      title: 'New Collection',
      subtitle: 'Spring 2025',
      elements: [
        { type: 'heading', text: '50% OFF', color: '#fbbf24', fontSize: 48, x: 50, y: 45 },
        { type: 'paragraph', text: 'Limited time offer on all products', color: '#ffffff', fontSize: 16, x: 50, y: 58 },
        { type: 'button', text: 'Shop Now', bg: '#f59e0b', color: '#000000', fontSize: 14, x: 50, y: 70 },
      ],
      background: { type: 'gradient', from: '#7c3aed', to: '#a855f7' },
      fonts: { heading: 'Inter', body: 'Inter' },
      style: { borderRadius: 12, padding: 30, textAlign: 'center' },
    },
  },
  {
    id: 'wedding',
    name: 'Wedding Invitation',
    category: 'wedding',
    template: {
      title: 'Save the Date',
      subtitle: 'Sarah & James',
      elements: [
        { type: 'heading', text: 'June 15, 2025', color: '#d4a574', fontSize: 22, x: 50, y: 42 },
        { type: 'paragraph', text: 'Join us for our special day', color: '#f5f0e8', fontSize: 16, x: 50, y: 52 },
        { type: 'divider', color: '#d4a574', width: 40, x: 50, y: 60 },
        { type: 'button', text: 'RSVP Now', bg: '#d4a574', color: '#1a1a2e', fontSize: 14, x: 50, y: 70 },
      ],
      background: { type: 'gradient', from: '#1a1a2e', to: '#2d1b4e' },
      fonts: { heading: 'Inter', body: 'Inter' },
      style: { borderRadius: 8, padding: 50, textAlign: 'center' },
    },
  },
  {
    id: 'newsletter',
    name: 'Newsletter Header',
    category: 'email',
    template: {
      title: 'Weekly Insights',
      subtitle: 'Your dose of inspiration',
      elements: [
        { type: 'heading', text: 'Top Stories This Week', color: '#ffffff', fontSize: 28, x: 50, y: 40 },
        { type: 'paragraph', text: 'Stay updated with the latest trends', color: 'rgba(255,255,255,0.8)', fontSize: 16, x: 50, y: 52 },
        { type: 'button', text: 'Read More', bg: '#10b981', color: '#ffffff', fontSize: 14, x: 50, y: 65 },
      ],
      background: { type: 'gradient', from: '#065f46', to: '#047857' },
      fonts: { heading: 'Inter', body: 'Inter' },
      style: { borderRadius: 12, padding: 40, textAlign: 'center' },
    },
  },
  {
    id: 'event',
    name: 'Event Promo',
    category: 'business',
    template: {
      title: 'Tech Conference 2025',
      subtitle: 'Innovation Summit',
      elements: [
        { type: 'heading', text: 'MARCH 20-22', color: '#38bdf8', fontSize: 30, x: 50, y: 40 },
        { type: 'paragraph', text: '200+ speakers | 50+ workshops', color: '#e2e8f0', fontSize: 16, x: 50, y: 52 },
        { type: 'button', text: 'Register Now', bg: '#38bdf8', color: '#0f172a', fontSize: 15, x: 50, y: 66 },
      ],
      background: { type: 'gradient', from: '#0f172a', to: '#1e3a5f' },
      fonts: { heading: 'Inter', body: 'Inter' },
      style: { borderRadius: 16, padding: 40, textAlign: 'center' },
    },
  },
  {
    id: 'restaurant',
    name: 'Restaurant Menu',
    category: 'food',
    template: {
      title: 'Fresh & Organic',
      subtitle: 'Farm to Table',
      elements: [
        { type: 'heading', text: 'Seasonal Menu', color: '#fbbf24', fontSize: 36, x: 50, y: 40 },
        { type: 'paragraph', text: 'Locally sourced, chef crafted dishes', color: '#e2e8f0', fontSize: 16, x: 50, y: 52 },
        { type: 'divider', color: '#fbbf24', width: 30, x: 50, y: 62 },
        { type: 'button', text: 'View Menu', bg: '#fbbf24', color: '#1a1a2e', fontSize: 14, x: 50, y: 72 },
      ],
      background: { type: 'gradient', from: '#1a1a2e', to: '#2d2d2d' },
      fonts: { heading: 'Inter', body: 'Inter' },
      style: { borderRadius: 12, padding: 40, textAlign: 'center' },
    },
  },
];

const QUICK_PROMPTS = [
  'Make it more professional',
  'Change colors to blue theme',
  'Add a phone number element',
  'Make the title bigger',
  'Change to a dark red theme',
  'Add a website URL',
];

const AICustomizer = ({ onBack }) => {
  const { dark } = useTheme();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const chatRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [chatHistory]);

  const selectTemplate = (tmpl) => {
    setSelectedTemplate(tmpl);
    setCurrentTemplate(tmpl.template);
    setHistory([tmpl.template]);
    setHistoryIdx(0);
    setChatHistory([
      { role: 'system', text: `Selected "${tmpl.name}" template. Describe what you want to change.` },
    ]);
  };

  const generateTemplate = async (prompt) => {
    setGenerating(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/ai/suggest-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ prompt, category: selectedTemplate?.category || 'general' }),
      });
      const data = await res.json();
      if (data.data) {
        const newTmpl = { id: 'ai-generated', name: 'AI Generated', category: 'custom', template: data.data };
        setSelectedTemplate(newTmpl);
        setCurrentTemplate(data.data);
        setHistory([data.data]);
        setHistoryIdx(0);
        return data.data;
      }
    } catch (e) {
      console.error('Generate failed:', e);
    } finally {
      setGenerating(false);
    }
    return null;
  };

  const customizeTemplate = async (prompt) => {
    if (!currentTemplate) return null;
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/ai/customize-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ template: currentTemplate, prompt }),
      });
      const data = await res.json();
      if (data.data) {
        setCurrentTemplate(data.data);
        setHistory((h) => [...h, data.data]);
        setHistoryIdx((i) => i + 1);
        return data.data;
      }
    } catch (e) {
      console.error('Customize failed:', e);
    } finally {
      setLoading(false);
    }
    return null;
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading || generating) return;
    setInput('');

    setChatHistory((h) => [...h, { role: 'user', text }]);

    let result;
    if (!currentTemplate) {
      result = await generateTemplate(text);
    } else {
      result = await customizeTemplate(text);
    }

    if (result) {
      setChatHistory((h) => [
        ...h,
        { role: 'assistant', text: 'Template updated! Check the preview.' },
      ]);
    } else {
      setChatHistory((h) => [
        ...h,
        { role: 'assistant', text: 'Failed to process. Please try again.' },
      ]);
    }
  };

  const handleQuickPrompt = (prompt) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  const undo = () => {
    if (historyIdx > 0) {
      const newIdx = historyIdx - 1;
      setHistoryIdx(newIdx);
      setCurrentTemplate(history[newIdx]);
      setChatHistory((h) => [...h, { role: 'system', text: 'Undid last change.' }]);
    }
  };

  const redo = () => {
    if (historyIdx < history.length - 1) {
      const newIdx = historyIdx + 1;
      setHistoryIdx(newIdx);
      setCurrentTemplate(history[newIdx]);
      setChatHistory((h) => [...h, { role: 'system', text: 'Redid change.' }]);
    }
  };

  const downloadTemplate = () => {
    if (!currentTemplate) return;
    const blob = new Blob([JSON.stringify(currentTemplate, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(selectedTemplate?.name || 'template').toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const previewScale = 0.55;

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-100px)] gap-4 p-4">
      {/* Left Panel — Chat + Templates */}
      <div className={`flex-1 flex flex-col rounded-2xl border ${dark ? 'bg-[#0a0f1a] border-white/10' : 'bg-white border-gray-200'} overflow-hidden`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-4 py-3 border-b ${dark ? 'border-white/10' : 'border-gray-200'}`}>
          <div className="flex items-center gap-2">
            <button onClick={onBack} className={`p-1.5 rounded-lg ${dark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5m7-7l-7 7 7 7"/></svg>
            </button>
            <h2 className={`text-lg font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>AI Template Studio</h2>
          </div>
          {currentTemplate && (
            <div className="flex items-center gap-1">
              <button
                onClick={undo}
                disabled={historyIdx <= 0}
                className={`p-1.5 rounded-lg ${dark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'} disabled:opacity-30`}
                title="Undo"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 10h10a5 5 0 015 5v2M3 10l5-5M3 10l5 5"/></svg>
              </button>
              <button
                onClick={redo}
                disabled={historyIdx >= history.length - 1}
                className={`p-1.5 rounded-lg ${dark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'} disabled:opacity-30`}
                title="Redo"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10H11a5 5 0 00-5 5v2M21 10l-5-5M21 10l-5 5"/></svg>
              </button>
              <button
                onClick={downloadTemplate}
                className={`p-1.5 rounded-lg ${dark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                title="Download JSON"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
              </button>
            </div>
          )}
        </div>

        {/* Template Picker (shown when none selected) */}
        {!currentTemplate && (
          <div className="flex-1 overflow-y-auto p-4">
            <p className={`text-sm mb-3 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Choose a template or describe what you want to create:</p>
            <div className="grid grid-cols-2 gap-3">
              {SAMPLE_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => selectTemplate(tmpl)}
                  className={`text-left p-3 rounded-xl border transition-all ${dark ? 'border-white/10 hover:border-teal/50 bg-white/5 hover:bg-white/10' : 'border-gray-200 hover:border-teal/50 bg-gray-50 hover:bg-gray-100'}`}
                >
                  <div className={`text-sm font-semibold ${dark ? 'text-white' : 'text-gray-900'}`}>{tmpl.name}</div>
                  <div className={`text-xs mt-1 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>{tmpl.category}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Messages */}
        {currentTemplate && (
          <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatHistory.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#38bdf8] text-white rounded-br-md'
                      : msg.role === 'system'
                      ? `${dark ? 'bg-white/5 text-gray-400' : 'bg-gray-100 text-gray-500'} rounded-bl-md text-xs italic`
                      : `${dark ? 'bg-white/10 text-gray-200' : 'bg-gray-100 text-gray-700'} rounded-bl-md`
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {(loading || generating) && (
              <div className="flex justify-start">
                <div className={`px-3.5 py-2.5 rounded-2xl rounded-bl-md text-sm ${dark ? 'bg-white/10 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-[#38bdf8] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-[#38bdf8] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-[#38bdf8] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Prompts */}
        {currentTemplate && chatHistory.length <= 2 && (
          <div className={`px-4 pb-2 flex flex-wrap gap-1.5 ${dark ? '' : ''}`}>
            {QUICK_PROMPTS.map((p, i) => (
              <button
                key={i}
                onClick={() => handleQuickPrompt(p)}
                className={`text-xs px-2.5 py-1.5 rounded-full border transition-colors ${dark ? 'border-white/10 text-gray-400 hover:border-teal/50 hover:text-teal' : 'border-gray-200 text-gray-500 hover:border-teal/50 hover:text-teal-600'}`}
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        {currentTemplate && (
          <div className={`px-4 py-3 border-t ${dark ? 'border-white/10' : 'border-gray-200'}`}>
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Describe changes..."
                className={`flex-1 px-4 py-2.5 rounded-xl text-sm outline-none border transition-colors ${
                  dark ? 'bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-teal/50' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-teal/50'
                }`}
                disabled={loading || generating}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading || generating}
                className="p-2.5 rounded-xl bg-[#38bdf8] text-white hover:bg-[#0ea5e9] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right Panel — Preview */}
      <div className={`lg:w-[520px] flex flex-col rounded-2xl border ${dark ? 'bg-[#0a0f1a] border-white/10' : 'bg-white border-gray-200'} overflow-hidden`}>
        <div className={`px-4 py-3 border-b ${dark ? 'border-white/10' : 'border-gray-200'} flex items-center justify-between`}>
          <h3 className={`text-sm font-semibold ${dark ? 'text-white' : 'text-gray-900'}`}>Live Preview</h3>
          {selectedTemplate && (
            <span className={`text-xs px-2 py-1 rounded-full ${dark ? 'bg-white/5 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
              {selectedTemplate.name}
            </span>
          )}
        </div>
        <div className="flex-1 overflow-auto p-4 flex items-start justify-center">
          {currentTemplate ? (
            <div className="mt-2">
              <TemplateRenderer template={currentTemplate} scale={previewScale} width={800} height={500} />
            </div>
          ) : (
            <div className={`flex flex-col items-center justify-center h-full ${dark ? 'text-gray-600' : 'text-gray-300'}`}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
              <p className="mt-3 text-sm">Select a template to preview</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AICustomizer;
