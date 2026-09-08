import { Scene } from 'phaser';

export class Preloader extends Scene {
    constructor() {
        super('Preloader');
    }

    init(data) {
        // Guardamos la dificultad elegida si venimos del menú
        this.selectedDifficulty = data.difficulty || null;
    }

    create() {
        // Fondo uniforme
        this.cameras.main.setBackgroundColor('#1e293b');

        // Texto de carga
        const loadingText = this.selectedDifficulty
            ? 'Generando Sudoku...'
            : 'Cargando...';

        this.add.text(540, 1000, loadingText, {
            fontFamily: 'sans-serif',
            fontSize: '48px',
            color: '#38bdf8',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Spinner/Animación simple de puntos
        const dots = this.add.text(540, 1100, '• • •', {
            fontFamily: 'sans-serif',
            fontSize: '64px',
            color: '#94a3b8'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: dots,
            alpha: { from: 0.2, to: 1 },
            duration: 600,
            yoyo: true,
            repeat: -1
        });

        // Damos un pequeño margen (50ms) para que el navegador dibuje la pantalla de carga 
        // antes de meterle la trilla de bucles a la CPU para generar el tablero.
        this.time.delayedCall(50, () => {
            if (this.selectedDifficulty) {
                // Ir a la partida con la dificultad seleccionada
                this.scene.start('Game', { difficulty: this.selectedDifficulty });
            } else {
                // Carga inicial -> ir al Menú Principal
                this.scene.start('MainMenu');
            }
        });
    }
}