import React, { useState, useEffect, useMemo } from 'react';
import { 
  Radio, 
  RotateCcw, 
  Download, 
  Share2, 
  Sun, 
  Moon, 
  Sparkles,
  RefreshCw
} from 'lucide-react';

import HeaderMetadata from './components/HeaderMetadata';
import OptionsManagerModal from './components/OptionsManagerModal';
import ProgressBar from './components/ProgressBar';
import ChecklistTree from './components/ChecklistTree';
import PasswordModal from './components/PasswordModal';

import { 
  parseChecklistMarkdown, 
  filterDataByRoleAndLanguage, 
  generateMarkdownReport,
  generateWhatsAppSummary 
} from './utils/markdownParser';

const DEFAULT_OPTIONS = {
  personas: [
    "Luis Sebastian Lopera",
    "David Laiton",
    "Yobany Garcia",
    "Fabian medina",
    "Yeison Quintero"
  ],
  tiempos: [
    "Culto general",
    "Culto Finisher",
    "Conferencia mundial"
  ],
  roles: [
    "Global",
    "Transmisiones",
    "Zoom"
  ],
  idiomas: [
    "Todos",
    "Español",
    "Ingles",
    "Otros"
  ]
};

const DEFAULT_FALLBACK_MD = `# Checklist de transmisiones

**Persona responsable:** ____________________  

**Tiempo atendido:** ____________________  

**Rol:** ____________________

> **Columnas de revisión:** Rev (revisión general), Rev Eng (inglés), Rev It/Fr (italiano/francés).

## Fase inicial

### Hardware y preparación

- [ ] Video y encendido del PC
- [ ] Encendido de televisor
- [ ] Encender monitores (audio)
- [ ] Encendido de maquina para transmisiones alternativas
- [ ] Validar conexion de la consola al equipo (Ocasional)
- [ ] Validar conexion de monitores al equipo
- [ ] Validar conexion de la camara al equipo
- [ ] Iniciar SplitCam
- [ ] Iniciar OBS
- [ ] Iniciar Zoom
- [ ] Iniciar Edge Chromium
- [ ] Abrir y silenciar pestaña de WhatsApp (Ocasional)

### Transmisiones

- Crear miniatura
  - [ ] Español
  - [ ] Ingles
  - [ ] Frances
- Programar transmision you tube
  - [ ] Español
  - [ ] Ingles
  - [ ] Frances / Italiano
- Configurar you tube en OBS
  - [ ] Español
  - [ ] Ingles
  - [ ] Frances / Italiano
- Programar transmision facebook
  - [ ] Español
  - [ ] Ingles
  - [ ] Frances / Italiano
- Configurar facebook en OBS
  - [ ] Español
  - [ ] Ingles
  - [ ] Frances / Italiano

### Zoom

- [ ] Envio de enlace
- [ ] Apertura de reunion
- [ ] Inhabilitar permiso de apertura de microfonos y "solicitudes de usuarios"
- [ ] Validar permiso de compartir pantalla
- [ ] Validar configuracion de silenciar participantes al entrar
- [ ] Validar permiso de "Compartir pizarras"
- [ ] Validar permiso de "Compartir Notas"
- [ ] Validar permisos del chat
- [ ] Asignar traductor
- [ ] Seleccion de canal de traduccion
- [ ] Asignacion de Co Anfitrion
- [ ] Compartir audio (Ocasional)
- [ ] Validar dispositivo de video
- [ ] Validar dispositivo de salida
- [ ] Validar dispositivo de entrada

## Fase media

### Zoom

- [ ] Detener compartir audio (Ocasional)
- [ ] Primer par de capturas de pantalla
- [ ] Segundo par de capturas de pantalla
- [ ] Toma de asistencia de invitados (Ocasional)
- [ ] Habilitar "Audio para musicos" (Ocasional)
- [ ] Deshabilitar "Audio para musicos" (Ocasional)

### Transmisiones

- Primera revision - flujo transmision You tube
  - [ ] Español
  - [ ] Ingles
  - [ ] Frances / Italiano
- Segunda revision - flujo transmision You tube
  - [ ] Español
  - [ ] Ingles
  - [ ] Frances / Italiano
- Tercera revision - flujo transmision You tube
  - [ ] Español
  - [ ] Ingles
  - [ ] Frances / Italiano
- Primera revision - flujo transmision Facebook
  - [ ] Español
  - [ ] Ingles
  - [ ] Frances / Italiano
- Segunda revision - flujo transmision Facebook
  - [ ] Español
  - [ ] Ingles
  - [ ] Frances / Italiano
- Tercera revision - flujo transmision Facebook
  - [ ] Español
  - [ ] Ingles
  - [ ] Frances / Italiano
- Control de volumen
  - [ ] Español
  - [ ] Ingles
  - [ ] Frances / Italiano

## Fase final

### Transmisiones

- Detener transmision Facebook
  - [ ] Español
  - [ ] Ingles
  - [ ] Frances / Italiano
- Detener transmision Youtube
  - [ ] Español
  - [ ] Ingles
  - [ ] Frances / Italiano

### Zoom

- [ ] Aperturar microfonos
- [ ] Cerrar reunion

### Hardware

- [ ] Apagado del equipo
- [ ] Desconexion del equipo

### Observaciones / Novedades
`;

export default function App() {
  // Theme state
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  // Options dropdown state (Persisted in localStorage)
  const [options, setOptions] = useState(() => {
    const saved = localStorage.getItem('checklist_options');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!parsed.idiomas) parsed.idiomas = DEFAULT_OPTIONS.idiomas;
      return parsed;
    }
    return DEFAULT_OPTIONS;
  });

  // Header metadata selections
  const [persona, setPersona] = useState(() => localStorage.getItem('persona') || DEFAULT_OPTIONS.personas[0]);
  const [tiempo, setTiempo] = useState(() => localStorage.getItem('tiempo') || DEFAULT_OPTIONS.tiempos[0]);
  const [rol, setRol] = useState(() => localStorage.getItem('rol') || DEFAULT_OPTIONS.roles[0]);
  const [idiomasSeleccionados, setIdiomasSeleccionados] = useState(() => {
    const saved = localStorage.getItem('idiomas_seleccionados');
    return saved ? JSON.parse(saved) : ["Todos"];
  });

  // Markdown content
  const [rawMarkdown, setRawMarkdown] = useState(DEFAULT_FALLBACK_MD);
  const [isSyncing, setIsSyncing] = useState(false);

  // Checked checkboxes state
  const [checkedState, setCheckedState] = useState(() => {
    const saved = localStorage.getItem('checked_state');
    return saved ? JSON.parse(saved) : {};
  });

  // Observations notes
  const [observations, setObservations] = useState(() => localStorage.getItem('observations') || '');

  // Modals state
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const [toastMessage, setToastMessage] = useState(null);

  // Theme effect
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Save metadata & checked state to localStorage
  useEffect(() => {
    localStorage.setItem('persona', persona);
    localStorage.setItem('tiempo', tiempo);
    localStorage.setItem('rol', rol);
    localStorage.setItem('idiomas_seleccionados', JSON.stringify(idiomasSeleccionados));
    localStorage.setItem('checklist_options', JSON.stringify(options));
    localStorage.setItem('checked_state', JSON.stringify(checkedState));
    localStorage.setItem('observations', observations);
  }, [persona, tiempo, rol, idiomasSeleccionados, options, checkedState, observations]);

  // Global Hotkey Listener: Alt + A triggers password protected options modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        setIsPasswordModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch checklist.md and poll for updates automatically
  const fetchChecklistFile = async () => {
    try {
      setIsSyncing(true);
      const res = await fetch(`./checklist.md?t=${Date.now()}`);
      if (res.ok) {
        const text = await res.text();
        if (text && text.trim().length > 0) {
          setRawMarkdown(text);
        }
      }
    } catch (err) {
      console.warn('Using fallback embedded markdown:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchChecklistFile();
    const interval = setInterval(fetchChecklistFile, 3000);
    return () => clearInterval(interval);
  }, []);

  // Parse Markdown into JS object structure
  const parsedData = useMemo(() => {
    return parseChecklistMarkdown(rawMarkdown);
  }, [rawMarkdown]);

  // Filter parsed data by selected Rol ("Global", "Transmisiones", "Zoom") and Multi-Selected Languages
  const filteredData = useMemo(() => {
    return filterDataByRoleAndLanguage(parsedData, rol, idiomasSeleccionados);
  }, [parsedData, rol, idiomasSeleccionados]);

  // Calculate totals for active role & languages view (ONLY leaf checkboxes count towards progress)
  const { totalCount, completedCount } = useMemo(() => {
    let total = 0;
    let completed = 0;
    if (!filteredData || !filteredData.phases) return { totalCount: 0, completedCount: 0 };

    filteredData.phases.forEach(phase => {
      phase.subsections.forEach(sub => {
        sub.items.forEach(item => {
          if (item.isHeader) {
            item.children.forEach(child => {
              total++;
              if (checkedState[child.id]) completed++;
            });
          } else {
            total++;
            if (checkedState[item.id]) completed++;
          }
        });
      });
    });

    return { totalCount: total, completedCount: completed };
  }, [filteredData, checkedState]);

  // Toggle individual item
  const handleToggleCheck = (itemId) => {
    setCheckedState(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // Toggle whole group of items
  const handleToggleGroup = (childrenList, shouldCheck) => {
    const nextState = { ...checkedState };
    childrenList.forEach(child => {
      nextState[child.id] = shouldCheck;
    });
    setCheckedState(nextState);
  };

  // Reset all progress AND transmission parameters
  const handleResetChecklist = () => {
    if (confirm('¿Estás seguro de reiniciar las casillas de verificación y los parámetros de transmisión para una nueva sesión?')) {
      setCheckedState({});
      setObservations('');
      setPersona(options.personas[0] || DEFAULT_OPTIONS.personas[0]);
      setTiempo(options.tiempos[0] || DEFAULT_OPTIONS.tiempos[0]);
      setRol(options.roles[0] || DEFAULT_OPTIONS.roles[0]);
      setIdiomasSeleccionados(["Todos"]);
      showToast('Checklist y parámetros reiniciados correctamente');
    }
  };

  const handlePasswordSuccess = () => {
    setIsPasswordModalOpen(false);
    setIsOptionsModalOpen(true);
  };

  // Save custom dropdown options
  const handleSaveOptions = (newOptions) => {
    setOptions(newOptions);
    if (!newOptions.personas.includes(persona)) setPersona(newOptions.personas[0] || '');
    if (!newOptions.tiempos.includes(tiempo)) setTiempo(newOptions.tiempos[0] || '');
    if (!newOptions.roles.includes(rol)) setRol(newOptions.roles[0] || '');
    showToast('Opciones actualizadas correctamente');
  };

  const handleResetDefaultOptions = () => {
    setOptions(DEFAULT_OPTIONS);
    setPersona(DEFAULT_OPTIONS.personas[0]);
    setTiempo(DEFAULT_OPTIONS.tiempos[0]);
    setRol(DEFAULT_OPTIONS.roles[0]);
    setIdiomasSeleccionados(["Todos"]);
    showToast('Opciones restauradas a los valores por defecto');
    return DEFAULT_OPTIONS;
  };

  // Export report file
  const handleExportReport = () => {
    const mdReport = generateMarkdownReport({
      persona,
      tiempo,
      rol,
      idiomasSeleccionados,
      observations,
      parsedData: filteredData,
      checkedState
    });

    const blob = new Blob([mdReport], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().slice(0, 10);
    link.download = `Checklist_${rol}_${dateStr}.md`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Reporte descargado correctamente');
  };

  // Copy WhatsApp quick summary to clipboard
  const handleCopyWhatsApp = () => {
    const summary = generateWhatsAppSummary({
      persona,
      tiempo,
      rol,
      idiomasSeleccionados,
      observations,
      totalCount,
      completedCount
    });

    navigator.clipboard.writeText(summary).then(() => {
      showToast('¡Resumen copiado para WhatsApp/Telegram!');
    }).catch(() => {
      alert('Error al copiar al portapapeles');
    });
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="app-container">
      {/* Toast alert */}
      {toastMessage && (
        <div className="toast-notification">
          <Sparkles size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar Header */}
      <header className="app-header">
        <div className="header-brand">
          <div className="live-badge">
            <span className="pulse-dot"></span>
            <span>TRANSMISIÓN EN VIVO</span>
          </div>
          <h1 className="main-app-title">
            <Radio size={28} className="text-cyan animate-pulse" />
            Checklist de Transmisiones
          </h1>
        </div>

        <div className="header-actions">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="btn btn-secondary btn-icon"
            title="Cambiar Tema Color"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/* Metadata Dropdowns Header */}
      <HeaderMetadata
        persona={persona}
        setPersona={setPersona}
        tiempo={tiempo}
        setTiempo={setTiempo}
        rol={rol}
        setRol={setRol}
        idiomasSeleccionados={idiomasSeleccionados}
        setIdiomasSeleccionados={setIdiomasSeleccionados}
        options={options}
      />

      {/* Progress Bar */}
      <ProgressBar total={totalCount} completed={completedCount} />

      {/* Action Toolbar */}
      <div className="toolbar-row">
        <div className="toolbar-sync-info">
          <RefreshCw size={14} className={isSyncing ? 'animate-spin text-cyan' : 'text-muted'} />
          <span className="text-muted text-sm">
            Sincronizado con <code>checklist.md</code>
          </span>
        </div>

        <div className="toolbar-buttons">
          <button onClick={handleResetChecklist} className="btn btn-secondary btn-sm">
            <RotateCcw size={15} />
            <span>Reiniciar</span>
          </button>

          <button onClick={handleCopyWhatsApp} className="btn btn-secondary btn-sm">
            <Share2 size={15} className="text-emerald" />
            <span>Copiar para WhatsApp</span>
          </button>

          <button onClick={handleExportReport} className="btn btn-primary btn-sm">
            <Download size={15} />
            <span>Exportar Reporte (.md)</span>
          </button>
        </div>
      </div>

      {/* Main Checklist Tree Component */}
      <ChecklistTree
        filteredData={filteredData}
        checkedState={checkedState}
        onToggleCheck={handleToggleCheck}
        onToggleGroup={handleToggleGroup}
        observations={observations}
        setObservations={setObservations}
      />

      {/* Footer */}
      <footer className="app-footer">
        <p>Control Room Transmission Checklist &bull; Evangelización Mundial</p>
      </footer>

      {/* Password Protection Verification Modal (Triggered by Alt + A) */}
      <PasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSuccess={handlePasswordSuccess}
        title="Administración Protegida"
      />

      {/* Options Manager Modal */}
      <OptionsManagerModal
        isOpen={isOptionsModalOpen}
        onClose={() => setIsOptionsModalOpen(false)}
        options={options}
        onSaveOptions={handleSaveOptions}
        onResetDefaults={handleResetDefaultOptions}
      />
    </div>
  );
}
