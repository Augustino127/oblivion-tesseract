import * as THREE from 'three';
import { Scene } from './Scene.js';
import { PhysicalState, FormationTimeline } from '../core/PhysicalState.js';

/**
 * Téléportation Quantique
 *
 * Visualisation de l'intrication quantique et du transfert d'information :
 * - Superposition quantique
 * - Intrication (entanglement)
 * - Mesure et collapse de la fonction d'onde
 * - Téléportation d'état quantique
 *
 * États : Particules isolées → Intrication → Superposition →
 *         Mesure → Transfert → État téléporté
 */
export class QuantumTeleportationScene extends Scene {
    constructor() {
        super(
            'Téléportation Quantique',
            'Intrication et transfert instantané d\'information quantique'
        );

        this.states = this.createPhysicalStates();
        this.currentStateIndex = 0;
        this.formationTimeline = this.createFormationTimeline();

        // Objets
        this.particleA = null;
        this.particleB = null;
        this.particleC = null; // Particule à téléporter
        this.entanglementField = null;
        this.waveFunction = null;
        this.blochSpheres = [];
        this.connectionLines = [];
        this.quantumGates = [];
        this.measurements = [];

        this.time = 0;
        this.entangled = false;
        this.teleported = false;
    }

    createPhysicalStates() {
        return [
            new PhysicalState(
                'Particules Isolées',
                'Trois qubits séparés sans interaction',
                {
                    stage: 'isolated',
                    entanglement: 0,
                    superposition: 0
                }
            ),
            new PhysicalState(
                'Création d\'Intrication',
                'Formation d\'une paire EPR (Einstein-Podolsky-Rosen)',
                {
                    stage: 'entangling',
                    entanglement: 0.5,
                    superposition: 0.5
                }
            ),
            new PhysicalState(
                'Superposition Quantique',
                'État |ψ⟩ = α|0⟩ + β|1⟩',
                {
                    stage: 'superposition',
                    entanglement: 1.0,
                    superposition: 1.0
                }
            ),
            new PhysicalState(
                'Mesure Bell',
                'Mesure conjointe et collapse de la fonction d\'onde',
                {
                    stage: 'measurement',
                    entanglement: 1.0,
                    collapse: 1.0
                }
            ),
            new PhysicalState(
                'Transfert Classique',
                'Envoi d\'information classique (2 bits)',
                {
                    stage: 'transfer',
                    entanglement: 1.0,
                    information: 1.0
                }
            ),
            new PhysicalState(
                'État Téléporté',
                'Reconstruction de l\'état quantique à distance',
                {
                    stage: 'teleported',
                    entanglement: 0,
                    fidelity: 1.0
                }
            )
        ];
    }

    createFormationTimeline() {
        const timeline = new FormationTimeline();

        timeline.addStage('Particules Isolées', 2, this.states[0]);
        timeline.addStage('Création d\'Intrication', 3, this.states[1]);
        timeline.addStage('Superposition Quantique', 3, this.states[2]);
        timeline.addStage('Mesure Bell', 2, this.states[3]);
        timeline.addStage('Transfert Classique', 2, this.states[4]);
        timeline.addStage('État Téléporté', 3, this.states[5]);

        timeline.loopMode = 'loop';
        return timeline;
    }

    init() {
        this.createParticles();
        this.createBlochSpheres();
        this.createWaveFunction();
        this.createEntanglementField();
        this.createQuantumGates();
        this.createLabels();
        this.maxLevels = this.states.length;

        this.displayMode = 'final';
        this.currentStateIndex = 2; // Superposition par défaut
    }

    createParticles() {
        // Particule A (Alice - à téléporter)
        const geometryA = new THREE.SphereGeometry(0.3, 32, 32);
        const materialA = new THREE.MeshPhongMaterial({
            color: 0xFF00FF,
            emissive: 0xFF00FF,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.8
        });
        this.particleA = new THREE.Mesh(geometryA, materialA);
        this.particleA.position.set(-4, 0, 0);

        // Glow
        const glowA = new THREE.Mesh(
            new THREE.SphereGeometry(0.5, 32, 32),
            new THREE.MeshBasicMaterial({
                color: 0xFF00FF,
                transparent: true,
                opacity: 0.3,
                blending: THREE.AdditiveBlending
            })
        );
        this.particleA.add(glowA);

        this.scene.add(this.particleA);
        this.objects.push(this.particleA);

        // Particule B (Bob - intriquée avec C)
        const geometryB = new THREE.SphereGeometry(0.3, 32, 32);
        const materialB = new THREE.MeshPhongMaterial({
            color: 0x00FFFF,
            emissive: 0x00FFFF,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.8
        });
        this.particleB = new THREE.Mesh(geometryB, materialB);
        this.particleB.position.set(0, 0, 0);

        const glowB = new THREE.Mesh(
            new THREE.SphereGeometry(0.5, 32, 32),
            new THREE.MeshBasicMaterial({
                color: 0x00FFFF,
                transparent: true,
                opacity: 0.3,
                blending: THREE.AdditiveBlending
            })
        );
        this.particleB.add(glowB);

        this.scene.add(this.particleB);
        this.objects.push(this.particleB);

        // Particule C (Charlie - intriquée avec B)
        const geometryC = new THREE.SphereGeometry(0.3, 32, 32);
        const materialC = new THREE.MeshPhongMaterial({
            color: 0xFFFF00,
            emissive: 0xFFFF00,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.8
        });
        this.particleC = new THREE.Mesh(geometryC, materialC);
        this.particleC.position.set(4, 0, 0);

        const glowC = new THREE.Mesh(
            new THREE.SphereGeometry(0.5, 32, 32),
            new THREE.MeshBasicMaterial({
                color: 0xFFFF00,
                transparent: true,
                opacity: 0.3,
                blending: THREE.AdditiveBlending
            })
        );
        this.particleC.add(glowC);

        this.scene.add(this.particleC);
        this.objects.push(this.particleC);
    }

    createBlochSpheres() {
        // Sphères de Bloch pour visualiser l'état des qubits
        const positions = [
            { x: -4, y: 2, z: 0 },
            { x: 0, y: 2, z: 0 },
            { x: 4, y: 2, z: 0 }
        ];

        positions.forEach((pos, idx) => {
            // Sphère semi-transparente
            const sphereGeom = new THREE.SphereGeometry(0.8, 32, 32);
            const sphereMat = new THREE.MeshBasicMaterial({
                color: 0x333333,
                transparent: true,
                opacity: 0.1,
                wireframe: true
            });
            const sphere = new THREE.Mesh(sphereGeom, sphereMat);
            sphere.position.set(pos.x, pos.y, pos.z);

            // Axes X, Y, Z
            const axesMat = new THREE.LineBasicMaterial({ color: 0x888888 });
            const axesPoints = [
                new THREE.Vector3(-1, 0, 0), new THREE.Vector3(1, 0, 0),
                new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 1, 0),
                new THREE.Vector3(0, 0, -1), new THREE.Vector3(0, 0, 1)
            ];

            for (let i = 0; i < axesPoints.length; i += 2) {
                const lineGeom = new THREE.BufferGeometry().setFromPoints([
                    axesPoints[i], axesPoints[i + 1]
                ]);
                const line = new THREE.Line(lineGeom, axesMat);
                sphere.add(line);
            }

            // Vecteur d'état (pointer)
            const arrowDir = new THREE.Vector3(0, 1, 0);
            const arrowOrigin = new THREE.Vector3(0, 0, 0);
            const arrowLength = 0.8;
            const arrowColor = idx === 0 ? 0xFF00FF : (idx === 1 ? 0x00FFFF : 0xFFFF00);

            const arrow = new THREE.ArrowHelper(arrowDir, arrowOrigin, arrowLength, arrowColor, 0.2, 0.1);
            sphere.add(arrow);
            sphere.userData.arrow = arrow;
            sphere.userData.angle = 0;

            sphere.visible = false;
            this.scene.add(sphere);
            this.objects.push(sphere);
            this.blochSpheres.push(sphere);
        });
    }

    createWaveFunction() {
        // Fonction d'onde visualisée comme une surface ondulante
        const geometry = new THREE.PlaneGeometry(8, 2, 64, 16);
        const material = new THREE.MeshBasicMaterial({
            color: 0x00FFFF,
            wireframe: true,
            transparent: true,
            opacity: 0.6
        });

        this.waveFunction = new THREE.Mesh(geometry, material);
        this.waveFunction.rotation.x = -Math.PI / 4;
        this.waveFunction.position.y = -2;
        this.waveFunction.visible = false;

        this.scene.add(this.waveFunction);
        this.objects.push(this.waveFunction);
    }

    createEntanglementField() {
        // Lignes d'intrication entre particules
        const createConnection = (start, end, color) => {
            const points = [];
            const segments = 50;

            for (let i = 0; i <= segments; i++) {
                const t = i / segments;
                const x = THREE.MathUtils.lerp(start.x, end.x, t);
                const y = Math.sin(t * Math.PI) * 0.5;
                const z = THREE.MathUtils.lerp(start.z, end.z, t);
                points.push(new THREE.Vector3(x, y, z));
            }

            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.8,
                linewidth: 2
            });

            const line = new THREE.Line(geometry, material);
            line.visible = false;
            this.scene.add(line);
            this.objects.push(line);
            this.connectionLines.push(line);

            return line;
        };

        // Connexions A-B et B-C
        createConnection(
            this.particleA.position,
            this.particleB.position,
            0xFF00FF
        );

        createConnection(
            this.particleB.position,
            this.particleC.position,
            0x00FFFF
        );
    }

    createQuantumGates() {
        // Portes quantiques visualisées comme des cubes semi-transparents
        const gatePositions = [
            { x: -2, y: 0, z: 0, label: 'H' },  // Hadamard
            { x: 2, y: 0, z: 0, label: 'CNOT' } // Controlled-NOT
        ];

        gatePositions.forEach(pos => {
            const geometry = new THREE.BoxGeometry(0.8, 0.8, 0.1);
            const material = new THREE.MeshBasicMaterial({
                color: 0x8800FF,
                transparent: true,
                opacity: 0.5
            });

            const gate = new THREE.Mesh(geometry, material);
            gate.position.set(pos.x, pos.y, pos.z);
            gate.visible = false;

            this.scene.add(gate);
            this.objects.push(gate);
            this.quantumGates.push(gate);
        });
    }

    createLabels() {
        // Labels pour expliquer les concepts
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

        // Label pour Alice
        const labelA = createTextSprite('Alice |ψ⟩', '#FF00FF');
        labelA.position.set(-4, -1.5, 0);
        labelA.userData.type = 'isolated';
        labelA.visible = false;
        this.scene.add(labelA);
        this.objects.push(labelA);

        // Label pour Bob
        const labelB = createTextSprite('Bob', '#00FFFF');
        labelB.position.set(0, -1.5, 0);
        labelB.userData.type = 'isolated';
        labelB.visible = false;
        this.scene.add(labelB);
        this.objects.push(labelB);

        // Label pour Charlie
        const labelC = createTextSprite('Charlie', '#FFFF00');
        labelC.position.set(4, -1.5, 0);
        labelC.userData.type = 'isolated';
        labelC.visible = false;
        this.scene.add(labelC);
        this.objects.push(labelC);

        // Équation d'intrication
        const eqLabel = createTextSprite('|Ψ⟩ = (|00⟩ + |11⟩)/√2', '#00FFFF');
        eqLabel.position.set(0, 3.5, 0);
        eqLabel.userData.type = 'superposition';
        eqLabel.visible = false;
        this.scene.add(eqLabel);
        this.objects.push(eqLabel);
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

        // Animations
        switch(stage) {
            case 'isolated':
                this.updateIsolated();
                break;
            case 'entangling':
            case 'superposition':
                this.updateEntangled(params);
                break;
            case 'measurement':
                this.updateMeasurement();
                break;
            case 'transfer':
                this.updateTransfer();
                break;
            case 'teleported':
                this.updateTeleported();
                break;
        }

        // Rotation générale
        this.particleA.rotation.y = this.time * 2;
        this.particleB.rotation.y = this.time * 2;
        this.particleC.rotation.y = this.time * 2;

        // Animation fonction d'onde
        if (this.waveFunction.visible) {
            this.updateWaveFunctionGeometry();
        }

        // Animation sphères de Bloch
        this.blochSpheres.forEach((sphere, idx) => {
            if (sphere.visible) {
                sphere.userData.angle += 0.02;
                const arrow = sphere.userData.arrow;
                if (arrow) {
                    const theta = sphere.userData.angle;
                    const phi = Math.sin(this.time * (idx + 1)) * Math.PI;

                    arrow.setDirection(new THREE.Vector3(
                        Math.sin(theta) * Math.cos(phi),
                        Math.cos(theta),
                        Math.sin(theta) * Math.sin(phi)
                    ));
                }
            }
        });
    }

    updateVisibility(stage) {
        // Particules toujours visibles
        this.particleA.visible = true;
        this.particleB.visible = true;
        this.particleC.visible = true;

        // Sphères de Bloch
        this.blochSpheres.forEach(s => {
            s.visible = (stage === 'superposition' || stage === 'measurement');
        });

        // Connexions d'intrication
        this.connectionLines.forEach(l => {
            l.visible = (stage === 'entangling' || stage === 'superposition' ||
                        stage === 'measurement' || stage === 'transfer');
        });

        // Fonction d'onde
        this.waveFunction.visible = (stage === 'superposition');

        // Portes quantiques
        this.quantumGates.forEach(g => {
            g.visible = (stage === 'measurement' || stage === 'transfer');
        });

        // Labels
        this.objects.forEach(obj => {
            if (obj.userData.type === 'isolated') {
                obj.visible = (stage === 'isolated');
            } else if (obj.userData.type === 'superposition') {
                obj.visible = (stage === 'superposition');
            }
        });
    }

    updateIsolated() {
        // Particules oscillent indépendamment
        this.particleA.position.y = Math.sin(this.time * 2) * 0.2;
        this.particleB.position.y = Math.sin(this.time * 2.5) * 0.2;
        this.particleC.position.y = Math.sin(this.time * 3) * 0.2;
    }

    updateEntangled(params) {
        const entanglement = params.entanglement || 0;

        // Particules B et C synchronisées
        const sync = Math.sin(this.time * 2) * 0.2 * entanglement;
        this.particleB.position.y = sync;
        this.particleC.position.y = sync;

        // A oscille indépendamment
        this.particleA.position.y = Math.sin(this.time * 3) * 0.2;

        // Pulse des connexions
        this.connectionLines.forEach((line, idx) => {
            if (line.visible) {
                const pulse = 0.5 + Math.sin(this.time * 3 + idx * Math.PI) * 0.3;
                line.material.opacity = pulse * entanglement;
            }
        });
    }

    updateMeasurement() {
        // Collapse : particules se figent progressivement
        const collapse = Math.abs(Math.sin(this.time * 4));

        this.particleA.scale.setScalar(1 + collapse * 0.3);
        this.particleB.scale.setScalar(1 + collapse * 0.3);

        // Portes quantiques pulsent
        this.quantumGates.forEach((gate, idx) => {
            gate.rotation.y = this.time * 2;
            const pulse = 0.3 + Math.sin(this.time * 5 + idx * Math.PI) * 0.2;
            gate.material.opacity = pulse;
        });
    }

    updateTransfer() {
        // Information classique voyage de A/B vers C
        const t = (Math.sin(this.time * 2) + 1) / 2;

        // Particule "fantôme" se déplace
        const x = THREE.MathUtils.lerp(-2, 4, t);
        const y = Math.sin(t * Math.PI) * 1;

        // Flash sur C quand info arrive
        if (t > 0.8) {
            const flash = Math.sin(this.time * 10) * 0.5 + 0.5;
            this.particleC.material.emissiveIntensity = flash * 2;
        }
    }

    updateTeleported() {
        // État téléporté : C a maintenant les propriétés de A
        this.particleC.material.color.lerp(new THREE.Color(0xFF00FF), 0.02);
        this.particleC.material.emissive.lerp(new THREE.Color(0xFF00FF), 0.02);

        // Success glow
        const pulse = 0.5 + Math.sin(this.time * 3) * 0.5;
        this.particleC.scale.setScalar(1 + pulse * 0.2);
    }

    updateWaveFunctionGeometry() {
        const positions = this.waveFunction.geometry.attributes.position.array;
        const width = 64;
        const height = 16;

        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                const idx = (i * width + j) * 3;
                const x = (j / width - 0.5) * 8;
                const y = (i / height - 0.5) * 2;

                const wave1 = Math.sin(x * 2 + this.time * 2) * 0.3;
                const wave2 = Math.sin(x * 3 - this.time * 3) * 0.2;

                positions[idx + 2] = wave1 + wave2;
            }
        }

        this.waveFunction.geometry.attributes.position.needsUpdate = true;
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
