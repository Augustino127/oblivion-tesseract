import * as THREE from 'three';
import { Scene } from './Scene.js';
import { PhysicalState, FormationTimeline } from '../core/PhysicalState.js';
import {
    generateTesseractVertices,
    generateTesseractEdges,
    project4Dto3D,
    rotate4D_XW,
    rotate4D_YW,
    rotate4D_ZW
} from '../utils/math.js';

/**
 * Tesseract Évolutif - Du patron à l'hypercube
 *
 * États de formation :
 * 1. Patron 3D (8 cubes dépliés)
 * 2. Début du pliage 4D (cubes qui se rapprochent)
 * 3. Pliage avancé (structure qui se referme)
 * 4. Hypercube complet (forme finale)
 *
 * États physiques (modes de visualisation) :
 * - Projection orthographique
 * - Projection stéréographique
 * - Projection perspective 4D
 */
export class TesseractSceneEvolved extends Scene {
    constructor() {
        super(
            'Tesseract',
            'Un hypercube 4D - Observez sa formation depuis le patron jusqu\'à la structure finale'
        );

        // Géométrie 4D
        this.vertices4D = generateTesseractVertices(1);
        this.edges = generateTesseractEdges();

        // États physiques
        this.states = this.createPhysicalStates();
        this.currentStateIndex = 0;

        // Timeline de formation
        this.formationTimeline = this.createFormationTimeline();

        // Angles de rotation
        this.angleXW = 0;
        this.angleYW = 0;
        this.angleZW = 0;

        // Objets 3D
        this.lineGroup = null;
        this.labelSprites = [];

        // Animation
        this.time = 0;
        this.formationProgress = 0; // 0 = patron, 1 = complet
    }

    createPhysicalStates() {
        return [
            new PhysicalState(
                'Projection Orthographique',
                'Projection parallèle - tous les rayons sont parallèles',
                {
                    projectionDistance: Infinity,
                    rotationSpeed: 0.005,
                    foldProgress: 1.0
                }
            ),
            new PhysicalState(
                'Projection Stéréographique',
                'Projection depuis un point - effet de perspective 4D',
                {
                    projectionDistance: 2,
                    rotationSpeed: 0.008,
                    foldProgress: 1.0
                }
            ),
            new PhysicalState(
                'Projection Proximale',
                'Point de vue très proche - distorsion extrême',
                {
                    projectionDistance: 1.2,
                    rotationSpeed: 0.012,
                    foldProgress: 1.0
                }
            ),
            new PhysicalState(
                'Patron Déplié',
                'Les 8 cubes 3D constituant le tesseract, dépliés dans l\'espace',
                {
                    projectionDistance: 2,
                    rotationSpeed: 0.003,
                    foldProgress: 0.0
                }
            )
        ];
    }

    createFormationTimeline() {
        const timeline = new FormationTimeline();

        // Stage 1 : Patron déplié
        timeline.addStage(
            'Patron 3D',
            3,
            this.states[3],
            {
                onEnter: () => console.log('Patron déplié'),
                onUpdate: (progress) => {
                    this.formationProgress = 0;
                }
            }
        );

        // Stage 2 : Début du pliage
        timeline.addStage(
            'Pliage 4D',
            4,
            new PhysicalState('Pliage', 'Les cubes commencent à se plier dans la 4ème dimension', {
                projectionDistance: 2,
                rotationSpeed: 0.006,
                foldProgress: 0.5
            }),
            {
                onUpdate: (progress) => {
                    this.formationProgress = 0.5 * progress;
                }
            }
        );

        // Stage 3 : Fermeture
        timeline.addStage(
            'Fermeture',
            3,
            new PhysicalState('Fermeture', 'La structure se referme', {
                projectionDistance: 2,
                rotationSpeed: 0.008,
                foldProgress: 0.9
            }),
            {
                onUpdate: (progress) => {
                    this.formationProgress = 0.5 + 0.4 * progress;
                }
            }
        );

        // Stage 4 : Hypercube complet
        timeline.addStage(
            'Hypercube',
            5,
            this.states[1],
            {
                onEnter: () => console.log('Formation complète !'),
                onUpdate: (progress) => {
                    this.formationProgress = 0.9 + 0.1 * progress;
                }
            }
        );

        timeline.loopMode = 'loop';
        return timeline;
    }

    init() {
        this.createTesseract();
        this.maxLevels = this.states.length;
    }

    createTesseract() {
        // Groupe pour toutes les lignes
        this.lineGroup = new THREE.Group();

        // Créer les arêtes avec gradient selon type
        this.edges.forEach((edge, idx) => {
            // Déterminer le type d'arête (3D ou 4D)
            const [i, j] = edge;
            const diff = i ^ j;
            const is4DEdge = diff === 8; // Arête connectant les deux cubes 3D

            const material = new THREE.LineBasicMaterial({
                color: is4DEdge ? 0xff00ff : 0x00ffff,
                linewidth: is4DEdge ? 3 : 2,
                opacity: is4DEdge ? 1.0 : 0.7,
                transparent: true
            });

            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(6);
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

            const line = new THREE.Line(geometry, material);
            line.userData = { is4DEdge, edgeIndex: idx };
            this.lineGroup.add(line);
        });

        this.scene.add(this.lineGroup);
        this.objects.push(this.lineGroup);
    }

    update() {
        this.time += 0.016;

        // Mise à jour de la timeline de formation
        this.formationTimeline.update(0.016);

        // État actuel (manuel ou depuis timeline)
        const currentState = this.formationTimeline.isPlaying
            ? this.formationTimeline.getCurrentState()
            : this.states[this.currentStateIndex];

        if (!currentState) return;

        const params = currentState.parameters;

        // Rotation 4D
        this.angleXW += params.rotationSpeed;
        this.angleYW += params.rotationSpeed * 0.7;
        this.angleZW += params.rotationSpeed * 0.5;

        // Calculer les positions en fonction du pliage
        const foldProgress = this.formationTimeline.isPlaying
            ? this.formationProgress
            : params.foldProgress;

        const projectedVertices = this.vertices4D.map((vertex, idx) => {
            let v4D = [...vertex];

            // Effet de dépliage : séparer les cubes en fonction de leur coordonnée W
            if (foldProgress < 1.0) {
                const cubeIndex = (idx & 8) >> 3; // 0 ou 1 selon le cube
                const unfoldOffset = (1 - foldProgress) * 4 * (cubeIndex * 2 - 1);
                v4D[3] += unfoldOffset;
            }

            // Rotations 4D
            let rotated = rotate4D_XW(v4D, this.angleXW);
            rotated = rotate4D_YW(rotated, this.angleYW);
            rotated = rotate4D_ZW(rotated, this.angleZW);

            // Projection 4D -> 3D
            return project4Dto3D(rotated, params.projectionDistance);
        });

        // Mise à jour des lignes
        this.lineGroup.children.forEach((line, index) => {
            const [i, j] = this.edges[index];
            const positions = line.geometry.attributes.position.array;

            positions[0] = projectedVertices[i][0];
            positions[1] = projectedVertices[i][1];
            positions[2] = projectedVertices[i][2];

            positions[3] = projectedVertices[j][0];
            positions[4] = projectedVertices[j][1];
            positions[5] = projectedVertices[j][2];

            line.geometry.attributes.position.needsUpdate = true;

            // Opacité variable pour les arêtes 4D pendant le dépliage
            if (line.userData.is4DEdge) {
                line.material.opacity = 0.3 + 0.7 * foldProgress;
            }
        });
    }

    setLevel(level) {
        super.setLevel(level);
        this.currentStateIndex = level - 1;
    }

    onLevelChange() {
        const state = this.states[this.currentStateIndex];
        if (state) {
            console.log(`État physique : ${state.name}`);
            // Mettre à jour la description
            this.description = state.description;
        }
    }

    // Contrôle de la timeline de formation
    playFormation() {
        this.formationTimeline.reset();
        this.formationTimeline.play();
    }

    pauseFormation() {
        this.formationTimeline.pause();
    }

    resetFormation() {
        this.formationTimeline.reset();
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
