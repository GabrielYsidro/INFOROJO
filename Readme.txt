# INFOROJO - Sistema de Gestión e Información para el Corredor Rojo

## 📋 Descripción del Proyecto
INFOROJO es una plataforma integral diseñada para mejorar la experiencia del servicio de transporte público "Corredor Rojo". El sistema conecta a pasajeros, conductores y reguladores en tiempo real, permitiendo el monitoreo de unidades, gestión de incidencias, feedback de usuarios y alertas masivas.

El proyecto está dividido en dos componentes principales:
1. **Backend:** Una API REST robusta construida con Python y FastAPI.
2. **Frontend:** Una aplicación móvil multiplataforma (iOS/Android) construida con React Native y Expo.

## 🚀 Características Principales

### 👤 Para el Pasajero (Cliente)
* **Información en Tiempo Real:** Consulta de paraderos, rutas y ubicación de buses.
* **Estimación de Llegada (ETA):** Visualización del tiempo estimado de llegada de las unidades.
* **Feedback:** Calificación del servicio y envío de comentarios sobre conductores y unidades.
* **Alertas:** Recepción de notificaciones sobre desvíos, tráfico o fallas en el servicio.
* **Compartir Ubicación:** Funcionalidad para compartir el estado del viaje con contactos de confianza.

### 🚌 Para el Conductor
* **Tracking GPS:** Envío de ubicación en tiempo real para el monitoreo del sistema.
* **Reporte de Incidencias:** Interfaz rápida para reportar fallas mecánicas, tráfico o desvíos.
* **Gestión de Viajes:** Control de inicio y fin de recorridos.

### 👮 Para el Regulador
* **Dashboard de Control:** Visualización de métricas clave (fallas, retrasos, satisfacción).
* **Alertas Masivas:** Herramienta para enviar notificaciones push a todos los usuarios ante emergencias.
* **Monitoreo de Flota:** Vista global del estado y ubicación de todas las unidades.
* **Gestión de Feedback:** Acceso a reportes detallados de las calificaciones de los usuarios.

## 🛠️ Tecnologías Utilizadas

### Backend (`/back`)
* **Lenguaje:** Python 3.x
* **Framework:** FastAPI
* **Base de Datos:** PostgreSQL (Gestionado con SQLAlchemy ORM)
* **Autenticación:** Firebase Auth / JWT
* **Notificaciones:** Firebase Cloud Messaging (FCM)
* **Contenedores:** Docker

### Frontend (`/front`)
* **Framework:** React Native (Expo SDK)
* **Lenguaje:** TypeScript
* **Navegación:** Expo Router
* **Mapas:** React Native Maps
* **Estilos:** StyleSheet (Diseño responsivo)

## 📂 Estructura del Proyecto

INFOROJO-DEV/
├── back/                   # Código fuente del Backend (API)
│   ├── config/             # Configuraciones (DB, Firebase)
│   ├── models/             # Modelos de base de datos (SQLAlchemy)
│   ├── routes/             # Endpoints de la API
│   ├── services/           # Lógica de negocio y patrones de diseño
│   ├── tests/              # Pruebas unitarias (Pytest)
│   ├── Dockerfile          # Configuración de despliegue
│   └── main.py             # Punto de entrada de la aplicación
│
├── front/                  # Código fuente del Frontend (App Móvil)
│   ├── app/                # Pantallas y navegación (File-based routing)
│   ├── components/         # Componentes reutilizables de UI
│   ├── services/           # Comunicación con la API (Axios/Fetch)
│   ├── assets/             # Imágenes y fuentes
│   └── app.config.js       # Configuración de Expo
│
└── .github/                # Workflows de CI/CD

## ⚙️ Instalación y Ejecución Local

### Pre-requisitos
* Node.js y npm/yarn
* Python 3.8+
* PostgreSQL
* Cuenta de Firebase configurada

### 1. Configuración del Backend
```bash
cd back
# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # o `venv\Scripts\activate` en Windows

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno (Crear archivo .env basado en configuración)
# Ejecutar servidor
uvicorn main:app --reload