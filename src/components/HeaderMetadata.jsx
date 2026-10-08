import React from 'react';
import { User, Clock, Shield, SlidersHorizontal } from 'lucide-react';

export default function HeaderMetadata({
  persona,
  setPersona,
  tiempo,
  setTiempo,
  rol,
  setRol,
  options
}) {
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
            {options.personas.map((p, idx) => (
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
            {options.tiempos.map((t, idx) => (
              <option key={idx} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Rol */}
        <div className="input-group">
          <label className="input-label">
            <Shield size={16} className="text-purple" />
            <span>Rol de Operación</span>
          </label>
          <div className="select-role-wrapper">
            <select 
              value={rol} 
              onChange={(e) => setRol(e.target.value)}
              className="custom-select role-select"
            >
              {options.roles.map((r, idx) => (
                <option key={idx} value={r}>{r}</option>
              ))}
            </select>
            <span className={`badge badge-${rol.toLowerCase().replace(/[^a-z]/g, '')}`}>
              {rol}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
