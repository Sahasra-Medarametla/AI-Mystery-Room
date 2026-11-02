import { useEffect, useState } from 'react';
import { Fingerprint, ScanSearch } from 'lucide-react';
const messages = ['Drafting the case file', 'Building suspect profiles', 'Preparing the evidence', 'Connecting the loose ends'];
export default function LoadingScreen() {
  const [step, setStep] = useState(0);
  useEffect(() => { const timer = setInterval(() => setStep((value) => (value + 1) % messages.length), 2600); return () => clearInterval(timer); }, []);
  return <main className="loading-page"><div className="loading-card"><div className="loading-orbit"><div className="orbit-ring" /><span className="loading-icon"><Fingerprint size={35} /></span><i /><i /><i /></div><span className="eyebrow">CASE GENERATION IN PROGRESS</span><h1>Building your<br /><em>mystery.</em></h1><p className="loading-message"><ScanSearch size={16} /> {messages[step]}<span className="blink">_</span></p><div className="loading-track"><span /></div><p className="muted small">The best investigators notice what others miss.</p></div></main>;
}
