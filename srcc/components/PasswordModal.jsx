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
      <div className="modal-content modal-password-padded" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex-align-center gap-3">
            <div className="lock-icon-wrapper">
              <Lock size={20} className="text-amber" />
            </div>
            <h3 className="modal-title">{title}</h3>
          </div>
          <button className="btn btn-icon btn-secondary" onClick={handleClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body-password-spaced">
          <p className="password-instruction-text">
            Ingresa la clave de acceso para continuar:
          </p>

          <div className="input-group my-3">
            <label className="input-label">
              <KeyRound size={16} className="text-cyan" />
              <span>Clave de Acceso</span>
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className={`custom-input password-input-field ${errorMsg ? 'input-error' : ''}`}
              autoFocus
            />
          </div>

          {errorMsg && (
            <div className="error-badge text-rose text-sm my-2">
              {errorMsg}
            </div>
          )}

          <div className="modal-footer-password-spaced">
            <button type="button" onClick={handleClose} className="btn btn-secondary px-4">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary px-4">
              <span>Verificar</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
