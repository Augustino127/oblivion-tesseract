import * as THREE from 'three';
import { Scene } from './Scene.js';
import { PhysicalState, FormationTimeline } from '../core/PhysicalState.js';

/**
 * FractalScene - Ensemble de Mandelbrot et autres fractales
 *
 * Visualisation de l'infinie complexité des fractales mathématiques
 * États : Point → Julia Set → Mandelbrot simple → Mandelbrot zoom → Burning Ship
 */
export class FractalScene extends Scene {
    constructor() {
        super(
            'Fractales',
            'Infinie complexité depuis des règles simples'
        );

        this.states = this.createPhysicalStates();
        this.currentStateIndex = 0;
        this.formationTimeline = this.createFormationTimeline();

        // Objets
        this.fractalPlane = null;
        this.fractalTexture = null;
        this.canvas = null;
        this.ctx = null;

        // Paramètres fractale
        this.resolution = 512;
        this.maxIterations = 100;
        this.zoom = 1;
        this.centerX = -0.5;
        this.centerY = 0;
        this.autoZoom = false;
        this.zoomTarget = 1;

        this.time = 0;
    }

    createPhysicalStates() {
        return [
            new PhysicalState(
                'Point Simple',
                'Un seul point dans le plan complexe',
                {
                    fractalType: 'point',
                    maxIter: 10,
                    zoom: 1
                }
            ),
            new PhysicalState(
                'Julia Set',
                'Ensemble de Julia - c = -0.4 + 0.6i',
                {
                    fractalType: 'julia',
                    maxIter: 50,
                    zoom: 1,
                    cx: -0.4,
                    cy: 0.6
                }
            ),
            new PhysicalState(
                'Mandelbrot',
                'L\'ensemble de Mandelbrot classique',
                {
                    fractalType: 'mandelbrot',
                    maxIter: 100,
                    zoom: 1,
                    centerX: -0.5,
                    centerY: 0
                }
            ),
            new PhysicalState(
                'Zoom Infini',
                'Zoom dans la complexité auto-similaire',
                {
                    fractalType: 'mandelbrot',
                    maxIter: 200,
                    zoom: 100,
                    centerX: -0.7463,
                    centerY: 0.1102,
                    autoZoom: true
                }
            ),
            new PhysicalState(
                'Burning Ship',
                'Fractale "Burning Ship" - variation de Mandelbrot',
                {
                    fractalType: 'burningship',
                    maxIter: 100,
                    zoom: 1,
                    centerX: -0.5,
                    centerY: -0.5
                }
            )
        ];
    }

    createFormationTimeline() {
        const timeline = new FormationTimeline();

        timeline.addStage('Point Simple', 2, this.states[0]);
        timeline.addStage('Julia Set', 3, this.states[1]);
        timeline.addStage('Mandelbrot', 3, this.states[2]);
        timeline.addStage('Zoom Infini', 5, this.states[3]);
        timeline.addStage('Burning Ship', 3, this.states[4]);

        timeline.loopMode = 'loop';
        return timeline;
    }

    init() {
        this.createCanvas();
        this.createFractalPlane();
        this.maxLevels = this.states.length;

        this.displayMode = 'final';
        this.currentStateIndex = 2; // Mandelbrot par défaut

        this.renderFractal();
    }

    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.resolution;
        this.canvas.height = this.resolution;
        this.ctx = this.canvas.getContext('2d');
    }

    createFractalPlane() {
        const geometry = new THREE.PlaneGeometry(10, 10);

        this.fractalTexture = new THREE.CanvasTexture(this.canvas);
        this.fractalTexture.needsUpdate = true;

        const material = new THREE.MeshBasicMaterial({
            map: this.fractalTexture,
            side: THREE.DoubleSide
        });

        this.fractalPlane = new THREE.Mesh(geometry, material);
        this.scene.add(this.fractalPlane);
        this.objects.push(this.fractalPlane);
    }

    renderFractal() {
        const state = this.states[this.currentStateIndex];
        if (!state) return;

        const params = state.parameters;
        const type = params.fractalType;

        const imageData = this.ctx.createImageData(this.resolution, this.resolution);
        const data = imageData.data;

        const maxIter = params.maxIter || this.maxIterations;
        const zoom = params.zoom || this.zoom;
        const cx = params.centerX !== undefined ? params.centerX : this.centerX;
        const cy = params.centerY !== undefined ? params.centerY : this.centerY;

        for (let py = 0; py < this.resolution; py++) {
            for (let px = 0; px < this.resolution; px++) {
                const x0 = ((px / this.resolution) - 0.5) * 4 / zoom + cx;
                const y0 = ((py / this.resolution) - 0.5) * 4 / zoom + cy;

                let iteration;
                if (type === 'julia') {
                    iteration = this.calculateJulia(x0, y0, params.cx, params.cy, maxIter);
                } else if (type === 'burningship') {
                    iteration = this.calculateBurningShip(x0, y0, maxIter);
                } else if (type === 'point') {
                    iteration = maxIter; // Tout noir pour commencer
                } else {
                    // Mandelbrot par défaut
                    iteration = this.calculateMandelbrot(x0, y0, maxIter);
                }

                const idx = (py * this.resolution + px) * 4;
                const color = this.iterationToColor(iteration, maxIter);

                data[idx] = color.r;
                data[idx + 1] = color.g;
                data[idx + 2] = color.b;
                data[idx + 3] = 255;
            }
        }

        this.ctx.putImageData(imageData, 0, 0);
        this.fractalTexture.needsUpdate = true;
    }

    calculateMandelbrot(x0, y0, maxIter) {
        let x = 0;
        let y = 0;
        let iteration = 0;

        while (x * x + y * y <= 4 && iteration < maxIter) {
            const xTemp = x * x - y * y + x0;
            y = 2 * x * y + y0;
            x = xTemp;
            iteration++;
        }

        return iteration;
    }

    calculateJulia(x0, y0, cx, cy, maxIter) {
        let x = x0;
        let y = y0;
        let iteration = 0;

        while (x * x + y * y <= 4 && iteration < maxIter) {
            const xTemp = x * x - y * y + cx;
            y = 2 * x * y + cy;
            x = xTemp;
            iteration++;
        }

        return iteration;
    }

    calculateBurningShip(x0, y0, maxIter) {
        let x = 0;
        let y = 0;
        let iteration = 0;

        while (x * x + y * y <= 4 && iteration < maxIter) {
            const xTemp = x * x - y * y + x0;
            y = Math.abs(2 * x * y) + y0; // Valeur absolue !
            x = Math.abs(xTemp);
            iteration++;
        }

        return iteration;
    }

    iterationToColor(iteration, maxIter) {
        if (iteration === maxIter) {
            return { r: 0, g: 0, b: 0 }; // Noir pour l'intérieur
        }

        // Smooth coloring avec gradients
        const t = iteration / maxIter;
        const hue = (t * 360 + this.time * 20) % 360;
        const saturation = 1.0;
        const lightness = 0.5 + Math.sin(t * Math.PI) * 0.3;

        return this.hslToRgb(hue, saturation, lightness);
    }

    hslToRgb(h, s, l) {
        h = h / 360;
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs((h * 6) % 2 - 1));
        const m = l - c / 2;

        let r, g, b;
        if (h < 1 / 6) {
            [r, g, b] = [c, x, 0];
        } else if (h < 2 / 6) {
            [r, g, b] = [x, c, 0];
        } else if (h < 3 / 6) {
            [r, g, b] = [0, c, x];
        } else if (h < 4 / 6) {
            [r, g, b] = [0, x, c];
        } else if (h < 5 / 6) {
            [r, g, b] = [x, 0, c];
        } else {
            [r, g, b] = [c, 0, x];
        }

        return {
            r: Math.round((r + m) * 255),
            g: Math.round((g + m) * 255),
            b: Math.round((b + m) * 255)
        };
    }

    update() {
        this.time += 0.016;

        if (this.displayMode === 'formation') {
            this.formationTimeline.update(0.016);
        }

        const currentState = this.displayMode === 'formation'
            ? this.formationTimeline.getCurrentState()
            : this.states[this.currentStateIndex];

        if (!currentState) return;

        // Détection changement d'état
        if (this.lastState !== currentState) {
            this.renderFractal();
            this.lastState = currentState;
        }

        // Auto-zoom si activé
        if (currentState.parameters.autoZoom && this.displayMode === 'formation') {
            this.zoom = 1 + Math.pow(this.time * 0.5, 2);
            this.renderFractal();
        }

        // Rotation légère du plan
        this.fractalPlane.rotation.z = Math.sin(this.time * 0.2) * 0.1;
    }

    setLevel(level) {
        super.setLevel(level);
        this.currentStateIndex = level - 1;
    }

    onLevelChange() {
        const state = this.states[this.currentStateIndex];
        if (state) {
            this.description = state.description;
        }
    }

    onModeChange() {
        if (this.displayMode === 'formation') {
            this.formationTimeline.reset();
            this.formationTimeline.play();
        } else {
            this.formationTimeline.pause();
        }
    }

    playFormation() {
        this.formationTimeline.reset();
        this.formationTimeline.play();
    }

    pauseFormation() {
        this.formationTimeline.pause();
    }

    getFormationProgress() {
        return this.formationTimeline.getProgress();
    }

    getFormationStageName() {
        return this.formationTimeline.getStageName();
    }

    getInfo() {
        const baseInfo = super.getInfo();
        return {
            ...baseInfo,
            currentState: this.states[this.currentStateIndex]?.name,
            formationStage: this.formationTimeline.getStageName(),
            formationProgress: (this.formationTimeline.getProgress() * 100).toFixed(0) + '%'
        };
    }
}
