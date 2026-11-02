import { Link, useLocation } from 'react-router-dom';
import { Fingerprint, ArrowUpRight } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  return <header className="nav-wrap"><nav className="navbar shell"><Link className="brand" to="/"><span className="brand-mark"><Fingerprint size={21} /></span><span>CASEFILE<span className="brand-dot">.</span></span></Link><div className="nav-links"><a href="/#how-it-works">How it works</a><a href="/#features">The experience</a></div><Link className={`nav-cta ${location.pathname === '/create' ? 'nav-cta-active' : ''}`} to="/create">Start an investigation <ArrowUpRight size={15} /></Link></nav></header>;
}
