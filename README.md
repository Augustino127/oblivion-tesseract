# Oblivion Tesseract

> Exploration interactive de concepts 3D mathématiques et scientifiques

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Three.js](https://img.shields.io/badge/Three.js-0.160.0-green.svg)

## 🌌 Vision

**Oblivion Tesseract** est un projet web artistique et scientifique qui explore les frontières de la géométrie, des mathématiques et de la physique à travers des visualisations 3D interactives. Du tesseract aux trous noirs, chaque concept est une porte vers l'univers.

## ✨ Concepts Implémentés

### 🎲 Tesseract (Hypercube 4D)
Un cube dans un cube ? Non, une projection d'un hypercube à 4 dimensions !

**Niveaux :**
- **Niveau 1** : Rotation simple sur 2 plans 4D
- **Niveau 2** : Rotation complexe sur tous les plans
- **Niveau 3** : Rotation avec pulsation temporelle

### 🌀 À Venir
- **Trou Noir** : Distorsion de l'espace-temps et lentille gravitationnelle
- **Galaxie** : Spirale galactique avec simulation N-corps
- **Fractales 3D** : Mandelbulb, Julia sets 4D
- **Ondes Gravitationnelles** : Visualisation des ripples spatio-temporels
- **Atome Quantique** : Orbitales électroniques et probabilités

## 🎮 Contrôles

- **Souris** : Rotation de la caméra (OrbitControls)
- **Molette** : Zoom avant/arrière
- **Espace** : Pause/Reprendre l'animation
- **← →** : Changer de niveau/comportement
- **Clics UI** : Navigation entre les scènes

## 🚀 Installation & Développement

### Prérequis
- Node.js 18+ et npm

### Installation
```bash
# Cloner le projet
git clone https://github.com/Augustino127/oblivion-tesseract.git
cd oblivion-tesseract

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

Le projet sera accessible sur `http://localhost:3000`

### Build pour production
```bash
npm run build
```

Les fichiers seront générés dans le dossier `dist/`

## 🏗️ Architecture

```
oblivion-tesseract/
├── index.html              # Point d'entrée HTML
├── src/
│   ├── main.js            # Application principale
│   ├── core/
│   │   └── Engine.js      # Moteur de rendu 3D
│   ├── scenes/
│   │   ├── Scene.js       # Classe de base pour les scènes
│   │   └── TesseractScene.js  # Scène du tesseract
│   ├── utils/
│   │   └── math.js        # Utilitaires mathématiques (projections 4D)
│   └── styles/
│       └── main.css       # Styles globaux
├── package.json
└── vite.config.js
```

## 🎨 Technologies

- **Three.js** : Rendu 3D WebGL
- **Vite** : Build tool moderne et rapide
- **Vanilla JavaScript** : Pas de framework, pure performance
- **GLSL** (à venir) : Shaders personnalisés pour effets avancés

## 🌍 Déploiement

Le projet est déployé automatiquement sur GitHub Pages à chaque push sur la branche `main`.

**URL** : [https://augustino127.github.io/oblivion-tesseract/](https://augustino127.github.io/oblivion-tesseract/)

## 📚 Concepts Scientifiques

### Tesseract (Hypercube)
Le tesseract est l'extension 4D d'un cube. Tout comme un cube est formé de 6 faces carrées, un tesseract est formé de 8 cubes 3D. Nous le visualisons via une projection stéréographique qui "aplatit" la 4ème dimension en 3D.

**Mathématiques :**
- 16 sommets (2⁴)
- 32 arêtes
- 24 faces carrées
- 8 cellules cubiques

**Rotations 4D :**
En 4D, on peut tourner dans 6 plans différents : XY, XZ, XW, YZ, YW, ZW. Les rotations XW, YW et ZW n'ont pas d'équivalent en 3D !

## 🤝 Contribution

Les contributions sont les bienvenues ! Chaque nouvelle visualisation, optimisation ou concept scientifique peut enrichir le projet.

### Workflow
1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/nouvelle-scene`)
3. Implémenter la fonctionnalité
4. Commit (`git commit -m 'Add: Scène de trou noir'`)
5. Push (`git push origin feature/nouvelle-scene`)
6. Ouvrir une Pull Request

## 📖 Ressources

- [Three.js Documentation](https://threejs.org/docs/)
- [Tesseract sur Wikipedia](https://fr.wikipedia.org/wiki/Tesseract)
- [Projections 4D](https://en.wikipedia.org/wiki/4D_projection)
- [WebGL Fundamentals](https://webglfundamentals.org/)

## 📄 Licence

MIT © 2026

---

**Fait avec ❤️ et beaucoup de café**

*"L'univers est écrit dans le langage des mathématiques"* - Galilée
