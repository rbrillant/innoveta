import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from './ThemeProvider';
import { fetchTemplate, fetchTemplates, fetchTemplateImages } from '../data';
import TemplateRenderer from './TemplateRenderer';

const CANVAS_W = 800;
const CANVAS_H = 500;

const ANIM_DEFAULT = { type: 'none', duration: 500, delay: 0, easing: 'ease' };
const BOX_SHADOW_DEFAULT = { enabled: false, color: '#000000', blur: 10, offsetX: 0, offsetY: 4, spread: 0 };
const GRADIENT_TEXT_DEFAULT = { enabled: false, from: '#7c3aed', to: '#ec4899', angle: 0 };

const ELEMENT_DEFAULTS = {
  text: { type: 'text', content: 'Text', x: 50, y: 50, fontSize: 24, fontFamily: 'Inter', fontWeight: 400, fontStyle: 'normal', textDecoration: 'none', color: '#000000', textAlign: 'center', rotation: 0, opacity: 100, locked: false, flippedH: false, flippedV: false, width: 200, height: 40, letterSpacing: 0, lineHeight: 1.4, textTransform: 'none', groupId: null, textShadow: { enabled: false, color: '#000000', blur: 4, offsetX: 2, offsetY: 2 }, textStroke: { enabled: false, color: '#000000', width: 1 }, animation: { ...ANIM_DEFAULT }, curve: 0, gradientText: { ...GRADIENT_TEXT_DEFAULT }, boxShadow: { ...BOX_SHADOW_DEFAULT }, borderStyle: 'solid' },
  heading: { type: 'text', content: 'Heading', x: 50, y: 50, fontSize: 40, fontFamily: 'Inter', fontWeight: 700, fontStyle: 'normal', textDecoration: 'none', color: '#000000', textAlign: 'center', rotation: 0, opacity: 100, locked: false, flippedH: false, flippedV: false, width: 400, height: 60, letterSpacing: 0, lineHeight: 1.4, textTransform: 'none', groupId: null, textShadow: { enabled: false, color: '#000000', blur: 4, offsetX: 2, offsetY: 2 }, textStroke: { enabled: false, color: '#000000', width: 1 }, animation: { ...ANIM_DEFAULT }, curve: 0, gradientText: { ...GRADIENT_TEXT_DEFAULT }, boxShadow: { ...BOX_SHADOW_DEFAULT }, borderStyle: 'solid' },
  subheading: { type: 'text', content: 'Subheading', x: 50, y: 50, fontSize: 28, fontFamily: 'Inter', fontWeight: 500, fontStyle: 'normal', textDecoration: 'none', color: '#000000', textAlign: 'center', rotation: 0, opacity: 100, locked: false, flippedH: false, flippedV: false, width: 300, height: 45, letterSpacing: 0, lineHeight: 1.4, textTransform: 'none', groupId: null, textShadow: { enabled: false, color: '#000000', blur: 4, offsetX: 2, offsetY: 2 }, textStroke: { enabled: false, color: '#000000', width: 1 }, animation: { ...ANIM_DEFAULT }, curve: 0, gradientText: { ...GRADIENT_TEXT_DEFAULT }, boxShadow: { ...BOX_SHADOW_DEFAULT }, borderStyle: 'solid' },
  body: { type: 'text', content: 'Body text', x: 50, y: 50, fontSize: 16, fontFamily: 'Inter', fontWeight: 400, fontStyle: 'normal', textDecoration: 'none', color: '#000000', textAlign: 'center', rotation: 0, opacity: 100, locked: false, flippedH: false, flippedV: false, width: 300, height: 30, letterSpacing: 0, lineHeight: 1.4, textTransform: 'none', groupId: null, textShadow: { enabled: false, color: '#000000', blur: 4, offsetX: 2, offsetY: 2 }, textStroke: { enabled: false, color: '#000000', width: 1 }, animation: { ...ANIM_DEFAULT }, curve: 0, gradientText: { ...GRADIENT_TEXT_DEFAULT }, boxShadow: { ...BOX_SHADOW_DEFAULT }, borderStyle: 'solid' },
  button: { type: 'button', content: 'Button', x: 50, y: 50, fontSize: 16, fontFamily: 'Inter', fontWeight: 600, fontStyle: 'normal', textDecoration: 'none', color: '#ffffff', bgColor: '#7c3aed', rotation: 0, opacity: 100, locked: false, flippedH: false, flippedV: false, borderRadius: 8, width: 150, height: 50, borderWidth: 0, borderColor: 'transparent', groupId: null, animation: { ...ANIM_DEFAULT }, boxShadow: { ...BOX_SHADOW_DEFAULT }, borderStyle: 'solid' },
  rectangle: { type: 'shape', content: 'rectangle', x: 50, y: 50, bgColor: '#7c3aed', rotation: 0, opacity: 100, locked: false, flippedH: false, flippedV: false, borderRadius: 0, width: 200, height: 150, borderWidth: 0, borderColor: 'transparent', groupId: null, animation: { ...ANIM_DEFAULT }, boxShadow: { ...BOX_SHADOW_DEFAULT }, borderStyle: 'solid' },
  circle: { type: 'shape', content: 'circle', x: 50, y: 50, bgColor: '#7c3aed', rotation: 0, opacity: 100, locked: false, flippedH: false, flippedV: false, width: 150, height: 150, borderWidth: 0, borderColor: 'transparent', groupId: null, animation: { ...ANIM_DEFAULT }, boxShadow: { ...BOX_SHADOW_DEFAULT }, borderStyle: 'solid' },
  line: { type: 'shape', content: 'line', x: 50, y: 50, bgColor: '#000000', rotation: 0, opacity: 100, locked: false, flippedH: false, flippedV: false, width: 200, height: 4, groupId: null, animation: { ...ANIM_DEFAULT }, boxShadow: { ...BOX_SHADOW_DEFAULT }, borderStyle: 'solid' },
  star: { type: 'shape', content: 'star', x: 50, y: 50, bgColor: '#eab308', rotation: 0, opacity: 100, locked: false, flippedH: false, flippedV: false, width: 100, height: 100, groupId: null, animation: { ...ANIM_DEFAULT }, boxShadow: { ...BOX_SHADOW_DEFAULT }, borderStyle: 'solid' },
  diamond: { type: 'shape', content: 'diamond', x: 50, y: 50, bgColor: '#7c3aed', rotation: 0, opacity: 100, locked: false, flippedH: false, flippedV: false, width: 150, height: 150, borderWidth: 0, borderColor: 'transparent', groupId: null, animation: { ...ANIM_DEFAULT }, boxShadow: { ...BOX_SHADOW_DEFAULT }, borderStyle: 'solid' },
  hexagon: { type: 'shape', content: 'hexagon', x: 50, y: 50, bgColor: '#38bdf8', rotation: 0, opacity: 100, locked: false, flippedH: false, flippedV: false, width: 150, height: 150, borderWidth: 0, borderColor: 'transparent', groupId: null, animation: { ...ANIM_DEFAULT }, boxShadow: { ...BOX_SHADOW_DEFAULT }, borderStyle: 'solid' },
  'arrow-right': { type: 'shape', content: 'arrow-right', x: 50, y: 50, bgColor: '#ec4899', rotation: 0, opacity: 100, locked: false, flippedH: false, flippedV: false, width: 150, height: 100, borderWidth: 0, borderColor: 'transparent', groupId: null, animation: { ...ANIM_DEFAULT }, boxShadow: { ...BOX_SHADOW_DEFAULT }, borderStyle: 'solid' },
  heart: { type: 'shape', content: 'heart', x: 50, y: 50, bgColor: '#f43f5e', rotation: 0, opacity: 100, locked: false, flippedH: false, flippedV: false, width: 120, height: 120, borderWidth: 0, borderColor: 'transparent', groupId: null, animation: { ...ANIM_DEFAULT }, boxShadow: { ...BOX_SHADOW_DEFAULT }, borderStyle: 'solid' },
  cloud: { type: 'shape', content: 'cloud', x: 50, y: 50, bgColor: '#e5e7eb', rotation: 0, opacity: 100, locked: false, flippedH: false, flippedV: false, width: 180, height: 120, borderWidth: 0, borderColor: 'transparent', groupId: null, animation: { ...ANIM_DEFAULT }, boxShadow: { ...BOX_SHADOW_DEFAULT }, borderStyle: 'solid' },
  'speech-bubble': { type: 'shape', content: 'speech-bubble', x: 50, y: 50, bgColor: '#ffffff', rotation: 0, opacity: 100, locked: false, flippedH: false, flippedV: false, width: 180, height: 140, borderWidth: 0, borderColor: 'transparent', groupId: null, animation: { ...ANIM_DEFAULT }, boxShadow: { ...BOX_SHADOW_DEFAULT }, borderStyle: 'solid' },
  pentagon: { type: 'shape', content: 'pentagon', x: 50, y: 50, bgColor: '#34d399', rotation: 0, opacity: 100, locked: false, flippedH: false, flippedV: false, width: 150, height: 150, borderWidth: 0, borderColor: 'transparent', groupId: null, animation: { ...ANIM_DEFAULT }, boxShadow: { ...BOX_SHADOW_DEFAULT }, borderStyle: 'solid' },
  octagon: { type: 'shape', content: 'octagon', x: 50, y: 50, bgColor: '#fbbf24', rotation: 0, opacity: 100, locked: false, flippedH: false, flippedV: false, width: 150, height: 150, borderWidth: 0, borderColor: 'transparent', groupId: null, animation: { ...ANIM_DEFAULT }, boxShadow: { ...BOX_SHADOW_DEFAULT }, borderStyle: 'solid' },
  image: { type: 'image', src: '', content: 'Image', x: 50, y: 50, rotation: 0, opacity: 100, locked: false, flippedH: false, flippedV: false, width: 200, height: 150, borderRadius: 0, groupId: null, filter: { brightness: 100, contrast: 100, saturate: 100, blur: 0, grayscale: 0, sepia: 0, hueRotate: 0 }, animation: { ...ANIM_DEFAULT }, boxShadow: { ...BOX_SHADOW_DEFAULT }, borderStyle: 'solid', crop: null },
  table: { type: 'table', content: 'Table', x: 50, y: 50, rows: 3, cols: 3, cellData: [['Header 1','Header 2','Header 3'],['Cell 1','Cell 2','Cell 3'],['Cell 4','Cell 5','Cell 6']], cellColor: '#ffffff', headerColor: '#f3f4f6', borderColor: '#d1d5db', bgColor: '#ffffff', rotation: 0, opacity: 100, locked: false, flippedH: false, flippedV: false, width: 360, height: 180, groupId: null, animation: { ...ANIM_DEFAULT }, boxShadow: { ...BOX_SHADOW_DEFAULT }, borderStyle: 'solid' },
  frame: { type: 'frame', content: 'Frame', x: 50, y: 50, shape: 'circle', frameImage: null, rotation: 0, opacity: 100, locked: false, flippedH: false, flippedV: false, width: 150, height: 150, groupId: null, animation: { ...ANIM_DEFAULT }, boxShadow: { ...BOX_SHADOW_DEFAULT }, borderStyle: 'solid' },
  chart: { type: 'chart', chartType: 'bar', x: 50, y: 50, width: 300, height: 200, rotation: 0, opacity: 100, locked: false, flippedH: false, flippedV: false, groupId: null, data: { labels: ['A','B','C','D'], values: [30,60,45,80] }, colors: ['#7c3aed','#38bdf8','#ec4899','#fbbf24'], bgColor: '#ffffff', borderColor: '#d1d5db', animation: { ...ANIM_DEFAULT }, boxShadow: { ...BOX_SHADOW_DEFAULT }, borderStyle: 'solid' },
  pieChart: { type: 'chart', chartType: 'pie', x: 50, y: 50, width: 250, height: 250, rotation: 0, opacity: 100, locked: false, flippedH: false, flippedV: false, groupId: null, data: { labels: ['A','B','C','D'], values: [30,60,45,80] }, colors: ['#7c3aed','#38bdf8','#ec4899','#fbbf24'], bgColor: '#ffffff', borderColor: '#d1d5db', animation: { ...ANIM_DEFAULT }, boxShadow: { ...BOX_SHADOW_DEFAULT }, borderStyle: 'solid' },
  lineChart: { type: 'chart', chartType: 'line', x: 50, y: 50, width: 300, height: 200, rotation: 0, opacity: 100, locked: false, flippedH: false, flippedV: false, groupId: null, data: { labels: ['A','B','C','D'], values: [30,60,45,80] }, colors: ['#7c3aed','#38bdf8','#ec4899','#fbbf24'], bgColor: '#ffffff', borderColor: '#d1d5db', animation: { ...ANIM_DEFAULT }, boxShadow: { ...BOX_SHADOW_DEFAULT }, borderStyle: 'solid' },
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

const SHAPES_EXTENDED = [
  { preset: 'diamond', label: 'Diamond', icon: '◆' },
  { preset: 'hexagon', label: 'Hexagon', icon: '⬡' },
  { preset: 'arrow-right', label: 'Arrow', icon: '→' },
  { preset: 'heart', label: 'Heart', icon: '♥' },
  { preset: 'cloud', label: 'Cloud', icon: '☁' },
  { preset: 'speech-bubble', label: 'Speech', icon: '💬' },
  { preset: 'pentagon', label: 'Pentagon', icon: '⬠' },
  { preset: 'octagon', label: 'Octagon', icon: '🛑' },
];

const ANIMATION_OPTIONS = [
  { type: 'none', label: 'None' },
  { type: 'fadeIn', label: 'Fade In' },
  { type: 'slideInLeft', label: 'Slide Left' },
  { type: 'slideInRight', label: 'Slide Right' },
  { type: 'slideInUp', label: 'Slide Up' },
  { type: 'slideInDown', label: 'Slide Down' },
  { type: 'bounceIn', label: 'Bounce' },
  { type: 'zoomIn', label: 'Zoom In' },
  { type: 'rotateIn', label: 'Rotate In' },
  { type: 'flipIn', label: 'Flip In' },
  { type: 'pulse', label: 'Pulse' },
  { type: 'wiggle', label: 'Wiggle' },
  { type: 'pop', label: 'Pop' },
  { type: 'rise', label: 'Rise' },
];

const EMOJI_LIST = ['😀','😂','❤️','🔥','⭐','💯','👍','🎉','✨','🚀','💰','🎨','📸','💡','🎯','🏆','💪','🌟','💎','🌈','🎶','🍕','☕','🎂','🎈','📌','🔑','⚡','🦄','🌺','🍀','☀️','🌙','❄️','🎵','📱','💻','🎮','⚽','🏀','🎾','🎪','🎭','🎬','🎤','🎧','📢','📝','📊','📈','🗓️','✉️','📎','✂️','🖊️','🔍','🔧','⚙️','🏠','✈️','🌍','🗺️','⏰','⏳','🎁','🎊','🥇','🎖️'];

const CHART_PRESETS = [
  { preset: 'chart', label: 'Bar Chart', icon: '📊' },
  { preset: 'pieChart', label: 'Pie Chart', icon: '🥧' },
  { preset: 'lineChart', label: 'Line Chart', icon: '📈' },
];

const FRAME_SHAPES = [
  { shape: 'circle', label: 'Circle', icon: '⊙' },
  { shape: 'rectangle', label: 'Rectangle', icon: '☐' },
  { shape: 'triangle', label: 'Triangle', icon: '△' },
  { shape: 'heart', label: 'Heart', icon: '♥' },
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
  { label: 'Add table', action: 'table', icon: '▦' },
  { label: 'Add frame', action: 'frame', icon: '◎' },
  { label: 'Upload image', action: 'upload', icon: '↑' },
];

const INITIAL_TEMPLATE = {
  title: 'Untitled Design',
  pages: [{
    id: 'page-1',
    background: { type: 'gradient', from: '#0f172a', to: '#1e293b' },
    elements: [],
  }],
  currentPageIdx: 0,
  fonts: { heading: 'Inter', body: 'Inter' },
  aiPrompt: '',
};

const DEFAULT_IMAGE_FILTER = { brightness: 100, contrast: 100, saturate: 100, blur: 0, grayscale: 0, sepia: 0, hueRotate: 0 };
const DEFAULT_TEXT_SHADOW = { enabled: false, color: '#000000', blur: 4, offsetX: 2, offsetY: 2 };
const DEFAULT_TEXT_STROKE = { enabled: false, color: '#000000', width: 1 };

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

  const [pages, setPages] = useState([{ id: 'page-1', background: { type: 'gradient', from: '#0f172a', to: '#1e293b' }, elements: [] }]);
  const [currentPageIdx, setCurrentPageIdx] = useState(0);
  const [elements, setElements] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeGuides, setActiveGuides] = useState([]);
  const [showRulers, setShowRulers] = useState(false);
  const [showPresentMode, setShowPresentMode] = useState(false);
  const [presentPageIdx, setPresentPageIdx] = useState(0);
  const [editingTableCell, setEditingTableCell] = useState(null);
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
  const [contextMenu, setContextMenu] = useState(null);
  const [showAlignPanel, setShowAlignPanel] = useState(false);
  const [copiedStyle, setCopiedStyle] = useState(null);
  const [showGrid, setShowGrid] = useState(false);
  const [customGuides, setCustomGuides] = useState([]);
  const [cropImage, setCropImage] = useState(null);
  const [extractedColors, setExtractedColors] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAnimPanel, setShowAnimPanel] = useState(false);

  const pagesRef = useRef(pages);

  elementsRef.current = elements;
  pagesRef.current = pages;
  const selectedEls = elements.filter((e) => selectedIds.includes(e.id));
  const selectedEl = selectedEls[0] || null;

  const bgStyle = (() => {
    const page = pages[currentPageIdx];
    const bg = page?.background || {};
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
      setSelectedIds([]);
      setEditingText(null);
    }
  }, [historyIdx, history]);

  const redo = useCallback(() => {
    if (historyIdx < history.length - 1) {
      setHistoryIdx((i) => i + 1);
      setElements(JSON.parse(JSON.stringify(history[historyIdx + 1])));
      setSelectedIds([]);
      setEditingText(null);
    }
  }, [historyIdx, history]);

  const saveCurrentPage = useCallback(() => {
    setPages((prev) => prev.map((p, i) => i === currentPageIdx ? { ...p, elements: JSON.parse(JSON.stringify(elementsRef.current)) } : p));
  }, [currentPageIdx]);

  const switchPage = useCallback((idx) => {
    if (idx === currentPageIdx || idx < 0 || idx >= pagesRef.current.length) return;
    const updatedPages = pagesRef.current.map((p, i) => i === currentPageIdx ? { ...p, elements: JSON.parse(JSON.stringify(elementsRef.current)) } : p);
    setPages(updatedPages);
    const targetPage = updatedPages[idx];
    const newElements = targetPage?.elements ? JSON.parse(JSON.stringify(targetPage.elements)) : [];
    setElements(newElements);
    setCurrentPageIdx(idx);
    setSelectedIds([]);
    setEditingText(null);
    setHistory([JSON.parse(JSON.stringify(newElements))]);
    setHistoryIdx(0);
  }, [currentPageIdx]);

  const addPage = useCallback(() => {
    const newPage = { id: uid(), background: { type: 'solid', color: '#ffffff' }, elements: [] };
    const updatedPages = pagesRef.current.map((p, i) => i === currentPageIdx ? { ...p, elements: JSON.parse(JSON.stringify(elementsRef.current)) } : p);
    setPages([...updatedPages, newPage]);
    const newIdx = updatedPages.length;
    setElements([]);
    setCurrentPageIdx(newIdx);
    setSelectedIds([]);
  }, [currentPageIdx]);

  const duplicatePage = useCallback((idx) => {
    const src = pagesRef.current[idx];
    if (!src) return;
    if (idx === currentPageIdx) saveCurrentPage();
    const copy = { ...JSON.parse(JSON.stringify(src)), id: uid() };
    setPages((prev) => { const n = [...prev]; n.splice(idx + 1, 0, copy); return n; });
  }, [currentPageIdx, saveCurrentPage]);

  const deletePage = useCallback((idx) => {
    if (pagesRef.current.length <= 1) return;
    if (idx === currentPageIdx) {
      const newIdx = Math.max(0, idx - 1);
      const saved = pagesRef.current.map((p, i) => i === currentPageIdx ? { ...p, elements: JSON.parse(JSON.stringify(elementsRef.current)) } : p);
      const filtered = saved.filter((_, i) => i !== idx);
      setPages(filtered);
      const target = filtered[newIdx];
      setElements(target?.elements ? JSON.parse(JSON.stringify(target.elements)) : []);
      setCurrentPageIdx(newIdx);
      setSelectedIds([]);
    } else {
      setPages((prev) => prev.filter((_, i) => i !== idx));
      if (idx < currentPageIdx) setCurrentPageIdx((i) => i - 1);
    }
  }, [currentPageIdx]);

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
          const page = { id: uid(), background: t.background || pages[0]?.background || { type: 'gradient', from: '#0f172a', to: '#1e293b' }, elements: loadedElements };
          setPages([page]);
          setElements(loadedElements);
          setCurrentPageIdx(0);
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
    setSelectedIds([newEl.id]);
    pushHistory(next);
    setActiveSidebar(null);
    setShowQuickActions(false);
  }, [pushHistory]);

  const deleteSelected = useCallback(() => {
    if (selectedIds.length === 0) return;
    const next = elementsRef.current.filter((el) => !selectedIds.includes(el.id));
    setElements(next);
    setSelectedIds([]);
    setEditingText(null);
    pushHistory(next);
  }, [selectedIds, pushHistory]);

  const duplicateSelected = useCallback(() => {
    if (selectedIds.length === 0) return;
    const newEls = selectedIds.map((sid) => {
      const el = elementsRef.current.find((e) => e.id === sid);
      if (!el) return null;
      return { ...JSON.parse(JSON.stringify(el)), id: uid(), x: Math.min((el.x || 50) + 3, 95), y: Math.min((el.y || 50) + 3, 95) };
    }).filter(Boolean);
    const next = [...elementsRef.current, ...newEls];
    setElements(next);
    setSelectedIds(newEls.map((e) => e.id));
    pushHistory(next);
  }, [selectedIds, pushHistory]);

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

  const groupSelected = useCallback(() => {
    if (selectedIds.length < 2) return;
    const gid = uid();
    const next = elementsRef.current.map((el) => selectedIds.includes(el.id) ? { ...el, groupId: gid } : el);
    setElements(next);
    pushHistory(next);
  }, [selectedIds, pushHistory]);

  const ungroupSelected = useCallback(() => {
    if (selectedIds.length === 0) return;
    const next = elementsRef.current.map((el) => selectedIds.includes(el.id) ? { ...el, groupId: null } : el);
    setElements(next);
    pushHistory(next);
  }, [selectedIds, pushHistory]);

  const applyTemplatePreset = useCallback((preset) => {
    const newElements = preset.elements.map((el) => ({ ...JSON.parse(JSON.stringify(el)), id: uid() }));
    const page = { id: uid(), background: preset.background, elements: newElements };
    setPages([page]);
    setElements(newElements);
    setCurrentPageIdx(0);
    setSelectedIds([]);
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
    let newIds;
    if (e.shiftKey) {
      newIds = selectedIds.includes(el.id) ? selectedIds.filter((id) => id !== el.id) : [...selectedIds, el.id];
    } else {
      const clickedGroup = el.groupId;
      if (clickedGroup) {
        newIds = elementsRef.current.filter((x) => x.groupId === clickedGroup).map((x) => x.id);
      } else {
        newIds = [el.id];
      }
    }
    setSelectedIds(newIds);
    setEditingText(null);
    setActiveSidebar(null);
    setShowDownloadMenu(false);
    setShowShareMenu(false);
    setShowQuickActions(false);
    const startCoords = getCanvasCoords(e);
    const startPositions = newIds.map((sid) => {
      const sel = elementsRef.current.find((x) => x.id === sid);
      return { id: sid, x: sel?.x || 50, y: sel?.y || 50 };
    });
    const onMove = (me) => {
      me.preventDefault();
      const cur = getCanvasCoords(me);
      const dx = cur.x - startCoords.x;
      const dy = cur.y - startCoords.y;
      let lastGuides = [];
      const updates = startPositions.map((sp) => {
        let nx = Math.max(0, Math.min(100, sp.x + dx));
        let ny = Math.max(0, Math.min(100, sp.y + dy));
        if (sp.id === newIds[newIds.length - 1]) {
          const SNAP = 1.5;
          const guides = [];
          if (Math.abs(nx - 50) < SNAP) { guides.push({ type: 'v', pos: 50 }); nx = 50; }
          if (Math.abs(ny - 50) < SNAP) { guides.push({ type: 'h', pos: 50 }); ny = 50; }
          elementsRef.current.filter((e) => !newIds.includes(e.id)).forEach((other) => {
            if (Math.abs(nx - other.x) < SNAP) { guides.push({ type: 'v', pos: other.x }); nx = other.x; }
            if (Math.abs(ny - other.y) < SNAP) { guides.push({ type: 'h', pos: other.y }); ny = other.y; }
          });
          customGuides.forEach((cg) => {
            if (Math.abs(nx - cg.pos) < SNAP) { guides.push({ type: cg.type, pos: cg.pos }); nx = cg.pos; }
            if (Math.abs(ny - cg.pos) < SNAP) { guides.push({ type: cg.type, pos: cg.pos }); ny = cg.pos; }
          });
          lastGuides = guides;
        }
        return [sp.id, { x: nx, y: ny }];
      });
      setActiveGuides(lastGuides);
      setElements((prev) => {
        const map = new Map(updates);
        return prev.map((e) => map.has(e.id) ? { ...e, ...map.get(e.id) } : e);
      });
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      setActiveGuides([]);
      pushHistory(elementsRef.current);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [editingText, selectedIds, getCanvasCoords, pushHistory, customGuides]);

  const onResizeMouseDown = useCallback((e, el, handle) => {
    e.stopPropagation();
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = el.width || 100;
    const startH = el.height || 50;
    const startXPos = el.x || 50;
    const startYPos = el.y || 50;
    const maintainAspect = e.shiftKey;
    const aspect = startW / startH;
    const h = handle || 'se';
    const onMove = (me) => {
      me.preventDefault();
      const dx = me.clientX - startX;
      const dy = me.clientY - startY;
      const updates = {};
      if (h === 'se' || h === 'e' || h === 's') {
        if (maintainAspect && (h === 'se')) {
          const delta = Math.max(dx, dy);
          updates.width = Math.max(30, startW + delta);
          updates.height = Math.max(20, startH + delta / aspect);
        } else {
          if (h !== 's') updates.width = Math.max(30, Math.min(800, startW + dx));
          if (h !== 'e') updates.height = Math.max(20, Math.min(600, startH + dy));
        }
      }
      if (h === 'nw' || h === 'n' || h === 'ne') {
        if (h !== 's' && h !== 'se' && h !== 'sw') {
          updates.height = Math.max(20, startH - dy);
        }
      }
      if (h === 'nw' || h === 'w' || h === 'sw') {
        if (h !== 'e' && h !== 'ne' && h !== 'se') {
          updates.width = Math.max(30, startW - dx);
        }
      }
      if (h === 'nw') { updates.x = startXPos + dx * 0.05; updates.y = startYPos + dy * 0.05; }
      if (h === 'n') { updates.y = startYPos + dy * 0.05; }
      if (h === 'ne') { updates.y = startYPos + dy * 0.05; }
      if (h === 'w') { updates.x = startXPos + dx * 0.05; }
      if (h === 'sw') { updates.x = startXPos + dx * 0.05; }
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
      setSelectedIds([]);
      setEditingText(null);
      setActiveSidebar(null);
    }
    setShowDownloadMenu(false);
    setShowShareMenu(false);
    setShowQuickActions(false);
    setContextMenu(null);
    setShowEmojiPicker(false);
  }, []);

  const onElementDoubleClick = useCallback((e, el) => {
    e.stopPropagation();
    if (el.type === 'text' || el.type === 'button') {
      if (el.locked) return;
      setEditingText(el.id);
      setSelectedIds([el.id]);
    }
  }, []);

  const handleFileUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target.result;
      const newEl = { ...JSON.parse(JSON.stringify(ELEMENT_DEFAULTS.image)), id: uid(), src, content: file.name };
      const next = [...elementsRef.current, newEl];
      setElements(next);
      setSelectedIds([newEl.id]);
      pushHistory(next);
      setActiveSidebar(null);
      extractColorsFromImage(src).then((colors) => setExtractedColors(colors));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }, [pushHistory, extractColorsFromImage]);

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
    saveCurrentPage();
    const data = { title: designName, pages: pagesRef.current, fonts: { heading: 'Inter', body: 'Inter' } };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${designName.replace(/\s+/g, '-').toLowerCase() || 'template'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowDownloadMenu(false);
  }, [designName, saveCurrentPage]);

  const exportAsImage = useCallback(async () => {
    try {
      const el = canvasRef.current;
      if (!el) { alert('No canvas to export.'); return; }
      const canvas = document.createElement('canvas');
      canvas.width = CANVAS_W * 2;
      canvas.height = CANVAS_H * 2;
      const ctx = canvas.getContext('2d');
      ctx.scale(2, 2);
      const bg = pages[currentPageIdx]?.background || {};
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
  }, [pages, currentPageIdx, elements]);

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

      if (showPresentMode) {
        if (e.key === 'Escape') { setShowPresentMode(false); return; }
        if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); setPresentPageIdx((i) => Math.min(pagesRef.current.length - 1, i + 1)); return; }
        if (e.key === 'ArrowLeft') { e.preventDefault(); setPresentPageIdx((i) => Math.max(0, i - 1)); return; }
        return;
      }

      if (showQuickActions && e.key === 'Escape') { setShowQuickActions(false); return; }

      if (ctrl && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); return; }
      if (ctrl && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo(); return; }
      if (ctrl && e.key === 'd') { e.preventDefault(); duplicateSelected(); return; }
      if (ctrl && e.key === 'g' && !e.shiftKey) { e.preventDefault(); groupSelected(); return; }
      if (ctrl && e.shiftKey && e.key === 'G') { e.preventDefault(); ungroupSelected(); return; }
      if (ctrl && e.key === 'r' && !isInputFocused) { e.preventDefault(); setShowRulers((v) => !v); return; }
      if (e.key === 'F5') { e.preventDefault(); setShowPresentMode(true); setPresentPageIdx(currentPageIdx); return; }
      if (ctrl && e.key === 'c' && !isInputFocused) {
        if (selectedIds.length > 0) {
          e.preventDefault();
          clipboardRef.current = JSON.parse(JSON.stringify(elementsRef.current.filter((x) => selectedIds.includes(x.id))));
        }
        return;
      }
      if (ctrl && e.key === 'v' && !isInputFocused && clipboardRef.current) {
        e.preventDefault();
        const clipItems = Array.isArray(clipboardRef.current) ? clipboardRef.current : [clipboardRef.current];
        const newEls = clipItems.map((item) => ({ ...JSON.parse(JSON.stringify(item)), id: uid(), x: Math.min((item.x || 50) + 3, 95), y: Math.min((item.y || 50) + 3, 95) }));
        const next = [...elementsRef.current, ...newEls];
        setElements(next);
        setSelectedIds(newEls.map((e) => e.id));
        pushHistory(next);
        return;
      }
      if (ctrl && e.key === 'x' && !isInputFocused && selectedIds.length > 0) {
        e.preventDefault();
        clipboardRef.current = JSON.parse(JSON.stringify(elementsRef.current.filter((x) => selectedIds.includes(x.id))));
        deleteSelected();
        return;
      }
      if (ctrl && e.key === 'a' && !isInputFocused) {
        e.preventDefault();
        const allIds = elementsRef.current.map((x) => x.id);
        setSelectedIds(allIds);
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
      if (ctrl && e.key === ']') { e.preventDefault(); if (selectedIds.length > 0) bringForward(selectedIds[selectedIds.length - 1]); return; }
      if (ctrl && e.key === '[') { e.preventDefault(); if (selectedIds.length > 0) sendBackward(selectedIds[selectedIds.length - 1]); return; }
      if (ctrl && e.altKey && e.key === ']') { e.preventDefault(); if (selectedIds.length > 0) bringToFront(selectedIds[selectedIds.length - 1]); return; }
      if (ctrl && e.altKey && e.key === '[') { e.preventDefault(); if (selectedIds.length > 0) sendToBack(selectedIds[selectedIds.length - 1]); return; }
      if (ctrl && e.shiftKey && e.key === 'h' && selectedEl) { e.preventDefault(); toggleFlipH(selectedEl.id); return; }
      if (ctrl && e.shiftKey && e.key === 'v' && selectedEl) { e.preventDefault(); toggleFlipV(selectedEl.id); return; }
      if (ctrl && e.shiftKey && e.key === 'l' && selectedEl) { e.preventDefault(); alignText(selectedEl.id, 'left'); return; }
      if (ctrl && e.shiftKey && e.key === 'C' && selectedEl && !isInputFocused) { e.preventDefault(); copyStyle(); return; }
      if (ctrl && e.shiftKey && e.key === 'V' && selectedEl && !isInputFocused) { e.preventDefault(); pasteStyle(); return; }
      if (ctrl && e.key === '\'' ) { e.preventDefault(); setShowGrid((v) => !v); return; }
      if (ctrl && e.shiftKey && e.key === 'c' && selectedEl && !isInputFocused) { e.preventDefault(); alignText(selectedEl.id, 'center'); return; }
      if (ctrl && e.shiftKey && e.key === 'r' && selectedEl) { e.preventDefault(); alignText(selectedEl.id, 'right'); return; }
      if (ctrl && e.key === '=') { e.preventDefault(); setZoom((z) => Math.min(3, z + 0.1)); return; }
      if (ctrl && e.key === '-') { e.preventDefault(); setZoom((z) => Math.max(0.25, z - 0.1)); return; }
      if (ctrl && e.key === '0') { e.preventDefault(); setZoom(1); return; }
      if (ctrl && e.altKey && e.key === '0') { e.preventDefault(); setZoom(0.5); return; }

      if (e.key === 'Escape') {
        setActiveSidebar(null);
        setShowAI(false);
        setSelectedIds([]);
        setEditingText(null);
        setEditingTableCell(null);
        setShowDownloadMenu(false);
        setShowShareMenu(false);
        setShowQuickActions(false);
        setContextMenu(null);
        setShowEmojiPicker(false);
        setShowAnimPanel(false);
        return;
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && !isInputFocused) {
        if (selectedIds.length > 0 && editingText === null && !editingTableCell) { e.preventDefault(); deleteSelected(); }
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
        const currentIdx = selectedIds.length > 0 ? elems.findIndex((x) => x.id === selectedIds[selectedIds.length - 1]) : -1;
        const nextIdx = e.shiftKey
          ? (currentIdx <= 0 ? elems.length - 1 : currentIdx - 1)
          : (currentIdx >= elems.length - 1 ? 0 : currentIdx + 1);
        setSelectedIds([elems[nextIdx].id]);
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
        if (selectedIds.length > 0) {
          e.preventDefault();
          const step = e.shiftKey ? 1 : 0.3;
          const updates = {};
          selectedIds.forEach((sid) => {
            const el = elementsRef.current.find((x) => x.id === sid);
            if (!el || el.locked) return;
            if (e.key === 'ArrowUp') updates[sid] = { y: Math.max(0, (el.y || 50) - step) };
            if (e.key === 'ArrowDown') updates[sid] = { y: Math.min(100, (el.y || 50) + step) };
            if (e.key === 'ArrowLeft') updates[sid] = { x: Math.max(0, (el.x || 50) - step) };
            if (e.key === 'ArrowRight') updates[sid] = { x: Math.min(100, (el.x || 50) + step) };
          });
          setElements((prev) => prev.map((el) => updates[el.id] ? { ...el, ...updates[el.id] } : el));
        }
      }
    };
    const handleKeyUp = (e) => {
      if (e.key === ' ') { panningRef.current = false; document.body.style.cursor = ''; }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); };
  }, [undo, redo, selectedIds, selectedEl, editingText, editingTableCell, deleteSelected, duplicateSelected, groupSelected, ungroupSelected, updateElement, pushHistory, bringForward, sendBackward, bringToFront, sendToBack, toggleFlipH, toggleFlipV, alignText, addElement, activeSidebar, showAI, showQuickActions, showPresentMode, currentPageIdx, copyStyle, pasteStyle]);

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

  const buildTextStyle = (el) => {
    const s = {};
    if (el.textShadow?.enabled) {
      s.textShadow = `${el.textShadow.offsetX || 0}px ${el.textShadow.offsetY || 0}px ${el.textShadow.blur || 0}px ${el.textShadow.color || '#000000'}`;
    }
    if (el.textStroke?.enabled) {
      s.WebkitTextStroke = `${el.textStroke.width || 1}px ${el.textStroke.color || '#000000'}`;
    }
    return s;
  };

  const buildImageFilterStyle = (el) => {
    if (!el.filter) return {};
    const f = el.filter;
    return { filter: `brightness(${f.brightness}%) contrast(${f.contrast}%) saturate(${f.saturate}%) blur(${f.blur}px) grayscale(${f.grayscale}%) sepia(${f.sepia}%) hue-rotate(${f.hueRotate}deg)` };
  };

  const updateTableData = useCallback((elId, row, col, value) => {
    setElements((prev) => prev.map((el) => {
      if (el.id !== elId) return el;
      const newCellData = el.cellData.map((r) => [...r]);
      if (newCellData[row]) newCellData[row][col] = value;
      return { ...el, cellData: newCellData };
    }));
  }, []);

  const commitTableUpdate = useCallback((elId) => {
    pushHistory(elementsRef.current);
  }, [pushHistory]);

  const addTableRow = useCallback((elId) => {
    const el = elementsRef.current.find((e) => e.id === elId);
    if (!el || el.rows >= 20) return;
    const newRow = new Array(el.cols).fill('');
    commitElementUpdate(elId, { rows: el.rows + 1, cellData: [...el.cellData, newRow], height: (el.height || 180) + 40 });
  }, [commitElementUpdate]);

  const addTableCol = useCallback((elId) => {
    const el = elementsRef.current.find((e) => e.id === elId);
    if (!el || el.cols >= 10) return;
    commitElementUpdate(elId, { cols: el.cols + 1, cellData: el.cellData.map((r) => [...r, '']), width: (el.width || 360) + 100 });
  }, [commitElementUpdate]);

  const removeTableRow = useCallback((elId) => {
    const el = elementsRef.current.find((e) => e.id === elId);
    if (!el || el.rows <= 1) return;
    commitElementUpdate(elId, { rows: el.rows - 1, cellData: el.cellData.slice(0, -1), height: Math.max(60, (el.height || 180) - 40) });
  }, [commitElementUpdate]);

  const removeTableCol = useCallback((elId) => {
    const el = elementsRef.current.find((e) => e.id === elId);
    if (!el || el.cols <= 1) return;
    commitElementUpdate(elId, { cols: el.cols - 1, cellData: el.cellData.map((r) => r.slice(0, -1)), width: Math.max(100, (el.width || 360) - 100) });
  }, [commitElementUpdate]);

  const alignElements = useCallback((align) => {
    if (selectedIds.length < 2) return;
    const els = selectedIds.map(id => elementsRef.current.find(e => e.id === id)).filter(Boolean);
    let updates = [];
    switch(align) {
      case 'left': { const minX = Math.min(...els.map(e => e.x)); updates = els.map(e => [e.id, { x: minX }]); break; }
      case 'center-h': { const avgX = els.reduce((s,e) => s + (e.x||50), 0) / els.length; updates = els.map(e => [e.id, { x: avgX }]); break; }
      case 'right': { const maxX = Math.max(...els.map(e => e.x)); updates = els.map(e => [e.id, { x: maxX }]); break; }
      case 'top': { const minY = Math.min(...els.map(e => e.y)); updates = els.map(e => [e.id, { y: minY }]); break; }
      case 'center-v': { const avgY = els.reduce((s,e) => s + (e.y||50), 0) / els.length; updates = els.map(e => [e.id, { y: avgY }]); break; }
      case 'bottom': { const maxY = Math.max(...els.map(e => e.y)); updates = els.map(e => [e.id, { y: maxY }]); break; }
      case 'dist-h': { const sorted = [...els].sort((a,b) => (a.x||50) - (b.x||50)); const step = 100 / (sorted.length + 1); updates = sorted.map((e,i) => [e.id, { x: step * (i+1) }]); break; }
      case 'dist-v': { const sorted = [...els].sort((a,b) => (a.y||50) - (b.y||50)); const step = 100 / (sorted.length + 1); updates = sorted.map((e,i) => [e.id, { y: step * (i+1) }]); break; }
      default: break;
    }
    if (updates.length > 0) {
      const map = new Map(updates);
      const next = elementsRef.current.map(e => map.has(e.id) ? { ...e, ...map.get(e.id) } : e);
      setElements(next);
      pushHistory(next);
    }
  }, [selectedIds, pushHistory]);

  const copyStyle = useCallback(() => {
    if (!selectedEl) return;
    const { id, x, y, width, height, content, src, cellData, frameImage, ...styleProps } = selectedEl;
    setCopiedStyle(styleProps);
  }, [selectedEl]);

  const pasteStyle = useCallback(() => {
    if (!selectedEl || !copiedStyle) return;
    const next = elementsRef.current.map(e => {
      if (e.id === selectedEl.id) return { ...e, ...copiedStyle };
      return e;
    });
    setElements(next);
    pushHistory(next);
  }, [selectedEl, copiedStyle, pushHistory]);

  const extractColorsFromImage = useCallback((src) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = src;
      img.onload = () => {
        const cvs = document.createElement('canvas');
        cvs.width = 50;
        cvs.height = 50;
        const ctx = cvs.getContext('2d');
        ctx.drawImage(img, 0, 0, 50, 50);
        const data = ctx.getImageData(0, 0, 50, 50).data;
        const colors = {};
        for (let i = 0; i < data.length; i += 16) {
          const r = Math.round(data[i] / 32) * 32;
          const g = Math.round(data[i+1] / 32) * 32;
          const b = Math.round(data[i+2] / 32) * 32;
          const key = `${r},${g},${b}`;
          colors[key] = (colors[key] || 0) + 1;
        }
        const sorted = Object.entries(colors).sort((a,b) => b[1] - a[1]).slice(0, 6);
        resolve(sorted.map(([key]) => {
          const [rr,gg,bb] = key.split(',').map(Number);
          return `#${rr.toString(16).padStart(2,'0')}${gg.toString(16).padStart(2,'0')}${bb.toString(16).padStart(2,'0')}`;
        }));
      };
      img.onerror = () => resolve([]);
    });
  }, []);

  const exportAsPDF = useCallback(() => {
    saveCurrentPage();
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    let html = '<html><head><title>' + designName + '</title><style>@page{margin:0;}body{margin:0;} .page{width:800px;height:500px;position:relative;overflow:hidden;margin:10px auto;page-break-after:always;} img{max-width:100%;} </style></head><body>';
    pagesRef.current.forEach((page) => {
      const bg = page.background || {};
      const bgStyle = bg.type === 'gradient' ? `background:linear-gradient(135deg,${bg.from || '#0f172a'},${bg.to || '#1e293b'})` : `background:${bg.color || '#0f172a'}`;
      html += `<div class="page" style="${bgStyle}">`;
      (page.elements || []).forEach((el) => {
        const cx = (el.x / 100) * 800;
        const cy = (el.y / 100) * 500;
        const absStyle = `position:absolute;left:${cx - (el.width || 100)/2}px;top:${cy - (el.height || 40)/2}px;width:${el.width || 'auto'};height:${el.height || 'auto'};opacity:${(el.opacity||100)/100};transform:rotate(${el.rotation||0}deg)`;
        if (el.type === 'text' || el.type === 'button') {
          html += `<div style="${absStyle};font-size:${el.fontSize||16}px;font-family:${el.fontFamily||'Inter'},sans-serif;font-weight:${el.fontWeight||400};color:${el.color||'#000'};text-align:${el.textAlign||'center'};background:${el.type==='button'?(el.bgColor||'transparent'):''};border-radius:${el.borderRadius||0}px;padding:4px">${el.content||''}</div>`;
        } else if (el.type === 'image' && el.src) {
          html += `<img src="${el.src}" style="${absStyle};border-radius:${el.borderRadius||0}px" />`;
        } else if (el.type === 'shape') {
          html += `<div style="${absStyle};background:${el.bgColor||'#7c3aed'};border-radius:${el.content==='circle'?'50%':(el.borderRadius||0)}px"></div>`;
        }
      });
      html += '</div>';
    });
    html += '</body></html>';
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 500);
    setShowDownloadMenu(false);
  }, [designName, saveCurrentPage]);

  const handleContextMenu = useCallback((e, el) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, elementId: el?.id || null });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const contextMenuAction = useCallback((action) => {
    const targetId = contextMenu?.elementId;
    closeContextMenu();
    if (!targetId && action !== 'paste') return;
    const el = elementsRef.current.find(e => e.id === targetId);
    switch (action) {
      case 'cut':
        clipboardRef.current = JSON.parse(JSON.stringify(elementsRef.current.filter(x => selectedIds.includes(x.id))));
        deleteSelected();
        break;
      case 'copy':
        clipboardRef.current = JSON.parse(JSON.stringify(elementsRef.current.filter(x => selectedIds.includes(x.id))));
        break;
      case 'paste':
        if (clipboardRef.current) {
          const clipItems = Array.isArray(clipboardRef.current) ? clipboardRef.current : [clipboardRef.current];
          const newEls = clipItems.map(item => ({ ...JSON.parse(JSON.stringify(item)), id: uid(), x: Math.min((item.x||50)+3, 95), y: Math.min((item.y||50)+3, 95) }));
          const next = [...elementsRef.current, ...newEls];
          setElements(next);
          setSelectedIds(newEls.map(e => e.id));
          pushHistory(next);
        }
        break;
      case 'duplicate':
        if (targetId) { setSelectedIds([targetId]); duplicateSelected(); }
        break;
      case 'delete':
        if (targetId) { setSelectedIds([targetId]); deleteSelected(); }
        break;
      case 'bringForward': if (el) bringForward(el.id); break;
      case 'sendBackward': if (el) sendBackward(el.id); break;
      case 'bringToFront': if (el) bringToFront(el.id); break;
      case 'sendToBack': if (el) sendToBack(el.id); break;
      case 'lock': if (el) toggleLock(el.id); break;
      case 'group': groupSelected(); break;
      case 'ungroup': ungroupSelected(); break;
      case 'copyStyle': if (el) { setSelectedIds([el.id]); setTimeout(() => copyStyle(), 0); } break;
      case 'pasteStyle': pasteStyle(); break;
      default: break;
    }
  }, [contextMenu, selectedIds, closeContextMenu, deleteSelected, duplicateSelected, bringForward, sendBackward, bringToFront, sendToBack, toggleLock, groupSelected, ungroupSelected, copyStyle, pasteStyle, pushHistory]);

  const getFrameClipPath = (shape) => {
    switch (shape) {
      case 'circle': return 'circle(50% at 50% 50%)';
      case 'triangle': return 'polygon(50% 0%, 0% 100%, 100% 100%)';
      case 'heart': return 'path("M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z")';
      default: return 'none';
    }
  };

  const renderElement = (el) => {
    const isSelected = selectedIds.includes(el.id);
    const isEditing = el.id === editingText;
    const opacity = (el.opacity != null ? el.opacity : 100) / 100;
    const rotation = el.rotation || 0;
    const scaleX = el.flippedH ? -1 : 1;
    const scaleY = el.flippedV ? -1 : 1;

    const resizeHandles = [
      { pos: 'nw', style: { top: -5, left: -5, cursor: 'nw-resize' } },
      { pos: 'n', style: { top: -5, left: '50%', transform: 'translateX(-50%)', cursor: 'n-resize' } },
      { pos: 'ne', style: { top: -5, right: -5, cursor: 'ne-resize' } },
      { pos: 'e', style: { top: '50%', right: -5, transform: 'translateY(-50%)', cursor: 'e-resize' } },
      { pos: 'se', style: { bottom: -5, right: -5, cursor: 'se-resize' } },
      { pos: 's', style: { bottom: -5, left: '50%', transform: 'translateX(-50%)', cursor: 's-resize' } },
      { pos: 'sw', style: { bottom: -5, left: -5, cursor: 'sw-resize' } },
      { pos: 'w', style: { top: '50%', left: -5, transform: 'translateY(-50%)', cursor: 'w-resize' } },
    ];

    const SelectionControls = ({ el: selEl }) => (
      <>
        {resizeHandles.map((h) => (
          <div key={h.pos} onMouseDown={(e) => onResizeMouseDown(e, selEl, h.pos)}
            style={{ position: 'absolute', width: 10, height: 10, background: '#7c3aed', borderRadius: 2, border: '1px solid #fff', zIndex: 10, ...h.style }} />
        ))}
        <div onMouseDown={(e) => onRotationMouseDown(e, selEl)} style={{ position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'grab' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2"><path d="M23 4v6h-6M1 20v-6h6" /><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" /></svg>
        </div>
      </>
    );

    const LockBadge = () => (
      <div style={{ position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)', color: '#7c3aed' }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM9 8V6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9z" /></svg>
      </div>
    );

    const shadowStyle = el.boxShadow?.enabled ? { boxShadow: `${el.boxShadow.offsetX || 0}px ${el.boxShadow.offsetY || 4}px ${el.boxShadow.blur || 10}px ${el.boxShadow.spread || 0}px ${el.boxShadow.color || '#000000'}` } : {};

    const animStyle = (el.animation && el.animation.type && el.animation.type !== 'none') ? { animation: `${el.animation.type} ${el.animation.duration || 500}ms ${el.animation.delay || 0}ms ${el.animation.easing || 'ease'} both` } : {};

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
      ...shadowStyle,
      ...animStyle,
    };

    if (el.type === 'text') {
      const textContent = el.textTransform === 'uppercase' ? (el.content || '').toUpperCase() : el.textTransform === 'lowercase' ? (el.content || '').toLowerCase() : el.content || '';
      if (el.curve && el.curve !== 0) {
        const curveAmount = el.curve;
        return (
          <div key={el.id} style={baseStyle}
            onMouseDown={(e) => onElementMouseDown(e, el)}
            onContextMenu={(e) => handleContextMenu(e, el)}>
            <svg width="100%" height="100%" viewBox={`0 0 ${el.width || 200} ${el.height || 40}`}>
              <defs>
                <path id={`curve-${el.id}`} d={`M 0 ${(el.height || 40)/2} Q ${(el.width || 200)/2} ${(el.height || 40)/2 - curveAmount} ${el.width || 200} ${(el.height || 40)/2}`} fill="none" />
              </defs>
              <text fill={el.color || '#000'} fontSize={el.fontSize || 16} fontFamily={el.fontFamily || 'Inter'} fontWeight={el.fontWeight || 400} textAnchor="middle">
                <textPath href={`#curve-${el.id}`} startOffset="50%">{textContent}</textPath>
              </text>
            </svg>
            {isSelected && !isEditing && <><SelectionControls el={el} />{el.locked && <LockBadge />}</>}
          </div>
        );
      }
      const gradientTextStyle = el.gradientText?.enabled ? {
        background: `linear-gradient(${el.gradientText.angle || 0}deg, ${el.gradientText.from || '#7c3aed'}, ${el.gradientText.to || '#ec4899'})`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      } : {};
      return (
        <div key={el.id} style={{ ...baseStyle, ...buildTextStyle(el), ...gradientTextStyle, fontSize: el.fontSize || 16, fontFamily: el.fontFamily || 'Inter', fontWeight: el.fontWeight || 400, fontStyle: el.fontStyle || 'normal', textDecoration: el.textDecoration || 'none', color: el.gradientText?.enabled ? undefined : (el.color || '#000000'), display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: el.textAlign || 'center', lineHeight: el.lineHeight || 1.4, letterSpacing: el.letterSpacing || 0, whiteSpace: 'pre-wrap' }}
          onMouseDown={(e) => onElementMouseDown(e, el)} onDoubleClick={(e) => onElementDoubleClick(e, el)}
          onContextMenu={(e) => handleContextMenu(e, el)}>
          {isEditing ? (
            <div contentEditable suppressContentEditableWarning autoFocus style={{ outline: 'none', minWidth: 40 }}
              onBlur={(e) => { commitElementUpdate(el.id, { content: e.target.textContent }); setEditingText(null); }}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); e.target.blur(); } }}
            >{el.content}</div>
          ) : textContent}
          {isSelected && !isEditing && !el.locked && <SelectionControls el={el} />}
          {el.locked && isSelected && <LockBadge />}
        </div>
      );
    }

    if (el.type === 'button') {
      return (
        <div key={el.id} style={{ ...baseStyle, ...buildTextStyle(el), display: 'flex', alignItems: 'center', justifyContent: 'center', background: el.bgColor || '#7c3aed', color: el.color || '#ffffff', borderRadius: el.borderRadius || 8, fontSize: el.fontSize || 16, fontFamily: el.fontFamily || 'Inter', fontWeight: el.fontWeight || 600, fontStyle: el.fontStyle || 'normal', textDecoration: el.textDecoration || 'none', border: `${el.borderWidth || 0}px ${el.borderStyle || 'solid'} ${el.borderColor || 'transparent'}`, whiteSpace: 'nowrap' }}
          onMouseDown={(e) => onElementMouseDown(e, el)} onDoubleClick={(e) => onElementDoubleClick(e, el)}
          onContextMenu={(e) => handleContextMenu(e, el)}>
          {isEditing ? (
            <div contentEditable suppressContentEditableWarning autoFocus style={{ outline: 'none', minWidth: 40 }}
              onBlur={(e) => { commitElementUpdate(el.id, { content: e.target.textContent }); setEditingText(null); }}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); } }}
            >{el.content}</div>
          ) : el.content}
          {isSelected && !isEditing && !el.locked && <SelectionControls el={el} />}
          {el.locked && isSelected && <LockBadge />}
        </div>
      );
    }

    if (el.type === 'shape') {
      let shapeStyle = { ...baseStyle };
      if (el.content === 'circle') shapeStyle = { ...shapeStyle, borderRadius: '50%', background: el.bgColor || '#7c3aed', border: `${el.borderWidth || 0}px ${el.borderStyle || 'solid'} ${el.borderColor || 'transparent'}` };
      else if (el.content === 'line') shapeStyle = { ...shapeStyle, height: 4, background: el.bgColor || '#000000', borderRadius: 2 };
      else if (el.content === 'star') {
        return (
          <div key={el.id} style={shapeStyle} onMouseDown={(e) => onElementMouseDown(e, el)} onContextMenu={(e) => handleContextMenu(e, el)}>
            <svg viewBox="0 0 24 24" width="100%" height="100%"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill={el.bgColor || '#eab308'} /></svg>
            {isSelected && !el.locked && <SelectionControls el={el} />}
            {el.locked && isSelected && <LockBadge />}
          </div>
        );
      } else if (el.content === 'diamond') {
        return (
          <div key={el.id} style={{ ...shapeStyle, background: 'transparent' }} onMouseDown={(e) => onElementMouseDown(e, el)} onContextMenu={(e) => handleContextMenu(e, el)}>
            <svg viewBox="0 0 100 100" width="100%" height="100%"><polygon points="50,2 98,50 50,98 2,50" fill={el.bgColor || '#7c3aed'} /></svg>
            {isSelected && !el.locked && <SelectionControls el={el} />}
            {el.locked && isSelected && <LockBadge />}
          </div>
        );
      } else if (el.content === 'hexagon') {
        return (
          <div key={el.id} style={{ ...shapeStyle, background: 'transparent' }} onMouseDown={(e) => onElementMouseDown(e, el)} onContextMenu={(e) => handleContextMenu(e, el)}>
            <svg viewBox="0 0 100 100" width="100%" height="100%"><polygon points="50,2 93,25 93,75 50,98 7,75 7,25" fill={el.bgColor || '#38bdf8'} /></svg>
            {isSelected && !el.locked && <SelectionControls el={el} />}
            {el.locked && isSelected && <LockBadge />}
          </div>
        );
      } else if (el.content === 'arrow-right') {
        return (
          <div key={el.id} style={{ ...shapeStyle, background: 'transparent' }} onMouseDown={(e) => onElementMouseDown(e, el)} onContextMenu={(e) => handleContextMenu(e, el)}>
            <svg viewBox="0 0 100 60" width="100%" height="100%"><polygon points="0,10 60,10 60,0 100,30 60,60 60,50 0,50" fill={el.bgColor || '#ec4899'} /></svg>
            {isSelected && !el.locked && <SelectionControls el={el} />}
            {el.locked && isSelected && <LockBadge />}
          </div>
        );
      } else if (el.content === 'heart') {
        return (
          <div key={el.id} style={{ ...shapeStyle, background: 'transparent' }} onMouseDown={(e) => onElementMouseDown(e, el)} onContextMenu={(e) => handleContextMenu(e, el)}>
            <svg viewBox="0 0 24 24" width="100%" height="100%"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill={el.bgColor || '#f43f5e'} /></svg>
            {isSelected && !el.locked && <SelectionControls el={el} />}
            {el.locked && isSelected && <LockBadge />}
          </div>
        );
      } else if (el.content === 'cloud') {
        return (
          <div key={el.id} style={{ ...shapeStyle, background: 'transparent' }} onMouseDown={(e) => onElementMouseDown(e, el)} onContextMenu={(e) => handleContextMenu(e, el)}>
            <svg viewBox="0 0 100 60" width="100%" height="100%"><path d="M20,45 Q5,45 5,35 Q5,25 18,25 Q20,15 35,15 Q45,10 55,15 Q65,10 75,18 Q90,18 90,32 Q95,45 80,45 Z" fill={el.bgColor || '#e5e7eb'} /></svg>
            {isSelected && !el.locked && <SelectionControls el={el} />}
            {el.locked && isSelected && <LockBadge />}
          </div>
        );
      } else if (el.content === 'speech-bubble') {
        return (
          <div key={el.id} style={{ ...shapeStyle, background: 'transparent' }} onMouseDown={(e) => onElementMouseDown(e, el)} onContextMenu={(e) => handleContextMenu(e, el)}>
            <svg viewBox="0 0 100 80" width="100%" height="100%"><path d="M10,5 Q5,5 5,10 L5,50 Q5,55 10,55 L25,55 L15,75 L40,55 L90,55 Q95,55 95,50 L95,10 Q95,5 90,5 Z" fill={el.bgColor || '#ffffff'} stroke={el.borderColor || '#d1d5db'} strokeWidth="1" /></svg>
            {isSelected && !el.locked && <SelectionControls el={el} />}
            {el.locked && isSelected && <LockBadge />}
          </div>
        );
      } else if (el.content === 'pentagon') {
        return (
          <div key={el.id} style={{ ...shapeStyle, background: 'transparent' }} onMouseDown={(e) => onElementMouseDown(e, el)} onContextMenu={(e) => handleContextMenu(e, el)}>
            <svg viewBox="0 0 100 100" width="100%" height="100%"><polygon points="50,2 97,38 79,98 21,98 3,38" fill={el.bgColor || '#34d399'} /></svg>
            {isSelected && !el.locked && <SelectionControls el={el} />}
            {el.locked && isSelected && <LockBadge />}
          </div>
        );
      } else if (el.content === 'octagon') {
        return (
          <div key={el.id} style={{ ...shapeStyle, background: 'transparent' }} onMouseDown={(e) => onElementMouseDown(e, el)} onContextMenu={(e) => handleContextMenu(e, el)}>
            <svg viewBox="0 0 100 100" width="100%" height="100%"><polygon points="30,2 70,2 98,30 98,70 70,98 30,98 2,70 2,30" fill={el.bgColor || '#fbbf24'} /></svg>
            {isSelected && !el.locked && <SelectionControls el={el} />}
            {el.locked && isSelected && <LockBadge />}
          </div>
        );
      } else shapeStyle = { ...shapeStyle, background: el.bgColor || '#7c3aed', borderRadius: el.borderRadius || 0, border: `${el.borderWidth || 0}px ${el.borderStyle || 'solid'} ${el.borderColor || 'transparent'}` };

      return (
        <div key={el.id} style={shapeStyle} onMouseDown={(e) => onElementMouseDown(e, el)} onContextMenu={(e) => handleContextMenu(e, el)}>
          {isSelected && !el.locked && <SelectionControls el={el} />}
          {el.locked && isSelected && <LockBadge />}
        </div>
      );
    }

    if (el.type === 'image') {
      const cropClip = el.crop ? `inset(${el.crop.y}% ${100 - el.crop.x - el.crop.w}% ${100 - el.crop.y - el.crop.h}% ${el.crop.x}%)` : undefined;
      return (
        <div key={el.id} style={{ ...baseStyle, borderRadius: el.borderRadius || 0, overflow: 'hidden' }} onMouseDown={(e) => onElementMouseDown(e, el)} onContextMenu={(e) => handleContextMenu(e, el)}>
          {el.src ? (
            <img src={el.src} alt={el.content || 'Image'} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', clipPath: cropClip, WebkitClipPath: cropClip, ...buildImageFilterStyle(el) }} draggable={false} />
          ) : (
            <div style={{ width: '100%', height: '100%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #9ca3af', color: '#6b7280', fontSize: 12, borderRadius: 4 }}>No image</div>
          )}
          {isSelected && !el.locked && <SelectionControls el={el} />}
          {el.locked && isSelected && <LockBadge />}
        </div>
      );
    }

    if (el.type === 'table') {
      const cellW = (el.width || 360) / (el.cols || 3);
      const cellH = (el.height || 180) / (el.rows || 3);
      return (
        <div key={el.id} style={{ ...baseStyle, overflow: 'visible' }} onMouseDown={(e) => onElementMouseDown(e, el)}>
          <table style={{ width: el.width || 360, borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <tbody>
              {(el.cellData || []).map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci} style={{ width: cellW, height: cellH, border: `1px solid ${el.borderColor || '#d1d5db'}`, background: ri === 0 ? (el.headerColor || '#f3f4f6') : (el.cellColor || '#ffffff'), padding: '4px 6px', fontSize: 12, fontFamily: 'Inter', color: '#374151', textAlign: 'left', position: 'relative' }}
                      onClick={(e) => { e.stopPropagation(); if (!el.locked) setEditingTableCell({ elId: el.id, row: ri, col: ci }); }}>
                      {editingTableCell?.elId === el.id && editingTableCell.row === ri && editingTableCell.col === ci ? (
                        <input autoFocus defaultValue={cell} style={{ width: '100%', height: '100%', border: 'none', outline: '2px solid #7c3aed', background: 'transparent', fontSize: 12, fontFamily: 'Inter', padding: 0 }}
                          onBlur={(e) => { updateTableData(el.id, ri, ci, e.target.value); commitTableUpdate(el.id); setEditingTableCell(null); }}
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.target.blur(); } if (e.key === 'Escape') { setEditingTableCell(null); } }}
                          onClick={(e) => e.stopPropagation()} />
                      ) : cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {isSelected && !el.locked && <SelectionControls el={el} />}
          {el.locked && isSelected && <LockBadge />}
        </div>
      );
    }

    if (el.type === 'frame') {
      const clipPath = getFrameClipPath(el.shape || 'circle');
      return (
        <div key={el.id} style={{ ...baseStyle, clipPath, WebkitClipPath: clipPath, background: '#e5e7eb', overflow: 'hidden' }} onMouseDown={(e) => onElementMouseDown(e, el)} onContextMenu={(e) => handleContextMenu(e, el)}>
          {el.frameImage ? (
            <img src={el.frameImage} alt="Frame" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} draggable={false} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #9ca3af', color: '#6b7280', fontSize: 11 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><path d="M12 8v8M8 12h8" /></svg>
            </div>
          )}
          {isSelected && !el.locked && <SelectionControls el={el} />}
          {el.locked && isSelected && <LockBadge />}
        </div>
      );
    }

    if (el.type === 'chart') {
      const cw = el.width || 300;
      const ch = el.height || 200;
      const data = el.data || { labels: ['A','B','C','D'], values: [30,60,45,80] };
      const colors = el.colors || ['#7c3aed','#38bdf8','#ec4899','#fbbf24'];
      const maxVal = Math.max(...data.values, 1);
      return (
        <div key={el.id} style={{ ...baseStyle, background: el.bgColor || '#ffffff', border: `1px solid ${el.borderColor || '#d1d5db'}`, borderRadius: 4, overflow: 'hidden' }} onMouseDown={(e) => onElementMouseDown(e, el)} onContextMenu={(e) => handleContextMenu(e, el)}>
          <svg viewBox={`0 0 ${cw} ${ch}`} width="100%" height="100%">
            {el.chartType === 'bar' && data.labels.map((label, i) => {
              const barW = (cw - 40) / data.labels.length - 4;
              const barH = (data.values[i] / maxVal) * (ch - 50);
              return (
                <g key={i}>
                  <rect x={20 + i * (barW + 4)} y={ch - 25 - barH} width={barW} height={barH} fill={colors[i % colors.length]} rx={2} />
                  <text x={20 + i * (barW + 4) + barW / 2} y={ch - 8} textAnchor="middle" fontSize={10} fill="#6b7280">{label}</text>
                </g>
              );
            })}
            {el.chartType === 'pie' && (() => {
              const total = data.values.reduce((s, v) => s + v, 0) || 1;
              let cumAngle = -Math.PI / 2;
              return data.labels.map((label, i) => {
                const sliceAngle = (data.values[i] / total) * Math.PI * 2;
                const x1 = cw / 2 + (cw / 3) * Math.cos(cumAngle);
                const y1 = ch / 2 + (ch / 3) * Math.sin(cumAngle);
                cumAngle += sliceAngle;
                const x2 = cw / 2 + (cw / 3) * Math.cos(cumAngle);
                const y2 = ch / 2 + (ch / 3) * Math.sin(cumAngle);
                const largeArc = sliceAngle > Math.PI ? 1 : 0;
                return <path key={i} d={`M${cw/2},${ch/2} L${x1},${y1} A${cw/3},${ch/3} 0 ${largeArc},1 ${x2},${y2} Z`} fill={colors[i % colors.length]} />;
              });
            })()}
            {el.chartType === 'line' && (
              <polyline
                points={data.labels.map((_, i) => {
                  const x = 20 + (i / (data.labels.length - 1 || 1)) * (cw - 40);
                  const y = ch - 25 - (data.values[i] / maxVal) * (ch - 50);
                  return `${x},${y}`;
                }).join(' ')}
                fill="none" stroke={colors[0] || '#7c3aed'} strokeWidth="2"
              />
            )}
            {el.chartType === 'line' && data.labels.map((label, i) => {
              const x = 20 + (i / (data.labels.length - 1 || 1)) * (cw - 40);
              const y = ch - 25 - (data.values[i] / maxVal) * (ch - 50);
              return (
                <g key={i}>
                  <circle cx={x} cy={y} r={3} fill={colors[i % colors.length]} />
                  <text x={x} y={ch - 8} textAnchor="middle" fontSize={10} fill="#6b7280">{label}</text>
                </g>
              );
            })}
          </svg>
          {isSelected && !el.locked && <SelectionControls el={el} />}
          {el.locked && isSelected && <LockBadge />}
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
      saveCurrentPage();
      const currentTmpl = { pages: pagesRef.current.map((p) => ({ ...p, elements: (p.elements || []).map(({ id: _id, ...rest }) => rest) })), title: designName };
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
        if (data.data.background) {
          setPages((prev) => prev.map((p, i) => i === currentPageIdx ? { ...p, background: data.data.background } : p));
        }
        setAiMessages((m) => [...m, { role: 'assistant', text: 'Template updated! Check the preview.' }]);
      } else { setAiMessages((m) => [...m, { role: 'assistant', text: data.error || 'Failed to process.' }]); }
    } catch { setAiMessages((m) => [...m, { role: 'assistant', text: 'Network error. Please try again.' }]); } finally { setAiLoading(false); }
  }, [aiInput, aiLoading, designName, currentPageIdx, pushHistory, saveCurrentPage]);

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
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideInLeft { from { transform: translateX(-100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slideInUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes slideInDown { from { transform: translateY(-100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes bounceIn { 0% { transform: scale(0.3); opacity: 0; } 50% { transform: scale(1.05); } 70% { transform: scale(0.9); } 100% { transform: scale(1); opacity: 1; } }
        @keyframes zoomIn { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes rotateIn { from { transform: rotate(-200deg); opacity: 0; } to { transform: rotate(0); opacity: 1; } }
        @keyframes flipIn { from { transform: perspective(400px) rotateY(90deg); opacity: 0; } to { transform: perspective(400px) rotateY(0); opacity: 1; } }
        @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
        @keyframes wiggle { 0%,100% { transform: rotate(0deg); } 25% { transform: rotate(-5deg); } 75% { transform: rotate(5deg); } }
        @keyframes pop { 0% { transform: scale(0); } 70% { transform: scale(1.1); } 100% { transform: scale(1); } }
        @keyframes rise { 0% { transform: translateY(30px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
        .page-transition { transition: opacity 0.5s, transform 0.5s; }
        .page-exit { opacity: 0; transform: scale(0.95); }
      `}</style>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />

      {showPresentMode && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center">
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            <span className="text-white/60 text-xs">{presentPageIdx + 1} / {pages.length}</span>
            <button onClick={() => setShowPresentMode(false)} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg">Exit (Esc)</button>
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
            <button onClick={() => setPresentPageIdx((i) => Math.max(0, i - 1))} disabled={presentPageIdx === 0} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg disabled:opacity-30">← Prev</button>
            <button onClick={() => setPresentPageIdx((i) => Math.min(pages.length - 1, i + 1))} disabled={presentPageIdx >= pages.length - 1} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg disabled:opacity-30">Next →</button>
          </div>
          <div className="page-transition" key={`present-${presentPageIdx}`} style={{
            width: CANVAS_W, height: CANVAS_H, position: 'relative', overflow: 'hidden', borderRadius: 8,
            ...(() => { const bg = pages[presentPageIdx]?.background || {}; if (bg.type === 'gradient') return { background: `linear-gradient(135deg, ${bg.from || '#0f172a'}, ${bg.to || '#1e293b'})` }; return { background: bg.color || '#0f172a' }; })(),
            animation: pages[presentPageIdx]?.transition === 'fade' ? 'fadeIn 0.5s ease' : pages[presentPageIdx]?.transition === 'slide' ? 'slideInRight 0.5s ease' : pages[presentPageIdx]?.transition === 'zoom' ? 'zoomIn 0.5s ease' : undefined,
          }}>
            {(pages[presentPageIdx]?.elements || []).map(renderElement)}
          </div>
        </div>
      )}

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
          <button onClick={() => setShowRulers((v) => !v)} className={`p-2 rounded-lg text-xs font-medium transition-colors ${showRulers ? 'bg-purple-100 text-[#7c3aed]' : 'text-gray-500 hover:bg-gray-100'}`} title="Rulers (Ctrl+R)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3h18v18H3zM3 9h18M3 15h18M9 3v18M15 3v18" /></svg>
          </button>
          <button onClick={() => setShowGrid((v) => !v)} className={`p-2 rounded-lg text-xs font-medium transition-colors ${showGrid ? 'bg-purple-100 text-[#7c3aed]' : 'text-gray-500 hover:bg-gray-100'}`} title="Grid (Ctrl+')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" /></svg>
          </button>
          <button onClick={() => { setShowPresentMode(true); setPresentPageIdx(currentPageIdx); }} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors" title="Present (F5)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5,3 19,12 5,21" /></svg>
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
                <button onClick={exportAsPDF} className="w-full text-left px-4 py-2.5 text-xs text-gray-700 hover:bg-purple-50 hover:text-[#7c3aed] transition-colors flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6M9 15h6M9 19h6" /></svg> Download PDF
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
              <button key={item.id} onClick={() => { setActiveSidebar(isActive ? null : item.id); setSelectedIds([]); setEditingText(null); setShowAI(false); setShowDownloadMenu(false); setShowShareMenu(false); }}
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
              {activeGuides.map((g, i) => {
                const guideStyle = g.type === 'v'
                  ? { position: 'absolute', left: g.pos + '%', top: 0, width: 1, height: '100%' }
                  : { position: 'absolute', top: g.pos + '%', left: 0, height: 1, width: '100%' };
                return <div key={i} style={{ ...guideStyle, background: '#7c3aed', opacity: 0.6, zIndex: 50, pointerEvents: 'none' }} />;
              })}
              {customGuides.map((g) => {
                const guideStyle = g.type === 'v'
                  ? { position: 'absolute', left: g.pos + '%', top: 0, width: 1, height: '100%' }
                  : { position: 'absolute', top: g.pos + '%', left: 0, height: 1, width: '100%' };
                return <div key={g.id} style={{ ...guideStyle, background: '#7c3aed', opacity: 0.4, zIndex: 45, pointerEvents: 'none', borderStyle: 'dashed', borderWidth: g.type === 'v' ? '0 1px 0 0' : '0 0 1px 0', borderColor: '#7c3aed' }} />;
              })}
              {showGrid && (
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 40, backgroundImage: 'linear-gradient(rgba(124,58,237,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
              )}
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
          {selectedIds.length > 0 && selectedEl && editingText === null && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white rounded-xl shadow-lg border border-gray-200 px-3 py-1.5 z-20 text-[10px]" onClick={(e) => e.stopPropagation()}>
              {selectedIds.length > 1 && <span className="text-[9px] text-[#7c3aed] font-medium ml-1">{selectedIds.length} selected</span>}
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

              {/* Text Shadow */}
              {selectedEl.type === 'text' && (
                <button onClick={() => commitElementUpdate(selectedEl.id, { textShadow: { ...(selectedEl.textShadow || DEFAULT_TEXT_SHADOW), enabled: !(selectedEl.textShadow?.enabled) } })}
                  className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${selectedEl.textShadow?.enabled ? 'bg-[#7c3aed] text-white' : 'hover:bg-gray-100 text-gray-500'}`} title="Text Shadow">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16v16H4z" opacity="0.3" /><path d="M8 8h12v12H8z" /></svg>
                </button>
              )}

              {/* Text Stroke */}
              {selectedEl.type === 'text' && (
                <button onClick={() => commitElementUpdate(selectedEl.id, { textStroke: { ...(selectedEl.textStroke || DEFAULT_TEXT_STROKE), enabled: !(selectedEl.textStroke?.enabled) } })}
                  className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${selectedEl.textStroke?.enabled ? 'bg-[#7c3aed] text-white' : 'hover:bg-gray-100 text-gray-500'}`} title="Text Stroke">
                  <span className="text-xs font-bold" style={{ WebkitTextStroke: selectedEl.textStroke?.enabled ? '1.5px currentColor' : 'none' }}>S</span>
                </button>
              )}

              {/* Image Filters */}
              {selectedEl.type === 'image' && (
                <>
                  <div className="w-px h-5 bg-gray-200 mx-0.5" />
                  <div className="flex flex-col gap-0.5 px-1">
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] text-gray-400 w-6">Br</span>
                      <input type="range" min="0" max="200" value={selectedEl.filter?.brightness ?? 100} onChange={(e) => updateElement(selectedEl.id, { filter: { ...(selectedEl.filter || DEFAULT_IMAGE_FILTER), brightness: Number(e.target.value) } })}
                        onMouseUp={(e) => commitElementUpdate(selectedEl.id, { filter: { ...(selectedEl.filter || DEFAULT_IMAGE_FILTER), brightness: Number(e.target.value) } })}
                        className="w-14 h-1 accent-[#7c3aed]" />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] text-gray-400 w-6">Co</span>
                      <input type="range" min="0" max="200" value={selectedEl.filter?.contrast ?? 100} onChange={(e) => updateElement(selectedEl.id, { filter: { ...(selectedEl.filter || DEFAULT_IMAGE_FILTER), contrast: Number(e.target.value) } })}
                        onMouseUp={(e) => commitElementUpdate(selectedEl.id, { filter: { ...(selectedEl.filter || DEFAULT_IMAGE_FILTER), contrast: Number(e.target.value) } })}
                        className="w-14 h-1 accent-[#7c3aed]" />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] text-gray-400 w-6">Sa</span>
                      <input type="range" min="0" max="200" value={selectedEl.filter?.saturate ?? 100} onChange={(e) => updateElement(selectedEl.id, { filter: { ...(selectedEl.filter || DEFAULT_IMAGE_FILTER), saturate: Number(e.target.value) } })}
                        onMouseUp={(e) => commitElementUpdate(selectedEl.id, { filter: { ...(selectedEl.filter || DEFAULT_IMAGE_FILTER), saturate: Number(e.target.value) } })}
                        className="w-14 h-1 accent-[#7c3aed]" />
                    </div>
                  </div>
                </>
              )}

              {/* Table Controls */}
              {selectedEl.type === 'table' && (
                <>
                  <div className="w-px h-5 bg-gray-200 mx-0.5" />
                  <button onClick={() => addTableRow(selectedEl.id)} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-500 transition-colors" title="Add row">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
                  </button>
                  <button onClick={() => removeTableRow(selectedEl.id)} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-500 transition-colors" title="Remove row">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14" /></svg>
                  </button>
                  <button onClick={() => addTableCol(selectedEl.id)} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-500 transition-colors" title="Add column">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M12 3v18M3 12h18" /></svg>
                  </button>
                  <button onClick={() => removeTableCol(selectedEl.id)} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-500 transition-colors" title="Remove column">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18" /></svg>
                  </button>
                  <div className="relative">
                    <input type="color" value={selectedEl.headerColor || '#f3f4f6'} onChange={(e) => handleColorChange(selectedEl.id, 'headerColor', e.target.value)}
                      onMouseUp={(e) => handleColorChangeComplete(selectedEl.id, 'headerColor', e.target.value)}
                      className="w-7 h-7 rounded-md cursor-pointer border-2 border-gray-200 hover:border-[#7c3aed]" title="Header color" />
                  </div>
                </>
              )}

              {/* Alignment (2+ selected) */}
              {selectedIds.length >= 2 && (
                <>
                  <div className="w-px h-5 bg-gray-200 mx-0.5" />
                  <button onClick={() => alignElements('left')} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-500 transition-colors" title="Align left">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 3v18M17 7H8M17 12H8M17 17H8" /></svg>
                  </button>
                  <button onClick={() => alignElements('center-h')} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-500 transition-colors" title="Align center H">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v18M8 7h8M6 12h12M8 17h8" /></svg>
                  </button>
                  <button onClick={() => alignElements('right')} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-500 transition-colors" title="Align right">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 3v18M17 7H8M17 12H8M17 17H8" /></svg>
                  </button>
                  <button onClick={() => alignElements('top')} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-500 transition-colors" title="Align top">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 4h18M7 17V8M12 17V8M17 17V8" /></svg>
                  </button>
                  <button onClick={() => alignElements('center-v')} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-500 transition-colors" title="Align center V">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M7 8v8M17 8v8" /></svg>
                  </button>
                  <button onClick={() => alignElements('bottom')} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-500 transition-colors" title="Align bottom">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 20h18M7 17V8M12 17V8M17 17V8" /></svg>
                  </button>
                  <button onClick={() => alignElements('dist-h')} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-500 transition-colors" title="Distribute H">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 3v18M20 3v18M8 7v10M16 7v10M12 10v4" /></svg>
                  </button>
                  <button onClick={() => alignElements('dist-v')} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-500 transition-colors" title="Distribute V">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 4h18M3 20h18M7 8v10M16 8v10M10 12v4" /></svg>
                  </button>
                </>
              )}

              {/* Animation */}
              <div className="w-px h-5 bg-gray-200 mx-0.5" />
              <div className="relative">
                <button onClick={() => setShowAnimPanel((v) => !v)} className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${(selectedEl.animation && selectedEl.animation.type !== 'none') ? 'bg-[#7c3aed] text-white' : 'hover:bg-gray-100 text-gray-500'}`} title="Animate">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5,3 19,12 5,21" /></svg>
                </button>
                {showAnimPanel && (
                  <div className="absolute top-full left-0 mt-1 w-40 bg-white rounded-xl shadow-xl border border-gray-200 py-1 z-50 max-h-60 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                    {ANIMATION_OPTIONS.map((opt) => (
                      <button key={opt.type} onClick={() => { commitElementUpdate(selectedEl.id, { animation: { ...(selectedEl.animation || ANIM_DEFAULT), type: opt.type } }); setShowAnimPanel(false); }}
                        className={`w-full text-left px-3 py-1.5 text-xs hover:bg-purple-50 transition-colors ${(selectedEl.animation?.type === opt.type) ? 'bg-purple-50 text-[#7c3aed] font-medium' : 'text-gray-700'}`}>{opt.label}</button>
                    ))}
                  </div>
                )}
              </div>

              {/* Text Curve */}
              {isTextType(selectedEl.type) && (
                <>
                  <div className="w-px h-5 bg-gray-200 mx-0.5" />
                  <div className="flex items-center gap-1 px-1" title="Text curve">
                    <span className="text-[9px] text-gray-400">Curve</span>
                    <input type="range" min="-100" max="100" value={selectedEl.curve || 0}
                      onChange={(e) => updateElement(selectedEl.id, { curve: Number(e.target.value) })}
                      onMouseUp={(e) => commitElementUpdate(selectedEl.id, { curve: Number(e.target.value) })}
                      className="w-14 h-1 accent-[#7c3aed]" />
                  </div>
                </>
              )}

              {/* Gradient Text */}
              {isTextType(selectedEl.type) && (
                <>
                  <div className="w-px h-5 bg-gray-200 mx-0.5" />
                  <button onClick={() => commitElementUpdate(selectedEl.id, { gradientText: { ...(selectedEl.gradientText || GRADIENT_TEXT_DEFAULT), enabled: !(selectedEl.gradientText?.enabled) } })}
                    className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${selectedEl.gradientText?.enabled ? 'bg-[#7c3aed] text-white' : 'hover:bg-gray-100 text-gray-500'}`} title="Gradient text">
                    <span className="text-xs font-bold" style={selectedEl.gradientText?.enabled ? { background: `linear-gradient(135deg, ${selectedEl.gradientText.from || '#7c3aed'}, ${selectedEl.gradientText.to || '#ec4899'})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' } : {}}>G</span>
                  </button>
                  {selectedEl.gradientText?.enabled && (
                    <>
                      <input type="color" value={selectedEl.gradientText?.from || '#7c3aed'} onChange={(e) => updateElement(selectedEl.id, { gradientText: { ...(selectedEl.gradientText || GRADIENT_TEXT_DEFAULT), from: e.target.value } })}
                        onMouseUp={(e) => commitElementUpdate(selectedEl.id, { gradientText: { ...(selectedEl.gradientText || GRADIENT_TEXT_DEFAULT), from: e.target.value } })}
                        className="w-5 h-5 rounded cursor-pointer border border-gray-200" title="Gradient from" />
                      <input type="color" value={selectedEl.gradientText?.to || '#ec4899'} onChange={(e) => updateElement(selectedEl.id, { gradientText: { ...(selectedEl.gradientText || GRADIENT_TEXT_DEFAULT), to: e.target.value } })}
                        onMouseUp={(e) => commitElementUpdate(selectedEl.id, { gradientText: { ...(selectedEl.gradientText || GRADIENT_TEXT_DEFAULT), to: e.target.value } })}
                        className="w-5 h-5 rounded cursor-pointer border border-gray-200" title="Gradient to" />
                    </>
                  )}
                </>
              )}

              {/* Drop Shadow */}
              {(selectedEl.type === 'shape' || selectedEl.type === 'button' || selectedEl.type === 'image') && (
                <>
                  <div className="w-px h-5 bg-gray-200 mx-0.5" />
                  <button onClick={() => commitElementUpdate(selectedEl.id, { boxShadow: { ...(selectedEl.boxShadow || BOX_SHADOW_DEFAULT), enabled: !(selectedEl.boxShadow?.enabled) } })}
                    className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${selectedEl.boxShadow?.enabled ? 'bg-[#7c3aed] text-white' : 'hover:bg-gray-100 text-gray-500'}`} title="Drop shadow">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="14" height="14" rx="2" /><rect x="7" y="7" width="14" height="14" rx="2" opacity="0.4" /></svg>
                  </button>
                </>
              )}

              {/* Emoji (for text) */}
              {isTextType(selectedEl.type) && !isEditing && (
                <>
                  <div className="w-px h-5 bg-gray-200 mx-0.5" />
                  <div className="relative">
                    <button onClick={() => setShowEmojiPicker((v) => !v)} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-500 transition-colors" title="Emoji">
                      <span className="text-sm">😀</span>
                    </button>
                    {showEmojiPicker && (
                      <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-gray-200 p-2 z-50 max-h-48 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="grid grid-cols-8 gap-0.5">
                          {EMOJI_LIST.map((emoji) => (
                            <button key={emoji} onClick={() => { commitElementUpdate(selectedEl.id, { content: (selectedEl.content || '') + emoji }); setShowEmojiPicker(false); }}
                              className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 text-sm">{emoji}</button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Chart type selector */}
              {selectedEl.type === 'chart' && (
                <>
                  <div className="w-px h-5 bg-gray-200 mx-0.5" />
                  {['bar','pie','line'].map((ct) => (
                    <button key={ct} onClick={() => commitElementUpdate(selectedEl.id, { chartType: ct })}
                      className={`w-7 h-7 flex items-center justify-center rounded-md text-xs transition-colors ${selectedEl.chartType === ct ? 'bg-[#7c3aed] text-white' : 'hover:bg-gray-100 text-gray-500'}`} title={`${ct} chart`}>
                      {ct === 'bar' ? '📊' : ct === 'pie' ? '🥧' : '📈'}
                    </button>
                  ))}
                </>
              )}

              {/* Duplicate & Delete */}
              <button onClick={() => duplicateSelected()} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-500 transition-colors" title="Duplicate (Ctrl+D)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
              </button>
              <button onClick={() => deleteSelected()} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors" title="Delete (Del)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ===== PAGES THUMBNAILS ===== */}
      <div className="h-20 bg-gray-50 border-t border-gray-200 flex items-center gap-2 px-4 overflow-x-auto shrink-0 z-20">
        {pages.map((page, i) => (
          <div key={page.id} className={`relative shrink-0 w-16 h-14 rounded-lg border-2 cursor-pointer transition-all overflow-hidden ${i === currentPageIdx ? 'border-[#7c3aed] shadow-md' : 'border-gray-200 hover:border-gray-300'}`}
            onClick={() => switchPage(i)}>
            <div className="absolute inset-0" style={{ background: page.background?.type === 'gradient' ? `linear-gradient(135deg, ${page.background.from || '#0f172a'}, ${page.background.to || '#1e293b'})` : page.background?.color || '#ffffff' }} />
            <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-[8px] text-center py-0.5">{i + 1} {page.transition ? `(${page.transition})` : ''}</div>
            <div className="absolute top-0.5 right-0.5 flex gap-0.5">
              <button onClick={(e) => { e.stopPropagation(); duplicatePage(i); }} className="w-3.5 h-3.5 bg-black/40 hover:bg-black/60 rounded text-white flex items-center justify-center text-[8px]">+</button>
              {pages.length > 1 && <button onClick={(e) => { e.stopPropagation(); deletePage(i); }} className="w-3.5 h-3.5 bg-black/40 hover:bg-red-500/80 rounded text-white flex items-center justify-center text-[8px]">×</button>}
            </div>
            <select value={page.transition || 'none'} onChange={(e) => { e.stopPropagation(); setPages((prev) => prev.map((p, idx) => idx === i ? { ...p, transition: e.target.value } : p)); }}
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[7px] text-center py-0 appearance-none outline-none cursor-pointer" style={{ fontSize: 6 }}>
              <option value="none">None</option>
              <option value="fade">Fade</option>
              <option value="slide">Slide</option>
              <option value="zoom">Zoom</option>
            </select>
          </div>
        ))}
        <button onClick={addPage} className="shrink-0 w-16 h-14 rounded-lg border-2 border-dashed border-gray-300 hover:border-[#7c3aed] flex items-center justify-center text-gray-400 hover:text-[#7c3aed] transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
        </button>
      </div>

      {/* ===== SIDEBAR PANELS ===== */}
      {activeSidebar && !showAI && (
        <div className="absolute left-[60px] top-14 bottom-24 w-[280px] bg-white border-r border-gray-200 shadow-xl z-20 flex flex-col overflow-hidden">
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
                      <button key={i} onClick={() => setPages((prev) => prev.map((p, idx) => idx === currentPageIdx ? { ...p, background: { type: 'gradient', from: bg.from, to: bg.to } } : p))}
                        className="h-10 rounded-lg border border-gray-200 hover:border-[#7c3aed] transition-all hover:shadow-sm" style={{ background: `linear-gradient(135deg, ${bg.from}, ${bg.to})` }} title={bg.label} />
                    ))}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <input type="color" value={pages[currentPageIdx]?.background?.from || '#0f172a'} onChange={(e) => setPages((prev) => prev.map((p, idx) => idx === currentPageIdx ? { ...p, background: { type: 'gradient', from: e.target.value, to: p.background?.to || '#1e293b' } } : p))}
                      className="w-8 h-8 rounded-md cursor-pointer border border-gray-200" title="Gradient start" />
                    <input type="color" value={pages[currentPageIdx]?.background?.to || '#1e293b'} onChange={(e) => setPages((prev) => prev.map((p, idx) => idx === currentPageIdx ? { ...p, background: { type: 'gradient', from: p.background?.from || '#0f172a', to: e.target.value } } : p))}
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
                    {SHAPES_EXTENDED.map((shape) => (
                      <button key={shape.preset} onClick={() => addElement(shape.preset)} className="flex flex-col items-center gap-1 p-3 rounded-xl border border-gray-200 hover:border-[#7c3aed] hover:bg-purple-50 transition-all text-gray-700">
                        <span className="text-xl font-bold">{shape.icon}</span>
                        <span className="text-[10px] text-gray-500">{shape.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">Charts</p>
                  <div className="grid grid-cols-2 gap-2">
                    {CHART_PRESETS.map((chart) => (
                      <button key={chart.preset} onClick={() => addElement(chart.preset)} className="flex flex-col items-center gap-1 p-3 rounded-xl border border-gray-200 hover:border-[#7c3aed] hover:bg-purple-50 transition-all text-gray-700">
                        <span className="text-xl font-bold">{chart.icon}</span>
                        <span className="text-[10px] text-gray-500">{chart.label}</span>
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
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">Frames</p>
                  <div className="grid grid-cols-2 gap-2">
                    {FRAME_SHAPES.map((frame) => (
                      <button key={frame.shape} onClick={() => { addElement('frame'); setTimeout(() => { const el = elementsRef.current[elementsRef.current.length - 1]; if (el) commitElementUpdate(el.id, { shape: frame.shape }); }, 0); }}
                        className="flex flex-col items-center gap-1 p-3 rounded-xl border border-gray-200 hover:border-[#7c3aed] hover:bg-purple-50 transition-all text-gray-700">
                        <span className="text-xl font-bold">{frame.icon}</span>
                        <span className="text-[10px] text-gray-500">{frame.label}</span>
                      </button>
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
                    <div className="flex gap-1 mt-2">
                      {['solid', 'dashed', 'dotted', 'double'].map((bs) => (
                        <button key={bs} onClick={() => commitElementUpdate(selectedEl.id, { borderStyle: bs })}
                          className={`flex-1 py-1.5 text-[10px] rounded-lg border transition-colors ${selectedEl.borderStyle === bs ? 'bg-[#7c3aed] text-white border-[#7c3aed]' : 'border-gray-200 text-gray-600 hover:border-[#7c3aed]'}`}>
                          {bs}
                        </button>
                      ))}
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
                {extractedColors.length > 0 && (
                  <div className="mt-4 w-full">
                    <p className="text-xs font-medium text-gray-500 mb-2">Extracted Colors</p>
                    <div className="flex flex-wrap gap-1.5">
                      {extractedColors.map((color, i) => (
                        <button key={i} onClick={() => { if (selectedEl) { const prop = selectedEl.type === 'shape' || selectedEl.type === 'button' ? 'bgColor' : 'color'; commitElementUpdate(selectedEl.id, { [prop]: color }); } }}
                          className="w-9 h-9 rounded-lg border-2 border-gray-200 hover:border-[#7c3aed] transition-all hover:scale-110" style={{ background: color }} title={`Use ${color}`} />
                      ))}
                    </div>
                  </div>
                )}
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
        <div className="absolute right-0 top-14 bottom-24 w-[320px] bg-white border-l border-gray-200 shadow-xl z-20 flex flex-col overflow-hidden">
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

      {/* ===== CONTEXT MENU ===== */}
      {contextMenu && (
        <div className="fixed z-[200] bg-white rounded-xl shadow-2xl border border-gray-200 py-1 w-52" style={{ left: contextMenu.x, top: contextMenu.y }} onClick={(e) => e.stopPropagation()}>
          {contextMenu.elementId && (<>
            <button onClick={() => contextMenuAction('cut')} className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-purple-50 hover:text-[#7c3aed] transition-colors flex items-center justify-between">Cut <span className="text-gray-400">Ctrl+X</span></button>
            <button onClick={() => contextMenuAction('copy')} className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-purple-50 hover:text-[#7c3aed] transition-colors flex items-center justify-between">Copy <span className="text-gray-400">Ctrl+C</span></button>
          </>)}
          <button onClick={() => contextMenuAction('paste')} className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-purple-50 hover:text-[#7c3aed] transition-colors flex items-center justify-between">Paste <span className="text-gray-400">Ctrl+V</span></button>
          {contextMenu.elementId && (<>
            <button onClick={() => contextMenuAction('duplicate')} className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-purple-50 hover:text-[#7c3aed] transition-colors flex items-center justify-between">Duplicate <span className="text-gray-400">Ctrl+D</span></button>
            <button onClick={() => contextMenuAction('delete')} className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-red-50 hover:text-red-500 transition-colors">Delete</button>
            <div className="h-px bg-gray-100 my-1" />
            <button onClick={() => contextMenuAction('bringForward')} className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-purple-50 hover:text-[#7c3aed] transition-colors">Bring Forward</button>
            <button onClick={() => contextMenuAction('sendBackward')} className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-purple-50 hover:text-[#7c3aed] transition-colors">Send Backward</button>
            <button onClick={() => contextMenuAction('bringToFront')} className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-purple-50 hover:text-[#7c3aed] transition-colors">Bring to Front</button>
            <button onClick={() => contextMenuAction('sendToBack')} className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-purple-50 hover:text-[#7c3aed] transition-colors">Send to Back</button>
            <div className="h-px bg-gray-100 my-1" />
            <button onClick={() => contextMenuAction('lock')} className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-purple-50 hover:text-[#7c3aed] transition-colors">{elementsRef.current.find(e => e.id === contextMenu.elementId)?.locked ? 'Unlock' : 'Lock'}</button>
            <button onClick={() => contextMenuAction('group')} className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-purple-50 hover:text-[#7c3aed] transition-colors flex items-center justify-between">Group <span className="text-gray-400">Ctrl+G</span></button>
            <button onClick={() => contextMenuAction('ungroup')} className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-purple-50 hover:text-[#7c3aed] transition-colors flex items-center justify-between">Ungroup <span className="text-gray-400">Ctrl+Shift+G</span></button>
            <div className="h-px bg-gray-100 my-1" />
            <button onClick={() => { contextMenuAction('copyStyle'); }} className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-purple-50 hover:text-[#7c3aed] transition-colors flex items-center justify-between">Copy Style <span className="text-gray-400">Ctrl+Shift+C</span></button>
            <button onClick={() => contextMenuAction('pasteStyle')} className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-purple-50 hover:text-[#7c3aed] transition-colors flex items-center justify-between">Paste Style <span className="text-gray-400">Ctrl+Shift+V</span></button>
            <div className="h-px bg-gray-100 my-1" />
            <button onClick={() => closeContextMenu()} className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-purple-50 hover:text-[#7c3aed] transition-colors">Animate</button>
          </>)}
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

      {/* ===== IMAGE CROP OVERLAY ===== */}
      {cropImage && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center" onClick={() => setCropImage(null)}>
          <div className="bg-white rounded-2xl p-4 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Crop Image</h3>
            <div className="relative bg-gray-100 rounded-lg overflow-hidden mb-4" style={{ aspectRatio: '4/3' }}>
              <img src={cropImage.src} alt="Crop" className="w-full h-full object-contain" />
              <div className="absolute inset-0 bg-black/40" />
              <div id="crop-area" className="absolute bg-transparent border-2 border-white cursor-move" style={{ top: '10%', left: '10%', width: '80%', height: '80%' }} />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setCropImage(null)} className="flex-1 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
              <button onClick={() => {
                const area = document.getElementById('crop-area');
                if (area && cropImage.elId) {
                  const parent = area.parentElement.getBoundingClientRect();
                  const areaRect = area.getBoundingClientRect();
                  const x = ((areaRect.left - parent.left) / parent.width) * 100;
                  const y = ((areaRect.top - parent.top) / parent.height) * 100;
                  const w = (areaRect.width / parent.width) * 100;
                  const h = (areaRect.height / parent.height) * 100;
                  commitElementUpdate(cropImage.elId, { crop: { x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h) } });
                }
                setCropImage(null);
              }} className="flex-1 py-2 text-xs font-medium text-white bg-[#7c3aed] rounded-lg hover:bg-[#6d28d9]">Apply Crop</button>
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