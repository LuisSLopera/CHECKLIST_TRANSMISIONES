import React from 'react';
import { User, Clock, Shield, Globe, SlidersHorizontal, Check } from 'lucide-react';

export default function HeaderMetadata({
  persona,
  setPersona,
  tiempo,
  setTiempo,
  rol,
  setRol,
  idiomasSeleccionados,
  setIdiomasSeleccionados,
  options
}) {
  const availableIdiomas = options.idiomas || ["Todos", "Español", "Ingles", "Otros"];

  // Toggle multi-select language pill
  const handleToggleIdioma = (lang) => {
    if (lang === "Todos") {
      setIdiomasSeleccionados(["Todos"]);
      return;
    }

    let next = idiomasSeleccionados.filter(l => l !== "Todos");
    if (next.includes(lang)) {
      next = next.filter(l => l !== lang);
    } else {
      next.push(lang);
    }

    if (next.length === 0) {
      next = ["Todos"];
    }

    setIdiomasSeleccionados(next);
  };

  return (
    <div className="glass-card header-metadata-card">
      <div className="metadata-top-row">
        <div className="metadata-title-group">
          <h2 className="metadata-section-title">
            <SlidersHorizontal size={20} className="icon-gradient" />
            Parámetros de Transmisión
          </h2>
          <span className="metadata-subtitle">Selecciona los datos del servicio activo</span>
        </div>
      </div>

      <div className="metadata-grid">
        {/* Persona Responsable */}
        <div className="input-group">
          <label className="input-label">
            <User size={16} className="text-cyan" />
            <span>Persona Responsable</span>
          </label>
          <select 
            value={persona} 
            onChange={(e) => setPersona(e.target.value)}
            className="custom-select"
          >
            <option value="" disabled>-- Selecciona un encargado --</option>
            {(options.personas || []).map((p, idx) => (
              <option key={idx} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Tiempo Atendido */}
        <div className="input-group">
          <label className="input-label">
            <Clock size={16} className="text-amber" />
            <span>Tiempo Atendido</span>
          </label>
          <select 
            value={tiempo} 
            onChange={(e) => setTiempo(e.target.value)}
            className="custom-select"
          >
            <option value="" disabled>-- Selecciona el tipo de evento --</option>
            {(options.tiempos || []).map((t, idx) => (
              <option key={idx} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Rol de Operación (Reubicación de etiqueta Global) */}
        <div className="input-group">
          <div className="input-label flex-between w-100">
            <div className="flex-align-center gap-2">
              <Shield size={16} className="text-purple" />
              <span>Rol de Operación</span>
            </div>
            <span className={`badge badge-${rol.toLowerCase().replace(/[^a-z]/g, '')}`}>
              {rol}
            </span>
          </div>
          <select 
            value={rol} 
            onChange={(e) => setRol(e.target.value)}
            className="custom-select role-select"
          >
            {(options.roles || []).map((r, idx) => (
              <option key={idx} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Filtro Multi-Selección de Idiomas */}
        <div className="input-group col-span-full">
          <label className="input-label">
            <Globe size={16} className="text-emerald" />
            <span>Filtro de Idiomas (Selección Múltiple)</span>
          </label>
          
          <div className="idiomas-pills-container">
            {availableIdiomas.map((lang, idx) => {
              const isSelected = idiomasSeleccionados.includes(lang);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleToggleIdioma(lang)}
                  className={`idioma-pill-btn ${isSelected ? 'active' : ''}`}
                >
                  {isSelected && <Check size={14} />}
                  <span>{lang}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
