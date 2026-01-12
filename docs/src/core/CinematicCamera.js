import * as THREE from 'three';

/**
 * Système de caméra cinématique avec keyframes et interpolation
 * Permet des mouvements fluides et dramatiques pour améliorer l'expérience visuelle
 */
export class CinematicCamera {
    constructor(camera, controls) {
        this.camera = camera;
        this.controls = controls;

        // État du système
        this.isActive = false;
        this.isPaused = false;
        this.currentTime = 0;
        this.duration = 0;
        this.loop = true;

        // Keyframes de la timeline
        this.keyframes = [];

        // Position/rotation initiales pour revenir en mode manuel
        this.manualPosition = new THREE.Vector3();
        this.manualTarget = new THREE.Vector3();

        // Effet de shake (pour événements dramatiques)
        this.shakeIntensity = 0;
        this.shakeDuration = 0;
        this.shakeTime = 0;
    }

    /**
     * Définir la timeline de keyframes
     * @param {Array} keyframes - Tableau de keyframes {time, position, target, fov?, easing?}
     */
    setKeyframes(keyframes) {
        this.keyframes = keyframes.sort((a, b) => a.time - b.time);
        this.duration = this.keyframes.length > 0
            ? this.keyframes[this.keyframes.length - 1].time
            : 0;
        this.currentTime = 0;
    }

    /**
     * Activer le mode cinématique
     */
    activate() {
        if (this.keyframes.length === 0) {
            console.warn('No keyframes defined for cinematic mode');
            return;
        }

        // Sauvegarder la position manuelle
        this.manualPosition.copy(this.camera.position);
        this.manualTarget.copy(this.controls.target);

        // Désactiver OrbitControls
        this.controls.enabled = false;

        this.isActive = true;
        this.isPaused = false;
        this.currentTime = 0;
    }

    /**
     * Désactiver le mode cinématique et revenir au mode manuel
     */
    deactivate() {
        this.isActive = false;
        this.controls.enabled = true;

        // Transition douce vers la position manuelle
        this.animateToManual();
    }

    /**
     * Basculer entre modes cinématique et manuel
     */
    toggle() {
        if (this.isActive) {
            this.deactivate();
        } else {
            this.activate();
        }
    }

    /**
     * Pause/Resume de l'animation
     */
    togglePause() {
        this.isPaused = !this.isPaused;
    }

    /**
     * Reset la timeline au début
     */
    reset() {
        this.currentTime = 0;
    }

    /**
     * Mettre à jour la caméra cinématique
     * @param {number} deltaTime - Temps écoulé depuis la dernière frame (en secondes)
     */
    update(deltaTime) {
        if (!this.isActive || this.isPaused || this.keyframes.length === 0) {
            return;
        }

        // Avancer le temps
        this.currentTime += deltaTime;

        // Boucler si nécessaire
        if (this.loop && this.currentTime > this.duration) {
            this.currentTime = this.currentTime % this.duration;
        } else if (this.currentTime > this.duration) {
            this.currentTime = this.duration;
        }

        // Trouver les keyframes avant et après le temps actuel
        const { prev, next, t } = this.findSurroundingKeyframes(this.currentTime);

        if (prev && next) {
            // Interpoler entre les keyframes
            const easedT = this.applyEasing(t, next.easing || 'smoothstep');

            // Position
            this.camera.position.lerpVectors(
                new THREE.Vector3().copy(prev.position),
                new THREE.Vector3().copy(next.position),
                easedT
            );

            // Target (lookAt)
            const targetPos = new THREE.Vector3().lerpVectors(
                new THREE.Vector3().copy(prev.target),
                new THREE.Vector3().copy(next.target),
                easedT
            );
            this.camera.lookAt(targetPos);
            this.controls.target.copy(targetPos);

            // FOV (si défini)
            if (prev.fov !== undefined && next.fov !== undefined) {
                this.camera.fov = THREE.MathUtils.lerp(prev.fov, next.fov, easedT);
                this.camera.updateProjectionMatrix();
            }
        } else if (prev) {
            // Dernier keyframe
            this.camera.position.copy(prev.position);
            this.camera.lookAt(prev.target);
            this.controls.target.copy(prev.target);
            if (prev.fov !== undefined) {
                this.camera.fov = prev.fov;
                this.camera.updateProjectionMatrix();
            }
        }

        // Appliquer le shake si actif
        if (this.shakeTime < this.shakeDuration) {
            this.applyShake(deltaTime);
        }
    }

    /**
     * Trouver les keyframes encadrant le temps actuel
     */
    findSurroundingKeyframes(time) {
        let prev = null;
        let next = null;

        for (let i = 0; i < this.keyframes.length; i++) {
            if (this.keyframes[i].time <= time) {
                prev = this.keyframes[i];
            }
            if (this.keyframes[i].time > time && !next) {
                next = this.keyframes[i];
                break;
            }
        }

        if (!prev || !next) {
            return { prev, next, t: 0 };
        }

        // Calculer t normalisé [0, 1] entre prev et next
        const t = (time - prev.time) / (next.time - prev.time);
        return { prev, next, t };
    }

    /**
     * Appliquer une fonction d'easing
     * @param {number} t - Valeur [0, 1]
     * @param {string} type - Type d'easing
     */
    applyEasing(t, type = 'smoothstep') {
        switch (type) {
            case 'linear':
                return t;

            case 'smoothstep':
                return t * t * (3 - 2 * t);

            case 'smootherstep':
                return t * t * t * (t * (t * 6 - 15) + 10);

            case 'easeInQuad':
                return t * t;

            case 'easeOutQuad':
                return t * (2 - t);

            case 'easeInOutQuad':
                return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

            case 'easeInCubic':
                return t * t * t;

            case 'easeOutCubic':
                const t1 = t - 1;
                return t1 * t1 * t1 + 1;

            case 'easeInOutCubic':
                return t < 0.5
                    ? 4 * t * t * t
                    : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;

            default:
                return t;
        }
    }

    /**
     * Transition douce vers la position manuelle
     */
    animateToManual() {
        // Simple lerp sur quelques frames
        const duration = 1.0; // 1 seconde
        let elapsed = 0;

        const startPos = this.camera.position.clone();
        const startTarget = this.controls.target.clone();

        const animate = (deltaTime) => {
            elapsed += deltaTime;
            const t = Math.min(elapsed / duration, 1.0);
            const easedT = this.applyEasing(t, 'easeOutCubic');

            this.camera.position.lerpVectors(startPos, this.manualPosition, easedT);
            this.controls.target.lerpVectors(startTarget, this.manualTarget, easedT);
            this.camera.lookAt(this.controls.target);

            if (t < 1.0) {
                requestAnimationFrame(() => animate(0.016));
            }
        };

        animate(0);
    }

    /**
     * Déclencher un effet de shake (pour événements dramatiques)
     * @param {number} intensity - Intensité du shake
     * @param {number} duration - Durée en secondes
     */
    triggerShake(intensity = 0.1, duration = 0.5) {
        this.shakeIntensity = intensity;
        this.shakeDuration = duration;
        this.shakeTime = 0;
    }

    /**
     * Appliquer l'effet de shake
     */
    applyShake(deltaTime) {
        this.shakeTime += deltaTime;

        // Diminuer progressivement l'intensité
        const progress = this.shakeTime / this.shakeDuration;
        const currentIntensity = this.shakeIntensity * (1 - progress);

        // Ajouter un offset aléatoire à la position
        const offsetX = (Math.random() - 0.5) * currentIntensity;
        const offsetY = (Math.random() - 0.5) * currentIntensity;
        const offsetZ = (Math.random() - 0.5) * currentIntensity;

        this.camera.position.x += offsetX;
        this.camera.position.y += offsetY;
        this.camera.position.z += offsetZ;
    }

    /**
     * Créer une orbite cinématique autour d'un point
     * @param {THREE.Vector3} center - Centre de l'orbite
     * @param {number} radius - Rayon de l'orbite
     * @param {number} duration - Durée totale en secondes
     * @param {number} height - Hauteur de la caméra
     * @param {number} rotations - Nombre de rotations complètes
     */
    createOrbitPath(center, radius, duration, height = 3, rotations = 1) {
        const keyframes = [];
        const steps = 60; // 60 keyframes pour une orbite fluide

        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const angle = t * Math.PI * 2 * rotations;

            const position = new THREE.Vector3(
                center.x + Math.cos(angle) * radius,
                center.y + height,
                center.z + Math.sin(angle) * radius
            );

            keyframes.push({
                time: t * duration,
                position: position,
                target: center.clone(),
                easing: 'linear'
            });
        }

        this.setKeyframes(keyframes);
    }

    /**
     * Créer un travelling (mouvement linéaire)
     * @param {THREE.Vector3} start - Position de départ
     * @param {THREE.Vector3} end - Position d'arrivée
     * @param {THREE.Vector3} target - Point visé
     * @param {number} duration - Durée en secondes
     */
    createDollyPath(start, end, target, duration) {
        const keyframes = [
            {
                time: 0,
                position: start.clone(),
                target: target.clone(),
                easing: 'easeInOutCubic'
            },
            {
                time: duration,
                position: end.clone(),
                target: target.clone(),
                easing: 'easeInOutCubic'
            }
        ];

        this.setKeyframes(keyframes);
    }

    /**
     * Créer un zoom dramatique
     * @param {THREE.Vector3} target - Point visé
     * @param {number} startDistance - Distance initiale
     * @param {number} endDistance - Distance finale
     * @param {number} duration - Durée en secondes
     */
    createZoomPath(target, startDistance, endDistance, duration) {
        const direction = this.camera.position.clone().sub(target).normalize();

        const keyframes = [
            {
                time: 0,
                position: target.clone().add(direction.clone().multiplyScalar(startDistance)),
                target: target.clone(),
                fov: 75,
                easing: 'easeInCubic'
            },
            {
                time: duration,
                position: target.clone().add(direction.clone().multiplyScalar(endDistance)),
                target: target.clone(),
                fov: 50,
                easing: 'easeInCubic'
            }
        ];

        this.setKeyframes(keyframes);
    }

    /**
     * Obtenir des infos sur l'état actuel
     */
    getInfo() {
        return {
            isActive: this.isActive,
            isPaused: this.isPaused,
            currentTime: this.currentTime.toFixed(2),
            duration: this.duration.toFixed(2),
            progress: this.duration > 0 ? (this.currentTime / this.duration * 100).toFixed(1) + '%' : '0%',
            keyframeCount: this.keyframes.length
        };
    }
}
