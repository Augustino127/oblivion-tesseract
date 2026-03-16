import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CinematicCamera } from './CinematicCamera.js';

/**
 * Moteur de rendu 3D principal
 * Gère la scène, caméra, rendu et boucle d'animation
 */
export class Engine {
    constructor(container) {
        this.container = container;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.cinematicCamera = null;
        this.currentScene = null;
        this.isPaused = false;

        // Tracking du temps pour deltaTime
        this.clock = new THREE.Clock();
        this.lastTime = 0;

        this.init();
        this.setupEventListeners();
        this.animate();
    }

    init() {
        // Scène Three.js
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);
        this.scene.fog = new THREE.Fog(0x000000, 10, 50);

        // Caméra
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.z = 5;

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);

        // Controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 2;
        this.controls.maxDistance = 20;

        // Cinematic Camera System
        this.cinematicCamera = new CinematicCamera(this.camera, this.controls);

        // Lumières globales neutres — les scènes ajoutent leurs propres lumières
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
        dirLight.position.set(10, 10, 10);
        this.scene.add(dirLight);
    }

    setupEventListeners() {
        // Redimensionnement
        window.addEventListener('resize', () => this.onResize());

        // Pause avec espace
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                this.isPaused = !this.isPaused;
            }
        });
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    setScene(sceneObject) {
        // Nettoyer l'ancienne scène
        if (this.currentScene) {
            this.currentScene.destroy();
            this.scene.children = this.scene.children.filter(
                child => child instanceof THREE.Light || child.type === 'Fog'
            );
        }

        // Désactiver le mode cinématique si actif
        if (this.cinematicCamera.isActive) {
            this.cinematicCamera.deactivate();
        }

        // Charger la nouvelle scène
        this.currentScene = sceneObject;
        if (this.currentScene.setup) {
            this.currentScene.setup(this.scene);
        }

        // Charger le camera path de la scène (si défini)
        if (this.currentScene.getCinematicPath) {
            const cameraPath = this.currentScene.getCinematicPath();
            if (cameraPath && cameraPath.length > 0) {
                this.cinematicCamera.setKeyframes(cameraPath);
            }
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Calculer deltaTime
        const currentTime = this.clock.getElapsedTime();
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        if (!this.isPaused) {
            // Mettre à jour la caméra cinématique
            this.cinematicCamera.update(deltaTime);

            // Mettre à jour la scène courante
            if (this.currentScene && this.currentScene.update) {
                this.currentScene.update();
            }

            // Mettre à jour les contrôles (si pas en mode cinématique)
            if (!this.cinematicCamera.isActive) {
                this.controls.update();
            }
        }

        // Rendu
        this.renderer.render(this.scene, this.camera);
    }

    getScene() {
        return this.scene;
    }

    getCamera() {
        return this.camera;
    }

    getCinematicCamera() {
        return this.cinematicCamera;
    }

    /**
     * Activer/désactiver le mode cinématique
     */
    toggleCinematicMode() {
        this.cinematicCamera.toggle();
    }

    /**
     * Définir un chemin de caméra pour la scène actuelle
     * @param {Array} keyframes - Tableau de keyframes
     */
    setCameraPath(keyframes) {
        this.cinematicCamera.setKeyframes(keyframes);
    }

    /**
     * Obtenir les infos de la caméra cinématique
     */
    getCinematicInfo() {
        return this.cinematicCamera.getInfo();
    }
}
