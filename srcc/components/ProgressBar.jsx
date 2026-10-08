import React from 'react';
import { CheckCircle2, Award } from 'lucide-react';

export default function ProgressBar({ total, completed }) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  return (
    <div className="glass-card progress-card">
      <div className="progress-header">
        <div className="progress-title-group">
          <CheckCircle2 size={22} className={percentage === 100 ? 'text-emerald' : 'text-cyan'} />
          <div>
            <h3 className="progress-title">Progreso del Checklist</h3>
            <span className="progress-stats-text">
              {completed} de {total} ítems completados
            </span>
          </div>
        </div>

        <div className="progress-badge-group">
          {percentage === 100 && (
            <span className="badge badge-complete animate-bounce">
              <Award size={14} /> ¡Listo!
            </span>
          )}
          <span className={`progress-percentage ${percentage === 100 ? 'complete' : ''}`}>
            {percentage}%
          </span>
        </div>
      </div>

      <div className="progress-bar-track">
        <div 
          className="progress-bar-fill" 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
