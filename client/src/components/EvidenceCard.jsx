import { ArrowUpRight, Check, FileText, MessageCircle, Camera, Video, Mic2, Search } from 'lucide-react';
const icons = { whatsapp: MessageCircle, image: Camera, cctv: Video, document: FileText, witness: Mic2 };
export default function EvidenceCard({ evidence, discovered = false, onClick, index = 0 }) {
  const Icon = icons[evidence.type] || Search;
  const label = evidence.type === 'whatsapp' ? 'MESSAGE LOG' : evidence.type === 'image' ? 'PHOTO EVIDENCE' : evidence.type === 'cctv' ? 'SURVEILLANCE' : evidence.type === 'witness' ? 'WITNESS RECORD' : 'DOCUMENT';
  return <button className={`evidence-card ${discovered ? 'evidence-discovered' : ''}`} onClick={onClick} style={{ '--delay': `${index * 70}ms` }}><div className={`evidence-thumb thumb-${evidence.type}`}><span className="thumb-grid" /><Icon size={25} strokeWidth={1.5} /><span className="thumb-id">{evidence.evidenceId}</span>{discovered && <span className="discovered-badge"><Check size={12} /></span>}</div><div className="evidence-info"><span className="evidence-type"><Icon size={12} /> {label}</span><h3>{evidence.title}</h3><p>{evidence.description}</p><div className="evidence-bottom"><span>{discovered ? 'CLUE LOGGED' : 'OPEN EVIDENCE'}</span><ArrowUpRight size={15} /></div></div></button>;
}
