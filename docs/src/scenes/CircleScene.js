import * as THREE from 'three';
import { Scene } from './Scene.js';
import { PhysicalState, FormationTimeline } from '../core/PhysicalState.js';

/**
 * CircleScene - Le cercle et π
 *
 * Démonstration visuelle de π = C/d
 * La circonférence divisée par le diamètre donne toujours π
 *
 * États : Point → Rayon → Cercle → Circonférence déroulée → π révélé
 */
export class CircleScene extends Scene {
    constructor() {
        super(
            'Cercle & π',
            'Découverte de π : Circonférence / Diamètre = 3.14159...'
        );

        this.states = this.createPhysicalStates();
        this.currentStateIndex = 0;
        this.formationTimeline = this.createFormationTimeline();

        // Objets
        this.centerPoint = null;
        this.radius = null;
        this.circle = null;
        this.diameter = null;
        this.circumferenceUnrolled = null;
        this.labels = [];
        this.measurementLines = [];

        this.time = 0;
        this.circleRadius = 2;
    }

    createPhysicalStates() {
        return [
            new PhysicalState(
                'Point Central',
                'Tout commence par un point',
                {
                    stage: 'point',
                    showCenter: true
                }
            ),
            new PhysicalState(
                'Rayon',
                'Distance du centre au bord : r',
                {
                    stage: 'radius',
                    showCenter: true,
                    showRadius: true
                }
            ),
            new PhysicalState(
                'Cercle Complet',
                'Ensemble des points à distance r du centre',
                {
                    stage: 'circle',
                    showCenter: true,
                    showRadius: true,
                    showCircle: true
                }
            ),
            new PhysicalState(
                'Diamètre',
                'Diamètre d = 2r, traverse le cercle',
                {
                    stage: 'diameter',
                    showCircle: true,
                    showDiameter: true
                }
            ),
            new PhysicalState(
                'Circonférence Déroulée',
                'C = π × d = 2πr',
                {
                    stage: 'unrolled',
                    showCircle: true,
                    showDiameter: true,
                    showUnrolled: true
                }
            ),
            new PhysicalState(
                'π Révélé',
                'π = C/d ≈ 3.14159...',
                {
                    stage: 'pi_revealed',
                    showAll: true
                }
            )
        ];
    }

    createFormationTimeline() {
        const timeline = new FormationTimeline();

        timeline.addStage('Point Central', 2, this.states[0]);
        timeline.addStage('Rayon', 2, this.states[1]);
        timeline.addStage('Cercle Complet', 3, this.states[2]);
        timeline.addStage('Diamètre', 2, this.states[3]);
        timeline.addStage('Circonférence Déroulée', 3, this.states[4]);
        timeline.addStage('π Révélé', 3, this.states[5]);

        timeline.loopMode = 'loop';
        return timeline;
    }

    init() {
        this.createCenterPoint();
        this.createRadius();
        this.createCircle();
        this.createDiameter();
        this.createUnrolledCircumference();
        this.createLabels();
        this.maxLevels = this.states.length;

        this.displayMode = 'final';
        this.currentStateIndex = 5; // π révélé par défaut
    }

    createCenterPoint() {
        const geometry = new THREE.SphereGeometry(0.1, 16, 16);
        const material = new THREE.MeshBasicMaterial({
            color: 0xFFD700
        });

        this.centerPoint = new THREE.Mesh(geometry, material);
        this.centerPoint.visible = false;

        this.scene.add(this.centerPoint);
        this.objects.push(this.centerPoint);
    }

    createRadius() {
        // Ligne du centre au bord
        const points = [
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(this.circleRadius, 0, 0)
        ];

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: 0x00FFFF,
            linewidth: 3
        });

        this.radius = new THREE.Line(geometry, material);
        this.radius.visible = false;

        this.scene.add(this.radius);
        this.objects.push(this.radius);

        // Point au bout du rayon
        const pointGeometry = new THREE.SphereGeometry(0.08, 16, 16);
        const pointMaterial = new THREE.MeshBasicMaterial({
            color: 0x00FFFF
        });
        const radiusPoint = new THREE.Mesh(pointGeometry, pointMaterial);
        radiusPoint.position.set(this.circleRadius, 0, 0);
        this.radius.add(radiusPoint);
    }

    createCircle() {
        // Cercle comme ligne
        const segments = 128;
        const points = [];

        for (let i = 0; i <= segments; i++) {
            const theta = (i / segments) * Math.PI * 2;
            points.push(new THREE.Vector3(
                Math.cos(theta) * this.circleRadius,
                Math.sin(theta) * this.circleRadius,
                0
            ));
        }

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: 0xFF00FF,
            linewidth: 2
        });

        this.circle = new THREE.Line(geometry, material);
        this.circle.visible = false;

        this.scene.add(this.circle);
        this.objects.push(this.circle);
    }

    createDiameter() {
        // Ligne traversant le cercle
        const points = [
            new THREE.Vector3(-this.circleRadius, 0, 0),
            new THREE.Vector3(this.circleRadius, 0, 0)
        ];

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: 0xFFFF00,
            linewidth: 3
        });

        this.diameter = new THREE.Line(geometry, material);
        this.diameter.visible = false;

        this.scene.add(this.diameter);
        this.objects.push(this.diameter);
    }

    createUnrolledCircumference() {
        // Circonférence "déroulée" en ligne droite
        const circumference = 2 * Math.PI * this.circleRadius;

        const points = [
            new THREE.Vector3(-circumference / 2, -3, 0),
            new THREE.Vector3(circumference / 2, -3, 0)
        ];

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: 0xFF00FF,
            linewidth: 3
        });

        this.circumferenceUnrolled = new THREE.Line(geometry, material);
        this.circumferenceUnrolled.visible = false;

        this.scene.add(this.circumferenceUnrolled);
        this.objects.push(this.circumferenceUnrolled);

        // Ligne de comparaison avec diamètre
        const diameterPoints = [
            new THREE.Vector3(-this.circleRadius, -3.5, 0),
            new THREE.Vector3(this.circleRadius, -3.5, 0)
        ];

        const diameterGeometry = new THREE.BufferGeometry().setFromPoints(diameterPoints);
        const diameterMaterial = new THREE.LineBasicMaterial({
            color: 0xFFFF00,
            linewidth: 2
        });

        const diameterComparison = new THREE.Line(diameterGeometry, diameterMaterial);
        this.circumferenceUnrolled.add(diameterComparison);
    }

    createLabels() {
        const createTextSprite = (text, color = '#FFFFFF', fontSize = 48) => {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

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

            const scale = 0.4;
            sprite.scale.set(scale * canvas.width / 100, scale * canvas.height / 100, 1);

            return sprite;
        };

        // Label rayon "r"
        const labelR = createTextSprite('r', '#00FFFF');
        labelR.position.set(this.circleRadius / 2, 0.3, 0);
        labelR.userData.type = 'radius';
        labelR.visible = false;
        this.scene.add(labelR);
        this.objects.push(labelR);
        this.labels.push(labelR);

        // Label diamètre "d = 2r"
        const labelD = createTextSprite('d = 2r', '#FFFF00');
        labelD.position.set(0, -0.4, 0);
        labelD.userData.type = 'diameter';
        labelD.visible = false;
        this.scene.add(labelD);
        this.objects.push(labelD);
        this.labels.push(labelD);

        // Label circonférence "C = 2πr"
        const labelC = createTextSprite('C = 2πr', '#FF00FF');
        labelC.position.set(0, 2.8, 0);
        labelC.userData.type = 'circle';
        labelC.visible = false;
        this.scene.add(labelC);
        this.objects.push(labelC);
        this.labels.push(labelC);

        // Label π
        const labelPi = createTextSprite('π = C/d ≈ 3.14159...', '#FFD700', 64);
        labelPi.position.set(0, -2.2, 0);
        labelPi.userData.type = 'unrolled';
        labelPi.visible = false;
        this.scene.add(labelPi);
        this.objects.push(labelPi);
        this.labels.push(labelPi);

        // Valeurs numériques
        const r = this.circleRadius;
        const d = 2 * r;
        const c = 2 * Math.PI * r;

        const valuesLabel = createTextSprite(
            `r = ${r.toFixed(2)}  |  d = ${d.toFixed(2)}  |  C = ${c.toFixed(3)}`,
            '#FFFFFF',
            40
        );
        valuesLabel.position.set(0, -4.5, 0);
        valuesLabel.userData.type = 'pi_revealed';
        valuesLabel.visible = false;
        this.scene.add(valuesLabel);
        this.objects.push(valuesLabel);
        this.labels.push(valuesLabel);
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

        // Gestion de la visibilité
        this.updateVisibility(stage);

        // Animation du rayon qui tourne
        if (this.radius.visible) {
            this.radius.rotation.z = this.time * 0.5;
        }

        // Animation du point sur le cercle
        if (this.circle.visible && stage === 'circle') {
            // Point qui parcourt le cercle
            const theta = this.time * 0.8;
            const x = Math.cos(theta) * this.circleRadius;
            const y = Math.sin(theta) * this.circleRadius;

            // On pourrait ajouter un point animé ici
        }
    }

    updateVisibility(stage) {
        // Centre
        this.centerPoint.visible = (stage === 'point' || stage === 'radius');

        // Rayon
        this.radius.visible = (stage === 'radius' || stage === 'circle');

        // Cercle
        this.circle.visible = (stage === 'circle' || stage === 'diameter' ||
                               stage === 'unrolled' || stage === 'pi_revealed');

        // Diamètre
        this.diameter.visible = (stage === 'diameter' || stage === 'unrolled' ||
                                stage === 'pi_revealed');

        // Circonférence déroulée
        this.circumferenceUnrolled.visible = (stage === 'unrolled' || stage === 'pi_revealed');

        // Labels
        this.labels.forEach(label => {
            const type = label.userData.type;

            if (type === 'radius') {
                label.visible = (stage === 'radius' || stage === 'circle');
            } else if (type === 'diameter') {
                label.visible = (stage === 'diameter' || stage === 'unrolled' || stage === 'pi_revealed');
            } else if (type === 'circle') {
                label.visible = (stage === 'circle' || stage === 'unrolled' || stage === 'pi_revealed');
            } else if (type === 'unrolled') {
                label.visible = (stage === 'unrolled' || stage === 'pi_revealed');
            } else if (type === 'pi_revealed') {
                label.visible = (stage === 'pi_revealed');
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
