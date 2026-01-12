/**
 * Classe de base pour toutes les scènes
 * Chaque concept scientifique hérite de cette classe
 */
export class Scene {
    constructor(name, description) {
        this.name = name;
        this.description = description;
        this.currentLevel = 1;
        this.maxLevels = 3;
        this.objects = [];

        // Système de modes : 'final' = modèle final, 'formation' = animation de genèse
        this.displayMode = 'final';
    }

    /**
     * Configuration initiale de la scène
     * @param {THREE.Scene} scene
     */
    setup(scene) {
        this.scene = scene;
        this.init();
    }

    /**
     * Initialisation - à surcharger
     */
    init() {
        throw new Error('init() must be implemented');
    }

    /**
     * Mise à jour de chaque frame - à surcharger
     */
    update() {
        throw new Error('update() must be implemented');
    }

    /**
     * Changer de niveau/comportement
     */
    setLevel(level) {
        if (level >= 1 && level <= this.maxLevels) {
            this.currentLevel = level;
            this.onLevelChange();
        }
    }

    nextLevel() {
        this.setLevel((this.currentLevel % this.maxLevels) + 1);
    }

    prevLevel() {
        this.setLevel(this.currentLevel === 1 ? this.maxLevels : this.currentLevel - 1);
    }

    /**
     * Changer de mode d'affichage
     */
    setDisplayMode(mode) {
        if (mode === 'final' || mode === 'formation') {
            this.displayMode = mode;
            this.onModeChange();
        }
    }

    /**
     * Callback quand le mode change - à surcharger
     */
    onModeChange() {
        // À implémenter dans les sous-classes
    }

    /**
     * Callback quand le niveau change - à surcharger
     */
    onLevelChange() {
        // À implémenter dans les sous-classes
    }

    /**
     * Nettoyage de la scène
     */
    destroy() {
        this.objects.forEach(obj => {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
                if (Array.isArray(obj.material)) {
                    obj.material.forEach(m => m.dispose());
                } else {
                    obj.material.dispose();
                }
            }
            if (this.scene) this.scene.remove(obj);
        });
        this.objects = [];
    }

    getInfo() {
        return {
            name: this.name,
            description: this.description,
            level: this.currentLevel,
            maxLevels: this.maxLevels,
            displayMode: this.displayMode
        };
    }

    /**
     * Retourne un chemin de caméra cinématique pour cette scène (optionnel)
     * @returns {Array|null} Tableau de keyframes ou null si pas de path défini
     */
    getCinematicPath() {
        return null; // Par défaut, pas de path - à surcharger dans les sous-classes
    }
}
