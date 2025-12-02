import React, { useState, useEffect, useRef } from 'react';
import { Truck, Navigation, Fuel, Save, User, LogOut, MapPin, Camera, X, Check, Clock, Wifi, ChevronDown, Lock, Droplet, CreditCard, ArrowRight, AlertTriangle, RefreshCw, History, Users, Calendar, AlertOctagon, FileText, Radio, Barcode, CheckCircle, Smartphone, BatteryCharging } from 'lucide-react';

// ==========================================================================================
// ⚠️ CONFIGURAZIONE API GOOGLE SHEETS ⚠️
// ==========================================================================================

const API_URL = "https://script.google.com/macros/s/AKfycbz8mQgiROz0RkNHE5gSbUkyy8VyDu-09Cqx_UJlpFLHDyaj6NXtt5v_ArSlGwTdxi3T/exec"; 

// ==========================================================================================
// --- GESTORE CHIAMATE API ---
// ==========================================================================================

// Definizione della funzione di backoff esponenziale
const fetchWithRetry = async (url, options = {}, retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response;
        } catch (error) {
            if (i < retries - 1) {
                const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s...
                await new Promise(resolve => setTimeout(resolve, delay));
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
        { date: new Date().toISOString(), driver: 'Luca B.', km: 154300 },
        { date: new Date(Date.now() - 86400000).toISOString(), driver: 'Giovanni C.', km: 154250 }
    ],
    driverHistory: [
        { date: new Date().toISOString(), targa: 'AA 123 BB', start: 154300, end: 154500, total: 200 },
        { date: new Date(Date.now() - 86400000 * 2).toISOString(), targa: 'CC 456 DD', start: 89000, end: 89500, total: 500 }
    ]
};

const isDemoMode = () => API_URL.includes("INSERISCI_QUI") || API_URL === "";

const apiFetchDriverName = async (matricola) => {
  if (isDemoMode()) { await new Promise(r => setTimeout(r, 500)); return MOCK_DATA.drivers[matricola] ? { success: true, name: MOCK_DATA.drivers[matricola] } : { success: false }; }
  try {
    const res = await fetchWithRetry(`${API_URL}?action=getDriver&matricola=${matricola}`);
    return await res.json();
  } catch (error) {
    console.error("Errore Driver:", error);
    return { success: false, error: "Errore connessione" };
  }
};

const apiFetchVehicles = async () => {
  if (isDemoMode()) return MOCK_DATA.vehicles;
  try {
    const response = await fetchWithRetry(`${API_URL}?action=getVehicles`);
    const text = await response.text();
    try {
        const data = JSON.parse(text);
        return Array.isArray(data) ? data : [];
    } catch (e) { return []; }
  } catch (error) { return []; }
};

const apiFetchVehicleHistory = async (targa) => {
  if (isDemoMode()) { await new Promise(r => setTimeout(r, 800)); return MOCK_DATA.history || []; }
  try {
    const res = await fetchWithRetry(`${API_URL}?action=getHistory&targa=${targa}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) { return []; }
};

const apiFetchDriverPersonalHistory = async (matricola) => {
  if (isDemoMode()) { await new Promise(r => setTimeout(r, 800)); return MOCK_DATA.driverHistory || []; }
  try {
    const res = await fetchWithRetry(`${API_URL}?action=getDriverHistory&matricola=${matricola}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) { return []; }
};

const apiFetchStations = async () => {
  if (isDemoMode()) return MOCK_DATA.stations;
  try {
    const res = await fetchWithRetry(`${API_URL}?action=getStations`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) { return []; }
};

const apiCheckRemoteUpdates = async (driverName) => {
  if (isDemoMode()) { await new Promise(r => setTimeout(r, 500)); return { found: false }; }
  try {
    const res = await fetchWithRetry(`${API_URL}?action=checkRemoteStart&driverName=${driverName}`);
    return await res.json();
  } catch (error) { return { found: false }; }
};

const apiStartShift = async (shiftData) => {
  if (isDemoMode()) return;
  try {
    const payload = { 
        type: 'START',
        targa: shiftData.targa,
        driver: shiftData.user ? shiftData.user.matricola : 'N/D',
        driverName: shiftData.user ? shiftData.user.name : 'Sconosciuto',
        start: shiftData.startKm, 
        anomaly: shiftData.anomaly
    };
    fetchWithRetry(API_URL, { method: 'POST', body: JSON.stringify(payload) }).catch(e => console.error(e));
  } catch (error) { console.error("Err log start", error); }
};

const apiLogFuel = async (session, fuelData) => {
  if (isDemoMode()) { await new Promise(r => setTimeout(r, 1000)); return { success: true }; }
  try {
    const payload = {
      type: 'FUEL',
      driver: session.user.matricola,
      driverName: session.user.name,
      targa: session.targa,
      ...fuelData
    };
    await fetchWithRetry(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    return { success: true };
  } catch (error) {
    // Custom modal instead of alert
    showCustomAlert("Errore di Rete", "Impossibile salvare il rifornimento. Controlla la connessione e riprova.", 'danger');
    return { success: false };
  }
};

const apiSaveLog = async (logData) => {
  if (isDemoMode()) { await new Promise(r => setTimeout(r, 1000)); return { success: true }; }
  try {
    const payload = { ...logData, type: 'END' };
    await fetchWithRetry(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    return { success: true };
  } catch (error) {
    showCustomAlert("Errore Critico", "Errore nel salvataggio finale. Contatta il supporto.", 'danger');
    return { success: false };
  }
};

// ==========================================================================================
// --- SERVIZI UTILITY & CUSTOM UI ---
// ==========================================================================================

const CustomAlert = ({ message, title, type, onClose }) => {
    const icons = {
        success: <CheckCircle className="w-10 h-10 text-emerald-500" />,
        danger: <AlertOctagon className="w-10 h-10 text-red-500" />,
        warning: <AlertTriangle className="w-10 h-10 text-orange-500" />,
        info: <Smartphone className="w-10 h-10 text-blue-500" />
    };
    const colors = {
        success: { bg: 'bg-emerald-50', text: 'text-emerald-800' },
        danger: { bg: 'bg-red-50', text: 'text-red-800' },
        warning: { bg: 'bg-orange-50', text: 'text-orange-800' },
        info: { bg: 'bg-blue-50', text: 'text-blue-800' }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4 animate-in fade-in">
            <div className={`bg-white w-full max-w-xs rounded-3xl p-6 relative shadow-2xl animate-in zoom-in-95 ${colors[type].bg}`}>
                <div className="flex justify-center mb-4">{icons[type]}</div>
                <h3 className={`text-xl font-bold text-center mb-2 ${colors[type].text}`}>{title}</h3>
                <p className={`text-center text-sm mb-6 ${colors[type].text}`}>{message}</p>
                <Button onClick={onClose} variant={type === 'danger' ? 'danger' : 'primary'} className="mt-4">OK</Button>
            </div>
        </div>
    );
};

let setCustomAlertState = () => {};

const CustomAlertProvider = ({ children }) => {
    const [alertState, setAlertState] = useState({ show: false, title: '', message: '', type: 'info' });
    setCustomAlertState = (state) => setAlertState(state);

    const handleClose = () => setAlertState(s => ({ ...s, show: false }));

    return (
        <>
            {children}
            {alertState.show && (
                <CustomAlert 
                    title={alertState.title} 
                    message={alertState.message} 
                    type={alertState.type} 
                    onClose={handleClose} 
                />
            )}
        </>
    );
};

const showCustomAlert = (title, message, type = 'info') => {
    setCustomAlertState({ show: true, title, message, type });
};

// ==========================================================================================
// --- COMPONENTI UI ---
// ==========================================================================================

const Button = ({ onClick, children, variant = 'primary', className = '', disabled = false, icon: Icon, loading = false }) => {
  const baseStyle = "w-full py-4 rounded-2xl font-bold flex items-center justify-center transition-all active:scale-95 shadow-lg text-sm uppercase tracking-wider";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-300",
    success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-300",
    danger: "bg-red-500 text-white hover:bg-red-600 shadow-red-300",
    warning: "bg-orange-500 text-white hover:bg-orange-600 shadow-orange-300",
    outline: "border-2 border-gray-200 text-gray-600 hover:bg-gray-50 bg-white shadow-none"
  };
  return (
    <button onClick={onClick} disabled={disabled || loading} className={`${baseStyle} ${variants[variant]} ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      {loading ? <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> : Icon && <Icon className="w-5 h-5 mr-2" />} {loading ? 'Caricamento...' : children}
    </button>
  );
};

const Input = ({ label, type = "text", value, onChange, placeholder, autoFocus, className = '', icon: Icon, inputClassName = '' }) => (
  <div className="mb-4">
    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">{label}</label>
    <div className="relative flex items-center">
      {Icon && <Icon className="absolute left-4 w-5 h-5 text-gray-400" />}
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} autoFocus={autoFocus} className={`w-full p-4 pl-12 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-xl focus:outline-none transition-all font-bold text-gray-800 text-lg ${inputClassName}`} />
    </div>
  </div>
);

// --- MODULI SENSORI & MODALI ---

const DriverHistoryModal = ({ matricola, onClose }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetchDriverPersonalHistory(matricola).then(data => { setHistory(data); setLoading(false); });
  }, [matricola]);

  return (
    <div className="fixed inset-0 z-[90] bg-black/80 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 relative animate-in zoom-in-95 shadow-2xl flex flex-col max-h-[80vh]">
        <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2">
             <div className="bg-blue-100 p-3 rounded-full text-blue-600 shadow-md"><FileText size={20}/></div>
             <div><h3 className="text-lg font-bold text-gray-900">I Miei Turni</h3><p className="text-[10px] text-gray-400 font-bold uppercase">Ultimi 14 giorni</p></div>
          </div>
          <button onClick={onClose} className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition-colors"><X size={20}/></button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {loading ? <div className="text-center py-8 text-gray-400 text-sm animate-pulse">Recupero dati...</div> : history.length > 0 ? history.map((item, idx) => (
              <div key={idx} className="bg-white border-2 border-gray-100 rounded-xl p-4 shadow-sm hover:border-blue-300 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-md"><Calendar size={12}/> {new Date(item.date).toLocaleDateString('it-IT')}</div>
                  <div className="text-right">
                    <span className="text-xs font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded-md">{item.targa}</span>
                  </div>
                </div>
                <div className="flex justify-between items-end text-sm mt-2">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase">Tratta Iniziale</p>
                    <p className="text-gray-800 font-mono text-base font-semibold">{item.start}</p>
                  </div>
                  <ArrowRight size={16} className="text-gray-300"/>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase">Tratta Finale</p>
                    <p className="text-gray-800 font-mono text-base font-semibold">{item.end}</p>
                  </div>
                  <div className="text-right pl-4 border-l border-gray-100">
                    <p className="text-[10px] text-gray-400 uppercase">Totale</p>
                    <p className="font-black text-blue-600 text-xl">{item.total} <span className="text-xs font-normal text-gray-400">km</span></p>
                  </div>
                </div>
              </div>
            )) : <div className="text-center py-10"><div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-300"><FileText size={32}/></div><p className="text-gray-400 text-sm font-medium">Nessun turno registrato<br/>negli ultimi 14 giorni.</p></div>}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 text-center"><button onClick={onClose} className="text-sm font-bold text-gray-400 hover:text-gray-600">Chiudi</button></div>
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
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 relative animate-in zoom-in-95 shadow-2xl">
        <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
          <div><h3 className="text-lg font-bold text-gray-900">Storico KM Veicolo</h3><p className="text-xs text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded-md w-max mt-1">{targa}</p></div>
          <button onClick={onClose} className="bg-gray-100 p-2 rounded-full hover:bg-gray-200"><X size={20}/></button>
        </div>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {loading ? <div className="text-center py-8 text-gray-400 text-sm animate-pulse">Caricamento dati...</div> : history.length > 0 ? history.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 shadow-sm">
                <div className="bg-white p-2 rounded-full shadow-sm text-gray-400"><User size={16}/></div>
                <div className="flex-1"><p className="text-sm font-bold text-gray-800">{item.driver}</p><div className="flex items-center gap-2 text-xs text-gray-500"><span className="flex items-center gap-1"><Calendar size={10}/> {new Date(item.date).toLocaleDateString('it-IT')}</span></div></div>
                <div className="text-right"><p className="text-xs text-gray-400 uppercase font-bold">KM Fine</p><p className="font-mono font-black text-lg text-gray-700">{item.km}</p></div>
              </div>
            )) : <div className="text-center py-8 text-gray-400 text-sm">Nessuno storico recente trovato.</div>}
        </div>
      </div>
    </div>
  );
};

const RefuelingModal = ({ onClose, onSave }) => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [formData, setFormData] = useState({ importo: '', litri: '', tessera: '', impianto: '' });

  useEffect(() => { apiFetchStations().then(data => { setStations(data); setLoading(false); }); }, []);

  const handleSubmit = async () => {
    if (!formData.importo || !formData.litri || !formData.impianto || !formData.tessera) return showCustomAlert("Attenzione", "Compila tutti i campi obbligatori per registrare il rifornimento.", 'warning');
    setIsSending(true);
    await onSave(formData);
    setIsSending(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/80 flex items-end sm:items-center justify-center animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 relative animate-in slide-in-from-bottom-10 shadow-2xl">
        <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3"><div className="bg-orange-100 p-3 rounded-xl shadow-md"><Fuel className="text-orange-600 w-6 h-6"/></div><h3 className="text-xl font-bold text-gray-900">Nuovo Rifornimento</h3></div>
          <button onClick={onClose} className="bg-gray-100 p-2 rounded-full hover:bg-gray-200"><X size={20}/></button>
        </div>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pb-4">
          <div className="grid grid-cols-2 gap-4">
             <Input label="Importo (€)" type="number" icon={CreditCard} placeholder="0.00" inputClassName="pl-12" value={formData.importo} onChange={e => setFormData({...formData, importo: e.target.value})} />
             <Input label="Litri Erogati" type="number" icon={Droplet} placeholder="0.00" inputClassName="pl-12" value={formData.litri} onChange={e => setFormData({...formData, litri: e.target.value})} />
          </div>
          <Input label="N. Tessera" icon={Lock} placeholder="Es. 700012345" value={formData.tessera} inputClassName="pl-12" onChange={e => setFormData({...formData, tessera: e.target.value})} />
          <div className="mb-4">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Impianto</label>
            <div className="relative">
              <select value={formData.impianto} onChange={e => setFormData({...formData, impianto: e.target.value})} className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-xl appearance-none font-bold text-gray-800 outline-none shadow-inner">
                <option value="">{loading ? "Caricamento..." : "-- Seleziona --"}</option>
                {stations.map((s, i) => <option key={i} value={s.nome}>{s.nome}</option>)}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
            </div>
          </div>
        </div>
        <Button onClick={handleSubmit} loading={isSending} variant="warning" icon={Check} className="mt-4">Registra Rifornimento</Button>
      </div>
    </div>
  );
};

const NFCScanner = ({ onRead, onCancel }) => {
  const [status, setStatus] = useState('scanning');
  const simulateTouch = () => { 
    setStatus('success'); 
    if(navigator.vibrate) navigator.vibrate([50,50,50]); 
    setTimeout(() => onRead('AA 123 BB'), 800); 
  };
  return (
    <div className="fixed inset-0 z-[60] bg-black/90 flex flex-col items-center justify-center p-6 animate-in fade-in">
      <div className="bg-white w-full max-w-sm rounded-3xl p-8 text-center relative shadow-2xl">
        <button onClick={onCancel} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200"><X size={20}/></button>
        <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6 ${status === 'success' ? 'bg-emerald-100 text-emerald-600 animate-pulse' : 'bg-blue-100 text-blue-600'}`}>
          {status === 'success' ? <CheckCircle size={40} /> : <Wifi size={40} className="rotate-90 animate-pulse" />}
        </div>
        <h3 className="text-xl font-bold mb-2 text-gray-900">Avvicina al Tag NFC</h3>
        <p className="text-gray-500 text-sm mb-6">Tocca il retro del dispositivo al tag del mezzo.</p>
        {status !== 'success' && <button onClick={simulateTouch} className="text-xs text-blue-500 font-bold underline">(SIMULA TOCCO)</button>}
      </div>
    </div>
  );
};

const BarcodeScanner = ({ onScan, onClose }) => {
  const videoRef = useRef(null);
  const [scanning, setScanning] = useState(true);
  
  useEffect(() => {
    let stream = null;
    const start = async () => { 
      try { 
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }); 
        if(videoRef.current) videoRef.current.srcObject = stream; 
        
        // Simulazione scan dopo 2.5s
        setTimeout(() => {
            setScanning(false);
            if(navigator.vibrate) navigator.vibrate(200);
            onScan('12345'); 
        }, 2500); 
      } catch(e){
        // Gestione errore permessi telecamera
        setScanning(false);
        showCustomAlert("Errore Fotocamera", "Permesso negato o dispositivo non supportato. Usa l'input manuale.", 'danger');
        onClose();
      } 
    };
    start(); 
    return () => { if(stream) stream.getTracks().forEach(t=>t.stop()); };
  }, []);
  
  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col">
       <div className="absolute top-0 w-full p-4 flex justify-between z-10 text-white bg-gradient-to-b from-black/80 to-transparent">
         <span className="font-bold text-lg">SCANNER MATRICOLA</span>
         <button onClick={onClose} className="p-1 rounded-full bg-white/10 hover:bg-white/20"><X size={20}/></button>
       </div>
       <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover opacity-80" />
       {scanning && (
         <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
           <div className="w-72 max-w-[80%] h-48 border-2 border-green-400 rounded-xl relative animate-in zoom-in-50">
             <div className="w-full h-0.5 bg-green-500 absolute top-1/2 -translate-y-1/2 animate-[scan_2s_infinite_alternate] shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
           </div>
         </div>
       )}
       <style>{`
          @keyframes scan {
              0% { transform: translateY(-50%) translateY(-24px); }
              100% { transform: translateY(-50%) translateY(24px); }
          }
       `}</style>
       <div className="absolute bottom-0 w-full p-6 text-center z-10 bg-gradient-to-t from-black/80 to-transparent">
          <p className="text-white text-sm font-medium flex items-center justify-center gap-2"><Barcode size={16} className="text-green-400"/>Inquadra il codice a barre della tua tessera.</p>
       </div>
    </div>
  );
};

// --- SCHERMATE DELL'APP ---

const LoginScreen = ({ onLogin }) => {
  const [matricola, setMatricola] = useState('');
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [imgError, setImgError] = useState(false);
  
  const performLogin = async (code) => {
    if(!code || loading) return;
    setLoading(true);
    const res = await apiFetchDriverName(code);
    setLoading(false);
    if(res.success) onLogin({ matricola: code, name: res.name });
    else showCustomAlert('Accesso Negato', 'Matricola non trovata. Controlla il codice inserito o contatta il supporto.', 'danger');
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 relative p-6 overflow-hidden">
      {showScanner && <BarcodeScanner onScan={(c) => {setShowScanner(false); performLogin(c);}} onClose={() => setShowScanner(false)} />}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-600 rounded-full blur-3xl opacity-20"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-600 rounded-full blur-3xl opacity-10"></div>
      <div className="flex-1 flex flex-col justify-center z-10 relative">
        <div className="bg-white w-full max-w-[280px] h-28 mx-auto rounded-3xl flex items-center justify-center mb-6 shadow-2xl p-4">
          {!imgError ? <img src="https://www.camtrasportisrl.com/wp-content/uploads/2025/09/logo.png" className="w-full h-full object-contain" onError={(e)=>{e.target.onerror = null; e.target.src="https://placehold.co/200x50/1e293b/ffffff?text=DriverLog"; setImgError(true);}} alt="Logo Azienda"/> : <Truck className="text-blue-600 w-12 h-12"/>}
        </div>
        <h1 className="text-center text-5xl font-black text-white mb-2 tracking-tighter">Driver<span className="text-blue-500">Log</span></h1>
        <p className="text-center text-slate-400 mb-10 text-lg">Diario di bordo digitale</p>
        
        <div className="bg-white rounded-[2rem] p-6 shadow-xl w-full">
          <Button onClick={() => setShowScanner(true)} variant="primary" className="mb-8 py-5 text-lg" icon={Camera}>
             SCANSIONA BADGE
          </Button>
          
          <div className="relative mb-6 text-center border-t border-gray-100 pt-6">
            <span className="bg-white px-4 text-xs text-gray-400 font-bold uppercase -mt-9 block w-max mx-auto tracking-widest">Login Manuale</span>
          </div>
          
          <div className="flex gap-2">
              <input 
                  className="w-full bg-gray-100 border-none rounded-xl p-4 font-bold text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none text-center text-lg" 
                  placeholder="ID Matricola" 
                  type="number"
                  value={matricola} 
                  onChange={(e) => setMatricola(e.target.value)} 
                  onKeyPress={(e) => { if (e.key === 'Enter') performLogin(matricola); }}
                  disabled={loading}
              />
              <button 
                  onClick={() => performLogin(matricola)} 
                  disabled={loading || !matricola} 
                  className="bg-blue-600 text-white px-6 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 active:scale-95"
              >
                  {loading ? '...' : <Check />}
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const StartShiftScreen = ({ user, onStart }) => {
  const [targa, setTarga] = useState('');
  const [km, setKm] = useState('');
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showNFC, setShowNFC] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showMyHistory, setShowMyHistory] = useState(false);
  const [kmWarningShown, setKmWarningShown] = useState(false);

  const loadVehicles = async () => {
      setLoading(true); setError(false);
      const data = await apiFetchVehicles();
      if (data && data.length > 0) {
          setVehicles(data);
      } else {
          setError(true);
      }
      setLoading(false);
  };

  useEffect(() => { loadVehicles(); }, []);

  const selectedVehicle = vehicles.find(v => v.targa === targa);

  const handleStartShift = () => {
    if(!targa || !km) return showCustomAlert("Attenzione", "Seleziona un veicolo e inserisci i KM iniziali.", 'warning');
    const enteredKm = parseInt(km);
    let anomaly = false;

    if (selectedVehicle && selectedVehicle.lastKm && enteredKm < selectedVehicle.lastKm) {
        if (!kmWarningShown) {
            showCustomAlert(
                "ANOMALIA KM RILEVATA", 
                `I KM inseriti (${enteredKm}) sono inferiori all'ultima chiusura registrata (${selectedVehicle.lastKm}).\n\nVerifica il contachilometri. Premi nuovamente "CONFERMA ANOMALIA" per procedere.`, 
                'danger'
            );
            setKmWarningShown(true);
            return;
        } else {
            anomaly = true;
        }
    }

    onStart({ 
        targa, 
        startKm: enteredKm, 
        startTime: new Date(), 
        fuelLogs: [], 
        anomaly: anomaly
    });
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {showNFC && <NFCScanner onRead={(t) => {setTarga(t); setShowNFC(false);}} onCancel={() => setShowNFC(false)} />}
      
      {showHistory && <VehicleHistoryModal targa={targa} onClose={() => setShowHistory(false)} />}
      {showMyHistory && <DriverHistoryModal matricola={user.matricola} onClose={() => setShowMyHistory(false)} />}

      <div className="bg-white p-6 shadow-md z-10 flex justify-between items-center border-b border-gray-100">
         <div><h2 className="text-xl font-bold text-gray-900">Benvenuto,</h2><p className="text-blue-600 font-black">{user.name}</p></div>
         <div className="bg-blue-100 p-3 rounded-full text-blue-600 shadow-md"><User size={20}/></div>
      </div>
      
      <div className="flex-1 p-6 overflow-y-auto">
        
        {/* Pulsante Storico Personale */}
        <button 
            onClick={() => setShowMyHistory(true)}
            className="w-full mb-6 py-3 bg-white rounded-2xl border-2 border-gray-100 text-sm font-bold text-gray-600 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors shadow-sm active:scale-[.99]"
        >
            <Clock size={16} className="text-blue-500"/> Le mie ultime registrazioni
        </button>

        <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 mb-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-3 h-full bg-blue-500 rounded-l-3xl"></div>
          <div className="pl-2">
            <div className="flex justify-between items-center mb-4">
               <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Veicolo</label>
               <button onClick={() => setShowNFC(true)} className="flex items-center gap-1 text-[10px] font-bold bg-slate-900 text-white px-3 py-1.5 rounded-full hover:bg-slate-700 transition-colors active:scale-95"><Wifi size={12} className="rotate-90"/> Usa NFC</button>
            </div>
            <div className="relative">
               {loading ? <div className="p-4 text-center text-gray-400 text-sm"><RefreshCw size={16} className="inline mr-2 animate-spin"/>Caricamento...</div> : error ? <div className="p-4 bg-red-50 rounded-xl border border-red-100 text-red-600 text-sm flex flex-col items-center"><AlertTriangle className="mb-2"/><p className="font-bold">Impossibile caricare i mezzi.</p><button onClick={loadVehicles} className="flex items-center gap-2 bg-red-100 px-3 py-1 rounded-full text-xs font-bold hover:bg-red-200 mt-2"><RefreshCw size={12}/> Riprova</button></div> : <>
                  <select value={targa} onChange={(e) => { setTarga(e.target.value); setKmWarningShown(false); }} className="w-full bg-gray-50 p-4 rounded-xl font-black text-gray-800 text-lg appearance-none border-2 border-transparent focus:border-blue-500 outline-none shadow-inner">
                      <option value="">-- Scegli la targa --</option>
                      {vehicles.map((v, idx) => <option key={idx} value={v.targa}>{v.targa} - {v.modello}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
               </>}
            </div>
          </div>
        </div>

        {selectedVehicle && (
          <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 mb-6 animate-in fade-in slide-in-from-top-2">
             <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-4">
               <div>
                 <div className="flex items-center gap-1 mb-1"><History size={12} className="text-blue-500"/><p className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">Ultima Chiusura Veicolo</p></div>
                 <p className="text-3xl font-mono font-black text-blue-800">{selectedVehicle.lastKm}</p>
                 {selectedVehicle.lastDriver && <p className="text-xs text-blue-500 mt-1">Ultimo Driver: {selectedVehicle.lastDriver}</p>}
               </div>
               <button onClick={() => { setKm(selectedVehicle.lastKm); setKmWarningShown(false); }} className="bg-blue-600 text-white px-5 py-3 rounded-xl text-sm font-bold shadow-blue-300 shadow-lg hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2"><Check size={16}/> USA KM</button>
             </div>
             <button onClick={() => setShowHistory(true)} className="w-full py-2 bg-blue-50 rounded-xl text-xs font-bold text-blue-600 flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors active:scale-[.99]"><Users size={14}/> Vedi storico completo</button>
          </div>
        )}

        <div className={`bg-white p-6 rounded-3xl shadow-lg border-4 ${kmWarningShown ? 'border-red-500 ring-4 ring-red-100' : 'border-gray-100'}`}>
          <label className={`text-xs font-bold uppercase tracking-wider mb-4 block ${kmWarningShown ? 'text-red-500' : 'text-gray-400'}`}>
             {kmWarningShown ? 'CONFERMA ANOMALIA - KM INFERIORI' : 'KM INIZIALI CORRENTI'}
          </label>
          <div className="flex items-center justify-center gap-2">
             <input type="number" value={km} onChange={(e) => { setKm(e.target.value); setKmWarningShown(false); }} placeholder="000000" className={`w-full text-center text-4xl font-mono font-black placeholder-gray-200 outline-none pb-2 bg-transparent ${kmWarningShown ? 'text-red-600' : 'text-gray-800'}`}/>
             <span className="text-gray-400 font-bold text-lg">KM</span>
          </div>
        </div>
      </div>
      <div className="p-6 bg-white border-t border-gray-100 pb-8 shadow-inner">
          <Button onClick={handleStartShift} icon={Navigation} disabled={!targa || !km} variant={kmWarningShown ? 'danger' : 'primary'}>
              {kmWarningShown ? 'CONFERMA ANOMALIA & INIZIA' : 'INIZIA SERVIZIO'}
          </Button>
      </div>
    </div>
  );
};

const ActiveShiftScreen = ({ session, onEndShift, onAddFuel, onSessionUpdate }) => {
  const [time, setTime] = useState("");
  const [showFuelModal, setShowFuelModal] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);

  // --- POLLING SINCRONIZZAZIONE ---
  useEffect(() => {
    const timer = setInterval(() => {
        const diff = new Date() - new Date(session.startTime);
        const h = Math.floor(diff/3600000).toString().padStart(2,'0');
        const m = Math.floor((diff%3600000)/60000).toString().padStart(2,'0');
        const s = Math.floor((diff%60000)/1000).toString().padStart(2,'0');
        setTime(`${h}:${m}:${s}`);
    }, 1000);

    // Sync con DB ogni 15 secondi per correzioni Ufficio
    const syncTimer = setInterval(async () => {
        setSyncLoading(true);
        const res = await apiCheckRemoteUpdates(session.user.name);
        setSyncLoading(false);
        
        if (res.found) {
            const updates = {};
            let hasUpdate = false;

            if (res.startKm && res.startKm !== session.startKm) {
                updates.startKm = res.startKm;
                hasUpdate = true;
            }

            if (res.targa && res.targa !== session.targa) {
                updates.targa = res.targa;
                hasUpdate = true;
            }

            if (hasUpdate) {
                onSessionUpdate(updates);
            }
        }
    }, 15000);

    return () => { clearInterval(timer); clearInterval(syncTimer); };
  }, [session]);

  const handleFuelSave = async (data) => { 
    const { success } = await apiLogFuel(session, data);
    if(success) {
        onAddFuel(data); 
        showCustomAlert("Rifornimento Registrato", `Registrati ${data.litri}L per €${data.importo}.`, 'success');
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
       {showFuelModal && <RefuelingModal onClose={() => setShowFuelModal(false)} onSave={handleFuelSave} />}
       <div className="bg-slate-900 text-white p-8 rounded-b-[3rem] shadow-2xl relative z-10 overflow-hidden bg-gradient-to-br from-slate-900 to-blue-900">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-[80px] opacity-10 pointer-events-none"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-8">
               <div className="bg-green-500 text-white px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-green-500/30 flex items-center gap-2 w-max shadow-lg shadow-green-500/20"><span className="w-2 h-2 bg-white rounded-full animate-ping absolute opacity-75"></span><span className="w-1.5 h-1.5 bg-white rounded-full relative"></span> Turno Attivo</div>
               <div className="text-right"><p className="text-xs text-slate-400 uppercase font-bold">Driver</p><p className="font-bold text-lg">{session.user.name}</p></div>
            </div>
            <h2 className="text-5xl font-black mb-2 tracking-tighter">{session.targa}</h2>
            
            <div className="flex items-center gap-2 mb-4">
                {session.anomaly && <div className="inline-flex items-center gap-1 bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-xs font-bold border border-red-500/50"><AlertOctagon size={12}/> ANOMALIA KM START</div>}
                <div className="inline-flex items-center gap-1 bg-white/20 text-white px-3 py-1 rounded-full text-xs font-bold border border-white/50">{syncLoading ? <RefreshCw size={12} className="animate-spin"/> : <Check size={12}/>} Sync Attivo</div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
               <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/5 shadow-inner"><p className="text-xs text-slate-300 uppercase font-bold">KM Partenza</p><p className={`text-2xl font-mono font-black ${session.anomaly ? 'text-red-400' : 'text-white'}`}>{session.startKm}</p></div>
               <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/5 shadow-inner"><p className="text-xs text-slate-300 uppercase font-bold">Durata Turno</p><p className="text-2xl font-mono font-black text-white">{time}</p></div>
            </div>
          </div>
       </div>
       <div className="flex-1 flex flex-col justify-between p-6">
          <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 flex-1 mb-4 flex flex-col justify-center items-center">
             <div className="text-center w-full">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center justify-center gap-2"><Fuel className="text-orange-500" size={20}/> Stato Rifornimenti</h3>
                {session.fuelLogs && session.fuelLogs.length > 0 ? (
                  <div className="mb-6 bg-emerald-50 p-4 rounded-xl border-2 border-emerald-100 w-full animate-in fade-in shadow-inner">
                      <p className="text-emerald-800 font-black text-2xl">{session.fuelLogs.length}</p>
                      <p className="text-xs text-emerald-600 font-bold uppercase mt-1">Rifornimenti Registrati</p>
                      <p className="text-xs text-gray-500 mt-2">Ultimo: {session.fuelLogs[session.fuelLogs.length - 1].litri}L</p>
                  </div>
                ) : <div className="p-4 rounded-xl border-2 border-gray-100 w-full mb-6"><p className="text-gray-400 text-sm font-medium">Nessun rifornimento registrato</p></div>}
                <Button onClick={() => setShowFuelModal(true)} variant="warning" icon={Fuel} className="shadow-lg shadow-orange-300">Registra Nuovo Rifornimento</Button>
             </div>
          </div>
          <Button onClick={onEndShift} variant="danger" icon={LogOut} className="shadow-lg shadow-red-300">TERMINA TURNO & CHIUDI KM</Button>
       </div>
    </div>
  );
};

const EndShiftScreen = ({ session, onSave, onCancel, onSessionUpdate }) => {
  const [step, setStep] = useState('INPUT');
  const [endKm, setEndKm] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const parsedEndKm = parseInt(endKm) || 0;
  const totalKm = parsedEndKm > session.startKm ? parsedEndKm - session.startKm : 0;
  const totalFuelCost = session.fuelLogs ? session.fuelLogs.reduce((acc, curr) => acc + parseFloat(curr.importo), 0) : 0;
  const totalLiters = session.fuelLogs ? session.fuelLogs.reduce((acc, curr) => acc + parseFloat(curr.litri), 0) : 0;
  const anomalyEnd = parsedEndKm < session.startKm;

  // SYNC AGGIUNTO ANCHE IN END SHIFT
  useEffect(() => {
    const syncTimer = setInterval(async () => {
        const res = await apiCheckRemoteUpdates(session.user.name);
        
        if (res.found) {
            const updates = {};
            let hasUpdate = false;

            if (res.startKm && res.startKm !== session.startKm) {
                updates.startKm = res.startKm;
                hasUpdate = true;
            }
            if (res.targa && res.targa !== session.targa) {
                updates.targa = res.targa;
                hasUpdate = true;
            }

            if (hasUpdate) {
                onSessionUpdate(updates);
            }
        }
    }, 5000); 

    return () => clearInterval(syncTimer);
  }, [session]);

  const handleGoToSummary = () => {
    if (!endKm || parsedEndKm === 0) return showCustomAlert("Attenzione", "Inserisci i KM finali validi.", 'warning');
    
    if (anomalyEnd) {
        showCustomAlert(
            "ANOMALIA KM FINALI", 
            `I KM finali (${parsedEndKm}) sono minori di quelli iniziali (${session.startKm}). Assicurati di non aver inserito un valore errato o che non ci sia stato un giro completo del contachilometri. Procedi solo se sei sicuro.`, 
            'danger'
        );
    }
    setStep('SUMMARY');
  };

  const handleSave = async () => {
    setIsSaving(true);
    await apiSaveLog({ 
        driver: session.user.matricola, 
        driverName: session.user.name, 
        targa: session.targa, 
        start: session.startKm, 
        end: parsedEndKm, 
        totalKm: totalKm, 
        fuelOperations: session.fuelLogs,
        // Se c'era un'anomalia all'inizio O è subentrata alla fine, la marchiamo
        anomaly: session.anomaly || anomalyEnd
    });
    setIsSaving(false); setSaved(true); setTimeout(onSave, 2500);
  };

  if (saved) return <div className="h-full bg-emerald-600 text-white flex flex-col items-center justify-center animate-in fade-in"><div className="bg-white p-6 rounded-full shadow-2xl mb-6 scale-animation"><Check size={48} className="text-emerald-600"/></div><h2 className="text-3xl font-black mb-2">Turno Chiuso!</h2><p className="text-sm font-medium">Dati salvati con successo in Cloud.</p><style>{`@keyframes scale-animation { 0% { transform: scale(0.5); opacity: 0; } 80% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } } .scale-animation { animation: scale-animation 0.5s ease-out; }`}</style></div>;

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="bg-white p-6 shadow-md border-b border-gray-100 flex items-center justify-between">
          <div><h2 className="text-xl font-black text-gray-900">{step === 'INPUT' ? '1. Inserisci KM Finali' : '2. Riepilogo e Conferma'}</h2></div>
          <div className="bg-blue-50 text-blue-600 p-2 rounded-lg font-bold text-xs uppercase shadow-inner">Step {step === 'INPUT' ? '1/2' : '2/2'}</div>
      </div>
      <div className="flex-1 p-6 overflow-y-auto">
        {step === 'INPUT' && (
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 mb-6 text-center animate-in fade-in slide-in-from-bottom-8">
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 mb-8 inline-block w-full shadow-inner">
                    <p className="text-xs text-blue-600 font-bold uppercase mb-1 flex items-center justify-center gap-2"><ArrowRight size={14}/> KM Partenza</p>
                    <p className={`text-3xl font-mono font-black ${session.anomaly ? 'text-red-500' : 'text-blue-900'}`}>{session.startKm}</p>
                    {session.anomaly && <p className="text-[10px] text-red-500 font-bold mt-1 animate-pulse">ANOMALIA START REGISTRATA</p>}
                </div>
                <label className={`block text-xs font-black uppercase mb-4 ${anomalyEnd ? 'text-red-500' : 'text-gray-500'}`}>
                    {anomalyEnd ? 'KM FINALI INFERIORI ALLA PARTENZA' : 'KM FINALI ATTUALI'}
                </label>
                <input type="number" value={endKm} onChange={(e)=>setEndKm(e.target.value)} placeholder="000000" autoFocus className={`w-full text-center text-5xl font-mono font-black border-b-4 ${anomalyEnd ? 'border-red-500 text-red-600' : 'border-blue-500 text-gray-800'} outline-none pb-2 bg-transparent transition-colors`}/>
            </div>
        )}
        {step === 'SUMMARY' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-8">
                
                {/* Dettagli Veicolo e Driver */}
                <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-2xl text-blue-600 shadow-md"><Truck size={24} /></div>
                    <div><p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Veicolo / Driver</p><p className="text-2xl font-black text-slate-800">{session.targa} / {session.user.name}</p></div>
                </div>

                {/* Riepilogo KM */}
                <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100">
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center"><p className="text-[10px] text-gray-400 uppercase font-bold">Inizio</p><p className={`font-mono font-bold text-xl ${session.anomaly ? 'text-red-500' : 'text-gray-800'}`}>{session.startKm}</p></div>
                        <div className="text-center"><p className="text-[10px] text-gray-400 uppercase font-bold">Fine</p><p className={`font-mono font-bold text-xl ${anomalyEnd ? 'text-red-500' : 'text-gray-800'}`}>{parsedEndKm}</p></div>
                        <div className="text-center bg-blue-50 p-2 rounded-xl border border-blue-100"><p className="text-[10px] text-blue-600 uppercase font-bold">Totale</p><p className="text-2xl font-black text-blue-800">{totalKm} km</p></div>
                    </div>
                    {(session.anomaly || anomalyEnd) && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold flex items-center gap-2 mt-4 border border-red-100"><AlertOctagon size={14}/> ANOMALIA REGISTRATA NEL LOG!</div>}
                </div>

                {/* Riepilogo Carburante */}
                <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100">
                    <h3 className="font-black text-gray-800 mb-4 flex items-center gap-2"><Fuel className="text-orange-500" size={18}/> Dettagli Carburante</h3>
                    {session.fuelLogs.length > 0 ? 
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-orange-50 p-3 rounded-2xl text-center border border-orange-100"><p className="text-[10px] text-orange-400 font-bold uppercase">Litri Totali</p><p className="font-black text-orange-800 text-2xl">{totalLiters.toFixed(2)}</p></div>
                        <div className="bg-orange-50 p-3 rounded-2xl text-center border border-orange-100"><p className="text-[10px] text-orange-400 font-bold uppercase">Spesa Totale</p><p className="font-black text-orange-800 text-2xl">€ {totalFuelCost.toFixed(2)}</p></div>
                      </div> 
                      : <p className="text-sm text-gray-400 text-center bg-gray-50 p-3 rounded-xl">Nessun rifornimento registrato durante il turno.</p>
                    }
                </div>
            </div>
        )}
      </div>
      <div className="p-6 bg-white border-t border-gray-100 flex gap-4 pb-8 shadow-2xl">
        {step === 'INPUT' ? 
          <><button onClick={onCancel} className="font-bold text-gray-400 px-4 text-sm active:scale-95 transition-transform">Torna al Servizio</button><Button onClick={handleGoToSummary} icon={ArrowRight} disabled={!endKm}>Avanti al Riepilogo</Button></> 
          : 
          <><button onClick={() => setStep('INPUT')} className="font-bold text-gray-400 px-4 text-sm active:scale-95 transition-transform">Modifica KM</button><Button onClick={handleSave} loading={isSaving} variant="success" icon={Check}>Conferma e Salva Log</Button></>
        }
      </div>
    </div>
  );
};

// --- MAIN WRAPPER ---
export default function App() {
  const [user, setUser] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [view, setView] = useState('LOGIN');
  const [allSessions, setAllSessions] = useState({});

  // Carica sessioni da localStorage (anche se Firestore è preferito, per l'esigenza locale manteniamo)
  useEffect(() => { 
      const s = localStorage.getItem('driver_sessions_v11'); 
      if(s) {
          try {
              const loadedSessions = JSON.parse(s);
              // Ristabilisce la data come oggetto Date
              Object.values(loadedSessions).forEach(session => {
                  session.startTime = new Date(session.startTime);
              });
              setAllSessions(loadedSessions);
          } catch(e) {
              console.error("Failed to parse sessions from local storage", e);
              localStorage.removeItem('driver_sessions_v11');
          }
      } 
  }, []);

  const saveSessions = (s) => { 
      setAllSessions(s); 
      // Prima di salvare, assicurati che startTime sia serializzabile (stringa ISO)
      const serializableSessions = Object.fromEntries(
          Object.entries(s).map(([key, session]) => [
              key, 
              {...session, startTime: session.startTime instanceof Date ? session.startTime.toISOString() : session.startTime}
          ])
      );
      localStorage.setItem('driver_sessions_v11', JSON.stringify(serializableSessions)); 
  };

  const handleLogin = (u) => {
    setUser(u);
    const existing = allSessions[u.matricola];
    if (existing) { 
        setActiveSession({...existing, startTime: new Date(existing.startTime), user: u}); 
        setView('ACTIVE'); 
    }
    else setView('START');
  };

  const handleSessionUpdate = (updates) => {
    if (!activeSession) return;
    
    let resolvedAnomaly = activeSession.anomaly;
    if (updates.startKm) {
        resolvedAnomaly = false;
    }

    const updated = { ...activeSession, ...updates, anomaly: resolvedAnomaly };
    setActiveSession(updated);
    saveSessions({ ...allSessions, [user.matricola]: updated });
    
    // Mostra l'alert custom per la notifica
    if (updates.startKm) showCustomAlert("CORREZIONE UFFICIO", `Il KM Iniziale è stato corretto a: ${updates.startKm}. L'anomalia iniziale è stata rimossa.`, 'info');
    if (updates.targa) showCustomAlert("CORREZIONE UFFICIO", `La targa è stata corretta in: ${updates.targa}.`, 'info');
  };

  const handleStart = (data) => {
    const sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    const s = { ...data, user, fuelLogs: [], sessionId };
    
    setActiveSession(s); 
    setView('ACTIVE'); 
    saveSessions({ ...allSessions, [user.matricola]: s });

    apiStartShift(s);
  };

  const handleFuel = (f) => {
    const s = { ...activeSession, fuelLogs: [...(activeSession.fuelLogs || []), f] };
    setActiveSession(s); saveSessions({ ...allSessions, [user.matricola]: s });
  };

  const handleComplete = () => {
    setActiveSession(null);
    const updated = { ...allSessions }; 
    if (user && user.matricola) delete updated[user.matricola]; 
    saveSessions(updated);
    setUser(null); setView('LOGIN');
  };

  const handleLogout = () => { 
    if (activeSession) {
        // Se c'è una sessione attiva, chiedi conferma
        const isConfirmed = window.confirm("Hai una sessione attiva. Uscire ora la cancellerà. Continuare?");
        if (!isConfirmed) return;
        
        // Cancella la sessione attiva
        const updated = { ...allSessions }; 
        if (user && user.matricola) delete updated[user.matricola]; 
        saveSessions(updated);
    }
    setUser(null); setActiveSession(null); setView('LOGIN'); 
  };

  return (
    <CustomAlertProvider>
        <div className="w-full max-w-md mx-auto h-screen bg-white shadow-2xl overflow-hidden font-sans text-gray-900 relative">
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        {view !== 'LOGIN' && 
            <button 
                onClick={handleLogout} 
                className="absolute top-4 right-4 z-50 p-2 bg-white/90 backdrop-blur rounded-full shadow-lg text-slate-500 hover:bg-red-100 transition-colors active:scale-95"
                title="Esci dall'applicazione"
            >
                <LogOut size={18}/>
            </button>
        }
        
        {view === 'LOGIN' && <LoginScreen onLogin={handleLogin} />}
        {view === 'START' && <StartShiftScreen user={user} onStart={handleStart} />}
        {view === 'ACTIVE' && <ActiveShiftScreen session={activeSession} onEndShift={() => setView('END')} onAddFuel={handleFuel} onSessionUpdate={handleSessionUpdate} />}
        {view === 'END' && <EndShiftScreen session={activeSession} onSave={handleComplete} onCancel={() => setView('ACTIVE')} onSessionUpdate={handleSessionUpdate} />}
        </div>
    </CustomAlertProvider>
  );
}