import * as THREE from 'three';
import { Scene } from './Scene.js';
import { PhysicalState, FormationTimeline } from '../core/PhysicalState.js';

/**
 * Système Solaire et Évolution Stellaire
 *
 * Montre l'évolution complète d'un système stellaire :
 * - Formation depuis une nébuleuse
 * - Système solaire avec planètes en orbite
 * - Évolution stellaire : Géante Rouge → Supernova → Naine Blanche
 *
 * États : Nébuleuse → Disque protoplanétaire → Système mature →
 *         Géante Rouge → Supernova → Naine Blanche
 */
export class SolarSystemScene extends Scene {
    constructor() {
        super(
            'Système Solaire',
            'Évolution d\'un système stellaire - De la naissance à la mort d\'une étoile'
        );

        this.states = this.createPhysicalStates();
        this.currentStateIndex = 0;
        this.formationTimeline = this.createFormationTimeline();

        // Objets
        this.star = null;
        this.planets = [];
        this.orbits = [];
        this.nebula = null;
        this.supernovaParticles = null;
        this.whiteDwarf = null;
        this.asteroidBelt = [];

        // Paramètres orbitaux
        this.planetData = [
            { name: 'Mercure', distance: 2, size: 0.15, color: 0x8C7853, speed: 4.15, tilt: 0.03 },
            { name: 'Vénus', distance: 2.8, size: 0.25, color: 0xFFC649, speed: 1.62, tilt: 0.04 },
            { name: 'Terre', distance: 3.8, size: 0.28, color: 0x2E7AB2, speed: 1.0, tilt: 0.41 },
            { name: 'Mars', distance: 4.6, size: 0.18, color: 0xC1440E, speed: 0.53, tilt: 0.44 },
            { name: 'Jupiter', distance: 6.5, size: 0.7, color: 0xC88B3A, speed: 0.08, tilt: 0.05 },
            { name: 'Saturne', distance: 8.5, size: 0.6, color: 0xFAD5A5, speed: 0.03, tilt: 0.47, rings: true },
            { name: 'Uranus', distance: 10.2, size: 0.35, color: 0x4FD0E7, speed: 0.01, tilt: 1.71 },
            { name: 'Neptune', distance: 11.5, size: 0.34, color: 0x4166F5, speed: 0.006, tilt: 0.49 }
        ];

        this.time = 0;
        this.explosionTime = 0;
        this.supernovaActive = false;
        this.lastStage = null; // Pour détecter les changements d'état
    }

    createPhysicalStates() {
        return [
            new PhysicalState(
                'Nébuleuse',
                'Nuage de gaz et poussière interstellaire',
                {
                    stage: 'nebula',
                    starSize: 0,
                    temperature: 10,
                    collapse: 0
                }
            ),
            new PhysicalState(
                'Disque Protoplanétaire',
                'Formation du disque d\'accrétion',
                {
                    stage: 'disk',
                    starSize: 0.5,
                    temperature: 3000,
                    collapse: 0.5
                }
            ),
            new PhysicalState(
                'Système Mature',
                'Étoile de séquence principale avec planètes',
                {
                    stage: 'mature',
                    starSize: 1.0,
                    temperature: 5778,
                    planets: true
                }
            ),
            new PhysicalState(
                'Géante Rouge',
                'Étoile en fin de vie, enveloppe expansée',
                {
                    stage: 'red_giant',
                    starSize: 5.0,
                    temperature: 3500,
                    planets: true
                }
            ),
            new PhysicalState(
                'Supernova',
                'Explosion cataclysmique de l\'étoile',
                {
                    stage: 'supernova',
                    starSize: 0.1,
                    temperature: 100000,
                    explosion: 1.0
                }
            ),
            new PhysicalState(
                'Naine Blanche',
                'Résidu stellaire dense et chaud',
                {
                    stage: 'white_dwarf',
                    starSize: 0.3,
                    temperature: 25000,
                    density: 1000000
                }
            )
        ];
    }

    createFormationTimeline() {
        const timeline = new FormationTimeline();

        timeline.addStage('Nébuleuse', 3, this.states[0], {
            onUpdate: (p) => {}
        });

        timeline.addStage('Disque Protoplanétaire', 4, this.states[1], {
            onUpdate: (p) => {}
        });

        timeline.addStage('Système Mature', 5, this.states[2], {
            onUpdate: (p) => {}
        });

        timeline.addStage('Géante Rouge', 4, this.states[3], {
            onUpdate: (p) => {}
        });

        timeline.addStage('Supernova', 3, this.states[4], {
            onEnter: () => { this.triggerSupernova(); }
        });

        timeline.addStage('Naine Blanche', 4, this.states[5], {
            onUpdate: (p) => {}
        });

        timeline.loopMode = 'loop';
        return timeline;
    }

    init() {
        this.createNebula();
        this.createStar();
        this.createPlanets();
        this.createSupernovaExplosion();
        this.createWhiteDwarf();
        this.createAsteroidBelt();
        this.maxLevels = this.states.length;

        this.displayMode = 'final';
        this.currentStateIndex = 2; // Commence avec système mature
    }

    createNebula() {
        // Nuage de particules pour la nébuleuse
        const particleCount = 3000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;

            // Distribution gaussienne pour un nuage plus dense au centre
            const r = Math.abs(THREE.MathUtils.randFloatSpread(8));
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;

            positions[i3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = r * Math.cos(phi);

            // Couleurs de nébuleuse (bleu-violet-rose)
            const hue = Math.random() * 0.3 + 0.55; // 0.55-0.85 (cyan à magenta)
            const color = new THREE.Color().setHSL(hue, 0.8, 0.6);
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.15,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });

        this.nebula = new THREE.Points(geometry, material);
        this.nebula.visible = false;
        this.scene.add(this.nebula);
        this.objects.push(this.nebula);
    }

    createStar() {
        // Étoile centrale (Soleil)
        const geometry = new THREE.SphereGeometry(1, 32, 32);
        const material = new THREE.MeshBasicMaterial({
            color: 0xFFDD44,
            emissive: 0xFFDD44
        });

        this.star = new THREE.Mesh(geometry, material);

        // Glow effect
        const glowGeometry = new THREE.SphereGeometry(1.3, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xFFDD44,
            transparent: true,
            opacity: 0.3,
            blending: THREE.AdditiveBlending
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.star.add(glow);

        this.scene.add(this.star);
        this.objects.push(this.star);
    }

    createPlanets() {
        this.planetData.forEach((data, index) => {
            // Créer la planète
            const geometry = new THREE.SphereGeometry(data.size, 32, 32);
            const material = new THREE.MeshPhongMaterial({
                color: data.color,
                shininess: 30
            });

            const planet = new THREE.Mesh(geometry, material);
            planet.userData = {
                ...data,
                angle: Math.random() * Math.PI * 2,
                index: index
            };

            this.scene.add(planet);
            this.objects.push(planet);
            this.planets.push(planet);

            // Créer l'orbite visible
            const orbitGeometry = new THREE.BufferGeometry();
            const orbitPoints = [];
            const segments = 128;

            for (let i = 0; i <= segments; i++) {
                const theta = (i / segments) * Math.PI * 2;
                orbitPoints.push(
                    Math.cos(theta) * data.distance,
                    0,
                    Math.sin(theta) * data.distance
                );
            }

            orbitGeometry.setAttribute('position',
                new THREE.Float32BufferAttribute(orbitPoints, 3));

            const orbitMaterial = new THREE.LineBasicMaterial({
                color: 0x444444,
                transparent: true,
                opacity: 0.3
            });

            const orbit = new THREE.Line(orbitGeometry, orbitMaterial);
            orbit.visible = false;
            this.scene.add(orbit);
            this.objects.push(orbit);
            this.orbits.push(orbit);

            // Anneaux pour Saturne
            if (data.rings) {
                const ringGeometry = new THREE.RingGeometry(data.size * 1.5, data.size * 2.5, 64);
                const ringMaterial = new THREE.MeshBasicMaterial({
                    color: 0xC9B382,
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: 0.7
                });
                const rings = new THREE.Mesh(ringGeometry, ringMaterial);
                rings.rotation.x = Math.PI / 2;
                planet.add(rings);
            }
        });
    }

    createAsteroidBelt() {
        // Ceinture d'astéroïdes entre Mars et Jupiter
        const asteroidCount = 200;
        const innerRadius = 5.2;
        const outerRadius = 6.0;

        for (let i = 0; i < asteroidCount; i++) {
            const size = Math.random() * 0.03 + 0.01;
            const geometry = new THREE.DodecahedronGeometry(size);
            const material = new THREE.MeshPhongMaterial({
                color: 0x888888,
                flatShading: true
            });

            const asteroid = new THREE.Mesh(geometry, material);

            const distance = innerRadius + Math.random() * (outerRadius - innerRadius);
            const angle = Math.random() * Math.PI * 2;
            const height = THREE.MathUtils.randFloatSpread(0.3);

            asteroid.userData = {
                distance: distance,
                angle: angle,
                height: height,
                speed: 0.2 + Math.random() * 0.3
            };

            asteroid.visible = false;
            this.scene.add(asteroid);
            this.objects.push(asteroid);
            this.asteroidBelt.push(asteroid);
        }
    }

    createSupernovaExplosion() {
        const particleCount = 5000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;

            // Position initiale au centre
            positions[i3] = 0;
            positions[i3 + 1] = 0;
            positions[i3 + 2] = 0;

            // Vélocités aléatoires pour l'explosion
            const speed = Math.random() * 2 + 1;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;

            velocities[i3] = speed * Math.sin(phi) * Math.cos(theta);
            velocities[i3 + 1] = speed * Math.sin(phi) * Math.sin(theta);
            velocities[i3 + 2] = speed * Math.cos(phi);

            // Couleurs chaudes pour l'explosion
            const temp = Math.random();
            const color = new THREE.Color();
            if (temp < 0.3) {
                color.setHex(0xFF4500); // Rouge-orange
            } else if (temp < 0.7) {
                color.setHex(0xFFFFFF); // Blanc
            } else {
                color.setHex(0x87CEEB); // Bleu (plus chaud)
            }

            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.userData.velocities = velocities;

        const material = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        this.supernovaParticles = new THREE.Points(geometry, material);
        this.supernovaParticles.visible = false;
        this.scene.add(this.supernovaParticles);
        this.objects.push(this.supernovaParticles);
    }

    createWhiteDwarf() {
        const geometry = new THREE.SphereGeometry(0.3, 32, 32);
        const material = new THREE.MeshBasicMaterial({
            color: 0xFFFFFF,
            emissive: 0xCCEEFF
        });

        this.whiteDwarf = new THREE.Mesh(geometry, material);
        this.whiteDwarf.visible = false;

        // Glow bleu-blanc
        const glowGeometry = new THREE.SphereGeometry(0.5, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x88CCFF,
            transparent: true,
            opacity: 0.4,
            blending: THREE.AdditiveBlending
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.whiteDwarf.add(glow);

        this.scene.add(this.whiteDwarf);
        this.objects.push(this.whiteDwarf);
    }

    triggerSupernova() {
        this.supernovaActive = true;
        this.explosionTime = 0;

        // Reset particle positions
        const positions = this.supernovaParticles.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i] = 0;
            positions[i + 1] = 0;
            positions[i + 2] = 0;
        }
        this.supernovaParticles.geometry.attributes.position.needsUpdate = true;
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

        // Détecter changement d'état
        if (this.lastStage !== stage) {
            this.onStageChange(stage);
            this.lastStage = stage;
        }

        // Gestion de la visibilité selon l'état
        this.updateVisibility(stage);

        // Animation selon l'état
        switch(stage) {
            case 'nebula':
                this.updateNebula();
                break;
            case 'disk':
                this.updateDisk();
                break;
            case 'mature':
            case 'red_giant':
                this.updateMatureSystem(params);
                break;
            case 'supernova':
                this.updateSupernova();
                break;
            case 'white_dwarf':
                this.updateWhiteDwarf();
                break;
        }
    }

    onStageChange(newStage) {
        // Actions à effectuer lors d'un changement d'état
        if (newStage === 'supernova') {
            this.triggerSupernova();
        } else {
            // Reset supernova si on quitte cet état
            this.supernovaActive = false;
        }
    }

    updateVisibility(stage) {
        // Nébuleuse
        this.nebula.visible = (stage === 'nebula' || stage === 'disk');

        // Étoile
        this.star.visible = (stage === 'disk' || stage === 'mature' || stage === 'red_giant');

        // Planètes et orbites
        const showPlanets = (stage === 'mature' || stage === 'red_giant');
        this.planets.forEach(p => p.visible = showPlanets);
        this.orbits.forEach(o => o.visible = showPlanets);
        this.asteroidBelt.forEach(a => a.visible = showPlanets);

        // Supernova
        this.supernovaParticles.visible = (stage === 'supernova');

        // Naine blanche
        this.whiteDwarf.visible = (stage === 'white_dwarf');
    }

    updateNebula() {
        // Rotation lente de la nébuleuse
        this.nebula.rotation.y = this.time * 0.05;
        this.nebula.rotation.x = Math.sin(this.time * 0.02) * 0.2;
    }

    updateDisk() {
        // Formation du disque - aplatissement progressif
        this.nebula.scale.y = 0.3;
        this.nebula.rotation.y = this.time * 0.2;

        // Étoile grandit
        const scale = 0.5 + Math.sin(this.time * 2) * 0.1;
        this.star.scale.setScalar(scale);
    }

    updateMatureSystem(params) {
        // Taille de l'étoile selon l'état
        const targetSize = params.starSize || 1.0;
        const currentSize = this.star.scale.x;
        this.star.scale.setScalar(THREE.MathUtils.lerp(currentSize, targetSize, 0.02));

        // Couleur selon la température
        const temp = params.temperature || 5778;
        let color;
        if (temp < 3500) {
            color = new THREE.Color(0xFF6B4A); // Rouge
        } else if (temp < 5000) {
            color = new THREE.Color(0xFFDD44); // Jaune-orange
        } else {
            color = new THREE.Color(0xFFFFFF); // Blanc-jaune
        }

        this.star.material.color = color;
        this.star.material.emissive = color;

        // Rotation étoile
        this.star.rotation.y = this.time * 0.1;

        // Orbites planétaires
        this.planets.forEach(planet => {
            const data = planet.userData;
            data.angle += 0.016 * data.speed * 0.1;

            planet.position.x = Math.cos(data.angle) * data.distance;
            planet.position.z = Math.sin(data.angle) * data.distance;
            planet.position.y = Math.sin(data.angle + data.tilt) * 0.2;

            // Rotation planète
            planet.rotation.y += 0.02;
        });

        // Ceinture d'astéroïdes
        this.asteroidBelt.forEach(asteroid => {
            const data = asteroid.userData;
            data.angle += 0.016 * data.speed * 0.01;

            asteroid.position.x = Math.cos(data.angle) * data.distance;
            asteroid.position.z = Math.sin(data.angle) * data.distance;
            asteroid.position.y = data.height;

            asteroid.rotation.x += 0.01;
            asteroid.rotation.y += 0.02;
        });
    }

    updateSupernova() {
        if (!this.supernovaActive) {
            return; // Ne rien faire si supernova pas active
        }

        this.explosionTime += 0.016;

        // Limiter l'explosion à 5 secondes
        if (this.explosionTime > 5) {
            return;
        }

        const positions = this.supernovaParticles.geometry.attributes.position.array;
        const velocities = this.supernovaParticles.geometry.userData.velocities;

        for (let i = 0; i < positions.length; i += 3) {
            // Ajouter friction pour ralentir progressivement
            const friction = Math.max(0, 1 - this.explosionTime / 10);
            positions[i] += velocities[i] * 0.1 * friction;
            positions[i + 1] += velocities[i + 1] * 0.1 * friction;
            positions[i + 2] += velocities[i + 2] * 0.1 * friction;
        }

        this.supernovaParticles.geometry.attributes.position.needsUpdate = true;

        // Fade out progressif
        const opacity = Math.max(0, 1 - this.explosionTime / 5);
        this.supernovaParticles.material.opacity = opacity;
    }

    updateWhiteDwarf() {
        // Naine blanche pulse doucement
        const pulse = 1 + Math.sin(this.time * 3) * 0.05;
        this.whiteDwarf.scale.setScalar(pulse);

        this.whiteDwarf.rotation.y = this.time * 0.5;
    }

    setLevel(level) {
        super.setLevel(level);
        this.currentStateIndex = level - 1;
        // Le déclenchement supernova est maintenant géré par onStageChange()
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
