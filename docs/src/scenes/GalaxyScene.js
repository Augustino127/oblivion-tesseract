import * as THREE from 'three';
import { Scene } from './Scene.js';
import { PhysicalState, FormationTimeline } from '../core/PhysicalState.js';

/**
 * Galaxie Spirale - Formation et évolution
 *
 * Simulation N-corps simplifiée montrant :
 * - Effondrement gravitationnel
 * - Formation du disque
 * - Apparition des bras spiraux
 * - Rotation différentielle
 *
 * Lien avec Fibonacci : Les bras spiraux suivent une spirale logarithmique !
 */
export class GalaxyScene extends Scene {
    constructor() {
        super(
            'Galaxie Spirale',
            'Formation d\'une galaxie - Le même pattern que la spirale d\'or à l\'échelle cosmique'
        );

        this.states = this.createPhysicalStates();
        this.currentStateIndex = 0;
        this.formationTimeline = this.createFormationTimeline();

        // Paramètres physiques
        this.particleCount = 5000;
        this.particles = null;
        this.velocities = [];
        this.masses = [];

        // Constantes
        this.G = 0.1; // Constante gravitationnelle (simplifiée)
        this.phi = (1 + Math.sqrt(5)) / 2; // Nombre d'or pour les bras

        this.time = 0;
        this.formationProgress = 0;
    }

    createPhysicalStates() {
        return [
            new PhysicalState(
                'Nuage Primordial',
                'Distribution uniforme de gaz et poussières',
                {
                    distribution: 'uniform',
                    rotation: 0,
                    spiralArms: 0,
                    collapse: 0
                }
            ),
            new PhysicalState(
                'Effondrement',
                'Contraction gravitationnelle - Le gaz s\'effondre vers le centre',
                {
                    distribution: 'collapsing',
                    rotation: 0.3,
                    spiralArms: 0,
                    collapse: 0.5
                }
            ),
            new PhysicalState(
                'Formation du Disque',
                'Conservation du moment angulaire - Formation d\'un disque rotatif',
                {
                    distribution: 'disk',
                    rotation: 0.7,
                    spiralArms: 0,
                    collapse: 0.9
                }
            ),
            new PhysicalState(
                'Galaxie Spirale',
                'Bras spiraux logarithmiques - Pattern universel à l\'échelle cosmique',
                {
                    distribution: 'spiral',
                    rotation: 1.0,
                    spiralArms: 2,
                    collapse: 1.0
                }
            )
        ];
    }

    createFormationTimeline() {
        const timeline = new FormationTimeline();

        timeline.addStage('Nuage Primordial', 2, this.states[0], {
            onUpdate: (p) => { this.formationProgress = p * 0.2; }
        });

        timeline.addStage('Effondrement', 4, this.states[1], {
            onUpdate: (p) => { this.formationProgress = 0.2 + p * 0.3; }
        });

        timeline.addStage('Formation Disque', 3, this.states[2], {
            onUpdate: (p) => { this.formationProgress = 0.5 + p * 0.3; }
        });

        timeline.addStage('Galaxie Spirale', 5, this.states[3], {
            onUpdate: (p) => { this.formationProgress = 0.8 + p * 0.2; }
        });

        timeline.loopMode = 'loop';
        return timeline;
    }

    init() {
        this.createParticleSystem();
        this.maxLevels = this.states.length;

        this.displayMode = 'final';
        this.formationProgress = 1.0;
    }

    createParticleSystem() {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.particleCount * 3);
        const colors = new Float32Array(this.particleCount * 3);
        const sizes = new Float32Array(this.particleCount);

        // Initialiser en distribution uniforme
        for (let i = 0; i < this.particleCount; i++) {
            // Position initiale sphérique
            const r = Math.random() * 10;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = r * Math.cos(phi) * 0.3; // Aplatir un peu

            // Couleur selon la distance (bleu au centre, rouge aux bords)
            const temp = 1 - r / 10;
            colors[i * 3] = Math.max(0.3, temp); // Rouge
            colors[i * 3 + 1] = Math.max(0.5, temp * 0.8); // Vert
            colors[i * 3 + 2] = 1; // Bleu

            // Taille
            sizes[i] = Math.random() * 0.1 + 0.05;

            // Vélocité initiale
            this.velocities.push(new THREE.Vector3(
                (Math.random() - 0.5) * 0.01,
                (Math.random() - 0.5) * 0.01,
                (Math.random() - 0.5) * 0.01
            ));

            // Masse
            this.masses.push(1 + Math.random());
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
        this.objects.push(this.particles);
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

        // Mise à jour des particules selon l'état
        this.updateParticles(params);

        // Rotation globale
        this.particles.rotation.z += params.rotation * 0.001;
    }

    updateParticles(params) {
        const positions = this.particles.geometry.attributes.position.array;

        for (let i = 0; i < this.particleCount; i++) {
            let x = positions[i * 3];
            let y = positions[i * 3 + 1];
            let z = positions[i * 3 + 2];

            const r = Math.sqrt(x * x + y * y);
            const angle = Math.atan2(y, x);

            // Force gravitationnelle vers le centre
            if (params.collapse > 0) {
                const centerForce = -params.collapse * 0.001;
                const dist = Math.sqrt(x * x + y * y + z * z);

                if (dist > 0.1) {
                    this.velocities[i].x += (x / dist) * centerForce;
                    this.velocities[i].y += (y / dist) * centerForce;
                    this.velocities[i].z += (z / dist) * centerForce * 0.5; // Aplatir
                }
            }

            // Formation du disque
            if (params.distribution === 'disk' || params.distribution === 'spiral') {
                // Aplatir vers z = 0
                this.velocities[i].z -= z * 0.01;

                // Rotation képlérienne
                if (r > 0.1) {
                    const omega = params.rotation * 0.5 / Math.sqrt(r);
                    this.velocities[i].x += -Math.sin(angle) * omega * 0.01;
                    this.velocities[i].y += Math.cos(angle) * omega * 0.01;
                }
            }

            // Bras spiraux
            if (params.distribution === 'spiral' && params.spiralArms > 0) {
                // Spirale logarithmique
                const targetAngle = Math.log(r + 0.1) * this.phi + this.time * 0.1;
                const spiralAngle = (angle - targetAngle) % (Math.PI * 2 / params.spiralArms);

                // Attirer vers les bras
                const spiralForce = Math.sin(spiralAngle * params.spiralArms) * 0.0001;
                this.velocities[i].x += Math.cos(angle) * spiralForce;
                this.velocities[i].y += Math.sin(angle) * spiralForce;
            }

            // Appliquer vélocité avec friction
            x += this.velocities[i].x;
            y += this.velocities[i].y;
            z += this.velocities[i].z;

            this.velocities[i].multiplyScalar(0.99); // Friction

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;
        }

        this.particles.geometry.attributes.position.needsUpdate = true;
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
            this.formationProgress = 1.0;
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
