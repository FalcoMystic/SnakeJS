import "./style.css";
import Terrain from './modules/terrain';
import Serpent from './modules/serpent';
import BotManager from './modules/bot';
import TunnelManager from './modules/tunnels';
import TimeAttackManager from './modules/timeAttack';
import { getRandomInt } from './utils';

let canvas = document.getElementById('terrain');
let ctx = canvas.getContext('2d');

// Variables globales
let gameMode = null;
let animationTimer = 0;
let starttime = 0;
let totalScore = 0;
let terrain = null;
let apples = [];
let serpent1 = null;
let applesEaten = 0;

// Managers
let botManager = null;
let tunnelManager = null;
let timeAttackManager = null;

const maxfps = 10;
const interval = 1000 / maxfps;

// Fonction pour générer les rochers
function generateRocks(count = 10) {
    for (let i = 0; i < count; i++) {
        let randI = getRandomInt(20);
        let randJ = getRandomInt(20);
        terrain.write(randI, randJ, 1);
    }
}

// Fonction pour générer les pommes
function generateApples(count = 3) {
    const applesArray = [];
    for (let i = 0; i < count; i++) {
        let randI = getRandomInt(20);
        let randJ = getRandomInt(20);
        while (terrain.read(randI, randJ) !== 0) {
            randI = getRandomInt(20);
            randJ = getRandomInt(20);
        }
        terrain.write(randI, randJ, 2);
        applesArray.push({ i: randI, j: randJ });
    }
    return applesArray;
}

// Fonction pour initialiser la partie selon le mode
function initGame(mode) {
    gameMode = mode;

    // Cacher le menu et afficher l'écran de jeu
    document.getElementById('menu').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'block';

    // Afficher/cacher les éléments selon le mode
    if (mode === 'timeAttack') {
        document.getElementById('timer').style.display = 'block';
        document.getElementById('collectibles').style.display = 'block';
    } else {
        document.getElementById('timer').style.display = 'none';
        document.getElementById('collectibles').style.display = 'none';
    }

    // Réinitialiser les variables
    animationTimer = 0;
    starttime = 0;
    totalScore = 0;
    applesEaten = 0;

    document.getElementById('score').textContent = 'Score: 0';
    document.getElementById('gameOver').textContent = 'Partie perdue';
    document.getElementById('gameOver').style.display = 'none';
    document.getElementById('buttonContainer').style.display = 'none';

    // Générer le terrain
    terrain = new Terrain(20, 20, ctx);
    terrain.draw();

    // Générer rochers
    generateRocks(10);

    // Initialiser les managers
    botManager = new BotManager(ctx, terrain);

    // Ne créer les bots que si ce n'est pas le mode Tunnels
    if (mode !== 'tunnels') {
        botManager.createBots();
    }

    tunnelManager = new TunnelManager(terrain);
    timeAttackManager = new TimeAttackManager();

    // Générer tunnels si mode Tunnels (AVANT les pommes)
    if (mode === 'tunnels') {
        tunnelManager.generate();
    }

    // Générer pommes selon le mode
    if (mode === 'timeAttack') {
        apples = generateApples(10);
        timeAttackManager.init();
    } else {
        apples = generateApples(3);
    }

    // Créer le serpent joueur
    serpent1 = new Serpent(3, 5, 3, 1, ctx, terrain, '#4A90E2', '#7CB3FF', '#B3D9FF');

    // Ajouter contrôle clavier
    setupKeyboardControls();

    // Commencer l'animation
    startRAF();
}

// Fonction pour configurer les contrôles clavier
function setupKeyboardControls() {
    document.removeEventListener('keydown', handleKeydown);
    document.addEventListener('keydown', handleKeydown);
}

function handleKeydown(event) {
    switch (event.key) {
        case 'ArrowUp':
            if (serpent1.direction !== 2) serpent1.direction = 0;
            break;
        case 'ArrowRight':
            if (serpent1.direction !== 3) serpent1.direction = 1;
            break;
        case 'ArrowDown':
            if (serpent1.direction !== 0) serpent1.direction = 2;
            break;
        case 'ArrowLeft':
            if (serpent1.direction !== 1) serpent1.direction = 3;
            break;
    }
}

// Event listeners du menu
document.getElementById('modeNormal').addEventListener('click', () => initGame('normal'));
document.getElementById('modeTunnels').addEventListener('click', () => initGame('tunnels'));
document.getElementById('modeTimeAttack').addEventListener('click', () => initGame('timeAttack'));

// Bouton Rejouer
document.getElementById('restartBtn').addEventListener('click', () => {
    cancelAnimationFrame(animationTimer);
    initGame(gameMode);
});

// Bouton Menu
document.getElementById('menuBtn').addEventListener('click', () => {
    cancelAnimationFrame(animationTimer);
    document.getElementById('gameScreen').style.display = 'none';
    document.getElementById('menu').style.display = 'block';
});

// Fonction pour démarrer l'animation
function startRAF(timestamp = 0) {
    animationTimer = requestAnimationFrame(startRAF);
    if (starttime === 0) starttime = timestamp;
    let delta = timestamp - starttime;
    if (delta >= interval) {
        anim();
        starttime = timestamp - (delta % interval);
    }
}

function anim() {
    // Mettre à jour le timer pour Time Attack
    if (gameMode === 'timeAttack') {
        timeAttackManager.update();
        document.getElementById('timer').textContent = `Temps: ${timeAttackManager.getTimeRemaining()}`;
        document.getElementById('collectibles').textContent = `Collectibles: ${timeAttackManager.getAppleCount()}/${timeAttackManager.getTargetApples()}`;

        // Vérifier si le temps est écoulé
        if (timeAttackManager.isTimeUp()) {
            if (timeAttackManager.isVictory()) {
                document.getElementById('gameOver').textContent = 'Victoire !';
            } else {
                document.getElementById('gameOver').textContent = 'Temps écoulé !';
            }
            document.getElementById('gameOver').style.display = 'block';
            document.getElementById('buttonContainer').style.display = 'flex';
            cancelAnimationFrame(animationTimer);
            return;
        }
    }

    ctx.fillRect(0, 0, canvas.width, canvas.height);
    terrain.draw();

    // Vérifier ce que la tête du joueur va toucher
    const nextCell = serpent1.anneaux[0].read(serpent1.direction);

    // Vérifier si on rentre dans un tunnel (Mode Tunnels)
    if (gameMode === 'tunnels') {
        if (tunnelManager.checkTeleport(serpent1.anneaux[0], serpent1.direction)) {
            // Téléporté - ne rien faire, le serpent se déplacera normalement à la prochaine itération
        } else if (nextCell === 2) {
            handleAppleCollision();
        } else if (nextCell === 1 || nextCell === 3 || nextCell === 7 || nextCell === undefined) {
            handleGameOver();
        } else {
            serpent1.move();
        }
    } else if (nextCell === 2) {
        handleAppleCollision();
    } else if (nextCell === 1 || nextCell === 3 || nextCell === 7 || nextCell === undefined) {
        handleGameOver();
    } else {
        serpent1.move();
    }

    serpent1.draw();

    // Mettre à jour les bots (sauf en mode Tunnels)
    if (gameMode !== 'tunnels') {
        botManager.update();
    }
}

// Fonction pour gérer la collision avec une pomme
function handleAppleCollision() {
    const headI = serpent1.anneaux[0].i;
    const headJ = serpent1.anneaux[0].j;

    serpent1.moveForward();
    serpent1.extend();

    // Effacer la pomme mangée
    terrain.write(headI, headJ, 0);
    totalScore++;
    applesEaten++;

    // Mettre à jour l'affichage du score
    document.getElementById('score').textContent = `Score: ${totalScore}`;

    // Gérer la génération de pommes selon le mode
    if (gameMode === 'timeAttack') {
        timeAttackManager.addApple();

        // Vérifier condition de victoire
        if (timeAttackManager.isVictory()) {
            document.getElementById('gameOver').textContent = 'Victoire !';
            document.getElementById('gameOver').style.display = 'block';
            document.getElementById('buttonContainer').style.display = 'flex';
            cancelAnimationFrame(animationTimer);
            return;
        }

        // Générer une seule pomme
        apples.push(timeAttackManager.generateOneApple(terrain));
    } else {
        // Normal et Tunnels : générer 3 pommes seulement après avoir mangé 3
        if (applesEaten >= 3) {
            apples = generateApples(3);
            applesEaten = 0;
        }
    }
}

// Fonction pour gérer Game Over
function handleGameOver() {
    document.getElementById('gameOver').textContent = 'Partie perdue';
    document.getElementById('gameOver').style.display = 'block';
    document.getElementById('buttonContainer').style.display = 'flex';
    cancelAnimationFrame(animationTimer);
}