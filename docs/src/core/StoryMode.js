/**
 * Story Mode - Narration visuelle automatique
 *
 * Raconte l'histoire des patterns universels :
 * Du simple au complexe, de l'infiniment petit à l'infiniment grand
 */

export class StoryMode {
    constructor(app) {
        this.app = app;
        this.isPlaying = false;
        this.currentChapterIndex = 0;
        this.chapterDuration = 15000; // 15 secondes par chapitre
        this.transitionDuration = 2000; // 2 secondes de transition
        this.timer = null;
        this.startTime = 0;

        // L'histoire : Ordre des scènes et narration
        this.story = [
            {
                scene: 'fibonacci',
                title: 'Le Pattern Universel',
                narration: 'Tout commence par un simple ratio : le nombre d\'or φ = 1.618...',
                mode: 'formation',
                duration: 20000
            },
            {
                scene: 'tesseract',
                title: 'Les Dimensions Cachées',
                narration: 'Au-delà de notre perception, des dimensions supérieures existent...',
                mode: 'formation',
                duration: 18000
            },
            {
                scene: 'blackhole',
                title: 'La Courbure de l\'Espace-Temps',
                narration: 'La gravité n\'est pas une force, mais la géométrie de l\'univers...',
                mode: 'formation',
                duration: 20000
            },
            {
                scene: 'galaxy',
                title: 'L\'Échelle Cosmique',
                narration: 'Le même pattern - la spirale d\'or - se répète à l\'échelle des galaxies...',
                mode: 'formation',
                duration: 25000
            },
            {
                scene: 'fibonacci',
                title: 'Le Cercle se Referme',
                narration: 'Des coquillages aux galaxies, le même langage mathématique universel.',
                mode: 'final',
                duration: 15000
            }
        ];
    }

    play() {
        if (this.isPlaying) return;

        this.isPlaying = true;
        this.currentChapterIndex = 0;
        this.startChapter(0);
    }

    pause() {
        this.isPlaying = false;
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    }

    stop() {
        this.pause();
        this.currentChapterIndex = 0;
    }

    startChapter(index) {
        if (!this.isPlaying || index >= this.story.length) {
            this.stop();
            return;
        }

        const chapter = this.story[index];
        this.currentChapterIndex = index;

        console.log(`📖 Chapitre ${index + 1}: ${chapter.title}`);
        console.log(`   "${chapter.narration}"`);

        // Charger la scène
        this.app.loadScene(chapter.scene);

        // Attendre que la scène soit chargée
        setTimeout(() => {
            const scene = this.app.scenes.get(chapter.scene);
            if (scene && scene.setDisplayMode) {
                scene.setDisplayMode(chapter.mode);
                this.app.updateModeUI(chapter.mode);
            }

            // Afficher la narration
            this.showNarration(chapter);

            // Planifier le chapitre suivant
            this.timer = setTimeout(() => {
                this.nextChapter();
            }, chapter.duration);

        }, 500);
    }

    nextChapter() {
        const nextIndex = this.currentChapterIndex + 1;

        if (nextIndex < this.story.length) {
            // Transition
            this.hideNarration();
            setTimeout(() => {
                this.startChapter(nextIndex);
            }, this.transitionDuration);
        } else {
            // Fin de l'histoire
            this.stop();
            this.showFinalMessage();
        }
    }

    showNarration(chapter) {
        // Créer ou mettre à jour l'élément de narration
        let narrationEl = document.getElementById('story-narration');

        if (!narrationEl) {
            narrationEl = document.createElement('div');
            narrationEl.id = 'story-narration';
            narrationEl.style.cssText = `
                position: fixed;
                bottom: 100px;
                left: 50%;
                transform: translateX(-50%);
                padding: 20px 40px;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(10px);
                border: 2px solid #00FFFF;
                border-radius: 10px;
                color: #FFFFFF;
                font-family: 'Courier New', monospace;
                text-align: center;
                max-width: 600px;
                z-index: 1000;
                opacity: 0;
                transition: opacity 1s;
            `;
            document.body.appendChild(narrationEl);
        }

        narrationEl.innerHTML = `
            <h3 style="color: #00FFFF; margin: 0 0 10px 0; font-size: 1.2rem;">
                ${chapter.title}
            </h3>
            <p style="margin: 0; font-size: 1rem; color: #CCCCCC;">
                ${chapter.narration}
            </p>
            <div style="margin-top: 10px; color: #FF00FF; font-size: 0.9rem;">
                Chapitre ${this.currentChapterIndex + 1} / ${this.story.length}
            </div>
        `;

        // Fade in
        setTimeout(() => {
            narrationEl.style.opacity = '1';
        }, 100);
    }

    hideNarration() {
        const narrationEl = document.getElementById('story-narration');
        if (narrationEl) {
            narrationEl.style.opacity = '0';
            setTimeout(() => {
                if (narrationEl.parentNode) {
                    narrationEl.parentNode.removeChild(narrationEl);
                }
            }, 1000);
        }
    }

    showFinalMessage() {
        const narrationEl = document.getElementById('story-narration');
        if (narrationEl) {
            narrationEl.innerHTML = `
                <h3 style="color: #FFD700; margin: 0 0 10px 0; font-size: 1.4rem;">
                    ✨ Fin de l'Histoire ✨
                </h3>
                <p style="margin: 0; font-size: 1rem; color: #FFFFFF;">
                    Les mathématiques sont le langage de l'univers.<br>
                    Du quantique au cosmique, tout est connecté.
                </p>
            `;
            narrationEl.style.opacity = '1';

            setTimeout(() => {
                this.hideNarration();
            }, 5000);
        }
    }

    getCurrentChapter() {
        return this.story[this.currentChapterIndex];
    }

    getProgress() {
        return {
            current: this.currentChapterIndex + 1,
            total: this.story.length,
            isPlaying: this.isPlaying
        };
    }
}
