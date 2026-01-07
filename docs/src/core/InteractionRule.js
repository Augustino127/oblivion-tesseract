/**
 * InteractionRule - Définit comment deux primitives interagissent
 *
 * Les règles d'interaction permettent de créer des comportements émergents
 * complexes à partir d'interactions simples.
 */

export class InteractionRule {
    constructor(config) {
        this.name = config.name;
        this.typeA = config.typeA; // Type de primitive A
        this.typeB = config.typeB; // Type de primitive B

        // Condition pour que l'interaction se produise
        this.condition = config.condition || (() => true);

        // Fonction qui calcule le résultat de l'interaction
        this.effect = config.effect;

        // Énergie d'activation (seuil pour que ça se produise)
        this.activationEnergy = config.activationEnergy || 0;

        // Distance maximale d'interaction
        this.range = config.range || Infinity;

        // Force de l'interaction
        this.strength = config.strength || 1.0;
    }

    /**
     * Vérifie si la règle s'applique à deux primitives
     */
    applies(primitiveA, primitiveB) {
        // Vérifier les types
        if (primitiveA.type !== this.typeA && primitiveB.type !== this.typeB) {
            if (primitiveA.type !== this.typeB && primitiveB.type !== this.typeA) {
                return false;
            }
        }

        // Vérifier la distance
        const dist = this.distance(primitiveA, primitiveB);
        if (dist > this.range) {
            return false;
        }

        // Vérifier la condition personnalisée
        return this.condition(primitiveA, primitiveB);
    }

    /**
     * Applique l'interaction entre deux primitives
     */
    apply(primitiveA, primitiveB) {
        if (!this.applies(primitiveA, primitiveB)) {
            return null;
        }

        return this.effect(primitiveA, primitiveB, this.strength);
    }

    /**
     * Calcule la distance entre deux primitives
     */
    distance(a, b) {
        const dx = a.state.position[0] - b.state.position[0];
        const dy = a.state.position[1] - b.state.position[1];
        const dz = a.state.position[2] - b.state.position[2];
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
}

/**
 * Bibliothèque de règles d'interaction standards
 */
export class InteractionLibrary {
    /**
     * Force gravitationnelle entre deux masses
     */
    static gravitationalAttraction() {
        return new InteractionRule({
            name: 'Gravitation',
            typeA: 'particle',
            typeB: 'particle',
            range: Infinity,
            strength: 6.674e-11, // Constante gravitationnelle G

            effect: (a, b, G) => {
                const dx = b.state.position[0] - a.state.position[0];
                const dy = b.state.position[1] - a.state.position[1];
                const dz = b.state.position[2] - a.state.position[2];
                const distSq = dx * dx + dy * dy + dz * dz;
                const dist = Math.sqrt(distSq);

                if (dist < 0.1) return; // Éviter division par zéro

                // F = G * m1 * m2 / r²
                const forceMagnitude = G * a.properties.mass * b.properties.mass / distSq;

                // Direction normalisée
                const fx = (dx / dist) * forceMagnitude;
                const fy = (dy / dist) * forceMagnitude;
                const fz = (dz / dist) * forceMagnitude;

                // F = ma => a = F/m
                a.state.acceleration[0] += fx / a.properties.mass;
                a.state.acceleration[1] += fy / a.properties.mass;
                a.state.acceleration[2] += fz / a.properties.mass;

                b.state.acceleration[0] -= fx / b.properties.mass;
                b.state.acceleration[1] -= fy / b.properties.mass;
                b.state.acceleration[2] -= fz / b.properties.mass;
            }
        });
    }

    /**
     * Force électromagnétique (Coulomb)
     */
    static electromagneticForce() {
        return new InteractionRule({
            name: 'Force de Coulomb',
            typeA: 'particle',
            typeB: 'particle',
            range: Infinity,
            strength: 8.988e9, // Constante de Coulomb k

            condition: (a, b) => {
                // Seulement si au moins une particule est chargée
                return a.properties.charge !== 0 || b.properties.charge !== 0;
            },

            effect: (a, b, k) => {
                const dx = b.state.position[0] - a.state.position[0];
                const dy = b.state.position[1] - a.state.position[1];
                const dz = b.state.position[2] - a.state.position[2];
                const distSq = dx * dx + dy * dy + dz * dz;
                const dist = Math.sqrt(distSq);

                if (dist < 0.1) return;

                // F = k * q1 * q2 / r²
                const forceMagnitude = k * a.properties.charge * b.properties.charge / distSq;

                const fx = (dx / dist) * forceMagnitude;
                const fy = (dy / dist) * forceMagnitude;
                const fz = (dz / dist) * forceMagnitude;

                a.state.acceleration[0] += fx / a.properties.mass;
                a.state.acceleration[1] += fy / a.properties.mass;
                a.state.acceleration[2] += fz / a.properties.mass;

                b.state.acceleration[0] -= fx / b.properties.mass;
                b.state.acceleration[1] -= fy / b.properties.mass;
                b.state.acceleration[2] -= fz / b.properties.mass;
            }
        });
    }

    /**
     * Formation d'atome : électron + proton
     */
    static atomFormation() {
        return new InteractionRule({
            name: 'Formation Atome',
            typeA: 'particle',
            typeB: 'particle',
            range: 2.0,
            activationEnergy: 0,

            condition: (a, b) => {
                // Un électron et un proton
                const isElectronProton =
                    (a.properties.charge < 0 && b.properties.charge > 0) ||
                    (a.properties.charge > 0 && b.properties.charge < 0);

                return isElectronProton;
            },

            effect: (a, b) => {
                // Créer un nouvel objet "Atome"
                return {
                    type: 'composite',
                    name: 'Atome d\'Hydrogène',
                    components: [a, b],
                    properties: {
                        stable: true,
                        energy: -13.6 // eV
                    }
                };
            }
        });
    }

    /**
     * Collision élastique
     */
    static elasticCollision() {
        return new InteractionRule({
            name: 'Collision Élastique',
            typeA: 'particle',
            typeB: 'particle',
            range: 0.5,

            effect: (a, b) => {
                // Échange de momentum
                const m1 = a.properties.mass;
                const m2 = b.properties.mass;

                const v1x = a.state.velocity[0];
                const v1y = a.state.velocity[1];
                const v1z = a.state.velocity[2];

                const v2x = b.state.velocity[0];
                const v2y = b.state.velocity[1];
                const v2z = b.state.velocity[2];

                // Nouvelles vitesses après collision élastique 1D simplifiée
                a.state.velocity[0] = ((m1 - m2) * v1x + 2 * m2 * v2x) / (m1 + m2);
                a.state.velocity[1] = ((m1 - m2) * v1y + 2 * m2 * v2y) / (m1 + m2);
                a.state.velocity[2] = ((m1 - m2) * v1z + 2 * m2 * v2z) / (m1 + m2);

                b.state.velocity[0] = ((m2 - m1) * v2x + 2 * m1 * v1x) / (m1 + m2);
                b.state.velocity[1] = ((m2 - m1) * v2y + 2 * m1 * v1y) / (m1 + m2);
                b.state.velocity[2] = ((m2 - m1) * v2z + 2 * m1 * v1z) / (m1 + m2);
            }
        });
    }

    /**
     * Interférence d'ondes
     */
    static waveInterference() {
        return new InteractionRule({
            name: 'Interférence',
            typeA: 'wave',
            typeB: 'wave',
            range: 10,

            effect: (a, b) => {
                // Superposition des ondes
                const amp1 = a.properties.amplitude;
                const amp2 = b.properties.amplitude;
                const phase1 = a.properties.phase || 0;
                const phase2 = b.properties.phase || 0;

                // Amplitude résultante
                const phaseDiff = phase2 - phase1;
                const resultantAmplitude = Math.sqrt(
                    amp1 * amp1 + amp2 * amp2 +
                    2 * amp1 * amp2 * Math.cos(phaseDiff)
                );

                return {
                    type: 'wave',
                    name: 'Onde Résultante',
                    amplitude: resultantAmplitude,
                    constructive: Math.abs(phaseDiff) < Math.PI / 4
                };
            }
        });
    }

    /**
     * Decay radioactif (simplrifié)
     */
    static radioactiveDecay() {
        return new InteractionRule({
            name: 'Désintégration',
            typeA: 'particle',
            typeB: null, // Pas besoin d'autre particule

            condition: (particle) => {
                // Probabilité de désintégration
                const halfLife = particle.properties.halfLife || Infinity;
                const probability = 0.693 / halfLife; // λ = ln(2) / t½
                return Math.random() < probability;
            },

            effect: (particle) => {
                // Produits de désintégration
                return {
                    type: 'decay',
                    products: [
                        // Exemple : émission d'un électron (β-)
                        { type: 'particle', charge: -1, mass: 9.109e-31 },
                        { type: 'particle', charge: 0, mass: 0 } // neutrino
                    ]
                };
            }
        });
    }

    /**
     * Retourne toutes les règles standards
     */
    static getAllRules() {
        return [
            this.gravitationalAttraction(),
            this.electromagneticForce(),
            this.atomFormation(),
            this.elasticCollision(),
            this.waveInterference(),
            this.radioactiveDecay()
        ];
    }
}
