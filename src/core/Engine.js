import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

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
        this.currentScene = null;
        this.isPaused = false;

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

        // Lumières
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0x00ffff, 1);
        pointLight.position.set(5, 5, 5);
        this.scene.add(pointLight);

        const pointLight2 = new THREE.PointLight(0xff00ff, 1);
        pointLight2.position.set(-5, -5, 5);
        this.scene.add(pointLight2);
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

        // Charger la nouvelle scène
        this.currentScene = sceneObject;
        if (this.currentScene.setup) {
            this.currentScene.setup(this.scene);
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        if (!this.isPaused) {
            // Mettre à jour la scène courante
            if (this.currentScene && this.currentScene.update) {
                this.currentScene.update();
            }

            // Mettre à jour les contrôles
            this.controls.update();
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
}
