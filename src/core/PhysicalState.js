/**
 * Système d'états physiques évolutifs
 * Chaque scène définit ses propres états basés sur des lois physiques/mathématiques
 */

export class PhysicalState {
    constructor(name, description, parameters = {}) {
        this.name = name;
        this.description = description;
        this.parameters = parameters;
        this.transitionProgress = 0; // 0 à 1 pour transition entre états
    }

    /**
     * Interpole vers un autre état
     */
    lerpTo(targetState, t) {
        const interpolated = {};
        for (const key in this.parameters) {
            if (typeof this.parameters[key] === 'number' && targetState.parameters[key] !== undefined) {
                interpolated[key] = this.parameters[key] + (targetState.parameters[key] - this.parameters[key]) * t;
            } else {
                interpolated[key] = t < 0.5 ? this.parameters[key] : targetState.parameters[key];
            }
        }
        return new PhysicalState(
            `${this.name} → ${targetState.name}`,
            `Transition: ${this.description} vers ${targetState.description}`,
            interpolated
        );
    }
}

/**
 * Timeline de formation d'un objet
 * Gère l'animation depuis le patron jusqu'à la forme finale
 */
export class FormationTimeline {
    constructor(stages = []) {
        this.stages = stages; // Tableau de {name, duration, state, onEnter, onUpdate, onExit}
        this.currentStageIndex = 0;
        this.stageProgress = 0; // 0 à 1 dans le stage actuel
        this.isPlaying = false;
        this.playbackSpeed = 1;
        this.loopMode = 'none'; // 'none', 'loop', 'pingpong'
    }

    addStage(name, duration, state, callbacks = {}) {
        this.stages.push({
            name,
            duration, // en secondes
            state,
            onEnter: callbacks.onEnter || (() => {}),
            onUpdate: callbacks.onUpdate || (() => {}),
            onExit: callbacks.onExit || (() => {})
        });
    }

    play() {
        this.isPlaying = true;
    }

    pause() {
        this.isPlaying = false;
    }

    reset() {
        this.currentStageIndex = 0;
        this.stageProgress = 0;
        if (this.stages[0]) {
            this.stages[0].onEnter();
        }
    }

    update(deltaTime) {
        if (!this.isPlaying || this.stages.length === 0) return;

        const currentStage = this.stages[this.currentStageIndex];

        // Progression dans le stage actuel
        this.stageProgress += (deltaTime * this.playbackSpeed) / currentStage.duration;

        // Callback de mise à jour
        currentStage.onUpdate(this.stageProgress);

        // Passage au stage suivant
        if (this.stageProgress >= 1) {
            currentStage.onExit();

            if (this.currentStageIndex < this.stages.length - 1) {
                this.currentStageIndex++;
                this.stageProgress = 0;
                this.stages[this.currentStageIndex].onEnter();
            } else {
                // Fin de la timeline
                if (this.loopMode === 'loop') {
                    this.reset();
                    this.isPlaying = true;
                } else {
                    this.isPlaying = false;
                }
            }
        }
    }

    getCurrentState() {
        if (this.stages.length === 0) return null;

        const currentStage = this.stages[this.currentStageIndex];

        // Si on a un stage suivant, interpoler entre les deux
        if (this.currentStageIndex < this.stages.length - 1) {
            const nextStage = this.stages[this.currentStageIndex + 1];
            return currentStage.state.lerpTo(nextStage.state, this.stageProgress);
        }

        return currentStage.state;
    }

    jumpToStage(index) {
        if (index >= 0 && index < this.stages.length) {
            if (this.stages[this.currentStageIndex]) {
                this.stages[this.currentStageIndex].onExit();
            }
            this.currentStageIndex = index;
            this.stageProgress = 0;
            this.stages[index].onEnter();
        }
    }

    getProgress() {
        const totalStages = this.stages.length;
        if (totalStages === 0) return 0;
        return (this.currentStageIndex + this.stageProgress) / totalStages;
    }

    getStageName() {
        return this.stages[this.currentStageIndex]?.name || '';
    }
}

/**
 * Générateur de paramètres physiques procéduraux
 */
export class PhysicsGenerator {
    /**
     * Génère des états basés sur une dimension physique
     * Ex: température, courbure spatiale, dimension, etc.
     */
    static generateStatesFromDimension(dimensionName, min, max, steps, unit = '') {
        const states = [];
        const stepSize = (max - min) / (steps - 1);

        for (let i = 0; i < steps; i++) {
            const value = min + stepSize * i;
            states.push(new PhysicalState(
                `${dimensionName}: ${value.toFixed(2)}${unit}`,
                `État physique à ${dimensionName} = ${value.toFixed(2)}${unit}`,
                { [dimensionName]: value }
            ));
        }

        return states;
    }

    /**
     * Génère une progression exponentielle (ex: expansion de l'univers)
     */
    static generateExponentialStates(name, base, exponentRange, steps) {
        const states = [];
        const [minExp, maxExp] = exponentRange;
        const stepSize = (maxExp - minExp) / (steps - 1);

        for (let i = 0; i < steps; i++) {
            const exp = minExp + stepSize * i;
            const value = Math.pow(base, exp);
            states.push(new PhysicalState(
                `${name} (10^${exp.toFixed(1)})`,
                `Échelle: ${value.toExponential(2)}`,
                { scale: value, exponent: exp }
            ));
        }

        return states;
    }
}
