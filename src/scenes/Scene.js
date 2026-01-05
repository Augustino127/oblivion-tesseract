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
            if (obj.material) obj.material.dispose();
            if (this.scene) this.scene.remove(obj);
        });
        this.objects = [];
    }

    getInfo() {
        return {
            name: this.name,
            description: this.description,
            level: this.currentLevel,
            maxLevels: this.maxLevels
        };
    }
}
