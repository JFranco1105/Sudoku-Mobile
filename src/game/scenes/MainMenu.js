import { Scene } from 'phaser';
import { StatsManager } from '../utils/stats';

export class MainMenu extends Scene {
    constructor() {
        super('MainMenu');
    }

    create() {
        // Título Principal
        this.add.text(540, 260, 'SUDOKU', {
            fontFamily: 'sans-serif',
            fontSize: '96px',
            color: '#38bdf8',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(540, 370, 'Selecciona Dificultad', {
            fontFamily: 'sans-serif',
            fontSize: '50px',
            color: '#94a3b8'
        }).setOrigin(0.5);

        // Botones de Dificultad
        this.createButton(540, 520, 'FÁCIL', 0x22c55e, 'easy');
        this.createButton(540, 680, 'MEDIO', 0xeab308, 'medium');
        this.createButton(540, 840, 'DIFÍCIL', 0xef4444, 'hard');

        // Sección de Estadísticas
        this.createStats();
    }

    createButton(x, y, text, color, difficulty) {
        const width = 650;
        const height = 120;
        const radius = 24; // Controla qué tan redondeado es el botón

        // 1. Dibujar el fondo redondeado del botón
        const bg = this.add.graphics();
        bg.fillStyle(color, 1);
        bg.fillRoundedRect(x - width / 2, y - height / 2, width, height, radius);

        // 2. Añadir el texto encima
        this.add.text(x, y, text, {
            fontFamily: 'sans-serif',
            fontSize: '48px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // 3. Crear una zona interactiva invisible del mismo tamaño para el clic
        const zone = this.add.zone(x, y, width, height).setInteractive({ useHandCursor: true });

        zone.on('pointerdown', () => {
            // En lugar de ir directo a Game, pasamos por Preloader para mostrar el mensaje de generación
            this.scene.start('Preloader', { difficulty });
        });
    }

    createStats() {
        const stats = StatsManager.getStats();

        // Título de Estadísticas
        this.add.text(540, 1080, '📊 MIS ESTADÍSTICAS', {
            fontFamily: 'sans-serif',
            fontSize: '50px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Tarjeta contenedora REDONDEADA para las estadísticas
        const statsW = 900;
        const statsH = 480;
        const statsX = 540;
        const statsY = 1380;
        const statsRadius = 32; // Esquinas más suaves para la tarjeta grande

        const statsBg = this.add.graphics();
        // Relleno oscuro semi-transparente
        statsBg.fillStyle(0x0f172a, 0.8);
        statsBg.fillRoundedRect(statsX - statsW / 2, statsY - statsH / 2, statsW, statsH, statsRadius);
        // Borde gris azulado
        statsBg.lineStyle(4, 0x334155, 1);
        statsBg.strokeRoundedRect(statsX - statsW / 2, statsY - statsH / 2, statsW, statsH, statsRadius);

        const formatTime = (sec) => {
            if (!sec) return '--:--';
            const m = Math.floor(sec / 60).toString().padStart(2, '0');
            const s = (sec % 60).toString().padStart(2, '0');
            return `${m}:${s}`;
        };

        const diffs = [
            { label: 'FÁCIL', key: 'easy', color: '#4ade80', y: 1220 },
            { label: 'MEDIO', key: 'medium', color: '#facc15', y: 1380 },
            { label: 'DIFÍCIL', key: 'hard', color: '#f87171', y: 1540 }
        ];

        diffs.forEach(d => {
            const data = stats[d.key] || { played: 0, won: 0, bestTime: null };

            // Nombre de dificultad
            this.add.text(140, d.y, d.label, {
                fontFamily: 'sans-serif',
                fontSize: '46px',
                color: d.color,
                fontStyle: 'bold'
            }).setOrigin(0, 0.5);

            // Victorias
            this.add.text(480, d.y, `🏆 ${data.won}`, {
                fontFamily: 'sans-serif',
                fontSize: '50px',
                color: '#e2e8f0'
            }).setOrigin(0, 0.5);

            // Record
            this.add.text(720, d.y, `⏱️ ${formatTime(data.bestTime)}`, {
                fontFamily: 'sans-serif',
                fontSize: '50px',
                color: '#38bdf8'
            }).setOrigin(0, 0.5);
        });
    }
}
