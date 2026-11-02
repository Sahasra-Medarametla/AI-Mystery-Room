import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import CreateMystery from './pages/CreateMystery.jsx';
import InvestigationRoom from './pages/InvestigationRoom.jsx';
import Accusation from './pages/Accusation.jsx';
import Results from './pages/Results.jsx';
import { useMystery } from './context/MysteryContext.jsx';

function Layout({ children, hideNav = false }) { return <>{!hideNav && <Navbar />}{children}</>; }
export default function App() {
  const { credentials } = useMystery();
  return <Routes>
    <Route path="/" element={<Layout><Home /></Layout>} />
    <Route path="/create" element={<Layout><CreateMystery /></Layout>} />
    <Route path="/case/:id" element={credentials ? <Layout><InvestigationRoom /></Layout> : <Navigate to="/create" replace />} />
    <Route path="/case/:id/accuse" element={credentials ? <Layout><Accusation /></Layout> : <Navigate to="/create" replace />} />
    <Route path="/case/:id/results" element={credentials ? <Layout><Results /></Layout> : <Navigate to="/create" replace />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}
