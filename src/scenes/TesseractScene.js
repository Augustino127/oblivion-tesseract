import * as THREE from 'three';
import { Scene } from './Scene.js';
import {
    generateTesseractVertices,
    generateTesseractEdges,
    project4Dto3D,
    rotate4D_XW,
    rotate4D_YW,
    rotate4D_ZW
} from '../utils/math.js';

/**
 * Scène du Tesseract (Hypercube 4D)
 *
 * Niveaux :
 * 1. Rotation simple 4D
 * 2. Rotation double avec morphing
 * 3. Rotation complexe avec pulsation
 */
export class TesseractScene extends Scene {
    constructor() {
        super(
            'Tesseract',
            'Un hypercube 4D projeté en 3D - Les deux cubes imbriqués représentent la projection d\'une forme à 4 dimensions'
        );
        this.maxLevels = 3;

        // Géométrie 4D
        this.vertices4D = generateTesseractVertices(1);
        this.edges = generateTesseractEdges();

        // Angles de rotation
        this.angleXW = 0;
        this.angleYW = 0;
        this.angleZW = 0;

        // Objets 3D
        this.lineGroup = null;
        this.innerCube = null;
        this.outerCube = null;

        // Animation
        this.time = 0;
    }

    init() {
        this.createTesseract();
        this.createHelperCubes();
    }

    createTesseract() {
        // Groupe pour toutes les lignes
        this.lineGroup = new THREE.Group();

        // Créer un matériau pour les lignes
        const material = new THREE.LineBasicMaterial({
            color: 0x00ffff,
            linewidth: 2,
            opacity: 0.8,
            transparent: true
        });

        // Créer les arêtes
        this.edges.forEach(() => {
            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(6); // 2 points * 3 coordonnées
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

            const line = new THREE.Line(geometry, material);
            this.lineGroup.add(line);
        });

        this.scene.add(this.lineGroup);
        this.objects.push(this.lineGroup);
    }

    createHelperCubes() {
        // Cube intérieur (wireframe)
        const innerGeometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
        const innerMaterial = new THREE.MeshBasicMaterial({
            color: 0xff00ff,
            wireframe: true,
            opacity: 0.3,
            transparent: true
        });
        this.innerCube = new THREE.Mesh(innerGeometry, innerMaterial);
        this.scene.add(this.innerCube);
        this.objects.push(this.innerCube);

        // Cube extérieur (wireframe)
        const outerGeometry = new THREE.BoxGeometry(3, 3, 3);
        const outerMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            wireframe: true,
            opacity: 0.2,
            transparent: true
        });
        this.outerCube = new THREE.Mesh(outerGeometry, outerMaterial);
        this.scene.add(this.outerCube);
        this.objects.push(this.outerCube);
    }

    update() {
        this.time += 0.016; // ~60fps

        // Vitesses de rotation selon le niveau
        let speedXW = 0.005;
        let speedYW = 0.003;
        let speedZW = 0.002;

        switch (this.currentLevel) {
            case 1:
                // Niveau 1 : Rotation simple et lente
                speedXW = 0.005;
                speedYW = 0.003;
                speedZW = 0;
                break;

            case 2:
                // Niveau 2 : Rotation sur tous les axes
                speedXW = 0.008;
                speedYW = 0.006;
                speedZW = 0.004;
                break;

            case 3:
                // Niveau 3 : Rotation complexe avec variation
                speedXW = 0.01 * (1 + 0.5 * Math.sin(this.time * 0.5));
                speedYW = 0.008 * (1 + 0.5 * Math.cos(this.time * 0.3));
                speedZW = 0.006 * (1 + 0.5 * Math.sin(this.time * 0.7));
                break;
        }

        // Mise à jour des angles
        this.angleXW += speedXW;
        this.angleYW += speedYW;
        this.angleZW += speedZW;

        // Rotation et projection des sommets 4D
        const projectedVertices = this.vertices4D.map(vertex => {
            let rotated = vertex;

            // Rotations 4D successives
            rotated = rotate4D_XW(rotated, this.angleXW);
            rotated = rotate4D_YW(rotated, this.angleYW);

            if (this.currentLevel >= 2) {
                rotated = rotate4D_ZW(rotated, this.angleZW);
            }

            // Projection 4D -> 3D
            return project4Dto3D(rotated, 2);
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
        });

        // Animation des cubes helpers
        this.updateHelperCubes();
    }

    updateHelperCubes() {
        // Rotation synchronisée
        this.innerCube.rotation.x = this.angleXW * 0.5;
        this.innerCube.rotation.y = this.angleYW * 0.5;
        this.innerCube.rotation.z = this.angleZW * 0.5;

        this.outerCube.rotation.x = -this.angleXW * 0.3;
        this.outerCube.rotation.y = -this.angleYW * 0.3;
        this.outerCube.rotation.z = -this.angleZW * 0.3;

        // Effet de pulsation au niveau 3
        if (this.currentLevel === 3) {
            const pulse = 1 + 0.1 * Math.sin(this.time * 2);
            this.innerCube.scale.setScalar(pulse);
            this.outerCube.scale.setScalar(1 / pulse);
        } else {
            this.innerCube.scale.setScalar(1);
            this.outerCube.scale.setScalar(1);
        }

        // Opacité selon le niveau
        const opacity = this.currentLevel === 1 ? 0.2 : 0.1;
        this.innerCube.material.opacity = opacity;
        this.outerCube.material.opacity = opacity;
    }

    onLevelChange() {
        console.log(`Tesseract niveau ${this.currentLevel}`);

        // Changer la couleur selon le niveau
        const colors = {
            1: 0x00ffff, // Cyan
            2: 0xff00ff, // Magenta
            3: 0xffff00  // Jaune
        };

        this.lineGroup.children.forEach(line => {
            line.material.color.setHex(colors[this.currentLevel]);
        });
    }
}
