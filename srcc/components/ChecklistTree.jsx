import React, { useState, useEffect } from 'react';
import { Check, Info, FileText, Layers, ChevronDown, ChevronRight } from 'lucide-react';

export default function ChecklistTree({
  filteredData,
  checkedState,
  onToggleCheck,
  onToggleGroup,
  observations,
  setObservations
}) {
  // Track collapsed state for phases { [phaseId]: boolean }
  // By default, if an entry is undefined or true, the phase is collapsed.
  // When an entry is explicitly false, the phase is expanded.
  const [collapsedPhases, setCollapsedPhases] = useState({});

  // Auto-collapse phase when it reaches 100% completion
  useEffect(() => {
    if (!filteredData || !filteredData.phases) return;

    filteredData.phases.forEach((phase) => {
      let phaseTotal = 0;
      let phaseCompleted = 0;

      phase.subsections.forEach(sub => {
        sub.items.forEach(item => {
          if (item.isHeader) {
            item.children.forEach(child => {
              phaseTotal++;
              if (checkedState[child.id]) phaseCompleted++;
            });
          } else {
            phaseTotal++;
            if (checkedState[item.id]) phaseCompleted++;
          }
        });
      });

      const is100Percent = phaseTotal > 0 && phaseCompleted === phaseTotal;

      if (is100Percent && collapsedPhases[phase.id] !== true) {
        setCollapsedPhases(prev => ({
          ...prev,
          [phase.id]: true
        }));
      }
    });
  }, [checkedState, filteredData]);

  const togglePhaseCollapse = (phaseId) => {
    setCollapsedPhases(prev => {
      const currentlyCollapsed = prev[phaseId] !== false;
      return {
        ...prev,
        [phaseId]: !currentlyCollapsed
      };
    });
  };

  if (!filteredData || !filteredData.phases || filteredData.phases.length === 0) {
    return (
      <div className="glass-card empty-state">
        <Info size={36} className="text-muted mb-2" />
        <h3>No se encontraron secciones para este rol.</h3>
        <p className="text-muted">Prueba cambiando el rol o verificando el archivo checklist.md.</p>
      </div>
    );
  }

  return (
    <div className="checklist-tree-container">
      {filteredData.phases.map((phase) => {
        // Calculate leaf items count ONLY for accurate percentage
        let phaseTotal = 0;
        let phaseCompleted = 0;

        phase.subsections.forEach(sub => {
          sub.items.forEach(item => {
            if (item.isHeader) {
              item.children.forEach(child => {
                phaseTotal++;
                if (checkedState[child.id]) phaseCompleted++;
              });
            } else {
              phaseTotal++;
              if (checkedState[item.id]) phaseCompleted++;
            }
          });
        });

        const phasePercent = phaseTotal > 0 ? Math.round((phaseCompleted / phaseTotal) * 100) : 0;
        // Collapsed by default unless explicitly set to false (expanded)
        const isCollapsed = collapsedPhases[phase.id] !== false;

        return (
          <div key={phase.id} className={`glass-card phase-card ${isCollapsed ? 'collapsed' : ''}`}>
            {/* Phase Header (Clickable to collapse/expand) */}
            <div 
              className="phase-header cursor-pointer"
              onClick={() => togglePhaseCollapse(phase.id)}
            >
              <div className="phase-title-group">
                <button 
                  type="button" 
                  className="btn-collapse-toggle" 
                  aria-label="Expandir o colapsar fase"
                >
                  {isCollapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
                </button>
                <div className="phase-icon">
                  <Layers size={20} />
                </div>
                <div>
                  <h2 className="phase-title">{phase.title}</h2>
                  <span className="phase-subtext">
                    {phaseCompleted}/{phaseTotal} tareas ({phasePercent}%)
                    {isCollapsed && phasePercent === 100 && ' — ¡Completado!'}
                  </span>
                </div>
              </div>
              
              <div className="phase-mini-progress">
                <div 
                  className={`phase-mini-fill ${phasePercent === 100 ? 'complete' : ''}`}
                  style={{ width: `${phasePercent}%` }}
                />
              </div>
            </div>

            {/* Subsections (Hidden when collapsed) */}
            {!isCollapsed && (
              <div className="subsections-grid">
                {phase.subsections.map((sub) => (
                  <div key={sub.id} className="subsection-block">
                    <h3 className="subsection-title">
                      <span className="bullet-dot"></span>
                      {sub.title}
                    </h3>

                    <div className="items-list">
                      {sub.items.map((item) => {
                        if (item.isHeader) {
                          // Check if all children under this header are checked
                          const allChildrenChecked = item.children.length > 0 && 
                            item.children.every(child => checkedState[child.id]);

                          return (
                            <div key={item.id} className="item-group-wrapper">
                              {/* Group Header Checkbox (e.g. "- Crear miniatura") */}
                              <div 
                                className={`group-header-row ${allChildrenChecked ? 'all-checked' : ''}`}
                                onClick={() => onToggleGroup(item.children, !allChildrenChecked)}
                              >
                                <div className={`custom-checkbox group-cb ${allChildrenChecked ? 'checked' : ''}`}>
                                  {allChildrenChecked && <Check size={14} />}
                                </div>
                                <span className="group-header-text">{item.text}</span>
                              </div>

                              {/* Children Leaf Items */}
                              <div className="group-children-list">
                                {item.children.map((child) => (
                                  <label key={child.id} className="checkbox-item-row child-row">
                                    <input
                                      type="checkbox"
                                      checked={!!checkedState[child.id]}
                                      onChange={() => onToggleCheck(child.id)}
                                      className="hidden-checkbox"
                                    />
                                    <div className={`custom-checkbox ${checkedState[child.id] ? 'checked' : ''}`}>
                                      {checkedState[child.id] && <Check size={13} />}
                                    </div>
                                    <span className={`item-label-text ${checkedState[child.id] ? 'completed' : ''}`}>
                                      {child.text}
                                    </span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          );
                        }

                        // Regular leaf item
                        return (
                          <label key={item.id} className="checkbox-item-row">
                            <input
                              type="checkbox"
                              checked={!!checkedState[item.id]}
                              onChange={() => onToggleCheck(item.id)}
                              className="hidden-checkbox"
                            />
                            <div className={`custom-checkbox ${checkedState[item.id] ? 'checked' : ''}`}>
                              {checkedState[item.id] && <Check size={14} />}
                            </div>
                            <span className={`item-label-text ${checkedState[item.id] ? 'completed' : ''}`}>
                              {item.text}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Observaciones / Novedades */}
      <div className="glass-card observations-card">
        <h3 className="subsection-title mb-3">
          <FileText size={18} className="text-cyan" />
          Observaciones / Novedades de la Transmisión
        </h3>
        <textarea
          rows={4}
          placeholder="Escribe aquí cualquier imprevisto, novedad técnica o nota de la sesión..."
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
          className="custom-textarea"
        />
      </div>
    </div>
  );
}
