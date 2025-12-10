 # Checklist: Microservicio de PDFs en Render (Opción A)
     _Fecha de inicio: 2025-12-10T01:12:13.428Z_

     ## Fase 0 – Decisiones iniciales (COMPLETADO)
     - [x] Confirmar lenguaje del microservicio: **Node.js + Express**.
     - [x] Confirmar estrategia de autenticación entre Vercel y el microservicio:
       - [x] Opción recomendada: **API key compartida** en header (`X-PDF-SERVICE-TOKEN`).
     - [x] Confirmar si el microservicio estará en:
       - [x] Nuevo repo GitHub dedicado (recomendado): **Conectado en carpeta `pdf-service`**.
       - [x] Carpeta local: `pdf-service` ya creada y vinculada.

     ## Fase 1 – Diseño del microservicio
     - [ ] Definir contrato del endpoint principal:
       - [ ] Método: `POST /generate-pdf`.
       - [ ] Body JSON: `{ quotationData: CotizacionInput, meta?: {...} }` (igual que hoy en `/api/generate-pdf`).
       - [ ] Respuesta OK: `200` con `application/pdf` (binary stream).
       - [ ] Respuesta error: `4xx/5xx` con JSON `{ success: false, error: string }`.
     - [ ] Definir headers obligatorios:
       - [ ] `Content-Type: application/json`.
       - [ ] `X-PDF-SERVICE-TOKEN: <secret>`.
     - [ ] Decidir si el servicio:
       - [ ] Valida el `CotizacionInput` con Zod (copiar schemas actuales).
       - [ ] O asume que Vercel ya validó y solo hace lo mínimo para generar el PDF.

     ## Fase 2 – Setup del repositorio del microservicio (COMPLETADO)
     - [x] Crear nuevo repo en GitHub (`cotiza-pdf-service`).
     - [x] Inicializar proyecto Node:
       - [x] `npm init -y`.
       - [x] Añadir `.gitignore` (node_modules, logs, etc.).
     - [x] Instalar dependencias:
       - [x] `express`.
       - [x] `cors` (opcional, por si se necesita en el futuro).
       - [x] `puppeteer` (no `puppeteer-core`).
       - [x] `zod` (si se valida ahí).
     - [x] Añadir scripts en `package.json`:
       - [x] `"start": "node dist/index.js"` (o `node src/index.js` si sin build).
       - [x] `"dev": "nodemon src/index.ts"` (si usamos TS).
       - [x] `"build": "tsc"` (solo si TypeScript).
     - [x] Configuración extra: `tsconfig.json` creado y estructura `src/` inicializada.

     ## Fase 3 – Implementación del microservicio (COMPLETADO)
     - [x] Crear `src/index.ts` (entrypoint básico).
     - [x] Crear `src/server.[ts|js]` (integrado en `index.ts`):
       - [x] Configuración básica de Express (`app.use(express.json())`).
       - [x] Middleware para verificar `X-PDF-SERVICE-TOKEN`.
     - [x] Crear `src/pdf/generator.[ts|js]`:
       - [x] Copiar lógica actual de `generateHTML` / `generatePDFBuffer` desde `cotiza-web`.
       - [x] Adaptar paths a templates y assets (ej. `templates/quotation.hbs`, `public/logo.png`).
       - [x] Usar `puppeteer.launch` con Chromium que trae Puppeteer (sin @sparticuz/chromium).
     - [x] Crear ruta `POST /generate-pdf`:
       - [x] Leer `req.body.quotationData`.
       - [x] Validar (Zod) o al menos checar campos mínimos.
       - [x] Generar HTML + PDF buffer.
       - [x] Retornar el PDF con headers:
         - [x] `Content-Type: application/pdf`.
         - [x] `Content-Disposition: attachment; filename="<folio>_<cliente>.pdf"`.

     ## Fase 4 – Configuración de Render (COMPLETADO)
     - [x] Crear cuenta/proyecto en Render (si no existe).
     - [x] Crear nuevo servicio:
       - [x] Tipo: **Web Service**.
       - [x] Conectar al repo GitHub del microservicio.
       - [x] Runtime: **Node** (versión compatible con Puppeteer).
       - [x] Build Command: `npm install && npm run build`
       - [x] Start Command: `npm start`
     - [x] Configurar variables de entorno en Render:
       - [x] `PDF_SERVICE_TOKEN` (Generado).
       - [x] `NODE_ENV=production`.
       - [x] `PUPPETEER_CACHE_DIR=/opt/render/project/puppeteer`.
     - [x] Hacer primer deploy y obtener URL: **https://cotiza-pdf-service.onrender.com**

     ## Fase 5 – Integración con la app en Vercel (EN PROGRESO)
     - [x] En el proyecto `cotiza-web` (Vercel), agregar variable de entorno:
       - [x] `PDF_SERVICE_URL=https://cotiza-pdf-service.onrender.com/generate-pdf`.
       - [x] `PDF_SERVICE_TOKEN=<token>`.
     - [x] Modificar `app/api/generate-pdf/route.ts`:
       - [x] Mantener la validación con `CotizacionSchema`.
       - [x] En vez de llamar a `generatePDFBuffer`, hacer `fetch` hacia `PDF_SERVICE_URL`.
       - [x] Adjuntar en el body `{ quotationData: validated }`.
       - [x] Incluir header `X-PDF-SERVICE-TOKEN`.
       - [x] Reenviar el PDF recibido al cliente con los mismos headers actuales.
     - [ ] Eliminar/aislar el uso de `@sparticuz/chromium` en `cotiza-web` (Opcional por ahora).
     - [x] Actualizar documentación: La generación de PDFs ahora corre en **pdf-service** (Render).
     - [ ] Configurar variables de entorno en Render:
       - [ ] `PDF_SERVICE_PORT` (si se usa).
       - [ ] `PDF_SERVICE_TOKEN` (la misma que luego usará Vercel).
       - [ ] Cualquier otra necesaria (ej. `NODE_ENV=production`).
     - [ ] Configurar comando de build/start:
       - [ ] Build: `npm install && npm run build` (o solo `npm install` si sin TS).
       - [ ] Start: `npm start`.
     - [ ] Hacer primer deploy en Render y anotar la URL pública (ej. `https://cotiza-pdf-service.onrender.com`).
     - [ ] Probar manualmente con `curl` o Postman:
       - [ ] Enviar un `POST /generate-pdf` con JSON de prueba y `X-PDF-SERVICE-TOKEN`.
       - [ ] Verificar que responde con PDF (status 200).

     ## Fase 5 – Integración con la app en Vercel
     - [ ] En el proyecto `cotiza-web` (Vercel), agregar variable de entorno:
       - [ ] `PDF_SERVICE_URL=https://...onrender.com/generate-pdf`.
       - [ ] `PDF_SERVICE_TOKEN=<mismo token que en Render>`.
     - [ ] Modificar `app/api/generate-pdf/route.ts`:
       - [ ] Mantener la validación con `CotizacionSchema`.
       - [ ] En vez de llamar a `generatePDFBuffer`, hacer `fetch`/`axios` hacia `PDF_SERVICE_URL`.
       - [ ] Adjuntar en el body `{ quotationData: validated }`.
       - [ ] Incluir header `X-PDF-SERVICE-TOKEN`.
       - [ ] Reenviar el PDF recibido al cliente con los mismos headers actuales.
     - [ ] Eliminar/aislar el uso de `@sparticuz/chromium` en `cotiza-web` (opcional, se puede dejar de momento pero ya no
    se usará).
     - [ ] Actualizar documentación donde diga que la generación de PDFs corre en un microservicio externo (Render).

     ## Fase 6 – Pruebas end-to-end
     - [ ] En entorno local:
       - [ ] Correr microservicio en local y apuntar `PDF_SERVICE_URL` a `http://localhost:PORT/generate-pdf`.
       - [ ] Correr `cotiza-web` en local y probar “Generar PDF”.
     - [ ] En producción:
       - [ ] Verificar que Vercel usa la URL de Render.
       - [ ] Probar generación de PDF desde `https://cotiza.tecnomata.com`.
       - [ ] Revisar logs en Render si hay errores (límite de memoria, timeout, etc.).

     ## Fase 7 – Limpieza y mejora
     - [ ] Si todo funciona en producción:
       - [ ] Eliminar código muerto relacionado a Puppeteer en `cotiza-web` (cuando estemos seguros).
       - [ ] Conservar solo el contrato HTTP (`/api/generate-pdf` → microservicio).
     - [ ] Añadir rate limiting / protección básica en el microservicio (opcional).
     - [ ] Añadir métricas simples o logs estructurados para debugging futuro.