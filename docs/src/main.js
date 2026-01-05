import { Engine } from './core/Engine.js';
import { TesseractScene } from './scenes/TesseractScene.js';

/**
 * Application principale
 */
class App {
    constructor() {
        this.engine = null;
        this.scenes = new Map();
        this.currentSceneName = 'tesseract';

        this.init();
    }

    init() {
        // Initialiser le moteur de rendu
        const container = document.getElementById('canvas-container');
        this.engine = new Engine(container);

        // Créer les scènes disponibles
        this.registerScene('tesseract', new TesseractScene());

        // Scènes à venir (placeholders)
        // this.registerScene('blackhole', new BlackHoleScene());
        // this.registerScene('galaxy', new GalaxyScene());

        // Charger la scène initiale
        this.loadScene('tesseract');

        // Configurer les contrôles UI
        this.setupUI();
    }

    registerScene(name, sceneObject) {
        this.scenes.set(name, sceneObject);
    }

    loadScene(name) {
        const scene = this.scenes.get(name);
        if (!scene) {
            console.error(`Scene "${name}" not found`);
            return;
        }

        this.currentSceneName = name;
        this.engine.setScene(scene);
        this.updateUI();
    }

    setupUI() {
        // Navigation entre scènes
        const sceneButtons = document.querySelectorAll('[data-scene]');
        sceneButtons.forEach(button => {
            button.addEventListener('click', () => {
                const sceneName = button.dataset.scene;

                // Vérifier si la scène existe
                if (!this.scenes.has(sceneName)) {
                    alert(`La scène "${sceneName}" n\'est pas encore implémentée. À venir !`);
                    return;
                }

                // Charger la scène
                this.loadScene(sceneName);

                // Mettre à jour l'UI
                sceneButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
            });
        });

        // Contrôles de niveau
        document.getElementById('prev-level').addEventListener('click', () => {
            const scene = this.scenes.get(this.currentSceneName);
            if (scene) {
                scene.prevLevel();
                this.updateUI();
            }
        });

        document.getElementById('next-level').addEventListener('click', () => {
            const scene = this.scenes.get(this.currentSceneName);
            if (scene) {
                scene.nextLevel();
                this.updateUI();
            }
        });

        // Raccourcis clavier
        window.addEventListener('keydown', (e) => {
            const scene = this.scenes.get(this.currentSceneName);
            if (!scene) return;

            switch(e.key) {
                case 'ArrowLeft':
                    scene.prevLevel();
                    this.updateUI();
                    break;
                case 'ArrowRight':
                    scene.nextLevel();
                    this.updateUI();
                    break;
            }
        });
    }

    updateUI() {
        const scene = this.scenes.get(this.currentSceneName);
        if (!scene) return;

        const info = scene.getInfo();

        document.getElementById('scene-title').textContent = info.name;
        document.getElementById('scene-description').textContent = info.description;
        document.getElementById('current-level').textContent = info.level;
    }
}

// Démarrer l'application
window.addEventListener('DOMContentLoaded', () => {
    new App();
});
