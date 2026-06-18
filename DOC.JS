const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  LevelFormat, PageNumber, PageBreak
} = require('docx');
const fs = require('fs');

// ─── COLOURS ───────────────────────────────────────────────
const GREEN  = "1B5E20";
const LGREEN = "E8F5E9";
const BLUE   = "0D47A1";
const LBLUE  = "E3F2FD";
const GREY   = "37474F";
const LGREY  = "ECEFF1";
const WHITE  = "FFFFFF";
const BLACK  = "212121";

const border = { style: BorderStyle.SINGLE, size: 1, color: "BDBDBD" };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

// ─── HELPERS ───────────────────────────────────────────────
function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 320, after: 160 },
    children: [new TextRun({ text, bold: true, size: 32, color: GREEN, font: "Arial" })]
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120 },
    children: [new TextRun({ text, bold: true, size: 26, color: BLUE, font: "Arial" })]
  });
}

function h3(text) {
  return new Paragraph({
    spacing: { before: 180, after: 80 },
    children: [new TextRun({ text, bold: true, size: 24, color: GREY, font: "Arial" })]
  });
}

function p(text, options = {}) {
  return new Paragraph({
    spacing: { before: 60, after: 100 },
    children: [new TextRun({ text, size: 22, font: "Arial", color: BLACK, ...options })]
  });
}

function bullet(text, bold = false) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { before: 40, after: 40 },
    children: [new TextRun({ text, size: 22, font: "Arial", bold, color: BLACK })]
  });
}

function code(text) {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    indent: { left: 720 },
    children: [new TextRun({ text, size: 20, font: "Courier New", color: "1A237E" })]
  });
}

function divider() {
  return new Paragraph({
    spacing: { before: 200, after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "BDBDBD", space: 1 } },
    children: []
  });
}

function headerCell(text, w) {
  return new TableCell({
    borders,
    width: { size: w, type: WidthType.DXA },
    shading: { fill: GREEN, type: ShadingType.CLEAR },
    margins: { top: 100, bottom: 100, left: 140, right: 140 },
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text, bold: true, size: 20, color: WHITE, font: "Arial" })]
    })]
  });
}

function cell(text, w, shade = WHITE, bold = false) {
  return new TableCell({
    borders,
    width: { size: w, type: WidthType.DXA },
    shading: { fill: shade, type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 140, right: 140 },
    children: [new Paragraph({
      children: [new TextRun({ text, size: 20, font: "Arial", color: BLACK, bold })]
    })]
  });
}

function twoCol(left, right, lw = 4000, rw = 5020) {
  return new Table({
    width: { size: 9020, type: WidthType.DXA },
    columnWidths: [lw, rw],
    rows: [new TableRow({ children: [
      cell(left,  lw, LGREY, true),
      cell(right, rw, WHITE)
    ]})]
  });
}

function infoBox(lines, color = LBLUE) {
  const rows = lines.map(([k, v]) =>
    new TableRow({ children: [
      cell(k, 3200, LGREY, true),
      cell(v, 5820, WHITE)
    ]})
  );
  return new Table({
    width: { size: 9020, type: WidthType.DXA },
    columnWidths: [3200, 5820],
    rows
  });
}

function space(n = 1) {
  return Array.from({ length: n }, () =>
    new Paragraph({ spacing: { before: 0, after: 0 }, children: [new TextRun("")] })
  );
}

// ─── DOCUMENT ──────────────────────────────────────────────
const doc = new Document({
  numbering: {
    config: [{
      reference: "bullets",
      levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022",
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } } }]
    }]
  },
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Arial", color: GREEN },
        paragraph: { spacing: { before: 320, after: 160 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Arial", color: BLUE },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 } },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: 1200, right: 1200, bottom: 1200, left: 1200 }
      }
    },
    children: [

      // ══════════════════════════════════════════
      // CAPA
      // ══════════════════════════════════════════
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 1800, after: 200 },
        children: [new TextRun({ text: "🌍 ECO-TYCOON: PLANET RESCUE", bold: true, size: 52, color: GREEN, font: "Arial" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 200 },
        children: [new TextRun({ text: "Documentação Técnica do Projeto", size: 30, color: GREY, font: "Arial" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 600 },
        children: [new TextRun({ text: "Trabalho Prático 2 — Phaser 3 | Tecnologias Multimédia 2025/2026", size: 24, color: GREY, font: "Arial", italics: true })]
      }),
      divider(),
      ...space(2),

      // ══════════════════════════════════════════
      // 1. VISÃO GERAL
      // ══════════════════════════════════════════
      h1("1. Visão Geral do Jogo"),
      p("O Eco-Tycoon: Planet Rescue é um jogo de estratégia/gestão desenvolvido em Phaser 3. O jogador controla um robô num planeta poluído e tem de plantar árvores e construir purificadores de ar para limpar o ambiente antes que a saúde do planeta chegue a zero."),
      ...space(1),
      infoBox([
        ["Motor",         "Phaser 3.80.1 (via CDN)"],
        ["Linguagem",     "JavaScript ES6+ (módulos nativos)"],
        ["Física",        "Arcade Physics"],
        ["Arte",          "Gerada proceduralmente via Phaser Graphics API"],
        ["Som",           "Gerado proceduralmente via Web Audio API"],
        ["Idiomas",       "Português (PT) e Inglês (EN)"],
        ["Resolução",     "960 × 640 px"],
        ["Cenas",         "7 (Boot, Preload, Menu, Game, GameOver, Victory, Credits)"],
      ]),
      ...space(1),
      divider(),

      // ══════════════════════════════════════════
      // 2. ESTRUTURA DE FICHEIROS
      // ══════════════════════════════════════════
      h1("2. Estrutura de Ficheiros"),
      p("O projeto está organizado da seguinte forma na raiz do repositório:"),
      ...space(1),
      code("eco-tycoon/"),
      code("├── index.html              ← ponto de entrada, carrega Phaser via CDN"),
      code("├── package.json            ← script npm start (npx serve)"),
      code("├── .gitignore"),
      code("├── README.md               ← documentação completa do projeto"),
      code("└── src/"),
      code("    ├── main.js             ← configuração do Phaser, registo de cenas"),
      code("    ├── AudioManager.js     ← todos os sons (Web Audio API)"),
      code("    ├── i18n/"),
      code("    │   ├── i18n.js         ← gestor de traduções (t, setLang, getLang)"),
      code("    │   ├── pt.json         ← strings em Português"),
      code("    │   └── en.json         ← strings em Inglês"),
      code("    └── scenes/"),
      code("        ├── BootScene.js    ← arranque inicial"),
      code("        ├── PreloadScene.js ← geração de todos os assets"),
      code("        ├── MenuScene.js    ← menu principal"),
      code("        ├── GameScene.js    ← lógica principal do jogo"),
      code("        ├── GameOverScene.js← ecrã de derrota"),
      code("        ├── VictoryScene.js ← ecrã de vitória"),
      code("        └── CreditsScene.js ← créditos"),
      ...space(1),
      divider(),

      // ══════════════════════════════════════════
      // 3. FICHEIROS — O QUE FAZ CADA UM
      // ══════════════════════════════════════════
      h1("3. O Que Faz Cada Ficheiro"),

      // index.html
      h2("index.html"),
      p("O ponto de entrada do jogo. Faz duas coisas:"),
      bullet("Carrega o Phaser 3.80.1 a partir do CDN (jsdelivr.net)"),
      bullet("Carrega o src/main.js como módulo ES6"),
      p("Também define o estilo da página (fundo preto, canvas centrado). Não contém lógica de jogo."),
      ...space(1),

      // main.js
      h2("src/main.js"),
      p("Configura e inicia o motor Phaser. Define:"),
      bullet("Resolução do canvas: 960 × 640 px"),
      bullet("Tipo de renderização: Phaser.AUTO (WebGL se disponível, senão Canvas)"),
      bullet("Física Arcade com gravidade zero (jogo top-down)"),
      bullet("Lista de todas as cenas registadas, pela ordem de arranque"),
      p("É o único ficheiro que instancia o objeto Phaser.Game."),
      ...space(1),

      // AudioManager.js
      h2("src/AudioManager.js"),
      p("Centraliza toda a lógica de som do jogo. Usa a Web Audio API do browser para gerar sons proceduralmente — sem ficheiros de áudio externos."),
      p("Métodos principais:"),
      bullet("playPlantTree() — notas ascendentes alegres ao plantar uma árvore"),
      bullet("playBuildPurifier() — ruído mecânico ao construir um purificador"),
      bullet("playPollutionHit() — batida grave ao ser atingido por poluição"),
      bullet("playCleanBurst() — sons agudos e brilhantes ao purificar uma nuvem"),
      bullet("playDebrisLand() — impacto ao ser atingido por detritos"),
      bullet("playGameOver() — melodia descendente e triste"),
      bullet("playVictory() — fanfarra ascendente de vitória"),
      bullet("playButtonClick() — bip curto ao clicar botões"),
      bullet("startAmbient() / stopAmbient() — hum ambiente suave em loop"),
      p("O AudioManager é criado uma vez no MenuScene e guardado no registry do Phaser (this.registry) para ser partilhado entre todas as cenas."),
      ...space(1),

      // i18n
      h2("src/i18n/i18n.js"),
      p("Gere o sistema de internacionalização (i18n). Contém as traduções de PT e EN como objetos JavaScript inline (para compatibilidade com browsers sem bundler)."),
      p("Funções exportadas:"),
      bullet("t(key) — devolve a string traduzida na língua atual"),
      bullet("setLang(lang) — muda o idioma ativo"),
      bullet("getLang() — devolve o idioma atual"),
      bullet("getAvailableLangs() — devolve ['pt', 'en']"),
      p("Os ficheiros pt.json e en.json existem como referência/documentação, mas as traduções reais estão inline no i18n.js para evitar o erro de import assertions nos browsers."),
      ...space(1),
      divider(),

      // ══════════════════════════════════════════
      // 4. CENAS
      // ══════════════════════════════════════════
      h1("4. Cenas — Descrição Detalhada"),

      h2("BootScene.js"),
      p("A cena mais simples do projeto. Serve apenas como ponto de arranque e transita imediatamente para a cena Preload. Existe por boas práticas arquiteturais — permite futuramente adicionar lógica de inicialização sem alterar outras cenas."),
      ...space(1),

      h2("PreloadScene.js"),
      p("Responsável por gerar todos os assets visuais do jogo antes de qualquer cena ser apresentada. Usa o método generateTexture() da Phaser Graphics API para criar sprites em memória sem ficheiros externos."),
      p("Assets gerados:"),
      bullet("robot — sprite principal do jogador (corpo, cabeça, olhos, braços, pernas, antena)"),
      bullet("robot_walk_0 a robot_walk_3 — 4 frames de animação de caminhada"),
      bullet("tree_1, tree_2, tree_3 — 3 estágios de crescimento da árvore"),
      bullet("purifier — estrutura do purificador de ar com luz verde pulsante"),
      bullet("cloud_small, cloud_medium, cloud_large — 3 tamanhos de nuvens de poluição"),
      bullet("debris_0 a debris_3 — 4 variantes de detritos espaciais"),
      bullet("particle_smoke, particle_clean, particle_leaf — partículas de efeitos"),
      bullet("icon_health, icon_resource, icon_score — ícones do HUD"),
      bullet("bg_tile, ground_tile — tiles de fundo e chão"),
      p("Após gerar todas as texturas, transita para o MenuScene."),
      ...space(1),

      h2("MenuScene.js"),
      p("O menu principal do jogo. Apresenta:"),
      bullet("Título animado com tween de flutuação"),
      bullet("Botões Jogar e Créditos com efeitos hover"),
      bullet("Seletor de idioma PT / EN no canto inferior"),
      bullet("Painel de controlos com todas as teclas"),
      bullet("Robô animado e árvores decorativas"),
      bullet("Partículas de folhas flutuantes no fundo"),
      bullet("Som ambiente em loop"),
      p("O AudioManager é criado aqui e guardado no registry para ser reutilizado nas outras cenas. Ao mudar o idioma, a cena reinicia-se (scene.restart()) para redesenhar todo o texto."),
      ...space(1),

      h2("GameScene.js"),
      p("O coração do projeto — contém toda a lógica de jogo. Está organizado em secções claras assinaladas por comentários."),
      ...space(1),
      h3("Estado do Jogo (variáveis principais)"),
      infoBox([
        ["score",        "Pontuação acumulada do jogador"],
        ["resources",    "Recursos disponíveis para construir (0–30)"],
        ["pollution",    "Nível de poluição do planeta (0–100%)"],
        ["planetHealth", "Saúde do planeta (0–100). Chegar a 0 = derrota"],
        ["waveIndex",    "Número da vaga atual (0–4)"],
        ["treeCount",    "Número de árvores plantadas"],
        ["purifierCount","Número de purificadores construídos"],
      ]),
      ...space(1),
      h3("Física Arcade — Grupos"),
      bullet("trees — StaticGroup (árvores não se movem, têm hitbox estática)"),
      bullet("purifiers — StaticGroup (purificadores fixos no chão)"),
      bullet("pollutionClouds — Group dinâmico com velocidade e física"),
      bullet("debrisGroup — Group com velocidade e rotação angular"),
      bullet("resourcePickups — Group para itens apanhados pelo jogador"),
      ...space(1),
      h3("Overlaps (Colisões Detetadas)"),
      new Table({
        width: { size: 9020, type: WidthType.DXA },
        columnWidths: [2800, 2800, 3420],
        rows: [
          new TableRow({ children: [headerCell("Objeto A", 2800), headerCell("Objeto B", 2800), headerCell("Efeito", 3420)] }),
          new TableRow({ children: [cell("player", 2800, LGREY), cell("pollutionClouds", 2800), cell("Aumenta poluição +2, reduz saúde -3", 3420)] }),
          new TableRow({ children: [cell("player", 2800, LGREY), cell("debrisGroup", 2800), cell("Aumenta poluição +5, reduz saúde -8", 3420)] }),
          new TableRow({ children: [cell("player", 2800, LGREY), cell("resourcePickups", 2800), cell("Recolhe +3 recursos", 3420)] }),
          new TableRow({ children: [cell("purifiers", 2800, LGREY), cell("pollutionClouds", 2800), cell("Destrói a nuvem, reduz poluição -4", 3420)] }),
        ]
      }),
      ...space(1),
      h3("Sistema de Vagas"),
      p("As 5 vagas estão definidas no array WAVE_CONFIGS. Cada vaga tem um número de nuvens, detritos, duração e multiplicador de velocidade. As vagas ficam progressivamente mais difíceis. Após cada vaga, a seguinte começa automaticamente após 2 segundos."),
      ...space(1),
      h3("Timers (Eventos Periódicos)"),
      bullet("A cada 4 segundos: regenera +1 recurso (máx. 30)"),
      bullet("A cada 3 segundos: cada árvore absorve poluição conforme o seu estágio de crescimento"),
      bullet("A cada 2 segundos: cada purificador reduz a poluição em -1"),
      ...space(1),
      h3("Condições de Fim"),
      bullet("Derrota: planetHealth chega a 0"),
      bullet("Vitória: pollution <= 15% E waveIndex >= 4 (última vaga concluída)"),
      ...space(1),
      h3("Overlay de Cor (Efeito Visual de Poluição)"),
      p("À medida que a poluição aumenta, um overlay semi-transparente cinzento-acastanhado é desenhado sobre o cenário via Graphics API. Quanto mais poluição, mais escuro e baço fica o ecrã. A 0% de poluição o overlay desaparece completamente."),
      ...space(1),

      h2("GameOverScene.js"),
      p("Ecrã de derrota. Mostra o título 'Planeta Destruído!', a pontuação final, e dois botões: Jogar de Novo (R) e Menu Principal (M). Tem partículas de fumo a subir e um robô com tint vermelho animado. As teclas R e M também funcionam por teclado."),
      ...space(1),

      h2("VictoryScene.js"),
      p("Ecrã de vitória. Mostra o título 'Planeta Salvo!', a pontuação final, e os mesmos botões de reinício. Tem uma chuva de folhas verdes, sparkles brilhantes, e árvores decorativas a aparecerem com animação. O robô tem tint verde."),
      ...space(1),

      h2("CreditsScene.js"),
      p("Ecrã de créditos com informações sobre o motor, tecnologias usadas, idiomas suportados e origem dos assets. Os elementos aparecem com fade-in sequencial. O botão Voltar e a tecla ESC regressam ao menu."),
      ...space(1),
      divider(),

      // ══════════════════════════════════════════
      // 5. CONTROLOS
      // ══════════════════════════════════════════
      h1("5. Controlos do Jogo"),
      new Table({
        width: { size: 9020, type: WidthType.DXA },
        columnWidths: [2200, 6820],
        rows: [
          new TableRow({ children: [headerCell("Tecla", 2200), headerCell("Ação", 6820)] }),
          ...[
            ["W / ↑",        "Mover robô para cima"],
            ["S / ↓",        "Mover robô para baixo"],
            ["A / ←",        "Mover robô para a esquerda"],
            ["D / →",        "Mover robô para a direita"],
            ["E",            "Plantar árvore na posição atual (custa 2 recursos)"],
            ["Q",            "Construir purificador na posição atual (custa 5 recursos)"],
            ["P",            "Pausar / Retomar o jogo"],
            ["R",            "Reiniciar o jogo (funciona também no Game Over e Vitória)"],
            ["M",            "Regressar ao menu principal"],
          ].map(([k, v]) => new TableRow({ children: [cell(k, 2200, LGREY, true), cell(v, 6820)] }))
        ]
      }),
      ...space(1),
      divider(),

      // ══════════════════════════════════════════
      // 6. MECÂNICAS DETALHADAS
      // ══════════════════════════════════════════
      h1("6. Mecânicas Detalhadas"),

      h2("Árvores"),
      bullet("Custo: 2 recursos"),
      bullet("Crescem em 3 estágios ao longo do tempo (sapling → jovem → adulta)"),
      bullet("Cada estágio absorve mais poluição por tick (estágio 1 = 0.5, estágio 2 = 1.0, estágio 3 = 1.5)"),
      bullet("Ao plantar: emite partículas de folhas e som alegre"),
      bullet("A crescer: emite partículas de folhas ocasionalmente"),
      ...space(1),

      h2("Purificadores"),
      bullet("Custo: 5 recursos"),
      bullet("Destroem automaticamente qualquer nuvem de poluição que toque neles via overlap"),
      bullet("Reduzem passivamente a poluição em -1 a cada 2 segundos"),
      bullet("Efeito visual: alpha pulsante (tween de fade in/out)"),
      ...space(1),

      h2("Nuvens de Poluição"),
      bullet("3 tamanhos: pequena (dano 1), média (dano 2), grande (dano 3)"),
      bullet("Caem do topo com velocidade aleatória (ajustada pelo speedMult da vaga)"),
      bullet("Emitem partículas de fumo continuamente durante o voo"),
      bullet("Se passarem o limite inferior sem serem destruídas: +3 poluição, -2 saúde"),
      ...space(1),

      h2("Detritos Espaciais"),
      bullet("4 variantes visuais, todos com rotação angular"),
      bullet("Caem mais rápido do que as nuvens"),
      bullet("Ao atingir o jogador: +5 poluição, -8 saúde, shake da câmara"),
      bullet("Destroem-se ao atingir o jogador (não reaparecem)"),
      bullet("40% de probabilidade de largar um recurso ao ser destruído"),
      ...space(1),

      h2("Recursos"),
      bullet("Começam em 15 (após ajuste de dificuldade)"),
      bullet("Regeneram automaticamente +1 a cada 2.5 segundos (máx. 30)"),
      bullet("Pickups no chão valem +3 e desaparecem após 8 segundos"),
      ...space(1),
      divider(),

      // ══════════════════════════════════════════
      // 7. MULTIMÉDIA
      // ══════════════════════════════════════════
      h1("7. Componente Multimédia"),

      h2("Arte Procedural"),
      p("Todos os sprites são gerados em tempo real pela Phaser Graphics API usando formas geométricas (retângulos, círculos, elipses, polígonos). O método generateTexture() converte o desenho numa textura reutilizável. Vantagens: zero dependências externas, tamanho de projeto mínimo, resolução sempre proporcional ao uso."),
      ...space(1),

      h2("Som Procedural"),
      p("Todos os sons são sintetizados em tempo real pela Web Audio API usando osciladores (sine, square, sawtooth, triangle) e buffers de ruído branco. O AudioManager encapsula toda esta lógica e é partilhado entre cenas via o registry do Phaser."),
      ...space(1),

      h2("Sistema de Partículas"),
      p("Três emitters Phaser 3 são criados no início do GameScene:"),
      bullet("_smokeEmitter — partículas cinzentas para fumo de poluição (clouds, impactos)"),
      bullet("_cleanEmitter — sparkles verdes para purificação e vitória"),
      bullet("_leafEmitter — folhas verdes para plantar árvores e crescimento"),
      p("Os emitters usam explode() (burst único) em vez de emissão contínua, para melhor performance."),
      ...space(1),

      h2("Efeitos de Câmara"),
      bullet("camera.shake() — ao ser atingido por poluição ou detritos"),
      bullet("camera.flash() — ao purificar nuvem (verde) ou ao game over (vermelho)"),
      bullet("Overlay de cor dinâmico — tint cinzento sobre o cenário proporcional à poluição"),
      ...space(1),
      divider(),

      // ══════════════════════════════════════════
      // 8. I18N
      // ══════════════════════════════════════════
      h1("8. Sistema de Internacionalização (i18n)"),
      p("O jogo suporta Português (PT, padrão) e Inglês (EN). A língua é selecionada no menu principal via botões PT / EN."),
      p("Toda a UI textual usa a função t(key) para obter a string traduzida: títulos, botões, HUD, notificações, controlos, créditos. Não existem strings hardcoded em nenhuma cena."),
      p("Ao mudar o idioma, o MenuScene reinicia-se (this.scene.restart()) redesenhando todos os textos. O idioma ativo é guardado na variável currentLang do módulo i18n.js e persiste entre restarts da mesma sessão."),
      ...space(1),
      divider(),

      // ══════════════════════════════════════════
      // 9. COMO EXECUTAR
      // ══════════════════════════════════════════
      h1("9. Como Executar o Projeto"),
      p("O jogo usa módulos ES6 nativos (import/export), pelo que precisa de um servidor HTTP local — não funciona via file://."),
      ...space(1),
      h3("Opção 1 — npx serve (recomendado)"),
      code("npx serve . -p 8080"),
      p("Abrir http://localhost:8080 no browser."),
      ...space(1),
      h3("Opção 2 — npm start"),
      code("npm start"),
      ...space(1),
      h3("Opção 3 — Live Server (VS Code)"),
      p("Instalar a extensão Live Server, clicar com botão direito em index.html → Open with Live Server."),
      ...space(1),
      h3("Opção 4 — Python"),
      code("python -m http.server 8080"),
      ...space(1),
      divider(),

      // ══════════════════════════════════════════
      // 10. CONCEITOS PHASER 3
      // ══════════════════════════════════════════
      h1("10. Conceitos Phaser 3 Aplicados"),
      new Table({
        width: { size: 9020, type: WidthType.DXA },
        columnWidths: [3200, 5820],
        rows: [
          new TableRow({ children: [headerCell("Conceito", 3200), headerCell("Onde é Usado", 5820)] }),
          ...[
            ["Cenas (preload, create, update)", "7 cenas com ciclo de vida completo"],
            ["Sprites e imagens",               "this.add.image, this.physics.add.image em todas as cenas"],
            ["Animações (anims)",               "4 frames de caminhada do robô (GameScene)"],
            ["Física Arcade — grupos",          "StaticGroup (árvores, purificadores), Group (nuvens, detritos)"],
            ["setVelocity",                     "Nuvens e detritos ao spawnar; jogador no update"],
            ["setAngularVelocity",              "Rotação dos detritos espaciais"],
            ["physics.add.overlap",             "4 pares de colisão (ver secção 4)"],
            ["Input — teclado",                 "createCursorKeys, addKeys (WASD), addKey (E,Q,R,P,M)"],
            ["Estado de jogo",                  "score, planetHealth, pollution, resources, waveIndex"],
            ["Game Over / Vitória",             "Transição de cenas com dados (score)"],
            ["Sistema de Partículas",           "3 emitters: fumo, sparkles, folhas"],
            ["Tweens",                          "Botões, títulos, purificadores, robôs decorativos"],
            ["generateTexture",                 "Todos os sprites gerados no PreloadScene"],
            ["Câmara (shake, flash)",           "Impactos e eventos de fim de jogo"],
            ["Timers (time.addEvent)",          "Vagas, recursos, absorção de árvores, purificadores"],
            ["Registry",                        "Partilha do AudioManager entre cenas"],
          ].map(([k, v]) => new TableRow({ children: [cell(k, 3200, LGREY, true), cell(v, 5820)] }))
        ]
      }),
      ...space(2),

      // Rodapé
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 400, after: 0 },
        border: { top: { style: BorderStyle.SINGLE, size: 4, color: "BDBDBD", space: 1 } },
        children: [new TextRun({
          text: "Eco-Tycoon: Planet Rescue — Tecnologias Multimédia 2025/2026 — Phaser 3.80.1",
          size: 18, color: GREY, font: "Arial", italics: true
        })]
      }),
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('/mnt/user-data/outputs/eco-tycoon-documentacao.docx', buffer);
  console.log('Done!');
});