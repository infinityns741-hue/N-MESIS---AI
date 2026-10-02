# 🎓 GUÍA DE EXPOSICIÓN ACADÉMICA: PROYECTO NÉMESIS - IA
**Universidad Nacional de San Antonio Abad del Cusco (UNSAAC)**  
*Departamento Académico de Física e Ingeniería*

---

## 📌 1. ESTRUCTURA GENERAL DEL PROYECTO (¿CÓMO ESTÁ ORGANIZADO EL CÓDIGO?)

El proyecto ha sido estructurado de forma modular y semántica en español e inglés técnico, separando de manera estricta la capa de presentación (**Frontend**) y la lógica de negocio y servicios (**Backend**):

```text
📁 NEMESIS - AI/
│
├── 📁 Frontend/
│   ├── 📁 acceso/
│   │   ├── index.tsx                 -> Punto de entrada para elegir entre ALUMNO y DOCENTE
│   │   └── login.tsx                 -> Autenticación de credenciales institucionales UNSAAC
│   │
│   ├── 📁 portal-alumno/
│   │   ├── 📁 chat/                  -> Asistente IA Socrático de Física, dictado por voz, KaTeX
│   │   ├── 📁 laboratorios/          -> Simulador 2D/3D (MRU, Método Científico, Sistema de Unidades)
│   │   ├── 📁 investigaciones/       -> Proyectos y Centros de Investigación UNSAAC
│   │   ├── 📁 biblioteca/            -> Libros de Física Universitaria y Guías de Laboratorio
│   │   ├── 📁 mensajes/              -> Comunidad académica y mensajería en tiempo real
│   │   └── 📁 perfil/                -> Analíticas de rendimiento, horas de estudio y notas
│   │
│   └── 📁 portal-docente/
│       ├── 📁 dashboard/             -> Panel de control docente, monitoreo de alumnos y cursos
│       ├── 📁 crear-sala/            -> Generación de salas virtuales, aulas y centros de investigación
│       └── 📁 chat/                  -> Tutor IA asistente pedagógico para docentes
│
└── 📁 Backend/
    ├── index.ts                      -> Punto de entrada unificado del backend
    ├── 📁 servidor/
    │   └── server.ts                 -> Servidor Node.js + Express con API REST (/api/auth, /api/laboratorios)
    ├── 📁 controladores/
    │   ├── authController.ts         -> Lógica de autenticación y validación de roles
    │   ├── chatController.ts         -> Conector de lenguaje natural y streaming
    │   ├── laboratoriosController.ts -> Motor de física matemática (x = x0 + v0*t + 0.5*a*t^2)
    │   └── salasController.ts        -> Gestión de aulas y borrado reactivo de centros
    ├── 📁 servicios/
    │   ├── geminiService.ts          -> Integración con Google Gemini 2.5 Flash / Pro
    │   ├── supabaseService.ts        -> Base de datos relacional y sincronización en la nube
    │   └── almacenamientoService.ts  -> Persistencia local reactiva con LocalStorage
    └── 📁 modelos/
        └── index.ts                  -> Tipos TypeScript (Usuario, Docente, Alumno, Experimento)
```

---

## 🎯 2. GUIÓN DE EXPOSICIÓN PASO A PASO (5 MINUTOS PARA EL PROFESOR / JURADO)

### Minuto 1: Introducción y Propósito
> *"Buenos días, profesor y jurado. Presento el sistema **NÉMESIS - IA**, una plataforma integral desarrollada para la UNSAAC orientada a la enseñanza experimental y teórica de la Física Universitaria, integrando Inteligencia Artificial Generativa y simulaciones numéricas en tiempo real."*

### Minuto 2: Pantalla de Acceso y Arquitectura
- Muestra la pantalla principal (**Acceso / Index**):
- Explica la separación de roles: **Portal Alumno** y **Portal Docente**.
- Explica la arquitectura modular de carpetas dividida limpiamente en **Frontend** y **Backend**.

### Minuto 3: Demostración del Portal Alumno
1. **Chat Tutor IA**:
   - Muestra cómo responde preguntas de física con fórmulas en **LaTeX (KaTeX)**.
   - Destaca el soporte de transcripción de voz (micrófono) y lectura en voz alta.
2. **Laboratorios Virtuales**:
   - Abre la práctica de **Cinemática MRU y MRUV**.
   - Muestra el motor de física con vehículos (Auto, Dron, Cohete), gráficos interactivos posición-tiempo y velocímetro analógico.
3. **Centros e Investigaciones**:
   - Muestra los proyectos de investigación académica y la creación/eliminación controlada de centros de investigación.

### Minuto 4: Demostración del Portal Docente
1. **Dashboard Docente**:
   - Muestra la gestión de asignaturas de física del semestre.
   - Lista de estudiantes matriculados y estadísticas de rendimiento.
2. **Crear Salas y Centros**:
   - Demuestra cómo el docente puede aperturar nuevas aulas y salas de consulta.

### Minuto 5: Conclusiones Técnicas
- **Frontend**: React 19 + TypeScript + Tailwind CSS + Lucide Icons + Motion.
- **Backend**: Express + Controladores desacoplados + Modelos fuertemente tipados.
- **IA**: Google Gemini API contextualizado para el currículo de la UNSAAC.
- **Base de Datos**: Supabase en la nube con modo fallback local.

---

## 🚀 3. COMANDOS PARA INICIAR EL PROYECTO

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Ejecutar en modo desarrollo**:
   ```bash
   npm run dev
   ```
   Abrir en el navegador: `http://localhost:3000`

3. **Construir para producción**:
   ```bash
   npm run build
   ```

¡Éxitos en tu exposición de mañana! 🌟
