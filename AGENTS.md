# AGENTS.md — TraductorApp

Este archivo define las reglas, estructura y convenciones que todo agente debe respetar al trabajar en este proyecto de clase.

## Propósito del proyecto

TraductorApp es una aplicación móvil multiplataforma (Android/iOS) con backend propio. El objetivo académico es que cada estudiante implemente funcionalidades en su propia rama y luego se integren en `master`.

El producto se llama **TraduFly**. Antes de implementar cualquier funcionalidad, lee `ARQUITECTURA.md`: define pantallas, modelos, rutas y el reparto por rama.

## Stack tecnológico

- **Backend:** Node.js + Express + Mongoose + MongoDB.
- **Frontend:** React Native con Expo (template `blank`).
- **HTTP client:** Axios (ya instalado en `frontend`).
- **Control de versiones:** Git, con ramas por estudiante.

## Estructura del monorepo

```
TraductorApp/
├── backend/                 # API REST en Node.js
│   ├── src/
│   │   ├── app.js           # Configuración de Express y middlewares
│   │   ├── index.js         # Punto de entrada del servidor (puerto 5000)
│   │   ├── config/          # Configuración (DB, JWT, middlewares)
│   │   ├── controller/      # Controladores de cada recurso
│   │   ├── models/          # Modelos de Mongoose
│   │   └── routes/          # Definición de rutas
│   ├── package.json
│   └── .env                 # Variables de entorno del backend (no subir)
├── frontend/                # Aplicación React Native con Expo
│   ├── src/
│   │   ├── components/      # Componentes reutilizables
│   │   ├── screens/         # Pantallas de la app
│   │   ├── navigation/      # Configuración de navegación
│   │   ├── services/        # Llamadas a la API (axios)
│   │   ├── context/         # Contextos de React (auth, tema, etc.)
│   │   ├── hooks/           # Custom hooks
│   │   └── utils/           # Funciones auxiliares
│   ├── App.js               # Punto de entrada de la app
│   ├── app.json             # Configuración de Expo
│   ├── package.json
│   └── .env                 # Variables de entorno del frontend (no subir)
├── .gitignore               # Reglas globales de Git
├── AGENTS.md                # Este archivo
└── ARQUITECTURA.md          # Diseño de TraduFly (pantallas, datos, rutas)
```

## Convenciones de código

- **Componentes de React:** PascalCase (`HomeScreen.js`, `CustomButton.js`).
- **Carpetas:** lowercase.
- **Funciones y variables:** camelCase.
- **Constantes:** UPPER_SNAKE_CASE.
- **Idioma:** Español para nombres de pantallas y conceptos de negocio; inglés para código y nombres técnicos.
- Un componente por archivo, con el mismo nombre que el componente.
- No escribir lógica de negocio directamente en `App.js`; usar `src/screens` y `src/services`.

## Variables de entorno

### Backend
Crear `backend/.env` a partir del conocimiento del equipo. No subir a Git.

Ejemplo esperado:
```env
PORT=5000
MONGODB_URI=tu_uri_de_mongodb
JWT_SECRET=tu_secreto
```

### Frontend
Crear `frontend/.env` a partir de `frontend/.env.example`.

```env
EXPO_PUBLIC_API_URL=http://localhost:5000
```

> **Importante:** En dispositivos físicos `localhost` no funciona. Usa la IP local de la máquina donde corre el backend, por ejemplo `http://192.168.1.10:5000`.

## Cómo correr el proyecto

### Backend
```bash
cd backend
npm install
npm run dev
```
El servidor inicia en `http://localhost:5000`.

### Frontend
```bash
cd frontend
npm install
npx expo start
```
Luego escanea el QR con Expo Go (Android/iOS) o presiona `a` / `i` para emulador.

## Reglas de trabajo con Git

- `master` es la rama de integración. **Nunca se trabaja directamente en `master`.**
- Cada estudiante tiene su rama personal:
  - `fer`
  - `molina`
  - `rafael`
- Cada agente debe trabajar únicamente en la rama asignada a su estudiante.
- Para integrar cambios a `master`, se hace merge manual o pull request coordinado por el equipo humano.
- Commits descriptivos en español, por ejemplo:
  - `feat: agrega pantalla de inicio de sesión`
  - `fix: corrige manejo de errores en login`
  - `docs: actualiza AGENTS.md`

## Reglas para agentes

1. Antes de escribir código, lee este archivo (`AGENTS.md`).
2. No cambies la estructura de carpetas sin autorización del equipo.
3. No instales dependencias con `npm install <paquete>`; usa siempre `npx expo install <paquete>` en el frontend para mantener compatibilidad con el SDK de Expo.
4. No subas `node_modules/`, archivos `.env` ni builds generadas (`ios/`, `android/`, `web-build/`, `dist/`).
5. Mantén el backend y el frontend separados; no mezcles responsabilidades.
6. Si necesitas agregar una ruta o controlador en el backend, sigue la convención de archivos existente.
7. Si necesitas agregar una pantalla en el frontend, colócala en `frontend/src/screens/` y expórtala desde `frontend/src/screens/index.js` si se crea dicho archivo.
8. Respeta el estilo y formato existente en cada archivo.

## Backend — referencia rápida

- Puerto por defecto: `5000`.
- Middleware de CORS habilitado para cualquier origen.
- Autenticación por JWT en rutas protegidas.
- Rutas actuales (según archivos existentes):
  - `/create-users` — POST
  - `/get-users` — GET (requiere JWT)
  - `/delete-user/:id` — DELETE (requiere JWT)
  - `/login` — POST
  - `/change-password` — PUT (requiere JWT)
  - `/create-chat` — POST (requiere JWT)
  - `/get-chats` — GET (requiere JWT)
  - `/get-chat/:id` — GET (requiere JWT)
  - `/delete-chat/:id` — DELETE (requiere JWT)
- La revisión y corrección del backend es responsabilidad de los estudiantes; este archivo solo documenta lo que existe.

## Notas Expo

- Este proyecto usa el template `blank` de Expo, no Expo Router.
- Si en el futuro se decide usar navegación, instalar `@react-navigation/native` y el stack deseado con `npx expo install`.
- Si se agrega una librería con código nativo, se requiere un development build; durante la clase se prefiere usar librerías compatibles con Expo Go.

## Contacto / coordinación

Cualquier duda sobre arquitectura o integración debe resolverse con el equipo humano antes de que el agente realice cambios grandes.
