// Translations inlined to avoid import assertions (not supported in all browsers)
const translations = {
  pt: {
    lang: "pt",
    title: "Eco-Tycoon: Resgate do Planeta",
    subtitle: "Salva o teu planeta da poluição!",
    play: "Jogar",
    credits: "Créditos",
    back: "Voltar",
    language: "Idioma",
    controls_title: "Controlos",
    controls_move: "WASD / Setas — Mover Robô",
    controls_plant: "E — Plantar Árvore",
    controls_build: "Q — Construir Purificador",
    controls_restart: "R — Reiniciar",
    score: "Pontos",
    health: "Saúde do Planeta",
    trees: "Árvores",
    purifiers: "Purificadores",
    pollution: "Poluição",
    game_over: "Planeta Destruído!",
    victory: "Planeta Salvo!",
    victory_sub: "Parabéns, herói ambiental!",
    game_over_sub: "A poluição venceu desta vez...",
    restart: "Jogar de Novo (R)",
    menu: "Menu Principal (M)",
    plant_tree: "Árvore plantada! (+5 pts)",
    build_purifier: "Purificador construído! (+10 pts)",
    no_resources: "Recursos insuficientes!",
    resources: "Recursos",
    level: "Nível",
    wave: "Vaga",
    tip_tree: "Árvores absorvem poluição lentamente",
    tip_purifier: "Purificadores destroem nuvens de poluição",
    credits_text: "Desenvolvido como projeto académico\nMotor: Phaser 3\nArte: Gerada proceduralmente",
    paused: "Pausado",
    pause_hint: "P para pausar/retomar",
    objective: "Objetivo: Reduz a poluição para 0%"
  },
  en: {
    lang: "en",
    title: "Eco-Tycoon: Planet Rescue",
    subtitle: "Save your planet from pollution!",
    play: "Play",
    credits: "Credits",
    back: "Back",
    language: "Language",
    controls_title: "Controls",
    controls_move: "WASD / Arrows — Move Robot",
    controls_plant: "E — Plant Tree",
    controls_build: "Q — Build Purifier",
    controls_restart: "R — Restart",
    score: "Score",
    health: "Planet Health",
    trees: "Trees",
    purifiers: "Purifiers",
    pollution: "Pollution",
    game_over: "Planet Destroyed!",
    victory: "Planet Saved!",
    victory_sub: "Congratulations, eco-hero!",
    game_over_sub: "Pollution won this time...",
    restart: "Play Again (R)",
    menu: "Main Menu (M)",
    plant_tree: "Tree planted! (+5 pts)",
    build_purifier: "Purifier built! (+10 pts)",
    no_resources: "Insufficient resources!",
    resources: "Resources",
    level: "Level",
    wave: "Wave",
    tip_tree: "Trees slowly absorb pollution",
    tip_purifier: "Purifiers destroy pollution clouds",
    credits_text: "Developed as academic project\nEngine: Phaser 3\nArt: Procedurally generated",
    paused: "Paused",
    pause_hint: "P to pause/resume",
    objective: "Objective: Reduce pollution to 0%"
  }
};

let currentLang = 'pt';

export function setLang(lang) {
  if (translations[lang]) currentLang = lang;
}

export function getLang() {
  return currentLang;
}

export function t(key) {
  return translations[currentLang][key] ?? translations['en'][key] ?? key;
}

export function getAvailableLangs() {
  return Object.keys(translations);
}
