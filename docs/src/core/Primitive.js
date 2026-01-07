/**
 * Primitive - Élément de base du système de création
 *
 * Les primitives sont les briques élémentaires qui peuvent être
 * combinées pour créer des structures complexes.
 */

export class Primitive {
    constructor(config) {
        this.id = config.id || this.generateId();
        this.name = config.name;
        this.type = config.type; // 'particle', 'field', 'geometry', 'force', 'wave'

        // Propriétés physiques
        this.properties = {
            mass: config.mass || 0,
            charge: config.charge || 0,
            spin: config.spin || 0,
            frequency: config.frequency || 0,
            amplitude: config.amplitude || 1,
            shape: config.shape || 'sphere',
            dimension: config.dimension || 3,
            ...config.properties
        };

        // État dynamique
        this.state = {
            position: config.position || [0, 0, 0],
            velocity: config.velocity || [0, 0, 0],
            acceleration: config.acceleration || [0, 0, 0],
            rotation: config.rotation || [0, 0, 0],
            scale: config.scale || [1, 1, 1]
        };

        // Comportement (fonction d'update)
        this.behavior = config.behavior || null;

        // Règles d'interaction avec d'autres primitives
        this.interactions = new Map();

        // Référence Three.js
        this.mesh = null;
    }

    generateId() {
        return `primitive_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Ajoute une règle d'interaction avec un autre type de primitive
     */
    addInteraction(primitiveType, rule) {
        this.interactions.set(primitiveType, rule);
    }

    /**
     * Vérifie si cette primitive peut interagir avec une autre
     */
    canInteractWith(other) {
        return this.interactions.has(other.type);
    }

    /**
     * Calcule l'interaction avec une autre primitive
     */
    interact(other) {
        const rule = this.interactions.get(other.type);
        if (rule) {
            return rule(this, other);
        }
        return null;
    }

    /**
     * Met à jour l'état de la primitive (chaque frame)
     */
    update(deltaTime) {
        // Comportement personnalisé
        if (this.behavior) {
            this.behavior(this, deltaTime);
        }

        // Physique de base
        const dt = deltaTime;

        // Vitesse += accélération * dt
        this.state.velocity[0] += this.state.acceleration[0] * dt;
        this.state.velocity[1] += this.state.acceleration[1] * dt;
        this.state.velocity[2] += this.state.acceleration[2] * dt;

        // Position += vitesse * dt
        this.state.position[0] += this.state.velocity[0] * dt;
        this.state.position[1] += this.state.velocity[1] * dt;
        this.state.position[2] += this.state.velocity[2] * dt;

        // Sync avec Three.js mesh
        if (this.mesh) {
            this.mesh.position.set(
                this.state.position[0],
                this.state.position[1],
                this.state.position[2]
            );
            this.mesh.rotation.set(
                this.state.rotation[0],
                this.state.rotation[1],
                this.state.rotation[2]
            );
            this.mesh.scale.set(
                this.state.scale[0],
                this.state.scale[1],
                this.state.scale[2]
            );
        }
    }

    /**
     * Clone cette primitive
     */
    clone() {
        return new Primitive({
            name: this.name,
            type: this.type,
            ...this.properties,
            position: [...this.state.position],
            velocity: [...this.state.velocity],
            acceleration: [...this.state.acceleration],
            behavior: this.behavior
        });
    }

    /**
     * Export en JSON pour sauvegarde
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            properties: { ...this.properties },
            state: {
                position: [...this.state.position],
                velocity: [...this.state.velocity],
                acceleration: [...this.state.acceleration],
                rotation: [...this.state.rotation],
                scale: [...this.state.scale]
            }
        };
    }

    /**
     * Crée une primitive depuis JSON
     */
    static fromJSON(json) {
        return new Primitive({
            id: json.id,
            name: json.name,
            type: json.type,
            ...json.properties,
            ...json.state
        });
    }
}

/**
 * Factory pour créer des primitives standards
 */
export class PrimitiveFactory {
    static createElectron(position = [0, 0, 0]) {
        return new Primitive({
            name: 'Électron',
            type: 'particle',
            mass: 9.109e-31, // kg
            charge: -1.602e-19, // Coulomb
            spin: 0.5,
            position: position,
            properties: {
                color: 0x00FFFF,
                size: 0.1
            }
        });
    }

    static createProton(position = [0, 0, 0]) {
        return new Primitive({
            name: 'Proton',
            type: 'particle',
            mass: 1.673e-27, // kg
            charge: 1.602e-19, // Coulomb
            spin: 0.5,
            position: position,
            properties: {
                color: 0xFF0000,
                size: 0.15
            }
        });
    }

    static createNeutron(position = [0, 0, 0]) {
        return new Primitive({
            name: 'Neutron',
            type: 'particle',
            mass: 1.675e-27, // kg
            charge: 0,
            spin: 0.5,
            position: position,
            properties: {
                color: 0xFFFFFF,
                size: 0.15
            }
        });
    }

    static createPhoton(position = [0, 0, 0], frequency = 5e14) {
        return new Primitive({
            name: 'Photon',
            type: 'wave',
            mass: 0,
            charge: 0,
            spin: 1,
            frequency: frequency,
            position: position,
            velocity: [3e8, 0, 0], // Vitesse de la lumière (normalisée)
            properties: {
                color: 0xFFFF00,
                size: 0.05
            }
        });
    }

    static createGravitationalField(position = [0, 0, 0], mass = 1e20) {
        return new Primitive({
            name: 'Champ Gravitationnel',
            type: 'field',
            mass: mass,
            position: position,
            properties: {
                range: 50,
                strength: mass * 6.674e-11, // G * M
                color: 0x8800FF,
                visualize: true
            },
            behavior: (self, dt) => {
                // Le champ ne bouge pas, mais affecte les autres
            }
        });
    }

    static createElectromagneticField(position = [0, 0, 0], charge = 1e-6) {
        return new Primitive({
            name: 'Champ Électromagnétique',
            type: 'field',
            charge: charge,
            position: position,
            properties: {
                range: 30,
                strength: charge * 8.988e9, // k * q
                color: 0x00FF00,
                visualize: true
            }
        });
    }

    static createWave(position = [0, 0, 0], config = {}) {
        return new Primitive({
            name: 'Onde',
            type: 'wave',
            frequency: config.frequency || 1,
            amplitude: config.amplitude || 1,
            position: position,
            properties: {
                wavelength: config.wavelength || 1,
                phase: config.phase || 0,
                color: config.color || 0x00FFFF,
                direction: config.direction || [1, 0, 0]
            }
        });
    }

    static createMass(position = [0, 0, 0], mass = 1) {
        return new Primitive({
            name: 'Masse',
            type: 'particle',
            mass: mass,
            position: position,
            properties: {
                color: 0xFF6600,
                size: Math.pow(mass, 1/3) * 0.1
            }
        });
    }
}
