import React, { useState, useEffect, useRef } from 'react';
import { 
  Truck, Navigation, Fuel, User, LogOut, Camera, X, Check, Clock, 
  Wifi, ChevronDown, Lock, Droplet, CreditCard, ArrowRight, 
  AlertTriangle, RefreshCw, History, Users, Calendar, AlertOctagon, 
  FileText, QrCode, CheckCircle, Smartphone, ScanLine, Edit2, MapPin,
  Wrench, AlertCircle, Disc, HelpCircle, Info, Search, Hash, UploadCloud,
  Image as ImageIcon, Aperture
} from 'lucide-react';

// ==========================================================================================
// ⚠️ CONFIGURAZIONE API ⚠️
// ==========================================================================================
const API_URL = "https://script.google.com/macros/s/AKfycbwf5jggXByFqNLeXsAoCy_OgfDxsi3Bhsy989eOd9-ay6AuPtcUAoDjNclB0JFhse0P/exec"; 

// ==========================================================================================
// --- UTILITY: DATA EXIF (Metodo Regex Leggero) ---
// ==========================================================================================

const getExifDate = (file) => {
  return new Promise((resolve) => {
    // Leggiamo i primi 64KB del file dove risiedono solitamente gli header EXIF
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      // Cerca il pattern standard EXIF: YYYY:MM:DD HH:MM:SS
      const match = text.match(/(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})/);
      if (match) {
        // I mesi in JS partono da 0 (Gennaio = 0), quindi sottraiamo 1 al mese
        const date = new Date(match[1], match[2] - 1, match[3], match[4], match[5], match[6]);
        resolve(date);
      } else {
        resolve(null);
      }
    };
    reader.onerror = () => resolve(null);
    // readAsBinaryString è il metodo più compatibile per questo hack regex
    reader.readAsBinaryString(file.slice(0, 65536));
  });
};

// ==========================================================================================
// --- UTILITY: IMMAGINI E WATERMARK ---
// ==========================================================================================

const processImageWithWatermark = (fileOrBase64, sourceDate = null) => {
  return new Promise((resolve) => {
    // Gestione input: se è un File/Blob crea URL, se è stringa usa così com'è
    const src = fileOrBase64 instanceof Blob ? URL.createObjectURL(fileOrBase64) : fileOrBase64;
    
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      const MAX_WIDTH = 1920; 
      const MAX_HEIGHT = 1920;
      let width = img.width;
      let height = img.height;
      
      // Ridimensionamento proporzionale
      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // 1. Disegna l'immagine base
      ctx.drawImage(img, 0, 0, width, height);
      
      // 2. Prepara la stringa Data/Ora
      // Se sourceDate è fornito (es. EXIF), usa quello. Altrimenti usa ADESSO.
      const timestamp = sourceDate ? new Date(sourceDate) : new Date();
      
      // Formatta la data: GG/MM/AAAA HH:MM
      const dateStr = timestamp.toLocaleString('it-IT', { 
        day: '2-digit', month: '2-digit', year: 'numeric', 
        hour: '2-digit', minute: '2-digit' 
      });
      
      const watermarkText = `📅 ${dateStr}`;

      // 3. Stile del Watermark
      // Dimensione font dinamica (3% della larghezza foto) ma minimo 16px
      const fontSize = Math.max(16, Math.floor(width * 0.03)); 
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      
      // Posizione: Angolo in basso a destra con 20px di margine
      const x = width - 20;
      const y = height - 20;

      // Ombreggiatura/Bordo nero per leggibilità su sfondi chiari
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'black';
      ctx.strokeText(watermarkText, x, y);
      
      // Testo bianco
      ctx.fillStyle = 'white';
      ctx.fillText(watermarkText, x, y);

      // Pulisce la memoria se era un Blob URL
      if (fileOrBase64 instanceof Blob) URL.revokeObjectURL(src);

      // Esporta in JPEG compresso
      resolve(canvas.toDataURL('image/jpeg', 0.92));
    };
    img.src = src;
  });
};

// ==========================================================================================
// --- UTILITY API ---
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

// Dati Mock per fallback
const MOCK_DATA = {
    drivers: { '12345': 'Mario Rossi (Demo)', '67890': 'Luigi Verdi (Demo)' },
    vehicles: [
        { targa: 'AA 123 BB', modello: 'Fiat Ducato (Demo)', lastKm: 154300, lastDriver: 'Luigi V.', vin: 'VIN123' },
        { targa: 'CC 456 DD', modello: 'Iveco Daily (Demo)', lastKm: 89000, lastDriver: 'Mario R.', vin: 'VIN456' }
    ],
    stations: [{ id: 1, nome: 'Distributore Demo' }, { id: 2, nome: 'Stazione Ovest (Demo)' }],
    fuelPins: [{ number: '700012345', pin: '1234' }, { number: '700067890', pin: '5678' }],
    history: [],
    driverHistory: []
};

const isDemoMode = () => !API_URL || API_URL.includes("INSERISCI_QUI");

// ==========================================================================================
// --- ICONE SPIE REALI (VETTORIALI) ---
// ==========================================================================================
// (Inserite qui per brevità, sono le stesse SVG)
const IconMotore = ({ className }) => (<svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M19 5h-2V3h-2v2h-2V3h-2v2H9V3H7v2H5v4l-1.4 1.4L5 11.8V19h14v-7.2l1.4-1.4L19 9V5zM8 14h2v2H8v-2zm6 2h-2v-2h2v2z" /><path d="M4,10 h1 v5 h-1 z M20,10 h1 v5 h-1 z"/></svg>);
const IconOlio = ({ className }) => (<svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M19,15c0,2.8-2.2,5-5,5H7c-2.2,0-4-1.8-4-4v-1.4l2.8-7.6l0.9-0.3C7.3,6.5,7.9,6.4,8.5,6.5l0.6-3.5h2.4v2.1h3.8L18,11.4 C18.6,12.5,19,13.7,19,15z M20.5,3c-0.8,0-1.5,0.7-1.5,1.5c0,0.3,0.1,0.5,0.2,0.7l2.1,2.5l2.1-2.5C23.4,5,23.5,4.8,23.5,4.5 C23.5,3.7,22.8,3,20.5,3z"/></svg>);
const IconBatteria = ({ className }) => (<svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M16,4h-1V2h-2v2H9v2H8C6.9,6,6,6.9,6,8v12c0,1.1,0.9,2,2,2h8c1.1,0,2-0.9,2-2V8c0-1.1-0.9-2-2-2h-1V4z M10,14H8v-2h2V14z M16,14h-4v-2h4V14z"/><rect x="9" y="9" width="6" height="2" fill="white" opacity="0.3"/></svg>);
const IconTemperatura = ({ className }) => (<svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M12.5,11.1V6c0-1.7-1.3-3-3-3s-3,1.3-3,3v5.1c-1.3,0.9-2,2.4-2,4c0,2.8,2.2,5,5,5s5-2.2,5-5C14.5,13.5,13.8,12,12.5,11.1z M10.5,6c0-0.6,0.4-1,1-1s1,0.4,1,1v3h-2V6z"/><path d="M16.8,17c0.6,0,1.1-0.2,1.5-0.6l1.1,1.1c-0.7,0.7-1.6,1.1-2.6,1.1s-2-0.4-2.6-1.1l1.1-1.1C15.7,16.8,16.2,17,16.8,17z M16.8,13c0.6,0,1.1-0.2,1.5-0.6l1.1,1.1c-0.7,0.7-1.6,1.1-2.6,1.1s-2-0.4-2.6-1.1l1.1-1.1C15.7,12.8,16.2,13,16.8,13z M5.2,17c-0.6,0-1.1-0.2-1.5-0.6l-1.1,1.1c0.7,0.7,1.6,1.1,2.6,1.1s2-0.4,2.6-1.1l-1.1-1.1C6.3,16.8,5.8,17,5.2,17z M5.2,13c-0.6,0-1.1-0.2-1.5-0.6l-1.1,1.1c0.7,0.7,1.6,1.1,2.6,1.1s2-0.4,2.6-1.1l-1.1-1.1C6.3,12.8,5.8,13,5.2,13z"/></svg>);
const IconFreni = ({ className }) => (<svg viewBox="0 0 24 24" fill="currentColor" className={className}><circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M11,8h2v5h-2V8z M11,15h2v2h-2V15z"/><path d="M4,12c0-3.3,2-6.2,5-7.4L8.3,3C4.2,4.6,1.5,8.4,1.5,12.9c0,4.4,2.7,8.2,6.8,9.9l0.7-1.6C6,19.9,4,16.5,4,12z"/><path d="M20,12c0,3.3-2,6.2-5,7.4l0.7,1.6c4.1-1.7,6.8-5.4,6.8-9.9c0-4.4-2.7-8.2-6.8-9.9l-0.7,1.6C18,5.8,20,9.1,20,12z"/></svg>);
const IconPneumatici = ({ className }) => (<svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M12,5c-3.9,0-7,3.1-7,7c0,1.7,0.6,3.3,1.6,4.6l-1.6,1.2C3.6,16.2,3,14.2,3,12c0-5,4-9,9-9s9,4,9,9c0,2.2-0.6,4.2-2,5.8 l-1.6-1.2C18.4,15.3,19,13.7,19,12C19,8.1,15.9,5,12,5z"/><path d="M11,17v2h2v-2H11z M11,9h2v6h-2V9z"/><path d="M6.5,19l1.5,0l0,2l-2,0L6.5,19z M10.5,19l1.5,0l0,2l-2,0L10.5,19z M14.5,19l1.5,0l0,2l-2,0L14.5,19z"/></svg>);

// ==========================================================================================
// --- CHIAMATE API ---
// ==========================================================================================

const apiFetchDriverName = async (matricola) => {
  if (isDemoMode()) { 
    await new Promise(r => setTimeout(r, 500)); 
    return MOCK_DATA.drivers[matricola] ? { success: true, name: MOCK_DATA.drivers[matricola] } : { success: false }; 
  }
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
    const formattedFuelData = {
        ...fuelData,
        importo: fuelData.importo ? fuelData.importo.toString().replace('.', ',') : '',
        litri: fuelData.litri ? fuelData.litri.toString().replace('.', ',') : '',
        fuelId: fuelData.id
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

const apiUploadPhotos = async (session, photos) => {
    try {
        const payload = {
            type: 'PHOTOS',
            driver: session.user.matricola,
            driverName: session.user.name,
            targa: session.targa,
            photos: photos 
        };
        await fetchWithRetry(API_URL, { method: 'POST', body: JSON.stringify(payload) });
        return { success: true };
    } catch (error) {
        showCustomAlert("Errore Upload", "Impossibile caricare le foto. Riprova.", 'danger');
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
      className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center shadow-lg transition-all active:scale-95 text-sm uppercase tracking-wider ${variants[variant]} ${className} ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
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

const CameraCapture = ({ onCapture, onClose }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        let stream = null;
        const startCam = async () => {
            try {
                // Priorità alla fotocamera posteriore (environment)
                stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { facingMode: "environment" ,
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                  } 
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.setAttribute('playsinline', 'true');
                }
            } catch (err) {
                alert("Impossibile accedere alla fotocamera. Verifica i permessi.");
                onClose();
            }
        };
        startCam();
        return () => { 
            if (stream) stream.getTracks().forEach(t => t.stop()); 
        };
    }, []);

    const takePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            // Imposta il canvas alle dimensioni del video
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            // Disegna il frame corrente
            canvas.getContext('2d').drawImage(video, 0, 0);
            // Converte in JPEG
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            onCapture(dataUrl);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col">
            <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="flex-1 w-full object-cover" 
            />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute bottom-0 w-full p-6 bg-black/50 flex justify-between items-center safe-area-bottom">
                <button onClick={onClose} className="text-white font-bold p-4">Annulla</button>
                <button 
                    onClick={takePhoto} 
                    className="w-20 h-20 bg-white rounded-full border-4 border-gray-300 shadow-lg active:scale-95 transition-transform"
                ></button>
                <div className="w-16"></div>
            </div>
        </div>
    );
};

const BarcodeScanner = ({ onScan, onClose }) => {
  const videoRef = useRef(null);
  const [isNativeSupported, setIsNativeSupported] = useState(true);

  useEffect(() => {
    let stream = null;
    let interval = null;

    const startCamera = async () => {
      try {
        // Tenta di usare la fotocamera posteriore
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: { exact: "environment" } } 
        }).catch(() => {
             // Fallback se fallisce
             return navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        });
        
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.setAttribute('playsinline', 'true'); 
        }

        // Controlla se il browser supporta nativamente la lettura codici
        if ('BarcodeDetector' in window) {
            // @ts-ignore
            const barcodeDetector = new window.BarcodeDetector({
                formats: ['code_128', 'code_39', 'ean_13', 'ean_8', 'qr_code', 'upc_a', 'upc_e', 'itf', 'codabar']
            });
            interval = setInterval(async () => {
                if (videoRef.current) {
                    try {
                        const barcodes = await barcodeDetector.detect(videoRef.current);
                        if (barcodes.length > 0) {
                            if (navigator.vibrate) navigator.vibrate(200);
                            onScan(barcodes[0].rawValue);
                        }
                    } catch (err) {}
                }
            }, 500);
        } else {
            // Se non c'è supporto nativo (es. iOS Safari standard), mostra pulsante manuale
            setIsNativeSupported(false);
        }
      } catch (err) {
        console.error(err);
        setIsNativeSupported(false);
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
         <span className="font-bold">Scansione Badge / VIN</span>
         <button onClick={onClose} className="p-2 bg-white/20 rounded-full"><X size={24}/></button>
       </div>
       
       <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover"/>
       
       {/* Mirino */}
       <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
           <div className="w-72 h-48 border-2 border-white/50 rounded-2xl relative">
              <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-green-500 -mt-1 -ml-1 rounded-tl-lg"></div>
              <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-green-500 -mt-1 -mr-1 rounded-tr-lg"></div>
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-green-500 -mb-1 -ml-1 rounded-bl-lg"></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-green-500 -mb-1 -mr-1 rounded-br-lg"></div>
              <div className="w-full h-0.5 bg-red-500 absolute top-1/2 -translate-y-1/2 animate-[scan_2s_infinite_alternate] shadow-[0_0_10px_red]"></div>
           </div>
       </div>
       
       {/* Fallback per iOS/Non-supportati */}
       {!isNativeSupported && (
          <div className="absolute bottom-20 z-20 w-full flex justify-center">
              <button 
                  onClick={() => {
                      const mockVin = prompt("Simulazione: Inserisci VIN manuale (es. VIN123)");
                      if(mockVin) onScan(mockVin);
                  }} 
                  className="bg-white text-black px-6 py-4 rounded-full font-bold shadow-xl flex items-center gap-2 active:scale-95 transition-transform"
              >
                 <Camera size={24} className="text-blue-600"/> 
                 <div className="text-left leading-none">
                    <span className="block text-sm">Inserisci Manualmente</span>
                    <span className="text-[10px] text-gray-500">Lettura nativa non disponibile</span>
                 </div>
              </button>
          </div>
       )}

       <div className="absolute bottom-8 w-full text-center z-10 px-4 opacity-70">
           <p className="font-bold text-lg">Inquadra il codice a barre</p>
       </div>
    </div>
  );
};

const PhotoUploadModal = ({ onClose, onSave, title = "Foto Mezzo" }) => {
    const [photos, setPhotos] = useState({ front: null, back: null, left: null, right: null });
    const [showCam, setShowCam] = useState(null);
    const [uploading, setUploading] = useState(false);
    const angles = [{k:'front',l:'Avanti'},{k:'back',l:'Dietro'},{k:'left',l:'Sinistra'},{k:'right',l:'Destra'}];

    // --- AGGIORNATO: GESTIONE FILE CON EXIF ---
    const handleFile = async (e, k) => { 
        const file = e.target.files[0];
        if(file) {
            let finalDate = null;
            
            // 1. Prova a estrarre data EXIF (scatto originale)
            try {
                const exifDate = await getExifDate(file);
                if (exifDate && !isNaN(exifDate.getTime())) {
                    finalDate = exifDate;
                }
            } catch (err) {}

            // 2. Fallback su Last Modified se EXIF fallisce
            if (!finalDate) {
                finalDate = file.lastModified; 
            }
            
            // 3. Applica Watermark
            const watermarked = await processImageWithWatermark(file, finalDate); 
            setPhotos(p => ({...p, [k]: watermarked})); 
        }
    };

    // --- AGGIORNATO: GESTIONE CAM IN-APP ---
    const handleCam = async (b64) => { 
        // Usa data/ora attuale
        const watermarked = await processImageWithWatermark(b64, Date.now());
        setPhotos(p => ({...p, [showCam]: watermarked})); 
        setShowCam(null); 
    };
    
    const handleUpload = async () => {
        if (angles.some(a => !photos[a.k])) return alert("Mancano foto!");
        setUploading(true);
        const arr = angles.map(a => ({ angle: a.k, base64: photos[a.k] }));
        await onSave(arr);
        setUploading(false); onClose();
    };

    if (showCam) return <CameraCapture onCapture={handleCam} onClose={() => setShowCam(null)}/>;

    return (
        <div className="fixed inset-0 z-[90] bg-black/90 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white w-full max-w-md rounded-3xl p-6 flex flex-col max-h-[90vh]">
                <div className="flex justify-between mb-4 border-b pb-4"><h3 className="text-xl font-bold text-blue-700">{title}</h3><button onClick={onClose}><X/></button></div>
                <div className="flex-1 overflow-y-auto grid grid-cols-1 gap-4 mb-4">
                    {angles.map(a => (
                        <div key={a.k} className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                            <div className="flex justify-between mb-2"><span className="font-bold uppercase">{a.l}</span>{photos[a.k] && <CheckCircle className="text-green-500"/>}</div>
                            {photos[a.k] ? <div className="relative aspect-video"><img src={photos[a.k]} className="w-full h-full object-cover rounded"/> <button onClick={()=>setPhotos(p=>({...p,[a.k]:null}))} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"><X size={12}/></button></div> 
                            : <div className="flex gap-2">
                                <button onClick={() => setShowCam(a.k)} className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-bold flex justify-center gap-2 active:scale-95 transition-transform"><Aperture size={18}/> Scatta</button>
                                <label className="flex-1 py-3 bg-white border border-gray-300 text-gray-600 rounded-lg font-bold flex justify-center gap-2 cursor-pointer active:scale-95 transition-transform"><ImageIcon size={18}/> Carica <input type="file" accept="image/*" className="hidden" onChange={e=>handleFile(e,a.k)}/></label>
                              </div>}
                        </div>
                    ))}
                </div>
                <Button onClick={handleUpload} loading={uploading} icon={UploadCloud}>Invia Foto</Button>
            </div>
        </div>
    );
};

const ReportModal = ({ onClose, onSave }) => {
  const [category, setCategory] = useState('Spia Accesa');
  const [notes, setNotes] = useState('');
  const [isStopped, setIsStopped] = useState(false);
  const [sending, setSending] = useState(false);
  const categories = ['Spia Cruscotto', 'Pneumatici', 'Motore', 'Carrozzeria', 'Altro'];

  const handleSend = async () => {
      if(!notes) return showCustomAlert("Errore", "Inserisci descrizione.", "warning");
      setSending(true); await onSave({ category, notes, isStopped }); setSending(false); onClose();
  };

  return (
    <div className="fixed inset-0 z-[80] bg-black/80 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl">
        <div className="flex justify-between mb-6 border-b pb-4"><h3 className="text-xl font-bold text-red-600 flex gap-2"><AlertTriangle/> Segnala Guasto</h3><button onClick={onClose}><X/></button></div>
        <div className="space-y-4">
           <div><label className="block text-xs font-bold text-gray-500 uppercase mb-2">Categoria</label>
              <div className="grid grid-cols-2 gap-2">{categories.map(c => <button key={c} onClick={() => setCategory(c)} className={`p-3 rounded-xl border-2 font-bold text-sm ${category === c ? 'bg-red-50 border-red-500 text-red-700' : 'bg-white border-gray-100 text-gray-600'}`}>{c}</button>)}</div>
           </div>
           <textarea className="w-full p-4 bg-gray-50 rounded-xl border-2 focus:border-red-500 outline-none h-32 font-bold text-gray-700" placeholder="Descrivi il problema..." value={notes} onChange={e => setNotes(e.target.value)}/>
           <div className="flex items-center gap-3 bg-red-50 p-4 rounded-xl border border-red-100">
              <input type="checkbox" checked={isStopped} onChange={e => setIsStopped(e.target.checked)} className="w-6 h-6 accent-red-600"/> <label className="font-bold text-red-800">Mezzo Fermo?</label>
           </div>
           <Button onClick={handleSend} loading={sending} variant="danger" icon={Check}>Invia Segnalazione</Button>
        </div>
      </div>
    </div>
  );
};

const PinModal = ({ onClose }) => {
  const [pins, setPins] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => { apiFetchFuelPins().then(d => { setPins(d); setLoading(false); }); }, []);
  const filtered = pins.filter(p => p.number.includes(search));
  return ( <div className="fixed inset-0 z-[85] bg-black/80 flex items-center justify-center p-4"> <div className="bg-white w-full max-w-md rounded-3xl p-6 h-[70vh] flex flex-col"> <div className="flex justify-between mb-4 border-b pb-4"><h3 className="text-xl font-bold flex gap-2"><Hash/> PIN Tessere</h3><button onClick={onClose}><X/></button></div> <input type="text" placeholder="Cerca tessera..." className="w-full bg-gray-100 p-3 rounded-xl mb-4 font-bold" value={search} onChange={e => setSearch(e.target.value)}/> <div className="flex-1 overflow-y-auto space-y-2"> {loading ? <p>Caricamento...</p> : filtered.map((p, i) => <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border"><span className="font-mono font-bold text-lg">{p.number}</span><span className="text-2xl font-black bg-white px-4 py-1 rounded border">{p.pin}</span></div>)} </div> </div> </div> );
};

const RefuelingModal = ({ onClose, onSave, initialData }) => {
  const [stations, setStations] = useState([]);
  const [formData, setFormData] = useState(initialData || { id: Date.now(), importo: '', litri: '', tessera: '', impianto: '' });
  useEffect(() => { apiFetchStations().then(d => setStations(d)); }, []);
  const handle = () => { if(!formData.importo || !formData.litri || !formData.tessera || !formData.impianto) return showCustomAlert("Errore", "Compila tutto", "warning"); onSave(formData); onClose(); };
  return ( <div className="fixed inset-0 z-[70] bg-black/80 flex items-center justify-center p-4"> <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl"> <div className="flex justify-between mb-6 border-b pb-4"><h3 className="text-xl font-bold flex gap-2"><Fuel className="text-orange-600"/> Rifornimento</h3><button onClick={onClose}><X/></button></div> <div className="space-y-4"> <div className="grid grid-cols-2 gap-4"><Input label="Euro" type="number" icon={CreditCard} value={formData.importo} onChange={e=>setFormData({...formData, importo:e.target.value})}/><Input label="Litri" type="number" icon={Droplet} value={formData.litri} onChange={e=>setFormData({...formData, litri:e.target.value})}/></div> <div className="mb-4"><label className="text-xs font-bold text-gray-500 uppercase">Tessera</label><div className="flex items-center bg-gray-100 rounded-xl overflow-hidden border-2 border-transparent focus-within:border-blue-500"><div className="px-3 py-4 bg-gray-200 font-bold text-gray-600">POMEZIA -</div><input className="w-full p-4 bg-transparent outline-none font-bold" type="number" placeholder="1234" value={formData.tessera.replace('POMEZIA - ', '')} onChange={e=>setFormData({...formData, tessera:`POMEZIA - ${e.target.value}`})}/></div><p className="text-[10px] text-gray-400 mt-1"><Info size={10} className="inline"/> Numero sul retro</p></div> <div><label className="text-xs font-bold text-gray-500 uppercase">Impianto</label><select className="w-full p-4 bg-gray-50 rounded-xl font-bold" value={formData.impianto} onChange={e=>setFormData({...formData, impianto:e.target.value})}><option value="">Seleziona...</option>{stations.map((s,i)=><option key={i} value={s.nome}>{s.nome}</option>)}</select></div> <Button onClick={handle} icon={Check} variant="warning">Salva</Button> </div> </div> </div> );
};

const DriverHistoryModal = ({ matricola, onClose }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiFetchDriverPersonalHistory(matricola)
      .then(data => {
        setHistory(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [matricola]);

  return (
    <div className="fixed inset-0 z-[90] bg-black/80 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 h-[70vh] flex flex-col shadow-2xl">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <div>
            <h3 className="text-xl font-black text-gray-800">Le mie Attività</h3>
            <p className="text-xs text-gray-400 font-bold uppercase">Storico Turni</p>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
            <X size={20} className="text-gray-600"/>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-1">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3">
              <RefreshCw className="w-10 h-10 animate-spin text-blue-500" />
              <p className="text-xs font-bold uppercase tracking-wider">Caricamento storico...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <History size={48} className="mb-2 opacity-20"/>
              <p className="font-bold">Nessuna attività recente</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((h, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500 group-hover:bg-blue-600 transition-colors"></div>
                  
                  <div className="flex justify-between items-start mb-2 pl-2">
                    <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase">
                      <Calendar size={12} />
                      <span>{new Date(h.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}</span>
                    </div>
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg text-xs font-black">
                      {h.total} km
                    </span>
                  </div>

                  <div className="pl-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Truck size={16} className="text-gray-400"/>
                      <span className="text-lg font-black text-gray-800">{h.targa}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 text-xs font-bold bg-gray-50 inline-flex px-2 py-1 rounded-md">
                      <Clock size={12} />
                      <span>{h.start} - {h.end}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const VehicleHistoryModal = ({ targa, onClose }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiFetchVehicleHistory(targa)
      .then(data => {
        setHistory(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [targa]);

  return (
    <div className="fixed inset-0 z-[80] bg-black/80 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 h-[60vh] flex flex-col shadow-2xl">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <div>
            <h3 className="text-xl font-black text-gray-800">Ultimi Driver</h3>
            <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
              <Truck size={14}/> {targa}
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
            <X size={20} className="text-gray-600"/>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-1">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
              <p className="text-xs font-bold uppercase tracking-wider">Analisi storico...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <Users size={48} className="mb-2 opacity-20"/>
              <p className="font-bold">Nessun utilizzo recente</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((h, i) => (
                <div key={i} className="flex items-center p-3 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="bg-white p-3 rounded-full shadow-sm text-blue-500 border border-blue-50">
                    <User size={20} />
                  </div>
                  <div className="ml-3 flex-1 overflow-hidden">
                    <p className="font-bold text-gray-800 truncate">{h.driver}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1">
                      <CheckCircle size={10} className="text-green-500"/> Turno Concluso
                    </p>
                  </div>
                  <div className="text-right pl-2 border-l border-gray-200 ml-2">
                    <span className="block font-black text-gray-700 text-sm whitespace-nowrap">{h.km}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">KM Finali</span>
                  </div>
                </div>
              ))}
            </div>
          )}
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
  const [showScan, setShowScan] = useState(false);
  const performLogin = async (code) => { if(!code) return; setLoading(true); const res = await apiFetchDriverName(code); if(res.success) await onLogin({matricola:code, name:res.name}); else { setLoading(false); showCustomAlert("Errore", "Matricola non trovata", "danger"); } };
  return ( <div className="flex flex-col h-full bg-slate-900 p-6 justify-center relative"> {showScan && <BarcodeScanner onScan={c=>{setShowScan(false); performLogin(c)}} onClose={()=>setShowScan(false)}/>} <div className="absolute top-0 left-0 w-full h-full bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div> <div className="bg-white rounded-3xl p-8 shadow-2xl z-10"> <h1 className="text-3xl font-black text-center mb-8">Driver<span className="text-blue-600">Log</span></h1> <div className="flex justify-center mb-6"><img src="https://www.camtrasportisrl.com/wp-content/uploads/2025/09/logo.png" className="h-16 object-contain"/></div> <Button onClick={()=>setShowScan(true)} icon={Camera} className="mb-6">Scansiona Badge</Button> <div className="text-center text-xs text-gray-400 uppercase mb-4">Manuale</div> <div className="flex gap-2"><input className="w-full bg-gray-100 rounded-xl p-4 font-bold text-center outline-none" placeholder="Matricola" value={matricola} onChange={e=>setMatricola(e.target.value)} disabled={loading}/> <button onClick={()=>performLogin(matricola)} disabled={loading||!matricola} className="bg-blue-600 text-white px-6 rounded-xl font-bold">{loading?<RefreshCw className="animate-spin"/>:<ArrowRight/>}</button> </div> </div> </div> );
};

const StartShiftScreen = ({ user, onStart, onLogout }) => {
  const [targa, setTarga] = useState('');
  const [km, setKm] = useState('');
  const [vehicles, setVehicles] = useState([]);
  const [showQR, setShowQR] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showMyHistory, setShowMyHistory] = useState(false);
  const [showPhotos, setShowPhotos] = useState(false);
  const [loadingVehicles, setLoadingVehicles] = useState(true);

  useEffect(() => { 
      apiFetchVehicles().then(data => { 
          setVehicles(data); 
          setLoadingVehicles(false); 
      }); 
  }, []);

  const selectedV = vehicles.find(v => v.targa === targa);
  const isLowKm = selectedV && km && parseInt(km) < selectedV.lastKm;

  const handleQR = (code) => { 
      const cleanCode = code.trim().replace(/\s+/g, '').toUpperCase();
      const v = vehicles.find(veh => veh.vin && veh.vin.trim().replace(/\s+/g, '').toUpperCase() === cleanCode); 
      if(v) { 
          setTarga(v.targa); 
          setShowQR(false); 
          showCustomAlert("Successo", `Veicolo trovato: ${v.targa}`, "success"); 
      } else { 
          showCustomAlert("Errore", `VIN non trovato: ${cleanCode}`, "danger"); 
      } 
  };
  
  const handleStart = () => { if(!targa || !km) return showCustomAlert("Attenzione", "Inserisci tutti i dati", "warning"); if(isLowKm && !confirm("KM inferiori allo storico. Confermi?")) return; onStart({ targa, startKm: parseInt(km), startTime: new Date(), fuelLogs: [], anomaly: isLowKm }); };
  const handlePhotoSave = async (d) => { const r = await apiUploadPhotos({ user, targa }, d); if(r.success) showCustomAlert("Fatto", "Foto caricate", "success"); };

  if (loadingVehicles) {
      return (
        <div className="flex flex-col h-full bg-slate-900 items-center justify-center text-white p-6">
            <RefreshCw className="w-12 h-12 animate-spin text-blue-500 mb-4"/>
            <h2 className="text-xl font-bold">Sincronizzazione Flotta</h2>
            <p className="text-sm text-slate-400 mt-2">Recupero dati veicoli in corso...</p>
        </div>
      );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {showQR && <BarcodeScanner onScan={handleQR} onClose={()=>setShowQR(false)}/>}
      {showHistory && <VehicleHistoryModal targa={targa} onClose={()=>setShowHistory(false)}/>}
      {showMyHistory && <DriverHistoryModal matricola={user.matricola} onClose={()=>setShowMyHistory(false)}/>}
      {showPhotos && <PhotoUploadModal title="Foto Presa Veicolo" onClose={()=>setShowPhotos(false)} onSave={handlePhotoSave}/>}

      <div className="p-6 bg-white shadow-sm flex justify-between items-center"><div><h2 className="font-bold text-xl">Ciao,</h2><p className="text-blue-600 font-black">{user.name}</p></div> <div className="flex gap-2"><button onClick={onLogout} className="p-2 bg-gray-100 rounded-full text-red-500"><LogOut/></button></div></div>
      
      <div className="flex-1 p-6 overflow-y-auto">
         <button onClick={()=>setShowMyHistory(true)} className="w-full mb-4 py-3 bg-white border-2 border-gray-200 rounded-xl font-bold text-gray-600 flex justify-center gap-2 text-sm"><Clock size={16}/> Le mie registrazioni</button>
         
         <div className="bg-white p-6 rounded-3xl shadow-sm border mb-4">
            <div className="flex justify-between mb-2"><label className="text-xs font-bold text-gray-400 uppercase">Veicolo</label><button onClick={()=>setShowQR(true)} className="text-[10px] bg-slate-900 text-white px-3 py-1 rounded-full flex gap-1"><QrCode size={10}/> SCAN VIN</button></div>
            <select value={targa} onChange={e=>setTarga(e.target.value)} className="w-full p-4 bg-gray-50 rounded-xl font-bold text-lg mb-4"><option value="">Seleziona...</option>{vehicles.map((v,i)=><option key={i} value={v.targa}>{v.targa} - {v.modello}</option>)}</select>
            {selectedV && ( 
                <div>
                    <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100 mb-2">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-xs text-blue-500 font-bold uppercase">Ultima Chiusura</p>
                                <p className="text-2xl font-black text-blue-900">{selectedV.lastKm} km</p>
                            </div>
                            <button onClick={() => setKm(selectedV.lastKm)} className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-bold">Usa</button>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={()=>setShowHistory(true)} className="flex-1 py-3 bg-gray-100 rounded-lg text-xs font-bold text-gray-600 flex flex-col items-center justify-center gap-1"><Users size={20}/><span>Storico</span></button>
                        <button onClick={() => setShowPhotos(true)} className="flex-1 py-3 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold border border-blue-200 flex flex-col items-center justify-center gap-1"><Camera size={20}/><span>Foto Presa</span></button>
                    </div>
                </div> 
            )}
         </div>

         <div className={`bg-white p-6 rounded-3xl shadow-sm border ${isLowKm ? 'border-red-500 bg-red-50' : ''}`}>
            <label className={`text-xs font-bold uppercase block mb-2 ${isLowKm ? 'text-red-600' : 'text-gray-400'}`}>{isLowKm ? 'ATTENZIONE: KM INFERIORI' : 'KM Attuali'}</label>
            <input type="number" value={km} onChange={e=>setKm(e.target.value)} className="w-full text-center text-4xl font-black bg-transparent outline-none border-b-2 pb-2 focus:border-blue-500" placeholder="000000"/>
         </div>
      </div>

      <div className="p-6 bg-white border-t"><Button onClick={handleStart} icon={Navigation} variant={isLowKm ? 'danger' : 'primary'}>Inizia Turno</Button></div>
    </div>
  );
};

const ActiveShiftScreen = ({ session, onEndShift, onAddFuel, onUpdateFuel, onLogout }) => {
  const [time, setTime] = useState("00:00:00");
  const [showFuel, setShowFuel] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showPins, setShowPins] = useState(false);
  const [showPhotos, setShowPhotos] = useState(false);
  const [editFuel, setEditFuel] = useState(null);

  useEffect(() => { const i = setInterval(() => { const d = new Date() - new Date(session.startTime); setTime(new Date(d).toISOString().substr(11, 8)); }, 1000); return () => clearInterval(i); }, []);

  const handleFuelSave = (d) => { if(editFuel) onUpdateFuel(d); else { apiLogFuel(session, d); onAddFuel(d); } setShowFuel(false); setEditFuel(null); };
  const handleReport = async (d) => { const r = await apiReportIssue(session, d); if(r.success) showCustomAlert("Inviato", "Segnalazione registrata", "success"); };
  const handlePhotos = async (d) => { const r = await apiUploadPhotos(session, d); if(r.success) showCustomAlert("Fatto", "Foto caricate", "success"); };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {showFuel && <RefuelingModal onClose={()=>setShowFuel(false)} onSave={handleFuelSave} initialData={editFuel}/>}
      {showReport && <ReportModal onClose={()=>setShowReport(false)} onSave={handleReport}/>}
      {showPins && <PinModal onClose={()=>setShowPins(false)}/>}
      {showPhotos && <PhotoUploadModal onClose={()=>setShowPhotos(false)} onSave={handlePhotos} title="Foto Riconsegna"/>}

      <div className="bg-slate-900 text-white p-8 rounded-b-[2.5rem] relative shadow-xl">
         <button onClick={onLogout} className="absolute top-6 right-6 p-2 bg-white/10 rounded-full"><LogOut/></button>
         <div className="relative z-10">
            <div className="flex justify-between mb-4"><span className="bg-green-500 px-3 py-1 rounded-full text-[10px] font-bold animate-pulse">IN CORSO</span><p className="text-xs opacity-70 font-bold">{session.user.name}</p></div>
            <h2 className="text-4xl font-black mb-6">{session.targa}</h2>
            <div className="grid grid-cols-2 gap-4"><div className="bg-white/10 p-3 rounded-xl"><p className="text-xs opacity-50">Start</p><p className="text-xl font-mono">{session.startKm}</p></div><div className="bg-white/10 p-3 rounded-xl"><p className="text-xs opacity-50">Tempo</p><p className="text-xl font-mono">{time}</p></div></div>
         </div>
      </div>

      <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto">
         <div className="bg-white p-6 rounded-3xl shadow-sm border text-center">
            <h3 className="font-bold text-gray-800 mb-4 flex justify-center gap-2"><Fuel className="text-orange-500"/> Rifornimenti</h3>
            {session.fuelLogs.map((l,i)=><div key={l.id||i} className="flex justify-between items-center bg-gray-50 p-2 mb-2 rounded-lg text-left border"><div className="flex items-center gap-2"><MapPin size={14} className="text-gray-400"/><div><span className="font-bold block">{l.impianto}</span><span className="text-[10px] text-gray-500">{l.tessera}</span></div></div><div className="text-right"><span className="block font-bold">€{l.importo}</span><span className="text-xs text-gray-500">{l.litri}L</span></div><button onClick={()=>{setEditFuel(l); setShowFuel(true)}} className="p-1 bg-white border rounded text-blue-500 ml-2"><Edit2 size={14}/></button></div>)}
            <div className="flex gap-2 mt-4"><Button variant="warning" onClick={()=>{setEditFuel(null); setShowFuel(true)}} icon={Fuel} className="text-xs">Aggiungi</Button><Button variant="outline" onClick={()=>setShowPins(true)} icon={Hash} className="text-xs bg-slate-50 text-slate-600 border-slate-200">PIN</Button></div>
         </div>
         
         <Button 
            onClick={() => setShowPhotos(true)} 
            className="bg-blue-600 text-white border-blue-700 shadow-md py-4 text-base" 
            icon={Camera}
         >
             FOTO RICONSEGNA / STATO
         </Button>

         <div className="bg-white p-6 rounded-3xl shadow-sm border border-red-100 text-center">
             <h3 className="font-bold text-gray-800 mb-2 flex justify-center gap-2"><Wrench className="text-red-500"/> Guasti</h3>
             <p className="text-xs text-gray-400 mb-4">Problemi meccanici, carrozzeria o spie.</p>
             <Button onClick={()=>setShowReport(true)} variant="danger" icon={AlertTriangle} className="bg-red-600 text-white shadow-md">Apri Segnalazione</Button>
         </div>

         <div className="flex-1"></div>
         <Button onClick={onEndShift} variant="danger" icon={LogOut} className="shadow-xl shadow-red-200">Chiudi Turno</Button>
      </div>
    </div>
  );
};

const EndShiftScreen = ({ session, onSave, onCancel, onAddFuel, onUpdateFuel }) => {
    const [km, setKm] = useState('');
    const [step, setStep] = useState('INPUT');
    const [saving, setSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showFuel, setShowFuel] = useState(false);
    const [editFuel, setEditFuel] = useState(null);

    const totKm = km ? parseInt(km) - session.startKm : 0;
    const isLow = km && parseInt(km) < session.startKm;
    
    const totalFuelCost = session.fuelLogs.reduce((acc, f) => acc + parseFloat(f.importo), 0);

    const handleNext = () => { if(!km) return showCustomAlert("Errore", "Inserisci KM", "warning"); if(isLow && !confirm("KM inferiori a partenza. Sicuro?")) return; setStep('SUMMARY'); };
    const handleFuelSave = (d) => { if(editFuel) onUpdateFuel(d); else { apiLogFuel(session, d); onAddFuel(d); } setShowFuel(false); setEditFuel(null); };
    const handleSave = async () => { setSaving(true); const res = await apiSaveLog({ ...session, end: parseInt(km), totalKm: totKm, anomaly: isLow, driver: session.user.matricola, driverName: session.user.name }); setSaving(false); if(res.success) { setShowSuccess(true); localStorage.removeItem('driver_session_v2'); setTimeout(onSave, 3000); } };

    if(showSuccess) return <div className="h-full flex flex-col items-center justify-center bg-emerald-500 text-white"><CheckCircle size={64} className="mb-4"/><h2 className="text-3xl font-black">Salvato!</h2><p>Turno chiuso correttamente.</p></div>;

    return (
      <div className="flex flex-col h-full bg-gray-50">
         {showFuel && <RefuelingModal onClose={()=>setShowFuel(false)} onSave={handleFuelSave} initialData={editFuel}/>}
         <div className="bg-white p-6 shadow-sm border-b"><h2 className="text-xl font-black">{step==='INPUT'?'Chiusura Turno':'Riepilogo'}</h2></div>
         
         <div className="flex-1 p-6 overflow-y-auto">
            {step==='INPUT' ? (
                <div className={`bg-white p-8 rounded-3xl shadow-lg text-center border ${isLow ? 'border-red-500 bg-red-50' : ''}`}>
                    <p className="text-xs font-bold text-blue-600 uppercase mb-2">KM Partenza</p><p className="text-3xl font-mono font-black mb-8">{session.startKm}</p>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-4">Inserisci KM Arrivo</label>
                    <input type="number" value={km} onChange={e=>setKm(e.target.value)} className="w-full text-center text-5xl font-black bg-transparent outline-none border-b-4 pb-2" autoFocus placeholder="000000"/>
                    {isLow && <p className="text-red-600 font-bold text-xs mt-2">Valore inferiore alla partenza!</p>}
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Dettaglio Veicolo */}
                    <div className="bg-blue-600 p-4 rounded-3xl shadow-lg text-white flex items-center gap-4"><div className="bg-white/20 p-3 rounded-2xl"><Truck size={24}/></div><div><p className="text-xs opacity-70 font-bold uppercase">Veicolo</p><p className="text-2xl font-black">{session.targa}</p></div></div>
                    {/* KM */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border">
                        <div className="grid grid-cols-2 gap-4 border-b pb-4 mb-4"><div><p className="text-xs text-gray-400 font-bold uppercase">Inizio</p><p className="text-xl font-mono font-bold">{session.startKm}</p></div><div className="text-right"><p className="text-xs text-gray-400 font-bold uppercase">Fine</p><p className={`text-xl font-mono font-bold ${isLow?'text-red-600':'text-blue-600'}`}>{km}</p></div></div>
                        <div className="flex justify-between font-bold text-lg"><span>Totale</span><span>{totKm} km</span></div>
                        {isLow && <p className="mt-2 text-xs text-red-500 font-bold bg-red-50 p-2 rounded flex items-center gap-1"><AlertTriangle size={12}/> Attenzione: KM finali minori!</p>}
                    </div>
                    {/* Carburante */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Fuel className="text-orange-500"/> Carburante</h3>
                        {session.fuelLogs.length > 0 ? 
                            <>
                            <div className="flex justify-between text-sm mb-4 bg-orange-50 p-3 rounded-xl border border-orange-100"><span>Rifornimenti: <b>{session.fuelLogs.length}</b></span><span>Totale: <b>€ {totalFuelCost.toFixed(2)}</b></span></div>
                            {session.fuelLogs.map((l,i)=><div key={i} className="flex justify-between items-center text-sm bg-gray-50 p-2 mb-2 rounded border">
                                <div className="flex items-center gap-2">
                                    <MapPin size={14} className="text-gray-400"/>
                                    <div><span className="font-bold block">{l.impianto}</span><span className="text-[10px] text-gray-500">{l.tessera}</span></div>
                                </div>
                                <div className="text-right"><span className="block font-bold">€{l.importo}</span><span className="text-xs text-gray-500">{l.litri}L</span></div>
                                <button onClick={()=>{setEditFuel(l); setShowFuel(true)}} className="p-1 bg-white border rounded text-blue-500 ml-2"><Edit2 size={14}/></button>
                            </div>)}
                            </>
                        : <div className="bg-orange-50 p-3 rounded-xl border border-orange-100 mb-4"><p className="text-sm font-bold text-orange-800 flex items-center gap-2"><AlertTriangle size={14}/> Hai fatto rifornimento?</p></div>}
                        <Button variant="warning" onClick={()=>{setEditFuel(null); setShowFuel(true)}} className="text-xs" icon={Fuel}>Aggiungi Rifornimento</Button>
                    </div>
                </div>
            )}
         </div>
         <div className="p-6 bg-white border-t flex gap-4">
            {step==='INPUT' ? <><button onClick={onCancel} className="flex-1 font-bold text-gray-400">Annulla</button><div className="flex-[2]"><Button onClick={handleNext} icon={ArrowRight}>Avanti</Button></div></> 
            : <><button onClick={()=>setStep('INPUT')} className="flex-1 font-bold text-gray-400">Modifica</button><div className="flex-[2]"><Button onClick={handleSave} loading={saving} variant="success" icon={Check}>Conferma e Invia</Button></div></>}
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

  // Init e Autologin
  useEffect(() => {
    const saved = localStorage.getItem('driver_session_v2');
    if(saved) {
        try {
            const s = JSON.parse(saved);
            // Strict Check
            if(s && s.user && s.targa && (s.startKm !== undefined && s.startKm !== null)) {
                s.startTime = new Date(s.startTime);
                setUser(s.user);
                setActiveSession(s);
                setView('ACTIVE');
            } else {
                localStorage.removeItem('driver_session_v2');
            }
        } catch(e) { localStorage.removeItem('driver_session_v2'); }
    }
  }, []);

  const handleLogin = async (u) => {
     setUser(u);
     let remoteData = null;
     let localSession = null;

     // Check Local
     const saved = localStorage.getItem('driver_session_v2');
     if(saved) { try{ localSession = JSON.parse(saved); localSession.startTime = new Date(localSession.startTime); }catch(e){} }

     // Check Remote
     try {
         const remoteCheck = await apiCheckRemoteUpdates(u.name);
         if(remoteCheck && remoteCheck.found) {
             const d1 = new Date(remoteCheck.date); const d2 = new Date();
             if(d1.toDateString() === d2.toDateString()) remoteData = remoteCheck;
         }
     } catch(e) { console.error(e); if(localSession) { setActiveSession(localSession); setView('ACTIVE'); return; } }

     if (remoteData) {
         // Priority to Remote
         const session = { 
             targa: remoteData.targa, startKm: remoteData.startKm, 
             startTime: localSession ? localSession.startTime : new Date(), 
             user: u, fuelLogs: localSession ? localSession.fuelLogs : [], 
             anomaly: false, isRemote: true 
         };
         setActiveSession(session);
         localStorage.setItem('driver_session_v2', JSON.stringify(session));
         setView('ACTIVE');
         if(!localSession) showCustomAlert("Turno Recuperato", `Turno attivo trovato per ${session.targa}`, "success");
     } else {
         // Remote says nothing -> Reset local if exists
         if(localSession) { localStorage.removeItem('driver_session_v2'); showCustomAlert("Reset", "Turno precedente non valido. Riavvia.", "warning"); }
         setView('START');
     }
  };

  const handleStart = (d) => { const s = { ...d, user }; setActiveSession(s); localStorage.setItem('driver_session_v2', JSON.stringify(s)); setView('ACTIVE'); apiStartShift(s); };
  const handleLogout = () => { localStorage.removeItem('driver_session_v2'); setUser(null); setActiveSession(null); setView('LOGIN'); };
  const handleAddFuel = (f) => { const s = { ...activeSession, fuelLogs: [...activeSession.fuelLogs, f] }; setActiveSession(s); localStorage.setItem('driver_session_v2', JSON.stringify(s)); };
  const handleUpdFuel = (f) => { const logs = activeSession.fuelLogs.map(l => l.id === f.id ? f : l); const s = { ...activeSession, fuelLogs: logs }; setActiveSession(s); localStorage.setItem('driver_session_v2', JSON.stringify(s)); apiLogFuel(s, f); };
  const handleEnd = () => { localStorage.removeItem('driver_session_v2'); setActiveSession(null); setView('LOGIN'); };

  return (
    <CustomAlertProvider>
      <div className="w-full max-w-md mx-auto h-screen bg-white shadow-2xl overflow-hidden font-sans text-gray-900 relative">
        {view === 'LOGIN' && <LoginScreen onLogin={handleLogin} />}
        {view === 'START' && <StartShiftScreen user={user} onStart={handleStart} onLogout={handleLogout} />}
        {view === 'ACTIVE' && <ActiveShiftScreen session={activeSession} onEndShift={() => setView('END')} onAddFuel={handleAddFuel} onUpdateFuel={handleUpdFuel} onLogout={handleLogout} />}
        {view === 'END' && <EndShiftScreen session={activeSession} onSave={handleEnd} onCancel={() => setView('ACTIVE')} onAddFuel={handleAddFuel} onUpdateFuel={handleUpdFuel} />}
      </div>
    </CustomAlertProvider>
  );
}