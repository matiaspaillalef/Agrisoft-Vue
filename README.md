
![Logo](https://agrisoft.cl/wp-content/uploads/2025/03/logo-agrisoft-v1-png.webp)

# Agrisoft 2.0

**Agrisoft 2.0** es un sistema moderno y escalable para la gestión de procesos agroindustriales, diseñado con **Vue 3 + Vite**. Su enfoque visual limpio, responsivo y funcional permite una experiencia optimizada tanto para usuarios administrativos como técnicos de campo.

## 🚀 Características principales

- ✅ Login seguro con autenticación contra API externa
- 🌐 Integración con servicios RESTful
- 📊 Dashboard dinámico para monitoreo y control
- 🧑‍🌾 Gestión de usuarios, roles y compañías
- 🌱 Diseño moderno y responsive con **Tailwind CSS 4**
- 🔐 Protección de rutas y control de acceso por roles
- ⚡️ Alta velocidad gracias a Vite + composición API

## 🖼️ Tecnologías usadas

| Tecnología       | Versión    |
|------------------|------------|
| [Vue 3](https://vuejs.org/)           | ^3.5.x     |
| [Vite](https://vitejs.dev/)          | ^7.x       |
| [Tailwind CSS](https://tailwindcss.com/)  | ^4.1.x     |
| [Vue Router](https://router.vuejs.org/)   | ^4.x       |
| [fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) | Nativa     |

## 📁 Estructura del proyecto

```bash
agrisoft/
├── src/
│   ├── components/        # Componentes reutilizables (Login, Dashboard, etc.)
│   ├── services/          # Lógica separada para peticiones API (authService.js)
│   ├── router/            # Configuración de rutas protegidas
│   ├── views/             # Vistas principales (si usas esta carpeta)
│   ├── assets/            # Imágenes, íconos, etc.
│   ├── style.css          # Estilos base de Tailwind CSS
│   └── App.vue            # Componente raíz
├── public/                # Archivos públicos (favicon, etc.)
├── package.json           # Configuración del proyecto y dependencias
├── vite.config.js         # Configuración de Vite
└── README.md              # Este archivo :)
```

## ⚙️ Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tuusuario/agrisoft.git
cd agrisoft

# Instalar dependencias
npm install

# Ejecutar el entorno de desarrollo
npm run dev
```

## Authors

- [@Jdonos0](https://github.com/Jdonos0)
- [@raulrodriguez37](raulrodriguez37@gmail.com)
- [@matiaspaillef](https://github.com/matiaspaillalef)

