import * as Phaser from 'phaser';
import { Scene } from 'phaser';
import { StatsManager } from '../utils/stats';
import { Capacitor } from '@capacitor/core';
import { AdMob, RewardAdPluginEvents } from '@capacitor-community/admob';

// ID de prueba oficial de Google para vídeos recompensados.
// ⚠️ Sustituir por tu Ad Unit ID real de AdMob antes de publicar la app,
// o nunca se mostrarán anuncios reales ni se generarán ingresos.
const REWARD_AD_UNIT_ID = 'ca-app-pub-3940256099942544/5224354917';

export class Game extends Scene {
    constructor() {
        super('Game');
    }

    init(data) {
        this.difficulty = (data && data.difficulty) ? data.difficulty : 'easy';

        // Definir límite de pistas según la dificultad
        const maxHints = { easy: 5, medium: 3, hard: 1 };
        this.hintsRemaining = maxHints[this.difficulty] ?? 3;

        this.cellSize = 108;
        this.startX = (1080 - (108 * 9)) / 2;
        this.startY = 480;

        this.selectedRow = -1;
        this.selectedCol = -1;
        this.seconds = 0;
        this.isPencilMode = false;

        this.notes = Array.from({ length: 9 }, () =>
            Array.from({ length: 9 }, () => new Set())
        );
    }

    create() {
        this.loadLevelData();
        this.createHeader();
        this.createControlsUI();
        this.drawGrid();
        this.renderNumbers();
        this.createNumberPad();
        this.startTimer();

        this.selectionGraphic = this.add.graphics();

        // OJO: AdMob.initialize() ya se ejecuta UNA sola vez al arrancar
        // la app (src/game/main.js). NO debe volver a llamarse aquí: cada
        // vez que se entra a esta escena (cada partida nueva) esto
        // reinicializaba el SDK de anuncios, lo que rompía la carga y el
        // posterior "showRewardVideoAd" (por eso los anuncios fallaban
        // después de la primera partida). Aquí solo precargamos el anuncio.
        this.preloadAd();
    }

    createHeader() {
        // Dimensiones y posición del botón de menú
        const btnX = 160;
        const btnY = 140;
        const btnW = 220;
        const btnH = 80;
        const radius = 20;

        // 1. Dibujar el fondo redondeado del botón Menú
        const menuBtnGfx = this.add.graphics();
        menuBtnGfx.fillStyle(0x334155, 1); // Color original (gris azulado)
        menuBtnGfx.fillRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, radius);

        // 2. Texto del botón
        this.add.text(btnX, btnY, '←  Menú', {
            fontFamily: 'sans-serif',
            fontSize: '44px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // 3. Crear zona invisible para capturar los clics
        const menuBtnZone = this.add.zone(btnX, btnY, btnW, btnH)
            .setInteractive({ useHandCursor: true });

        menuBtnZone.on('pointerdown', () => {
            if (this.timerEvent) this.timerEvent.remove();
            this.scene.start('MainMenu');
        });

        // Etiqueta de dificultad
        this.add.text(540, 140, this.difficulty.toUpperCase(), {
            fontFamily: 'sans-serif',
            fontSize: '50px',
            color: '#38bdf8',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Cronómetro
        this.timerText = this.add.text(900, 140, '00:00', {
            fontFamily: 'sans-serif',
            fontSize: '50px',
            color: '#ffffff'
        }).setOrigin(0.5);
    }
    drawGrid() {
        const graphics = this.add.graphics();
        graphics.fillStyle(0x0f172a, 1);
        graphics.fillRect(this.startX, this.startY, this.cellSize * 9, this.cellSize * 9);

        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                const x = this.startX + c * this.cellSize;
                const y = this.startY + r * this.cellSize;

                const zone = this.add.zone(x, y, this.cellSize, this.cellSize)
                    .setOrigin(0)
                    .setInteractive({ useHandCursor: true });

                zone.on('pointerdown', () => this.selectCell(r, c));
            }
        }

        for (let i = 0; i <= 9; i++) {
            const isThick = i % 3 === 0;
            graphics.lineStyle(isThick ? 6 : 2, isThick ? 0x94a3b8 : 0x334155, 1);

            graphics.strokeLineShape(new Phaser.Geom.Line(
                this.startX, this.startY + i * this.cellSize,
                this.startX + 9 * this.cellSize, this.startY + i * this.cellSize
            ));
            graphics.strokeLineShape(new Phaser.Geom.Line(
                this.startX + i * this.cellSize, this.startY,
                this.startX + i * this.cellSize, this.startY + 9 * this.cellSize
            ));
        }
    }

    renderNumbers() {
        this.textObjects = [];
        this.noteObjects = [];

        for (let r = 0; r < 9; r++) {
            this.textObjects[r] = [];
            this.noteObjects[r] = [];

            for (let c = 0; c < 9; c++) {
                const val = this.board[r][c];
                const x = this.startX + c * this.cellSize + this.cellSize / 2;
                const y = this.startY + r * this.cellSize + this.cellSize / 2;
                const isFixed = this.initialBoard[r][c] !== 0;

                // Texto del número principal
                const txt = this.add.text(x, y, val !== 0 ? val.toString() : '', {
                    fontFamily: 'sans-serif',
                    fontSize: '75px',
                    color: isFixed ? '#ffffff' : '#38bdf8',
                    fontStyle: isFixed ? 'bold' : 'normal'
                }).setOrigin(0.5);

                this.textObjects[r][c] = txt;

                // Contenedor de notas (mini matriz 3x3)
                this.noteObjects[r][c] = {};
                for (let n = 1; n <= 9; n++) {
                    const nx = this.startX + c * this.cellSize + ((n - 1) % 3) * 32 + 22;
                    const ny = this.startY + r * this.cellSize + Math.floor((n - 1) / 3) * 32 + 22;

                    const noteTxt = this.add.text(nx, ny, '', {
                        fontFamily: 'sans-serif',
                        fontSize: '44px',
                        color: '#94a3b8'
                    }).setOrigin(0.5);

                    this.noteObjects[r][c][n] = noteTxt;
                }
            }
        }
    }

    createControlsUI() {
        const y = 350;

        // 1. Botón Borrar
        this.createCircleButton(240, y, '🧹', () => this.clearCell());

        // 2. Botón Lápiz
        this.pencilBtn = this.createCircleButton(540, y, '✏️', () => {
            this.togglePencilMode();
        });

        // 3. Botón Pistas
        this.createHintButton(840, y);
    }

    createCircleButton(x, y, iconEmoji, callback) {
        const radius = 55;

        const bg = this.add.circle(x, y, radius, 0x334155)
            .setInteractive({ useHandCursor: true });
        bg.setStrokeStyle(4, 0x475569);

        const icon = this.add.text(x, y, iconEmoji, {
            fontSize: '44px'
        }).setOrigin(0.5);

        bg.on('pointerdown', callback);

        return { bg, icon };
    }

    togglePencilMode() {
        this.isPencilMode = !this.isPencilMode;

        if (this.isPencilMode) {
            this.pencilBtn.bg.setFillStyle(0x16a34a);
            this.pencilBtn.bg.setStrokeStyle(4, 0x4ade80);
        } else {
            this.pencilBtn.bg.setFillStyle(0x334155);
            this.pencilBtn.bg.setStrokeStyle(4, 0x475569);
        }
    }

    createHintButton(x, y) {
        const radius = 60;

        this.hintBg = this.add.circle(x, y, radius, 0x334155)
            .setInteractive({ useHandCursor: true });
        this.hintBg.setStrokeStyle(4, 0x475569);

        this.add.text(x - 18, y, '💡', {
            fontSize: '38px'
        }).setOrigin(0.5);

        this.hintCountText = this.add.text(x + 22, y + 2, `${this.hintsRemaining}`, {
            fontFamily: 'sans-serif',
            fontSize: '40px',
            color: '#facc15',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.hintBg.on('pointerdown', () => this.giveHint());
    }

    updateHintButtonUI() {
        if (this.hintCountText) {
            this.hintCountText.setText(`${this.hintsRemaining}`);
        }
    }

    clearCell() {
        if (this.selectedRow === -1 || this.selectedCol === -1) return;
        const r = this.selectedRow;
        const c = this.selectedCol;

        if (this.initialBoard[r][c] !== 0) return;

        this.board[r][c] = 0;
        this.textObjects[r][c].setText('');

        for (let n = 1; n <= 9; n++) {
            this.noteObjects[r][c][n].setText('');
        }
        this.notes[r][c].clear();
    }

    createNumberPad() {
        const padStartY = 1600;
        const buttonWidth = 98;
        const gap = 10;
        const totalPadWidth = (buttonWidth * 9) + (gap * 8);
        const padStartX = (1080 - totalPadWidth) / 2;

        for (let i = 1; i <= 9; i++) {
            const x = padStartX + (i - 1) * (buttonWidth + gap) + buttonWidth / 2;

            const btn = this.add.rectangle(x, padStartY, buttonWidth, 140, 0x334155)
                .setInteractive({ useHandCursor: true });

            this.add.text(x, padStartY, i.toString(), {
                fontFamily: 'sans-serif',
                fontSize: '75px',
                color: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            btn.on('pointerdown', () => this.enterNumber(i));
        }
    }

    selectCell(row, col) {
        this.selectedRow = row;
        this.selectedCol = col;

        this.selectionGraphic.clear();

        // 1. Resaltado de Fila y Columna
        this.selectionGraphic.fillStyle(0x334155, 0.35);
        this.selectionGraphic.fillRect(
            this.startX,
            this.startY + row * this.cellSize,
            this.cellSize * 9,
            this.cellSize
        );
        this.selectionGraphic.fillRect(
            this.startX + col * this.cellSize,
            this.startY,
            this.cellSize,
            this.cellSize * 9
        );

        // 2. Resaltado del bloque 3x3
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        this.selectionGraphic.fillStyle(0x38bdf8, 0.12);
        this.selectionGraphic.fillRect(
            this.startX + boxCol * this.cellSize,
            this.startY + boxRow * this.cellSize,
            this.cellSize * 3,
            this.cellSize * 3
        );

        // 3. Borde de la celda activa
        this.selectionGraphic.lineStyle(6, 0x38bdf8, 1);
        const x = this.startX + col * this.cellSize;
        const y = this.startY + row * this.cellSize;
        this.selectionGraphic.strokeRect(x, y, this.cellSize, this.cellSize);
    }

    enterNumber(num) {
        if (this.selectedRow === -1 || this.selectedCol === -1) return;
        const r = this.selectedRow;
        const c = this.selectedCol;

        if (this.initialBoard[r][c] !== 0) return;

        if (this.isPencilMode) {
            const cellNotes = this.notes[r][c];
            if (cellNotes.has(num)) {
                cellNotes.delete(num);
                this.noteObjects[r][c][num].setText('');
            } else {
                cellNotes.add(num);
                this.noteObjects[r][c][num].setText(num.toString());
            }
        } else {
            for (let n = 1; n <= 9; n++) {
                this.noteObjects[r][c][n].setText('');
            }
            this.notes[r][c].clear();

            this.board[r][c] = num;
            const txtObj = this.textObjects[r][c];
            txtObj.setText(num.toString());

            const isCorrect = (num === this.solution[r][c]);
            txtObj.setColor(isCorrect ? '#38bdf8' : '#ef4444');

            this.checkWinCondition();
        }
    }

    giveHint() {
        if (this.hintsRemaining <= 0) {
            this.showAdConfirmationModal();
            return;
        }

        if (this.selectedRow === -1 || this.selectedCol === -1) return;
        const r = this.selectedRow;
        const c = this.selectedCol;

        if (this.initialBoard[r][c] !== 0) return;
        if (this.board[r][c] === this.solution[r][c]) return;

        const correctNum = this.solution[r][c];
        this.board[r][c] = correctNum;

        for (let n = 1; n <= 9; n++) {
            this.noteObjects[r][c][n].setText('');
        }
        this.notes[r][c].clear();

        const txtObj = this.textObjects[r][c];
        txtObj.setText(correctNum.toString());
        txtObj.setColor('#a855f7');

        this.hintsRemaining--;
        this.updateHintButtonUI();

        this.checkWinCondition();
    }

    async showAdConfirmationModal() {
        const modalContainer = this.add.container(0, 0);

        const overlay = this.add.graphics();
        overlay.fillStyle(0x0f172a, 0.85);
        overlay.fillRect(0, 0, 1080, 1920);
        overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, 1080, 1920), Phaser.Geom.Rectangle.Contains);

        const card = this.add.graphics();
        card.fillStyle(0x1e293b, 1);
        card.fillRoundedRect(140, 700, 800, 520, 32);
        card.lineStyle(4, 0x38bdf8, 1);
        card.strokeRoundedRect(140, 700, 800, 520, 32);

        const title = this.add.text(540, 780, '¿Sin pistas?', {
            fontFamily: 'sans-serif',
            fontSize: '52px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const description = this.add.text(540, 870, 'Mira un anuncio para obtener\n1 pista adicional', {
            fontFamily: 'sans-serif',
            fontSize: '36px',
            color: '#94a3b8',
            align: 'center'
        }).setOrigin(0.5);

        const btnWatch = this.add.rectangle(540, 1010, 500, 90, 0x16a34a)
            .setInteractive({ useHandCursor: true });
        const txtWatch = this.add.text(540, 1010, '📺 Ver Anuncio', {
            fontFamily: 'sans-serif',
            fontSize: '36px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const btnCancel = this.add.rectangle(540, 1120, 500, 70, 0x334155)
            .setInteractive({ useHandCursor: true });
        const txtCancel = this.add.text(540, 1120, 'Cancelar', {
            fontFamily: 'sans-serif',
            fontSize: '30px',
            color: '#94a3b8'
        }).setOrigin(0.5);

        modalContainer.add([overlay, card, title, description, btnWatch, txtWatch, btnCancel, txtCancel]);

        btnCancel.on('pointerdown', () => {
            modalContainer.destroy();
        });

        // Acción del botón
        btnWatch.on('pointerdown', async () => {
            txtWatch.setText('Cargando...');
            btnWatch.disableInteractive();

            // MODO NAVEGADOR / PC
            if (!Capacitor.isNativePlatform()) {
                console.warn('[MODO PC] Simulando anuncio bonificado...');
                setTimeout(() => {
                    this.hintsRemaining++;
                    this.updateHintButtonUI();
                    this.giveHint();
                    modalContainer.destroy();
                }, 1000);
                return;
            }

            // MODO MÓVIL ANDROID NATIVO
            // Limpiamos listeners de intentos anteriores para no acumularlos
            // (si no, cada clic sumaba un listener nuevo y una sola
            // recompensa real podía disparar varios "giveHint" a la vez).
            await AdMob.removeAllListeners();

            let rewardGranted = false;
            AdMob.addListener(RewardAdPluginEvents.Rewarded, () => {
                rewardGranted = true;
                this.hintsRemaining++;
                this.updateHintButtonUI();
                this.giveHint();
            });

            try {
                if (!this.isAdReady) {
                    await AdMob.prepareRewardVideoAd({
                        adId: REWARD_AD_UNIT_ID
                    });
                    this.isAdReady = true;
                }

                await AdMob.showRewardVideoAd();
                this.isAdReady = false;
                modalContainer.destroy();

                if (!rewardGranted) {
                    // El usuario cerró el anuncio antes de terminar: no hay recompensa.
                    console.warn('Anuncio cerrado sin completar, no se otorga recompensa.');
                }

                // Precargamos el siguiente para que la próxima vez sea instantáneo.
                this.preloadAd();

            } catch (error) {
                console.error('Error AdMob:', error);
                // 🔧 TEMPORAL PARA DEPURAR: mostramos el error real de AdMob
                // en vez del mensaje genérico, para saber la causa exacta
                // (sin relleno, red, timeout...). Revertir antes de publicar.
                alert('Error AdMob (debug): ' + JSON.stringify(error, Object.getOwnPropertyNames(error)));
                txtWatch.setText('📺 Ver Anuncio');
                btnWatch.setInteractive();
                this.isAdReady = false;
            }
        });
    }

    async preloadAd() {
        if (!Capacitor.isNativePlatform()) return;

        try {
            await AdMob.prepareRewardVideoAd({
                adId: REWARD_AD_UNIT_ID
            });
            this.isAdReady = true;
        } catch (e) {
            console.error('Error precargando anuncio:', e);
            this.isAdReady = false;
        }
    }

    startTimer() {
        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.seconds++;
                const mins = String(Math.floor(this.seconds / 60)).padStart(2, '0');
                const secs = String(this.seconds % 60).padStart(2, '0');
                if (this.timerText) this.timerText.setText(`${mins}:${secs}`);
            },
            loop: true
        });
    }

    loadLevelData() {
        const baseSolution = [
            [1, 2, 3, 4, 5, 6, 7, 8, 9],
            [4, 5, 6, 7, 8, 9, 1, 2, 3],
            [7, 8, 9, 1, 2, 3, 4, 5, 6],
            [2, 3, 1, 5, 6, 4, 8, 9, 7],
            [5, 6, 4, 8, 9, 7, 2, 3, 1],
            [8, 9, 7, 2, 3, 1, 5, 6, 4],
            [3, 1, 2, 6, 4, 5, 9, 7, 8],
            [6, 4, 5, 9, 7, 8, 3, 1, 2],
            [9, 7, 8, 3, 1, 2, 6, 4, 5]
        ];

        this.solution = this.shuffleBoard(baseSolution);
        this.board = JSON.parse(JSON.stringify(this.solution));

        const removals = { easy: 30, medium: 45, hard: 55 }[this.difficulty] || 30;

        let count = 0;
        while (count < removals) {
            const r = Math.floor(Math.random() * 9);
            const c = Math.floor(Math.random() * 9);
            if (this.board[r][c] !== 0) {
                this.board[r][c] = 0;
                count++;
            }
        }

        this.initialBoard = JSON.parse(JSON.stringify(this.board));
    }

    shuffleBoard(board) {
        let result = JSON.parse(JSON.stringify(board));
        const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                result[r][c] = nums[result[r][c] - 1];
            }
        }
        return result;
    }

    checkWinCondition() {
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (this.board[r][c] !== this.solution[r][c]) return;
            }
        }

        if (this.timerEvent) this.timerEvent.remove();
        StatsManager.saveWin(this.difficulty, this.seconds);
        this.showWinModal();
    }

    showWinModal() {
        const overlay = this.add.graphics();
        overlay.fillStyle(0x0f172a, 0.85);
        overlay.fillRect(0, 0, 1080, 1920);

        const card = this.add.graphics();
        card.fillStyle(0x1e293b, 1);
        card.fillRoundedRect(140, 660, 800, 600, 32);
        card.lineStyle(4, 0x38bdf8, 1);
        card.strokeRoundedRect(140, 660, 800, 600, 32);

        this.add.text(540, 750, '🏆', { fontSize: '100px' }).setOrigin(0.5);

        this.add.text(540, 870, '¡VICTORIA!', {
            fontFamily: 'sans-serif',
            fontSize: '64px',
            color: '#4ade80',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const finalTime = this.timerText ? this.timerText.text : '00:00';
        this.add.text(540, 960, `Tiempo: ${finalTime}`, {
            fontFamily: 'sans-serif',
            fontSize: '50px',
            color: '#f8fafc'
        }).setOrigin(0.5);

        const btnMenu = this.add.rectangle(540, 1120, 500, 110, 0x38bdf8)
            .setInteractive({ useHandCursor: true });

        this.add.text(540, 1120, 'Volver al Menú', {
            fontFamily: 'sans-serif',
            fontSize: '50px',
            color: '#0f172a',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        btnMenu.on('pointerdown', () => this.scene.start('MainMenu'));
    }
}