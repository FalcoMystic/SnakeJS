/** @Module Module Time Attack - Logique du mode Time Attack */

import { getRandomInt } from '../utils';

export default class TimeAttackManager {
    constructor() {
        this.timeRemaining = 60;
        this.targetApples = 30;
        this.gameStartTime = 0;
        this.appleCount = 0;
    }

    // Initialiser le Time Attack
    init() {
        this.timeRemaining = 60;
        this.gameStartTime = Date.now();
        this.appleCount = 0;
    }

    // Mettre à jour le timer
    update() {
        const elapsed = (Date.now() - this.gameStartTime) / 1000;
        this.timeRemaining = Math.max(0, 60 - Math.floor(elapsed));
        return this.timeRemaining;
    }

    // Vérifier si le temps est écoulé
    isTimeUp() {
        return this.timeRemaining === 0;
    }

    // Vérifier la victoire
    isVictory() {
        return this.appleCount >= this.targetApples;
    }

    // Ajouter une pomme
    addApple() {
        this.appleCount++;
    }

    // Obtenir le nombre de pommes
    getAppleCount() {
        return this.appleCount;
    }

    // Obtenir le temps restant
    getTimeRemaining() {
        return this.timeRemaining;
    }

    // Obtenir l'objectif de pommes
    getTargetApples() {
        return this.targetApples;
    }

    // Générer une seule pomme
    generateOneApple(terrain) {
        let randI = getRandomInt(20);
        let randJ = getRandomInt(20);
        while (terrain.read(randI, randJ) !== 0) {
            randI = getRandomInt(20);
            randJ = getRandomInt(20);
        }
        terrain.write(randI, randJ, 2);
        return { i: randI, j: randJ };
    }

    // Réinitialiser
    reset() {
        this.timeRemaining = 60;
        this.gameStartTime = 0;
        this.appleCount = 0;
    }
}
