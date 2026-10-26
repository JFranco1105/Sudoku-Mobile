# Sudoku Mobile

Sudoku Mobile es una aplicación nativa para Android desarrollada en Java, diseñada para ofrecer la experiencia clásica del juego de lógica en dispositivos móviles de forma ligera, rápida y sin distracciones.

## Características Principales (Features)

- **Juego Clásico de Sudoku**: Tableros interactivos con las reglas tradicionales de colocación de números.
- **Interfaz Nativa y Limpia**: Diseñada específicamente para el ecosistema Android utilizando vistas nativas en XML.
- **Control de Tiempos y Movimientos**: Interfaz responsiva adaptada a diferentes tamaños de pantalla en dispositivos Android.
- **Persistencia Local**: Guardado del estado de las partidas para retomar el juego en cualquier momento.

## Tecnologías Utilizadas

- **Lenguaje**: Java
- **Plataforma**: Android SDK
- **Sistema de Construcción**: Gradle
- **IDE**: Android Studio

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado el siguiente software en tu entorno de desarrollo:

- [Android Studio](https://developer.android.com/studio) (versión reciente recomendada)
- [Java Development Kit (JDK)](https://adoptium.net/) (JDK 11 o JDK 17)
- [Android SDK](https://developer.android.com/studio) (configurado a través de Android Studio)
- [Git](https://git-scm.com/)

## Instalación y Configuración

Sigue estos pasos para clonar y preparar el proyecto localmente:

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/Llellesito/Sudoku-Mobile.git
   cd Sudoku-Mobile
   ```

2. **Abrir en Android Studio**:
   Abre Android Studio, selecciona **Open** y elige la carpeta `Sudoku-Mobile`. Espera a que Gradle ejecute la sincronización inicial de dependencias.

3. **Configurar dispositivo de pruebas**:
   Asegúrate de tener un emulador Android (AVD) creado o un dispositivo físico conectado con el modo de **Depuración por USB** activado.

## Modo de Uso

Comandos de Gradle para compilar y probar la aplicación desde la consola:

- **Compilar la aplicación (Modo Debug)**:
  ```bash
  ./gradlew assembleDebug
  ```

- **Instalar en dispositivo o emulador conectado**:
  ```bash
  ./gradlew installDebug
  ```

- **Ejecutar pruebas unitarias**:
  ```bash
  ./gradlew test
  ```

## Estructura del Proyecto

```text
Sudoku-Mobile/
├── app/
│   ├── build.gradle              # Configuración y dependencias del módulo app
│   └── src/
│       ├── main/
│       │   ├── java/             # Lógica en Java (Activities, Adapters, Modelos)
│       │   ├── res/
│       │   │   ├── layout/       # Diseños de interfaz en XML
│       │   │   ├── values/       # Estilos, colores y cadenas de texto (strings.xml)
│       │   │   └── drawable/     # Iconos y recursos gráficos
│       │   └── AndroidManifest.xml # Configuración de componentes y permisos
│       └── test/                 # Pruebas unitarias
├── build.gradle                  # Configuración global del proyecto
├── settings.gradle               # Módulos del proyecto
└── README.md                     # Documentación del proyecto
```

## Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo `LICENSE` para obtener más información.
