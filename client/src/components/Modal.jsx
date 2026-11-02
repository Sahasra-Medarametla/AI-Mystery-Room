import { useEffect } from 'react';
import { X } from 'lucide-react';
export default function Modal({ open, onClose, title, children, wide = false }) {
  useEffect(() => { if (!open) return; const onKey = (event) => event.key === 'Escape' && onClose(); window.addEventListener('keydown', onKey); document.body.style.overflow = 'hidden'; return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; }; }, [open, onClose]);
  if (!open) return null;
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className={`modal-panel ${wide ? 'modal-wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}><div className="modal-head"><div><span className="eyebrow">CASEFILE DETAIL</span><h2>{title}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close"><X size={18} /></button></div><div className="modal-content">{children}</div></section></div>;
}
