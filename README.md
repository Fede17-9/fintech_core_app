# Fintech Core App 💳

Aplicación backend desarrollada en TypeScript bajo principios de **Clean Architecture**, diseñada para administrar dinero y cuentas bancarias digitales.

## 🛠️ Tecnologías y Herramientas
* **TypeScript**
* **Node.js** con **pnpm**
* Arquitectura Limpia (Clean Architecture)

## 📁 Estructura del Proyecto
```text
src/
├── domain/          # Entidades, reglas de negocio y contratos (interfaces)
├── use-cases/       # Casos de uso / lógica de aplicación
├── infrastructure/  # Implementaciones externas (BD, frameworks, librerías)
└── presentation/    # Controladores o puntos de entrada (API / rutas)