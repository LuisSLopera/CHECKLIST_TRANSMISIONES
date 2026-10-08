import React, { useState } from 'react';
import { X, Code2, Save, Upload } from 'lucide-react';

export default function MarkdownEditorModal({ isOpen, onClose, markdownText, onSaveMarkdown }) {
  const [localMd, setLocalMd] = useState(markdownText);

  if (!isOpen) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setLocalMd(event.target.result);
    };
    reader.readAsText(file);
  };

  const handleSave = () => {
    onSaveMarkdown(localMd);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex-align-center gap-2">
            <Code2 size={20} className="text-cyan" />
            <h3 className="modal-title">Editor de Código Markdown (checklist.md)</h3>
          </div>
          <button className="btn btn-icon btn-secondary" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body flex-col gap-3">
          <div className="flex-between">
            <span className="text-muted text-sm">
              Cualquier cambio actualizará dinámicamente el formulario del checklist.
            </span>
            <label className="btn btn-secondary btn-sm cursor-pointer">
              <Upload size={14} />
              <span>Cargar archivo .md</span>
              <input type="file" accept=".md,.txt" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <textarea
            value={localMd}
            onChange={(e) => setLocalMd(e.target.value)}
            className="custom-textarea code-editor"
            rows={18}
            spellCheck={false}
          />
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">
            Cancelar
          </button>
          <button onClick={handleSave} className="btn btn-primary">
            <Save size={16} />
            <span>Aplicar Cambios al Formulario</span>
          </button>
        </div>
      </div>
    </div>
  );
}
