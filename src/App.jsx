import React, { useState, useEffect, useRef } from 'react';
// Ho usato 'QrCode' al posto di 'ScanBarcode' per compatibilità
import { 
  Truck, Navigation, Fuel, User, LogOut, Camera, X, Check, Clock, 
  Wifi, ChevronDown, Lock, Droplet, CreditCard, ArrowRight, 
  AlertTriangle, RefreshCw, History, Users, Calendar, AlertOctagon, 
  FileText, QrCode, CheckCircle, Smartphone, ScanLine, Edit2, MapPin,
  Wrench, AlertCircle, Disc, HelpCircle, Info, Search, Hash
} from 'lucide-react';

// ==========================================================================================
// ⚠️ CONFIGURAZIONE API ⚠️
// ==========================================================================================
const API_URL = "https://script.google.com/macros/s/AKfycbz8mQgiROz0RkNHE5gSbUkyy8VyDu-09Cqx_UJlpFLHDyaj6NXtt5v_ArSlGwTdxi3T/exec"; 

// ==========================================================================================
// --- ICONE SPIE REALI (ISO STANDARD - SVG INLINE) ---
// ==========================================================================================
// Queste icone sono disegnate per replicare esattamente i simboli standard del cruscotto.

const IconMotore = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19 5h-2V3h-2v2h-2V3h-2v2H9V3H7v2H5v4l-1.4 1.4L5 11.8V19h14v-7.2l1.4-1.4L19 9V5zM8 14h2v2H8v-2zm6 2h-2v-2h2v2z" />
    <path d="M4,10 h1 v5 h-1 z M20,10 h1 v5 h-1 z"/>
  </svg>
);

const IconOlio = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19,15c0,2.8-2.2,5-5,5H7c-2.2,0-4-1.8-4-4v-1.4l2.8-7.6l0.9-0.3C7.3,6.5,7.9,6.4,8.5,6.5l0.6-3.5h2.4v2.1h3.8L18,11.4 C18.6,12.5,19,13.7,19,15z M20.5,3c-0.8,0-1.5,0.7-1.5,1.5c0,0.3,0.1,0.5,0.2,0.7l2.1,2.5l2.1-2.5C23.4,5,23.5,4.8,23.5,4.5 C23.5,3.7,22.8,3,20.5,3z"/>
  </svg>
);

const IconBatteria = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M16,4h-1V2h-2v2H9v2H8C6.9,6,6,6.9,6,8v12c0,1.1,0.9,2,2,2h8c1.1,0,2-0.9,2-2V8c0-1.1-0.9-2-2-2h-1V4z M10,14H8v-2h2V14z M16,14h-4v-2h4V14z"/>
    <rect x="9" y="9" width="6" height="2" fill="white" opacity="0.3"/>
  </svg>
);

const IconTemperatura = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12.5,11.1V6c0-1.7-1.3-3-3-3s-3,1.3-3,3v5.1c-1.3,0.9-2,2.4-2,4c0,2.8,2.2,5,5,5s5-2.2,5-5C14.5,13.5,13.8,12,12.5,11.1z M10.5,6c0-0.6,0.4-1,1-1s1,0.4,1,1v3h-2V6z"/>
    <path d="M16.8,17c0.6,0,1.1-0.2,1.5-0.6l1.1,1.1c-0.7,0.7-1.6,1.1-2.6,1.1s-2-0.4-2.6-1.1l1.1-1.1C15.7,16.8,16.2,17,16.8,17z M16.8,13c0.6,0,1.1-0.2,1.5-0.6l1.1,1.1c-0.7,0.7-1.6,1.1-2.6,1.1s-2-0.4-2.6-1.1l1.1-1.1C15.7,12.8,16.2,13,16.8,13z M5.2,17c-0.6,0-1.1-0.2-1.5-0.6l-1.1,1.1c0.7,0.7,1.6,1.1,2.6,1.1s2-0.4,2.6-1.1l-1.1-1.1C6.3,16.8,5.8,17,5.2,17z M5.2,13c-0.6,0-1.1-0.2-1.5-0.6l-1.1,1.1c0.7,0.7,1.6,1.1,2.6,1.1s2-0.4,2.6-1.1l-1.1-1.1C6.3,12.8,5.8,13,5.2,13z"/>
  </svg>
);

const IconFreni = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" strokeWidth="2"/>
    <path d="M11,8h2v5h-2V8z M11,15h2v2h-2V15z"/>
    <path d="M4,12c0-3.3,2-6.2,5-7.4L8.3,3C4.2,4.6,1.5,8.4,1.5,12.9c0,4.4,2.7,8.2,6.8,9.9l0.7-1.6C6,19.9,4,16.5,4,12z"/>
    <path d="M20,12c0,3.3-2,6.2-5,7.4l0.7,1.6c4.1-1.7,6.8-5.4,6.8-9.9c0-4.4-2.7-8.2-6.8-9.9l-0.7,1.6C18,5.8,20,9.1,20,12z"/>
  </svg>
);

const IconPneumatici = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12,5c-3.9,0-7,3.1-7,7c0,1.7,0.6,3.3,1.6,4.6l-1.6,1.2C3.6,16.2,3,14.2,3,12c0-5,4-9,9-9s9,4,9,9c0,2.2-0.6,4.2-2,5.8 l-1.6-1.2C18.4,15.3,19,13.7,19,12C19,8.1,15.9,5,12,5z"/>
    <path d="M11,17v2h2v-2H11z M11,9h2v6h-2V9z"/>
    <path d="M6.5,19l1.5,0l0,2l-2,0L6.5,19z M10.5,19l1.5,0l0,2l-2,0L10.5,19z M14.5,19l1.5,0l0,2l-2,0L14.5,19z"/>
  </svg>
);

// ==========================================================================================
// --- UTILITY ---
// ==========================================================================================

const fetchWithRetry = async (url, options = {}, retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response;
        } catch (error) {
            if (i < retries - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
            } else {
                throw error;
            }
        }
    }
};

const MOCK_DATA = {
    drivers: { '12345': 'Mario Rossi (Demo)', '67890': 'Luigi Verdi (Demo)' },
    vehicles: [
        { targa: 'AA 123 BB', modello: 'Fiat Ducato (Demo)', lastKm: 154300, lastDriver: 'Luigi V.' },
        { targa: 'CC 456 DD', modello: 'Iveco Daily (Demo)', lastKm: 89000, lastDriver: 'Mario R.' }
    ],
    stations: [{ id: 1, nome: 'Distributore Demo' }, { id: 2, nome: 'Stazione Ovest (Demo)' }],
    fuelPins: [{ number: '700012345', pin: '1234' }, { number: '700067890', pin: '5678' }],
    history: [],
    driverHistory: []
};

const isDemoMode = () => !API_URL || API_URL.includes("INSERISCI_QUI");

// ==========================================================================================
// --- CHIAMATE API ---
// ==========================================================================================

const apiFetchDriverName = async (matricola) => {
  if (isDemoMode()) { await new Promise(r => setTimeout(r, 500)); return MOCK_DATA.drivers[matricola] ? { success: true, name: MOCK_DATA.drivers[matricola] } : { success: false }; }
  try {
    const res = await fetchWithRetry(`${API_URL}?action=getDriver&matricola=${matricola}`);
    return await res.json();
  } catch (error) {
    return MOCK_DATA.drivers[matricola] ? { success: true, name: MOCK_DATA.drivers[matricola] } : { success: false, error: "Errore connessione" };
  }
};

const apiFetchVehicles = async () => {
  if (isDemoMode()) return MOCK_DATA.vehicles;
  try {
    const response = await fetchWithRetry(`${API_URL}?action=getVehicles`);
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) { return MOCK_DATA.vehicles; }
};

const apiFetchVehicleHistory = async (targa) => {
  if (isDemoMode()) { await new Promise(r => setTimeout(r, 500)); return MOCK_DATA.history; }
  try {
    const res = await fetchWithRetry(`${API_URL}?action=getHistory&targa=${targa}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) { return []; }
};

const apiFetchDriverPersonalHistory = async (matricola) => {
  if (isDemoMode()) { await new Promise(r => setTimeout(r, 500)); return MOCK_DATA.driverHistory; }
  try {
    const res = await fetchWithRetry(`${API_URL}?action=getDriverHistory&matricola=${matricola}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) { return []; }
};

const apiFetchStations = async () => {
  try {
    const res = await fetchWithRetry(`${API_URL}?action=getStations`);
    const data = await res.json();
    return Array.isArray(data) ? data : MOCK_DATA.stations;
  } catch (error) { return MOCK_DATA.stations; }
};

const apiFetchFuelPins = async () => {
  if (isDemoMode()) return MOCK_DATA.fuelPins;
  try {
    const res = await fetchWithRetry(`${API_URL}?action=getFuelCardPins`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) { return []; }
};

const apiCheckRemoteUpdates = async (driverName) => {
  try {
    const res = await fetchWithRetry(`${API_URL}?action=checkRemoteStart&driverName=${driverName}`);
    return await res.json();
  } catch (error) { throw error; }
};

const apiStartShift = async (shiftData) => {
  try {
    const payload = { 
        type: 'START',
        targa: shiftData.targa,
        driver: shiftData.user?.matricola || 'N/D',
        driverName: shiftData.user?.name || 'Sconosciuto',
        start: shiftData.startKm, 
        anomaly: shiftData.anomaly
    };
    fetchWithRetry(API_URL, { method: 'POST', body: JSON.stringify(payload) }).catch(console.error);
  } catch (error) { console.error(error); }
};

const apiLogFuel = async (session, fuelData) => {
  try {
    // FORMATTAZIONE PER GOOGLE SHEETS (ITALIANO) e AGGIUNTA ID
    const formattedFuelData = {
        ...fuelData,
        importo: fuelData.importo ? fuelData.importo.toString().replace('.', ',') : '',
        litri: fuelData.litri ? fuelData.litri.toString().replace('.', ',') : '',
        fuelId: fuelData.id // Importante per la sovrascrittura
    };

    const payload = {
      type: 'FUEL',
      driver: session.user.matricola,
      driverName: session.user.name,
      targa: session.targa,
      ...formattedFuelData
    };
    await fetchWithRetry(API_URL, { method: 'POST', body: JSON.stringify(payload) });
    return { success: true };
  } catch (error) {
    showCustomAlert("Errore di Rete", "Impossibile salvare il rifornimento.", 'danger');
    return { success: false };
  }
};

const apiReportIssue = async (session, reportData) => {
  try {
    const payload = {
      type: 'REPORT',
      driver: session.user.matricola,
      driverName: session.user.name,
      targa: session.targa,
      ...reportData
    };
    await fetchWithRetry(API_URL, { method: 'POST', body: JSON.stringify(payload) });
    return { success: true };
  } catch (error) {
    showCustomAlert("Errore Invio", "Impossibile inviare la segnalazione.", 'danger');
    return { success: false };
  }
};

const apiSaveLog = async (logData) => {
  try {
    const payload = { 
        type: 'END',
        targa: logData.targa,
        end: logData.end,
        totalKm: logData.totalKm,
        fuelOperations: logData.fuelLogs,
        anomaly: logData.anomaly,
        driver: logData.user?.matricola || 'N/D',
        driverName: logData.user?.name || 'Sconosciuto',
        start: logData.startKm
    };

    await fetchWithRetry(API_URL, { method: 'POST', body: JSON.stringify(payload) });
    return { success: true };
  } catch (error) {
    showCustomAlert("Errore Critico", "Errore nel salvataggio finale.", 'danger');
    return { success: false };
  }
};

// ==========================================================================================
// --- COMPONENTI UI BASE ---
// ==========================================================================================

let setCustomAlertState = () => {};
const showCustomAlert = (title, message, type = 'info') => { setCustomAlertState({ show: true, title, message, type }); };

const CustomAlertProvider = ({ children }) => {
    const [alertState, setAlertState] = useState({ show: false, title: '', message: '', type: 'info' });
    setCustomAlertState = (state) => setAlertState(state);
    
    if (!alertState.show) return <>{children}</>;

    const colors = {
        success: { bg: 'bg-emerald-50', text: 'text-emerald-800', icon: <CheckCircle className="w-10 h-10 text-emerald-500"/> },
        danger: { bg: 'bg-red-50', text: 'text-red-800', icon: <AlertOctagon className="w-10 h-10 text-red-500"/> },
        warning: { bg: 'bg-orange-50', text: 'text-orange-800', icon: <AlertTriangle className="w-10 h-10 text-orange-500"/> },
        info: { bg: 'bg-blue-50', text: 'text-blue-800', icon: <Smartphone className="w-10 h-10 text-blue-500"/> }
    };
    const style = colors[alertState.type] || colors.info;

    return (
        <>
            {children}
            <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4 animate-in fade-in">
                <div className={`w-full max-w-xs rounded-3xl p-6 shadow-2xl ${style.bg} flex flex-col items-center text-center`}>
                    <div className="mb-4">{style.icon}</div>
                    <h3 className={`text-xl font-bold mb-2 ${style.text}`}>{alertState.title}</h3>
                    <p className={`text-sm mb-6 ${style.text}`}>{alertState.message}</p>
                    <button 
                        onClick={() => setAlertState(s => ({ ...s, show: false }))}
                        className={`px-6 py-2 rounded-xl font-bold text-white shadow-lg active:scale-95 transition-transform ${alertState.type === 'danger' ? 'bg-red-500' : 'bg-blue-600'}`}
                    >
                        OK
                    </button>
                </div>
            </div>
        </>
    );
};

const Button = ({ onClick, children, variant = 'primary', className = '', disabled = false, icon: Icon, loading = false }) => {
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-300",
    success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-300",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-red-300",
    warning: "bg-orange-500 text-white hover:bg-orange-600 shadow-orange-300",
    outline: "border-2 border-gray-200 text-gray-600 bg-white"
  };
  return (
    <button 
      onClick={onClick} 
      disabled={disabled || loading} 
      className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center shadow-lg transition-all active:scale-95 text-sm uppercase tracking-wider ${variants[variant]} ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {loading ? <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> : Icon && <Icon className="w-5 h-5 mr-2" />} 
      {loading ? 'Attendere...' : children}
    </button>
  );
};

const Input = ({ label, type = "text", value, onChange, placeholder, icon: Icon }) => (
  <div className="mb-4">
    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">{label}</label>
    <div className="relative flex items-center">
      {Icon && <Icon className="absolute left-4 w-5 h-5 text-gray-400" />}
      <input 
        type={type} 
        value={value} 
        onChange={onChange} 
        placeholder={placeholder} 
        className="w-full p-4 pl-12 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-xl focus:outline-none transition-all font-bold text-gray-800 text-lg" 
      />
    </div>
  </div>
);

// ==========================================================================================
// --- SOTTO-COMPONENTI (Scanner, Modali) ---
// ==========================================================================================

const DriverHistoryModal = ({ matricola, onClose }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetchDriverPersonalHistory(matricola).then(data => { setHistory(data); setLoading(false); });
  }, [matricola]);

  return (
    <div className="fixed inset-0 z-[90] bg-black/80 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 relative flex flex-col max-h-[80vh]">
        <div className="flex justify-between items-center mb-4 border-b pb-4">
          <div className="flex items-center gap-2">
             <div className="bg-blue-100 p-2 rounded-full text-blue-600"><FileText size={20}/></div>
             <div><h3 className="text-lg font-bold">Miei Turni</h3><p className="text-[10px] text-gray-400 font-bold uppercase">Ultimi 14 gg</p></div>
          </div>
          <button onClick={onClose}><X size={20}/></button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-3">
          {loading ? <p className="text-center text-gray-400">Caricamento...</p> : history.map((item, idx) => (
              <div key={idx} className="border rounded-xl p-3 shadow-sm">
                <div className="flex justify-between text-xs font-bold text-gray-500 mb-2">
                  <span><Calendar size={12} className="inline"/> {new Date(item.date).toLocaleDateString()}</span>
                  <span className="bg-blue-50 text-blue-600 px-2 rounded">{item.targa}</span>
                </div>
                <div className="flex justify-between items-end">
                  <div><p className="text-[10px] text-gray-400">Tratta</p><p className="font-mono text-sm">{item.start} → {item.end}</p></div>
                  <div className="text-right"><p className="text-[10px] text-gray-400">Totale</p><p className="font-black text-blue-600">{item.total} km</p></div>
                </div>
              </div>
          ))}
          {!loading && history.length === 0 && <p className="text-center text-gray-400 text-sm">Nessun dato trovato.</p>}
        </div>
      </div>
    </div>
  );
};

const VehicleHistoryModal = ({ targa, onClose }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetchVehicleHistory(targa).then(data => { setHistory(data); setLoading(false); });
  }, [targa]);

  return (
    <div className="fixed inset-0 z-[80] bg-black/80 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 relative">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <div><h3 className="text-lg font-bold">Storico Veicolo</h3><p className="text-xs text-blue-600 font-bold">{targa}</p></div>
          <button onClick={onClose}><X size={20}/></button>
        </div>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {loading ? <p className="text-center text-gray-400">Caricamento...</p> : history.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="bg-white p-2 rounded-full shadow-sm text-gray-400"><User size={16}/></div>
                <div className="flex-1"><p className="text-sm font-bold">{item.driver}</p><p className="text-xs text-gray-500">{new Date(item.date).toLocaleDateString()}</p></div>
                <div className="text-right"><p className="text-xs text-gray-400 font-bold">Fine</p><p className="font-mono font-bold">{item.km}</p></div>
              </div>
          ))}
          {!loading && history.length === 0 && <p className="text-center text-gray-400 text-sm">Nessun dato.</p>}
        </div>
      </div>
    </div>
  );
};

// NUOVA FUNZIONE: PIN MODAL
const PinModal = ({ onClose }) => {
  const [pins, setPins] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetchFuelPins().then(data => { setPins(data); setLoading(false); });
  }, []);

  const filteredPins = pins.filter(p => p.number.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fixed inset-0 z-[85] bg-black/80 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 relative shadow-2xl flex flex-col max-h-[80vh]">
        <div className="flex justify-between items-center mb-4 border-b pb-4">
           <h3 className="text-xl font-bold flex items-center gap-2 text-slate-700"><Hash/> PIN Tessere</h3>
           <button onClick={onClose}><X/></button>
        </div>
        <div className="mb-4 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20}/>
            <input 
                type="text" 
                placeholder="Cerca ultime cifre tessera..." 
                className="w-full bg-gray-100 p-3 pl-10 rounded-xl font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
                value={search}
                onChange={e => setSearch(e.target.value)}
            />
        </div>
        <div className="flex-1 overflow-y-auto space-y-2">
            {loading ? <div className="text-center p-4 text-gray-400">Caricamento PIN...</div> :
             filteredPins.length > 0 ? filteredPins.map((p, idx) => (
                <div key={idx} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-3">
                        <CreditCard className="text-slate-400"/>
                        <div>
                            <p className="text-xs text-slate-500 font-bold uppercase">Tessera</p>
                            {/* FIX: Visualizza numero completo */}
                            <p className="font-mono font-bold text-lg">{p.number}</p>
                        </div>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
                        <p className="text-[10px] text-slate-400 uppercase font-bold text-center">PIN</p>
                        <p className="text-2xl font-black text-slate-800">{p.pin}</p>
                    </div>
                </div>
             )) : <div className="text-center p-4 text-gray-400">Nessuna tessera trovata</div>
            }
        </div>
      </div>
    </div>
  );
};

const BarcodeScanner = ({ onScan, onClose }) => {
  const videoRef = useRef(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let stream = null;
    let interval = null;

    const startCamera = async () => {
      try {
        // OTTIMIZZAZIONE IOS: playsInline + facingMode object
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: { exact: "environment" } // Prova prima la back camera
            } 
        }).catch(() => {
             // Fallback se exact fallisce (es. desktop o alcuni android)
             return navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        });
        
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
            // Fondamentale per iOS per non andare fullscreen
            videoRef.current.setAttribute('playsinline', 'true'); 
        }

        if ('BarcodeDetector' in window) {
            // @ts-ignore
            const barcodeDetector = new window.BarcodeDetector({
                formats: ['code_128', 'code_39', 'ean_13', 'ean_8', 'qr_code']
            });
            interval = setInterval(async () => {
                if (videoRef.current) {
                    try {
                        const barcodes = await barcodeDetector.detect(videoRef.current);
                        if (barcodes.length > 0) {
                            onScan(barcodes[0].rawValue);
                        }
                    } catch (err) {}
                }
            }, 500);
        } else {
            // Fallback per dispositivi senza Barcode API nativa
            setTimeout(() => onScan('12345'), 2000); 
        }
      } catch (err) {
        console.error(err);
      }
    };
    startCamera();
    return () => {
        if (stream) stream.getTracks().forEach(track => track.stop());
        if (interval) clearInterval(interval);
    };
  }, []);
  
  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col items-center justify-center text-white overflow-hidden">
       <div className="absolute top-0 w-full p-4 flex justify-between z-10 bg-gradient-to-b from-black/80 to-transparent">
         <span className="font-bold">Scansione Badge</span>
         <button onClick={onClose} className="p-2 bg-white/20 rounded-full"><X size={24}/></button>
       </div>
       <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover"/>
       <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
           <div className="w-72 h-48 border-2 border-white/50 rounded-2xl relative">
              <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-green-500 -mt-1 -ml-1 rounded-tl-lg"></div>
              <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-green-500 -mt-1 -mr-1 rounded-tr-lg"></div>
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-green-500 -mb-1 -ml-1 rounded-bl-lg"></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-green-500 -mb-1 -mr-1 rounded-br-lg"></div>
              <div className="w-full h-0.5 bg-red-500 absolute top-1/2 -translate-y-1/2 animate-[scan_2s_infinite_alternate] shadow-[0_0_10px_red]"></div>
           </div>
       </div>
       <div className="absolute bottom-10 w-full text-center z-10 px-4"><p className="font-bold text-lg">Inquadra il codice a barre</p></div>
       <style>{`@keyframes scan { 0% { transform: translateY(-24px); opacity: 0.5; } 100% { transform: translateY(24px); opacity: 1; } }`}</style>
    </div>
  );
};

const RefuelingModal = ({ onClose, onSave, initialData }) => {
  const [stations, setStations] = useState([]);
  const [formData, setFormData] = useState(initialData || { id: Date.now(), importo: '', litri: '', tessera: '', impianto: '' });

  useEffect(() => { apiFetchStations().then(data => { setStations(data); }); }, []);

  const handleSave = () => {
      // MIGLIORIA 2: Validazione tutti i campi
      if (!formData.importo || !formData.litri || !formData.tessera || !formData.impianto) {
          showCustomAlert("Errore", "Compilare tutti i campi per salvare.", "warning");
          return;
      }
      onSave(formData);
      onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/80 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 relative shadow-2xl">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h3 className="text-xl font-bold flex items-center gap-2"><Fuel className="text-orange-600"/> Rifornimento</h3>
          <button onClick={onClose}><X/></button>
        </div>
        <div className="space-y-4">
           <div className="grid grid-cols-2 gap-4">
             <Input label="Euro (€)" type="number" icon={CreditCard} value={formData.importo} onChange={e => setFormData({...formData, importo: e.target.value})} />
             <Input label="Litri" type="number" icon={Droplet} value={formData.litri} onChange={e => setFormData({...formData, litri: e.target.value})} />
           </div>
           <div className="mb-4">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Numero Tessera</label>
                <div className="relative flex items-center w-full rounded-xl border-2 border-transparent focus-within:border-blue-500 bg-gray-50 overflow-hidden">
                    <div className="pl-4 pr-2 py-4 bg-gray-100 text-gray-500 font-bold border-r border-gray-200 flex items-center gap-2">
                        <CreditCard size={16}/> 
                        <span>POMEZIA -</span>
                    </div>
                    <input 
                        type="number" 
                        value={formData.tessera.replace('POMEZIA - ', '')} 
                        onChange={e => setFormData({...formData, tessera: `POMEZIA - ${e.target.value}`})} 
                        placeholder="1234" 
                        className="w-full p-4 bg-transparent outline-none font-bold text-gray-800 text-lg" 
                    />
                </div>
                <p className="text-[10px] text-gray-400 mt-1 ml-1 flex items-center gap-1">
                    <Info size={10} /> Il numero si trova sul retro della tessera.
                </p>
           </div>
           <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Impianto</label>
              <select className="w-full p-4 bg-gray-50 rounded-xl font-bold" value={formData.impianto} onChange={e => setFormData({...formData, impianto: e.target.value})}>
                 <option value="">Seleziona...</option>
                 {stations.map((s, i) => <option key={i} value={s.nome}>{s.nome}</option>)}
              </select>
           </div>
           <Button onClick={handleSave} variant="warning" icon={Check} className="mt-4">Salva</Button>
        </div>
      </div>
    </div>
  );
};

// --- NUOVO COMPONENTE: REPORT MODAL ---
const ReportModal = ({ onClose, onSave }) => {
  const [category, setCategory] = useState('Spia Accesa');
  const [notes, setNotes] = useState('');
  const [isStopped, setIsStopped] = useState(false);
  const [sending, setSending] = useState(false);

  const categories = [
    { id: 'Spia Accesa', label: 'Spia Cruscotto', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
    { id: 'Pneumatici', label: 'Pneumatici', icon: Disc, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200' },
    { id: 'Motore/Meccanica', label: 'Motore', icon: Wrench, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' },
    { id: 'Carrozzeria', label: 'Danni Esterni', icon: Truck, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' },
    { id: 'Altro', label: 'Altro', icon: HelpCircle, color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200' }
  ];

  const handleSend = async () => {
      if(!notes) return showCustomAlert("Errore", "Inserisci una descrizione del problema.", "warning");
      setSending(true);
      await onSave({ category, notes, isStopped });
      setSending(false);
      onClose();
  };

  return (
    <div className="fixed inset-0 z-[80] bg-black/80 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 relative shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h3 className="text-xl font-bold flex items-center gap-2 text-red-600"><AlertTriangle/> Segnala Guasto</h3>
          <button onClick={onClose}><X/></button>
        </div>
        <div className="space-y-4">
           <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Tipo Problema</label>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {categories.map((cat) => (
                    <button 
                        key={cat.id} 
                        onClick={() => setCategory(cat.id)}
                        className={`p-2 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${category === cat.id ? `${cat.bg} ${cat.border} ring-2 ring-blue-400` : 'bg-white border-gray-100 hover:bg-gray-50'}`}
                    >
                        <cat.icon className={cat.color} size={24} />
                        <span className="text-[10px] font-bold text-gray-600 text-center leading-tight">{cat.label}</span>
                    </button>
                ))}
              </div>
           </div>
           
           <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Descrizione Dettagliata</label>
              <textarea 
                className="w-full p-4 bg-gray-50 rounded-xl font-bold h-24 resize-none border-2 border-transparent focus:border-red-500 outline-none bg-gray-50" 
                placeholder="Descrivi il problema (es. spia olio accesa fissa)..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
           </div>

           <div className="flex items-center gap-3 bg-red-50 p-4 rounded-xl border border-red-100">
              <input type="checkbox" id="stopped" className="w-6 h-6 accent-red-600" checked={isStopped} onChange={e => setIsStopped(e.target.checked)}/>
              <label htmlFor="stopped" className="text-sm font-bold text-red-800">Il mezzo è fermo / non marciante?</label>
           </div>

           <Button onClick={handleSend} loading={sending} variant="danger" icon={Check} className="mt-4">Invia Segnalazione</Button>
        </div>
      </div>
    </div>
  );
};

// ==========================================================================================
// --- SCREENS ---
// ==========================================================================================

const LoginScreen = ({ onLogin }) => {
  const [matricola, setMatricola] = useState('');
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [imgError, setImgError] = useState(false);

  const performLogin = async (code) => {
    if(!code || loading) return;
    setLoading(true);
    
    try {
        // 1. Verifica Nome Autista
        const res = await apiFetchDriverName(code);
        
        if(res.success) {
            // 2. Se OK, passa alla gestione login (che controlla remote updates)
            // NON spegniamo il loading qui, per evitare il "freeze" visivo.
            await onLogin({ matricola: code, name: res.name });
            // Se il componente viene smontato, bene. Se no, potrebbe rimanere loading=true
            // ma in uno scenario felice, LoginScreen viene rimpiazzato.
        } else {
            setLoading(false);
            showCustomAlert('Errore Login', 'Matricola non trovata.', 'danger');
        }
    } catch (e) {
        setLoading(false);
        showCustomAlert('Errore di Rete', 'Impossibile connettersi.', 'danger');
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 p-6 relative overflow-hidden">
      {showScanner && <BarcodeScanner onScan={(c) => {setShowScanner(false); performLogin(c);}} onClose={() => setShowScanner(false)} />}
      
      <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[50%] bg-blue-600/20 rounded-full blur-3xl"></div>
      
      <div className="flex-1 flex flex-col justify-center relative z-10">
        <div className="bg-white rounded-3xl p-6 mb-8 shadow-2xl flex items-center justify-center h-32">
           {!imgError ? 
             <img src="https://www.camtrasportisrl.com/wp-content/uploads/2025/09/logo.png" className="max-h-full max-w-full object-contain" onError={() => setImgError(true)} /> 
             : <Truck className="w-16 h-16 text-blue-600"/>
           }
        </div>
        
        <h1 className="text-white text-4xl font-black text-center mb-2">Driver<span className="text-blue-400">Log</span></h1>
        <p className="text-slate-400 text-center mb-8">Accesso Autisti</p>

        <div className="bg-white rounded-3xl p-6 shadow-xl">
           <Button onClick={() => setShowScanner(true)} disabled={loading} className="mb-6" icon={Camera}>Scansiona Badge</Button>
           <div className="text-center text-xs text-gray-400 font-bold uppercase mb-4 border-t pt-4">Oppure manuale</div>
           <div className="flex gap-2">
             <input className="w-full bg-gray-100 rounded-xl p-4 font-bold text-center text-lg outline-none focus:ring-2 focus:ring-blue-500" 
                    placeholder="Matricola" 
                    type="number"
                    value={matricola} 
                    onChange={e => setMatricola(e.target.value)}
                    disabled={loading}
             />
             <button onClick={() => performLogin(matricola)} disabled={loading || !matricola} className="bg-blue-600 text-white rounded-xl px-6 font-bold disabled:opacity-50">
               {loading ? <RefreshCw className="animate-spin"/> : <ArrowRight/>}
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

const StartShiftScreen = ({ user, onStart, onLogout }) => {
  const [targa, setTarga] = useState('');
  const [km, setKm] = useState('');
  const [vehicles, setVehicles] = useState([]);
  const [showNFC, setShowNFC] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [showMyHistory, setShowMyHistory] = useState(false);

  useEffect(() => {
     apiFetchVehicles().then(data => { setVehicles(data); setLoading(false); });
  }, []);

  const selectedVehicle = vehicles.find(v => v.targa === targa);

  const handleSubmit = () => {
    if(!targa || !km) return showCustomAlert("Mancano Dati", "Inserisci Targa e KM.", 'warning');
    const kmInt = parseInt(km);
    let anomaly = false;
    if(selectedVehicle && selectedVehicle.lastKm && kmInt < selectedVehicle.lastKm) {
        if(!window.confirm(`KM inseriti (${kmInt}) inferiori allo storico (${selectedVehicle.lastKm}). Confermi anomalia?`)) return;
        anomaly = true;
    }
    onStart({ targa, startKm: kmInt, startTime: new Date(), fuelLogs: [], anomaly });
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {showNFC && <NFCScanner onRead={t => {setTarga(t); setShowNFC(false);}} onCancel={() => setShowNFC(false)} />}
      {showHistory && <VehicleHistoryModal targa={targa} onClose={() => setShowHistory(false)} />}
      {showMyHistory && <DriverHistoryModal matricola={user.matricola} onClose={() => setShowMyHistory(false)} />}

      <div className="bg-white p-6 shadow-sm border-b flex justify-between items-center">
         <div><h2 className="text-xl font-bold">Ciao,</h2><p className="text-blue-600 font-black">{user.name}</p></div>
         <div className="flex items-center gap-2">
            <div className="bg-blue-50 p-2 rounded-full"><User className="text-blue-600" size={20}/></div>
            <button onClick={onLogout} className="bg-gray-100 p-2 rounded-full hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors"><LogOut size={20}/></button>
         </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <button 
           onClick={() => setShowMyHistory(true)}
           className="w-full mb-6 py-3 bg-white rounded-xl border-2 border-gray-100 text-sm font-bold text-gray-600 flex items-center justify-center gap-2 shadow-sm"
        >
           <Clock size={16} className="text-blue-500"/> Le mie ultime registrazioni
        </button>

        <div className="bg-white p-6 rounded-3xl shadow-sm border mb-6">
           <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-gray-400 uppercase">Veicolo</label>
              <button onClick={() => setShowNFC(true)} className="text-[10px] bg-slate-900 text-white px-3 py-1 rounded-full flex items-center gap-1"><Wifi size={10}/> NFC</button>
           </div>
           {loading ? <p className="text-sm text-gray-400">Caricamento...</p> : 
             <select value={targa} onChange={e => setTarga(e.target.value)} className="w-full p-4 bg-gray-50 rounded-xl font-bold text-lg">
                <option value="">Seleziona...</option>
                {vehicles.map((v, i) => <option key={i} value={v.targa}>{v.targa} - {v.modello}</option>)}
             </select>
           }
           {selectedVehicle && (
             <div className="mt-4">
               <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 mb-2">
                 <p className="text-xs text-blue-500 font-bold uppercase">Ultimo KM</p>
                 <div className="flex justify-between items-center">
                   <p className="text-2xl font-black text-blue-900">{selectedVehicle.lastKm}</p>
                   <button onClick={() => setKm(selectedVehicle.lastKm)} className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-bold">Usa</button>
                 </div>
               </div>
               <button onClick={() => setShowHistory(true)} className="w-full py-2 bg-gray-50 rounded-lg text-xs font-bold text-gray-500 flex items-center justify-center gap-2"><Users size={14}/> Vedi ultimi utilizzatori</button>
             </div>
           )}
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border">
           <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">KM Attuali</label>
           <input type="number" value={km} onChange={e => setKm(e.target.value)} className="w-full text-center text-4xl font-black bg-transparent border-b-2 border-gray-200 pb-2 focus:border-blue-500 outline-none" placeholder="000000" />
        </div>
      </div>

      <div className="p-6 bg-white border-t">
         <Button onClick={handleSubmit} icon={Navigation}>Inizia Turno</Button>
      </div>
    </div>
  );
};

const ActiveShiftScreen = ({ session, onEndShift, onAddFuel, onLogout, onUpdateFuel }) => {
  const [time, setTime] = useState("00:00:00");
  const [showFuel, setShowFuel] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showPins, setShowPins] = useState(false);
  const [editingFuel, setEditingFuel] = useState(null);

  useEffect(() => {
    const i = setInterval(() => {
       const diff = new Date() - new Date(session.startTime);
       setTime(new Date(diff).toISOString().substr(11, 8));
    }, 1000);
    return () => clearInterval(i);
  }, []);

  const handleFuelSaveLocal = (data) => {
      // Se c'era un editingFuel, significa che stiamo modificando, altrimenti aggiungendo
      if (editingFuel) {
          onUpdateFuel(data);
      } else {
          // Aggiunta standard (crea un ID nuovo nel modal se non passato)
          apiLogFuel(session, data); 
          onAddFuel(data);
      }
      setShowFuel(false);
      setEditingFuel(null);
  };

  const openFuelModal = (fuelLog = null) => {
      setEditingFuel(fuelLog);
      setShowFuel(true);
  };

  const handleReportSave = async (data) => {
      const res = await apiReportIssue(session, data);
      if(res.success) {
          showCustomAlert("Segnalazione Inviata", "Il guasto è stato notificato all'ufficio.", "success");
      }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {showFuel && <RefuelingModal onClose={() => setShowFuel(false)} onSave={handleFuelSaveLocal} initialData={editingFuel} />}
      {showReport && <ReportModal onClose={() => setShowReport(false)} onSave={handleReportSave} />}
      {showPins && <PinModal onClose={() => setShowPins(false)} />}
      
      <div className="bg-slate-900 text-white p-8 rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
         <button 
            onClick={onLogout} 
            className="absolute top-6 right-6 z-20 p-2 bg-white/10 rounded-full hover:bg-red-500/20 text-white/50 hover:text-white transition-colors"
            title="Logout"
         >
            <LogOut size={20}/>
         </button>

         <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
               <span className="bg-green-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase animate-pulse">In Corso</span>
               <div className="text-right pr-8"><p className="text-xs opacity-50">Driver</p><p className="font-bold">{session.user.name}</p></div>
            </div>
            <h2 className="text-4xl font-black mb-6">{session.targa}</h2>
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-white/10 p-3 rounded-xl"><p className="text-xs opacity-50">Start KM</p><p className="text-xl font-mono">{session.startKm}</p></div>
               <div className="bg-white/10 p-3 rounded-xl"><p className="text-xs opacity-50">Durata</p><p className="text-xl font-mono">{time}</p></div>
            </div>
         </div>
      </div>

      <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto">
         
         {/* Rifornimenti Box */}
         <div className="bg-white w-full p-6 rounded-3xl shadow-sm border text-center relative">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center justify-center gap-2"><Fuel size={20} className="text-orange-500"/> Rifornimenti</h3>
            
            <div className="space-y-2 mb-4">
            {session.fuelLogs.length > 0 ? 
               session.fuelLogs.map((log, idx) => (
                   <div key={log.id || idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                       <div className="text-left">
                           <p className="font-bold text-gray-800">€ {log.importo}</p>
                           <p className="text-xs text-gray-500">{log.litri}L - {log.impianto}</p>
                       </div>
                       <button onClick={() => openFuelModal(log)} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 text-blue-600">
                           <Edit2 size={16} />
                       </button>
                   </div>
               ))
               : <p className="text-gray-400 text-sm">Nessuno ancora</p>
            }
            </div>

            <div className="flex gap-2">
                <Button variant="warning" onClick={() => openFuelModal(null)} className="flex-1 text-xs" icon={Fuel}>Aggiungi</Button>
                <Button variant="outline" onClick={() => setShowPins(true)} className="flex-1 text-xs bg-slate-50 border-slate-200 text-slate-600" icon={Hash}>PIN Tessere</Button>
            </div>
         </div>

         {/* Guasti Box */}
         <div className="bg-white w-full p-6 rounded-3xl shadow-sm border border-red-100 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-red-500"></div>
            <h3 className="font-bold text-gray-800 mb-2 flex items-center justify-center gap-2"><Wrench size={20} className="text-red-500"/> Segnalazione Guasti</h3>
            <p className="text-xs text-gray-400 mb-4">Segnala spie, problemi meccanici o danni.</p>
            <Button variant="danger" onClick={() => setShowReport(true)} icon={AlertTriangle} className="bg-red-600 text-white border-none hover:bg-red-700 shadow-md">Apri Segnalazione</Button>
         </div>

         <div className="flex-1"></div>
         
         <Button variant="danger" onClick={onEndShift} icon={LogOut} className="shadow-xl shadow-red-200">Chiudi Turno</Button>
      </div>
    </div>
  );
};

const EndShiftScreen = ({ session, onSave, onCancel, onAddFuel, onUpdateFuel }) => {
  const [km, setKm] = useState('');
  const [step, setStep] = useState('INPUT'); // 'INPUT' | 'SUMMARY'
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFuelModal, setShowFuelModal] = useState(false);
  const [editingFuel, setEditingFuel] = useState(null);

  // Calcoli per il riepilogo
  const totalKm = km ? (parseInt(km) - session.startKm) : 0;
  const totalFuelCost = session.fuelLogs.reduce((acc, f) => acc + parseFloat(f.importo), 0);
  const totalLiters = session.fuelLogs.reduce((acc, f) => acc + parseFloat(f.litri), 0);
  const isKmError = km && parseInt(km) < session.startKm;

  const handleNext = () => {
     if(!km) return showCustomAlert("Errore", "Inserisci KM finali", "warning");
     if(isKmError) {
         if(!window.confirm(`ATTENZIONE: KM finali (${km}) minori di quelli iniziali (${session.startKm}). Vuoi procedere comunque?`)) return;
     }
     setTimeout(() => setStep('SUMMARY'), 50);
  };

  const openFuelModal = (fuelLog = null) => {
      setEditingFuel(fuelLog);
      setShowFuelModal(true);
  };

  const handleFuelSaveLocal = (data) => {
      if (editingFuel) {
          onUpdateFuel(data); // Aggiorna e sovrascrive
      } else {
          apiLogFuel(session, data);
          onAddFuel(data);
      }
      setShowFuelModal(false);
      setEditingFuel(null);
  };

  const handleSave = async () => {
     setSaving(true);
     const endKm = parseInt(km);
     
     // Call API
     const result = await apiSaveLog({ 
         ...session, 
         end: endKm, 
         totalKm: endKm - session.startKm,
         anomaly: isKmError || session.anomaly 
     });
     
     setSaving(false);
     
     if(result && result.success) {
        setShowSuccess(true);
        // Pulizia immediata per evitare che refresh riporti alla sessione
        localStorage.removeItem('driver_session_v2');
        setTimeout(() => {
            onSave();
        }, 3000);
     }
  };

  if(showSuccess) {
      return (
        <div className="flex flex-col h-full bg-emerald-500 items-center justify-center text-white p-6 animate-in fade-in">
           <div className="bg-white p-6 rounded-full shadow-2xl mb-6 scale-animation">
              <CheckCircle className="w-20 h-20 text-emerald-500" />
           </div>
           <h2 className="text-3xl font-black mb-2 text-center">Registrazione Completata!</h2>
           <p className="text-emerald-100 text-center font-medium">I dati sono stati salvati correttamente.</p>
           <p className="mt-8 text-sm opacity-70 animate-pulse">Chiusura automatica in corso...</p>
           <style>{`@keyframes scale-animation { 0% { transform: scale(0.5); opacity: 0; } 80% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } } .scale-animation { animation: scale-animation 0.5s ease-out; }`}</style>
        </div>
      );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
       {showFuelModal && <RefuelingModal onClose={() => setShowFuelModal(false)} onSave={handleFuelSaveLocal} initialData={editingFuel} />}
       <div className="bg-white p-6 shadow-sm border-b"><h2 className="text-xl font-black">{step === 'INPUT' ? 'Chiusura Turno' : 'Riepilogo Dati'}</h2></div>
       
       <div className="flex-1 p-6 overflow-y-auto">
          {step === 'INPUT' ? (
              <div className={`bg-white p-8 rounded-3xl shadow-lg border text-center mb-6 animate-in fade-in slide-in-from-bottom-4 ${isKmError ? 'border-red-500 ring-2 ring-red-100' : 'border-gray-100'}`}>
                 <p className="text-xs text-blue-600 font-bold uppercase mb-2">KM Partenza</p>
                 <p className="text-3xl font-mono font-black text-blue-900 mb-8">{session.startKm}</p>
                 
                 <label className={`block text-xs font-bold uppercase mb-4 ${isKmError ? 'text-red-500' : 'text-gray-400'}`}>
                    {isKmError ? 'ATTENZIONE: VALORE INFERIORE ALLA PARTENZA!' : 'Inserisci KM Arrivo'}
                 </label>
                 <input 
                    type="number" 
                    value={km} 
                    onChange={e => setKm(e.target.value)} 
                    className={`w-full text-center text-5xl font-black border-b-4 pb-2 bg-transparent outline-none transition-all ${isKmError ? 'border-red-500 text-red-600' : 'border-blue-500 focus:border-blue-700'}`}
                    autoFocus 
                    placeholder="000000"
                 />
                 {isKmError && <p className="text-red-500 text-xs mt-2 font-bold animate-pulse">Valore inferiore alla partenza!</p>}
              </div>
          ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-8">
                  {/* Vehicle Info Card */}
                  <div className="bg-blue-600 p-4 rounded-3xl shadow-lg text-white flex items-center gap-4">
                      <div className="bg-white/20 p-3 rounded-2xl"><Truck size={24}/></div>
                      <div>
                          <p className="text-xs opacity-70 uppercase font-bold tracking-wider">Veicolo in uso</p>
                          <p className="text-2xl font-black tracking-tight">{session.targa}</p>
                      </div>
                  </div>

                  <div className="bg-white p-6 rounded-3xl shadow-sm border">
                      <div className="grid grid-cols-2 gap-4 mb-4 border-b pb-4">
                          <div><p className="text-xs text-gray-400 font-bold uppercase">Inizio</p><p className="text-xl font-mono font-bold">{session.startKm}</p></div>
                          <div className="text-right"><p className="text-xs text-gray-400 font-bold uppercase">Fine</p><p className="text-xl font-mono font-bold text-blue-600">{km}</p></div>
                      </div>
                      <div className="flex justify-between items-center">
                          <span className="font-bold text-gray-800">KM Totali</span>
                          <span className="text-2xl font-black text-blue-600">{totalKm} km</span>
                      </div>
                      {isKmError && <p className="mt-2 text-xs text-red-500 font-bold bg-red-50 p-2 rounded flex items-center gap-1"><AlertTriangle size={12}/> Attenzione: KM finali minori!</p>}
                  </div>

                  <div className="bg-white p-6 rounded-3xl shadow-sm border">
                      <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><Fuel size={16} className="text-orange-500"/> Carburante</h3>
                      {session.fuelLogs.length > 0 ? (
                          <>
                            <div className="flex justify-between text-sm mb-4 bg-orange-50 p-3 rounded-xl border border-orange-100">
                                <span>Rifornimenti: <b>{session.fuelLogs.length}</b></span>
                                <span>Totale: <b>€ {totalFuelCost.toFixed(2)}</b></span>
                            </div>
                            <div className="space-y-2 mb-4">
                                {session.fuelLogs.map((log, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-xs p-2 bg-gray-50 rounded-lg border border-gray-100">
                                        <div className="flex items-center gap-2">
                                            <div className="bg-white p-1 rounded border border-gray-200"><MapPin size={10} className="text-gray-400"/></div>
                                            <div>
                                                <span className="font-bold text-gray-700 block">{log.impianto}</span>
                                                <span className="text-[10px] text-gray-500 flex items-center gap-1"><CreditCard size={10}/> Tessera: {log.tessera}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="block font-bold text-gray-900">€ {log.importo}</span>
                                            <span className="text-gray-500">{log.litri} L</span>
                                            <button onClick={() => openFuelModal(log)} className="ml-2 p-1 bg-blue-50 rounded text-blue-600"><Edit2 size={12}/></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                          </>
                      ) : (
                          <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 mb-4 animate-pulse">
                              <p className="text-sm font-bold text-orange-800 mb-1 flex items-center gap-2"><AlertTriangle size={14}/> Hai fatto rifornimento?</p>
                              <p className="text-xs text-orange-600">Non risultano rifornimenti. Se hai fatto carburante, inseriscilo ora.</p>
                          </div>
                      )}
                      
                      <Button 
                        variant="warning" 
                        onClick={() => setShowFuelModal(true)} 
                        icon={Fuel}
                        className="text-xs py-3 shadow-none border-2 border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100"
                      >
                        {session.fuelLogs.length === 0 ? "Sì, Aggiungi Rifornimento" : "Aggiungi Altro Rifornimento"}
                      </Button>
                  </div>
              </div>
          )}
       </div>

       <div className="p-6 bg-white border-t flex gap-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          {step === 'INPUT' ? (
             <>
               <button onClick={onCancel} className="flex-1 font-bold text-gray-400 hover:text-gray-600 transition-colors">Annulla</button>
               <div className="flex-[2]">
                  <Button onClick={handleNext} icon={ArrowRight}>Avanti</Button>
               </div>
             </>
          ) : (
             <>
               <button onClick={() => setStep('INPUT')} className="flex-1 font-bold text-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center gap-1"><Edit2 size={16}/> Modifica</button>
               <div className="flex-[2]">
                  <Button onClick={handleSave} loading={saving} variant="success" icon={Check}>Conferma e Invia</Button>
               </div>
             </>
          )}
       </div>
    </div>
  );
};

// ==========================================================================================
// --- APP MAIN ---
// ==========================================================================================

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('LOGIN');
  const [activeSession, setActiveSession] = useState(null);

  // Recupero sessione esistente
  useEffect(() => {
    const saved = localStorage.getItem('driver_session_v2');
    if(saved) {
       try {
           const s = JSON.parse(saved);
           if(s && s.user) {
              s.startTime = new Date(s.startTime); 
              setUser(s.user);
              setActiveSession(s);
              setView('ACTIVE');
           }
       } catch(e) {}
    }
  }, []);

  const handleLogin = async (u) => { 
    setUser(u); 
    let remoteData = null;
    let localSession = null;
    let isNetworkError = false;

    try {
        const remoteCheck = await apiCheckRemoteUpdates(u.name);
        if (remoteCheck && remoteCheck.found) {
             const checkDate = remoteCheck.date ? new Date(remoteCheck.date) : new Date();
             const today = new Date();
             const isToday = checkDate.getDate() === today.getDate() &&
                            checkDate.getMonth() === today.getMonth() &&
                            checkDate.getFullYear() === today.getFullYear();
             
             if (isToday) {
                 remoteData = remoteCheck;
             }
        }
    } catch (e) {
        console.error("Network error checking remote", e);
        isNetworkError = true;
    }

    const saved = localStorage.getItem('driver_session_v2');
    if(saved) {
        try {
            const s = JSON.parse(saved);
            if(s && s.user && s.user.matricola === u.matricola) {
                localSession = s;
                localSession.startTime = new Date(localSession.startTime); 
            }
        } catch(e) {}
    }
    
    if (isNetworkError) {
        if (localSession) {
            setActiveSession(localSession);
            setView('ACTIVE');
        } else {
            setView('START');
        }
        return;
    }

    if (remoteData) {
        const remoteSession = { 
            targa: remoteData.targa, 
            startKm: remoteData.startKm, 
            startTime: localSession ? localSession.startTime : new Date(), 
            user: u, 
            fuelLogs: localSession ? localSession.fuelLogs : [], 
            anomaly: false,
            isRemote: true
        };
        
        setActiveSession(remoteSession);
        localStorage.setItem('driver_session_v2', JSON.stringify(remoteSession));
        setView('ACTIVE');
        
        if (!localSession) {
             showCustomAlert("Turno Recuperato", `Trovato turno attivo per ${remoteData.targa}.`, "success");
        } else if (localSession.targa !== remoteData.targa || localSession.startKm !== remoteData.startKm) {
             showCustomAlert("Sincronizzazione", `Dati aggiornati dall'ufficio.`, "info");
        }
    } 
    else {
        if (localSession) {
            localStorage.removeItem('driver_session_v2');
            setActiveSession(null);
            showCustomAlert("Reset Turno", "Il turno precedente non risulta valido. Inizia un nuovo turno.", "warning");
        }
        setView('START');
    }
  };
  
  const handleStart = (data) => {
     const session = { ...data, user };
     setActiveSession(session);
     localStorage.setItem('driver_session_v2', JSON.stringify(session));
     setView('ACTIVE');
     apiStartShift(session);
  };

  const handleAddFuel = (f) => {
     const updated = { ...activeSession, fuelLogs: [...activeSession.fuelLogs, f] };
     setActiveSession(updated);
     localStorage.setItem('driver_session_v2', JSON.stringify(updated));
  };

  const handleUpdateFuel = (f) => {
     // Aggiorna l'array locale di fuelLogs sostituendo l'elemento con lo stesso ID
     const updatedLogs = activeSession.fuelLogs.map(log => log.id === f.id ? f : log);
     const updatedSession = { ...activeSession, fuelLogs: updatedLogs };
     setActiveSession(updatedSession);
     localStorage.setItem('driver_session_v2', JSON.stringify(updatedSession));
     
     // Chiama l'API per sovrascrivere il dato sul foglio (passando l'ID)
     apiLogFuel(updatedSession, f);
  };

  const handleEnd = () => {
     localStorage.removeItem('driver_session_v2');
     setActiveSession(null);
     setView('LOGIN'); 
  };

  const handleLogout = () => {
    localStorage.removeItem('driver_session_v2');
    setUser(null);
    setActiveSession(null);
    setView('LOGIN');
  };

  return (
    <CustomAlertProvider>
      <div className="w-full max-w-md mx-auto h-screen bg-white shadow-2xl overflow-hidden font-sans text-gray-900 relative">
        {view === 'LOGIN' && <LoginScreen onLogin={handleLogin} />}
        {view === 'START' && <StartShiftScreen user={user} onStart={handleStart} onLogout={handleLogout} />}
        {view === 'ACTIVE' && <ActiveShiftScreen session={activeSession} onEndShift={() => setView('END')} onAddFuel={handleAddFuel} onUpdateFuel={handleUpdateFuel} onLogout={handleLogout} />}
        {view === 'END' && <EndShiftScreen session={activeSession} onSave={handleEnd} onCancel={() => setView('ACTIVE')} onAddFuel={handleAddFuel} onUpdateFuel={handleUpdateFuel} />}
      </div>
    </CustomAlertProvider>
  );
}