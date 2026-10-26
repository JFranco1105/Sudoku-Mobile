# Sudoku Mobile

Sudoku Mobile es una aplicación móvil moderna desarrollada para ofrecer la experiencia clásica del juego de Sudoku en dispositivos móviles. Esta aplicación resuelve la necesidad de los entusiastas de los rompecabezas de contar con una plataforma intuitiva, personalizable y accesible sin conexión para ejercitar la mente en cualquier momento y lugar.

## Características Principales (Features)

- **Múltiples Niveles de Dificultad**: Tableros generados para diferentes niveles de habilidad (Fácil, Medio, Difícil y Experto).
- **Sistema de Notas (Modo Lápiz)**: Permite anotar posibles números candidatos en celdas vacías antes de confirmar la respuesta.
- **Detección de Errores e Historial**: Resaltado visual opcional para números duplicados y función de deshacer/rehacer movimientos.
- **Temporizador y Estadísticas**: Seguimiento del tiempo transcurrido en cada partida y registro de récords personales.
- **Diseño Adaptativo / Modo Oscuro**: Interfaz optimizada para pantallas táctiles con soporte para temas claro y oscuro.

## Tecnologías Utilizadas

- **Framework**: [React Native](https://reactnative.dev/) / [Expo](https://expo.dev/)
- **Lenguaje**: JavaScript (ES6+) / TypeScript
- **Gestión de Estado**: React Context API / Redux Toolkit
- **Navegación**: React Navigation
- **Estilos**: StyleSheet / Tailwind CSS (NativeWind)

## Requisitos Previos

Antes de comenzar con la instalación, asegúrate de tener instalado en tu sistema:

- **Node.js**: v18.0.0 o superior ([Descargar Node.js](https://nodejs.org/))
- **npm** (v9.0.0+) o **yarn** (v1.22.0+)
- **Git**: ([Descargar Git](https://git-scm.com/))
- **Expo Go** (opcional, en tu dispositivo físico iOS/Android) o un emulador de Android Studio / Xcode.

## Instalación y Configuración

Sigue estos pasos para clonar e instalar el proyecto en tu entorno local:

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/Llellesito/Sudoku-Mobile.git
   cd Sudoku-Mobile
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   # O si utilizas yarn:
   yarn install
   ```

3. **Configurar variables de entorno:**
   Si el proyecto incluye configuración de entorno, copia el archivo de plantilla `.env.example`:
   ```bash
   cp .env.example .env
   ```
   *(Ajusta las variables dentro de `.env` según tus necesidades locales).*

## Modo de Uso

Comandos principales para ejecutar la aplicación en entorno de desarrollo:

- **Iniciar el servidor de desarrollo (Metro Bundler / Expo):**
  ```bash
  npm start
  ```

- **Ejecutar en emulador de Android:**
  ```bash
  npm run android
  ```

- **Ejecutar en emulador de iOS (Solo macOS):**
  ```bash
  npm run ios
  ```

- **Ejecutar suite de pruebas unitarias:**
  ```bash
  npm test
  ```

## Estructura del Proyecto

```text
Sudoku-Mobile/
├── assets/             # Recursos estáticos (imágenes, fuentes, iconos)
├── src/
│   ├── components/     # Componentes reutilizables de UI (Tablero, Botones, Teclado)
│   ├── screens/        # Pantallas principales (Inicio, Juego, Ajustes, Estadísticas)
│   ├── navigation/     # Configuración de rutas y navegadores (Stack, Tabs)
│   ├── context/        # Proveedores de estado global (Juego, Tema)
│   ├── utils/          # Algoritmos de solución, generación y validación de Sudoku
│   └── hooks/          # Hooks personalizados para la lógica de la app
├── App.js              # Punto de entrada principal de la aplicación
├── package.json        # Archivo de configuración de dependencias y scripts
└── README.md           # Documentación del proyecto
```

## Contribución

¡Las contribuciones son bienvenidas! Si deseas colaborar en la mejora del proyecto:

1. Realiza un **Fork** de este repositorio.
2. Crea una rama para tu nueva funcionalidad o corrección (`git checkout -b feature/nueva-funcionalidad`).
3. Realiza tus cambios y confirma los commits (`git commit -m 'Añade nueva funcionalidad'`).
4. Haz Push a tu rama en GitHub (`git push origin feature/nueva-funcionalidad`).
5. Abre un **Pull Request** para revisión.

## Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo [LICENSE](LICENSE) para obtener más detalles.
