import * as THREE from 'three';
import { Scene } from './Scene.js';
import { PhysicalState, FormationTimeline } from '../core/PhysicalState.js';

/**
 * TrigScene - Fonctions Trigonométriques
 *
 * Visualisation de sin, cos, tan sur le cercle unitaire
 * Montre comment ces fonctions émergent du cercle
 *
 * États : Cercle unitaire → Cos(θ) → Sin(θ) → Tan(θ) → Toutes ensemble
 */
export class TrigScene extends Scene {
    constructor() {
        super(
            'Trigonométrie',
            'Sin, Cos, Tan sur le cercle unitaire'
        );

        this.states = this.createPhysicalStates();
        this.currentStateIndex = 0;
        this.formationTimeline = this.createFormationTimeline();

        // Objets
        this.unitCircle = null;
        this.radiusLine = null;
        this.pointOnCircle = null;
        this.sinLine = null;
        this.cosLine = null;
        this.tanLine = null;
        this.axes = null;
        this.sinCurve = null;
        this.cosCurve = null;
        this.tanCurve = null;
        this.labels = [];

        this.time = 0;
        this.angle = 0;
    }

    createPhysicalStates() {
        return [
            new PhysicalState(
                'Cercle Unitaire',
                'Rayon = 1, centre à l\'origine',
                {
                    stage: 'circle',
                    showCircle: true
                }
            ),
            new PhysicalState(
                'Cosinus',
                'cos(θ) = projection sur axe X',
                {
                    stage: 'cos',
                    showCircle: true,
                    showCos: true
                }
            ),
            new PhysicalState(
                'Sinus',
                'sin(θ) = projection sur axe Y',
                {
                    stage: 'sin',
                    showCircle: true,
                    showSin: true
                }
            ),
            new PhysicalState(
                'Tangente',
                'tan(θ) = sin(θ)/cos(θ)',
                {
                    stage: 'tan',
                    showCircle: true,
                    showTan: true
                }
            ),
            new PhysicalState(
                'Courbes Complètes',
                'Visualisation des fonctions',
                {
                    stage: 'curves',
                    showAll: true
                }
            )
        ];
    }

    createFormationTimeline() {
        const timeline = new FormationTimeline();

        timeline.addStage('Cercle Unitaire', 2, this.states[0]);
        timeline.addStage('Cosinus', 3, this.states[1]);
        timeline.addStage('Sinus', 3, this.states[2]);
        timeline.addStage('Tangente', 3, this.states[3]);
        timeline.addStage('Courbes Complètes', 4, this.states[4]);

        timeline.loopMode = 'loop';
        return timeline;
    }

    init() {
        this.createAxes();
        this.createUnitCircle();
        this.createRadiusAndPoint();
        this.createProjections();
        this.createCurves();
        this.createLabels();
        this.maxLevels = this.states.length;

        this.displayMode = 'final';
        this.currentStateIndex = 4; // Courbes complètes par défaut
    }

    createAxes() {
        const group = new THREE.Group();

        // Axe X
        const xPoints = [
            new THREE.Vector3(-5, 0, 0),
            new THREE.Vector3(5, 0, 0)
        ];
        const xGeometry = new THREE.BufferGeometry().setFromPoints(xPoints);
        const xMaterial = new THREE.LineBasicMaterial({ color: 0x666666 });
        const xAxis = new THREE.Line(xGeometry, xMaterial);
        group.add(xAxis);

        // Axe Y
        const yPoints = [
            new THREE.Vector3(0, -3, 0),
            new THREE.Vector3(0, 3, 0)
        ];
        const yGeometry = new THREE.BufferGeometry().setFromPoints(yPoints);
        const yMaterial = new THREE.LineBasicMaterial({ color: 0x666666 });
        const yAxis = new THREE.Line(yGeometry, yMaterial);
        group.add(yAxis);

        this.axes = group;
        this.scene.add(this.axes);
        this.objects.push(this.axes);
    }

    createUnitCircle() {
        const segments = 128;
        const points = [];

        for (let i = 0; i <= segments; i++) {
            const theta = (i / segments) * Math.PI * 2;
            points.push(new THREE.Vector3(
                Math.cos(theta) * 2,
                Math.sin(theta) * 2,
                0
            ));
        }

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: 0xFFFFFF,
            linewidth: 2
        });

        this.unitCircle = new THREE.Line(geometry, material);
        this.unitCircle.visible = false;

        this.scene.add(this.unitCircle);
        this.objects.push(this.unitCircle);
    }

    createRadiusAndPoint() {
        // Ligne rayon
        const points = [
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(2, 0, 0)
        ];

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: 0x00FFFF,
            linewidth: 2
        });

        this.radiusLine = new THREE.Line(geometry, material);
        this.radiusLine.visible = false;

        // Point sur le cercle
        const pointGeometry = new THREE.SphereGeometry(0.1, 16, 16);
        const pointMaterial = new THREE.MeshBasicMaterial({
            color: 0xFFFF00
        });

        this.pointOnCircle = new THREE.Mesh(pointGeometry, pointMaterial);
        this.pointOnCircle.visible = false;

        this.scene.add(this.radiusLine);
        this.scene.add(this.pointOnCircle);
        this.objects.push(this.radiusLine);
        this.objects.push(this.pointOnCircle);
    }

    createProjections() {
        // Ligne cos (projection sur X)
        const cosPoints = [
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(2, 0, 0)
        ];
        const cosGeometry = new THREE.BufferGeometry().setFromPoints(cosPoints);
        const cosMaterial = new THREE.LineBasicMaterial({
            color: 0x00FF00,
            linewidth: 3
        });
        this.cosLine = new THREE.Line(cosGeometry, cosMaterial);
        this.cosLine.visible = false;

        // Ligne sin (projection sur Y)
        const sinPoints = [
            new THREE.Vector3(2, 0, 0),
            new THREE.Vector3(2, 2, 0)
        ];
        const sinGeometry = new THREE.BufferGeometry().setFromPoints(sinPoints);
        const sinMaterial = new THREE.LineBasicMaterial({
            color: 0xFF0000,
            linewidth: 3
        });
        this.sinLine = new THREE.Line(sinGeometry, sinMaterial);
        this.sinLine.visible = false;

        // Ligne tan (tangente au cercle)
        const tanPoints = [
            new THREE.Vector3(2, 0, 0),
            new THREE.Vector3(2, 3, 0)
        ];
        const tanGeometry = new THREE.BufferGeometry().setFromPoints(tanPoints);
        const tanMaterial = new THREE.LineBasicMaterial({
            color: 0xFF00FF,
            linewidth: 2
        });
        this.tanLine = new THREE.Line(tanGeometry, tanMaterial);
        this.tanLine.visible = false;

        this.scene.add(this.cosLine);
        this.scene.add(this.sinLine);
        this.scene.add(this.tanLine);
        this.objects.push(this.cosLine);
        this.objects.push(this.sinLine);
        this.objects.push(this.tanLine);
    }

    createCurves() {
        // Courbe sin(x)
        const sinPoints = [];
        const segments = 200;
        for (let i = 0; i <= segments; i++) {
            const x = (i / segments) * Math.PI * 4 - Math.PI * 2;
            const y = Math.sin(x);
            sinPoints.push(new THREE.Vector3(x, y, 0));
        }

        const sinGeometry = new THREE.BufferGeometry().setFromPoints(sinPoints);
        const sinMaterial = new THREE.LineBasicMaterial({
            color: 0xFF0000,
            linewidth: 2
        });

        this.sinCurve = new THREE.Line(sinGeometry, sinMaterial);
        this.sinCurve.position.set(0, 0, -3);
        this.sinCurve.visible = false;

        // Courbe cos(x)
        const cosPoints = [];
        for (let i = 0; i <= segments; i++) {
            const x = (i / segments) * Math.PI * 4 - Math.PI * 2;
            const y = Math.cos(x);
            cosPoints.push(new THREE.Vector3(x, y, 0));
        }

        const cosGeometry = new THREE.BufferGeometry().setFromPoints(cosPoints);
        const cosMaterial = new THREE.LineBasicMaterial({
            color: 0x00FF00,
            linewidth: 2
        });

        this.cosCurve = new THREE.Line(cosGeometry, cosMaterial);
        this.cosCurve.position.set(0, 0, -3);
        this.cosCurve.visible = false;

        // Courbe tan(x) - avec limite
        const tanPoints = [];
        for (let i = 0; i <= segments; i++) {
            const x = (i / segments) * Math.PI * 4 - Math.PI * 2;
            const y = Math.tan(x);

            // Limiter tan pour éviter les asymptotes infinies
            if (Math.abs(y) < 5) {
                tanPoints.push(new THREE.Vector3(x, y, 0));
            } else if (tanPoints.length > 0) {
                // Créer un nouveau segment après asymptote
                const tanSegGeometry = new THREE.BufferGeometry().setFromPoints(tanPoints.slice());
                const tanSegMaterial = new THREE.LineBasicMaterial({
                    color: 0xFF00FF,
                    linewidth: 2
                });
                const tanSeg = new THREE.Line(tanSegGeometry, tanSegMaterial);
                tanSeg.position.set(0, 0, -3);
                tanSeg.visible = false;
                this.scene.add(tanSeg);
                this.objects.push(tanSeg);

                tanPoints.length = 0;
            }
        }

        this.scene.add(this.sinCurve);
        this.scene.add(this.cosCurve);
        this.objects.push(this.sinCurve);
        this.objects.push(this.cosCurve);
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

        // Label cos
        const labelCos = createTextSprite('cos(θ)', '#00FF00');
        labelCos.position.set(1, -0.5, 0);
        labelCos.userData.type = 'cos';
        labelCos.visible = false;
        this.scene.add(labelCos);
        this.objects.push(labelCos);
        this.labels.push(labelCos);

        // Label sin
        const labelSin = createTextSprite('sin(θ)', '#FF0000');
        labelSin.position.set(2.5, 1, 0);
        labelSin.userData.type = 'sin';
        labelSin.visible = false;
        this.scene.add(labelSin);
        this.objects.push(labelSin);
        this.labels.push(labelSin);

        // Label tan
        const labelTan = createTextSprite('tan(θ)', '#FF00FF');
        labelTan.position.set(3, 1.5, 0);
        labelTan.userData.type = 'tan';
        labelTan.visible = false;
        this.scene.add(labelTan);
        this.objects.push(labelTan);
        this.labels.push(labelTan);

        // Formule principale
        const formula = createTextSprite('x² + y² = 1', '#FFFFFF', 40);
        formula.position.set(0, 3, 0);
        formula.userData.type = 'circle';
        formula.visible = false;
        this.scene.add(formula);
        this.objects.push(formula);
        this.labels.push(formula);
    }

    update() {
        this.time += 0.016;
        this.angle = this.time * 0.8;

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

        // Animation du point sur le cercle
        const x = Math.cos(this.angle) * 2;
        const y = Math.sin(this.angle) * 2;

        if (this.pointOnCircle.visible) {
            this.pointOnCircle.position.set(x, y, 0);
        }

        // Mise à jour ligne rayon
        if (this.radiusLine.visible) {
            const positions = this.radiusLine.geometry.attributes.position.array;
            positions[3] = x;
            positions[4] = y;
            this.radiusLine.geometry.attributes.position.needsUpdate = true;
        }

        // Mise à jour projections
        if (this.cosLine.visible) {
            const positions = this.cosLine.geometry.attributes.position.array;
            positions[3] = x;
            positions[4] = 0;
            this.cosLine.geometry.attributes.position.needsUpdate = true;
        }

        if (this.sinLine.visible) {
            const positions = this.sinLine.geometry.attributes.position.array;
            positions[0] = x;
            positions[1] = 0;
            positions[3] = x;
            positions[4] = y;
            this.sinLine.geometry.attributes.position.needsUpdate = true;
        }

        if (this.tanLine.visible) {
            const tanValue = Math.tan(this.angle);
            const clampedTan = Math.max(-5, Math.min(5, tanValue));

            const positions = this.tanLine.geometry.attributes.position.array;
            positions[0] = 2;
            positions[1] = 0;
            positions[3] = 2;
            positions[4] = clampedTan;
            this.tanLine.geometry.attributes.position.needsUpdate = true;
        }
    }

    updateVisibility(stage) {
        this.unitCircle.visible = true;
        this.radiusLine.visible = true;
        this.pointOnCircle.visible = true;

        this.cosLine.visible = (stage === 'cos' || stage === 'curves');
        this.sinLine.visible = (stage === 'sin' || stage === 'curves');
        this.tanLine.visible = (stage === 'tan');

        this.sinCurve.visible = (stage === 'curves');
        this.cosCurve.visible = (stage === 'curves');

        this.labels.forEach(label => {
            const type = label.userData.type;
            if (type === 'cos') {
                label.visible = (stage === 'cos' || stage === 'curves');
            } else if (type === 'sin') {
                label.visible = (stage === 'sin' || stage === 'curves');
            } else if (type === 'tan') {
                label.visible = (stage === 'tan');
            } else if (type === 'circle') {
                label.visible = (stage === 'circle');
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

    /**
     * Définir un chemin de caméra cinématique pour les fonctions trigonométriques
     */
    getCinematicPath() {
        const center = { x: 0, y: 0, z: 0 };
        const duration = 24; // 24 secondes

        const keyframes = [];

        // Vue initiale centrée sur le cercle unitaire
        keyframes.push({
            time: 0,
            position: { x: 0, y: 0, z: 10 },
            target: center,
            fov: 75,
            easing: 'smoothstep'
        });

        // Zoom progressif pour voir les détails
        keyframes.push({
            time: duration * 0.1,
            position: { x: 1, y: 2, z: 7 },
            target: center,
            fov: 65,
            easing: 'easeInOutCubic'
        });

        // Vue du côté droit pour voir cosinus (axe X)
        keyframes.push({
            time: duration * 0.25,
            position: { x: 8, y: 3, z: 2 },
            target: { x: 0, y: 0, z: 0 },
            fov: 70,
            easing: 'smoothstep'
        });

        // Vue du haut pour voir sinus (axe Y)
        keyframes.push({
            time: duration * 0.4,
            position: { x: 2, y: 9, z: 2 },
            target: center,
            fov: 75,
            easing: 'smoothstep'
        });

        // Vue oblique pour voir le point rotatif
        keyframes.push({
            time: duration * 0.55,
            position: { x: 6, y: 5, z: 6 },
            target: center,
            fov: 70,
            easing: 'smoothstep'
        });

        // Vue large pour voir les courbes complètes
        keyframes.push({
            time: duration * 0.7,
            position: { x: -4, y: 4, z: 10 },
            target: { x: 0, y: 0, z: -5 },
            fov: 80,
            easing: 'easeInOutCubic'
        });

        // Vue finale panoramique
        keyframes.push({
            time: duration * 0.9,
            position: { x: -8, y: 6, z: 4 },
            target: center,
            fov: 75,
            easing: 'smoothstep'
        });

        // Retour à la position initiale
        keyframes.push({
            time: duration,
            position: { x: 0, y: 0, z: 10 },
            target: center,
            fov: 75,
            easing: 'easeOutCubic'
        });

        return keyframes;
    }
}
