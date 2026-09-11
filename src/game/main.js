import * as Phaser from 'phaser';
import { Boot } from './scenes/Boot';
import { Preloader } from './scenes/Preloader';
import { MainMenu } from './scenes/MainMenu';
import { Game } from './scenes/Game';
import { AdMob } from '@capacitor-community/admob';

const config = {
    type: Phaser.AUTO,
    width: 1080,
    height: 2280,
    parent: 'game-container',
    backgroundColor: '#1e293b',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [Boot, Preloader, MainMenu, Game]
};

let gameInstance = null;

export async function startApp() {
    try {
        await AdMob.initialize({
            initializeForTesting: true,
        });
        console.log('AdMob inicializado');
    } catch (error) {
        console.error('Error al inicializar AdMob:', error);
    }

    gameInstance = new Phaser.Game(config);
    return gameInstance;
}

export default startApp;