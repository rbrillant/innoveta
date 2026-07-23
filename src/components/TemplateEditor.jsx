import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from './ThemeProvider';
import { fetchTemplate, fetchTemplates, fetchTemplateImages } from '../data';
import TemplateRenderer from './TemplateRenderer';

const CANVAS_W = 800;
const CANVAS_H = 500;

const ELEMENT_DEFAULTS = {
  text: { type: 'text', content: 'Text', x: 50, y: 50, fontSize: 24, fontFamily: 'Inter', fontWeight: 400, fontStyle: 'normal', color: '#000000', rotation: 0, opacity: 100, locked: false, width: 200, height: 40 },
  heading: { type: 'text', content: 'Heading', x: 50, y: 50, fontSize: 40, fontFamily: 'Inter', fontWeight: 700, fontStyle: 'normal', color: '#000000', rotation: 0, opacity: 100, locked: false, width: 400, height: 60 },
  subheading: { type: 'text', content: 'Subheading', x: 50, y: 50, fontSize: 28, fontFamily: 'Inter', fontWeight: 500, fontStyle: 'normal', color: '#000000', rotation: 0, opacity: 100, locked: false, width: 300, height: 45 },
  body: { type: 'text', content: 'Body text', x: 50, y: 50, fontSize: 16, fontFamily: 'Inter', fontWeight: 400, fontStyle: 'normal', color: '#000000', rotation: 0, opacity: 100, locked: false, width: 300, height: 30 },
  button: { type: 'button', content: 'Button', x: 50, y: 50, fontSize: 16, fontFamily: 'Inter', fontWeight: 600, fontStyle: 'normal', color: '#ffffff', bgColor: '#7c3aed', rotation: 0, opacity: 100, locked: false, borderRadius: 8, width: 150, height: 50 },
  rectangle: { type: 'shape', content: 'rectangle', x: 50, y: 50, bgColor: '#7c3aed', rotation: 0, opacity: 100, locked: false, borderRadius: 0, width: 200, height: 150 },
  circle: { type: 'shape', content: 'circle', x: 50, y: 50, bgColor: '#7c3aed', rotation: 0, opacity: 100, locked: false, width: 150, height: 150 },
  line: { type: 'shape', content: 'line', x: 50, y: 50, bgColor: '#000000', rotation: 0, opacity: 100, locked: false, width: 200, height: 4 },
  star: { type: 'shape', content: 'star', x: 50, y: 50, bgColor: '#eab308', rotation: 0, opacity: 100, locked: false, width: 100, height: 100 },
  image: { type: 'image', src: '', content: 'Image', x: 50, y: 50, rotation: 0, opacity: 100, locked: false, width: 200, height: 150 },
};

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

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
  { id: 'projects', label: 'Projects', icon: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : 'currentColor'} strokeWidth="1.8">
      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2v11z" />
    </svg>
  )},
];

const TEMPLATE_PRESETS = [
  { id: 'blank', name: 'Blank', background: { type: 'solid', color: '#ffffff' }, elements: [] },
  { id: 'dark', name: 'Dark', background: { type: 'gradient', from: '#0f172a', to: '#1e293b' }, elements: [
    { type: 'text', content: 'Dark Theme', color: '#ffffff', fontSize: 36, fontFamily: 'Inter', fontWeight: 800, fontStyle: 'normal', x: 50, y: 35, width: 400, height: 60, rotation: 0, opacity: 100, locked: false },
    { type: 'text', content: 'A sleek dark template', color: '#ffffff', fontSize: 16, fontFamily: 'Inter', fontWeight: 400, fontStyle: 'normal', x: 50, y: 50, width: 300, height: 30, rotation: 0, opacity: 70, locked: false },
    { type: 'button', content: 'Get Started', bgColor: '#7c3aed', color: '#ffffff', fontSize: 15, fontFamily: 'Inter', fontWeight: 600, fontStyle: 'normal', x: 50, y: 68, width: 150, height: 50, borderRadius: 8, rotation: 0, opacity: 100, locked: false },
  ]},
  { id: 'vibrant', name: 'Vibrant', background: { type: 'gradient', from: '#7c3aed', to: '#ec4899' }, elements: [
    { type: 'text', content: 'Vibrant Design', color: '#ffffff', fontSize: 36, fontFamily: 'Inter', fontWeight: 800, fontStyle: 'normal', x: 50, y: 35, width: 400, height: 60, rotation: 0, opacity: 100, locked: false },
    { type: 'text', content: 'Eye-catching gradient background', color: '#ffffff', fontSize: 16, fontFamily: 'Inter', fontWeight: 400, fontStyle: 'normal', x: 50, y: 50, width: 300, height: 30, rotation: 0, opacity: 85, locked: false },
    { type: 'button', content: 'Explore', bgColor: '#ffffff', color: '#7c3aed', fontSize: 15, fontFamily: 'Inter', fontWeight: 600, fontStyle: 'normal', x: 50, y: 68, width: 150, height: 50, borderRadius: 8, rotation: 0, opacity: 100, locked: false },
  ]},
  { id: 'nature', name: 'Nature', background: { type: 'gradient', from: '#065f46', to: '#34d399' }, elements: [
    { type: 'text', content: 'Fresh & Natural', color: '#ffffff', fontSize: 36, fontFamily: 'Inter', fontWeight: 800, fontStyle: 'normal', x: 50, y: 35, width: 400, height: 60, rotation: 0, opacity: 100, locked: false },
    { type: 'text', content: 'Clean organic vibes', color: '#ffffff', fontSize: 16, fontFamily: 'Inter', fontWeight: 400, fontStyle: 'normal', x: 50, y: 50, width: 300, height: 30, rotation: 0, opacity: 80, locked: false },
    { type: 'button', content: 'Shop Now', bgColor: '#ffffff', color: '#065f46', fontSize: 15, fontFamily: 'Inter', fontWeight: 600, fontStyle: 'normal', x: 50, y: 68, width: 150, height: 50, borderRadius: 8, rotation: 0, opacity: 100, locked: false },
  ]},
  { id: 'coral', name: 'Coral', background: { type: 'gradient', from: '#f43f5e', to: '#fb923c' }, elements: [
    { type: 'text', content: 'Warm & Bold', color: '#ffffff', fontSize: 36, fontFamily: 'Inter', fontWeight: 800, fontStyle: 'normal', x: 50, y: 35, width: 400, height: 60, rotation: 0, opacity: 100, locked: false },
    { type: 'text', content: 'Sunset-inspired design', color: '#ffffff', fontSize: 16, fontFamily: 'Inter', fontWeight: 400, fontStyle: 'normal', x: 50, y: 50, width: 300, height: 30, rotation: 0, opacity: 85, locked: false },
    { type: 'button', content: 'Learn More', bgColor: '#ffffff', color: '#f43f5e', fontSize: 15, fontFamily: 'Inter', fontWeight: 600, fontStyle: 'normal', x: 50, y: 68, width: 150, height: 50, borderRadius: 8, rotation: 0, opacity: 100, locked: false },
  ]},
];

const TEXT_OPTIONS = [
  { preset: 'heading', label: 'Add a heading', desc: 'Large bold text' },
  { preset: 'subheading', label: 'Add a subheading', desc: 'Medium text' },
  { preset: 'body', label: 'Add body text', desc: 'Small regular text' },
];

const ELEMENT_SHAPES = [
  { preset: 'rectangle', label: 'Rectangle', icon: '▭' },
  { preset: 'circle', label: 'Circle', icon: '○' },
  { preset: 'line', label: 'Line', icon: '—' },
  { preset: 'star', label: 'Star', icon: '★' },
];

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

const INITIAL_TEMPLATE = {
  title: 'Untitled Design',
  canvas: { width: CANVAS_W, height: CANVAS_H, background: { type: 'gradient', from: '#0f172a', to: '#1e293b' } },
  elements: [],
  fonts: { heading: 'Inter', body: 'Inter' },
  aiPrompt: '',
};

export default function TemplateEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { dark } = useTheme();
  const canvasRef = useRef(null);
  const aiInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const elementsRef = useRef([]);
  const clipboardRef = useRef(null);
  const colorDebounceRef = useRef(null);

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
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [projectTemplates, setProjectTemplates] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);

  elementsRef.current = elements;

  const selectedEl = elements.find((e) => e.id === selectedId) || null;

  const bgStyle = (() => {
    const bg = template.canvas?.background || {};
    switch (bg.type) {
      case 'gradient':
        return { background: `linear-gradient(135deg, ${bg.from || '#0f172a'}, ${bg.to || '#1e293b'})` };
      case 'solid':
        return { background: bg.color || '#0f172a' };
      default:
        return { background: `linear-gradient(135deg, ${bg.from || '#0f172a'}, ${bg.to || '#1e293b'})` };
    }
  })();

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
    if (!id) return;
    setLoading(true);
    Promise.all([fetchTemplate(id), fetchTemplateImages(id)])
      .then(([t]) => {
        if (t) {
          const loadedElements = (t.elements || []).map((el) => ({
            ...JSON.parse(JSON.stringify(ELEMENT_DEFAULTS[el.type] || ELEMENT_DEFAULTS.text)),
            ...el,
            id: el.id || uid(),
          }));
          setTemplate({
            ...INITIAL_TEMPLATE,
            title: t.name || 'Template',
            canvas: { ...INITIAL_TEMPLATE.canvas, background: t.background || INITIAL_TEMPLATE.canvas.background },
            elements: loadedElements,
          });
          setElements(loadedElements);
          setDesignName(t.name || 'Untitled Design');
          pushHistory(loadedElements);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const updateElement = useCallback((elId, updates) => {
    setElements((prev) => prev.map((el) => el.id === elId ? { ...el, ...updates } : el));
  }, []);

  const commitElementUpdate = useCallback((elId, updates) => {
    const next = elementsRef.current.map((el) => el.id === elId ? { ...el, ...updates } : el);
    setElements(next);
    pushHistory(next);
  }, [pushHistory]);

  const addElement = useCallback((presetKey) => {
    const def = ELEMENT_DEFAULTS[presetKey];
    if (!def) return;
    const newEl = { ...JSON.parse(JSON.stringify(def)), id: uid() };
    const next = [...elementsRef.current, newEl];
    setElements(next);
    setSelectedId(newEl.id);
    pushHistory(next);
    setActiveSidebar(null);
  }, [pushHistory]);

  const deleteElement = useCallback((elId) => {
    const next = elementsRef.current.filter((el) => el.id !== elId);
    setElements(next);
    setSelectedId(null);
    setEditingText(null);
    pushHistory(next);
  }, [pushHistory]);

  const duplicateElement = useCallback((elId) => {
    const el = elementsRef.current.find((e) => e.id === elId);
    if (!el) return;
    const newEl = { ...JSON.parse(JSON.stringify(el)), id: uid(), x: Math.min((el.x || 50) + 3, 95), y: Math.min((el.y || 50) + 3, 95) };
    const next = [...elementsRef.current, newEl];
    setElements(next);
    setSelectedId(newEl.id);
    pushHistory(next);
  }, [pushHistory]);

  const bringForward = useCallback((elId) => {
    const elems = elementsRef.current;
    const idx = elems.findIndex((e) => e.id === elId);
    if (idx < elems.length - 1) {
      const next = [...elems];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      setElements(next);
      pushHistory(next);
    }
  }, [pushHistory]);

  const sendBackward = useCallback((elId) => {
    const elems = elementsRef.current;
    const idx = elems.findIndex((e) => e.id === elId);
    if (idx > 0) {
      const next = [...elems];
      [next[idx], next[idx - 1]] = [next[idx - 1], next[idx]];
      setElements(next);
      pushHistory(next);
    }
  }, [pushHistory]);

  const applyTemplatePreset = useCallback((preset) => {
    setTemplate((t) => ({ ...t, canvas: { ...t.canvas, background: preset.background } }));
    const newElements = preset.elements.map((el) => ({ ...JSON.parse(JSON.stringify(el)), id: uid() }));
    setElements(newElements);
    setSelectedId(null);
    setEditingText(null);
    pushHistory(newElements);
    setActiveSidebar(null);
  }, [pushHistory]);

  const getCanvasCoords = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    };
  }, []);

  const onElementMouseDown = useCallback((e, el) => {
    if (editingText === el.id || el.locked) return;
    e.stopPropagation();
    e.preventDefault();
    setSelectedId(el.id);
    setEditingText(null);
    setActiveSidebar(null);
    setShowDownloadMenu(false);
    setShowShareMenu(false);
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
  }, [editingText, getCanvasCoords, updateElement, commitElementUpdate]);

  const onResizeMouseDown = useCallback((e, el) => {
    e.stopPropagation();
    e.preventDefault();
    const startX = e.clientX;
    const startW = el.width || 100;
    const startH = el.height || 50;
    const onMove = (me) => {
      me.preventDefault();
      const dx = me.clientX - startX;
      const isShape = el.type === 'shape';
      const updates = {};
      if (el.type === 'image') {
        updates.width = Math.max(40, Math.min(800, startW + dx));
        updates.height = Math.max(40, Math.min(600, startH + dx * 0.6));
      } else {
        updates.width = Math.max(40, Math.min(600, startW + dx));
        if (isShape && el.content !== 'line') {
          updates.height = Math.max(20, Math.min(400, startH + dx * 0.6));
        }
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
  }, [updateElement, commitElementUpdate]);

  const onCanvasClick = useCallback((e) => {
    if (e.target === canvasRef.current || e.target.closest('.canvas-inner') === canvasRef.current) {
      setSelectedId(null);
      setEditingText(null);
      setActiveSidebar(null);
    }
    setShowDownloadMenu(false);
    setShowShareMenu(false);
  }, []);

  const onElementDoubleClick = useCallback((e, el) => {
    e.stopPropagation();
    if (el.type === 'text' || el.type === 'button') {
      if (el.locked) return;
      setEditingText(el.id);
      setSelectedId(el.id);
    }
  }, []);

  const handleFileUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const newEl = {
        ...JSON.parse(JSON.stringify(ELEMENT_DEFAULTS.image)),
        id: uid(),
        src: ev.target.result,
        content: file.name,
      };
      const next = [...elementsRef.current, newEl];
      setElements(next);
      setSelectedId(newEl.id);
      pushHistory(next);
      setActiveSidebar(null);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }, [pushHistory]);

  const handleColorChange = useCallback((elId, prop, value) => {
    updateElement(elId, { [prop]: value });
    if (colorDebounceRef.current) clearTimeout(colorDebounceRef.current);
    colorDebounceRef.current = setTimeout(() => {
      commitElementUpdate(elId, { [prop]: value });
    }, 400);
  }, [updateElement, commitElementUpdate]);

  const handleColorChangeComplete = useCallback((elId, prop, value) => {
    if (colorDebounceRef.current) clearTimeout(colorDebounceRef.current);
    commitElementUpdate(elId, { [prop]: value });
  }, [commitElementUpdate]);

  const loadProjects = useCallback(async () => {
    if (projectsLoading) return;
    setProjectsLoading(true);
    try {
      const templates = await fetchTemplates();
      setProjectTemplates(templates || []);
    } catch {
      setProjectTemplates([]);
    } finally {
      setProjectsLoading(false);
    }
  }, [projectsLoading]);

  useEffect(() => {
    if (activeSidebar === 'projects' && projectTemplates.length === 0) {
      loadProjects();
    }
  }, [activeSidebar, projectTemplates.length, loadProjects]);

  const exportAsJSON = useCallback(() => {
    const data = {
      title: designName,
      canvas: template.canvas,
      elements: elements.map(({ id: _id, ...rest }) => rest),
      fonts: template.fonts,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${designName.replace(/\s+/g, '-').toLowerCase() || 'template'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowDownloadMenu(false);
  }, [designName, template, elements]);

  const exportAsImage = useCallback(async () => {
    try {
      const el = canvasRef.current;
      if (!el) { alert('No canvas to export.'); return; }
      const canvas = document.createElement('canvas');
      canvas.width = CANVAS_W * 2;
      canvas.height = CANVAS_H * 2;
      const ctx = canvas.getContext('2d');
      ctx.scale(2, 2);
      const bg = template.canvas?.background || {};
      if (bg.type === 'gradient') {
        const grad = ctx.createLinearGradient(0, 0, CANVAS_W, CANVAS_H);
        grad.addColorStop(0, bg.from || '#0f172a');
        grad.addColorStop(1, bg.to || '#1e293b');
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = bg.color || '#0f172a';
      }
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      elements.forEach((el) => {
        const cx = (el.x / 100) * CANVAS_W;
        const cy = (el.y / 100) * CANVAS_H;
        ctx.globalAlpha = (el.opacity || 100) / 100;
        ctx.save();
        if (el.rotation) {
          ctx.translate(cx, cy);
          ctx.rotate((el.rotation * Math.PI) / 180);
          ctx.translate(-cx, -cy);
        }
        if (el.type === 'text') {
          ctx.fillStyle = el.color || '#000000';
          ctx.font = `${el.fontStyle || 'normal'} ${el.fontWeight || 400} ${el.fontSize || 16}px ${el.fontFamily || 'Inter'}, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(el.content || '', cx, cy);
        } else if (el.type === 'button') {
          const bw = el.width || 150;
          const bh = el.height || 50;
          ctx.fillStyle = el.bgColor || '#7c3aed';
          ctx.beginPath();
          ctx.roundRect(cx - bw / 2, cy - bh / 2, bw, bh, el.borderRadius || 8);
          ctx.fill();
          ctx.fillStyle = el.color || '#ffffff';
          ctx.font = `${el.fontStyle || 'normal'} ${el.fontWeight || 600} ${el.fontSize || 16}px ${el.fontFamily || 'Inter'}, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(el.content || '', cx, cy);
        } else if (el.type === 'shape') {
          const sw = el.width || 200;
          const sh = el.height || 150;
          ctx.fillStyle = el.bgColor || '#7c3aed';
          if (el.content === 'rectangle') {
            ctx.beginPath();
            ctx.roundRect(cx - sw / 2, cy - sh / 2, sw, sh, el.borderRadius || 0);
            ctx.fill();
          } else if (el.content === 'circle') {
            ctx.beginPath();
            ctx.ellipse(cx, cy, sw / 2, sh / 2, 0, 0, Math.PI * 2);
            ctx.fill();
          } else if (el.content === 'line') {
            ctx.fillRect(cx - sw / 2, cy - 2, sw, 4);
          } else if (el.content === 'star') {
            const r = sw / 2;
            const ir = r * 0.4;
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
              const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
              const method = i === 0 ? 'moveTo' : 'lineTo';
              ctx[method](cx + r * Math.cos(angle), cy + r * Math.sin(angle));
              const innerAngle = angle + (2 * Math.PI) / 10;
              ctx.lineTo(cx + ir * Math.cos(innerAngle), cy + ir * Math.sin(innerAngle));
            }
            ctx.closePath();
            ctx.fill();
          }
        } else if (el.type === 'image' && el.src) {
          const iw = el.width || 200;
          const ih = el.height || 150;
          try {
            const img = new Image();
            img.src = el.src;
            if (img.complete) {
              ctx.drawImage(img, cx - iw / 2, cy - ih / 2, iw, ih);
            }
          } catch {}
        }
        ctx.restore();
        ctx.globalAlpha = 1;
      });
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `${designName.replace(/\s+/g, '-').toLowerCase() || 'template'}.png`;
      a.click();
      setShowDownloadMenu(false);
    } catch (err) {
      console.error(err);
      alert('Export failed. Try downloading as JSON instead.');
    }
  }, [designName, template, elements]);

  const handleShareCopy = useCallback(() => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const isInputFocused = document.activeElement?.tagName === 'INPUT'
        || document.activeElement?.tagName === 'TEXTAREA'
        || document.activeElement?.contentEditable === 'true';

      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        if (selectedId) duplicateElement(selectedId);
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        if (selectedId && !isInputFocused) {
          e.preventDefault();
          const el = elementsRef.current.find((x) => x.id === selectedId);
          if (el) clipboardRef.current = JSON.parse(JSON.stringify(el));
        }
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        if (!isInputFocused && clipboardRef.current) {
          e.preventDefault();
          const newEl = { ...JSON.parse(JSON.stringify(clipboardRef.current)), id: uid(), x: Math.min((clipboardRef.current.x || 50) + 3, 95), y: Math.min((clipboardRef.current.y || 50) + 3, 95) };
          const next = [...elementsRef.current, newEl];
          setElements(next);
          setSelectedId(newEl.id);
          pushHistory(next);
        }
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        if (!isInputFocused) {
          e.preventDefault();
          const elems = elementsRef.current;
          if (elems.length > 0) {
            setSelectedId(elems[elems.length - 1].id);
          }
        }
        return;
      }
      if (e.key === 'Escape') {
        setActiveSidebar(null);
        setShowAI(false);
        setSelectedId(null);
        setEditingText(null);
        setShowDownloadMenu(false);
        setShowShareMenu(false);
        return;
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && !isInputFocused) {
        if (selectedId && editingText === null) {
          e.preventDefault();
          deleteElement(selectedId);
        }
        return;
      }
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && !isInputFocused) {
        if (selectedId) {
          e.preventDefault();
          const step = e.shiftKey ? 1 : 0.3;
          const el = elementsRef.current.find((x) => x.id === selectedId);
          if (!el || el.locked) return;
          const updates = {};
          if (e.key === 'ArrowUp') updates.y = Math.max(0, (el.y || 50) - step);
          if (e.key === 'ArrowDown') updates.y = Math.min(100, (el.y || 50) + step);
          if (e.key === 'ArrowLeft') updates.x = Math.max(0, (el.x || 50) - step);
          if (e.key === 'ArrowRight') updates.x = Math.min(100, (el.x || 50) + step);
          updateElement(selectedId, updates);
        }
        return;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, selectedId, editingText, deleteElement, duplicateElement, updateElement, pushHistory]);

  useEffect(() => {
    const container = canvasRef.current?.parentElement;
    if (!container) return;
    const handleWheel = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        setZoom((z) => Math.max(0.25, Math.min(3, z + (e.deltaY > 0 ? -0.1 : 0.1))));
      }
    };
    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  const getFloatingToolbarPosition = useCallback(() => {
    if (!selectedEl || !canvasRef.current) return null;
    const rect = canvasRef.current.getBoundingClientRect();
    const elPxX = (selectedEl.x / 100) * rect.width;
    const elPxY = (selectedEl.y / 100) * rect.height;
    const elPxH = selectedEl.height || 40;
    const toolbarY = elPxY - elPxH / 2 - 16;
    const toolbarX = rect.left + elPxX;
    const toolbarAbsY = rect.top + toolbarY;
    return { x: toolbarX, y: Math.max(60, toolbarAbsY) };
  }, [selectedEl]);

  const floatingToolbarPos = getFloatingToolbarPosition();

  const isTextType = (type) => type === 'text' || type === 'button';
  const isShapeType = (type) => type === 'shape';

  const renderElement = (el) => {
    const isSelected = el.id === selectedId;
    const isEditing = el.id === editingText;
    const opacity = (el.opacity != null ? el.opacity : 100) / 100;
    const rotation = el.rotation || 0;

    const baseStyle = {
      position: 'absolute',
      left: `${el.x}%`,
      top: `${el.y}%`,
      width: el.width || 'auto',
      height: el.height || 'auto',
      opacity,
      transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
      cursor: el.locked ? 'not-allowed' : 'move',
      userSelect: isEditing ? 'text' : 'none',
      outline: isSelected ? '2px solid #7c3aed' : 'none',
      outlineOffset: '3px',
      transition: 'outline 0.1s',
    };

    if (el.type === 'text') {
      return (
        <div
          key={el.id}
          style={{
            ...baseStyle,
            fontSize: el.fontSize || 16,
            fontFamily: el.fontFamily || 'Inter',
            fontWeight: el.fontWeight || 400,
            fontStyle: el.fontStyle || 'normal',
            color: el.color || '#000000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            lineHeight: 1.4,
            whiteSpace: 'pre-wrap',
          }}
          onMouseDown={(e) => onElementMouseDown(e, el)}
          onDoubleClick={(e) => onElementDoubleClick(e, el)}
        >
          {isEditing ? (
            <div
              contentEditable
              suppressContentEditableWarning
              autoFocus
              style={{ outline: 'none', minWidth: 40 }}
              onBlur={(e) => { commitElementUpdate(el.id, { content: e.target.textContent }); setEditingText(null); }}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); e.target.blur(); } }}
            >{el.content}</div>
          ) : el.content}
          {isSelected && !isEditing && !el.locked && (
            <div
              onMouseDown={(e) => onResizeMouseDown(e, el)}
              style={{ position: 'absolute', right: -5, bottom: -5, width: 10, height: 10, background: '#7c3aed', borderRadius: 2, cursor: 'se-resize', border: '1px solid #fff' }}
            />
          )}
        </div>
      );
    }

    if (el.type === 'button') {
      return (
        <div
          key={el.id}
          style={{
            ...baseStyle,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: el.bgColor || '#7c3aed',
            color: el.color || '#ffffff',
            borderRadius: el.borderRadius || 8,
            fontSize: el.fontSize || 16,
            fontFamily: el.fontFamily || 'Inter',
            fontWeight: el.fontWeight || 600,
            fontStyle: el.fontStyle || 'normal',
            boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
            whiteSpace: 'nowrap',
          }}
          onMouseDown={(e) => onElementMouseDown(e, el)}
          onDoubleClick={(e) => onElementDoubleClick(e, el)}
        >
          {isEditing ? (
            <div
              contentEditable
              suppressContentEditableWarning
              autoFocus
              style={{ outline: 'none', minWidth: 40 }}
              onBlur={(e) => { commitElementUpdate(el.id, { content: e.target.textContent }); setEditingText(null); }}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); } }}
            >{el.content}</div>
          ) : el.content}
          {isSelected && !isEditing && !el.locked && (
            <div
              onMouseDown={(e) => onResizeMouseDown(e, el)}
              style={{ position: 'absolute', right: -5, bottom: -5, width: 10, height: 10, background: '#7c3aed', borderRadius: 2, cursor: 'se-resize', border: '1px solid #fff' }}
            />
          )}
        </div>
      );
    }

    if (el.type === 'shape') {
      let shapeStyle = { ...baseStyle };
      if (el.content === 'circle') {
        shapeStyle = { ...shapeStyle, borderRadius: '50%', background: el.bgColor || '#7c3aed' };
      } else if (el.content === 'line') {
        shapeStyle = { ...shapeStyle, height: 4, background: el.bgColor || '#000000', borderRadius: 2 };
      } else if (el.content === 'star') {
        return (
          <div
            key={el.id}
            style={shapeStyle}
            onMouseDown={(e) => onElementMouseDown(e, el)}
          >
            <svg viewBox="0 0 24 24" width="100%" height="100%">
              <path
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                fill={el.bgColor || '#eab308'}
              />
            </svg>
            {isSelected && !el.locked && (
              <div
                onMouseDown={(e) => onResizeMouseDown(e, el)}
                style={{ position: 'absolute', right: -5, bottom: -5, width: 10, height: 10, background: '#7c3aed', borderRadius: 2, cursor: 'se-resize', border: '1px solid #fff' }}
              />
            )}
          </div>
        );
      } else {
        shapeStyle = { ...shapeStyle, background: el.bgColor || '#7c3aed', borderRadius: el.borderRadius || 0 };
      }
      return (
        <div
          key={el.id}
          style={shapeStyle}
          onMouseDown={(e) => onElementMouseDown(e, el)}
        >
          {isSelected && !el.locked && (
            <div
              onMouseDown={(e) => onResizeMouseDown(e, el)}
              style={{ position: 'absolute', right: -5, bottom: -5, width: 10, height: 10, background: '#7c3aed', borderRadius: 2, cursor: 'se-resize', border: '1px solid #fff' }}
            />
          )}
        </div>
      );
    }

    if (el.type === 'image') {
      return (
        <div
          key={el.id}
          style={baseStyle}
          onMouseDown={(e) => onElementMouseDown(e, el)}
        >
          {el.src ? (
            <img
              src={el.src}
              alt={el.content || 'Image'}
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4, display: 'block' }}
              draggable={false}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                background: '#e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 4,
                border: '2px dashed #9ca3af',
                color: '#6b7280',
                fontSize: 12,
              }}
            >
              No image
            </div>
          )}
          {isSelected && !el.locked && (
            <div
              onMouseDown={(e) => onResizeMouseDown(e, el)}
              style={{ position: 'absolute', right: -5, bottom: -5, width: 10, height: 10, background: '#7c3aed', borderRadius: 2, cursor: 'se-resize', border: '1px solid #fff' }}
            />
          )}
        </div>
      );
    }

    return null;
  };

  const sendToAI = useCallback(async () => {
    const text = aiInput.trim();
    if (!text || aiLoading) return;
    setAiInput('');
    setAiMessages((m) => [...m, { role: 'user', text }]);
    setAiLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const currentTmpl = { ...template, elements: elementsRef.current.map(({ id: _id, ...rest }) => rest) };
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
        if (data.data.background) setTemplate((t) => ({ ...t, canvas: { ...t.canvas, background: data.data.background } }));
        if (data.data.title) setTemplate((t) => ({ ...t, title: data.data.title }));
        setAiMessages((m) => [...m, { role: 'assistant', text: 'Template updated! Check the preview.' }]);
      } else {
        setAiMessages((m) => [...m, { role: 'assistant', text: data.error || 'Failed to process.' }]);
      }
    } catch {
      setAiMessages((m) => [...m, { role: 'assistant', text: 'Network error. Please try again.' }]);
    } finally {
      setAiLoading(false);
    }
  }, [aiInput, aiLoading, template, pushHistory]);

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

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />

      <div className="h-14 flex items-center justify-between px-4 bg-white border-b border-gray-200 shrink-0 z-30">
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
              onKeyDown={(e) => { if (e.key === 'Enter') setDesignNameEditing(false); }}
              className="text-sm font-medium text-gray-900 bg-gray-50 border border-gray-200 rounded-md px-2 py-1 outline-none focus:border-[#7c3aed] w-48"
            />
          ) : (
            <button onClick={() => setDesignNameEditing(true)} className="text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md px-2 py-1 transition-colors truncate max-w-[180px]" title="Rename design">
              {designName}
            </button>
          )}
        </div>

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

        <div className="flex items-center gap-2 min-w-[200px] justify-end">
          <button onClick={() => { setShowAI((s) => !s); if (!showAI) setActiveSidebar('ai'); else setActiveSidebar(null); }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${showAI ? 'bg-[#7c3aed] text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 01-2 2h-4a2 2 0 01-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7z" /><path d="M9 21h6" /></svg>
            AI
          </button>

          <div className="relative">
            <button onClick={() => { setShowShareMenu((s) => !s); setShowDownloadMenu(false); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors" title="Share">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" /></svg>
              Share
            </button>
            {showShareMenu && (
              <div className="absolute right-0 top-full mt-1 w-72 bg-white rounded-xl shadow-xl border border-gray-200 p-3 z-50">
                <p className="text-xs font-medium text-gray-500 mb-2">Share this design</p>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={typeof window !== 'undefined' ? window.location.href : ''}
                    className="flex-1 text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 outline-none"
                  />
                  <button
                    onClick={handleShareCopy}
                    className="px-3 py-1.5 bg-[#7c3aed] text-white text-xs font-medium rounded-lg hover:bg-[#6d28d9] transition-colors whitespace-nowrap"
                  >
                    {shareCopied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button onClick={() => { setShowDownloadMenu((s) => !s); setShowShareMenu(false); }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-[#7c3aed] text-white hover:bg-[#6d28d9] transition-colors shadow-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
              Download
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
            </button>
            {showDownloadMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-1 z-50">
                <button onClick={exportAsImage} className="w-full text-left px-4 py-2.5 text-xs text-gray-700 hover:bg-purple-50 hover:text-[#7c3aed] transition-colors flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
                  Download PNG
                </button>
                <button onClick={exportAsJSON} className="w-full text-left px-4 py-2.5 text-xs text-gray-700 hover:bg-purple-50 hover:text-[#7c3aed] transition-colors flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6M8 13h8M8 17h8M8 9h2" /></svg>
                  Download JSON
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">

        <div className="w-[60px] bg-gray-50 border-r border-gray-200 flex flex-col items-center py-2 gap-0.5 shrink-0 z-20">
          {SIDEBAR_ITEMS.map((item) => {
            const isActive = activeSidebar === item.id;
            return (
              <button key={item.id}
                onClick={() => {
                  setActiveSidebar(isActive ? null : item.id);
                  setSelectedId(null);
                  setEditingText(null);
                  setShowAI(false);
                  setShowDownloadMenu(false);
                  setShowShareMenu(false);
                }}
                className={`w-[52px] flex flex-col items-center gap-0.5 py-2 rounded-xl text-[10px] font-medium transition-all
                  ${isActive ? 'bg-[#7c3aed] text-white shadow-md' : 'text-gray-500 hover:bg-gray-200 hover:text-gray-700'}`}
                title={item.label}>
                <span className="flex items-center justify-center w-6 h-6">{item.icon(isActive)}</span>
                <span className="leading-none">{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex-1 flex items-center justify-center overflow-auto relative" onClick={onCanvasClick}>
          <div style={{ transform: `scale(${zoom})`, transformOrigin: 'center center', transition: 'transform 0.15s ease' }}>
            <div ref={canvasRef}
              className="canvas-inner"
              style={{ width: CANVAS_W, height: CANVAS_H, position: 'relative', overflow: 'hidden', borderRadius: 12, boxShadow: '0 8px 40px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)', ...bgStyle }}
              onClick={(e) => { if (e.target === canvasRef.current) onCanvasClick(e); }}
            >
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

          {selectedEl && floatingToolbarPos && editingText === null && (
            <div
              className="fixed z-50 flex items-center gap-0.5 bg-white rounded-xl shadow-xl border border-gray-200 px-2 py-1.5"
              style={{ left: floatingToolbarPos.x, top: floatingToolbarPos.y, transform: 'translate(-50%, -100%)' }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              {selectedEl.type === 'text' && (
                <div className="relative">
                  <input type="color" value={selectedEl.color || '#000000'}
                    onChange={(e) => handleColorChange(selectedEl.id, 'color', e.target.value)}
                    onMouseUp={(e) => handleColorChangeComplete(selectedEl.id, 'color', e.target.value)}
                    className="w-7 h-7 rounded-md cursor-pointer border-2 border-gray-200 hover:border-[#7c3aed] transition-colors" title="Text color" />
                </div>
              )}

              {selectedEl.type === 'button' && (
                <>
                  <div className="relative">
                    <input type="color" value={selectedEl.bgColor || '#7c3aed'}
                      onChange={(e) => handleColorChange(selectedEl.id, 'bgColor', e.target.value)}
                      onMouseUp={(e) => handleColorChangeComplete(selectedEl.id, 'bgColor', e.target.value)}
                      className="w-7 h-7 rounded-md cursor-pointer border-2 border-gray-200 hover:border-[#7c3aed] transition-colors" title="Button background" />
                  </div>
                  <div className="relative">
                    <input type="color" value={selectedEl.color || '#ffffff'}
                      onChange={(e) => handleColorChange(selectedEl.id, 'color', e.target.value)}
                      onMouseUp={(e) => handleColorChangeComplete(selectedEl.id, 'color', e.target.value)}
                      className="w-7 h-7 rounded-md cursor-pointer border-2 border-gray-200 hover:border-[#7c3aed] transition-colors" title="Button text color" />
                  </div>
                </>
              )}

              {selectedEl.type === 'shape' && (
                <div className="relative">
                  <input type="color" value={selectedEl.bgColor || '#7c3aed'}
                    onChange={(e) => handleColorChange(selectedEl.id, 'bgColor', e.target.value)}
                    onMouseUp={(e) => handleColorChangeComplete(selectedEl.id, 'bgColor', e.target.value)}
                    className="w-7 h-7 rounded-md cursor-pointer border-2 border-gray-200 hover:border-[#7c3aed] transition-colors" title="Shape color" />
                </div>
              )}

              <div className="w-px h-5 bg-gray-200 mx-0.5" />

              {(selectedEl.type === 'text' || selectedEl.type === 'button') && (
                <div className="flex items-center gap-1 px-1">
                  <input type="number" min="8" max="120" value={selectedEl.fontSize || 16}
                    onChange={(e) => updateElement(selectedEl.id, { fontSize: Number(e.target.value) })}
                    onBlur={(e) => commitElementUpdate(selectedEl.id, { fontSize: Number(e.target.value) })}
                    className="w-10 px-1 py-1 text-xs text-center border border-gray-200 rounded-md outline-none focus:border-[#7c3aed] text-gray-900" />
                </div>
              )}

              {(selectedEl.type === 'text' || selectedEl.type === 'button') && (
                <button onClick={() => {
                  const newWeight = (selectedEl.fontWeight || 400) >= 700 ? 400 : 700;
                  commitElementUpdate(selectedEl.id, { fontWeight: newWeight });
                }}
                  className={`w-7 h-7 flex items-center justify-center rounded-md text-xs font-bold transition-colors ${(selectedEl.fontWeight || 400) >= 700 ? 'bg-[#7c3aed] text-white' : 'hover:bg-gray-100 text-gray-600'}`}
                  title="Toggle bold">
                  B
                </button>
              )}

              {(selectedEl.type === 'text' || selectedEl.type === 'button') && (
                <button onClick={() => {
                  const newStyle = selectedEl.fontStyle === 'italic' ? 'normal' : 'italic';
                  commitElementUpdate(selectedEl.id, { fontStyle: newStyle });
                }}
                  className={`w-7 h-7 flex items-center justify-center rounded-md text-xs italic transition-colors ${selectedEl.fontStyle === 'italic' ? 'bg-[#7c3aed] text-white' : 'hover:bg-gray-100 text-gray-600'}`}
                  title="Toggle italic">
                  I
                </button>
              )}

              <div className="w-px h-5 bg-gray-200 mx-0.5" />

              <div className="flex items-center gap-1 px-1">
                <span className="text-[10px] text-gray-400">Op</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={selectedEl.opacity != null ? selectedEl.opacity : 100}
                  onChange={(e) => updateElement(selectedEl.id, { opacity: Number(e.target.value) })}
                  onMouseUp={(e) => commitElementUpdate(selectedEl.id, { opacity: Number(e.target.value) })}
                  className="w-16 h-1 accent-[#7c3aed]"
                  title={`Opacity: ${selectedEl.opacity != null ? selectedEl.opacity : 100}%`}
                />
                <span className="text-[10px] text-gray-500 w-6 text-right">{selectedEl.opacity != null ? selectedEl.opacity : 100}%</span>
              </div>

              <div className="w-px h-5 bg-gray-200 mx-0.5" />

              <button onClick={() => bringForward(selectedEl.id)}
                className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-500 transition-colors" title="Bring forward">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 11v8h14v-8M12 3v12" /></svg>
              </button>
              <button onClick={() => sendBackward(selectedEl.id)}
                className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-500 transition-colors" title="Send backward">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 13v8H5v-8M12 21V9" /></svg>
              </button>

              <div className="w-px h-5 bg-gray-200 mx-0.5" />

              <button onClick={() => duplicateElement(selectedEl.id)}
                className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-500 transition-colors" title="Duplicate (Ctrl+D)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
              </button>

              <button onClick={() => deleteElement(selectedEl.id)}
                className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors" title="Delete">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {activeSidebar && !showAI && (
        <div className="absolute left-[60px] top-14 bottom-0 w-[280px] bg-white border-r border-gray-200 shadow-xl z-20 flex flex-col overflow-hidden animate-slideIn">
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
                      <button key={i} onClick={() => { setTemplate((t) => ({ ...t, canvas: { ...t.canvas, background: { type: 'gradient', from: bg.from, to: bg.to } } })); }}
                        className="h-10 rounded-lg border border-gray-200 hover:border-[#7c3aed] transition-all hover:shadow-sm"
                        style={{ background: `linear-gradient(135deg, ${bg.from}, ${bg.to})` }} title={bg.label} />
                    ))}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <input type="color" value={template.canvas?.background?.from || '#0f172a'}
                      onChange={(e) => setTemplate((t) => ({ ...t, canvas: { ...t.canvas, background: { type: 'gradient', from: e.target.value, to: t.canvas?.background?.to || '#1e293b' } } }))}
                      className="w-8 h-8 rounded-md cursor-pointer border border-gray-200" title="Gradient start" />
                    <input type="color" value={template.canvas?.background?.to || '#1e293b'}
                      onChange={(e) => setTemplate((t) => ({ ...t, canvas: { ...t.canvas, background: { type: 'gradient', from: t.canvas?.background?.from || '#0f172a', to: e.target.value } } }))}
                      className="w-8 h-8 rounded-md cursor-pointer border border-gray-200" title="Gradient end" />
                    <span className="text-[10px] text-gray-400">Custom gradient</span>
                  </div>
                </div>
              </div>
            </>
          )}

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
                  <div className="grid grid-cols-2 gap-2">
                    {ELEMENT_SHAPES.map((shape) => (
                      <button key={shape.preset} onClick={() => addElement(shape.preset)}
                        className="flex flex-col items-center gap-1 p-3 rounded-xl border border-gray-200 hover:border-[#7c3aed] hover:bg-purple-50 transition-all text-gray-700">
                        <span className="text-xl font-bold">{shape.icon}</span>
                        <span className="text-[10px] text-gray-500">{shape.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">Colors</p>
                  <div className="flex flex-wrap gap-1.5">
                    {COLOR_PRESETS.map((color, i) => (
                      <button key={i} onClick={() => {
                        if (selectedEl) {
                          const prop = selectedEl.type === 'shape' ? 'bgColor' : 'color';
                          commitElementUpdate(selectedEl.id, { [prop]: color });
                        }
                      }}
                        className="w-9 h-9 rounded-lg border-2 border-gray-200 hover:border-[#7c3aed] transition-all hover:scale-110"
                        style={{ background: color }}
                        title={selectedEl ? `Apply ${color} to selected` : color} />
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

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
                  <button key={opt.preset} onClick={() => addElement(opt.preset)}
                    className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-[#7c3aed] hover:bg-purple-50 transition-all group">
                    <p style={{ fontSize: opt.preset === 'heading' ? 20 : opt.preset === 'subheading' ? 16 : 14, fontWeight: opt.preset === 'heading' ? 800 : opt.preset === 'subheading' ? 600 : 400 }}
                      className="text-gray-900 group-hover:text-[#7c3aed] transition-colors">
                      {opt.label}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">{opt.desc}</p>
                  </button>
                ))}

                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">Font</p>
                  <div className="space-y-1.5">
                    {FONTS.map((font) => (
                      <button key={font} onClick={() => {
                        if (selectedEl && (selectedEl.type === 'text' || selectedEl.type === 'button')) {
                          commitElementUpdate(selectedEl.id, { fontFamily: font });
                        }
                      }}
                        className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 text-sm transition-colors ${selectedEl?.fontFamily === font ? 'bg-purple-50 text-[#7c3aed] font-medium' : 'text-gray-700'}`}
                        style={{ fontFamily: font }}>
                        {font}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

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
                <p className="text-xs text-gray-400 text-center mb-3">Click to upload images to your canvas</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-[#7c3aed] text-white text-xs font-medium rounded-lg hover:bg-[#6d28d9] transition-colors"
                >
                  Choose file
                </button>
              </div>
            </>
          )}

          {activeSidebar === 'projects' && (
            <>
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Projects</h3>
                <button onClick={() => setActiveSidebar(null)} className="p-1 rounded-md hover:bg-gray-100 text-gray-400">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3">
                {projectsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-[#7c3aed] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : projectTemplates.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-xs text-gray-400">No saved projects yet.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {projectTemplates.map((tmpl) => (
                      <button key={tmpl.id} onClick={() => {
                        navigate(`/editor/${tmpl.id}`);
                      }}
                        className="w-full text-left p-3 rounded-xl border border-gray-200 hover:border-[#7c3aed] hover:bg-purple-50 transition-all">
                        <p className="text-xs font-medium text-gray-900 truncate">{tmpl.name || 'Untitled'}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{tmpl.type || 'Design'}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

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
                      &quot;{s}&quot;
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

      {(activeSidebar || showAI) && (
        <div className="fixed inset-0 z-10" onClick={() => { setActiveSidebar(null); setShowAI(false); }} />
      )}
    </div>
  );
}
