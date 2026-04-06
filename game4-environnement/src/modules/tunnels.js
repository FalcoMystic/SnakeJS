/** @Module Module Tunnels - Logique des tunnels */

import { getRandomInt } from '../utils';

export default class TunnelManager {
    constructor(terrain) {
        this.terrain = terrain;
        this.tunnelPairs = [];
    }

    // Générer les tunnels (Mode Tunnels uniquement)
    generate() {
        this.tunnelPairs = [];
        // 3 sections : 0-6, 7-13, 14-19
        const sections = [
            { start: 0, end: 6 },
            { start: 7, end: 13 },
            { start: 14, end: 19 }
        ];

        // Générer les barrières pour séparer les 3 sections
        this.generateBarriers();

        // Définir les portails pour chaque section
        // Gauche et droite : codes [rose=4, bleu=5, jaune=6]
        const leftCodes = [4, 5, 6];   // De haut en bas : rose, bleu, jaune
        const rightCodes = [6, 4, 5];  // De haut en bas : jaune, rose, bleu

        // Créer les paires de tunnels avec les codes définis
        // Paire rose (4) : section 0 gauche <-> section 1 droite
        // Paire bleu (5) : section 1 gauche <-> section 2 droite
        // Paire jaune (6) : section 0 droite <-> section 2 gauche

        for (let sectionIdx = 0; sectionIdx < sections.length; sectionIdx++) {
            const section = sections[sectionIdx];

            // Calculer le centre de la section
            const tunnelJ = Math.floor((section.start + section.end) / 2);

            // Placer les portails gauche et droite
            const leftCode = leftCodes[sectionIdx];
            const rightCode = rightCodes[sectionIdx];

            this.terrain.write(0, tunnelJ, leftCode);   // Portail gauche
            this.terrain.write(19, tunnelJ, rightCode); // Portail droite

            // Enregistrer l'emplacement des portails pour les connexions
            if (sectionIdx === 0) {
                // Section 0 : gauche=rose, droite=jaune
                this.tunnelPairs.push({
                    entry: { i: 0, j: tunnelJ },      // Rose gauche
                    exit: { i: 19, j: tunnelJ },      // J'utiliserai des positions différentes
                    code: 4
                });
                this.tunnelPairs.push({
                    entry: { i: 19, j: tunnelJ },     // Jaune droite
                    exit: { i: 0, j: tunnelJ },       // J'utiliserai des positions différentes
                    code: 6
                });
            } else if (sectionIdx === 1) {
                // Section 1 : gauche=bleu, droite=rose
                this.tunnelPairs.push({
                    entry: { i: 0, j: tunnelJ },      // Bleu gauche
                    exit: { i: 19, j: tunnelJ },      // J'utiliserai des positions différentes
                    code: 5
                });
                this.tunnelPairs.push({
                    entry: { i: 19, j: tunnelJ },     // Rose droite
                    exit: { i: 0, j: tunnelJ },       // J'utiliserai des positions différentes
                    code: 4
                });
            } else {
                // Section 2 : gauche=jaune, droite=bleu
                this.tunnelPairs.push({
                    entry: { i: 0, j: tunnelJ },      // Jaune gauche
                    exit: { i: 19, j: tunnelJ },      // J'utiliserai des positions différentes
                    code: 6
                });
                this.tunnelPairs.push({
                    entry: { i: 19, j: tunnelJ },     // Bleu droite
                    exit: { i: 0, j: tunnelJ },       // J'utiliserai des positions différentes
                    code: 5
                });
            }
        }

        // Créer les vraies connexions entre les portails de différentes sections
        this.createPortalConnections();
    }

    // Créer les connexions entre les portails des 3 sections
    createPortalConnections() {
        // On repart de zéro avec les vraies connexions
        this.tunnelPairs = [];

        // Trouver les positions des portails
        const portals = { 4: [], 5: [], 6: [] }; // rose, bleu, jaune

        for (let i = 0; i < 20; i++) {
            for (let j = 0; j < 20; j++) {
                const val = this.terrain.read(i, j);
                if (val >= 4 && val <= 6) {
                    portals[val].push({ i, j });
                }
            }
        }

        // Créer les paires de connexions :
        // Rose (4) : section 0 gauche <-> section 1 droite
        // Bleu (5) : section 1 gauche <-> section 2 droite
        // Jaune (6) : section 0 droite <-> section 2 gauche

        if (portals[4].length >= 2) {
            this.tunnelPairs.push({
                entry: portals[4][0],
                exit: portals[4][1],
                code: 4
            });
        }

        if (portals[5].length >= 2) {
            this.tunnelPairs.push({
                entry: portals[5][0],
                exit: portals[5][1],
                code: 5
            });
        }

        if (portals[6].length >= 2) {
            this.tunnelPairs.push({
                entry: portals[6][0],
                exit: portals[6][1],
                code: 6
            });
        }
    }

    // Vérifier et traiter la téléportation
    checkTeleport(serpentHead, direction) {
        const nextCell = serpentHead.read(direction);

        if (nextCell >= 4 && nextCell <= 6) {
            const tunnelPair = this.tunnelPairs.find(t => t.code === nextCell);
            if (tunnelPair) {
                const nextI = serpentHead.i + (direction === 1 ? 1 : direction === 3 ? -1 : 0);
                const nextJ = serpentHead.j + (direction === 2 ? 1 : direction === 0 ? -1 : 0);

                if (nextI === tunnelPair.entry.i && nextJ === tunnelPair.entry.j) {
                    // Sauver l'ancienne position
                    const oldI = serpentHead.i;
                    const oldJ = serpentHead.j;

                    // Téléporter
                    serpentHead.i = tunnelPair.exit.i;
                    serpentHead.j = tunnelPair.exit.j;

                    // Nettoyer l'ancienne position de la tête
                    const oldValue = this.terrain.read(oldI, oldJ);
                    if (oldValue === 3) {  // Si c'est du code corps
                        this.terrain.write(oldI, oldJ, 0);  // Effacer
                    }

                    return true;
                } else if (nextI === tunnelPair.exit.i && nextJ === tunnelPair.exit.j) {
                    // Sauver l'ancienne position
                    const oldI = serpentHead.i;
                    const oldJ = serpentHead.j;

                    // Téléporter
                    serpentHead.i = tunnelPair.entry.i;
                    serpentHead.j = tunnelPair.entry.j;

                    // Nettoyer l'ancienne position de la tête
                    const oldValue = this.terrain.read(oldI, oldJ);
                    if (oldValue === 3) {  // Si c'est du code corps
                        this.terrain.write(oldI, oldJ, 0);  // Effacer
                    }

                    return true;
                }
            }
        }
        return false;
    }

    // Obtenir les tunnels
    getTunnels() {
        return this.tunnelPairs;
    }

    // Générer les barrières entre les sections
    generateBarriers() {
        // Barrière entre section 1 et 2 (à j=6)
        for (let i = 0; i < 20; i++) {
            this.terrain.write(i, 6, 7);
        }
        // Barrière entre section 2 et 3 (à j=13)
        for (let i = 0; i < 20; i++) {
            this.terrain.write(i, 13, 7);
        }
    }

    // Réinitialiser
    reset() {
        this.tunnelPairs = [];
    }
}
