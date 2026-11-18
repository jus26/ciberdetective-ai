# CiberDetective AI

Aplicación web full-stack educativa sobre **ciberseguridad y derecho digital español y europeo**. Los jugadores actúan como analistas e investigadores digitales resolviendo casos prácticos de **phishing y estafas**, **protección de datos y privacidad** y **derecho digital (RGPD, LOPDGDD, LSSI-CE, NIS2 y Código Penal español)**, recibiendo evaluación forense y jurídica generada en el servidor mediante **Google Gemini**.

---

## Arquitectura y tecnologías

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide React
- **Backend:** Node.js, Express, Helmet, Express Rate Limit, Zod
- **Base de datos:** MongoDB Atlas mediante Mongoose (con persistencia JSON local automática como respaldo si `MONGODB_URI` está vacío en pruebas locales)
- **Autenticación y seguridad:** Contraseñas cifradas con `bcryptjs` (coste 12), tokens JWT firmados (`jsonwebtoken`), validación estricta de entradas y protección de rutas privadas/administración
- **Inteligencia Artificial:** `@google/genai` ejecutado exclusivamente en el servidor (`server/services/geminiService.ts`), utilizando salida estructurada JSON y contexto jurídico verificado para evitar alucinaciones de artículos o jurisprudencia.

---

## Estructura del proyecto

```text
├── server.ts                           # Punto de entrada Express + Vite/dist
├── server/
│   ├── config/
│   │   ├── env.ts                      # Carga y validación de variables de entorno
│   │   └── database.ts                 # Conexión a MongoDB Atlas con Mongoose
│   ├── models/
│   │   ├── User.ts                     # Modelo de usuarios, XP, nivel y logros
│   │   ├── Mission.ts                  # Modelo de misiones, evidencias y contexto legal
│   │   ├── Attempt.ts                  # Modelo de respuestas e informes de Gemini
│   │   ├── Score.ts                    # Modelo de puntuación y clasificación
│   │   └── Achievement.ts              # Catálogo de insignias y logros
│   ├── controllers/
│   │   ├── authController.ts           # Registro, login y sesión actual
│   │   ├── missionController.ts        # Listado, detalle y evaluación con Gemini
│   │   ├── userController.ts           # Perfil, historial, logros y clasificación
│   │   └── adminController.ts          # CRUD administrativo de misiones
│   ├── middleware/
│   │   ├── auth.ts                     # Verificación JWT y RBAC (admin/player)
│   │   └── rateLimit.ts                # Límite de peticiones API, Auth e IA
│   ├── routes/
│   │   └── index.ts                    # Enrutador modular /api
│   └── services/
│       ├── dataStore.ts                # Capa de datos unificada (MongoDB / fallback local)
│       ├── gamificationService.ts      # Cálculo de niveles, XP e insignias
│       ├── geminiService.ts            # Integración segura con Gemini API
│       └── seedData.ts                 # Casos prácticos iniciales y usuarios demo
├── src/
│   ├── components/                     # Navbar, LandingView, MissionsHub, MissionWorkspace, ProfileView, LeaderboardView, HistoryView, AdminPanel, AuthModal
│   ├── context/AuthContext.tsx         # Estado global de sesión
│   ├── services/api.ts                 # Cliente HTTP con JWT Bearer
│   └── types/index.ts                  # Tipos compartidos del frontend
├── .env.example                        # Plantilla de variables de entorno
└── package.json
```

---

## Instalación local

1. **Clonar el repositorio e instalar dependencias:**

```bash
npm install
```

2. **Configurar variables de entorno:**

Copia `.env.example` a `.env` y completa los valores:

```bash
cp .env.example .env
```

Variables principales:
- `GEMINI_API_KEY`: Tu clave de Google Gemini API (nunca se expone en el cliente).
- `MONGODB_URI`: Tu cadena de conexión de MongoDB Atlas (`mongodb+srv://...`).
- `JWT_SECRET`: Cadena secreta larga y aleatoria (mínimo 32 caracteres).
- `PORT`: Puerto del servidor (por defecto `3000`).

3. **Ejecutar en desarrollo:**

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

### Cuentas de demostración iniciales

Al iniciar el servidor por primera vez se crean dos cuentas de prueba y 9 misiones verificadas:
- **Detective:** `detective@ciberdetective.es` / `Detective2026!`
- **Administrador SOC:** `admin@ciberdetective.es` / `AdminSOC2026!`

*(Cambia o elimina estas credenciales en producción tras configurar tu administrador definitivo).*

---

## Configuración de MongoDB Atlas

1. Crea un clúster gratuito (M0) en [MongoDB Atlas](https://www.mongodb.com/atlas).
2. En **Database Access**, crea un usuario con permisos de lectura y escritura (`readWrite`).
3. En **Network Access**, añade la IP de salida de Render o permite el acceso necesario (`0.0.0.0/0` si usas IPs dinámicas en el plan gratuito de Render).
4. Copia la cadena de conexión (`Drivers -> Node.js`) y asígnala en la variable `MONGODB_URI`.

---

## Despliegue en GitHub y Render

1. **Subir a GitHub:**

```bash
git init
git add .
git commit -m "Versión inicial de CiberDetective AI"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/ciberdetective-ai.git
git push -u origin main
```

2. **Crear Web Service en Render:**

- Conecta tu repositorio de GitHub en [Render](https://render.com).
- **Runtime:** Node
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Variables de entorno en Render:**
  - `NODE_ENV=production`
  - `GEMINI_API_KEY=...`
  - `MONGODB_URI=...`
  - `JWT_SECRET=...`
  - `APP_URL=https://tu-servicio.onrender.com`

---

## Seguridad implementada

- **Validación de entradas:** Todos los endpoints validan esquemas estrictos con `zod`.
- **Protección de contraseñas:** Hash irreversible con `bcryptjs` (salt rounds = 12).
- **Rutas privadas y RBAC:** Middleware `authenticate` y `requireAdmin` para perfil, historial, envío de misiones y panel de administración.
- **Limitación de peticiones:** `express-rate-limit` aplicado de forma diferenciada en API general, autenticación y evaluaciones con IA.
- **Prevención de alucinaciones jurídicas:** Los casos incluyen un campo `legalContext` verificado y el prompt del servidor prohíbe explícitamente a Gemini inventar números de artículos o jurisprudencia.
