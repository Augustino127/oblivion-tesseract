import * as THREE from 'three';
import { Scene } from './Scene.js';
import { PhysicalState, FormationTimeline } from '../core/PhysicalState.js';

/**
 * Spirale de Fibonacci / Spirale d'Or
 *
 * Le pattern universel retrouvé dans :
 * - Coquilles d'escargot (nautile)
 * - Galaxies spirales
 * - Tournesols
 * - Ouragans
 * - ADN
 * - Architecture
 *
 * États : Rectangle d'or → Carrés Fibonacci → Spirale 2D → Spirale 3D
 */
export class FibonacciSpiralScene extends Scene {
    constructor() {
        super(
            'Spirale d\'Or',
            'Le pattern universel de la nature - Nombre d\'or φ = 1.618...'
        );

        this.phi = (1 + Math.sqrt(5)) / 2; // Nombre d'or
        this.fibSequence = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144];

        this.states = this.createPhysicalStates();
        this.currentStateIndex = 0;
        this.formationTimeline = this.createFormationTimeline();

        // Objets
        this.spiralCurve = null;
        this.rectangles = [];
        this.spiral3D = null;
        this.particles = null;
        this.labels = [];
        this.exampleLabels = [];

        this.time = 0;
        this.formationProgress = 0;
    }

    /**
     * Crée un sprite de texte pour les labels
     */
    createTextSprite(text, parameters = {}) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        const fontSize = parameters.fontSize || 64;
        const fontFace = parameters.fontFace || 'Courier New';
        const textColor = parameters.textColor || '#FFFFFF';
        const backgroundColor = parameters.backgroundColor || 'rgba(0, 0, 0, 0.6)';
        const padding = parameters.padding || 10;

        // Mesurer le texte pour définir la taille du canvas
        context.font = `${fontSize}px ${fontFace}`;
        const metrics = context.measureText(text);
        const textWidth = metrics.width;

        canvas.width = textWidth + padding * 2;
        canvas.height = fontSize + padding * 2;

        // Redessiner avec la bonne taille
        context.font = `${fontSize}px ${fontFace}`;
        context.fillStyle = backgroundColor;
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.fillStyle = textColor;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(text, canvas.width / 2, canvas.height / 2);

        // Créer le sprite
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            opacity: 0.9
        });
        const sprite = new THREE.Sprite(spriteMaterial);

        // Ajuster l'échelle du sprite
        const scale = 0.5;
        sprite.scale.set(scale * canvas.width / 100, scale * canvas.height / 100, 1);

        return sprite;
    }

    createPhysicalStates() {
        return [
            new PhysicalState(
                'Rectangle d\'Or',
                'Rectangle aux proportions φ - Base de la spirale',
                {
                    stage: 'rectangles',
                    dimension: '2D',
                    spiralTurns: 0
                }
            ),
            new PhysicalState(
                'Carrés de Fibonacci',
                'Suite de Fibonacci : 1, 1, 2, 3, 5, 8, 13...',
                {
                    stage: 'squares',
                    dimension: '2D',
                    spiralTurns: 0
                }
            ),
            new PhysicalState(
                'Spirale 2D',
                'Spirale logarithmique dans le plan',
                {
                    stage: 'spiral2D',
                    dimension: '2D',
                    spiralTurns: 3
                }
            ),
            new PhysicalState(
                'Spirale 3D (Coquillage)',
                'Extension en 3 dimensions - Nautile',
                {
                    stage: 'spiral3D',
                    dimension: '3D',
                    spiralTurns: 5
                }
            )
        ];
    }

    createFormationTimeline() {
        const timeline = new FormationTimeline();

        timeline.addStage('Rectangle d\'Or', 2, this.states[0], {
            onUpdate: (p) => { this.formationProgress = p * 0.25; }
        });

        timeline.addStage('Carrés Fibonacci', 3, this.states[1], {
            onUpdate: (p) => { this.formationProgress = 0.25 + p * 0.25; }
        });

        timeline.addStage('Spirale 2D', 3, this.states[2], {
            onUpdate: (p) => { this.formationProgress = 0.5 + p * 0.25; }
        });

        timeline.addStage('Spirale 3D', 4, this.states[3], {
            onUpdate: (p) => { this.formationProgress = 0.75 + p * 0.25; }
        });

        timeline.loopMode = 'loop';
        return timeline;
    }

    init() {
        this.createGoldenRectangles();
        this.createFibonacciSquares();
        this.createSpiral2D();
        this.createSpiral3D();
        this.createEducationalLabels();
        this.maxLevels = this.states.length;

        this.displayMode = 'final';
        this.formationProgress = 1.0;
    }

    createEducationalLabels() {
        // Label du nombre d'or (visible avec le rectangle)
        const phiLabel = this.createTextSprite('φ = 1.618...', {
            fontSize: 56,
            textColor: '#FFD700',
            backgroundColor: 'rgba(0, 0, 0, 0.8)'
        });
        phiLabel.position.set(0, -2, 0);
        phiLabel.userData.type = 'rectangle';
        phiLabel.visible = false;
        this.scene.add(phiLabel);
        this.objects.push(phiLabel);

        // Formule de la suite de Fibonacci (visible avec les carrés)
        const fibFormulaLabel = this.createTextSprite('F(n) = F(n-1) + F(n-2)', {
            fontSize: 48,
            textColor: '#00FFFF',
            backgroundColor: 'rgba(0, 0, 0, 0.8)'
        });
        fibFormulaLabel.position.set(0, -3, 0);
        fibFormulaLabel.userData.type = 'square';
        fibFormulaLabel.visible = false;
        this.scene.add(fibFormulaLabel);
        this.objects.push(fibFormulaLabel);

        // Exemples dans la nature (visible avec la spirale 3D)
        const examples = [
            { text: 'Coquilles 🐚', pos: [-4, 3, 0] },
            { text: 'Galaxies 🌌', pos: [-4, 2.3, 0] },
            { text: 'Tournesols 🌻', pos: [-4, 1.6, 0] },
            { text: 'Ouragans 🌀', pos: [-4, 0.9, 0] }
        ];

        examples.forEach(ex => {
            const label = this.createTextSprite(ex.text, {
                fontSize: 40,
                textColor: '#FFFFFF',
                backgroundColor: 'rgba(0, 0, 0, 0.7)'
            });
            label.position.set(ex.pos[0], ex.pos[1], ex.pos[2]);
            label.userData.type = 'spiral3D';
            label.visible = false;
            this.scene.add(label);
            this.objects.push(label);
            this.exampleLabels.push(label);
        });

        // Équation de la spirale logarithmique (visible avec spirale 2D)
        const spiralFormulaLabel = this.createTextSprite('r = a·e^(bθ)', {
            fontSize: 48,
            textColor: '#00FFFF',
            backgroundColor: 'rgba(0, 0, 0, 0.8)'
        });
        spiralFormulaLabel.position.set(0, -3.5, 0);
        spiralFormulaLabel.userData.type = 'spiral2D';
        spiralFormulaLabel.visible = false;
        this.scene.add(spiralFormulaLabel);
        this.objects.push(spiralFormulaLabel);
    }

    createGoldenRectangles() {
        // Rectangle d'or principal
        const width = 3;
        const height = width / this.phi;

        const geometry = new THREE.PlaneGeometry(width, height);
        const material = new THREE.LineBasicMaterial({ color: 0xFFD700 });

        const edges = new THREE.EdgesGeometry(geometry);
        const rect = new THREE.LineSegments(edges, material);
        rect.userData.type = 'rectangle';

        this.scene.add(rect);
        this.objects.push(rect);
        this.rectangles.push(rect);

        // Ajouter un titre pour le rectangle d'or
        const titleLabel = this.createTextSprite('Rectangle d\'Or', {
            fontSize: 52,
            textColor: '#FFD700',
            backgroundColor: 'rgba(0, 0, 0, 0.8)'
        });
        titleLabel.position.set(0, 2.2, 0);
        titleLabel.userData.type = 'rectangle';
        titleLabel.visible = false;
        this.scene.add(titleLabel);
        this.objects.push(titleLabel);
    }

    createFibonacciSquares() {
        // Carrés de Fibonacci en spirale
        let x = 0, y = 0;
        let direction = 0; // 0=right, 1=up, 2=left, 3=down

        for (let i = 0; i < 8; i++) {
            const size = this.fibSequence[i] * 0.2;
            const fibNumber = this.fibSequence[i];

            const geometry = new THREE.PlaneGeometry(size, size);
            const material = new THREE.MeshBasicMaterial({
                color: new THREE.Color().setHSL(i / 8, 0.7, 0.5),
                transparent: true,
                opacity: 0.7,
                side: THREE.DoubleSide
            });

            const square = new THREE.Mesh(geometry, material);
            square.position.set(x + size/2, y + size/2, 0);
            square.userData.type = 'square';
            square.visible = false;

            this.scene.add(square);
            this.objects.push(square);

            // Ajouter un label avec le numéro de Fibonacci
            const label = this.createTextSprite(fibNumber.toString(), {
                fontSize: 48,
                textColor: '#FFD700',
                backgroundColor: 'rgba(0, 0, 0, 0.7)'
            });
            label.position.set(x + size/2, y + size/2, 0.1);
            label.userData.type = 'square';
            label.visible = false;

            this.scene.add(label);
            this.objects.push(label);
            this.labels.push(label);

            // Calculer position suivante
            switch(direction) {
                case 0: x += size; break;
                case 1: y += size; break;
                case 2: x -= size; break;
                case 3: y -= size; break;
            }
            direction = (direction + 1) % 4;
        }
    }

    createSpiral2D() {
        // Spirale logarithmique
        const points = [];
        const turns = 5;
        const segments = 200;

        for (let i = 0; i <= segments; i++) {
            const t = (i / segments) * turns * Math.PI * 2;
            const r = 0.1 * Math.pow(this.phi, t / (Math.PI / 2));

            points.push(new THREE.Vector3(
                r * Math.cos(t),
                r * Math.sin(t),
                0
            ));
        }

        const curve = new THREE.CatmullRomCurve3(points);
        const geometry = new THREE.TubeGeometry(curve, segments, 0.02, 8, false);
        const material = new THREE.MeshBasicMaterial({
            color: 0x00FFFF,
            transparent: true,
            opacity: 0.8
        });

        this.spiralCurve = new THREE.Mesh(geometry, material);
        this.spiralCurve.userData.type = 'spiral2D';
        this.spiralCurve.visible = false;

        this.scene.add(this.spiralCurve);
        this.objects.push(this.spiralCurve);
    }

    createSpiral3D() {
        // Coquillage 3D (nautile)
        const points = [];
        const turns = 4;
        const segments = 300;

        for (let i = 0; i <= segments; i++) {
            const t = (i / segments) * turns * Math.PI * 2;
            const r = 0.1 * Math.pow(this.phi, t / (Math.PI / 2));
            const z = t * 0.15; // Extension verticale

            points.push(new THREE.Vector3(
                r * Math.cos(t),
                r * Math.sin(t),
                z
            ));
        }

        const curve = new THREE.CatmullRomCurve3(points);
        const geometry = new THREE.TubeGeometry(curve, segments, 0.04, 16, false);

        // Gradient de couleur le long de la spirale
        const colors = [];
        for (let i = 0; i <= segments; i++) {
            const hue = (i / segments) * 0.6; // De cyan à violet
            const color = new THREE.Color().setHSL(hue, 0.8, 0.5);
            colors.push(color.r, color.g, color.b);
            colors.push(color.r, color.g, color.b);
        }

        const material = new THREE.MeshPhongMaterial({
            color: 0xFFFFFF,
            shininess: 100,
            transparent: true,
            opacity: 0.9
        });

        this.spiral3D = new THREE.Mesh(geometry, material);
        this.spiral3D.userData.type = 'spiral3D';
        this.spiral3D.visible = false;

        this.scene.add(this.spiral3D);
        this.objects.push(this.spiral3D);
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

        // Afficher selon l'état
        this.objects.forEach(obj => {
            if (obj.userData.type === 'rectangle') {
                obj.visible = stage === 'rectangles';
            } else if (obj.userData.type === 'square') {
                obj.visible = stage === 'squares' || stage === 'spiral2D' || stage === 'spiral3D';
            } else if (obj.userData.type === 'spiral2D') {
                obj.visible = stage === 'spiral2D' || stage === 'spiral3D';
            } else if (obj.userData.type === 'spiral3D') {
                obj.visible = stage === 'spiral3D';
            }
        });

        // Rotation douce
        if (this.spiral3D && this.spiral3D.visible) {
            this.spiral3D.rotation.z = this.time * 0.2;
            this.spiral3D.rotation.x = Math.sin(this.time * 0.3) * 0.3;
        }

        if (this.spiralCurve && this.spiralCurve.visible) {
            this.spiralCurve.rotation.z = this.time * 0.1;
        }
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
