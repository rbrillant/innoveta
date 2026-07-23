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
  button: { text: 'Click Me', bg: '#7c3aed', color: '#ffffff', fontSize: 15, fontWeight: 600, width: 30 },
  divider: { color: '#7c3aed', width: 40 },
  icon: { text: '\u2605', color: '#fbbf24', fontSize: 36, width: 10 },
};

function uid() { return Math.random().toString(36).slice(2, 9); }

const SIDEBAR_ITEMS = [
  { id: 'design', label: 'Design', icon: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : 'currentColor'} strokeWidth="1.8">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  )},
  { id: 'elements', label: 'Elements', icon: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : 'currentColor'} strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v18M3 12h18" />
    </svg>
  )},
  { id: 'text', label: 'Text', icon: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : 'currentColor'} strokeWidth="1.8">
      <path d="M6 4h12M12 4v16M8 20h8" />
    </svg>
  )},
  { id: 'uploads', label: 'Uploads', icon: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : 'currentColor'} strokeWidth="1.8">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
    </svg>
  )},
  { id: 'brand', label: 'Brand', icon: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : 'currentColor'} strokeWidth="1.8">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  )},
  'separator',
  { id: 'draw', label: 'Draw', icon: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : 'currentColor'} strokeWidth="1.8">
      <path d="M12 19l7-7 3 3-7 7-3-3zM18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5zM2 2l7.586 7.586M11 13a1 1 0 100-2 1 1 0 000 2z" />
    </svg>
  )},
  { id: 'projects', label: 'Projects', icon: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : 'currentColor'} strokeWidth="1.8">
      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2v11z" />
    </svg>
  )},
  { id: 'apps', label: 'Apps', icon: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : 'currentColor'} strokeWidth="1.8">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )},
];

const TEMPLATE_PRESETS = [
  { id: 'blank', name: 'Blank', background: { type: 'solid', color: '#ffffff' }, elements: [] },
  { id: 'dark', name: 'Dark', background: { type: 'gradient', from: '#0f172a', to: '#1e293b' }, elements: [
    { id: 'p1', type: 'heading', text: 'Dark Theme', color: '#ffffff', fontSize: 36, fontWeight: 800, x: 50, y: 35, width: 70, bg: '' },
    { id: 'p2', type: 'paragraph', text: 'A sleek dark template', color: 'rgba(255,255,255,0.7)', fontSize: 16, fontWeight: 400, x: 50, y: 50, width: 50, bg: '' },
    { id: 'p3', type: 'button', text: 'Get Started', bg: '#7c3aed', color: '#ffffff', fontSize: 15, fontWeight: 600, x: 50, y: 68, width: 22, src: '' },
  ]},
  { id: 'vibrant', name: 'Vibrant', background: { type: 'gradient', from: '#7c3aed', to: '#ec4899' }, elements: [
    { id: 'p1', type: 'heading', text: 'Vibrant Design', color: '#ffffff', fontSize: 36, fontWeight: 800, x: 50, y: 35, width: 70, bg: '' },
    { id: 'p2', type: 'paragraph', text: 'Eye-catching gradient background', color: 'rgba(255,255,255,0.85)', fontSize: 16, fontWeight: 400, x: 50, y: 50, width: 50, bg: '' },
    { id: 'p3', type: 'button', text: 'Explore', bg: '#ffffff', color: '#7c3aed', fontSize: 15, fontWeight: 600, x: 50, y: 68, width: 22, src: '' },
  ]},
  { id: 'nature', name: 'Nature', background: { type: 'gradient', from: '#065f46', to: '#34d399' }, elements: [
    { id: 'p1', type: 'heading', text: 'Fresh & Natural', color: '#ffffff', fontSize: 36, fontWeight: 800, x: 50, y: 35, width: 70, bg: '' },
    { id: 'p2', type: 'paragraph', text: 'Clean organic vibes', color: 'rgba(255,255,255,0.8)', fontSize: 16, fontWeight: 400, x: 50, y: 50, width: 50, bg: '' },
    { id: 'p3', type: 'button', text: 'Shop Now', bg: '#ffffff', color: '#065f46', fontSize: 15, fontWeight: 600, x: 50, y: 68, width: 22, src: '' },
  ]},
  { id: 'coral', name: 'Coral', background: { type: 'gradient', from: '#f43f5e', to: '#fb923c' }, elements: [
    { id: 'p1', type: 'heading', text: 'Warm & Bold', color: '#ffffff', fontSize: 36, fontWeight: 800, x: 50, y: 35, width: 70, bg: '' },
    { id: 'p2', type: 'paragraph', text: 'Sunset-inspired design', color: 'rgba(255,255,255,0.85)', fontSize: 16, fontWeight: 400, x: 50, y: 50, width: 50, bg: '' },
    { id: 'p3', type: 'button', text: 'Learn More', bg: '#ffffff', color: '#f43f5e', fontSize: 15, fontWeight: 600, x: 50, y: 68, width: 22, src: '' },
  ]},
];

const TEXT_OPTIONS = [
  { type: 'heading', label: 'Add a heading', desc: 'Large bold text', fontSize: 36 },
  { type: 'subheading', label: 'Add a subheading', desc: 'Medium text', fontSize: 24 },
  { type: 'paragraph', label: 'Add body text', desc: 'Small regular text', fontSize: 16 },
];

const ELEMENT_SHAPES = [
  { type: 'heading', label: 'Heading', icon: 'T' },
  { type: 'paragraph', label: 'Text', icon: 'P' },
  { type: 'button', label: 'Button', icon: '\u25A1' },
  { type: 'divider', label: 'Line', icon: '\u2500' },
  { type: 'icon', label: 'Star', icon: '\u2605' },
];

const ICON_SHAPES = ['\u2605', '\u2764', '\u2606', '\u266B', '\u2600', '\u2602', '\u2660', '\u2663', '\u2666', '\u263A', '\u263B', '\u2122', '\u00A9', '\u2190', '\u2192', '\u2191', '\u2193'];

const COLOR_PRESETS = ['#ffffff', '#000000', '#7c3aed', '#38bdf8', '#ec4899', '#f43f5e', '#fb923c', '#fbbf24', '#34d399', '#065f46', '#1e293b', '#0f172a'];

const BG_PRESETS = [
  { label: 'Dark', from: '#0f172a', to: '#1e293b' },
  { label: 'Purple', from: '#7c3aed', to: '#ec4899' },
  { label: 'Blue', from: '#1e3a5f', to: '#38bdf8' },
  { label: 'Green', from: '#065f46', to: '#34d399' },
  { label: 'Coral', from: '#f43f5e', to: '#fb923c' },
  { label: 'Sunset', from: '#fbbf24', to: '#f43f5e' },
  { label: 'Ocean', from: '#0ea5e9', to: '#7c3aed' },
  { label: 'Light', from: '#f0f2f5', to: '#ffffff' },
];

const FONTS = ['Inter', 'Arial', 'Georgia', 'Courier New', 'Verdana', 'Times New Roman', 'Trebuchet MS', 'Impact'];

export default function TemplateEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { dark } = useTheme();
  const canvasRef = useRef(null);
  const aiInputRef = useRef(null);

  const [template, setTemplate] = useState(INITIAL_TEMPLATE);
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [zoom, setZoom] = useState(1);
  const [editingText, setEditingText] = useState(null);
  const [showAI, setShowAI] = useState(false);
  const [aiMessages, setAiMessages] = useState([]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [loading, setLoading] = useState(!!id);
  const [activeSidebar, setActiveSidebar] = useState(null);
  const [designName, setDesignName] = useState('Untitled Design');
  const [designNameEditing, setDesignNameEditing] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([fetchTemplate(id), fetchTemplateImages(id)])
      .then(([t]) => {
        if (t) {
          setTemplate({ ...INITIAL_TEMPLATE, title: t.name || 'Template', subtitle: t.description || '' });
          setDesignName(t.name || 'Untitled Design');
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

  const undo = useCallback(() => {
    if (historyIdx > 0) {
      setHistoryIdx((i) => i - 1);
      setElements(JSON.parse(JSON.stringify(history[historyIdx - 1])));
      setSelectedId(null);
      setEditingText(null);
    }
  }, [historyIdx, history]);

  const redo = useCallback(() => {
    if (historyIdx < history.length - 1) {
      setHistoryIdx((i) => i + 1);
      setElements(JSON.parse(JSON.stringify(history[historyIdx + 1])));
      setSelectedId(null);
      setEditingText(null);
    }
  }, [historyIdx, history]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedId && editingText === null && document.activeElement?.contentEditable !== 'true') {
          deleteElement(selectedId);
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && selectedId) {
        e.preventDefault();
        duplicateElement(selectedId);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, selectedId, editingText, elements]);

  const addElement = (type) => {
    if (type === 'subheading') {
      const def = { ...ELEMENT_DEFAULTS.paragraph, text: 'New subheading', fontSize: 24, fontWeight: 600 };
      const newEl = {
        id: uid(),
        type: 'paragraph',
        text: def.text,
        color: def.color || '#ffffff',
        bg: '',
        fontSize: def.fontSize,
        fontWeight: def.fontWeight,
        x: 50,
        y: 50,
        width: def.width || 60,
        src: '',
        align: 'center',
      };
      const next = [...elements, newEl];
      setElements(next);
      setSelectedId(newEl.id);
      pushHistory(next);
      return;
    }
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
      align: 'center',
    };
    const next = [...elements, newEl];
    setElements(next);
    setSelectedId(newEl.id);
    pushHistory(next);
    setActiveSidebar(null);
  };

  const addIconElement = (icon) => {
    const def = ELEMENT_DEFAULTS.icon;
    const newEl = {
      id: uid(),
      type: 'icon',
      text: icon,
      color: def.color,
      bg: '',
      fontSize: def.fontSize,
      fontWeight: 400,
      x: 50,
      y: 50,
      width: 10,
      src: '',
      align: 'center',
    };
    const next = [...elements, newEl];
    setElements(next);
    setSelectedId(newEl.id);
    pushHistory(next);
    setActiveSidebar(null);
  };

  const applyTemplatePreset = (preset) => {
    setTemplate((t) => ({ ...t, background: preset.background }));
    const newElements = preset.elements.map((el) => ({ ...el, id: uid() }));
    setElements(newElements);
    setSelectedId(null);
    setEditingText(null);
    pushHistory(newElements);
    setActiveSidebar(null);
  };

  const updateElement = (id, updates) => {
    setElements((prev) => prev.map((el) => el.id === id ? { ...el, ...updates } : el));
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
    setEditingText(null);
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
    if (editingText === el.id) return;
    e.stopPropagation();
    e.preventDefault();
    setSelectedId(el.id);
    setEditingText(null);
    setActiveSidebar(null);
    const startCoords = getCanvasCoords(e);
    const startPos = { x: el.x, y: el.y };
    const onMove = (me) => {
      me.preventDefault();
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
    e.preventDefault();
    const startCoords = getCanvasCoords(e);
    const startW = el.width || 40;
    const startFs = el.fontSize || 16;
    const onMove = (me) => {
      me.preventDefault();
      const cur = getCanvasCoords(me);
      const dx = cur.x - startCoords.x;
      const newWidth = Math.max(5, Math.min(100, startW + dx));
      const updates = { width: newWidth };
      if (el.type === 'icon') {
        updates.fontSize = Math.max(12, Math.min(72, startFs + dx * 0.5));
      }
      updateElement(el.id, updates);
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      commitElementUpdate(el.id, {});
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const onCanvasClick = () => {
    setSelectedId(null);
    setEditingText(null);
    setActiveSidebar(null);
  };

  const onElementDoubleClick = (e, el) => {
    e.stopPropagation();
    if (el.type === 'heading' || el.type === 'paragraph' || el.type === 'button' || el.type === 'icon') {
      setEditingText(el.id);
      setSelectedId(el.id);
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

  const getFloatingToolbarPosition = () => {
    if (!selectedEl || !canvasRef.current) return null;
    const rect = canvasRef.current.getBoundingClientRect();
    const elPxX = (selectedEl.x / 100) * rect.width;
    const elPxY = (selectedEl.y / 100) * rect.height;
    let elPxH = 40;
    if (selectedEl.type === 'heading') elPxH = selectedEl.fontSize * 1.2;
    else if (selectedEl.type === 'paragraph') elPxH = selectedEl.fontSize * 1.4 * 2;
    else if (selectedEl.type === 'button') elPxH = 40;
    else if (selectedEl.type === 'icon') elPxH = selectedEl.fontSize * 1.2;
    else if (selectedEl.type === 'divider') elPxH = 4;
    const toolbarY = rect.top + elPxY - elPxH / 2 - 56;
    const toolbarX = rect.left + elPxX;
    return { x: toolbarX, y: Math.max(56, toolbarY) };
  };

  const floatingToolbarPos = getFloatingToolbarPosition();

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
      outline: isSelected ? '2px solid #7c3aed' : 'none',
      outlineOffset: '3px',
      borderRadius: '4px',
      transition: 'outline 0.1s',
    };

    if (el.type === 'button') {
      return (
        <div key={el.id} style={{ ...baseStyle, background: el.bg || '#7c3aed', color: el.color || '#fff', padding: '10px 28px', borderRadius: 8, fontSize: el.fontSize || 15, fontWeight: el.fontWeight || 600, textAlign: el.align || 'center', boxShadow: '0 4px 14px rgba(0,0,0,0.25)', whiteSpace: 'nowrap', display: 'inline-block' }}
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
          {isSelected && !isEditing && <div onMouseDown={(e) => onResizeMouseDown(e, el)} style={{ position: 'absolute', right: -4, bottom: -4, width: 10, height: 10, background: '#7c3aed', borderRadius: 2, cursor: 'se-resize', border: '1px solid #fff' }} />}
        </div>
      );
    }

    if (el.type === 'divider') {
      return (
        <div key={el.id} style={{ ...baseStyle, height: 2, background: `linear-gradient(90deg, transparent, ${el.color || '#7c3aed'}, transparent)`, borderRadius: 1 }}
          onMouseDown={(e) => onElementMouseDown(e, el)}
        >
          {isSelected && <div onMouseDown={(e) => onResizeMouseDown(e, el)} style={{ position: 'absolute', right: -4, top: -4, width: 10, height: 10, background: '#7c3aed', borderRadius: 2, cursor: 'se-resize', border: '1px solid #fff' }} />}
        </div>
      );
    }

    return (
      <div key={el.id} style={{ ...baseStyle, color: el.color || '#fff', fontSize: el.fontSize || 16, fontWeight: el.fontWeight || 400, textAlign: el.align || 'center', fontFamily: el.type === 'heading' ? template.fonts?.heading : template.fonts?.body, lineHeight: 1.4, textShadow: '0 1px 4px rgba(0,0,0,0.2)' }}
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
        {isSelected && !isEditing && <div onMouseDown={(e) => onResizeMouseDown(e, el)} style={{ position: 'absolute', right: -4, bottom: -4, width: 10, height: 10, background: '#7c3aed', borderRadius: 2, cursor: 'se-resize', border: '1px solid #fff' }} />}
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
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
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
    a.download = `${designName.replace(/\s+/g, '-').toLowerCase() || 'template'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAsImage = async () => {
    try {
      const el = canvasRef.current;
      if (!el) { alert('No canvas to export.'); return; }
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
      elements.forEach((el) => {
        const x = (el.x / 100) * CANVAS_W;
        const y = (el.y / 100) * CANVAS_H;
        ctx.textAlign = el.align || 'center';
        if (el.type === 'button') {
          ctx.fillStyle = el.bg || '#7c3aed';
          const bw = ((el.width || 30) / 100) * CANVAS_W;
          const bx = x - bw / 2;
          ctx.beginPath();
          ctx.roundRect(bx, y - 16, bw, 32, 8);
          ctx.fill();
          ctx.fillStyle = el.color || '#fff';
          ctx.font = `${el.fontWeight || 600} ${el.fontSize || 15}px Inter, sans-serif`;
          ctx.fillText(el.text, x, y + 5);
        } else if (el.type === 'divider') {
          ctx.strokeStyle = el.color || '#7c3aed';
          ctx.lineWidth = 2;
          const dw = ((el.width || 40) / 100) * CANVAS_W;
          ctx.beginPath();
          ctx.moveTo(x - dw / 2, y);
          ctx.lineTo(x + dw / 2, y);
          ctx.stroke();
        } else if (el.type === 'icon') {
          ctx.fillStyle = el.color || '#fbbf24';
          ctx.font = `${el.fontSize || 36}px serif`;
          ctx.fillText(el.text, x, y + (el.fontSize || 36) * 0.35);
        } else {
          ctx.fillStyle = el.color || '#ffffff';
          ctx.font = `${el.fontWeight || 400} ${el.fontSize || 16}px Inter, sans-serif`;
          const lines = (el.text || '').split('\n');
          lines.forEach((line, li) => {
            ctx.fillText(line, x, y + li * (el.fontSize || 16) * 1.4 + (el.fontSize || 16) * 0.35);
          });
        }
      });
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `${designName.replace(/\s+/g, '-').toLowerCase() || 'template'}.png`;
      a.click();
    } catch (err) { console.error(err); alert('Export failed. Try downloading as JSON instead.'); }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-[#f0f2f5]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#7c3aed] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#f0f2f5]">

      {/* ==================== TOP BAR ==================== */}
      <div className="h-14 flex items-center justify-between px-4 bg-white border-b border-gray-200 shrink-0 z-30">
        {/* Left: Back + Logo + Name */}
        <div className="flex items-center gap-3 min-w-[200px]">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors" title="Back to dashboard">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#7c3aed] rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">In</span>
            </div>
          </div>
          <div className="w-px h-6 bg-gray-200" />
          {designNameEditing ? (
            <input
              autoFocus
              value={designName}
              onChange={(e) => setDesignName(e.target.value)}
              onBlur={() => setDesignNameEditing(false)}
              onKeyDown={(e) => { if (e.key === 'Enter') { setDesignNameEditing(false); } }}
              className="text-sm font-medium text-gray-900 bg-gray-50 border border-gray-200 rounded-md px-2 py-1 outline-none focus:border-[#7c3aed] w-48"
            />
          ) : (
            <button onClick={() => setDesignNameEditing(true)} className="text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md px-2 py-1 transition-colors truncate max-w-[180px]" title="Rename design">
              {designName}
            </button>
          )}
        </div>

        {/* Center: Undo / Redo */}
        <div className="flex items-center gap-1">
          <button onClick={undo} disabled={historyIdx <= 0}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-30 disabled:hover:bg-transparent transition-colors" title="Undo (Ctrl+Z)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10h10a5 5 0 015 5v2" /><path d="M3 10l5-5M3 10l5 5" /></svg>
          </button>
          <button onClick={redo} disabled={historyIdx >= history.length - 1}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-30 disabled:hover:bg-transparent transition-colors" title="Redo (Ctrl+Y)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10H11a5 5 0 00-5 5v2" /><path d="M21 10l-5-5M21 10l-5 5" /></svg>
          </button>
        </div>

        {/* Right: AI + Share + Download */}
        <div className="flex items-center gap-2 min-w-[200px] justify-end">
          <button onClick={() => { setShowAI((s) => !s); if (!showAI) setActiveSidebar('ai'); else setActiveSidebar(null); }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${showAI ? 'bg-[#7c3aed] text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 01-2 2h-4a2 2 0 01-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7z" /><path d="M9 21h6" /></svg>
            AI
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors" title="Share">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" /></svg>
            Share
          </button>
          <div className="relative">
            <button onClick={exportAsImage}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-[#7c3aed] text-white hover:bg-[#6d28d9] transition-colors shadow-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
              Download
            </button>
          </div>
        </div>
      </div>

      {/* ==================== MAIN AREA ==================== */}
      <div className="flex flex-1 overflow-hidden">

        {/* ==================== LEFT SIDEBAR ==================== */}
        <div className="w-[60px] bg-gray-50 border-r border-gray-200 flex flex-col items-center py-2 gap-0.5 shrink-0 z-20">
          {SIDEBAR_ITEMS.map((item, idx) => {
            if (item === 'separator') {
              return <div key="sep" className="w-8 h-px bg-gray-200 my-1.5" />;
            }
            const isActive = activeSidebar === item.id;
            return (
              <button key={item.id}
                onClick={() => {
                  if (item.id === 'draw' || item.id === 'uploads' || item.id === 'brand' || item.id === 'projects' || item.id === 'apps') return;
                  setActiveSidebar(isActive ? null : item.id);
                  setSelectedId(null);
                  setEditingText(null);
                  setShowAI(false);
                }}
                className={`w-[52px] flex flex-col items-center gap-0.5 py-2 rounded-xl text-[10px] font-medium transition-all
                  ${isActive ? 'bg-[#7c3aed] text-white shadow-md' : 'text-gray-500 hover:bg-gray-200 hover:text-gray-700'}
                  ${item.id === 'draw' || item.id === 'uploads' || item.id === 'brand' || item.id === 'projects' || item.id === 'apps' ? 'opacity-40 cursor-not-allowed' : ''}`}
                title={item.label}>
                <span className="flex items-center justify-center w-6 h-6">{item.icon(isActive)}</span>
                <span className="leading-none">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* ==================== CANVAS AREA ==================== */}
        <div className="flex-1 flex items-center justify-center overflow-auto relative" onClick={onCanvasClick}>
          <div style={{ transform: `scale(${zoom})`, transformOrigin: 'center center', transition: 'transform 0.15s ease' }}>
            <div ref={canvasRef}
              style={{ width: CANVAS_W, height: CANVAS_H, position: 'relative', overflow: 'hidden', borderRadius: template.style?.borderRadius || 12, boxShadow: '0 8px 40px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)', ...bgStyle }}
              onClick={(e) => { if (e.target === canvasRef.current) onCanvasClick(); }}
            >
              {template.title && !elements.some((el) => el.type === 'heading') && (
                <div style={{ position: 'absolute', left: '50%', top: '15%', transform: 'translate(-50%, -50%)', fontSize: 36, fontWeight: 800, color: '#ffffff', fontFamily: template.fonts?.heading, textAlign: 'center', width: '90%', letterSpacing: '-0.03em', lineHeight: 1.2, textShadow: '0 2px 10px rgba(0,0,0,0.3)', pointerEvents: 'none' }}>
                  {template.title}
                </div>
              )}
              {template.subtitle && !elements.some((el) => el.type === 'paragraph') && (
                <div style={{ position: 'absolute', left: '50%', top: '28%', transform: 'translate(-50%, -50%)', fontSize: 18, fontWeight: 400, color: 'rgba(255,255,255,0.7)', fontFamily: template.fonts?.body, textAlign: 'center', width: '80%', pointerEvents: 'none' }}>
                  {template.subtitle}
                </div>
              )}
              {elements.map(renderElement)}
              {elements.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <div className="text-white/20 mb-3">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M12 8v8M8 12h8" /></svg>
                    </div>
                    <p className="text-white/30 text-sm font-medium">Add elements from the sidebar</p>
                    <p className="text-white/20 text-xs mt-1">or use AI Assistant to customize</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ==================== ZOOM CONTROLS (bottom center) ==================== */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white rounded-full shadow-lg border border-gray-200 px-1 py-1 z-20">
            <button onClick={() => setZoom((z) => Math.max(0.25, z - 0.1))}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors" title="Zoom out">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14" /></svg>
            </button>
            <button onClick={() => setZoom(1)}
              className="px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-full transition-colors min-w-[44px] text-center" title="Reset zoom">
              {Math.round(zoom * 100)}%
            </button>
            <button onClick={() => setZoom((z) => Math.min(3, z + 0.1))}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors" title="Zoom in">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
            </button>
          </div>

          {/* ==================== FLOATING TOOLBAR ==================== */}
          {selectedEl && floatingToolbarPos && !isEditingAny() && (
            <div
              className="fixed z-50 flex items-center gap-0.5 bg-white rounded-xl shadow-xl border border-gray-200 px-2 py-1.5"
              style={{ left: floatingToolbarPos.x, top: floatingToolbarPos.y, transform: 'translate(-50%, -100%)' }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              {/* Text input */}
              {selectedEl.type !== 'divider' && (
                <input
                  value={selectedEl.text || ''}
                  onChange={(e) => updateElement(selectedEl.id, { text: e.target.value })}
                  onBlur={(e) => commitElementUpdate(selectedEl.id, { text: e.target.value })}
                  className="w-28 px-2 py-1 text-xs border border-gray-200 rounded-md outline-none focus:border-[#7c3aed] text-gray-900"
                  placeholder="Text"
                />
              )}

              {/* Font size */}
              {selectedEl.type !== 'divider' && (
                <div className="flex items-center gap-1 px-1">
                  <input type="number" min="8" max="120" value={selectedEl.fontSize || 16}
                    onChange={(e) => updateElement(selectedEl.id, { fontSize: Number(e.target.value) })}
                    onBlur={(e) => commitElementUpdate(selectedEl.id, { fontSize: Number(e.target.value) })}
                    className="w-10 px-1 py-1 text-xs text-center border border-gray-200 rounded-md outline-none focus:border-[#7c3aed] text-gray-900" />
                </div>
              )}

              {/* Font weight toggle */}
              {selectedEl.type !== 'divider' && (
                <button onClick={() => {
                  const newWeight = (selectedEl.fontWeight || 400) >= 700 ? 400 : 700;
                  commitElementUpdate(selectedEl.id, { fontWeight: newWeight });
                }}
                  className={`w-7 h-7 flex items-center justify-center rounded-md text-xs font-bold transition-colors ${(selectedEl.fontWeight || 400) >= 700 ? 'bg-[#7c3aed] text-white' : 'hover:bg-gray-100 text-gray-600'}`}
                  title="Toggle bold">
                  B
                </button>
              )}

              {/* Italic toggle */}
              {selectedEl.type !== 'divider' && (
                <button onClick={() => {
                  const newWeight = selectedEl.fontWeight === 'italic' ? 400 : 'italic';
                  commitElementUpdate(selectedEl.id, { fontWeight: newWeight });
                }}
                  className="w-7 h-7 flex items-center justify-center rounded-md text-xs italic hover:bg-gray-100 text-gray-600 transition-colors"
                  title="Toggle italic">
                  I
                </button>
              )}

              {/* Color */}
              {selectedEl.type !== 'divider' && (
                <div className="relative">
                  <input type="color" value={selectedEl.color || '#ffffff'}
                    onChange={(e) => updateElement(selectedEl.id, { color: e.target.value })}
                    onChangeComplete={(e) => commitElementUpdate(selectedEl.id, { color: e.target.value })}
                    className="w-7 h-7 rounded-md cursor-pointer border-2 border-gray-200 hover:border-[#7c3aed] transition-colors" title="Text color" />
                </div>
              )}

              {/* Divider color */}
              {selectedEl.type === 'divider' && (
                <div className="relative">
                  <input type="color" value={selectedEl.color || '#7c3aed'}
                    onChange={(e) => updateElement(selectedEl.id, { color: e.target.value })}
                    onChangeComplete={(e) => commitElementUpdate(selectedEl.id, { color: e.target.value })}
                    className="w-7 h-7 rounded-md cursor-pointer border-2 border-gray-200 hover:border-[#7c3aed] transition-colors" title="Line color" />
                </div>
              )}

              {/* Button bg color */}
              {selectedEl.type === 'button' && (
                <div className="relative">
                  <input type="color" value={selectedEl.bg || '#7c3aed'}
                    onChange={(e) => updateElement(selectedEl.id, { bg: e.target.value })}
                    onChangeComplete={(e) => commitElementUpdate(selectedEl.id, { bg: e.target.value })}
                    className="w-7 h-7 rounded-md cursor-pointer border-2 border-gray-200 hover:border-[#7c3aed] transition-colors" title="Button color" />
                </div>
              )}

              <div className="w-px h-5 bg-gray-200 mx-0.5" />

              {/* Alignment */}
              {selectedEl.type !== 'divider' && (
                <div className="flex items-center gap-0.5">
                  {['left', 'center', 'right'].map((align) => (
                    <button key={align} onClick={() => commitElementUpdate(selectedEl.id, { align })}
                      className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${(selectedEl.align || 'center') === align ? 'bg-[#7c3aed] text-white' : 'hover:bg-gray-100 text-gray-500'}`}
                      title={`Align ${align}`}>
                      {align === 'left' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M3 12h12M3 18h16" /></svg>}
                      {align === 'center' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M6 12h12M4 18h16" /></svg>}
                      {align === 'right' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M9 12h12M5 18h16" /></svg>}
                    </button>
                  ))}
                </div>
              )}

              <div className="w-px h-5 bg-gray-200 mx-0.5" />

              {/* Layer */}
              <button onClick={() => bringForward(selectedEl.id)}
                className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-500 transition-colors" title="Bring forward">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 11v8h14v-8M12 3v12" /></svg>
              </button>
              <button onClick={() => sendBackward(selectedEl.id)}
                className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-500 transition-colors" title="Send backward">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 13v8H5v-8M12 21V9" /></svg>
              </button>

              <div className="w-px h-5 bg-gray-200 mx-0.5" />

              {/* Duplicate */}
              <button onClick={() => duplicateElement(selectedEl.id)}
                className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-500 transition-colors" title="Duplicate (Ctrl+D)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
              </button>

              {/* Delete */}
              <button onClick={() => deleteElement(selectedEl.id)}
                className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors" title="Delete">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ==================== FLYOUT PANELS ==================== */}
      {activeSidebar && !showAI && (
        <div className="absolute left-[60px] top-14 bottom-0 w-[280px] bg-white border-r border-gray-200 shadow-xl z-20 flex flex-col overflow-hidden animate-slideIn">
          {/* Design Panel */}
          {activeSidebar === 'design' && (
            <>
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Design</h3>
                <button onClick={() => setActiveSidebar(null)} className="p-1 rounded-md hover:bg-gray-100 text-gray-400">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3">
                <p className="text-xs font-medium text-gray-500 mb-3">Templates</p>
                <div className="grid grid-cols-2 gap-2">
                  {TEMPLATE_PRESETS.map((preset) => (
                    <button key={preset.id} onClick={() => applyTemplatePreset(preset)}
                      className="group relative rounded-xl overflow-hidden border border-gray-200 hover:border-[#7c3aed] transition-all hover:shadow-md aspect-[16/10]">
                      <div className="absolute inset-0" style={{
                        background: preset.background.type === 'gradient'
                          ? `linear-gradient(135deg, ${preset.background.from}, ${preset.background.to})`
                          : preset.background.color
                      }} />
                      <div className="absolute inset-0 flex items-end p-2">
                        <span className="text-[10px] font-medium text-white drop-shadow-sm">{preset.name}</span>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-4">
                  <p className="text-xs font-medium text-gray-500 mb-2">Background</p>
                  <div className="grid grid-cols-4 gap-1.5">
                    {BG_PRESETS.map((bg, i) => (
                      <button key={i} onClick={() => { setTemplate((t) => ({ ...t, background: { type: 'gradient', from: bg.from, to: bg.to } })); }}
                        className="h-10 rounded-lg border border-gray-200 hover:border-[#7c3aed] transition-all hover:shadow-sm"
                        style={{ background: `linear-gradient(135deg, ${bg.from}, ${bg.to})` }} title={bg.label} />
                    ))}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <input type="color" value={template.background?.from || '#0f172a'}
                      onChange={(e) => setTemplate((t) => ({ ...t, background: { type: 'gradient', from: e.target.value, to: t.background?.to || '#1e293b' } }))}
                      className="w-8 h-8 rounded-md cursor-pointer border border-gray-200" title="Gradient start" />
                    <input type="color" value={template.background?.to || '#1e293b'}
                      onChange={(e) => setTemplate((t) => ({ ...t, background: { type: 'gradient', from: t.background?.from || '#0f172a', to: e.target.value } }))}
                      className="w-8 h-8 rounded-md cursor-pointer border border-gray-200" title="Gradient end" />
                    <span className="text-[10px] text-gray-400">Custom gradient</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Elements Panel */}
          {activeSidebar === 'elements' && (
            <>
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Elements</h3>
                <button onClick={() => setActiveSidebar(null)} className="p-1 rounded-md hover:bg-gray-100 text-gray-400">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">Shapes</p>
                  <div className="grid grid-cols-3 gap-2">
                    {ELEMENT_SHAPES.map((shape) => (
                      <button key={shape.type} onClick={() => addElement(shape.type)}
                        className="flex flex-col items-center gap-1 p-3 rounded-xl border border-gray-200 hover:border-[#7c3aed] hover:bg-purple-50 transition-all text-gray-700">
                        <span className="text-xl font-bold">{shape.icon}</span>
                        <span className="text-[10px] text-gray-500">{shape.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">Icons</p>
                  <div className="grid grid-cols-6 gap-1.5">
                    {ICON_SHAPES.map((icon, i) => (
                      <button key={i} onClick={() => addIconElement(icon)}
                        className="w-full aspect-square flex items-center justify-center rounded-lg border border-gray-200 hover:border-[#7c3aed] hover:bg-purple-50 transition-all text-lg text-gray-600">
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">Colors</p>
                  <div className="flex flex-wrap gap-1.5">
                    {COLOR_PRESETS.map((color, i) => (
                      <button key={i} onClick={() => {
                        const newEl = { id: uid(), type: 'heading', text: 'Color Block', color: '#ffffff', bg: color, fontSize: 20, fontWeight: 600, x: 50, y: 50, width: 30, src: '', align: 'center' };
                        const next = [...elements, newEl];
                        setElements(next);
                        setSelectedId(newEl.id);
                        pushHistory(next);
                        setActiveSidebar(null);
                      }}
                        className="w-9 h-9 rounded-lg border-2 border-gray-200 hover:border-[#7c3aed] transition-all hover:scale-110"
                        style={{ background: color }} />
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Text Panel */}
          {activeSidebar === 'text' && (
            <>
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Text</h3>
                <button onClick={() => setActiveSidebar(null)} className="p-1 rounded-md hover:bg-gray-100 text-gray-400">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {TEXT_OPTIONS.map((opt) => (
                  <button key={opt.type} onClick={() => addElement(opt.type)}
                    className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-[#7c3aed] hover:bg-purple-50 transition-all group">
                    <p style={{ fontSize: opt.fontSize > 28 ? 20 : opt.fontSize > 20 ? 16 : 14, fontWeight: opt.type === 'heading' ? 800 : opt.type === 'subheading' ? 600 : 400 }}
                      className="text-gray-900 group-hover:text-[#7c3aed] transition-colors">
                      {opt.label}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">{opt.desc}</p>
                  </button>
                ))}

                <div className="mt-4">
                  <p className="text-xs font-medium text-gray-500 mb-2">Quick Add</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => { const el = { id: uid(), type: 'heading', text: 'Big Title', color: '#ffffff', fontSize: 48, fontWeight: 800, x: 50, y: 40, width: 80, bg: '', align: 'center' }; const next = [...elements, el]; setElements(next); setSelectedId(el.id); pushHistory(next); setActiveSidebar(null); }}
                      className="p-3 rounded-xl border border-gray-200 hover:border-[#7c3aed] hover:bg-purple-50 transition-all text-center">
                      <span className="text-2xl font-extrabold text-gray-900">Aa</span>
                      <p className="text-[10px] text-gray-500 mt-1">Large Title</p>
                    </button>
                    <button onClick={() => { const el = { id: uid(), type: 'paragraph', text: 'Small body text for descriptions and details.', color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: 400, x: 50, y: 50, width: 70, bg: '', align: 'center' }; const next = [...elements, el]; setElements(next); setSelectedId(el.id); pushHistory(next); setActiveSidebar(null); }}
                      className="p-3 rounded-xl border border-gray-200 hover:border-[#7c3aed] hover:bg-purple-50 transition-all text-center">
                      <span className="text-sm font-normal text-gray-700">Aa</span>
                      <p className="text-[10px] text-gray-500 mt-1">Body Text</p>
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">Font</p>
                  <div className="space-y-1.5">
                    {FONTS.map((font) => (
                      <button key={font} onClick={() => {
                        if (selectedEl && (selectedEl.type === 'heading' || selectedEl.type === 'paragraph' || selectedEl.type === 'button')) {
                          const fontKey = selectedEl.type === 'heading' ? 'heading' : 'body';
                          setTemplate((t) => ({ ...t, fonts: { ...t.fonts, [fontKey]: font } }));
                        }
                      }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 text-sm text-gray-700 transition-colors"
                        style={{ fontFamily: font }}>
                        {font}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Uploads Panel */}
          {activeSidebar === 'uploads' && (
            <>
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Uploads</h3>
                <button onClick={() => setActiveSidebar(null)} className="p-1 rounded-md hover:bg-gray-100 text-gray-400">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center px-4">
                <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center mb-3">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg>
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1">Upload files</p>
                <p className="text-xs text-gray-400 text-center mb-3">Drag & drop or click to upload images</p>
                <button className="px-4 py-2 bg-[#7c3aed] text-white text-xs font-medium rounded-lg hover:bg-[#6d28d9] transition-colors">
                  Choose files
                </button>
              </div>
            </>
          )}

          {/* Brand Panel */}
          {activeSidebar === 'brand' && (
            <>
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Brand</h3>
                <button onClick={() => setActiveSidebar(null)} className="p-1 rounded-md hover:bg-gray-100 text-gray-400">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">Brand Colors</p>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_PRESETS.slice(0, 8).map((color, i) => (
                      <button key={i} className="w-10 h-10 rounded-xl border-2 border-gray-200 hover:border-[#7c3aed] transition-all hover:scale-110" style={{ background: color }} />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">Fonts</p>
                  <div className="space-y-2">
                    <div className="p-3 rounded-xl border border-gray-200">
                      <p className="text-[10px] text-gray-400 mb-1">Heading</p>
                      <p className="text-sm font-bold text-gray-900" style={{ fontFamily: template.fonts?.heading }}>{template.fonts?.heading}</p>
                    </div>
                    <div className="p-3 rounded-xl border border-gray-200">
                      <p className="text-[10px] text-gray-400 mb-1">Body</p>
                      <p className="text-sm text-gray-900" style={{ fontFamily: template.fonts?.body }}>{template.fonts?.body}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">Border Radius</p>
                  <div className="flex items-center gap-2">
                    <input type="range" min="0" max="32" value={template.style?.borderRadius || 12}
                      onChange={(e) => setTemplate((t) => ({ ...t, style: { ...t.style, borderRadius: Number(e.target.value) } }))}
                      className="flex-1 accent-[#7c3aed]" />
                    <span className="text-xs text-gray-500 w-6 text-right">{template.style?.borderRadius || 12}px</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ==================== AI FLYOUT PANEL ==================== */}
      {showAI && (
        <div className="absolute right-0 top-14 bottom-0 w-[320px] bg-white border-l border-gray-200 shadow-xl z-20 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-[#7c3aed] rounded-lg flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 01-2 2h-4a2 2 0 01-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7z" /><path d="M9 21h6" /></svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">AI Assistant</h3>
                <p className="text-[10px] text-gray-400">Powered by AI</p>
              </div>
            </div>
            <button onClick={() => { setShowAI(false); setActiveSidebar(null); }} className="p-1 rounded-md hover:bg-gray-100 text-gray-400">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {aiMessages.length === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-purple-50 rounded-2xl flex items-center justify-center">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.5"><path d="M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 01-2 2h-4a2 2 0 01-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7z" /><path d="M9 21h6" /></svg>
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1">How can I help?</p>
                <p className="text-xs text-gray-400 mb-4">Ask me to change colors, text, layout, or anything!</p>
                <div className="space-y-1.5">
                  {['Make the background blue', 'Change title to "Hello World"', 'Add a phone number', 'Make it more modern', 'Change all text to white'].map((s) => (
                    <button key={s} onClick={() => { setAiInput(s); aiInputRef.current?.focus(); }}
                      className="block w-full text-left text-xs px-3 py-2.5 rounded-xl bg-gray-50 text-gray-600 hover:bg-purple-50 hover:text-[#7c3aed] transition-colors border border-gray-100 hover:border-purple-200">
                      "{s}"
                    </button>
                  ))}
                </div>
              </div>
            )}

            {aiMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3 py-2.5 rounded-2xl text-xs leading-relaxed ${
                  msg.role === 'user' ? 'bg-[#7c3aed] text-white rounded-br-md' : 'bg-gray-100 text-gray-700 rounded-bl-md'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}

            {aiLoading && (
              <div className="flex justify-start">
                <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-gray-100">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-[#7c3aed] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-[#7c3aed] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-[#7c3aed] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <input ref={aiInputRef} value={aiInput} onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendToAI()}
                placeholder="Describe changes..."
                className="flex-1 px-3 py-2.5 rounded-xl text-xs outline-none border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/20 transition-all"
                disabled={aiLoading} />
              <button onClick={sendToAI} disabled={!aiInput.trim() || aiLoading}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#7c3aed] text-white hover:bg-[#6d28d9] disabled:opacity-40 transition-all shadow-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== CLICK OUTSIDE OVERLAY ==================== */}
      {(activeSidebar || showAI) && (
        <div className="fixed inset-0 z-10" onClick={() => { setActiveSidebar(null); setShowAI(false); }} />
      )}

    </div>
  );
}
