import React, { useState } from 'react';
import { Lock, KeyRound, X, ArrowRight } from 'lucide-react';

export default function PasswordModal({ isOpen, onClose, onSuccess, title = "Acceso Protegido" }) {
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Get current date formatted as AAAAMMDD (YYYYMMDD)
  const getExpectedPassword = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}${mm}${dd}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const expected = getExpectedPassword();
    if (passwordInput.trim() === expected) {
      setErrorMsg('');
      setPasswordInput('');
      onSuccess();
    } else {
      setErrorMsg('Clave incorrecta. Inténtalo de nuevo.');
    }
  };

  const handleClose = () => {
    setErrorMsg('');
    setPasswordInput('');
    onClose();
  };

  return (
    <div className="modal-overlay superposed-modal" onClick={handleClose}>
      <div className="modal-content modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex-align-center gap-2">
            <Lock size={20} className="text-amber" />
            <h3 className="modal-title">{title}</h3>
          </div>
          <button className="btn btn-icon btn-secondary" onClick={handleClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body flex-col gap-3">
          <p className="text-muted text-sm">
            Ingresa la clave de acceso para continuar:
          </p>

          <div className="input-group">
            <label className="input-label">
              <KeyRound size={16} className="text-cyan" />
              <span>Clave de Acceso</span>
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className={`custom-input ${errorMsg ? 'input-error' : ''}`}
              autoFocus
            />
          </div>

          {errorMsg && (
            <div className="error-badge text-rose text-sm">
              {errorMsg}
            </div>
          )}

          <div className="modal-footer px-0 pb-0 pt-2 border-none">
            <button type="button" onClick={handleClose} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              <span>Verificar</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
