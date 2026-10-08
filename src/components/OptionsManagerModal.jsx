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

  const currentTabKey = activeTab in localOptions ? activeTab : 'personas';

  const handleAddItem = (category) => {
    if (!newItemText.trim()) return;
    const catList = localOptions[category] || [];
    if (catList.includes(newItemText.trim())) {
      alert('Esta opción ya existe.');
      return;
    }
    setLocalOptions({
      ...localOptions,
      [category]: [...catList, newItemText.trim()]
    });
    setNewItemText('');
  };

  const handleRemoveItem = (category, index) => {
    const catList = localOptions[category] || [];
    if (catList.length <= 1) {
      alert('Debes mantener al menos una opción en el listado.');
      return;
    }
    const updated = catList.filter((_, i) => i !== index);
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
    roles: 'Roles de Operación',
    idiomas: 'Idiomas'
  };

  return (
    <div className="modal-overlay superposed-modal" onClick={onClose}>
      <div className="modal-content modal-md" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Administrar Opciones Desplegables</h3>
          <button className="btn btn-icon btn-secondary" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body modal-body-spaced">
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
              placeholder={`Agregar nuevo en ${tabLabels[currentTabKey]}...`}
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddItem(currentTabKey)}
              className="custom-input"
            />
            <button 
              className="btn btn-primary btn-add-option"
              onClick={() => handleAddItem(currentTabKey)}
            >
              <Plus size={16} />
              <span>Añadir</span>
            </button>
          </div>

          {/* Items list */}
          <div className="options-list">
            {(localOptions[currentTabKey] || []).map((item, idx) => (
              <div key={idx} className="option-item-row">
                <span className="option-item-text">{item}</span>
                <button
                  onClick={() => handleRemoveItem(currentTabKey, idx)}
                  className="btn btn-icon btn-rose btn-sm"
                  title="Eliminar opción"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer modal-footer-spaced">
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
