import { Link } from 'react-router-dom';

const PALETTE = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#1d4ed8'];

export default function TemplateCard({ template, actions }) {
  const hash = template.id
    ? template.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
    : Math.random();
  const bg = PALETTE[hash % PALETTE.length];

  return (
    <Link
      to={`/template/${template.id}`}
      className="group glass-card rounded-2xl overflow-hidden hover:shadow-lg hover:scale-[1.02] transition-all duration-300 block"
    >
      <div
        className="h-44 flex items-center justify-center text-5xl relative overflow-hidden"
        style={{ background: bg }}
      >
        {template.image ? (
          <img
            src={template.image}
            alt={template.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-white/70 select-none text-3xl font-light tracking-wider">
            {template.name.slice(0, 2).toUpperCase()}
          </span>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
        {actions && (
          <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" onClick={(e) => e.preventDefault()}>
            {actions}
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-teal-dark dark:text-teal-light bg-teal/15 dark:bg-amber-900/20 px-2.5 py-0.5 rounded-full">
            {template.category}
          </span>
          {template.price > 0 ? (
            <span className="text-sm font-bold text-blue-900 dark:text-gray-100 bg-teal-light/40 px-2 py-0.5 rounded-full">
              ${template.price}
            </span>
          ) : (
            <span className="text-xs font-medium text-teal bg-teal/15 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">
              Free
            </span>
          )}
        </div>
        <h3 className="text-lg font-semibold text-blue-900 dark:text-gray-100 mt-1.5">{template.name}</h3>
        <p className="text-sm text-blue-600/70 dark:text-gray-300 mt-1 leading-relaxed break-words whitespace-pre-wrap">{template.description}</p>
      </div>
    </Link>
  );
}
