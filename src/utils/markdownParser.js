/**
 * Custom Markdown Parser for Checklist de Transmisiones
 * Parses H2 (Phases), H3 (Subsections), `- [ ]` (Checkboxes), and nested lists.
 * Supports standard spaces, tabs, and Non-Breaking Spaces (NBSP / char code 160).
 */

export function parseChecklistMarkdown(mdText) {
  const lines = mdText.split(/\r?\n/);
  
  let title = "Checklist de Transmisiones";
  let metaInfo = "";
  const phases = [];
  
  let currentPhase = null;
  let currentSubsection = null;
  let currentParentItem = null;
  let itemCounter = 0;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) continue;

    // H1 Title
    if (trimmed.startsWith('# ')) {
      title = trimmed.replace('# ', '').trim();
      continue;
    }

    // Ignore raw metadata lines from markdown as we render dynamic interactive dropdowns
    if (
      trimmed.startsWith('**Persona responsable:**') ||
      trimmed.startsWith('**Tiempo atendido:**') ||
      trimmed.startsWith('**Rol:**')
    ) {
      continue;
    }

    // Callout / Meta note (> ...)
    if (trimmed.startsWith('>')) {
      metaInfo += (metaInfo ? '\n' : '') + trimmed.replace(/^>\s*/, '');
      continue;
    }

    // H2 Phase (e.g. ## Fase inicial)
    if (trimmed.startsWith('## ')) {
      const phaseTitle = trimmed.replace('## ', '').trim();
      currentPhase = {
        id: `phase-${phases.length}-${phaseTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        title: phaseTitle,
        subsections: []
      };
      phases.push(currentPhase);
      currentSubsection = null;
      currentParentItem = null;
      continue;
    }

    // H3 Subsection (e.g. ### Transmisiones, ### Zoom, ### Hardware)
    if (trimmed.startsWith('### ')) {
      const subTitle = trimmed.replace('### ', '').trim();
      
      if (!currentPhase) {
        currentPhase = {
          id: 'phase-general',
          title: 'General',
          subsections: []
        };
        phases.push(currentPhase);
      }

      currentSubsection = {
        id: `sub-${currentPhase.subsections.length}-${subTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        title: subTitle,
        items: []
      };
      currentPhase.subsections.push(currentSubsection);
      currentParentItem = null;
      continue;
    }

    if (!currentSubsection) {
      if (!currentPhase) {
        currentPhase = { id: 'phase-default', title: 'General', subsections: [] };
        phases.push(currentPhase);
      }
      currentSubsection = { id: 'sub-default', title: 'General', items: [] };
      currentPhase.subsections.push(currentSubsection);
    }

    // Detect indentation including spaces (code 32), tabs (code 9), and NBSP (code 160)
    const isIndented = /^[\s\u00A0]+/.test(rawLine);

    // Checkbox item: - [ ] or - [x]
    const checkboxMatch = trimmed.match(/^-\s*\[([ xX])\]\s*(.*)$/);
    if (checkboxMatch) {
      itemCounter++;
      const isChecked = checkboxMatch[1].toLowerCase() === 'x';
      const itemText = checkboxMatch[2].trim();

      const itemObj = {
        id: `item-${itemCounter}`,
        text: itemText,
        checked: isChecked,
        isHeader: false,
        children: []
      };

      if (isIndented && currentParentItem) {
        // Add to parent group item
        currentParentItem.children.push(itemObj);
      } else {
        // Root item in subsection
        currentSubsection.items.push(itemObj);
        currentParentItem = null; // Clear parent group for top-level non-group items
      }
      continue;
    }

    // Group Header item without checkbox (e.g. - Crear miniatura)
    const groupMatch = trimmed.match(/^-\s*(.+)$/);
    if (groupMatch) {
      itemCounter++;
      const groupTitle = groupMatch[1].trim();

      const groupObj = {
        id: `group-${itemCounter}`,
        text: groupTitle,
        checked: false,
        isHeader: true,
        children: []
      };

      if (isIndented && currentParentItem) {
        currentParentItem.children.push(groupObj);
      } else {
        currentSubsection.items.push(groupObj);
        currentParentItem = groupObj; // Set parent group for subsequent indented items
      }
      continue;
    }
  }

  return { title, metaInfo, phases };
}

/**
 * Filter phases and subsections based on selected Rol and Multi-Selected Languages.
 * Roles: "Global" (all), "Transmisiones", "Zoom"
 * Languages: Array of strings e.g. ["Español", "Ingles"] or ["Todos"]
 */
export function filterDataByRoleAndLanguage(parsedData, selectedRole, selectedLanguages) {
  if (!parsedData || !parsedData.phases) return { title: '', metaInfo: '', phases: [] };

  const roleClean = selectedRole ? selectedRole.trim().toLowerCase() : 'global';
  const isGlobalRole = roleClean === 'global';

  // Normalize selected languages array
  const langsArray = Array.isArray(selectedLanguages) 
    ? selectedLanguages 
    : (selectedLanguages ? [selectedLanguages] : ['Todos']);

  const isAllLangs = langsArray.length === 0 || langsArray.some(l => l.toLowerCase() === 'todos');

  const filteredPhases = parsedData.phases.map(phase => {
    // 1. Filter subsections by Role
    const matchingSubsections = phase.subsections.filter(sub => {
      if (isGlobalRole) return true;
      const subTitleClean = sub.title.trim().toLowerCase();
      return subTitleClean.includes(roleClean);
    });

    // 2. Filter group items by Multi-Selected Languages
    const langFilteredSubsections = matchingSubsections.map(sub => {
      const filteredItems = sub.items.map(item => {
        // If regular item or showing all languages, keep item intact
        if (!item.isHeader || isAllLangs || !item.children || item.children.length === 0) {
          return item;
        }

        // Apply language filter to children under group headers
        const filteredChildren = item.children.filter(child => {
          const childTextClean = child.text.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

          // Match child text against ANY of the selected languages
          return langsArray.some(lang => {
            const langClean = lang.trim().toLowerCase();
            if (langClean === 'español' || langClean === 'espanol') {
              return childTextClean.includes('espanol') || childTextClean.includes('español');
            }
            if (langClean === 'ingles') {
              return childTextClean.includes('ingles') || childTextClean.includes('english');
            }
            if (langClean === 'otros') {
              const isEspanol = childTextClean.includes('espanol') || childTextClean.includes('español');
              const isIngles = childTextClean.includes('ingles') || childTextClean.includes('english');
              return !isEspanol && !isIngles;
            }

            const searchKey = langClean.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return childTextClean.includes(searchKey);
          });
        });

        return {
          ...item,
          children: filteredChildren
        };
      }).filter(item => {
        // Keep group headers only if they still have children after filtering, or regular single items
        if (item.isHeader) return item.children.length > 0;
        return true;
      });

      return {
        ...sub,
        items: filteredItems
      };
    }).filter(sub => sub.items.length > 0);

    return {
      ...phase,
      subsections: langFilteredSubsections
    };
  }).filter(phase => phase.subsections.length > 0);

  return {
    ...parsedData,
    phases: filteredPhases
  };
}

// Backward compatibility alias
export const filterDataByRole = (parsedData, selectedRole) => filterDataByRoleAndLanguage(parsedData, selectedRole, ['Todos']);

/**
 * Generate formatted output markdown report based on current state
 */
export function generateMarkdownReport({ persona, tiempo, rol, idiomasSeleccionados, observations, parsedData, checkedState }) {
  let md = `# Checklist de transmisiones\n\n`;
  md += `**Persona responsable:** ${persona || '____________________'}\n`;
  md += `**Tiempo atendido:** ${tiempo || '____________________'}\n`;
  md += `**Rol:** ${rol || '____________________'}\n`;
  if (idiomasSeleccionados && idiomasSeleccionados.length > 0) {
    md += `**Idioma(s):** ${idiomasSeleccionados.join(', ')}\n`;
  }
  md += `\n`;

  if (parsedData.metaInfo) {
    const lines = parsedData.metaInfo.split('\n');
    lines.forEach(l => { md += `> ${l}\n`; });
    md += `\n`;
  }

  parsedData.phases.forEach(phase => {
    md += `## ${phase.title}\n\n`;
    phase.subsections.forEach(sub => {
      md += `### ${sub.title}\n\n`;
      sub.items.forEach(item => {
        if (item.isHeader) {
          md += `- ${item.text}\n`;
          item.children.forEach(child => {
            const isChecked = checkedState[child.id] ? 'x' : ' ';
            md += `  - [${isChecked}] ${child.text}\n`;
          });
        } else {
          const isChecked = checkedState[item.id] ? 'x' : ' ';
          md += `- [${isChecked}] ${item.text}\n`;
        }
      });
      md += `\n`;
    });
  });

  md += `### Observaciones / Novedades\n\n`;
  md += observations ? `${observations}\n` : `Sin observaciones.\n`;

  return md;
}

/**
 * Generate WhatsApp / Text summary
 */
export function generateWhatsAppSummary({ persona, tiempo, rol, idiomasSeleccionados, observations, totalCount, completedCount }) {
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  
  let text = `📋 *REPORTE DE TRANSMISIÓN*\n`;
  text += `-----------------------------------\n`;
  text += `👤 *Responsable:* ${persona || 'N/A'}\n`;
  text += `⏰ *Servicio:* ${tiempo || 'N/A'}\n`;
  text += `🎭 *Rol:* ${rol || 'N/A'}\n`;
  if (idiomasSeleccionados && idiomasSeleccionados.length > 0) {
    text += `🌐 *Idioma(s):* ${idiomasSeleccionados.join(', ')}\n`;
  }
  text += `📊 *Progreso:* ${completedCount}/${totalCount} (${percent}%)\n`;
  text += `-----------------------------------\n`;
  if (observations) {
    text += `📝 *Observaciones:*\n${observations}\n`;
    text += `-----------------------------------\n`;
  }
  text += `✅ *Checklist finalizado con éxito.*`;

  return text;
}
