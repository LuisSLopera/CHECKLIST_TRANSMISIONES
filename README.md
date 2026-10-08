# 📡 Checklist de Transmisiones - Web Application
By: Luis Sebastian Lopera

Aplicación web moderna e interactiva diseñada para el control de transmisiones en vivo en salas de control (Control Room). La aplicación carga y sincroniza en tiempo real los datos a partir del archivo Markdown [`checklist.md`](./checklist.md). Si el archivo cambia en el disco, el formulario se actualiza automáticamente.

---

## ✨ Características Principales

1. **Sincronización Automática en Tiempo Real**:
   - Monitorea el archivo `checklist.md` localmente mediante polling continuo. Cualquier edición realizada en el archivo `.md` actualiza dinámicamente las fases, subsecciones e ítems en la pantalla.

2. **Filtro Inteligente por Rol**:
   - **Global**: Muestra la totalidad de la estructura del checklist.
   - **Transmisiones**: Muestra únicamente las subsecciones `### Transmisiones`.
   - **Zoom**: Muestra únicamente las subsecciones `### Zoom`.

3. **Variables de Encabezado con Opciones Personalizables**:
   - **Persona Responsable**: `"Luis Sebastian Lopera"`, `"David Laiton"`, `"Yobany Garcia"`, `"Fabian medina"`, `"Yeison Quintero"`.
   - **Tiempo atendido**: `"Culto general"`, `"Culto Finisher"`, `"Conferencia mundial"`.
   - **Rol**: `"Global"`, `"Transmisiones"`, `"Zoom"`.
   - **Administrador de Opciones**: Permite agregar, editar o eliminar opciones para cualquiera de estos 3 campos de forma persistente en `localStorage`.

4. **Experiencia de Usuario Interactiva (Studio / Dark Mode)**:
   - Medidor de progreso global (%) e indicadores por fase.
   - Selección por grupos: Marcar el título de un grupo auto-marca todas sus opciones hijas.
   - Modo Oscuro Broadcast y Modo Claro.
   - Editor de código Markdown en vivo dentro de la web.

5. **Herramientas de Exportación**:
   - **Copiar para WhatsApp/Telegram**: Genera un reporte formateado y resumido en 1 clic.
   - **Exportar Reporte (.md)**: Descarga un archivo Markdown con los ítems verificados y las observaciones finales.
   - **Reiniciar Checklist**: Limpia la sesión actual para una nueva transmisión.

---

## 🚀 Guía de Uso Local

### Requisitos
- Node.js v18+

### 1. Iniciar servidor de desarrollo local
```bash
npm run dev
```
Abre la URL indicada (usualmente `http://localhost:5173`) en tu navegador.

---

## 🌐 Despliegue Gratuito en GitHub Pages o Hosts Gratuitos

### Opción A: Despliegue Automático con GitHub Actions (Recomendado)
El proyecto incluye la configuración para **GitHub Actions** en [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml).

1. Sube tu código a tu repositorio de GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Checklist Transmisiones"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
   git push -u origin main
   ```
2. En GitHub, ve a **Settings** > **Pages**.
3. En **Build and deployment** > **Source**, selecciona **GitHub Actions**.
4. ¡Listo! Cada vez que hagas `git push`, tu web se desplegará automáticamente de forma gratuita.

### Opción B: Despliegue Manual a GitHub Pages
Si prefieres desplegar directamente desde la terminal con `gh-pages`:
```bash
npm run deploy
```

### Opción C: Vercel / Netlify / Render (Gratis)
- **Vercel**: Importa el repositorio de GitHub y selecciona el framework `Vite`.
- **Netlify**: Importa el repositorio con comando de build `npm run build` y carpeta de salida `dist`.

---

## 📂 Archivos Importantes

- [`checklist.md`](./checklist.md): Archivo fuente del checklist en formato Markdown.
- [`src/App.jsx`](./src/App.jsx): Componente principal de la aplicación web.
- [`src/utils/markdownParser.js`](./src/utils/markdownParser.js): Parseador dinámico de Markdown y motor de filtrado por Rol.
- [`src/components/HeaderMetadata.jsx`](./src/components/HeaderMetadata.jsx): Campos de Persona, Tiempo y Rol.
- [`src/components/OptionsManagerModal.jsx`](./src/components/OptionsManagerModal.jsx): Modal de administración de variables.
