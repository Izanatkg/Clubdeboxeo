# Club de Boxeo - Sistema de Gestión

Sistema de gestión para club de boxeo desarrollado con el stack MERN (MongoDB, Express.js, React, Node.js).

## Requisitos del Sistema

- Node.js 18.x o superior
- MongoDB 6.x o superior
- NPM 9.x o superior

## Configuración del Proyecto

1. Instalar dependencias:
```bash
# Instalar dependencias del backend
npm install

# Instalar dependencias del frontend
cd frontend
npm install
```

2. Configurar variables de entorno:
Crear archivo `.env` en la raíz del proyecto con:
```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/boxingclub
JWT_SECRET=your_jwt_secret_key_here
```

3. Iniciar el proyecto en modo desarrollo:
```bash
# Iniciar backend y frontend concurrentemente
npm run dev
```

## Características Principales

- Autenticación de usuarios con JWT
- Gestión de estudiantes (CRUD)
- Sistema de pagos y membresías
- Inventario y ventas de productos
- Venta de ropa con sistema de abonos
- Corte de caja y reportes

## Precios Predefinidos

### Membresías
- Clase individual: $25
- Semana: $120
- Mensualidad: $450

### Productos
- Agua: $12
- Bebida energética chica: $25
- Bebida energética grande: $35
- Vendajes: $12
- Protector bucal: $70

## Estructura del Proyecto

```
club-boxeo-app/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── features/
│       ├── pages/
│       └── app/
└── package.json
