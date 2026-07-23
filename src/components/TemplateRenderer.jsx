import React from 'react';

const TemplateRenderer = ({ template, scale = 1, width = 800, height = 500 }) => {
  if (!template) return null;

  const bg = template.background || { type: 'solid', color: '#1a1a2e' };
  const fonts = template.fonts || { heading: 'Inter', body: 'Inter' };
  const style = template.style || { borderRadius: 12, padding: 40, textAlign: 'center' };

  const getBgStyle = () => {
    switch (bg.type) {
      case 'gradient':
        return { background: `linear-gradient(135deg, ${bg.from || '#1a1a2e'}, ${bg.to || '#16213e'})` };
      case 'image':
        return { backgroundImage: `url(${bg.url})`, backgroundSize: 'cover', backgroundPosition: 'center' };
      default:
        return { background: bg.color || '#1a1a2e' };
    }
  };

  const renderElement = (el, idx) => {
    const baseStyle = {
      position: 'absolute',
      left: `${el.x || 50}%`,
      top: `${el.y || 50}%`,
      transform: 'translate(-50%, -50%)',
      color: el.color || '#ffffff',
      fontSize: el.fontSize || 16,
      fontFamily: el.type === 'heading' ? fonts.heading : fonts.body,
      textAlign: style.textAlign || 'center',
      width: el.width ? `${el.width}%` : 'auto',
      maxWidth: '90%',
      lineHeight: 1.4,
    };

    switch (el.type) {
      case 'heading':
        return (
          <div key={idx} style={{ ...baseStyle, fontSize: el.fontSize || 32, fontWeight: 700, letterSpacing: '-0.02em' }}>
            {el.text}
          </div>
        );
      case 'paragraph':
        return (
          <div key={idx} style={{ ...baseStyle, fontSize: el.fontSize || 16, fontWeight: 400, opacity: 0.85 }}>
            {el.text}
          </div>
        );
      case 'button':
        return (
          <div
            key={idx}
            style={{
              ...baseStyle,
              background: el.bg || '#38bdf8',
              color: el.color || '#ffffff',
              padding: '12px 32px',
              borderRadius: style.borderRadius || 8,
              fontSize: el.fontSize || 15,
              fontWeight: 600,
              display: 'inline-block',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
            }}
          >
            {el.text}
          </div>
        );
      case 'divider':
        return (
          <div
            key={idx}
            style={{
              ...baseStyle,
              width: el.width ? `${el.width}%` : '60%',
              height: 2,
              background: `linear-gradient(90deg, transparent, ${el.color || '#38bdf8'}, transparent)`,
              borderRadius: 1,
            }}
          />
        );
      case 'icon':
        return (
          <div key={idx} style={{ ...baseStyle, fontSize: el.fontSize || 40 }}>
            {el.text}
          </div>
        );
      case 'image':
        return (
          <img
            key={idx}
            src={el.src}
            alt={el.text || ''}
            style={{
              ...baseStyle,
              width: el.width ? `${el.width}%` : '60%',
              height: 'auto',
              objectFit: 'contain',
              borderRadius: style.borderRadius || 8,
            }}
          />
        );
      default:
        return (
          <div key={idx} style={baseStyle}>{el.text}</div>
        );
    }
  };

  return (
    <div
      style={{
        width,
        height,
        borderRadius: style.borderRadius || 12,
        overflow: 'hidden',
        position: 'relative',
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        ...getBgStyle(),
      }}
    >
      <div style={{ padding: style.padding || 40, width: '100%', height: '100%', position: 'relative' }}>
        {template.title && (
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '12%',
              transform: 'translate(-50%, -50%)',
              fontSize: 36,
              fontWeight: 800,
              color: '#ffffff',
              fontFamily: fonts.heading,
              textAlign: 'center',
              width: '90%',
              letterSpacing: '-0.03em',
              lineHeight: 1.2,
              textShadow: '0 2px 10px rgba(0,0,0,0.3)',
            }}
          >
            {template.title}
          </div>
        )}
        {template.subtitle && (
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '25%',
              transform: 'translate(-50%, -50%)',
              fontSize: 18,
              fontWeight: 400,
              color: 'rgba(255,255,255,0.7)',
              fontFamily: fonts.body,
              textAlign: 'center',
              width: '80%',
            }}
          >
            {template.subtitle}
          </div>
        )}
        {(template.elements || []).map(renderElement)}
      </div>
    </div>
  );
};

export default TemplateRenderer;
