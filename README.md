# CiberDetective AI

Aplicación web full-stack educativa sobre **ciberseguridad y derecho digital español y europeo** (RGPD, LOPDGDD, LSSI-CE, Directiva NIS2 y Código Penal español), diseñada con estética de **Centro de Operaciones de Ciberseguridad (SOC)** en tonos azul oscuro (`#0a0f1c`), negro carbón (`#05080f`), blanco puro y verde neón (`#10b981`).

Los jugadores investigan expedientes con evidencias interactivas (correos simulados con inspección de cabeceras SMTP/SPF/DMARC y remitente real, registros de logs y extractos legales), reciben informes forenses estructurados de **Google Gemini AI** desde el backend, debaten en la sala técnico-jurídica de cada caso, suben de rango mediante XP y repetición espaciada, y compiten en la clasificación global.

---

## Arquitectura del proyecto (`/client` y `/server`)

```text
├── client/                               # Frontend SPA (React + Vite + Tailwind + Lucide)
│   ├── package.json
│   ├── .env.example                      # VITE_API_URL
│   ├── tailwind.config.js                # Paleta SOC personalizada
│   └── src/
│       ├── context/AuthContext.tsx       # Sesión JWT, nivel, XP, racha e insignias
│       ├── services/apiClient.ts         # Cliente Fetch con interceptores Bearer y errores
│       ├── components/TopNav.tsx         # Navegación SOC e indicador de alertas activas
│       ├── types/index.ts                # Contratos TypeScript compartidos con el backend
│       ├── pages/
│       │   ├── LandingPage.tsx           # Portada con radar y terminal SOC simulada
│       │   ├── AuthPage.tsx              # Acceso e inscripción de agentes
│       │   ├── Dashboard.tsx             # Centro de mando, XP, alertas de repetición y catálogo
│       │   ├── MissionPlayer.tsx         # Temporizador, visor de evidencias, test e informe IA
│       │   ├── DebateRoom.tsx            # Foro por misión con votos y respuestas anidadas
│       │   ├── Leaderboard.tsx           # Clasificación global en tiempo real
│       │   ├── ProfilePage.tsx           # Vitrina de insignias e historial con informes IA
│       │   └── AdminPanel.tsx            # Panel CRUD protegido para misiones y evidencias
│       └── App.tsx                       # Enrutamiento protegido, historial URL y página 404
├── server/                               # Backend API REST (Node.js + Express + TS + Mongoose)
│   ├── package.json
│   ├── .env.example                      # PORT, MONGODB_URI, GEMINI_API_KEY, JWT_SECRET, CORS_ORIGIN
│   └── src/
│       ├── config/db.ts                  # Conexión robusta a MongoDB Atlas
│       ├── models/                       # User, Mission, Attempt, Badge, DebatePost
│       ├── services/
│       │   ├── geminiService.ts          # Evaluación forense JSON estricta (@google/genai)
│       │   └── gamificationService.ts    # Niveles, rachas, insignias y repetición espaciada
│       ├── middleware/                   # JWT RBAC, Zod validation, Express Rate Limit
│       ├── controllers/                  # auth, mission, gamification, debate
│       ├── routes/                       # /api/auth, /api/missions, /api/gamification, /api/debates
│       ├── app.ts & index.ts             # Servidor Express asegurado con Helmet y CORS
│       └── seed.ts                       # Script semilla: 15 misiones (UE/EURES/Igualdad/Eco), 10 insignias y 2 cuentas
└── README.md
```

---

## Requisitos previos

- **Node.js 20+** y **npm 10+**
- Una cuenta gratuita en **MongoDB Atlas**
- Una clave **Google Gemini API Key** obtenida en Google AI Studio

---

## 1. Configuración de MongoDB Atlas y Gemini API

### MongoDB Atlas
1. Crea un clúster gratuito (**M0**) en [MongoDB Atlas](https://www.mongodb.com/atlas).
2. En **Database Access**, crea un usuario de base de datos con rol **Read and write to any database** (`readWriteAnyDatabase` o equivalente sobre tu base de datos).
3. En **Network Access**, añade tu IP local para desarrollo o `0.0.0.0/0` cuando vayas a desplegar en Render (las instancias estándar de Render usan IPs dinámicas).
4. Haz clic en **Connect -> Drivers (Node.js)** y copia tu cadena `mongodb+srv://USUARIO:PASSWORD@cluster.mongodb.net/ciberdetective?retryWrites=true&w=majority`.

### Gemini API Key
1. Genera tu clave en [Google AI Studio](https://aistudio.google.com/apikey).
2. Guárdala únicamente en el backend (`server/.env`). **Nunca** la añadas en variables `VITE_*` ni en el código del cliente.

---

## 2. Instalación y ejecución en local

### Paso A: Configurar e iniciar el Backend (`/server`)

```bash
cd server
npm install
cp .env.example .env
```

Edita `server/.env` con tus credenciales reales:

```env
PORT=4000
NODE_ENV=development
MONGODB_URI=mongodb+srv://USUARIO:PASSWORD@cluster.mongodb.net/ciberdetective?retryWrites=true&w=majority
GEMINI_API_KEY=tu_clave_real_de_gemini
JWT_SECRET=una_clave_secreta_muy_larga_y_aleatoria_de_al_menos_32_caracteres
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

Carga las **15 misiones iniciales** (incluidos los casos de Derechos Fundamentales de la UE, Red EURES, Igualdad Digital y Operación Eco-Fraude / Límites Planetarios), las **10 insignias** y las **2 cuentas de prueba** en MongoDB Atlas ejecutando el script semilla:

```bash
npm run seed
```

Credenciales de prueba creadas por `seed`:
- **Agente estándar:** `detective@ciberdetective.es` / `Detective2026!`
- **Administrador SOC:** `admin@ciberdetective.es` / `AdminSOC2026!`

Inicia el servidor backend en desarrollo:

```bash
npm run dev
```

El API quedará escuchando en `http://localhost:4000` (verificación rápida en `http://localhost:4000/api/health`).

### Paso B: Configurar e iniciar el Frontend (`/client`)

En una segunda terminal:

```bash
cd client
npm install
cp .env.example .env
```

Verifica `client/.env`:

```env
VITE_API_URL=http://localhost:4000/api
```

Inicia el cliente Vite:

```bash
npm run dev
```

Abre `http://localhost:5173` en tu navegador.

---

## 3. Subir el proyecto a GitHub

Asegúrate de no subir archivos `.env` ni `node_modules` (ya protegidos por `.gitignore`):

```bash
git init
git add .
git commit -m "Implementación completa de CiberDetective AI"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/ciberdetective-ai.git
git push -u origin main
```

---

## 4. Despliegue en Render (Backend + Frontend)

### Paso 1: Desplegar el Backend en Render (Web Service)
1. En el panel de [Render](https://dashboard.render.com), selecciona **New + -> Web Service** y conecta tu repositorio de GitHub.
2. Configura el servicio:
   - **Name:** `ciberdetective-api`
   - **Root Directory:** `server`
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
3. Añade las variables de entorno en **Environment**:
   - `NODE_ENV` = `production`
   - `PORT` = `4000`
   - `MONGODB_URI` = *(tu cadena de MongoDB Atlas)*
   - `GEMINI_API_KEY` = *(tu API Key de Gemini)*
   - `JWT_SECRET` = *(cadena aleatoria segura)*
   - `JWT_EXPIRES_IN` = `7d`
   - `CORS_ORIGIN` = `https://ciberdetective-web.onrender.com` *(la URL que tendrá tu frontend en Render)*
4. Tras el primer despliegue exitoso, abre la pestaña **Shell** de tu Web Service en Render (o ejecuta `npm run seed` apuntando a tu `MONGODB_URI` desde local) si aún no habías poblado la base de datos.

### Paso 2: Desplegar el Frontend en Render (Static Site)
1. En Render, selecciona **New + -> Static Site** y vuelve a elegir el mismo repositorio de GitHub.
2. Configura el sitio estático:
   - **Name:** `ciberdetective-web`
   - **Root Directory:** `client`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
3. Añade la variable de entorno en **Environment**:
   - `VITE_API_URL` = `https://ciberdetective-api.onrender.com/api` *(URL pública de tu backend en Render seguida de `/api`)*
4. Configura la regla de reescritura para rutas SPA en **Redirects/Rewrites**:
   - **Source:** `/*`
   - **Destination:** `/index.html`
   - **Action:** `Rewrite`
5. Actualiza `CORS_ORIGIN` en el Web Service del backend con la URL definitiva asignada al Static Site si difiere de la prevista.

---

## Medidas de seguridad incluidas

- **Secretos protegidos:** `GEMINI_API_KEY` y `JWT_SECRET` residen exclusivamente en el servidor; nunca se exponen en el bundle del navegador.
- **Contraseñas seguras:** Hasheadas con `bcryptjs` (factor de coste 12) y excluidas por defecto en consultas Mongoose (`select: false`).
- **Control de acceso (RBAC) y rutas privadas:** JWT verificado por middleware (`protect`) y acceso restringido por rol (`authorizeRoles('admin')`) para crear, editar o eliminar misiones.
- **Validación estricta:** Todos los cuerpos y parámetros HTTP se validan con **Zod** antes de tocar la base de datos.
- **Rate limiting:** Límites diferenciados para API general, autenticación (`/api/auth`) y llamadas a Gemini AI (`/api/missions/:id/responder`).
- **Control anti-alucinaciones jurídicas:** Cada misión aporta un campo `marcoLegalReal` verificado y el prompt del sistema prohíbe explícitamente a Gemini inventar números de artículos o jurisprudencia.
