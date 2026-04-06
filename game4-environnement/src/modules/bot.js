/** @Module Module Bot - Serpents autonomes */

import Serpent from './serpent';
import { getRandomInt } from '../utils';

export default class BotManager {
    constructor(ctx, terrain) {
        this.ctx = ctx;
        this.terrain = terrain;
        this.bots = [];
    }

    // Créer les serpents autonomes
    createBots() {
        this.bots = [];
        const bot1 = new Serpent(5, 10, 10, 2, this.ctx, this.terrain, '#E24A4A', '#FF9999', '#FFCCCC');
        const bot2 = new Serpent(5, 15, 15, 0, this.ctx, this.terrain, '#E24A4A', '#FF9999', '#FFCCCC');
        this.bots.push(bot1, bot2);
    }

    // Mettre à jour les bots (mouvement et IA)
    update() {
        this.bots.forEach(bot => {
            // 30% de chance de changer de direction
            if (getRandomInt(10) < 3) {
                bot.direction = getRandomInt(4);
            }
            bot.move();
            bot.draw();
        });
    }

    // Obtenir les bots
    getBots() {
        return this.bots;
    }

    // Réinitialiser les bots
    reset() {
        this.bots = [];
    }
}
