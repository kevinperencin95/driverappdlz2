import React, { useState, useEffect, useRef } from 'react';
// Ho usato 'QrCode' al posto di 'ScanBarcode' per compatibilità
import { 
  Truck, Navigation, Fuel, User, LogOut, Camera, X, Check, Clock, 
  Wifi, ChevronDown, Lock, Droplet, CreditCard, ArrowRight, 
  AlertTriangle, RefreshCw, History, Users, Calendar, AlertOctagon, 
  FileText, QrCode, CheckCircle, Smartphone, ScanLine, Edit2, MapPin,
  Wrench, AlertCircle, Disc, HelpCircle, Info
} from 'lucide-react';

// ==========================================================================================
// ⚠️ CONFIGURAZIONE API ⚠️
// ==========================================================================================
const API_URL = "https://script.google.com/macros/s/AKfycbz8mQgiROz0RkNHE5gSbUkyy8VyDu-09Cqx_UJlpFLHDyaj6NXtt5v_ArSlGwTdxi3T/exec"; 

// ==========================================================================================
// --- ICONE SPIE REALI (ISO STANDARD - SVG INLINE) ---
// ==========================================================================================
// Queste icone sono disegnate per replicare esattamente i simboli del cruscotto.

const IconMotore = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M22,7h-3l-1.3-2.6C17.2,3.5,16.1,3,15,3h-6c-1.1,0-2.2,0.5-2.7,1.4L5,7H2v4h2v6h2v-6h1v6h2v-6h6v6h2v-6h1v6h2 v-6h2V7z M6,7l1-2h10l1,2H6z M10,9h4v3h-4V9z"/>
  </svg>
);

const IconOlio = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M22,5.5l-2.9,1.6c-0.2,0.1-0.5,0.2-0.7,0.2c-0.5,0-1-0.2-1.4-0.6l-1.5-1.5H9C6.8,5.2,5,7,5,9.2v2.1 c0,1.9,1.3,3.6,3.2,4.1l8.6,2.2c0.2,0,0.3,0.1,0.5,0.1c1.2,0,2.2-1,2.2-2.2V9.8L22,8.4C22.6,8.1,22.8,7.3,22.5,6.7 C22.2,6.1,21.6,6,21.6,6L22,5.5z M20,20.8c-0.6,0-1-0.4-1-1c0-0.6,0.4-1,1-1s1,0.4,1,1C21,20.3,20.6,20.8,20,20.8z M4,15H2v2h2V15z"/>
  </svg>
);

const IconBatteria = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17,5v2h-2V5h-2v2h-2V5H9v2H7V5H5v14h14V5H17z M8,13H6v-2h2V13z M18,13h-2v2h-2v-2h-2v-2h2V9h2v2h2V13z"/>
  </svg>
);

const IconTemperatura = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M8,17v-2h8v2H8z M8,13v-2h8v2H8z M12,2c-2.2,0-4,1.8-4,4v7.2c-1.2,0.9-2,2.4-2,4c0,2.8,2.2,5,5,5s5-2.2 5-5 c0-1.6-0.8-3.1-2-4V6C16,3.8,14.2,2,12,2z"/>
    <path d="M4,17v2h3v-2H4z M17,17v2h3v-2H17z M3,12v2h3v-2H3z M18,12v2h3v-2H18z"/>
  </svg>
);

const IconFreni = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12,2C6.5,2,2,6.5,2,12s4.5,10,10,10s10-4.5,10-10S17.5,2,12,2z M12,20c-4.4,0-8-3.6-8-8s3.6-8,8-8s8,3.6,8,8 S16.4,20,12,20z"/>
    <circle cx="12" cy="12" r="6" fill="transparent" stroke="currentColor" strokeWidth="2" />
    <path d="M11,8h2v5h-2V8z M11,15h2v2h-2V15z"/>
    <path d="M5.5,6.5C4,8,3,10,3,12s1,4,2.5,5.5" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="M18.5,6.5C20,8,21,10,21,12s-1,4-2.5,5.5" fill="none" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const IconPneumatici = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.5,5c-0.6,0-1.1,0.3-1.4,0.8L12,12.2L7.9,5.8C7.6,5.3,7.1,5,6.5,5C5.7,5,5,5.7,5,6.5c0,0.2,0,0.4,0.1,0.6l5.5,8.5 c0.4,0.6,1,0.9,1.7,0.8c0.6-0.1,1.1-0.5,1.4-1.1l5.7-8.9C19.8,5.7,19.2,5,18.5,5H17.5z"/>
    <path d="M5,18v2h14v-2H5z M11,18h2v2h-2V18z"/>
    <path d="M12,2C6.5,2,2,6.5,2,12h2c0-4.4,3.6-8,8-8s8,3.6,8,8h2C22,6.5,17.5,2,12,2z"/>
    <rect x="11" y="8" width="2" height="5" />
    <rect x="11" y="15" width="2" height="2" />
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
    history: [
        { date: new Date().toISOString(), driver: 'Luca B.', km: 154200 },
        { date: new Date(Date.now() - 86400000).toISOString(), driver: 'Giovanni C.', km: 154000 }
    ],
    driverHistory: [
        { date: new Date().toISOString(), targa: 'AA 123 BB', start: 154000, end: 154200, total: 200 },
        { date: new Date(Date.now() - 86400000 * 2).toISOString(), targa: 'CC 456 DD', start: 89000, end: 89500, total: 500 }
    ]
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
    console.warn("Uso dati mock per errore API Driver");
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

const apiCheckRemoteUpdates = async (driverName) => {
  try {
    const res = await fetchWithRetry(`${API_URL}?action=checkRemoteStart&driverName=${driverName}`);
    return await res.json();
  } catch (error) { throw error; } // Propagate error for network check
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
    // FORMATTAZIONE PER GOOGLE SHEETS (ITALIANO)
    // Sostituisce il punto con la virgola per importo e litri prima di inviare
    const formattedFuelData = {
        ...fuelData,
        importo: fuelData.importo ? fuelData.importo.toString().replace('.', ',') : '',
        litri: fuelData.litri ? fuelData.litri.toString().replace('.', ',') : ''
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

// --- NUOVA FUNZIONE API: REPORT ---
const apiReportIssue = async (session, reportData) => {
  try {
    const payload = {
      type: 'REPORT', // Necessita gestione lato Google Script
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
            <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4">
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
    danger: "bg-red-500 text-white hover:bg-red-600 shadow-red-300",
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

const NFCScanner = ({ onRead, onCancel }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
        if(navigator.vibrate) navigator.vibrate([50]);
        onRead('AA 123 BB'); 
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[60] bg-black/90 flex flex-col items-center justify-center p-6">
      <div className="bg-white w-full max-w-sm rounded-3xl p-8 text-center relative">
        <button onClick={onCancel} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full"><X size={20}/></button>
        <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6 bg-blue-100 text-blue-600">
           <Wifi size={40} className="rotate-90 animate-pulse" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Avvicina al Tag NFC</h3>
        <p className="text-gray-500 text-sm mt-2">Simulazione in corso...</p>
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
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } 
        });
        
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
        }

        if ('BarcodeDetector' in window) {
            // @ts-ignore
            const barcodeDetector = new window.BarcodeDetector({
                formats: ['code_128', 'code_39', 'ean_13', 'ean_8', 'qr_code', 'upc_a', 'upc_e']
            });

            interval = setInterval(async () => {
                if (videoRef.current) {
                    try {
                        const barcodes = await barcodeDetector.detect(videoRef.current);
                        if (barcodes.length > 0) {
                            const code = barcodes[0].rawValue;
                            if (code) {
                                if (navigator.vibrate) navigator.vibrate(200);
                                onScan(code);
                            }
                        }
                    } catch (err) {}
                }
            }, 500);
        } else {
            setError('Rilevamento nativo non supportato. Simulo scansione...');
            setTimeout(() => {
                if (navigator.vibrate) navigator.vibrate(200);
                onScan('12345'); 
            }, 3000);
        }
      } catch (err) {
        setError('Impossibile accedere alla fotocamera. Usa inserimento manuale.');
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
       
       <div className="absolute bottom-10 w-full text-center z-10 px-4">
          <p className="font-bold text-lg mb-1">Inquadra il codice a barre</p>
          {error && <p className="text-xs text-orange-300 bg-black/50 p-2 rounded">{error}</p>}
       </div>
       <style>{`@keyframes scan { 0% { transform: translateY(-50%) translateY(-24px); opacity: 0.5; } 100% { transform: translateY(-50%) translateY(24px); opacity: 1; } }`}</style>
    </div>
  );
};

const RefuelingModal = ({ onClose, onSave }) => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ importo: '', litri: '', tessera: '', impianto: '' });

  useEffect(() => { apiFetchStations().then(data => { setStations(data); setLoading(false); }); }, []);

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
                    <Info size={10} /> Il numero si trova sul retro della tessera, accanto alla scritta "POMEZIA -"
                </p>
           </div>
           <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Impianto</label>
              <select className="w-full p-4 bg-gray-50 rounded-xl font-bold" value={formData.impianto} onChange={e => setFormData({...formData, impianto: e.target.value})}>
                 <option value="">Seleziona...</option>
                 {stations.map((s, i) => <option key={i} value={s.nome}>{s.nome}</option>)}
              </select>
           </div>
           <Button onClick={() => { onSave(formData); onClose(); }} variant="warning" icon={Check} className="mt-4">Salva</Button>
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

  // DEFINIZIONE SPIE CON COMPONENTI VETTORIALI ISO REALI
  const warningLights = [
    { id: 'Motore', label: 'Motore', icon: IconMotore, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' },
    { id: 'Olio', label: 'Olio', icon: IconOlio, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
    { id: 'Batteria', label: 'Batteria', icon: IconBatteria, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
    { id: 'Temperatura', label: 'Temperatura', icon: IconTemperatura, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
    { id: 'Freni', label: 'Freni', icon: IconFreni, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
    { id: 'Pneumatici', label: 'Pressione', icon: IconPneumatici, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' },
  ];

  const handleSend = async () => {
      if(!notes) return alert("Inserisci una descrizione del problema.");
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

           {/* Sezione specifica per Spia Accesa */}
           {category === 'Spia Accesa' && (
                <div className="mb-4 animate-in fade-in slide-in-from-top-2">
                    <label className="block text-xs font-bold text-red-500 uppercase mb-2 ml-1">Quale spia vedi?</label>
                    <div className="grid grid-cols-3 gap-2">
                        {warningLights.map((light) => (
                            <button 
                                key={light.id} 
                                onClick={() => setNotes(`Spia accesa: ${light.label}`)}
                                className={`p-2 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all active:scale-95 bg-white border-gray-100 hover:bg-gray-50 ${notes.includes(light.label) ? `ring-2 ring-red-400 ${light.bg}` : ''}`}
                            >
                                <light.icon className={`w-8 h-8 ${light.color}`} />
                                <span className="text-[10px] font-bold text-gray-600 text-center leading-tight mt-1">{light.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
           )}
           
           <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Descrizione Dettagliata</label>
              <textarea 
                className="w-full p-4 bg-gray-50 rounded-xl font-bold h-24 resize-none border-2 border-transparent focus:border-red-500 outline-none bg-gray-50" 
                placeholder="Descrivi il problema..."
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

const ActiveShiftScreen = ({ session, onEndShift, onAddFuel, onLogout }) => {
  const [time, setTime] = useState("00:00:00");
  const [showFuel, setShowFuel] = useState(false);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    const i = setInterval(() => {
       const diff = new Date() - new Date(session.startTime);
       setTime(new Date(diff).toISOString().substr(11, 8));
    }, 1000);
    return () => clearInterval(i);
  }, []);

  const handleReportSave = async (data) => {
      const res = await apiReportIssue(session, data);
      if(res.success) {
          showCustomAlert("Segnalazione Inviata", "Il guasto è stato notificato all'ufficio.", "success");
      }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {showFuel && <RefuelingModal onClose={() => setShowFuel(false)} onSave={d => { apiLogFuel(session, d); onAddFuel(d); }} />}
      {showReport && <ReportModal onClose={() => setShowReport(false)} onSave={handleReportSave} />}
      
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
         <div className="bg-white w-full p-6 rounded-3xl shadow-sm border text-center">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center justify-center gap-2"><Fuel size={20} className="text-orange-500"/> Rifornimenti</h3>
            {session.fuelLogs.length > 0 ? 
               <div className="text-2xl font-black text-emerald-600">{session.fuelLogs.length} <span className="text-sm text-gray-400 font-normal">registrati</span></div> 
               : <p className="text-gray-400 text-sm">Nessuno ancora</p>
            }
            <Button variant="warning" onClick={() => setShowFuel(true)} className="mt-4" icon={Fuel}>Aggiungi Carburante</Button>
         </div>

         {/* Guasti Box - Separato */}
         <div className="bg-white w-full p-6 rounded-3xl shadow-sm border border-red-100 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-red-500"></div>
            <h3 className="font-bold text-gray-800 mb-2 flex items-center justify-center gap-2"><Wrench size={20} className="text-red-500"/> Segnalazione Guasti</h3>
            <p className="text-xs text-gray-400 mb-4">Segnala spie, problemi meccanici o danni.</p>
            <Button variant="danger" onClick={() => setShowReport(true)} icon={AlertTriangle} className="bg-red-50 text-red-600 border-2 border-red-100 hover:bg-red-100 shadow-none">Apri Segnalazione</Button>
         </div>

         <div className="flex-1"></div>
         
         <Button variant="danger" onClick={onEndShift} icon={LogOut} className="shadow-xl shadow-red-200">Chiudi Turno</Button>
      </div>
    </div>
  );
};

const EndShiftScreen = ({ session, onSave, onCancel, onAddFuel }) => {
  const [km, setKm] = useState('');
  const [step, setStep] = useState('INPUT'); // 'INPUT' | 'SUMMARY'
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFuelModal, setShowFuelModal] = useState(false);

  // Calcoli per il riepilogo
  const totalKm = km ? (parseInt(km) - session.startKm) : 0;
  const totalFuelCost = session.fuelLogs.reduce((acc, f) => acc + parseFloat(f.importo), 0);
  const totalLiters = session.fuelLogs.reduce((acc, f) => acc + parseFloat(f.litri), 0);
  const isKmError = parseInt(km) < session.startKm;

  const handleNext = () => {
     if(!km) return showCustomAlert("Errore", "Inserisci KM finali", "warning");
     if(isKmError) {
         if(!window.confirm(`ATTENZIONE: KM finali (${km}) minori di quelli iniziali (${session.startKm}). Vuoi procedere comunque?`)) return;
     }
     setStep('SUMMARY');
  };

  const handleFuelSaveLocal = (data) => {
      apiLogFuel(session, data); // API fire and forget
      onAddFuel(data); // Aggiorna stato locale (così appare subito nel riepilogo)
      setShowFuelModal(false);
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
       {showFuelModal && <RefuelingModal onClose={() => setShowFuelModal(false)} onSave={handleFuelSaveLocal} />}
       <div className="bg-white p-6 shadow-sm border-b"><h2 className="text-xl font-black">{step === 'INPUT' ? 'Chiusura Turno' : 'Riepilogo Dati'}</h2></div>
       
       <div className="flex-1 p-6 overflow-y-auto">
          {step === 'INPUT' ? (
              <div className="bg-white p-8 rounded-3xl shadow-lg border text-center mb-6 animate-in fade-in slide-in-from-bottom-4">
                 <p className="text-xs text-blue-600 font-bold uppercase mb-2">KM Partenza</p>
                 <p className="text-3xl font-mono font-black text-blue-900 mb-8">{session.startKm}</p>
                 
                 <label className="block text-xs font-bold text-gray-400 uppercase mb-4">Inserisci KM Arrivo</label>
                 <input 
                    type="number" 
                    value={km} 
                    onChange={e => setKm(e.target.value)} 
                    className="w-full text-center text-5xl font-black border-b-4 border-blue-500 pb-2 bg-transparent outline-none transition-all focus:border-blue-700" 
                    autoFocus 
                    placeholder="000000"
                 />
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
       const s = JSON.parse(saved);
       if(s && s.user) {
          s.startTime = new Date(s.startTime); // Ripristina oggetto Date
          setUser(s.user);
          setActiveSession(s);
          setView('ACTIVE');
       }
    }
  }, []);

  const handleLogin = async (u) => { 
    setUser(u); 
    
    // 1. Variabili per la logica
    let remoteData = null;
    let localSession = null;
    let isNetworkError = false;

    // 2. Controllo Remoto (Prioritario)
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

    // 3. Recupero Sessione Locale
    const saved = localStorage.getItem('driver_session_v2');
    if(saved) {
        try {
            const s = JSON.parse(saved);
            if(s && s.user && s.user.matricola === u.matricola) {
                localSession = s;
                localSession.startTime = new Date(localSession.startTime); // Fix Date obj
            }
        } catch(e) {}
    }

    // 4. Logica di Decisione
    
    // CASO A: Errore di Rete -> Mi fido del locale se esiste
    if (isNetworkError) {
        if (localSession) {
            setActiveSession(localSession);
            setView('ACTIVE');
        } else {
            setView('START');
        }
        return;
    }

    // CASO B: Esiste un record remoto valido per oggi
    if (remoteData) {
        // Allineo l'app al server (Sync)
        const remoteSession = { 
            targa: remoteData.targa, 
            startKm: remoteData.startKm, 
            // Mantengo orario locale se esiste, altrimenti resetto a ora
            startTime: localSession ? localSession.startTime : new Date(), 
            user: u, 
            // Mantengo log carburante locali se esistono
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
    // CASO C: Nessun record remoto (o cancellato)
    else {
        // Se avevo un locale, significa che è obsoleto o cancellato dall'ufficio
        if (localSession) {
            localStorage.removeItem('driver_session_v2');
            setActiveSession(null);
            showCustomAlert("Reset Turno", "Il turno precedente non risulta valido. Inizia un nuovo turno.", "warning");
        }
        // In ogni caso, vado a START
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

  const handleEnd = () => {
     localStorage.removeItem('driver_session_v2');
     setActiveSession(null);
     setView('LOGIN'); // Torna al login o START a scelta
  };

  // Logout funzione che resetta solo lo stato UI ma non il localStorage se c'è un turno attivo
  const handleLogout = () => {
    setUser(null);
    setActiveSession(null);
    setView('LOGIN');
  };

  return (
    <CustomAlertProvider>
      <div className="w-full max-w-md mx-auto h-screen bg-white shadow-2xl overflow-hidden font-sans text-gray-900 relative">
        {view === 'LOGIN' && <LoginScreen onLogin={handleLogin} />}
        {view === 'START' && <StartShiftScreen user={user} onStart={handleStart} onLogout={handleLogout} />}
        {view === 'ACTIVE' && <ActiveShiftScreen session={activeSession} onEndShift={() => setView('END')} onAddFuel={handleAddFuel} onLogout={handleLogout} />}
        {view === 'END' && <EndShiftScreen session={activeSession} onSave={handleEnd} onCancel={() => setView('ACTIVE')} onAddFuel={handleAddFuel} />}
      </div>
    </CustomAlertProvider>
  );
}