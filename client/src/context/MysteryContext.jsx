import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { caseApi } from '../services/api.js';

const MysteryContext = createContext(null);
export function MysteryProvider({ children }) {
  const [credentials, setCredentials] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mysteryCredentials') || 'null'); } catch { return null; }
  });
  const [caseData, setCaseData] = useState(null);
  const [result, setResult] = useState(null);

  const createCase = useCallback(async (premise, difficulty) => {
    const { data } = await caseApi.create({ premise, difficulty });
    const nextCredentials = { caseId: data.caseId, accessToken: data.accessToken };
    localStorage.setItem('mysteryCredentials', JSON.stringify(nextCredentials));
    setCredentials(nextCredentials);
    setCaseData(data.case);
    setResult(null);
    return nextCredentials.caseId;
  }, []);
  const loadCase = useCallback(async (id = credentials?.caseId) => {
    if (!id || !credentials?.accessToken) throw new Error('This case is not available on this device. Start a new investigation.');
    const { data } = await caseApi.get(id, credentials.accessToken);
    setCaseData(data.case);
    return data.case;
  }, [credentials]);
  const clearCase = useCallback(() => {
    localStorage.removeItem('mysteryCredentials');
    setCredentials(null); setCaseData(null); setResult(null);
  }, []);
  const value = useMemo(() => ({ credentials, caseData, setCaseData, result, setResult, createCase, loadCase, clearCase }), [credentials, caseData, result, createCase, loadCase, clearCase]);
  return <MysteryContext.Provider value={value}>{children}</MysteryContext.Provider>;
}
export const useMystery = () => useContext(MysteryContext);
