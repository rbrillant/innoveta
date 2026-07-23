import { Link } from 'react-router-dom';

const PALETTE = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#1d4ed8'];

export default function TemplateCard({ template, actions }) {
  const hash = template.id
    ? template.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
    : Math.random();
  const bg = PALETTE[hash % PALETTE.length];

  return (
    <div className="group glass-card rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-teal/5 hover:-translate-y-1 transition-all duration-300">
      <Link to={`/template/${template.id}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden" style={{ background: bg }}>
          {template.image ? (
            <img
              src={template.image}
              alt={template.name}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <span className="text-white/70 select-none text-4xl font-light tracking-wider absolute inset-0 flex items-center justify-center">
              {template.name.slice(0, 2).toUpperCase()}
            </span>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
            <span className="text-xs font-medium text-white/90 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
              View Details →
            </span>
            {actions && (
              <div className="flex gap-1.5" onClick={(e) => e.preventDefault()}>
                {actions}
              </div>
            )}
          </div>
        </div>
      </Link>
      <div className="p-3">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-[10px] font-medium text-teal-dark dark:text-teal-light bg-teal/10 dark:bg-teal-dark/20 px-2 py-0.5 rounded-full truncate max-w-[65%]">
            {template.category}
          </span>
          {template.price > 0 ? (
            <span className="text-xs font-bold text-black dark:text-gray-100 shrink-0">${template.price}</span>
          ) : (
            <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full shrink-0">Free</span>
          )}
        </div>
        <h3 className="text-sm font-semibold text-black dark:text-gray-100 truncate">{template.name}</h3>
        <p className="text-xs text-black/60 dark:text-gray-400 mt-0.5 truncate">{template.description}</p>
        <Link
          to={`/editor/${template.id}`}
          onClick={(e) => e.stopPropagation()}
          className="mt-2 flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#38bdf8] to-[#0ea5e9] text-white hover:from-[#0ea5e9] hover:to-[#0284c7] hover:shadow-lg hover:shadow-[#38bdf8]/25 transition-all cursor-pointer"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          Customize with AI
        </Link>
      </div>
    </div>
  );
}
