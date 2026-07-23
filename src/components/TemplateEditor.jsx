import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from './ThemeProvider';
import { fetchTemplate, fetchTemplateImages } from '../data';

const INITIAL_TEMPLATE = {
  title: 'Your Design',
  subtitle: 'Click to edit',
  elements: [],
  background: { type: 'gradient', from: '#0f172a', to: '#1e293b' },
  fonts: { heading: 'Inter', body: 'Inter' },
  style: { borderRadius: 12, padding: 40, textAlign: 'center' },
};

const CANVAS_W = 800;
const CANVAS_H = 500;

const ELEMENT_DEFAULTS = {
  heading: { text: 'New Heading', color: '#ffffff', fontSize: 32, fontWeight: 700, width: 80 },
  paragraph: { text: 'New paragraph text', color: 'rgba(255,255,255,0.8)', fontSize: 16, fontWeight: 400, width: 60 },
  button: { text: 'Click Me', bg: '#38bdf8', color: '#ffffff', fontSize: 15, fontWeight: 600, width: 30 },
  divider: { color: '#38bdf8', width: 40 },
  icon: { text: '★', color: '#fbbf24', fontSize: 36, width: 10 },
};

function uid() { return Math.random().toString(36).slice(2, 9); }

export default function TemplateEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { dark } = useTheme();
  const canvasRef = useRef(null);
  const aiInputRef = useRef(null);

  const [template, setTemplate] = useState(INITIAL_TEMPLATE);
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [resizing, setResizing] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [zoom, setZoom] = useState(1);
  const [editingText, setEditingText] = useState(null);
  const [showAI, setShowAI] = useState(false);
  const [aiMessages, setAiMessages] = useState([]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [loading, setLoading] = useState(!!id);
  const [exportMenu, setExportMenu] = useState(false);
  const [bgPicker, setBgPicker] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([fetchTemplate(id), fetchTemplateImages(id)])
      .then(([t, imgs]) => {
        if (t) {
          setTemplate({ ...INITIAL_TEMPLATE, title: t.name || 'Template', subtitle: t.description || '' });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const pushHistory = useCallback((elems) => {
    setHistory((h) => {
      const newHist = h.slice(0, historyIdx + 1);
      newHist.push(JSON.parse(JSON.stringify(elems)));
      return newHist;
    });
    setHistoryIdx((i) => i + 1);
  }, [historyIdx]);

  const undo = () => { if (historyIdx > 0) { setHistoryIdx((i) => i - 1); setElements(JSON.parse(JSON.stringify(history[historyIdx - 1]))); } };
  const redo = () => { if (historyIdx < history.length - 1) { setHistoryIdx((i) => i + 1); setElements(JSON.parse(JSON.stringify(history[historyIdx + 1]))); } };

  const addElement = (type) => {
    const def = ELEMENT_DEFAULTS[type] || {};
    const newEl = {
      id: uid(),
      type,
      text: def.text || '',
      color: def.color || '#ffffff',
      bg: def.bg || '',
      fontSize: def.fontSize || 16,
      fontWeight: def.fontWeight || 400,
      x: 50,
      y: 50,
      width: def.width || 40,
      src: '',
    };
    const next = [...elements, newEl];
    setElements(next);
    setSelectedId(newEl.id);
    pushHistory(next);
  };

  const updateElement = (id, updates) => {
    setElements((prev) => {
      const next = prev.map((el) => el.id === id ? { ...el, ...updates } : el);
      return next;
    });
  };

  const commitElementUpdate = (id, updates) => {
    setElements((prev) => {
      const next = prev.map((el) => el.id === id ? { ...el, ...updates } : el);
      pushHistory(next);
      return next;
    });
  };

  const deleteElement = (id) => {
    const next = elements.filter((el) => el.id !== id);
    setElements(next);
    setSelectedId(null);
    pushHistory(next);
  };

  const duplicateElement = (id) => {
    const el = elements.find((e) => e.id === id);
    if (!el) return;
    const newEl = { ...JSON.parse(JSON.stringify(el)), id: uid(), x: Math.min(el.x + 5, 90), y: Math.min(el.y + 5, 90) };
    const next = [...elements, newEl];
    setElements(next);
    setSelectedId(newEl.id);
    pushHistory(next);
  };

  const bringForward = (id) => {
    const idx = elements.findIndex((e) => e.id === id);
    if (idx < elements.length - 1) {
      const next = [...elements];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      setElements(next);
      pushHistory(next);
    }
  };

  const sendBackward = (id) => {
    const idx = elements.findIndex((e) => e.id === id);
    if (idx > 0) {
      const next = [...elements];
      [next[idx], next[idx - 1]] = [next[idx - 1], next[idx]];
      setElements(next);
      pushHistory(next);
    }
  };

  const getCanvasCoords = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    };
  };

  const onElementMouseDown = (e, el) => {
    e.stopPropagation();
    setSelectedId(el.id);
    setEditingText(null);
    const startCoords = getCanvasCoords(e);
    const startPos = { x: el.x, y: el.y };
    const onMove = (me) => {
      const cur = getCanvasCoords(me);
      const dx = cur.x - startCoords.x;
      const dy = cur.y - startCoords.y;
      updateElement(el.id, { x: Math.max(0, Math.min(100, startPos.x + dx)), y: Math.max(0, Math.min(100, startPos.y + dy)) });
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      commitElementUpdate(el.id, {});
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const onResizeMouseDown = (e, el) => {
    e.stopPropagation();
    const startCoords = getCanvasCoords(e);
    const startW = el.width || 40;
    const onMove = (me) => {
      const cur = getCanvasCoords(me);
      const dx = cur.x - startCoords.x;
      updateElement(el.id, { width: Math.max(5, Math.min(100, startW + dx)) });
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      commitElementUpdate(el.id, {});
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const onCanvasClick = () => { setSelectedId(null); setEditingText(null); };

  const onElementDoubleClick = (e, el) => {
    e.stopPropagation();
    if (el.type === 'heading' || el.type === 'paragraph' || el.type === 'button' || el.type === 'icon') {
      setEditingText(el.id);
    }
  };

  const selectedEl = elements.find((e) => e.id === selectedId);

  const bgStyle = (() => {
    const bg = template.background || {};
    switch (bg.type) {
      case 'gradient': return { background: `linear-gradient(135deg, ${bg.from || '#0f172a'}, ${bg.to || '#1e293b'})` };
      case 'solid': return { background: bg.color || '#0f172a' };
      default: return { background: `linear-gradient(135deg, ${bg.from || '#0f172a'}, ${bg.to || '#1e293b'})` };
    }
  })();

  const renderElement = (el) => {
    const isSelected = el.id === selectedId;
    const isEditing = el.id === editingText;
    const baseStyle = {
      position: 'absolute',
      left: `${el.x}%`,
      top: `${el.y}%`,
      transform: 'translate(-50%, -50%)',
      width: el.width ? `${el.width}%` : 'auto',
      maxWidth: '95%',
      cursor: 'move',
      userSelect: isEditing ? 'text' : 'none',
      outline: isSelected ? '2px solid #38bdf8' : 'none',
      outlineOffset: '2px',
      borderRadius: '4px',
      transition: 'outline 0.1s',
    };

    if (el.type === 'button') {
      return (
        <div key={el.id} style={{ ...baseStyle, background: el.bg || '#38bdf8', color: el.color || '#fff', padding: '10px 28px', borderRadius: 8, fontSize: el.fontSize || 15, fontWeight: el.fontWeight || 600, textAlign: 'center', boxShadow: '0 4px 14px rgba(0,0,0,0.25)', whiteSpace: 'nowrap', display: 'inline-block' }}
          onMouseDown={(e) => onElementMouseDown(e, el)}
          onDoubleClick={(e) => onElementDoubleClick(e, el)}
        >
          {isEditing ? (
            <div contentEditable suppressContentEditableWarning autoFocus
              style={{ outline: 'none', minWidth: 40 }}
              onBlur={(e) => { commitElementUpdate(el.id, { text: e.target.textContent }); setEditingText(null); }}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); } }}
            >{el.text}</div>
          ) : el.text}
          {isSelected && <div onMouseDown={(e) => onResizeMouseDown(e, el)} style={{ position: 'absolute', right: -4, bottom: -4, width: 10, height: 10, background: '#38bdf8', borderRadius: 2, cursor: 'se-resize' }} />}
        </div>
      );
    }

    if (el.type === 'divider') {
      return (
        <div key={el.id} style={{ ...baseStyle, height: 2, background: `linear-gradient(90deg, transparent, ${el.color || '#38bdf8'}, transparent)`, borderRadius: 1 }}
          onMouseDown={(e) => onElementMouseDown(e, el)}
        >
          {isSelected && <div onMouseDown={(e) => onResizeMouseDown(e, el)} style={{ position: 'absolute', right: -4, top: -4, width: 10, height: 10, background: '#38bdf8', borderRadius: 2, cursor: 'se-resize' }} />}
        </div>
      );
    }

    return (
      <div key={el.id} style={{ ...baseStyle, color: el.color || '#fff', fontSize: el.fontSize || 16, fontWeight: el.fontWeight || 400, textAlign: template.style?.textAlign || 'center', fontFamily: el.type === 'heading' ? template.fonts?.heading : template.fonts?.body, lineHeight: 1.4, textShadow: '0 1px 4px rgba(0,0,0,0.2)' }}
        onMouseDown={(e) => onElementMouseDown(e, el)}
        onDoubleClick={(e) => onElementDoubleClick(e, el)}
      >
        {isEditing ? (
          <div contentEditable suppressContentEditableWarning autoFocus
            style={{ outline: 'none', minWidth: 40 }}
            onBlur={(e) => { commitElementUpdate(el.id, { text: e.target.textContent }); setEditingText(null); }}
            onKeyDown={(e) => { if (e.key === 'Enter' && el.type !== 'paragraph') { e.preventDefault(); e.target.blur(); } }}
          >{el.text}</div>
        ) : el.text}
        {isSelected && <div onMouseDown={(e) => onResizeMouseDown(e, el)} style={{ position: 'absolute', right: -4, bottom: -4, width: 10, height: 10, background: '#38bdf8', borderRadius: 2, cursor: 'se-resize' }} />}
      </div>
    );
  };

  const sendToAI = async () => {
    const text = aiInput.trim();
    if (!text || aiLoading) return;
    setAiInput('');
    setAiMessages((m) => [...m, { role: 'user', text }]);
    setAiLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const currentTmpl = { ...template, elements: elements.map(({ id: _id, ...rest }) => rest) };
      const res = await fetch('/api/ai/customize-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ template: currentTmpl, prompt: text }),
      });
      const data = await res.json();
      if (data.data) {
        if (data.data.elements) {
          const newElements = data.data.elements.map((el) => ({ ...el, id: uid() }));
          setElements(newElements);
          pushHistory(newElements);
        }
        if (data.data.background) setTemplate((t) => ({ ...t, background: data.data.background }));
        if (data.data.title) setTemplate((t) => ({ ...t, title: data.data.title }));
        if (data.data.subtitle) setTemplate((t) => ({ ...t, subtitle: data.data.subtitle }));
        setAiMessages((m) => [...m, { role: 'assistant', text: 'Template updated! Check the preview.' }]);
      } else {
        setAiMessages((m) => [...m, { role: 'assistant', text: data.error || 'Failed to process.' }]);
      }
    } catch {
      setAiMessages((m) => [...m, { role: 'assistant', text: 'Network error. Please try again.' }]);
    } finally {
      setAiLoading(false);
    }
  };

  const exportAsJSON = () => {
    const data = { ...template, elements };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template.json';
    a.click();
    URL.revokeObjectURL(url);
    setExportMenu(false);
  };

  const exportAsImage = async () => {
    try {
      const el = canvasRef.current;
      if (!el) { alert('No canvas to export.'); setExportMenu(false); return; }
      const canvas = document.createElement('canvas');
      canvas.width = CANVAS_W * 2;
      canvas.height = CANVAS_H * 2;
      const ctx = canvas.getContext('2d');
      ctx.scale(2, 2);
      const bg = template.background || {};
      if (bg.type === 'gradient' || (!bg.type && bg.from)) {
        const grad = ctx.createLinearGradient(0, 0, CANVAS_W, CANVAS_H);
        grad.addColorStop(0, bg.from || '#0f172a');
        grad.addColorStop(1, bg.to || '#1e293b');
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = bg.color || '#0f172a';
      }
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      if (template.title) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '800 36px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(template.title, CANVAS_W / 2, CANVAS_H * 0.2);
      }
      if (template.subtitle) {
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.font = '400 18px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(template.subtitle, CANVAS_W / 2, CANVAS_H * 0.32);
      }
      elements.forEach((el) => {
        const x = (el.x / 100) * CANVAS_W;
        const y = (el.y / 100) * CANVAS_H;
        ctx.textAlign = 'center';
        if (el.type === 'button') {
          ctx.fillStyle = el.bg || '#38bdf8';
          const bw = ((el.width || 30) / 100) * CANVAS_W;
          const bx = x - bw / 2;
          ctx.beginPath();
          ctx.roundRect(bx, y - 16, bw, 32, 8);
          ctx.fill();
          ctx.fillStyle = el.color || '#fff';
          ctx.font = `${el.fontWeight || 600} ${el.fontSize || 15}px Inter, sans-serif`;
          ctx.fillText(el.text, x, y + 5);
        } else if (el.type === 'divider') {
          ctx.strokeStyle = el.color || '#38bdf8';
          ctx.lineWidth = 2;
          const dw = ((el.width || 40) / 100) * CANVAS_W;
          ctx.beginPath();
          ctx.moveTo(x - dw / 2, y);
          ctx.lineTo(x + dw / 2, y);
          ctx.stroke();
        } else {
          ctx.fillStyle = el.color || '#ffffff';
          ctx.font = `${el.fontWeight || 400} ${el.fontSize || 16}px Inter, sans-serif`;
          const lines = (el.text || '').split('\n');
          lines.forEach((line, li) => {
            ctx.fillText(line, x, y + li * (el.fontSize || 16) * 1.4);
          });
        }
      });
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = 'template.png';
      a.click();
    } catch (err) { console.error(err); alert('Export failed. Try downloading as JSON instead.'); }
    setExportMenu(false);
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center min-h-screen">
      <p className="text-black/70 dark:text-gray-300">Loading editor...</p>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-[#0a0f1a]">
      {/* Top Toolbar */}
      <div className={`flex items-center justify-between px-3 py-2 border-b ${dark ? 'bg-[#0d1321] border-white/10' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className={`p-2 rounded-lg ${dark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5m7-7l-7 7 7 7"/></svg>
          </button>
          <div className={`w-px h-6 ${dark ? 'bg-white/10' : 'bg-gray-200'}`} />
          <h1 className={`text-sm font-semibold ${dark ? 'text-white' : 'text-gray-900'}`}>Template Editor</h1>
        </div>

        <div className="flex items-center gap-1">
          <button onClick={undo} disabled={historyIdx <= 0} className={`p-2 rounded-lg ${dark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'} disabled:opacity-30`} title="Undo">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 10h10a5 5 0 015 5v2M3 10l5-5M3 10l5 5"/></svg>
          </button>
          <button onClick={redo} disabled={historyIdx >= history.length - 1} className={`p-2 rounded-lg ${dark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'} disabled:opacity-30`} title="Redo">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10H11a5 5 0 00-5 5v2M21 10l-5-5M21 10l-5 5"/></svg>
          </button>
          <div className={`w-px h-6 mx-1 ${dark ? 'bg-white/10' : 'bg-gray-200'}`} />
          <button onClick={() => setZoom((z) => Math.max(0.25, z - 0.1))} className={`p-2 rounded-lg ${dark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35M8 11h6"/></svg>
          </button>
          <span className={`text-xs w-12 text-center ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom((z) => Math.min(2, z + 0.1))} className={`p-2 rounded-lg ${dark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35M11 8v6M8 11h6"/></svg>
          </button>
          <button onClick={() => setZoom(1)} className={`px-2 py-1 rounded text-xs ${dark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>Reset</button>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setShowAI((s) => !s)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${showAI ? 'bg-[#38bdf8] text-white' : dark ? 'bg-white/10 text-gray-300 hover:bg-white/15' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 01-2 2h-4a2 2 0 01-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7zM9 21h6"/></svg>
            AI Assistant
          </button>
          <div className="relative">
            <button onClick={() => setExportMenu((m) => !m)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#38bdf8] text-white hover:bg-[#0ea5e9] transition-colors">
              Export ▾
            </button>
            {exportMenu && (
              <div className={`absolute right-0 top-full mt-1 w-40 rounded-xl border shadow-xl z-50 ${dark ? 'bg-[#1a2035] border-white/10' : 'bg-white border-gray-200'}`}>
                <button onClick={exportAsImage} className={`w-full text-left px-3 py-2 text-xs ${dark ? 'text-gray-300 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-50'} rounded-t-xl`}>Download as PNG</button>
                <button onClick={exportAsJSON} className={`w-full text-left px-3 py-2 text-xs ${dark ? 'text-gray-300 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-50'} rounded-b-xl`}>Download as JSON</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Toolbar */}
        <div className={`w-14 flex flex-col items-center py-3 gap-1 border-r ${dark ? 'bg-[#0d1321] border-white/10' : 'bg-white border-gray-200'}`}>
          {[
            { type: 'heading', icon: 'T', label: 'Add Heading' },
            { type: 'paragraph', icon: '¶', label: 'Add Text' },
            { type: 'button', icon: '▢', label: 'Add Button' },
            { type: 'divider', icon: '—', label: 'Add Divider' },
            { type: 'icon', icon: '★', label: 'Add Icon' },
          ].map((item) => (
            <button key={item.type} onClick={() => addElement(item.type)} title={item.label}
              className={`w-10 h-10 flex items-center justify-center rounded-lg text-base transition-colors ${dark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
              {item.icon}
            </button>
          ))}
          <div className={`w-8 h-px my-1 ${dark ? 'bg-white/10' : 'bg-gray-200'}`} />
          <button onClick={() => setBgPicker((b) => !b)} title="Background" className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${dark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
          </button>
          {bgPicker && (
            <div className={`absolute left-16 top-20 w-56 p-3 rounded-xl border shadow-xl z-50 ${dark ? 'bg-[#1a2035] border-white/10' : 'bg-white border-gray-200'}`}>
              <p className={`text-xs font-medium mb-2 ${dark ? 'text-gray-300' : 'text-gray-600'}`}>Background</p>
              <div className="grid grid-cols-5 gap-1.5 mb-3">
                {['#0f172a','#1a1a2e','#7c3aed','#065f46','#991b1b','#1e3a5f','#fbbf24','#000000','#ffffff','#f8fafc'].map((c) => (
                  <button key={c} onClick={() => { setTemplate((t) => ({ ...t, background: { type: 'solid', color: c } })); setBgPicker(false); }}
                    className="w-8 h-8 rounded-lg border border-gray-200 dark:border-white/10" style={{ background: c }} />
                ))}
              </div>
              <label className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Custom color</label>
              <input type="color" value={template.background?.color || template.background?.from || '#0f172a'}
                onChange={(e) => setTemplate((t) => ({ ...t, background: { type: 'solid', color: e.target.value } }))}
                className="w-full h-8 mt-1 rounded cursor-pointer" />
            </div>
          )}
        </div>

        {/* Canvas */}
        <div className="flex-1 flex items-center justify-center overflow-auto p-8" onClick={onCanvasClick}>
          <div style={{ transform: `scale(${zoom})`, transformOrigin: 'center center', transition: 'transform 0.15s' }}>
            <div ref={canvasRef} style={{ width: CANVAS_W, height: CANVAS_H, position: 'relative', overflow: 'hidden', borderRadius: template.style?.borderRadius || 12, boxShadow: '0 20px 60px rgba(0,0,0,0.3)', ...bgStyle }}>
              {template.title && !elements.some((el) => el.type === 'heading') && (
                <div style={{ position: 'absolute', left: '50%', top: '15%', transform: 'translate(-50%, -50%)', fontSize: 36, fontWeight: 800, color: '#ffffff', fontFamily: template.fonts?.heading, textAlign: 'center', width: '90%', letterSpacing: '-0.03em', lineHeight: 1.2, textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                  {template.title}
                </div>
              )}
              {template.subtitle && !elements.some((el) => el.type === 'paragraph') && (
                <div style={{ position: 'absolute', left: '50%', top: '28%', transform: 'translate(-50%, -50%)', fontSize: 18, fontWeight: 400, color: 'rgba(255,255,255,0.7)', fontFamily: template.fonts?.body, textAlign: 'center', width: '80%' }}>
                  {template.subtitle}
                </div>
              )}
              {elements.map(renderElement)}
              {elements.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-white/30 text-sm">Add elements from the left toolbar or use AI Assistant</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel — Properties / AI */}
        <div className={`w-72 flex flex-col border-l ${dark ? 'bg-[#0d1321] border-white/10' : 'bg-white border-gray-200'} overflow-hidden`}>
          {showAI ? (
            <>
              <div className={`px-3 py-2.5 border-b ${dark ? 'border-white/10' : 'border-gray-200'} flex items-center justify-between`}>
                <h3 className={`text-xs font-semibold ${dark ? 'text-white' : 'text-gray-900'}`}>AI Assistant</h3>
                <button onClick={() => setShowAI(false)} className={`p-1 rounded ${dark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {aiMessages.length === 0 && (
                  <div className={`text-center py-8 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
                    <p className="text-2xl mb-2">🎨</p>
                    <p className="text-xs">Ask me to change colors, text, layout, or anything!</p>
                    <div className="mt-3 space-y-1.5">
                      {['Make it blue', 'Change title to "Hello World"', 'Add a phone number', 'Make it more modern'].map((s) => (
                        <button key={s} onClick={() => { setAiInput(s); aiInputRef.current?.focus(); }}
                          className={`block w-full text-left text-xs px-3 py-2 rounded-lg ${dark ? 'bg-white/5 text-gray-400 hover:bg-white/10' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
                          "{s}"
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {aiMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                      msg.role === 'user' ? 'bg-[#38bdf8] text-white rounded-br-md' : `${dark ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-700'} rounded-bl-md`
                    }`}>{msg.text}</div>
                  </div>
                ))}
                {aiLoading && (
                  <div className="flex justify-start">
                    <div className={`px-3 py-2 rounded-2xl rounded-bl-md text-xs ${dark ? 'bg-white/10 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                      <span className="flex items-center gap-1">
                        <span className="w-1 h-1 bg-[#38bdf8] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1 h-1 bg-[#38bdf8] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1 h-1 bg-[#38bdf8] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <div className={`px-3 py-2 border-t ${dark ? 'border-white/10' : 'border-gray-200'}`}>
                <div className="flex items-center gap-1.5">
                  <input ref={aiInputRef} value={aiInput} onChange={(e) => setAiInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendToAI()}
                    placeholder="Describe changes..."
                    className={`flex-1 px-3 py-2 rounded-lg text-xs outline-none border ${dark ? 'bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-teal/50' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-teal/50'}`}
                    disabled={aiLoading} />
                  <button onClick={sendToAI} disabled={!aiInput.trim() || aiLoading}
                    className="p-2 rounded-lg bg-[#38bdf8] text-white hover:bg-[#0ea5e9] disabled:opacity-40 transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                  </button>
                </div>
              </div>
            </>
          ) : selectedEl ? (
            <>
              <div className={`px-3 py-2.5 border-b ${dark ? 'border-white/10' : 'border-gray-200'} flex items-center justify-between`}>
                <h3 className={`text-xs font-semibold ${dark ? 'text-white' : 'text-gray-900'}`}>Edit {selectedEl.type}</h3>
                <div className="flex items-center gap-1">
                  <button onClick={() => duplicateElement(selectedEl.id)} className={`p-1.5 rounded ${dark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`} title="Duplicate">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                  </button>
                  <button onClick={() => bringForward(selectedEl.id)} className={`p-1.5 rounded ${dark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`} title="Bring Forward">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 11v8h14v-8M12 3v12"/></svg>
                  </button>
                  <button onClick={() => sendBackward(selectedEl.id)} className={`p-1.5 rounded ${dark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`} title="Send Backward">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 13v8H5v-8M12 21V9"/></svg>
                  </button>
                  <button onClick={() => deleteElement(selectedEl.id)} className="p-1.5 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" title="Delete">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {(selectedEl.type === 'heading' || selectedEl.type === 'paragraph' || selectedEl.type === 'button' || selectedEl.type === 'icon') && (
                  <div>
                    <label className={`text-[10px] font-medium mb-1 block ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Text</label>
                    <input value={selectedEl.text || ''} onChange={(e) => updateElement(selectedEl.id, { text: e.target.value })}
                      onBlur={(e) => commitElementUpdate(selectedEl.id, { text: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg text-xs outline-none border ${dark ? 'bg-white/5 border-white/10 text-white focus:border-teal/50' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-teal/50'}`} />
                  </div>
                )}
                {selectedEl.type !== 'divider' && (
                  <div>
                    <label className={`text-[10px] font-medium mb-1 block ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Text Color</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={selectedEl.color || '#ffffff'}
                        onChange={(e) => updateElement(selectedEl.id, { color: e.target.value })}
                        onChangeComplete={(e) => commitElementUpdate(selectedEl.id, { color: e.target.value })}
                        className="w-8 h-8 rounded cursor-pointer border-0" />
                      <input value={selectedEl.color || '#ffffff'}
                        onChange={(e) => updateElement(selectedEl.id, { color: e.target.value })}
                        onBlur={(e) => commitElementUpdate(selectedEl.id, { color: e.target.value })}
                        className={`flex-1 px-2 py-1.5 rounded text-xs outline-none border ${dark ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`} />
                    </div>
                  </div>
                )}
                {selectedEl.type === 'button' && (
                  <div>
                    <label className={`text-[10px] font-medium mb-1 block ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Button Color</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={selectedEl.bg || '#38bdf8'}
                        onChange={(e) => updateElement(selectedEl.id, { bg: e.target.value })}
                        onChangeComplete={(e) => commitElementUpdate(selectedEl.id, { bg: e.target.value })}
                        className="w-8 h-8 rounded cursor-pointer border-0" />
                      <input value={selectedEl.bg || '#38bdf8'}
                        onChange={(e) => updateElement(selectedEl.id, { bg: e.target.value })}
                        onBlur={(e) => commitElementUpdate(selectedEl.id, { bg: e.target.value })}
                        className={`flex-1 px-2 py-1.5 rounded text-xs outline-none border ${dark ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`} />
                    </div>
                  </div>
                )}
                {selectedEl.type === 'divider' && (
                  <div>
                    <label className={`text-[10px] font-medium mb-1 block ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Color</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={selectedEl.color || '#38bdf8'}
                        onChange={(e) => updateElement(selectedEl.id, { color: e.target.value })}
                        onChangeComplete={(e) => commitElementUpdate(selectedEl.id, { color: e.target.value })}
                        className="w-8 h-8 rounded cursor-pointer border-0" />
                      <input value={selectedEl.color || '#38bdf8'}
                        onChange={(e) => updateElement(selectedEl.id, { color: e.target.value })}
                        onBlur={(e) => commitElementUpdate(selectedEl.id, { color: e.target.value })}
                        className={`flex-1 px-2 py-1.5 rounded text-xs outline-none border ${dark ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`} />
                    </div>
                  </div>
                )}
                {(selectedEl.type === 'heading' || selectedEl.type === 'paragraph' || selectedEl.type === 'button' || selectedEl.type === 'icon') && (
                  <div>
                    <label className={`text-[10px] font-medium mb-1 block ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Font Size</label>
                    <div className="flex items-center gap-2">
                      <input type="range" min="8" max="72" value={selectedEl.fontSize || 16}
                        onChange={(e) => updateElement(selectedEl.id, { fontSize: Number(e.target.value) })}
                        onChangeCapture={(e) => commitElementUpdate(selectedEl.id, { fontSize: Number(e.target.value) })}
                        className="flex-1 accent-[#38bdf8]" />
                      <span className={`text-xs w-8 text-right ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{selectedEl.fontSize || 16}</span>
                    </div>
                  </div>
                )}
                <div>
                  <label className={`text-[10px] font-medium mb-1 block ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Width</label>
                  <div className="flex items-center gap-2">
                    <input type="range" min="5" max="100" value={selectedEl.width || 40}
                      onChange={(e) => updateElement(selectedEl.id, { width: Number(e.target.value) })}
                      onChangeCapture={(e) => commitElementUpdate(selectedEl.id, { width: Number(e.target.value) })}
                      className="flex-1 accent-[#38bdf8]" />
                    <span className={`text-xs w-8 text-right ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{selectedEl.width || 40}%</span>
                  </div>
                </div>
                <div className={`pt-2 border-t ${dark ? 'border-white/10' : 'border-gray-100'}`}>
                  <p className={`text-[10px] ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Position: ({Math.round(selectedEl.x)}%, {Math.round(selectedEl.y)}%)</p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center px-4">
              <div className={`text-center ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-3 opacity-50"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
                <p className="text-xs mb-1">Click an element to edit</p>
                <p className="text-[10px] opacity-60">or use AI Assistant to customize</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
