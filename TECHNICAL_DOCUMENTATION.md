# 🛠️ Documentación Técnica - Checklist de Transmisiones

Documento de referencia técnica para que cualquier agente de IA o desarrollador pueda comprender la arquitectura, estado, flujos de datos y mantenimiento del proyecto.

---

## 🏗️ 1. Arquitectura General

- **Framework Core**: React 18 + Vite.
- **Estilos**: Vanilla CSS con variables CSS (Design System Broadcast Studio), Glassmorphism, temas claro/oscuro.
- **Iconografía**: `lucide-react`.
- **Persistencia**: `localStorage` (para variables de encabezado, progreso de casillas y opciones personalizadas).
- **Fuente de Datos Principal**: [`checklist.md`](./checklist.md) servido dinámicamente mediante middleware estático en Vite y polling continuo desde la web.

---

## 📁 2. Estructura del Código Fuente (`src/`)

```
src/
├── App.jsx                     # Componente principal, estado global y listener de atajo Alt+A
├── main.jsx                    # Punto de entrada de React DOM
├── index.css                   # Sistema de diseño CSS, modals superpuestos, spacing y animaciones
├── components/
│   ├── HeaderMetadata.jsx      # Selectores de Persona Responsable, Tiempo Atendido, Rol y Filtro Multi-Selección de Idiomas
│   ├── ChecklistTree.jsx       # Renderizador de Fases, Subsecciones, Grupos e Ítems
│   ├── ProgressBar.jsx          # Barra e indicador porcentual de avance de tareas
│   ├── PasswordModal.jsx       # Modal superpuesto con espaciados amplios de verificación de clave
│   └── OptionsManagerModal.jsx # Modal de administración de variables desplegables (4 pestañas)
└── utils/
    └── markdownParser.js       # Parseador AST de Markdown, filtrado por Rol/Multi-Idioma y generador de reportes
```

---

## 🔄 3. Flujo de Datos y Parseo de Markdown

### Sincronización en Tiempo Real con `checklist.md`
En [`src/App.jsx`](./src/App.jsx), la función `fetchChecklistFile` realiza una petición `fetch('./checklist.md?t=timestamp')` cada 3 segundos. Si el contenido en disco cambia, el estado `rawMarkdown` se actualiza inmediatamente sin perder las casillas marcadas.

### Expresiones Regulares e Indentación Unicode (NBSP)
El parseador [`src/utils/markdownParser.js`](./src/utils/markdownParser.js) procesa cada línea del Markdown:
- **H2 (`## `)**: Identificado como Fase.
- **H3 (`### `)**: Identificado como Subsección (ej. `Transmisiones`, `Zoom`, `Hardware`).
- **Encabezados de Grupo (`- Crear miniatura`)**: Ítems sin casilla `[ ]` seguidos de ítems indentados.
- **Sangría Unicode**: Se utiliza la expresión `/^[\s\u00A0]+/` para soportar espacios estándar (código ASCII 32), tabulaciones (código ASCII 9) y **Non-Breaking Spaces** (`\u00A0` - código ASCII 160) presentes en `checklist.md`.

---

## 🎭 4. Filtrado por Rol y Selección Múltiple de Idiomas

La función `filterDataByRoleAndLanguage(parsedData, selectedRole, selectedLanguages)` filtra dinámicamente el árbol parseado según:
1. **Filtro por Rol**:
   - **Global**: Ubicado elegantemente en la parte superior derecha de la tarjeta de Rol. Retorna la totalidad del árbol.
   - **Transmisiones**: Muestra únicamente las subsecciones con título `### Transmisiones`.
   - **Zoom**: Muestra únicamente las subsecciones con título `### Zoom`.
2. **Filtro por Selección Múltiple de Idiomas**:
   - Soporta seleccionar simultáneamente uno o varios idiomas (ej. `["Español", "Ingles"]`).
   - Botón interactivo de pills para alternar selección.
   - **"Todos"**: Muestra todos los sub-ítems de idiomas.
   - **"Español"**: Filtra sub-ítems pertenecientes a Español.
   - **"Ingles"**: Filtra sub-ítems pertenecientes a Inglés.
   - **"Otros"**: Filtra sub-ítems pertenecientes a otros idiomas (ej. `Frances`, `Frances / Italiano`).

---

## 🔒 5. Seguridad, Atajo Secreto `Alt + A` y Diseño de Modales

1. **Supresión de Edición Pública**: No existe botón público para editar el Markdown en vivo.
2. **Atajo de Teclado Protegido (`Alt + A`)**:
   - Al presionar **`Alt + A`** en cualquier lugar de la web, se activa el evento `keydown` registrado en `App.jsx`, abriendo el [`PasswordModal.jsx`](./src/components/PasswordModal.jsx).
3. **Modal Superpuesto con Espaciado Amplio**:
   - `PasswordModal` y `OptionsManagerModal` cuentan con separación de márgenes, flex-gap y padding interno holgado.
4. **Cálculo Dinámico de Clave (`AAAAMMDD`)**:
   - La clave se valida contra la fecha actual local en formato `YYYYMMDD` (ej. `20261008`).

---

## 🔄 6. Reinicio Total de la Sesión

- El botón **Reiniciar** limpia las casillas marcadas, el área de observaciones **Y TAMBIÉN** resetea los parámetros de transmisión (Persona Responsable, Tiempo Atendido, Rol e Idioma Seleccionado) a sus valores iniciales por defecto.

---

## 🚀 7. Guía para Futuros Agentes de IA

Si un nuevo agente necesita modificar la aplicación:
1. Para modificar la lógica de parsing o filtrado por idioma/rol: Editar [`src/utils/markdownParser.js`](./src/utils/markdownParser.js).
2. Para cambiar los valores iniciales predeterminados: Editar `DEFAULT_OPTIONS` en [`src/App.jsx`](./src/App.jsx).
3. Para validar la compilación antes de responder al usuario: Ejecutar `npm run build`.
