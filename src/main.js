import { Engine } from './core/Engine.js';
import { TesseractSceneEvolved } from './scenes/TesseractSceneEvolved.js';
import { BlackHoleScene } from './scenes/BlackHoleScene.js';

/**
 * Application principale - Système évolutif
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

        // Créer les scènes avec système de formation
        this.registerScene('tesseract', new TesseractSceneEvolved());
        this.registerScene('blackhole', new BlackHoleScene());

        // Scènes à venir
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

        // Ne PAS lancer automatiquement la formation
        // L'utilisateur choisit le mode via l'UI
    }

    setupUI() {
        // Navigation entre scènes
        const sceneButtons = document.querySelectorAll('[data-scene]');
        sceneButtons.forEach(button => {
            button.addEventListener('click', () => {
                const sceneName = button.dataset.scene;

                // Vérifier si la scène existe
                if (!this.scenes.has(sceneName)) {
                    alert(`La scène "${sceneName}" n'est pas encore implémentée. À venir !`);
                    return;
                }

                // Charger la scène
                this.loadScene(sceneName);

                // Mettre à jour l'UI
                sceneButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
            });
        });

        // Contrôles de mode
        document.getElementById('mode-final').addEventListener('click', () => {
            const scene = this.scenes.get(this.currentSceneName);
            if (scene && scene.setDisplayMode) {
                scene.setDisplayMode('final');
                this.updateModeUI('final');
            }
        });

        document.getElementById('mode-formation').addEventListener('click', () => {
            const scene = this.scenes.get(this.currentSceneName);
            if (scene && scene.setDisplayMode) {
                scene.setDisplayMode('formation');
                this.updateModeUI('formation');
            }
        });

        // Contrôles d'état physique
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

        // Contrôles de formation
        document.getElementById('play-formation').addEventListener('click', () => {
            const scene = this.scenes.get(this.currentSceneName);
            if (scene && scene.playFormation) {
                scene.playFormation();
            }
        });

        document.getElementById('pause-formation').addEventListener('click', () => {
            const scene = this.scenes.get(this.currentSceneName);
            if (scene && scene.pauseFormation) {
                scene.pauseFormation();
            }
        });

        document.getElementById('reset-formation').addEventListener('click', () => {
            const scene = this.scenes.get(this.currentSceneName);
            if (scene && scene.resetFormation) {
                scene.resetFormation();
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
                case 'f':
                case 'F':
                    if (scene.playFormation) {
                        scene.playFormation();
                    }
                    break;
                case 'r':
                case 'R':
                    if (scene.resetFormation) {
                        scene.resetFormation();
                    }
                    break;
            }
        });

        // Mise à jour périodique de l'UI pour la progression de formation
        setInterval(() => this.updateFormationInfo(), 100);
    }

    updateUI() {
        const scene = this.scenes.get(this.currentSceneName);
        if (!scene) return;

        const info = scene.getInfo();

        document.getElementById('scene-title').textContent = info.name;
        document.getElementById('scene-description').textContent = info.description;
        document.getElementById('current-level').textContent = info.level;

        this.updateFormationInfo();
    }

    updateFormationInfo() {
        const scene = this.scenes.get(this.currentSceneName);
        if (!scene || !scene.getFormationStageName) return;

        const stageName = scene.getFormationStageName();
        const info = scene.getInfo();

        document.getElementById('formation-stage').textContent = stageName || '-';
        document.getElementById('formation-progress').textContent = info.formationProgress || '0%';
    }

    updateModeUI(mode) {
        // Mettre à jour les boutons actifs
        const buttons = document.querySelectorAll('.mode-buttons button');
        buttons.forEach(btn => btn.classList.remove('active'));

        if (mode === 'final') {
            document.getElementById('mode-final').classList.add('active');
            document.getElementById('formation-controls').style.display = 'none';
        } else {
            document.getElementById('mode-formation').classList.add('active');
            document.getElementById('formation-controls').style.display = 'block';
        }
    }
}

// Démarrer l'application
window.addEventListener('DOMContentLoaded', () => {
    new App();
});
