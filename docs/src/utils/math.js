/**
 * Utilitaires mathématiques pour les projections 4D->3D->2D
 */

/**
 * Projection d'un point 4D en 3D (projection stéréographique)
 * @param {Array} point4D - Point 4D [x, y, z, w]
 * @param {number} distance - Distance de projection
 * @returns {Array} Point 3D [x, y, z]
 */
export function project4Dto3D(point4D, distance = 2) {
    const [x, y, z, w] = point4D;
    const factor = distance / (distance - w);
    return [x * factor, y * factor, z * factor];
}

/**
 * Rotation 4D autour du plan XW
 * @param {Array} point4D - Point 4D
 * @param {number} angle - Angle en radians
 * @returns {Array} Point 4D tourné
 */
export function rotate4D_XW(point4D, angle) {
    const [x, y, z, w] = point4D;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return [
        x * cos - w * sin,
        y,
        z,
        x * sin + w * cos
    ];
}

/**
 * Rotation 4D autour du plan YW
 * @param {Array} point4D - Point 4D
 * @param {number} angle - Angle en radians
 * @returns {Array} Point 4D tourné
 */
export function rotate4D_YW(point4D, angle) {
    const [x, y, z, w] = point4D;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return [
        x,
        y * cos - w * sin,
        z,
        y * sin + w * cos
    ];
}

/**
 * Rotation 4D autour du plan ZW
 * @param {Array} point4D - Point 4D
 * @param {number} angle - Angle en radians
 * @returns {Array} Point 4D tourné
 */
export function rotate4D_ZW(point4D, angle) {
    const [x, y, z, w] = point4D;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return [
        x,
        y,
        z * cos - w * sin,
        z * sin + w * cos
    ];
}

/**
 * Génère les 16 sommets d'un tesseract (hypercube 4D)
 * @param {number} size - Taille du tesseract
 * @returns {Array} Tableau de 16 points 4D
 */
export function generateTesseractVertices(size = 1) {
    const vertices = [];
    for (let i = 0; i < 16; i++) {
        vertices.push([
            (i & 1) ? size : -size,
            (i & 2) ? size : -size,
            (i & 4) ? size : -size,
            (i & 8) ? size : -size
        ]);
    }
    return vertices;
}

/**
 * Génère les 32 arêtes d'un tesseract
 * @returns {Array} Tableau de paires d'indices
 */
export function generateTesseractEdges() {
    const edges = [];

    // Pour chaque paire de sommets, si elle diffère d'exactement 1 bit, c'est une arête
    for (let i = 0; i < 16; i++) {
        for (let j = i + 1; j < 16; j++) {
            // XOR pour trouver les différences
            const diff = i ^ j;
            // Compter les bits à 1 (doit être exactement 1 pour une arête)
            if ((diff & (diff - 1)) === 0) {
                edges.push([i, j]);
            }
        }
    }

    return edges;
}
