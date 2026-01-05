import * as THREE from 'three';
import { Scene } from './Scene.js';
import { PhysicalState, FormationTimeline } from '../core/PhysicalState.js';

/**
 * Scène du Trou Noir - Formation et physique relativiste
 *
 * États de formation :
 * 1. Espace plat (grille euclidienne)
 * 2. Compression de la matière (effondrement)
 * 3. Formation de l'horizon des événements
 * 4. Trou noir mature avec disque d'accrétion
 *
 * États physiques :
 * - Schwarzschild (pas de rotation)
 * - Kerr (rotation modérée)
 * - Kerr extrême (rotation maximale)
 */
export class BlackHoleScene extends Scene {
    constructor() {
        super(
            'Trou Noir',
            'Effondrement gravitationnel et distorsion de l\'espace-temps'
        );

        // Paramètres physiques
        this.schwarzschildRadius = 1.0; // Rayon de l'horizon
        this.spinParameter = 0; // 0 = Schwarzschild, 1 = Kerr extrême

        // États
        this.states = this.createPhysicalStates();
        this.currentStateIndex = 0;

        // Timeline
        this.formationTimeline = this.createFormationTimeline();

        // Objets
        this.spacetimeGrid = null;
        this.eventHorizon = null;
        this.accretionDisk = null;
        this.particles = [];

        // Animation
        this.time = 0;
        this.collapseProgress = 0;
    }

    createPhysicalStates() {
        return [
            new PhysicalState(
                'Espace Euclidien',
                'Géométrie plate - aucune courbure de l\'espace-temps',
                {
                    curvature: 0,
                    spin: 0,
                    horizonSize: 0,
                    accretionRate: 0
                }
            ),
            new PhysicalState(
                'Schwarzschild',
                'Trou noir statique sans rotation - métrique de Schwarzschild',
                {
                    curvature: 1.0,
                    spin: 0,
                    horizonSize: 1.0,
                    accretionRate: 0.3
                }
            ),
            new PhysicalState(
                'Kerr (rotation modérée)',
                'Trou noir en rotation - l\'espace-temps est entraîné',
                {
                    curvature: 1.0,
                    spin: 0.5,
                    horizonSize: 0.9,
                    accretionRate: 0.5
                }
            ),
            new PhysicalState(
                'Kerr Extrême',
                'Rotation maximale - ergosphère développée',
                {
                    curvature: 1.0,
                    spin: 0.998,
                    horizonSize: 0.7,
                    accretionRate: 0.8
                }
            )
        ];
    }

    createFormationTimeline() {
        const timeline = new FormationTimeline();

        // Stage 1 : Espace plat
        timeline.addStage(
            'Espace plat',
            2,
            this.states[0],
            {
                onUpdate: (progress) => {
                    this.collapseProgress = 0;
                }
            }
        );

        // Stage 2 : Effondrement
        timeline.addStage(
            'Effondrement gravitationnel',
            4,
            new PhysicalState('Effondrement', 'La matière s\'effondre sur elle-même', {
                curvature: 0.5,
                spin: 0,
                horizonSize: 0.3,
                accretionRate: 0
            }),
            {
                onUpdate: (progress) => {
                    this.collapseProgress = progress * 0.6;
                }
            }
        );

        // Stage 3 : Formation de l'horizon
        timeline.addStage(
            'Horizon des événements',
            3,
            new PhysicalState('Formation horizon', 'L\'horizon des événements se forme', {
                curvature: 0.9,
                spin: 0.2,
                horizonSize: 0.8,
                accretionRate: 0.2
            }),
            {
                onUpdate: (progress) => {
                    this.collapseProgress = 0.6 + progress * 0.3;
                }
            }
        );

        // Stage 4 : Trou noir mature
        timeline.addStage(
            'Trou noir mature',
            5,
            this.states[2],
            {
                onUpdate: (progress) => {
                    this.collapseProgress = 0.9 + progress * 0.1;
                }
            }
        );

        timeline.loopMode = 'loop';
        return timeline;
    }

    init() {
        this.createSpacetimeGrid();
        this.createEventHorizon();
        this.createAccretionDisk();
        this.maxLevels = this.states.length;
    }

    createSpacetimeGrid() {
        // Grille représentant l'espace-temps
        const size = 10;
        const divisions = 20;

        const geometry = new THREE.PlaneGeometry(size, size, divisions, divisions);
        const material = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            wireframe: true,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });

        this.spacetimeGrid = new THREE.Mesh(geometry, material);
        this.spacetimeGrid.rotation.x = -Math.PI / 2;
        this.scene.add(this.spacetimeGrid);
        this.objects.push(this.spacetimeGrid);

        // Stocker les positions originales
        const positions = geometry.attributes.position;
        this.originalPositions = [];
        for (let i = 0; i < positions.count; i++) {
            this.originalPositions.push(
                positions.getX(i),
                positions.getY(i),
                positions.getZ(i)
            );
        }
    }

    createEventHorizon() {
        // Sphère représentant l'horizon des événements
        const geometry = new THREE.SphereGeometry(this.schwarzschildRadius, 32, 32);
        const material = new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.9
        });

        this.eventHorizon = new THREE.Mesh(geometry, material);
        this.eventHorizon.visible = false;
        this.scene.add(this.eventHorizon);
        this.objects.push(this.eventHorizon);

        // Aura autour de l'horizon
        const glowGeometry = new THREE.SphereGeometry(this.schwarzschildRadius * 1.1, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xff6600,
            transparent: true,
            opacity: 0.3,
            side: THREE.BackSide
        });

        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.eventHorizon.add(glow);
    }

    createAccretionDisk() {
        // Disque d'accrétion (particules en orbite)
        const particleCount = 1000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const velocities = [];

        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 1.5 + Math.random() * 3;
            const height = (Math.random() - 0.5) * 0.3;

            positions[i * 3] = Math.cos(angle) * radius;
            positions[i * 3 + 1] = height;
            positions[i * 3 + 2] = Math.sin(angle) * radius;

            // Couleur basée sur la température (plus proche = plus chaud)
            const temp = 1 - (radius - 1.5) / 3;
            colors[i * 3] = temp; // Rouge
            colors[i * 3 + 1] = temp * 0.5; // Vert
            colors[i * 3 + 2] = 0.2; // Bleu

            velocities.push({ angle, radius, height, speed: 0.5 / radius });
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.05,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        this.accretionDisk = new THREE.Points(geometry, material);
        this.accretionDisk.userData.velocities = velocities;
        this.accretionDisk.visible = false;
        this.scene.add(this.accretionDisk);
        this.objects.push(this.accretionDisk);
    }

    update() {
        this.time += 0.016;

        // Mise à jour timeline
        this.formationTimeline.update(0.016);

        // État actuel
        const currentState = this.formationTimeline.isPlaying
            ? this.formationTimeline.getCurrentState()
            : this.states[this.currentStateIndex];

        if (!currentState) return;

        const params = currentState.parameters;

        // Mise à jour de la grille d'espace-temps (courbure)
        this.updateSpacetimeCurvature(params.curvature, params.spin);

        // Mise à jour de l'horizon
        this.updateEventHorizon(params.horizonSize);

        // Mise à jour du disque d'accrétion
        this.updateAccretionDisk(params.accretionRate, params.spin);
    }

    updateSpacetimeCurvature(curvature, spin) {
        const positions = this.spacetimeGrid.geometry.attributes.position;

        for (let i = 0; i < positions.count; i++) {
            const x = this.originalPositions[i * 3];
            const y = this.originalPositions[i * 3 + 1];
            const z = this.originalPositions[i * 3 + 2];

            // Distance au centre
            const dist = Math.sqrt(x * x + z * z);

            // Courbure de Schwarzschild (simplifiée)
            const warp = curvature > 0 ? -curvature * 2 * Math.exp(-dist * 0.5) : 0;

            // Effet de rotation (Frame dragging)
            const rotationEffect = spin * Math.sin(this.time + dist) * 0.1;

            positions.setY(i, y + warp + rotationEffect);
        }

        positions.needsUpdate = true;
    }

    updateEventHorizon(size) {
        if (size > 0.1) {
            this.eventHorizon.visible = true;
            this.eventHorizon.scale.setScalar(size);

            // Rotation de l'horizon (frame-dragging)
            const currentState = this.states[this.currentStateIndex];
            if (currentState) {
                this.eventHorizon.rotation.y += currentState.parameters.spin * 0.02;
            }
        } else {
            this.eventHorizon.visible = false;
        }
    }

    updateAccretionDisk(accretionRate, spin) {
        if (accretionRate > 0.05) {
            this.accretionDisk.visible = true;
            this.accretionDisk.material.opacity = accretionRate;

            const positions = this.accretionDisk.geometry.attributes.position;
            const velocities = this.accretionDisk.userData.velocities;

            for (let i = 0; i < velocities.length; i++) {
                const v = velocities[i];

                // Rotation képlérienne + frame dragging
                v.angle += v.speed * 0.016 * (1 + spin * 0.5);

                // Spirale lente vers le centre
                v.radius -= accretionRate * 0.001;

                // Reset si trop proche
                if (v.radius < this.schwarzschildRadius * 1.2) {
                    v.radius = 1.5 + Math.random() * 3;
                    v.angle = Math.random() * Math.PI * 2;
                }

                positions.setX(i, Math.cos(v.angle) * v.radius);
                positions.setZ(i, Math.sin(v.angle) * v.radius);
            }

            positions.needsUpdate = true;
        } else {
            this.accretionDisk.visible = false;
        }
    }

    setLevel(level) {
        super.setLevel(level);
        this.currentStateIndex = level - 1;
    }

    onLevelChange() {
        const state = this.states[this.currentStateIndex];
        if (state) {
            console.log(`État physique : ${state.name}`);
            this.description = state.description;
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
