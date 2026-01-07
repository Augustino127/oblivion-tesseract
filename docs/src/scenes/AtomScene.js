import * as THREE from 'three';
import { Scene } from './Scene.js';
import { PhysicalState, FormationTimeline } from '../core/PhysicalState.js';

/**
 * AtomScene - Visualisation d'atomes et orbitales quantiques
 *
 * Montre la structure atomique depuis l'hydrogène jusqu'aux atomes lourds
 * États : Proton seul → Hydrogène → Hélium → Carbone → Néon
 */
export class AtomScene extends Scene {
    constructor() {
        super(
            'Atome',
            'Structure atomique et orbitales quantiques'
        );

        this.states = this.createPhysicalStates();
        this.currentStateIndex = 0;
        this.formationTimeline = this.createFormationTimeline();

        // Objets
        this.nucleus = null;
        this.protons = [];
        this.neutrons = [];
        this.electrons = [];
        this.orbitals = [];
        this.orbitalClouds = [];

        this.time = 0;
    }

    createPhysicalStates() {
        return [
            new PhysicalState(
                'Proton Isolé',
                'Noyau d\'hydrogène ionisé (H+)',
                {
                    element: 'H+',
                    protons: 1,
                    neutrons: 0,
                    electrons: 0
                }
            ),
            new PhysicalState(
                'Hydrogène (H)',
                'Atome le plus simple - 1 proton, 1 électron',
                {
                    element: 'H',
                    protons: 1,
                    neutrons: 0,
                    electrons: 1,
                    shells: [[1]] // 1s¹
                }
            ),
            new PhysicalState(
                'Hélium (He)',
                'Gaz noble - 2 protons, 2 neutrons, 2 électrons',
                {
                    element: 'He',
                    protons: 2,
                    neutrons: 2,
                    electrons: 2,
                    shells: [[2]] // 1s²
                }
            ),
            new PhysicalState(
                'Carbone (C)',
                'Base de la vie - 6 protons, 6 neutrons, 6 électrons',
                {
                    element: 'C',
                    protons: 6,
                    neutrons: 6,
                    electrons: 6,
                    shells: [[2], [4]] // 1s² 2s² 2p²
                }
            ),
            new PhysicalState(
                'Néon (Ne)',
                'Gaz noble - 10 protons, 10 neutrons, 10 électrons',
                {
                    element: 'Ne',
                    protons: 10,
                    neutrons: 10,
                    electrons: 10,
                    shells: [[2], [8]] // 1s² 2s² 2p⁶
                }
            )
        ];
    }

    createFormationTimeline() {
        const timeline = new FormationTimeline();

        timeline.addStage('Proton Isolé', 2, this.states[0]);
        timeline.addStage('Hydrogène', 3, this.states[1]);
        timeline.addStage('Hélium', 3, this.states[2]);
        timeline.addStage('Carbone', 3, this.states[3]);
        timeline.addStage('Néon', 3, this.states[4]);

        timeline.loopMode = 'loop';
        return timeline;
    }

    init() {
        this.createNucleus();
        this.maxLevels = this.states.length;

        this.displayMode = 'final';
        this.currentStateIndex = 3; // Carbone par défaut
    }

    createNucleus() {
        this.nucleus = new THREE.Group();
        this.scene.add(this.nucleus);
        this.objects.push(this.nucleus);
    }

    createProton(position) {
        const geometry = new THREE.SphereGeometry(0.15, 16, 16);
        const material = new THREE.MeshPhongMaterial({
            color: 0xFF3333,
            emissive: 0xFF0000,
            emissiveIntensity: 0.3,
            shininess: 100
        });

        const proton = new THREE.Mesh(geometry, material);
        proton.position.set(position.x, position.y, position.z);

        return proton;
    }

    createNeutron(position) {
        const geometry = new THREE.SphereGeometry(0.15, 16, 16);
        const material = new THREE.MeshPhongMaterial({
            color: 0xCCCCCC,
            shininess: 50
        });

        const neutron = new THREE.Mesh(geometry, material);
        neutron.position.set(position.x, position.y, position.z);

        return neutron;
    }

    createElectron() {
        const geometry = new THREE.SphereGeometry(0.08, 16, 16);
        const material = new THREE.MeshBasicMaterial({
            color: 0x00FFFF,
            transparent: true,
            opacity: 0.9
        });

        const electron = new THREE.Mesh(geometry, material);

        // Glow
        const glowGeometry = new THREE.SphereGeometry(0.12, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x00FFFF,
            transparent: true,
            opacity: 0.3,
            blending: THREE.AdditiveBlending
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        electron.add(glow);

        return electron;
    }

    createOrbitalCloud(shellNumber, electrons) {
        // Nuage électronique probabiliste
        const particleCount = electrons * 500;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        const radius = shellNumber * 1.5;

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;

            // Distribution probabiliste (fonction d'onde)
            const r = this.generateOrbitalRadius(shellNumber);
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;

            positions[i3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = r * Math.cos(phi);

            // Couleur selon la densité
            const density = Math.exp(-r / radius);
            const hue = 0.5 + density * 0.2; // Cyan à bleu
            const color = new THREE.Color().setHSL(hue, 1, 0.5);
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.02,
            vertexColors: true,
            transparent: true,
            opacity: 0.3,
            blending: THREE.AdditiveBlending
        });

        const cloud = new THREE.Points(geometry, material);
        return cloud;
    }

    generateOrbitalRadius(n) {
        // Distribution radiale pour orbitale n
        // R(r) ~ r^(n-1) * exp(-r/n)
        const a0 = 1; // Rayon de Bohr (normalisé)

        // Méthode rejection sampling simplifiée
        let r, probability;
        do {
            r = Math.random() * n * n * 3;
            const radialPart = Math.pow(r / a0, n - 1) * Math.exp(-r / (n * a0));
            probability = radialPart / Math.pow(n, n - 1);
        } while (Math.random() > probability);

        return r;
    }

    buildAtom(params) {
        // Nettoyer l'atome précédent
        this.protons.forEach(p => this.nucleus.remove(p));
        this.neutrons.forEach(n => this.nucleus.remove(n));
        this.electrons.forEach(e => this.scene.remove(e));
        this.orbitalClouds.forEach(c => this.scene.remove(c));

        this.protons = [];
        this.neutrons = [];
        this.electrons = [];
        this.orbitalClouds = [];

        // Créer le noyau
        const numProtons = params.protons;
        const numNeutrons = params.neutrons;

        // Positionner les nucléons en sphère compacte
        for (let i = 0; i < numProtons; i++) {
            const phi = Math.acos(-1 + (2 * i) / numProtons);
            const theta = Math.sqrt(numProtons * Math.PI) * phi;

            const pos = {
                x: 0.25 * Math.cos(theta) * Math.sin(phi),
                y: 0.25 * Math.sin(theta) * Math.sin(phi),
                z: 0.25 * Math.cos(phi)
            };

            const proton = this.createProton(pos);
            this.nucleus.add(proton);
            this.protons.push(proton);
        }

        for (let i = 0; i < numNeutrons; i++) {
            const total = numProtons + numNeutrons;
            const phi = Math.acos(-1 + (2 * (numProtons + i)) / total);
            const theta = Math.sqrt(total * Math.PI) * phi;

            const pos = {
                x: 0.25 * Math.cos(theta) * Math.sin(phi),
                y: 0.25 * Math.sin(theta) * Math.sin(phi),
                z: 0.25 * Math.cos(phi)
            };

            const neutron = this.createNeutron(pos);
            this.nucleus.add(neutron);
            this.neutrons.push(neutron);
        }

        // Créer les nuages électroniques
        if (params.shells) {
            params.shells.forEach((shellElectrons, shellIndex) => {
                const n = shellIndex + 1; // Nombre quantique principal

                shellElectrons.forEach(count => {
                    const cloud = this.createOrbitalCloud(n, count);
                    this.scene.add(cloud);
                    this.objects.push(cloud);
                    this.orbitalClouds.push(cloud);

                    // Créer électrons visibles
                    for (let i = 0; i < count; i++) {
                        const electron = this.createElectron();
                        electron.userData.shell = n;
                        electron.userData.angle = (i / count) * Math.PI * 2;
                        electron.userData.phase = Math.random() * Math.PI * 2;

                        this.scene.add(electron);
                        this.objects.push(electron);
                        this.electrons.push(electron);
                    }
                });
            });
        }
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

        // Reconstruire l'atome si changement d'état
        if (this.lastState !== currentState) {
            this.buildAtom(currentState.parameters);
            this.lastState = currentState;
        }

        // Animation du noyau
        this.nucleus.rotation.y = this.time * 0.2;
        this.nucleus.rotation.x = Math.sin(this.time * 0.1) * 0.3;

        // Animation des électrons (orbites)
        this.electrons.forEach(electron => {
            const shell = electron.userData.shell;
            const radius = shell * 1.5;
            const speed = 1 / (shell * shell); // Plus lent pour couches externes

            electron.userData.angle += 0.016 * speed;
            const angle = electron.userData.angle;
            const phase = electron.userData.phase;

            electron.position.x = radius * Math.cos(angle);
            electron.position.z = radius * Math.sin(angle);
            electron.position.y = Math.sin(angle + phase) * radius * 0.3;

            electron.rotation.y += 0.1;
        });

        // Animation des nuages orbitaux
        this.orbitalClouds.forEach((cloud, idx) => {
            cloud.rotation.y = this.time * 0.1 * (idx + 1);
            cloud.rotation.x = Math.sin(this.time * 0.05 + idx) * 0.2;
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
