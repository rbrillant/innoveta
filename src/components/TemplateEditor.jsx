import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from './ThemeProvider';
import { fetchTemplate, fetchTemplates, fetchTemplateImages } from '../data';
import TemplateRenderer from './TemplateRenderer';

const CANVAS_W = 800;
const CANVAS_H = 500;

const ELEMENT_DEFAULTS = {
  text: { type: 'text', content: 'Text', x: 50, y: 50, fontSize: 24, fontFamily: 'Inter', fontWeight: 400, fontStyle: 'normal', textDecoration: 'none', color: '#000000', textAlign: 'center', rotation: 0, opacity: 100, locked: false, flippedH: false, flippedV: false, width: 200, height: 40, letterSpacing: 0, lineHeight: 1.4, textTransform: 'none' },
  heading: { type: 'text', content: 'Heading', x: 50, y: 50, fontSize: 40, fontFamily: 'Inter', fontWeight: 700, fontStyle: 'normal', textDecoration: 'none', color: '#000000', textAlign: 'center', rotation: 0, opacity: 100, locked: false, flippedH: false, flippedV: false, width: 400, height: 60, letterSpacing: 0, lineHeight: 1.4, textTransform: 'none' },
  subheading: { type: 'text', content: 'Subheading', x: 50, y: 50, fontSize: 28, fontFamily: 'Inter', fontWeight: 500, fontStyle: 'normal', textDecoration: 'none', color: '#000000', textAlign: 'center', rotation: 0, opacity: 100, locked: false, flippedH: false, flippedV: false, width: 300, height: 45, letterSpacing: 0, lineHeight: 1.4, textTransform: 'none' },
  body: { type: 'text', content: 'Body text', x: 50, y: 50, fontSize: 16, fontFamily: 'Inter', fontWeight: 400, fontStyle: 'normal', textDecoration: 'none', color: '#000000', textAlign: 'center', rotation: 0, opacity: 100, locked: false, flippedH: false, flippedV: false, width: 300, height: 30, letterSpacing: 0, lineHeight: 1.4, textTransform: 'none' },
  button: { type: 'button', content: 'Button', x: 50, y: 50, fontSize: 16, fontFamily: 'Inter', fontWeight: 600, fontStyle: 'normal', textDecoration: 'none', color: '#ffffff', bgColor: '#7c3aed', rotation: 0, opacity: 100, locked: false, flippedH: false, flippedV: false, borderRadius: 8, width: 150, height: 50, borderWidth: 0, borderColor: 'transparent', boxShadow: true },
  rectangle: { type: 'shape', content: 'rectangle', x: 50, y: 50, bgColor: '#7c3aed', rotation: 0, opacity: 100, locked: false, flippedH: false, flippedV: false, borderRadius: 0, width: 200, height: 150, borderWidth: 0, borderColor: 'transparent' },
  circle: { type: 'shape', content: 'circle', x: 50, y: 50, bgColor: '#7c3aed', rotation: 0, opacity: 100, locked: false, flippedH: false, flippedV: false, width: 150, height: 150, borderWidth: 0, borderColor: 'transparent' },
  line: { type: 'shape', content: 'line', x: 50, y: 50, bgColor: '#000000', rotation: 0, opacity: 100, locked: false, flippedH: false, flippedV: false, width: 200, height: 4 },
  star: { type: 'shape', content: 'star', x: 50, y: 50, bgColor: '#eab308', rotation: 0, opacity: 100, locked: false, flippedH: false, flippedV: false, width: 100, height: 100 },
  image: { type: 'image', src: '', content: 'Image', x: 50, y: 50, rotation: 0, opacity: 100, locked: false, flippedH: false, flippedV: false, width: 200, height: 150, borderRadius: 0 },
};

function uid() { return Math.random().toString(36).slice(2, 9); }

const SIDEBAR_ITEMS = [
  { id: 'design', label: 'Design', icon: (a) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a ? '#fff' : 'currentColor'} strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg> },
  { id: 'elements', label: 'Elements', icon: (a) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a ? '#fff' : 'currentColor'} strokeWidth="1.8"><circle cx="12" cy="12" r="9" /><path d="M12 3v18M3 12h18" /></svg> },
  { id: 'text', label: 'Text', icon: (a) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a ? '#fff' : 'currentColor'} strokeWidth="1.8"><path d="M6 4h12M12 4v16M8 20h8" /></svg> },
  { id: 'uploads', label: 'Uploads', icon: (a) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a ? '#fff' : 'currentColor'} strokeWidth="1.8"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg> },
  { id: 'projects', label: 'Projects', icon: (a) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a ? '#fff' : 'currentColor'} strokeWidth="1.8"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2v11z" /></svg> },
];

const TEMPLATE_PRESETS = [
  { id: 'blank', name: 'Blank', background: { type: 'solid', color: '#ffffff' }, elements: [] },
  { id: 'dark', name: 'Dark', background: { type: 'gradient', from: '#0f172a', to: '#1e293b' }, elements: [
    { type: 'text', content: 'Dark Theme', color: '#ffffff', fontSize: 36, fontFamily: 'Inter', fontWeight: 800, fontStyle: 'normal', textDecoration: 'none', textAlign: 'center', x: 50, y: 35, width: 400, height: 60, rotation: 0, opacity: 100, locked: false, flippedH: false, flippedV: false, letterSpacing: 0, lineHeight: 1.4, textTransform: 'none' },
    { type: 'text', content: 'A sleek dark template', color: '#ffffff', fontSize: 16, fontFamily: 'Inter', fontWeight: 400, fontStyle: 'normal', textDecoration: 'none', textAlign: 'center', x: 50, y: 50, width: 300, height: 30, rotation: 0, opacity: 70, locked: false, flippedH: false, flippedV: false, letterSpacing: 0, lineHeight: 1.4, textTransform: 'none' },
    { type: 'button', content: 'Get Started', bgColor: '#7c3aed', color: '#ffffff', fontSize: 15, fontFamily: 'Inter', fontWeight: 600, fontStyle: 'normal', textDecoration: 'none', textAlign: 'center', x: 50, y: 68, width: 150, height: 50, borderRadius: 8, rotation: 0, opacity: 100, locked: false, flippedH: false, flippedV: false, borderWidth: 0, borderColor: 'transparent', boxShadow: true },
  ]},
  { id: 'vibrant', name: 'Vibrant', background: { type: 'gradient', from: '#7c3aed', to: '#ec4899' }, elements: [
    { type: 'text', content: 'Vibrant Design', color: '#ffffff', fontSize: 36, fontFamily: 'Inter', fontWeight: 800, fontStyle: 'normal', textDecoration: 'none', textAlign: 'center', x: 50, y: 35, width: 400, height: 60, rotation: 0, opacity: 100, locked: false, flippedH: false, flippedV: false, letterSpacing: 0, lineHeight: 1.4, textTransform: 'none' },
    { type: 'text', content: 'Eye-catching gradient background', color: '#ffffff', fontSize: 16, fontFamily: 'Inter', fontWeight: 400, fontStyle: 'normal', textDecoration: 'none', textAlign: 'center', x: 50, y: 50, width: 300, height: 30, rotation: 0, opacity: 85, locked: false, flippedH: false, flippedV: false, letterSpacing: 0, lineHeight: 1.4, textTransform: 'none' },
    { type: 'button', content: 'Explore', bgColor: '#ffffff', color: '#7c3aed', fontSize: 15, fontFamily: 'Inter', fontWeight: 600, fontStyle: 'normal', textDecoration: 'none', textAlign: 'center', x: 50, y: 68, width: 150, height: 50, borderRadius: 8, rotation: 0, opacity: 100, locked: false, flippedH: false, flippedV: false, borderWidth: 0, borderColor: 'transparent', boxShadow: true },
  ]},
  { id: 'coral', name: 'Coral', background: { type: 'gradient', from: '#f43f5e', to: '#fb923c' }, elements: [
    { type: 'text', content: 'Warm & Bold', color: '#ffffff', fontSize: 36, fontFamily: 'Inter', fontWeight: 800, fontStyle: 'normal', textDecoration: 'none', textAlign: 'center', x: 50, y: 35, width: 400, height: 60, rotation: 0, opacity: 100, locked: false, flippedH: false, flippedV: false, letterSpacing: 0, lineHeight: 1.4, textTransform: 'none' },
    { type: 'text', content: 'Sunset-inspired design', color: '#ffffff', fontSize: 16, fontFamily: 'Inter', fontWeight: 400, fontStyle: 'normal', textDecoration: 'none', textAlign: 'center', x: 50, y: 50, width: 300, height: 30, rotation: 0, opacity: 85, locked: false, flippedH: false, flippedV: false, letterSpacing: 0, lineHeight: 1.4, textTransform: 'none' },
    { type: 'button', content: 'Learn More', bgColor: '#ffffff', color: '#f43f5e', fontSize: 15, fontFamily: 'Inter', fontWeight: 600, fontStyle: 'normal', textDecoration: 'none', textAlign: 'center', x: 50, y: 68, width: 150, height: 50, borderRadius: 8, rotation: 0, opacity: 100, locked: false, flippedH: false, flippedV: false, borderWidth: 0, borderColor: 'transparent', boxShadow: true },
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

const FONTS = ['Inter', 'Arial', 'Georgia', 'Courier New', 'Verdana', 'Times New Roman', 'Trebuchet MS', 'Impact', 'Roboto', 'Montserrat', 'Poppins', 'Oswald', 'Raleway', 'Merriweather', 'Lora', 'Ubuntu', 'Playfair Display'];

const QUICK_ACTIONS = [
  { label: 'Add text', action: 'text', icon: 'T' },
  { label: 'Add rectangle', action: 'rectangle', icon: '▭' },
  { label: 'Add circle', action: 'circle', icon: '○' },
  { label: 'Add line', action: 'line', icon: '—' },
  { label: 'Add heading', action: 'heading', icon: 'H' },
  { label: 'Add star', action: 'star', icon: '★' },
  { label: 'Upload image', action: 'upload', icon: '↑' },
];

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
  const panningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });

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
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [quickActionsSearch, setQuickActionsSearch] = useState('');
  const [quickActionsRef, setQuickActionsRef] = useState(null);

  elementsRef.current = elements;
  const selectedEl = elements.find((e) => e.id === selectedId) || null;

  const bgStyle = (() => {
    const bg = template.canvas?.background || {};
    switch (bg.type) {
      case 'gradient': return { background: `linear-gradient(135deg, ${bg.from || '#0f172a'}, ${bg.to || '#1e293b'})` };
      case 'solid': return { background: bg.color || '#0f172a' };
      default: return { background: `linear-gradient(135deg, ${bg.from || '#0f172a'}, ${bg.to || '#1e293b'})` };
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
      .then(([t, images]) => {
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
    setShowQuickActions(false);
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

  const bringToFront = useCallback((elId) => {
    const elems = elementsRef.current;
    const idx = elems.findIndex((e) => e.id === elId);
    if (idx < elems.length - 1) {
      const el = elems[idx];
      const next = [...elems.filter((e) => e.id !== elId), el];
      setElements(next);
      pushHistory(next);
    }
  }, [pushHistory]);

  const sendToBack = useCallback((elId) => {
    const elems = elementsRef.current;
    const idx = elems.findIndex((e) => e.id === elId);
    if (idx > 0) {
      const el = elems[idx];
      const next = [el, ...elems.filter((e) => e.id !== elId)];
      setElements(next);
      pushHistory(next);
    }
  }, [pushHistory]);

  const toggleLock = useCallback((elId) => {
    const el = elementsRef.current.find((e) => e.id === elId);
    if (!el) return;
    commitElementUpdate(elId, { locked: !el.locked });
  }, [commitElementUpdate]);

  const toggleFlipH = useCallback((elId) => {
    const el = elementsRef.current.find((e) => e.id === elId);
    if (!el) return;
    commitElementUpdate(elId, { flippedH: !el.flippedH });
  }, [commitElementUpdate]);

  const toggleFlipV = useCallback((elId) => {
    const el = elementsRef.current.find((e) => e.id === elId);
    if (!el) return;
    commitElementUpdate(elId, { flippedV: !el.flippedV });
  }, [commitElementUpdate]);

  const alignText = useCallback((elId, align) => {
    commitElementUpdate(elId, { textAlign: align });
  }, [commitElementUpdate]);

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
    setShowQuickActions(false);
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
    const startY = e.clientY;
    const startW = el.width || 100;
    const startH = el.height || 50;
    const maintainAspect = e.shiftKey;
    const aspect = startW / startH;
    const onMove = (me) => {
      me.preventDefault();
      const dx = me.clientX - startX;
      const dy = me.clientY - startY;
      const updates = {};
      if (maintainAspect) {
        const delta = Math.max(dx, dy);
        updates.width = Math.max(30, startW + delta);
        updates.height = Math.max(20, startH + delta / aspect);
      } else {
        updates.width = Math.max(30, Math.min(800, startW + dx));
        updates.height = Math.max(20, Math.min(600, startH + dy));
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

  const onRotationMouseDown = useCallback((e, el) => {
    e.stopPropagation();
    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    const cx = (el.x / 100) * rect.width + rect.left;
    const cy = (el.y / 100) * rect.height + rect.top;
    const startRotation = el.rotation || 0;
    const onMove = (me) => {
      me.preventDefault();
      const angle = Math.atan2(me.clientY - cy, me.clientX - cx) * (180 / Math.PI) + 90;
      let newRotation = Math.round(angle);
      if (e.shiftKey) newRotation = Math.round(newRotation / 15) * 15;
      updateElement(el.id, { rotation: newRotation });
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
    setShowQuickActions(false);
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
      const newEl = { ...JSON.parse(JSON.stringify(ELEMENT_DEFAULTS.image)), id: uid(), src: ev.target.result, content: file.name };
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
    } catch { setProjectTemplates([]); } finally { setProjectsLoading(false); }
  }, [projectsLoading]);

  useEffect(() => {
    if (activeSidebar === 'projects' && projectTemplates.length === 0) loadProjects();
  }, [activeSidebar, projectTemplates.length, loadProjects]);

  const exportAsJSON = useCallback(() => {
    const data = { title: designName, canvas: template.canvas, elements: elements.map(({ id: _id, ...rest }) => rest), fonts: template.fonts };
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
      } else { ctx.fillStyle = bg.color || '#0f172a'; }
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      elements.forEach((el) => {
        const cx = (el.x / 100) * CANVAS_W;
        const cy = (el.y / 100) * CANVAS_H;
        ctx.globalAlpha = (el.opacity || 100) / 100;
        ctx.save();
        if (el.rotation) { ctx.translate(cx, cy); ctx.rotate((el.rotation * Math.PI) / 180); ctx.translate(-cx, -cy); }
        const scaleX = el.flippedH ? -1 : 1;
        const scaleY = el.flippedV ? -1 : 1;
        ctx.translate(cx, cy);
        ctx.scale(scaleX, scaleY);
        ctx.translate(-cx, -cy);
        if (el.type === 'text') {
          ctx.fillStyle = el.color || '#000000';
          ctx.font = `${el.fontStyle || 'normal'} ${el.textDecoration === 'underline' ? 'underline ' : ''}${el.fontWeight || 400} ${el.fontSize || 16}px ${el.fontFamily || 'Inter'}, sans-serif`;
          ctx.textAlign = el.textAlign || 'center';
          ctx.textBaseline = 'middle';
          const text = el.textTransform === 'uppercase' ? (el.content || '').toUpperCase() : el.textTransform === 'lowercase' ? (el.content || '').toLowerCase() : el.content || '';
          ctx.fillText(text, cx, cy);
        } else if (el.type === 'button') {
          const bw = el.width || 150;
          const bh = el.height || 50;
          ctx.fillStyle = el.bgColor || '#7c3aed';
          ctx.beginPath();
          ctx.roundRect(cx - bw / 2, cy - bh / 2, bw, bh, el.borderRadius || 8);
          ctx.fill();
          if (el.borderWidth > 0) { ctx.strokeStyle = el.borderColor || '#000'; ctx.lineWidth = el.borderWidth; ctx.stroke(); }
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
            if (el.borderWidth > 0) { ctx.strokeStyle = el.borderColor || '#000'; ctx.lineWidth = el.borderWidth; ctx.stroke(); }
          } else if (el.content === 'circle') {
            ctx.beginPath();
            ctx.ellipse(cx, cy, sw / 2, sh / 2, 0, 0, Math.PI * 2);
            ctx.fill();
            if (el.borderWidth > 0) { ctx.strokeStyle = el.borderColor || '#000'; ctx.lineWidth = el.borderWidth; ctx.stroke(); }
          } else if (el.content === 'line') {
            ctx.fillRect(cx - sw / 2, cy - 2, sw, 4);
          } else if (el.content === 'star') {
            const r = sw / 2;
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
              const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
              ctx[i === 0 ? 'moveTo' : 'lineTo'](cx + r * Math.cos(angle), cy + r * Math.sin(angle));
              ctx.lineTo(cx + r * 0.4 * Math.cos(angle + (2 * Math.PI) / 10), cy + r * 0.4 * Math.sin(angle + (2 * Math.PI) / 10));
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
            if (img.complete) ctx.drawImage(img, cx - iw / 2, cy - ih / 2, iw, ih);
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
    navigator.clipboard.writeText(window.location.href).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }).catch(() => {});
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isInputFocused = document.activeElement?.tagName === 'INPUT'
        || document.activeElement?.tagName === 'TEXTAREA'
        || document.activeElement?.contentEditable === 'true';
      const ctrl = e.ctrlKey || e.metaKey;

      if (showQuickActions && e.key === 'Escape') { setShowQuickActions(false); return; }

      if (ctrl && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); return; }
      if (ctrl && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo(); return; }
      if (ctrl && e.key === 'd') { e.preventDefault(); if (selectedId) duplicateElement(selectedId); return; }
      if (ctrl && e.key === 'c' && !isInputFocused) {
        if (selectedId) {
          e.preventDefault();
          clipboardRef.current = JSON.parse(JSON.stringify(elementsRef.current.find((x) => x.id === selectedId)));
        }
        return;
      }
      if (ctrl && e.key === 'v' && !isInputFocused && clipboardRef.current) {
        e.preventDefault();
        const newEl = { ...JSON.parse(JSON.stringify(clipboardRef.current)), id: uid(), x: Math.min((clipboardRef.current.x || 50) + 3, 95), y: Math.min((clipboardRef.current.y || 50) + 3, 95) };
        const next = [...elementsRef.current, newEl];
        setElements(next);
        setSelectedId(newEl.id);
        pushHistory(next);
        return;
      }
      if (ctrl && e.key === 'x' && !isInputFocused && selectedId) {
        e.preventDefault();
        clipboardRef.current = JSON.parse(JSON.stringify(elementsRef.current.find((x) => x.id === selectedId)));
        deleteElement(selectedId);
        return;
      }
      if (ctrl && e.key === 'a' && !isInputFocused) {
        e.preventDefault();
        const elems = elementsRef.current;
        if (elems.length > 0) setSelectedId(elems[elems.length - 1].id);
        return;
      }
      if (ctrl && e.key === 'b' && !isInputFocused && selectedEl) {
        e.preventDefault();
        const newWeight = (selectedEl.fontWeight || 400) >= 700 ? 400 : 700;
        commitElementUpdate(selectedEl.id, { fontWeight: newWeight });
        return;
      }
      if (ctrl && e.key === 'i' && !isInputFocused && selectedEl) {
        e.preventDefault();
        commitElementUpdate(selectedEl.id, { fontStyle: selectedEl.fontStyle === 'italic' ? 'normal' : 'italic' });
        return;
      }
      if (ctrl && e.key === 'u' && !isInputFocused && selectedEl) {
        e.preventDefault();
        commitElementUpdate(selectedEl.id, { textDecoration: selectedEl.textDecoration === 'underline' ? 'none' : 'underline' });
        return;
      }
      if (ctrl && e.key === 'k' && !isInputFocused && selectedEl) {
        e.preventDefault();
        const url = prompt('Enter URL:');
        if (url) commitElementUpdate(selectedEl.id, { link: url });
        return;
      }
      if (ctrl && e.key === ']') { e.preventDefault(); if (selectedId) bringForward(selectedId); return; }
      if (ctrl && e.key === '[') { e.preventDefault(); if (selectedId) sendBackward(selectedId); return; }
      if (ctrl && e.altKey && e.key === ']') { e.preventDefault(); if (selectedId) bringToFront(selectedId); return; }
      if (ctrl && e.altKey && e.key === '[') { e.preventDefault(); if (selectedId) sendToBack(selectedId); return; }
      if (ctrl && e.shiftKey && e.key === 'h' && selectedEl) { e.preventDefault(); toggleFlipH(selectedEl.id); return; }
      if (ctrl && e.shiftKey && e.key === 'v' && selectedEl) { e.preventDefault(); toggleFlipV(selectedEl.id); return; }
      if (ctrl && e.shiftKey && e.key === 'l' && selectedEl) { e.preventDefault(); alignText(selectedEl.id, 'left'); return; }
      if (ctrl && e.shiftKey && e.key === 'c' && selectedEl) { e.preventDefault(); alignText(selectedEl.id, 'center'); return; }
      if (ctrl && e.shiftKey && e.key === 'r' && selectedEl) { e.preventDefault(); alignText(selectedEl.id, 'right'); return; }
      if (ctrl && e.key === '=') { e.preventDefault(); setZoom((z) => Math.min(3, z + 0.1)); return; }
      if (ctrl && e.key === '-') { e.preventDefault(); setZoom((z) => Math.max(0.25, z - 0.1)); return; }
      if (ctrl && e.key === '0') { e.preventDefault(); setZoom(1); return; }
      if (ctrl && e.altKey && e.key === '0') { e.preventDefault(); setZoom(0.5); return; }

      if (e.key === 'Escape') {
        setActiveSidebar(null);
        setShowAI(false);
        setSelectedId(null);
        setEditingText(null);
        setShowDownloadMenu(false);
        setShowShareMenu(false);
        setShowQuickActions(false);
        return;
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && !isInputFocused) {
        if (selectedId && editingText === null) { e.preventDefault(); deleteElement(selectedId); }
        return;
      }
      if (e.key === ' ' && !isInputFocused) {
        e.preventDefault();
        panningRef.current = true;
        document.body.style.cursor = 'grab';
        return;
      }
      if (e.key === 'Tab' && !isInputFocused) {
        e.preventDefault();
        const elems = elementsRef.current;
        if (elems.length === 0) return;
        const currentIdx = elems.findIndex((x) => x.id === selectedId);
        const nextIdx = e.shiftKey
          ? (currentIdx <= 0 ? elems.length - 1 : currentIdx - 1)
          : (currentIdx >= elems.length - 1 ? 0 : currentIdx + 1);
        setSelectedId(elems[nextIdx].id);
        return;
      }
      if (e.key === '/' && !isInputFocused) {
        e.preventDefault();
        setShowQuickActions(true);
        setQuickActionsSearch('');
        return;
      }

      // Single key shortcuts (only when not typing and no sidebar open)
      if (!isInputFocused && !activeSidebar && !showAI && editingText === null) {
        if (e.key === 't' || e.key === 'T') { addElement('text'); return; }
        if (e.key === 'r' || e.key === 'R') { addElement('rectangle'); return; }
        if (e.key === 'c' || e.key === 'C') { addElement('circle'); return; }
        if (e.key === 'l' || e.key === 'L') { addElement('line'); return; }
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
      }
    };
    const handleKeyUp = (e) => {
      if (e.key === ' ') { panningRef.current = false; document.body.style.cursor = ''; }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); };
  }, [undo, redo, selectedId, selectedEl, editingText, deleteElement, duplicateElement, updateElement, pushHistory, bringForward, sendBackward, bringToFront, sendToBack, toggleFlipH, toggleFlipV, alignText, addElement, activeSidebar, showAI, showQuickActions]);

  // Ctrl+scroll zoom
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

  // Quick actions filter
  const filteredQuickActions = QUICK_ACTIONS.filter((a) => a.label.toLowerCase().includes(quickActionsSearch.toLowerCase()));

  const getFloatingToolbarPosition = useCallback(() => {
    if (!selectedEl || !canvasRef.current) return null;
    const rect = canvasRef.current.getBoundingClientRect();
    const elPxX = (selectedEl.x / 100) * rect.width;
    const elPxY = (selectedEl.y / 100) * rect.height;
    const elPxH = selectedEl.height || 40;
    return { x: rect.left + elPxX, y: Math.max(60, rect.top + elPxY - elPxH / 2 - 16) };
  }, [selectedEl]);

  const floatingToolbarPos = getFloatingToolbarPosition();
  const isTextType = (type) => type === 'text' || type === 'button';

  const renderElement = (el) => {
    const isSelected = el.id === selectedId;
    const isEditing = el.id === editingText;
    const opacity = (el.opacity != null ? el.opacity : 100) / 100;
    const rotation = el.rotation || 0;
    const scaleX = el.flippedH ? -1 : 1;
    const scaleY = el.flippedV ? -1 : 1;

    const baseStyle = {
      position: 'absolute',
      left: `${el.x}%`,
      top: `${el.y}%`,
      width: el.width || 'auto',
      height: el.height || 'auto',
      opacity,
      transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${scaleX}, ${scaleY})`,
      cursor: el.locked ? 'not-allowed' : 'move',
      userSelect: isEditing ? 'text' : 'none',
      outline: isSelected ? '2px solid #7c3aed' : 'none',
      outlineOffset: '3px',
      transition: 'outline 0.1s',
    };

    if (el.type === 'text') {
      const textContent = el.textTransform === 'uppercase' ? (el.content || '').toUpperCase() : el.textTransform === 'lowercase' ? (el.content || '').toLowerCase() : el.content || '';
      return (
        <div key={el.id} style={{ ...baseStyle, fontSize: el.fontSize || 16, fontFamily: el.fontFamily || 'Inter', fontWeight: el.fontWeight || 400, fontStyle: el.fontStyle || 'normal', textDecoration: el.textDecoration || 'none', color: el.color || '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: el.textAlign || 'center', lineHeight: el.lineHeight || 1.4, letterSpacing: el.letterSpacing || 0, whiteSpace: 'pre-wrap' }}
          onMouseDown={(e) => onElementMouseDown(e, el)} onDoubleClick={(e) => onElementDoubleClick(e, el)}>
          {isEditing ? (
            <div contentEditable suppressContentEditableWarning autoFocus style={{ outline: 'none', minWidth: 40 }}
              onBlur={(e) => { commitElementUpdate(el.id, { content: e.target.textContent }); setEditingText(null); }}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); e.target.blur(); } }}
            >{el.content}</div>
          ) : textContent}
          {isSelected && !isEditing && !el.locked && (
            <>
              <div onMouseDown={(e) => onResizeMouseDown(e, el)} style={{ position: 'absolute', right: -5, bottom: -5, width: 10, height: 10, background: '#7c3aed', borderRadius: 2, cursor: 'se-resize', border: '1px solid #fff' }} />
              <div onMouseDown={(e) => onRotationMouseDown(e, el)} style={{ position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'grab' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2"><path d="M23 4v6h-6M1 20v-6h6" /><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" /></svg>
              </div>
            </>
          )}
          {el.locked && isSelected && (
            <div style={{ position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)', color: '#7c3aed' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM9 8V6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9z" /></svg>
            </div>
          )}
        </div>
      );
    }

    if (el.type === 'button') {
      return (
        <div key={el.id} style={{ ...baseStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', background: el.bgColor || '#7c3aed', color: el.color || '#ffffff', borderRadius: el.borderRadius || 8, fontSize: el.fontSize || 16, fontFamily: el.fontFamily || 'Inter', fontWeight: el.fontWeight || 600, fontStyle: el.fontStyle || 'normal', textDecoration: el.textDecoration || 'none', boxShadow: el.boxShadow !== false ? '0 4px 14px rgba(0,0,0,0.25)' : 'none', border: `${el.borderWidth || 0}px solid ${el.borderColor || 'transparent'}`, whiteSpace: 'nowrap' }}
          onMouseDown={(e) => onElementMouseDown(e, el)} onDoubleClick={(e) => onElementDoubleClick(e, el)}>
          {isEditing ? (
            <div contentEditable suppressContentEditableWarning autoFocus style={{ outline: 'none', minWidth: 40 }}
              onBlur={(e) => { commitElementUpdate(el.id, { content: e.target.textContent }); setEditingText(null); }}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); } }}
            >{el.content}</div>
          ) : el.content}
          {isSelected && !isEditing && !el.locked && (
            <>
              <div onMouseDown={(e) => onResizeMouseDown(e, el)} style={{ position: 'absolute', right: -5, bottom: -5, width: 10, height: 10, background: '#7c3aed', borderRadius: 2, cursor: 'se-resize', border: '1px solid #fff' }} />
              <div onMouseDown={(e) => onRotationMouseDown(e, el)} style={{ position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'grab' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2"><path d="M23 4v6h-6M1 20v-6h6" /><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" /></svg>
              </div>
            </>
          )}
          {el.locked && isSelected && (
            <div style={{ position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)', color: '#7c3aed' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM9 8V6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9z" /></svg>
            </div>
          )}
        </div>
      );
    }

    if (el.type === 'shape') {
      let shapeStyle = { ...baseStyle };
      if (el.content === 'circle') shapeStyle = { ...shapeStyle, borderRadius: '50%', background: el.bgColor || '#7c3aed', border: `${el.borderWidth || 0}px solid ${el.borderColor || 'transparent'}` };
      else if (el.content === 'line') shapeStyle = { ...shapeStyle, height: 4, background: el.bgColor || '#000000', borderRadius: 2 };
      else if (el.content === 'star') {
        return (
          <div key={el.id} style={shapeStyle} onMouseDown={(e) => onElementMouseDown(e, el)}>
            <svg viewBox="0 0 24 24" width="100%" height="100%"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill={el.bgColor || '#eab308'} /></svg>
            {isSelected && !el.locked && (
              <>
                <div onMouseDown={(e) => onResizeMouseDown(e, el)} style={{ position: 'absolute', right: -5, bottom: -5, width: 10, height: 10, background: '#7c3aed', borderRadius: 2, cursor: 'se-resize', border: '1px solid #fff' }} />
                <div onMouseDown={(e) => onRotationMouseDown(e, el)} style={{ position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'grab' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2"><path d="M23 4v6h-6M1 20v-6h6" /><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" /></svg>
                </div>
              </>
            )}
          </div>
        );
      } else shapeStyle = { ...shapeStyle, background: el.bgColor || '#7c3aed', borderRadius: el.borderRadius || 0, border: `${el.borderWidth || 0}px solid ${el.borderColor || 'transparent'}` };

      return (
        <div key={el.id} style={shapeStyle} onMouseDown={(e) => onElementMouseDown(e, el)}>
          {isSelected && !el.locked && (
            <>
              <div onMouseDown={(e) => onResizeMouseDown(e, el)} style={{ position: 'absolute', right: -5, bottom: -5, width: 10, height: 10, background: '#7c3aed', borderRadius: 2, cursor: 'se-resize', border: '1px solid #fff' }} />
              <div onMouseDown={(e) => onRotationMouseDown(e, el)} style={{ position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'grab' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2"><path d="M23 4v6h-6M1 20v-6h6" /><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" /></svg>
              </div>
            </>
          )}
          {el.locked && isSelected && (
            <div style={{ position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)', color: '#7c3aed' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM9 8V6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9z" /></svg>
            </div>
          )}
        </div>
      );
    }

    if (el.type === 'image') {
      return (
        <div key={el.id} style={{ ...baseStyle, borderRadius: el.borderRadius || 0, overflow: 'hidden' }} onMouseDown={(e) => onElementMouseDown(e, el)}>
          {el.src ? (
            <img src={el.src} alt={el.content || 'Image'} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} draggable={false} />
          ) : (
            <div style={{ width: '100%', height: '100%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #9ca3af', color: '#6b7280', fontSize: 12, borderRadius: 4 }}>No image</div>
          )}
          {isSelected && !el.locked && (
            <>
              <div onMouseDown={(e) => onResizeMouseDown(e, el)} style={{ position: 'absolute', right: -5, bottom: -5, width: 10, height: 10, background: '#7c3aed', borderRadius: 2, cursor: 'se-resize', border: '1px solid #fff' }} />
              <div onMouseDown={(e) => onRotationMouseDown(e, el)} style={{ position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'grab' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2"><path d="M23 4v6h-6M1 20v-6h6" /><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" /></svg>
              </div>
            </>
          )}
          {el.locked && isSelected && (
            <div style={{ position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)', color: '#7c3aed' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM9 8V6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9z" /></svg>
            </div>
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
        setAiMessages((m) => [...m, { role: 'assistant', text: 'Template updated! Check the preview.' }]);
      } else { setAiMessages((m) => [...m, { role: 'assistant', text: data.error || 'Failed to process.' }]); }
    } catch { setAiMessages((m) => [...m, { role: 'assistant', text: 'Network error. Please try again.' }]); } finally { setAiLoading(false); }
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
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />

      {/* ===== TOP BAR ===== */}
      <div className="h-14 flex items-center justify-between px-4 bg-white border-b border-gray-200 shrink-0 z-30">
        <div className="flex items-center gap-3 min-w-[200px]">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors" title="Back">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          </button>
          <div className="w-8 h-8 bg-[#7c3aed] rounded-lg flex items-center justify-center"><span className="text-white text-xs font-bold">In</span></div>
          <div className="w-px h-6 bg-gray-200" />
          {designNameEditing ? (
            <input autoFocus value={designName} onChange={(e) => setDesignName(e.target.value)} onBlur={() => setDesignNameEditing(false)} onKeyDown={(e) => { if (e.key === 'Enter') setDesignNameEditing(false); }}
              className="text-sm font-medium text-gray-900 bg-gray-50 border border-gray-200 rounded-md px-2 py-1 outline-none focus:border-[#7c3aed] w-48" />
          ) : (
            <button onClick={() => setDesignNameEditing(true)} className="text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md px-2 py-1 transition-colors truncate max-w-[180px]">{designName}</button>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button onClick={undo} disabled={historyIdx <= 0} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-30 transition-colors" title="Undo (Ctrl+Z)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 10h10a5 5 0 015 5v2" /><path d="M3 10l5-5M3 10l5 5" /></svg>
          </button>
          <button onClick={redo} disabled={historyIdx >= history.length - 1} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-30 transition-colors" title="Redo (Ctrl+Shift+Z)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10H11a5 5 0 00-5 5v2" /><path d="M21 10l-5-5M21 10l-5 5" /></svg>
          </button>
        </div>

        <div className="flex items-center gap-2 min-w-[200px] justify-end">
          <button onClick={() => { setShowAI((s) => !s); if (!showAI) setActiveSidebar('ai'); else setActiveSidebar(null); }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${showAI ? 'bg-[#7c3aed] text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 01-2 2h-4a2 2 0 01-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7z" /><path d="M9 21h6" /></svg> AI
          </button>

          <div className="relative">
            <button onClick={() => { setShowShareMenu((s) => !s); setShowDownloadMenu(false); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" /></svg> Share
            </button>
            {showShareMenu && (
              <div className="absolute right-0 top-full mt-1 w-72 bg-white rounded-xl shadow-xl border border-gray-200 p-3 z-50">
                <p className="text-xs font-medium text-gray-500 mb-2">Share this design</p>
                <div className="flex items-center gap-2">
                  <input readOnly value={typeof window !== 'undefined' ? window.location.href : ''} className="flex-1 text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 outline-none" />
                  <button onClick={handleShareCopy} className="px-3 py-1.5 bg-[#7c3aed] text-white text-xs font-medium rounded-lg hover:bg-[#6d28d9] transition-colors whitespace-nowrap">{shareCopied ? 'Copied!' : 'Copy'}</button>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button onClick={() => { setShowDownloadMenu((s) => !s); setShowShareMenu(false); }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-[#7c3aed] text-white hover:bg-[#6d28d9] transition-colors shadow-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg> Download
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
            </button>
            {showDownloadMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-1 z-50">
                <button onClick={exportAsImage} className="w-full text-left px-4 py-2.5 text-xs text-gray-700 hover:bg-purple-50 hover:text-[#7c3aed] transition-colors flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg> Download PNG
                </button>
                <button onClick={exportAsJSON} className="w-full text-left px-4 py-2.5 text-xs text-gray-700 hover:bg-purple-50 hover:text-[#7c3aed] transition-colors flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6M8 13h8M8 17h8M8 9h2" /></svg> Download JSON
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== MAIN AREA ===== */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <div className="w-[60px] bg-gray-50 border-r border-gray-200 flex flex-col items-center py-2 gap-0.5 shrink-0 z-20">
          {SIDEBAR_ITEMS.map((item) => {
            const isActive = activeSidebar === item.id;
            return (
              <button key={item.id} onClick={() => { setActiveSidebar(isActive ? null : item.id); setSelectedId(null); setEditingText(null); setShowAI(false); setShowDownloadMenu(false); setShowShareMenu(false); }}
                className={`w-[52px] flex flex-col items-center gap-0.5 py-2 rounded-xl text-[10px] font-medium transition-all ${isActive ? 'bg-[#7c3aed] text-white shadow-md' : 'text-gray-500 hover:bg-gray-200 hover:text-gray-700'}`} title={item.label}>
                <span className="flex items-center justify-center w-6 h-6">{item.icon(isActive)}</span>
                <span className="leading-none">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Canvas area */}
        <div className="flex-1 flex items-center justify-center overflow-auto relative" onClick={onCanvasClick}>
          <div style={{ transform: `scale(${zoom})`, transformOrigin: 'center center', transition: 'transform 0.15s ease' }}>
            <div ref={canvasRef} className="canvas-inner"
              style={{ width: CANVAS_W, height: CANVAS_H, position: 'relative', overflow: 'hidden', borderRadius: 12, boxShadow: '0 8px 40px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)', ...bgStyle }}
              onClick={(e) => { if (e.target === canvasRef.current) onCanvasClick(e); }}>
              {elements.map(renderElement)}
              {elements.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <div className="text-white/20 mb-3"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M12 8v8M8 12h8" /></svg></div>
                    <p className="text-white/30 text-sm font-medium">Add elements from the sidebar</p>
                    <p className="text-white/20 text-xs mt-1">Press / for quick actions, or use AI</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Zoom controls */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white rounded-full shadow-lg border border-gray-200 px-1 py-1 z-20">
            <button onClick={() => setZoom((z) => Math.max(0.25, z - 0.1))} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors" title="Zoom out (Ctrl+-)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14" /></svg>
            </button>
            <button onClick={() => setZoom(1)} className="px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-full transition-colors min-w-[44px] text-center">{Math.round(zoom * 100)}%</button>
            <button onClick={() => setZoom((z) => Math.min(3, z + 0.1))} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors" title="Zoom in (Ctrl+=)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
            </button>
          </div>

          {/* Position & Size bar */}
          {selectedEl && editingText === null && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white rounded-xl shadow-lg border border-gray-200 px-3 py-1.5 z-20 text-[10px]" onClick={(e) => e.stopPropagation()}>
              <span className="text-gray-400">X</span>
              <input type="number" value={Math.round(selectedEl.x || 0)} onChange={(e) => updateElement(selectedEl.id, { x: Number(e.target.value) })} onBlur={(e) => commitElementUpdate(selectedEl.id, { x: Number(e.target.value) })}
                className="w-10 px-1 py-0.5 text-center border border-gray-200 rounded outline-none focus:border-[#7c3aed] text-gray-900" />
              <span className="text-gray-400">Y</span>
              <input type="number" value={Math.round(selectedEl.y || 0)} onChange={(e) => updateElement(selectedEl.id, { y: Number(e.target.value) })} onBlur={(e) => commitElementUpdate(selectedEl.id, { y: Number(e.target.value) })}
                className="w-10 px-1 py-0.5 text-center border border-gray-200 rounded outline-none focus:border-[#7c3aed] text-gray-900" />
              <div className="w-px h-4 bg-gray-200" />
              <span className="text-gray-400">W</span>
              <input type="number" value={Math.round(selectedEl.width || 0)} onChange={(e) => updateElement(selectedEl.id, { width: Number(e.target.value) })} onBlur={(e) => commitElementUpdate(selectedEl.id, { width: Number(e.target.value) })}
                className="w-10 px-1 py-0.5 text-center border border-gray-200 rounded outline-none focus:border-[#7c3aed] text-gray-900" />
              <span className="text-gray-400">H</span>
              <input type="number" value={Math.round(selectedEl.height || 0)} onChange={(e) => updateElement(selectedEl.id, { height: Number(e.target.value) })} onBlur={(e) => commitElementUpdate(selectedEl.id, { height: Number(e.target.value) })}
                className="w-10 px-1 py-0.5 text-center border border-gray-200 rounded outline-none focus:border-[#7c3aed] text-gray-900" />
              <div className="w-px h-4 bg-gray-200" />
              <span className="text-gray-400">↻</span>
              <input type="number" value={selectedEl.rotation || 0} onChange={(e) => updateElement(selectedEl.id, { rotation: Number(e.target.value) })} onBlur={(e) => commitElementUpdate(selectedEl.id, { rotation: Number(e.target.value) })}
                className="w-10 px-1 py-0.5 text-center border border-gray-200 rounded outline-none focus:border-[#7c3aed] text-gray-900" title="Rotation (degrees)" />
            </div>
          )}

          {/* Floating toolbar */}
          {selectedEl && floatingToolbarPos && editingText === null && (
            <div className="fixed z-50 flex items-center gap-0.5 bg-white rounded-xl shadow-xl border border-gray-200 px-2 py-1.5 max-w-[90vw] overflow-x-auto"
              style={{ left: floatingToolbarPos.x, top: floatingToolbarPos.y, transform: 'translate(-50%, -100%)' }}
              onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>

              {/* Color pickers */}
              {selectedEl.type === 'text' && (
                <div className="relative">
                  <input type="color" value={selectedEl.color || '#000000'} onChange={(e) => handleColorChange(selectedEl.id, 'color', e.target.value)} onMouseUp={(e) => handleColorChangeComplete(selectedEl.id, 'color', e.target.value)}
                    className="w-7 h-7 rounded-md cursor-pointer border-2 border-gray-200 hover:border-[#7c3aed]" title="Text color" />
                </div>
              )}
              {selectedEl.type === 'button' && (
                <>
                  <div className="relative">
                    <input type="color" value={selectedEl.bgColor || '#7c3aed'} onChange={(e) => handleColorChange(selectedEl.id, 'bgColor', e.target.value)} onMouseUp={(e) => handleColorChangeComplete(selectedEl.id, 'bgColor', e.target.value)}
                      className="w-7 h-7 rounded-md cursor-pointer border-2 border-gray-200 hover:border-[#7c3aed]" title="Button bg" />
                  </div>
                  <div className="relative">
                    <input type="color" value={selectedEl.color || '#ffffff'} onChange={(e) => handleColorChange(selectedEl.id, 'color', e.target.value)} onMouseUp={(e) => handleColorChangeComplete(selectedEl.id, 'color', e.target.value)}
                      className="w-7 h-7 rounded-md cursor-pointer border-2 border-gray-200 hover:border-[#7c3aed]" title="Text color" />
                  </div>
                </>
              )}
              {selectedEl.type === 'shape' && (
                <div className="relative">
                  <input type="color" value={selectedEl.bgColor || '#7c3aed'} onChange={(e) => handleColorChange(selectedEl.id, 'bgColor', e.target.value)} onMouseUp={(e) => handleColorChangeComplete(selectedEl.id, 'bgColor', e.target.value)}
                    className="w-7 h-7 rounded-md cursor-pointer border-2 border-gray-200 hover:border-[#7c3aed]" title="Shape color" />
                </div>
              )}
              {selectedEl.type === 'image' && (
                <div className="relative">
                  <input type="color" value={'#ffffff'} onChange={(e) => {}}
                    className="w-7 h-7 rounded-md cursor-pointer border-2 border-gray-200 opacity-30" title="No color for images" disabled />
                </div>
              )}

              <div className="w-px h-5 bg-gray-200 mx-0.5" />

              {/* Font size */}
              {isTextType(selectedEl.type) && (
                <input type="number" min="8" max="200" value={selectedEl.fontSize || 16}
                  onChange={(e) => updateElement(selectedEl.id, { fontSize: Number(e.target.value) })}
                  onBlur={(e) => commitElementUpdate(selectedEl.id, { fontSize: Number(e.target.value) })}
                  className="w-10 px-1 py-1 text-xs text-center border border-gray-200 rounded-md outline-none focus:border-[#7c3aed]" title="Font size" />
              )}

              {/* Bold, Italic, Underline */}
              {isTextType(selectedEl.type) && (
                <>
                  <button onClick={() => commitElementUpdate(selectedEl.id, { fontWeight: (selectedEl.fontWeight || 400) >= 700 ? 400 : 700 })}
                    className={`w-7 h-7 flex items-center justify-center rounded-md text-xs font-bold transition-colors ${(selectedEl.fontWeight || 400) >= 700 ? 'bg-[#7c3aed] text-white' : 'hover:bg-gray-100 text-gray-600'}`} title="Bold (Ctrl+B)">B</button>
                  <button onClick={() => commitElementUpdate(selectedEl.id, { fontStyle: selectedEl.fontStyle === 'italic' ? 'normal' : 'italic' })}
                    className={`w-7 h-7 flex items-center justify-center rounded-md text-xs italic transition-colors ${selectedEl.fontStyle === 'italic' ? 'bg-[#7c3aed] text-white' : 'hover:bg-gray-100 text-gray-600'}`} title="Italic (Ctrl+I)">I</button>
                  <button onClick={() => commitElementUpdate(selectedEl.id, { textDecoration: selectedEl.textDecoration === 'underline' ? 'none' : 'underline' })}
                    className={`w-7 h-7 flex items-center justify-center rounded-md text-xs underline transition-colors ${selectedEl.textDecoration === 'underline' ? 'bg-[#7c3aed] text-white' : 'hover:bg-gray-100 text-gray-600'}`} title="Underline (Ctrl+U)">U</button>
                  <div className="w-px h-5 bg-gray-200 mx-0.5" />
                  {/* Alignment */}
                  <button onClick={() => alignText(selectedEl.id, selectedEl.textAlign === 'left' ? 'center' : selectedEl.textAlign === 'center' ? 'right' : 'left')}
                    className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-500 transition-colors" title="Text align">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      {selectedEl.textAlign === 'left' && <><path d="M17 10H3M21 6H3M21 14H3M17 18H3" /></>}
                      {selectedEl.textAlign === 'right' && <><path d="M21 10H7M21 6H3M21 14H3M21 18H7" /></>}
                      {(selectedEl.textAlign === 'center' || !selectedEl.textAlign) && <><path d="M18 10H6M21 6H3M21 14H3M18 18H6" /></>}
                    </svg>
                  </button>
                  <div className="w-px h-5 bg-gray-200 mx-0.5" />
                </>
              )}

              {/* Opacity */}
              <div className="flex items-center gap-1 px-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400"><circle cx="12" cy="12" r="10" /><path d="M12 2a10 10 0 0110 10" fill="currentColor" opacity="0.3" /></svg>
                <input type="range" min="0" max="100" value={selectedEl.opacity != null ? selectedEl.opacity : 100}
                  onChange={(e) => updateElement(selectedEl.id, { opacity: Number(e.target.value) })}
                  onMouseUp={(e) => commitElementUpdate(selectedEl.id, { opacity: Number(e.target.value) })}
                  className="w-16 h-1 accent-[#7c3aed]" title={`Opacity: ${selectedEl.opacity ?? 100}%`} />
                <span className="text-[10px] text-gray-500 w-6 text-right">{selectedEl.opacity ?? 100}%</span>
              </div>

              <div className="w-px h-5 bg-gray-200 mx-0.5" />

              {/* Layer order */}
              <button onClick={() => bringForward(selectedEl.id)} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-500 transition-colors" title="Bring forward (Ctrl+])">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 11v8h14v-8M12 3v12" /></svg>
              </button>
              <button onClick={() => sendBackward(selectedEl.id)} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-500 transition-colors" title="Send backward (Ctrl+[)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 13v8H5v-8M12 21V9" /></svg>
              </button>

              <div className="w-px h-5 bg-gray-200 mx-0.5" />

              {/* Flip */}
              <button onClick={() => toggleFlipH(selectedEl.id)} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-500 transition-colors" title="Flip horizontal (Ctrl+Shift+H)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3H5a2 2 0 00-2 2v14a2 2 0 002 2h3M16 3h3a2 2 0 012 2v14a2 2 0 01-2 2h-3" /><path d="M12 20V4" /></svg>
              </button>
              <button onClick={() => toggleFlipV(selectedEl.id)} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-500 transition-colors" title="Flip vertical (Ctrl+Shift+V)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 8V5a2 2 0 012-2h14a2 2 0 012 2v3M3 16v3a2 2 0 002 2h14a2 2 0 002-2v-3" /><path d="M4 12h16" /></svg>
              </button>

              <div className="w-px h-5 bg-gray-200 mx-0.5" />

              {/* Lock */}
              <button onClick={() => toggleLock(selectedEl.id)} className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${selectedEl.locked ? 'bg-red-50 text-red-500' : 'hover:bg-gray-100 text-gray-500'}`} title={selectedEl.locked ? 'Unlock (Alt+Shift+U)' : 'Lock (Alt+Shift+L)'}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill={selectedEl.locked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                  {selectedEl.locked
                    ? <path d="M7 11V7a5 5 0 0110 0v4M5 11h14a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7a2 2 0 012-2z" />
                    : <><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></>}
                </svg>
              </button>

              <div className="w-px h-5 bg-gray-200 mx-0.5" />

              {/* Duplicate & Delete */}
              <button onClick={() => duplicateElement(selectedEl.id)} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-500 transition-colors" title="Duplicate (Ctrl+D)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
              </button>
              <button onClick={() => deleteElement(selectedEl.id)} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors" title="Delete (Del)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ===== SIDEBAR PANELS ===== */}
      {activeSidebar && !showAI && (
        <div className="absolute left-[60px] top-14 bottom-0 w-[280px] bg-white border-r border-gray-200 shadow-xl z-20 flex flex-col overflow-hidden">
          {activeSidebar === 'design' && (
            <>
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Design</h3>
                <button onClick={() => setActiveSidebar(null)} className="p-1 rounded-md hover:bg-gray-100 text-gray-400"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg></button>
              </div>
              <div className="flex-1 overflow-y-auto p-3">
                <p className="text-xs font-medium text-gray-500 mb-3">Templates</p>
                <div className="grid grid-cols-2 gap-2">
                  {TEMPLATE_PRESETS.map((preset) => (
                    <button key={preset.id} onClick={() => applyTemplatePreset(preset)} className="group relative rounded-xl overflow-hidden border border-gray-200 hover:border-[#7c3aed] transition-all hover:shadow-md aspect-[16/10]">
                      <div className="absolute inset-0" style={{ background: preset.background.type === 'gradient' ? `linear-gradient(135deg, ${preset.background.from}, ${preset.background.to})` : preset.background.color }} />
                      <div className="absolute inset-0 flex items-end p-2"><span className="text-[10px] font-medium text-white drop-shadow-sm">{preset.name}</span></div>
                    </button>
                  ))}
                </div>
                <div className="mt-4">
                  <p className="text-xs font-medium text-gray-500 mb-2">Background</p>
                  <div className="grid grid-cols-4 gap-1.5">
                    {BG_PRESETS.map((bg, i) => (
                      <button key={i} onClick={() => setTemplate((t) => ({ ...t, canvas: { ...t.canvas, background: { type: 'gradient', from: bg.from, to: bg.to } } }))}
                        className="h-10 rounded-lg border border-gray-200 hover:border-[#7c3aed] transition-all hover:shadow-sm" style={{ background: `linear-gradient(135deg, ${bg.from}, ${bg.to})` }} title={bg.label} />
                    ))}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <input type="color" value={template.canvas?.background?.from || '#0f172a'} onChange={(e) => setTemplate((t) => ({ ...t, canvas: { ...t.canvas, background: { type: 'gradient', from: e.target.value, to: t.canvas?.background?.to || '#1e293b' } } }))}
                      className="w-8 h-8 rounded-md cursor-pointer border border-gray-200" title="Gradient start" />
                    <input type="color" value={template.canvas?.background?.to || '#1e293b'} onChange={(e) => setTemplate((t) => ({ ...t, canvas: { ...t.canvas, background: { type: 'gradient', from: t.canvas?.background?.from || '#0f172a', to: e.target.value } } }))}
                      className="w-8 h-8 rounded-md cursor-pointer border border-gray-200" title="Gradient end" />
                    <span className="text-[10px] text-gray-400">Custom</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeSidebar === 'elements' && (
            <>
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Elements</h3>
                <button onClick={() => setActiveSidebar(null)} className="p-1 rounded-md hover:bg-gray-100 text-gray-400"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg></button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">Shapes</p>
                  <div className="grid grid-cols-2 gap-2">
                    {ELEMENT_SHAPES.map((shape) => (
                      <button key={shape.preset} onClick={() => addElement(shape.preset)} className="flex flex-col items-center gap-1 p-3 rounded-xl border border-gray-200 hover:border-[#7c3aed] hover:bg-purple-50 transition-all text-gray-700">
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
                      <button key={i} onClick={() => { if (selectedEl) { const prop = selectedEl.type === 'shape' || selectedEl.type === 'button' ? 'bgColor' : 'color'; commitElementUpdate(selectedEl.id, { [prop]: color }); } }}
                        className="w-9 h-9 rounded-lg border-2 border-gray-200 hover:border-[#7c3aed] transition-all hover:scale-110" style={{ background: color }} title={selectedEl ? `Apply to selected` : color} />
                    ))}
                  </div>
                </div>
                {selectedEl && (selectedEl.type === 'shape' || selectedEl.type === 'button') && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2">Border</p>
                    <div className="flex items-center gap-2">
                      <input type="range" min="0" max="20" value={selectedEl.borderWidth || 0}
                        onChange={(e) => updateElement(selectedEl.id, { borderWidth: Number(e.target.value) })}
                        onMouseUp={(e) => commitElementUpdate(selectedEl.id, { borderWidth: Number(e.target.value) })}
                        className="flex-1 h-1 accent-[#7c3aed]" />
                      <span className="text-[10px] text-gray-500 w-6">{selectedEl.borderWidth || 0}px</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <input type="color" value={selectedEl.borderColor || '#000000'} onChange={(e) => handleColorChange(selectedEl.id, 'borderColor', e.target.value)}
                        onMouseUp={(e) => handleColorChangeComplete(selectedEl.id, 'borderColor', e.target.value)}
                        className="w-7 h-7 rounded-md cursor-pointer border border-gray-200" title="Border color" />
                      <span className="text-[10px] text-gray-400">Border color</span>
                    </div>
                  </div>
                )}
                {selectedEl && selectedEl.type === 'shape' && selectedEl.content === 'rectangle' && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2">Corner radius</p>
                    <div className="flex items-center gap-2">
                      <input type="range" min="0" max="100" value={selectedEl.borderRadius || 0}
                        onChange={(e) => updateElement(selectedEl.id, { borderRadius: Number(e.target.value) })}
                        onMouseUp={(e) => commitElementUpdate(selectedEl.id, { borderRadius: Number(e.target.value) })}
                        className="flex-1 h-1 accent-[#7c3aed]" />
                      <span className="text-[10px] text-gray-500 w-6">{selectedEl.borderRadius || 0}px</span>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {activeSidebar === 'text' && (
            <>
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Text</h3>
                <button onClick={() => setActiveSidebar(null)} className="p-1 rounded-md hover:bg-gray-100 text-gray-400"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg></button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {TEXT_OPTIONS.map((opt) => (
                  <button key={opt.preset} onClick={() => addElement(opt.preset)} className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-[#7c3aed] hover:bg-purple-50 transition-all group">
                    <p style={{ fontSize: opt.preset === 'heading' ? 20 : opt.preset === 'subheading' ? 16 : 14, fontWeight: opt.preset === 'heading' ? 800 : opt.preset === 'subheading' ? 600 : 400 }}
                      className="text-gray-900 group-hover:text-[#7c3aed] transition-colors">{opt.label}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{opt.desc}</p>
                  </button>
                ))}
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">Font</p>
                  <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                    {FONTS.map((font) => (
                      <button key={font} onClick={() => { if (selectedEl && isTextType(selectedEl.type)) commitElementUpdate(selectedEl.id, { fontFamily: font }); }}
                        className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 text-sm transition-colors ${selectedEl?.fontFamily === font ? 'bg-purple-50 text-[#7c3aed] font-medium' : 'text-gray-700'}`}
                        style={{ fontFamily: font }}>{font}</button>
                    ))}
                  </div>
                </div>
                {selectedEl && isTextType(selectedEl.type) && (
                  <>
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-2">Letter spacing</p>
                      <div className="flex items-center gap-2">
                        <input type="range" min="-5" max="20" step="0.5" value={selectedEl.letterSpacing || 0}
                          onChange={(e) => updateElement(selectedEl.id, { letterSpacing: Number(e.target.value) })}
                          onMouseUp={(e) => commitElementUpdate(selectedEl.id, { letterSpacing: Number(e.target.value) })}
                          className="flex-1 h-1 accent-[#7c3aed]" />
                        <span className="text-[10px] text-gray-500 w-8">{selectedEl.letterSpacing || 0}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-2">Line height</p>
                      <div className="flex items-center gap-2">
                        <input type="range" min="0.8" max="3" step="0.1" value={selectedEl.lineHeight || 1.4}
                          onChange={(e) => updateElement(selectedEl.id, { lineHeight: Number(e.target.value) })}
                          onMouseUp={(e) => commitElementUpdate(selectedEl.id, { lineHeight: Number(e.target.value) })}
                          className="flex-1 h-1 accent-[#7c3aed]" />
                        <span className="text-[10px] text-gray-500 w-8">{selectedEl.lineHeight || 1.4}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-2">Text case</p>
                      <div className="flex gap-1">
                        {['none', 'uppercase', 'lowercase'].map((tc) => (
                          <button key={tc} onClick={() => commitElementUpdate(selectedEl.id, { textTransform: tc })}
                            className={`flex-1 py-1.5 text-[10px] rounded-lg border transition-colors ${selectedEl.textTransform === tc ? 'bg-[#7c3aed] text-white border-[#7c3aed]' : 'border-gray-200 text-gray-600 hover:border-[#7c3aed]'}`}>
                            {tc === 'none' ? 'Aa' : tc === 'uppercase' ? 'AA' : 'aa'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          {activeSidebar === 'uploads' && (
            <>
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Uploads</h3>
                <button onClick={() => setActiveSidebar(null)} className="p-1 rounded-md hover:bg-gray-100 text-gray-400"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg></button>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center px-4">
                <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center mb-3">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg>
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1">Upload files</p>
                <p className="text-xs text-gray-400 text-center mb-3">Click to upload images to your canvas</p>
                <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-[#7c3aed] text-white text-xs font-medium rounded-lg hover:bg-[#6d28d9] transition-colors">Choose file</button>
              </div>
            </>
          )}

          {activeSidebar === 'projects' && (
            <>
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Projects</h3>
                <button onClick={() => setActiveSidebar(null)} className="p-1 rounded-md hover:bg-gray-100 text-gray-400"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg></button>
              </div>
              <div className="flex-1 overflow-y-auto p-3">
                {projectsLoading ? (
                  <div className="flex items-center justify-center py-8"><div className="w-6 h-6 border-2 border-[#7c3aed] border-t-transparent rounded-full animate-spin" /></div>
                ) : projectTemplates.length === 0 ? (
                  <div className="text-center py-8"><p className="text-xs text-gray-400">No saved projects yet.</p></div>
                ) : (
                  <div className="space-y-2">
                    {projectTemplates.map((tmpl) => (
                      <button key={tmpl.id} onClick={() => navigate(`/editor/${tmpl.id}`)} className="w-full text-left p-3 rounded-xl border border-gray-200 hover:border-[#7c3aed] hover:bg-purple-50 transition-all">
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

      {/* ===== AI PANEL ===== */}
      {showAI && (
        <div className="absolute right-0 top-14 bottom-0 w-[320px] bg-white border-l border-gray-200 shadow-xl z-20 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-[#7c3aed] rounded-lg flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 01-2 2h-4a2 2 0 01-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7z" /><path d="M9 21h6" /></svg>
              </div>
              <div><h3 className="text-sm font-semibold text-gray-900">AI Assistant</h3><p className="text-[10px] text-gray-400">Powered by Gemini</p></div>
            </div>
            <button onClick={() => { setShowAI(false); setActiveSidebar(null); }} className="p-1 rounded-md hover:bg-gray-100 text-gray-400"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {aiMessages.length === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-purple-50 rounded-2xl flex items-center justify-center">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.5"><path d="M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 01-2 2h-4a2 2 0 01-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7z" /><path d="M9 21h6" /></svg>
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1">How can I help?</p>
                <p className="text-xs text-gray-400 mb-4">Ask me to change colors, text, layout...</p>
                <div className="space-y-1.5">
                  {['Make the background blue', 'Change title to "Hello World"', 'Make it more modern', 'Change all text to white'].map((s) => (
                    <button key={s} onClick={() => { setAiInput(s); aiInputRef.current?.focus(); }}
                      className="block w-full text-left text-xs px-3 py-2.5 rounded-xl bg-gray-50 text-gray-600 hover:bg-purple-50 hover:text-[#7c3aed] transition-colors border border-gray-100 hover:border-purple-200">&quot;{s}&quot;</button>
                  ))}
                </div>
              </div>
            )}
            {aiMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3 py-2.5 rounded-2xl text-xs leading-relaxed ${msg.role === 'user' ? 'bg-[#7c3aed] text-white rounded-br-md' : 'bg-gray-100 text-gray-700 rounded-bl-md'}`}>{msg.text}</div>
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
              <input ref={aiInputRef} value={aiInput} onChange={(e) => setAiInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendToAI()}
                placeholder="Describe changes..." className="flex-1 px-3 py-2.5 rounded-xl text-xs outline-none border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/20 transition-all" disabled={aiLoading} />
              <button onClick={sendToAI} disabled={!aiInput.trim() || aiLoading} className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#7c3aed] text-white hover:bg-[#6d28d9] disabled:opacity-40 transition-all shadow-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== QUICK ACTIONS (/) ===== */}
      {showQuickActions && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" onClick={() => setShowQuickActions(false)}>
          <div ref={setQuickActionsRef} className="w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
                <input autoFocus value={quickActionsSearch} onChange={(e) => setQuickActionsSearch(e.target.value)} placeholder="Search actions..."
                  className="flex-1 text-sm outline-none text-gray-900 placeholder:text-gray-400" />
                <kbd className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">ESC</kbd>
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto py-1">
              {filteredQuickActions.map((action) => (
                <button key={action.action} onClick={() => {
                  if (action.action === 'upload') { fileInputRef.current?.click(); }
                  else { addElement(action.action); }
                  setShowQuickActions(false);
                }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-purple-50 transition-colors">
                  <span className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg text-sm font-bold text-gray-600">{action.icon}</span>
                  <span className="text-sm text-gray-700">{action.label}</span>
                </button>
              ))}
              {filteredQuickActions.length === 0 && (
                <p className="text-center text-xs text-gray-400 py-4">No matching actions</p>
              )}
            </div>
          </div>
        </div>
      )}

      {(activeSidebar || showAI) && !showQuickActions && (
        <div className="fixed inset-0 z-10" onClick={() => { setActiveSidebar(null); setShowAI(false); }} />
      )}
    </div>
  );
}