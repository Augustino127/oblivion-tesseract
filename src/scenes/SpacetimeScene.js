import * as THREE from 'three';
import { Scene } from './Scene.js';
import { PhysicalState, FormationTimeline } from '../core/PhysicalState.js';

/**
 * Espace-Temps et Relativité
 *
 * Visualisation de la structure de l'espace-temps :
 * - Espace plat de Minkowski
 * - Courbure par la masse (Relativité Générale)
 * - Ondes gravitationnelles
 * - Trous de ver (wormholes)
 * - Dilatation temporelle
 * - Cônes de lumière
 *
 * États : Espace Plat → Courbure locale → Ondes gravitationnelles →
 *         Trou de ver → Dilatation temporelle → Causalité
 */
export class SpacetimeScene extends Scene {
    constructor() {
        super(
            'Espace-Temps',
            'Structure et déformation de l\'espace-temps'
        );

        this.states = this.createPhysicalStates();
        this.currentStateIndex = 0;
        this.formationTimeline = this.createFormationTimeline();

        // Objets
        this.spacetimeGrid = null;
        this.mass = null;
        this.lightCones = [];
        this.worldLines = [];
        this.gravitationalWaves = [];
        this.wormhole = null;
        this.clocks = [];
        this.timeArrows = [];

        this.time = 0;
        this.wavePhase = 0;
        this.gridSize = 20;
        this.gridResolution = 40;
    }

    createPhysicalStates() {
        return [
            new PhysicalState(
                'Espace Plat',
                'Espace-temps de Minkowski (sans courbure)',
                {
                    stage: 'flat',
                    curvature: 0,
                    mass: 0
                }
            ),
            new PhysicalState(
                'Courbure Locale',
                'Déformation par une masse (métrique de Schwarzschild)',
                {
                    stage: 'curved',
                    curvature: 1.0,
                    mass: 1.0
                }
            ),
            new PhysicalState(
                'Ondes Gravitationnelles',
                'Ondulations de l\'espace-temps se propageant',
                {
                    stage: 'waves',
                    curvature: 0.5,
                    waveAmplitude: 1.0
                }
            ),
            new PhysicalState(
                'Trou de Ver',
                'Pont Einstein-Rosen reliant deux régions',
                {
                    stage: 'wormhole',
                    curvature: 2.0,
                    topology: 'bridge'
                }
            ),
            new PhysicalState(
                'Dilatation Temporelle',
                'Le temps s\'écoule différemment selon le référentiel',
                {
                    stage: 'time_dilation',
                    timeFactor: 1.5,
                    velocity: 0.8 // fraction de c
                }
            ),
            new PhysicalState(
                'Cônes de Lumière',
                'Structure causale de l\'espace-temps',
                {
                    stage: 'causality',
                    lightSpeed: 1.0,
                    causalStructure: true
                }
            )
        ];
    }

    createFormationTimeline() {
        const timeline = new FormationTimeline();

        timeline.addStage('Espace Plat', 3, this.states[0]);
        timeline.addStage('Courbure Locale', 4, this.states[1]);
        timeline.addStage('Ondes Gravitationnelles', 4, this.states[2]);
        timeline.addStage('Trou de Ver', 4, this.states[3]);
        timeline.addStage('Dilatation Temporelle', 4, this.states[4]);
        timeline.addStage('Cônes de Lumière', 3, this.states[5]);

        timeline.loopMode = 'loop';
        return timeline;
    }

    init() {
        this.createSpacetimeGrid();
        this.createMass();
        this.createWormhole();
        this.createLightCones();
        this.createClocks();
        this.createWorldLines();
        this.createLabels();
        this.maxLevels = this.states.length;

        this.displayMode = 'final';
        this.currentStateIndex = 1; // Courbure par défaut
    }

    createSpacetimeGrid() {
        // Grille d'espace-temps déformable
        const geometry = new THREE.PlaneGeometry(
            this.gridSize,
            this.gridSize,
            this.gridResolution,
            this.gridResolution
        );

        // Stocker positions originales
        const positions = geometry.attributes.position.array;
        const originalPositions = new Float32Array(positions.length);
        for (let i = 0; i < positions.length; i++) {
            originalPositions[i] = positions[i];
        }
        geometry.userData.originalPositions = originalPositions;

        const material = new THREE.MeshBasicMaterial({
            color: 0x00FFFF,
            wireframe: true,
            transparent: true,
            opacity: 0.6
        });

        this.spacetimeGrid = new THREE.Mesh(geometry, material);
        this.spacetimeGrid.rotation.x = -Math.PI / 3;
        this.spacetimeGrid.position.y = -2;

        this.scene.add(this.spacetimeGrid);
        this.objects.push(this.spacetimeGrid);
    }

    createMass() {
        // Masse qui courbe l'espace-temps
        const geometry = new THREE.SphereGeometry(0.5, 32, 32);
        const material = new THREE.MeshPhongMaterial({
            color: 0xFF6600,
            emissive: 0xFF3300,
            emissiveIntensity: 0.5
        });

        this.mass = new THREE.Mesh(geometry, material);
        this.mass.position.set(0, 0, 0);
        this.mass.visible = false;

        // Glow
        const glowGeometry = new THREE.SphereGeometry(0.8, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xFF6600,
            transparent: true,
            opacity: 0.3,
            blending: THREE.AdditiveBlending
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.mass.add(glow);

        this.scene.add(this.mass);
        this.objects.push(this.mass);
    }

    createWormhole() {
        // Trou de ver visualisé comme deux entonnoirs connectés
        const createFunnel = (direction) => {
            const points = [];
            const segments = 30;

            for (let i = 0; i <= segments; i++) {
                const t = i / segments;
                const radius = 0.3 + Math.pow(t, 2) * 2;
                const y = t * 3 * direction;
                points.push(new THREE.Vector3(radius, y, 0));
            }

            const geometry = new THREE.LatheGeometry(points, 32);
            const material = new THREE.MeshPhongMaterial({
                color: 0x8800FF,
                transparent: true,
                opacity: 0.6,
                side: THREE.DoubleSide,
                emissive: 0x4400AA,
                emissiveIntensity: 0.3
            });

            const funnel = new THREE.Mesh(geometry, material);
            return funnel;
        };

        const funnel1 = createFunnel(1);
        const funnel2 = createFunnel(-1);

        this.wormhole = new THREE.Group();
        this.wormhole.add(funnel1);
        this.wormhole.add(funnel2);
        this.wormhole.visible = false;

        // Rotation pour mieux voir
        this.wormhole.rotation.x = Math.PI / 4;

        this.scene.add(this.wormhole);
        this.objects.push(this.wormhole);
    }

    createLightCones() {
        // Cônes de lumière (futur et passé)
        const createCone = (direction) => {
            const geometry = new THREE.ConeGeometry(2, 4, 32, 1, true);
            const material = new THREE.MeshBasicMaterial({
                color: 0xFFFF00,
                transparent: true,
                opacity: 0.2,
                side: THREE.DoubleSide,
                wireframe: true
            });

            const cone = new THREE.Mesh(geometry, material);
            cone.rotation.x = direction * Math.PI;
            return cone;
        };

        const futureCone = createCone(0);
        futureCone.position.y = 2;

        const pastCone = createCone(1);
        pastCone.position.y = -2;

        futureCone.visible = false;
        pastCone.visible = false;

        this.scene.add(futureCone);
        this.scene.add(pastCone);

        this.objects.push(futureCone);
        this.objects.push(pastCone);

        this.lightCones.push(futureCone, pastCone);
    }

    createClocks() {
        // Horloges pour visualiser la dilatation temporelle
        const createClock = (x, color, speed) => {
            const group = new THREE.Group();

            // Face
            const faceGeometry = new THREE.CircleGeometry(0.5, 32);
            const faceMaterial = new THREE.MeshBasicMaterial({
                color: 0x222222,
                side: THREE.DoubleSide
            });
            const face = new THREE.Mesh(faceGeometry, faceMaterial);
            group.add(face);

            // Border
            const borderGeometry = new THREE.RingGeometry(0.5, 0.55, 32);
            const borderMaterial = new THREE.MeshBasicMaterial({
                color: color,
                side: THREE.DoubleSide
            });
            const border = new THREE.Mesh(borderGeometry, borderMaterial);
            group.add(border);

            // Aiguille
            const handGeometry = new THREE.BoxGeometry(0.05, 0.4, 0.02);
            const handMaterial = new THREE.MeshBasicMaterial({ color: color });
            const hand = new THREE.Mesh(handGeometry, handMaterial);
            hand.position.y = 0.2;
            group.add(hand);

            group.position.set(x, 2, 0);
            group.userData.hand = hand;
            group.userData.speed = speed;
            group.visible = false;

            this.scene.add(group);
            this.objects.push(group);
            this.clocks.push(group);

            return group;
        };

        // Horloge lente (près d'une masse ou en mouvement)
        createClock(-3, 0xFF0000, 0.5);

        // Horloge normale (référentiel inertiel)
        createClock(0, 0x00FF00, 1.0);

        // Horloge rapide
        createClock(3, 0x0000FF, 1.5);
    }

    createWorldLines() {
        // Lignes d'univers (trajectoires dans l'espace-temps)
        const createWorldLine = (startX, curvature, color) => {
            const points = [];
            const segments = 100;

            for (let i = 0; i <= segments; i++) {
                const t = i / segments;
                const y = (t - 0.5) * 6;
                const x = startX + Math.sin(t * Math.PI * curvature) * 0.5;
                const z = 0;
                points.push(new THREE.Vector3(x, y, z));
            }

            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.7,
                linewidth: 2
            });

            const line = new THREE.Line(geometry, material);
            line.visible = false;

            this.scene.add(line);
            this.objects.push(line);
            this.worldLines.push(line);

            return line;
        };

        createWorldLine(-2, 0, 0xFF00FF); // Ligne droite
        createWorldLine(0, 2, 0x00FFFF);  // Ligne courbée
        createWorldLine(2, 4, 0xFFFF00);  // Ligne très courbée
    }

    createLabels() {
        const createTextSprite = (text, color = '#FFFFFF') => {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            const fontSize = 48;

            context.font = `${fontSize}px Courier New`;
            const metrics = context.measureText(text);

            canvas.width = metrics.width + 20;
            canvas.height = fontSize + 20;

            context.font = `${fontSize}px Courier New`;
            context.fillStyle = 'rgba(0, 0, 0, 0.7)';
            context.fillRect(0, 0, canvas.width, canvas.height);

            context.fillStyle = color;
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(text, canvas.width / 2, canvas.height / 2);

            const texture = new THREE.CanvasTexture(canvas);
            const spriteMaterial = new THREE.SpriteMaterial({
                map: texture,
                transparent: true
            });
            const sprite = new THREE.Sprite(spriteMaterial);

            const scale = 0.5;
            sprite.scale.set(scale * canvas.width / 100, scale * canvas.height / 100, 1);

            return sprite;
        };

        // Label métrique de Schwarzschild
        const schwarzLabel = createTextSprite('ds² = -(1-2GM/rc²)c²dt² + dr²/(1-2GM/rc²)', '#00FFFF');
        schwarzLabel.position.set(0, 3.5, 0);
        schwarzLabel.userData.type = 'curved';
        schwarzLabel.visible = false;
        this.scene.add(schwarzLabel);
        this.objects.push(schwarzLabel);

        // Label dilatation temporelle
        const dilationLabel = createTextSprite('Δt\' = Δt/√(1-v²/c²)', '#FFD700');
        dilationLabel.position.set(0, 4, 0);
        dilationLabel.userData.type = 'time_dilation';
        dilationLabel.visible = false;
        this.scene.add(dilationLabel);
        this.objects.push(dilationLabel);

        // Label vitesse lumière
        const lightLabel = createTextSprite('c = 299,792,458 m/s', '#FFFF00');
        lightLabel.position.set(0, -4, 0);
        lightLabel.userData.type = 'causality';
        lightLabel.visible = false;
        this.scene.add(lightLabel);
        this.objects.push(lightLabel);
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

        const stage = currentState.parameters.stage;
        const params = currentState.parameters;

        // Gestion de la visibilité
        this.updateVisibility(stage);

        // Déformation de la grille selon l'état
        this.updateSpacetimeGrid(stage, params);

        // Animations spécifiques
        switch(stage) {
            case 'flat':
                break; // Pas d'animation particulière
            case 'curved':
                this.updateCurved();
                break;
            case 'waves':
                this.updateWaves();
                break;
            case 'wormhole':
                this.updateWormhole();
                break;
            case 'time_dilation':
                this.updateTimeDilation();
                break;
            case 'causality':
                this.updateCausality();
                break;
        }
    }

    updateVisibility(stage) {
        // Grille toujours visible
        this.spacetimeGrid.visible = true;

        // Masse
        this.mass.visible = (stage === 'curved');

        // Trou de ver
        this.wormhole.visible = (stage === 'wormhole');

        // Cônes de lumière
        this.lightCones.forEach(cone => {
            cone.visible = (stage === 'causality');
        });

        // Horloges
        this.clocks.forEach(clock => {
            clock.visible = (stage === 'time_dilation');
        });

        // Lignes d'univers
        this.worldLines.forEach(line => {
            line.visible = (stage === 'causality' || stage === 'curved');
        });

        // Labels
        this.objects.forEach(obj => {
            if (obj.userData.type) {
                obj.visible = (obj.userData.type === stage);
            }
        });
    }

    updateSpacetimeGrid(stage, params) {
        const positions = this.spacetimeGrid.geometry.attributes.position.array;
        const original = this.spacetimeGrid.geometry.userData.originalPositions;

        if (!original) return;

        const curvature = params.curvature || 0;

        for (let i = 0; i < positions.length; i += 3) {
            const x = original[i];
            const y = original[i + 1];

            let z = 0;

            if (stage === 'flat') {
                z = 0;
            } else if (stage === 'curved') {
                // Puits gravitationnel
                const dist = Math.sqrt(x * x + y * y);
                z = -curvature * 2 / (1 + dist * 0.5);
            } else if (stage === 'waves') {
                // Ondes gravitationnelles
                this.wavePhase += 0.016;
                const dist = Math.sqrt(x * x + y * y);
                z = Math.sin(dist * 2 - this.wavePhase * 2) * 0.5 * params.waveAmplitude;
            } else if (stage === 'wormhole') {
                // Double puits
                const dist = Math.sqrt(x * x + y * y);
                if (dist < 3) {
                    z = -Math.sqrt(9 - dist * dist) * 0.5;
                }
            }

            positions[i + 2] = z;
        }

        this.spacetimeGrid.geometry.attributes.position.needsUpdate = true;
    }

    updateCurved() {
        // Masse pulse
        const pulse = 1 + Math.sin(this.time * 2) * 0.1;
        this.mass.scale.setScalar(pulse);
    }

    updateWaves() {
        // Les ondes sont gérées dans updateSpacetimeGrid
    }

    updateWormhole() {
        // Rotation du trou de ver
        this.wormhole.rotation.y = this.time * 0.5;
    }

    updateTimeDilation() {
        // Animation des horloges à différentes vitesses
        this.clocks.forEach(clock => {
            const hand = clock.userData.hand;
            const speed = clock.userData.speed;

            hand.rotation.z = this.time * speed;
        });
    }

    updateCausality() {
        // Pulse des cônes de lumière
        this.lightCones.forEach((cone, idx) => {
            const pulse = 0.2 + Math.sin(this.time * 3 + idx * Math.PI) * 0.1;
            cone.material.opacity = pulse;
        });
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
