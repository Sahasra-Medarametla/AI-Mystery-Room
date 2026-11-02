import { ArrowUpRight, Fingerprint } from 'lucide-react';
const colors = ['#8b5cf6', '#38bdf8', '#d09a61', '#d86f79', '#73bda3'];
export default function SuspectCard({ suspect, index = 0, onClick, selected = false, compact = false }) {
  const initials = suspect.name.split(' ').map((part) => part[0]).slice(0, 2).join('');
  return <button className={`suspect-card ${selected ? 'suspect-selected' : ''} ${compact ? 'suspect-compact' : ''}`} onClick={onClick}>
    <div className="suspect-photo" style={{ '--portrait': colors[index % colors.length] }}><div className="portrait-halo" /><div className="portrait-head" /><div className="portrait-body" /><span className="portrait-initials">{initials}</span><span className="photo-tag">PERSON OF INTEREST</span>{selected && <span className="selected-mark"><Fingerprint size={17} /></span>}</div>
    <div className="suspect-info"><div className="suspect-name-row"><h3>{suspect.name}</h3><ArrowUpRight size={15} /></div><p>{suspect.occupation || suspect.relationship}</p><span className="suspect-age">AGE {suspect.age || '—'}</span></div>
  </button>;
}
