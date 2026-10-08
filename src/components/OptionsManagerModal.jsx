import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, RotateCcw, Save } from 'lucide-react';

export default function OptionsManagerModal({ isOpen, onClose, options, onSaveOptions, onResetDefaults }) {
  const [activeTab, setActiveTab] = useState('personas');
  const [localOptions, setLocalOptions] = useState(options);
  const [newItemText, setNewItemText] = useState('');

  useEffect(() => {
    setLocalOptions(options);
  }, [options, isOpen]);

  if (!isOpen) return null;

  const handleAddItem = (category) => {
    if (!newItemText.trim()) return;
    if (localOptions[category].includes(newItemText.trim())) {
      alert('Esta opción ya existe.');
      return;
    }
    setLocalOptions({
      ...localOptions,
      [category]: [...localOptions[category], newItemText.trim()]
    });
    setNewItemText('');
  };

  const handleRemoveItem = (category, index) => {
    if (localOptions[category].length <= 1) {
      alert('Debes mantener al menos una opción en el listado.');
      return;
    }
    const updated = localOptions[category].filter((_, i) => i !== index);
    setLocalOptions({
      ...localOptions,
      [category]: updated
    });
  };

  const handleSave = () => {
    onSaveOptions(localOptions);
    onClose();
  };

  const handleReset = () => {
    if (confirm('¿Deseas restaurar todas las opciones a los valores iniciales por defecto?')) {
      const reset = onResetDefaults();
      setLocalOptions(reset);
    }
  };

  const tabLabels = {
    personas: 'Personas Responsables',
    tiempos: 'Tiempos Atendidos',
    roles: 'Roles de Operación'
  };

  return (
    <div className="modal-overlay superposed-modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Administrar Opciones Desplegables</h3>
          <button className="btn btn-icon btn-secondary" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Tabs */}
          <div className="options-tabs">
            {Object.keys(tabLabels).map((key) => (
              <button
                key={key}
                className={`tab-btn ${activeTab === key ? 'active' : ''}`}
                onClick={() => { setActiveTab(key); setNewItemText(''); }}
              >
                {tabLabels[key]}
              </button>
            ))}
          </div>

          {/* Add item row */}
          <div className="add-option-row">
            <input
              type="text"
              placeholder={`Agregar nuevo en ${tabLabels[activeTab]}...`}
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddItem(activeTab)}
              className="custom-input"
            />
            <button 
              className="btn btn-primary"
              onClick={() => handleAddItem(activeTab)}
            >
              <Plus size={16} />
              <span>Añadir</span>
            </button>
          </div>

          {/* Items list */}
          <div className="options-list">
            {localOptions[activeTab].map((item, idx) => (
              <div key={idx} className="option-item-row">
                <span className="option-item-text">{item}</span>
                <button
                  onClick={() => handleRemoveItem(activeTab, idx)}
                  className="btn btn-icon btn-rose btn-sm"
                  title="Eliminar opción"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={handleReset} className="btn btn-secondary">
            <RotateCcw size={16} />
            <span>Restaurar Predeterminados</span>
          </button>
          <button onClick={handleSave} className="btn btn-emerald">
            <Save size={16} />
            <span>Guardar Cambios</span>
          </button>
        </div>
      </div>
    </div>
  );
}
