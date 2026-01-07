import * as THREE from 'three';
import { Scene } from './Scene.js';
import { PhysicalState, FormationTimeline } from '../core/PhysicalState.js';

/**
 * WaveScene - Interférences et phénomènes ondulatoires
 *
 * Visualisation des ondes, interférences, résonance
 * États : Onde simple → Deux sources → Interférences → Ondes stationnaires → Battements
 */
export class WaveScene extends Scene {
    constructor() {
        super(
            'Ondes',
            'Interférences et superposition d\'ondes'
        );

        this.states = this.createPhysicalStates();
        this.currentStateIndex = 0;
        this.formationTimeline = this.createFormationTimeline();

        // Objets
        this.waveSurface = null;
        this.sources = [];
        this.particles = [];

        // Paramètres
        this.gridSize = 80;
        this.time = 0;
        this.waveSpeed = 2;
    }

    createPhysicalStates() {
        return [
            new PhysicalState(
                'Onde Simple',
                'Une source ponctuelle émettant des ondes circulaires',
                {
                    pattern: 'single',
                    sources: 1,
                    frequency: 1
                }
            ),
            new PhysicalState(
                'Deux Sources',
                'Deux sources synchrones',
                {
                    pattern: 'double',
                    sources: 2,
                    frequency: 1,
                    separation: 3
                }
            ),
            new PhysicalState(
                'Interférences',
                'Interférences constructives et destructives (Fentes de Young)',
                {
                    pattern: 'interference',
                    sources: 2,
                    frequency: 2,
                    separation: 2.5
                }
            ),
            new PhysicalState(
                'Ondes Stationnaires',
                'Résonance - modes propres',
                {
                    pattern: 'standing',
                    sources: 0,
                    frequency: 1.5,
                    modeX: 3,
                    modeY: 2
                }
            ),
            new PhysicalState(
                'Battements',
                'Deux fréquences proches créent des battements',
                {
                    pattern: 'beats',
                    sources: 2,
                    frequency1: 1.8,
                    frequency2: 2.2,
                    separation: 3
                }
            )
        ];
    }

    createFormationTimeline() {
        const timeline = new FormationTimeline();

        timeline.addStage('Onde Simple', 3, this.states[0]);
        timeline.addStage('Deux Sources', 3, this.states[1]);
        timeline.addStage('Interférences', 4, this.states[2]);
        timeline.addStage('Ondes Stationnaires', 3, this.states[3]);
        timeline.addStage('Battements', 3, this.states[4]);

        timeline.loopMode = 'loop';
        return timeline;
    }

    init() {
        this.createWaveSurface();
        this.createSourceMarkers();
        this.createWaveParticles();
        this.maxLevels = this.states.length;

        this.displayMode = 'final';
        this.currentStateIndex = 2; // Interférences par défaut
    }

    createWaveSurface() {
        const geometry = new THREE.PlaneGeometry(10, 10, this.gridSize - 1, this.gridSize - 1);

        const material = new THREE.MeshPhongMaterial({
            color: 0x00AAFF,
            wireframe: false,
            side: THREE.DoubleSide,
            shininess: 100,
            transparent: true,
            opacity: 0.8
        });

        this.waveSurface = new THREE.Mesh(geometry, material);
        this.waveSurface.rotation.x = -Math.PI / 2;

        // Sauvegarder positions originales
        const positions = geometry.attributes.position.array;
        geometry.userData.originalPositions = new Float32Array(positions);

        this.scene.add(this.waveSurface);
        this.objects.push(this.waveSurface);
    }

    createSourceMarkers() {
        // Marqueurs pour les sources d'ondes
        for (let i = 0; i < 4; i++) {
            const geometry = new THREE.SphereGeometry(0.2, 16, 16);
            const material = new THREE.MeshBasicMaterial({
                color: 0xFFFF00,
                transparent: true,
                opacity: 0.8
            });

            const source = new THREE.Mesh(geometry, material);
            source.visible = false;

            this.scene.add(source);
            this.objects.push(source);
            this.sources.push(source);
        }
    }

    createWaveParticles() {
        // Particules pour visualiser les crêtes
        const particleCount = 200;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            positions[i3] = (Math.random() - 0.5) * 10;
            positions[i3 + 1] = 0;
            positions[i3 + 2] = (Math.random() - 0.5) * 10;

            colors[i3] = 1;
            colors[i3 + 1] = 1;
            colors[i3 + 2] = 1;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });

        const particles = new THREE.Points(geometry, material);
        this.scene.add(particles);
        this.objects.push(particles);
        this.particles.push(particles);
    }

    updateWaveSurface(params) {
        const positions = this.waveSurface.geometry.attributes.position.array;
        const original = this.waveSurface.geometry.userData.originalPositions;

        const pattern = params.pattern;
        const t = this.time;

        for (let i = 0; i < positions.length; i += 3) {
            const x = original[i];
            const z = original[i + 2];

            let height = 0;

            switch (pattern) {
                case 'single':
                    height = this.calculateSingleSource(x, z, 0, 0, t, params.frequency);
                    break;

                case 'double':
                case 'interference':
                case 'beats':
                    const sep = params.separation || 2;
                    const freq1 = params.frequency1 || params.frequency;
                    const freq2 = params.frequency2 || params.frequency;

                    const h1 = this.calculateSingleSource(x, z, -sep/2, 0, t, freq1);
                    const h2 = this.calculateSingleSource(x, z, sep/2, 0, t, freq2);

                    height = h1 + h2;
                    break;

                case 'standing':
                    const mx = params.modeX || 1;
                    const my = params.modeY || 1;
                    height = Math.sin(x * mx * Math.PI / 5) *
                             Math.sin(z * my * Math.PI / 5) *
                             Math.cos(t * params.frequency * 2);
                    break;
            }

            positions[i + 1] = height * 0.5;
        }

        this.waveSurface.geometry.attributes.position.needsUpdate = true;
        this.waveSurface.geometry.computeVertexNormals();

        // Couleur selon amplitude
        const colors = new Float32Array(positions.length);
        for (let i = 0; i < positions.length; i += 3) {
            const amplitude = positions[i + 1];
            const normalized = (amplitude + 0.5) / 1.0;

            const hue = 0.55 + normalized * 0.2; // Bleu à cyan
            const color = new THREE.Color().setHSL(hue, 1, 0.5);

            colors[i] = color.r;
            colors[i + 1] = color.g;
            colors[i + 2] = color.b;
        }

        if (!this.waveSurface.geometry.attributes.color) {
            this.waveSurface.geometry.setAttribute('color',
                new THREE.BufferAttribute(colors, 3));
            this.waveSurface.material.vertexColors = true;
        } else {
            this.waveSurface.geometry.attributes.color.array.set(colors);
            this.waveSurface.geometry.attributes.color.needsUpdate = true;
        }
    }

    calculateSingleSource(x, z, sx, sz, t, frequency) {
        const dx = x - sx;
        const dz = z - sz;
        const distance = Math.sqrt(dx * dx + dz * dz);

        if (distance < 0.01) return 0;

        const wavelength = this.waveSpeed / frequency;
        const k = 2 * Math.PI / wavelength;
        const omega = 2 * Math.PI * frequency;

        // Onde circulaire avec atténuation
        const amplitude = 1 / (1 + distance * 0.5);
        return amplitude * Math.sin(k * distance - omega * t);
    }

    updateSourcePositions(params) {
        // Cacher toutes les sources
        this.sources.forEach(s => s.visible = false);

        const pattern = params.pattern;

        if (pattern === 'single') {
            this.sources[0].visible = true;
            this.sources[0].position.set(0, 0, 0);
        } else if (pattern === 'double' || pattern === 'interference' || pattern === 'beats') {
            const sep = params.separation || 2;
            this.sources[0].visible = true;
            this.sources[0].position.set(-sep/2, 0, 0);
            this.sources[1].visible = true;
            this.sources[1].position.set(sep/2, 0, 0);
        }

        // Animation pulse des sources
        this.sources.forEach(source => {
            if (source.visible) {
                const pulse = 1 + Math.sin(this.time * 5) * 0.3;
                source.scale.setScalar(pulse);
            }
        });
    }

    updateParticles() {
        const positions = this.particles[0].geometry.attributes.position.array;
        const colors = this.particles[0].geometry.attributes.color.array;

        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const z = positions[i + 2];

            // Hauteur basée sur l'onde
            const currentState = this.states[this.currentStateIndex];
            const params = currentState.parameters;

            let height = 0;
            if (params.pattern === 'single') {
                height = this.calculateSingleSource(x, z, 0, 0, this.time, params.frequency);
            } else if (params.pattern === 'double' || params.pattern === 'interference') {
                const sep = params.separation || 2;
                height = this.calculateSingleSource(x, z, -sep/2, 0, this.time, params.frequency) +
                        this.calculateSingleSource(x, z, sep/2, 0, this.time, params.frequency);
            }

            positions[i + 1] = height * 0.5;

            // Couleur selon amplitude
            const normalized = (height + 1) / 2;
            const hue = 0.55 + normalized * 0.3;
            const color = new THREE.Color().setHSL(hue, 1, 0.7);

            colors[i] = color.r;
            colors[i + 1] = color.g;
            colors[i + 2] = color.b;
        }

        this.particles[0].geometry.attributes.position.needsUpdate = true;
        this.particles[0].geometry.attributes.color.needsUpdate = true;
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

        const params = currentState.parameters;

        this.updateWaveSurface(params);
        this.updateSourcePositions(params);
        this.updateParticles();
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
