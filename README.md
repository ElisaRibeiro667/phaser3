# 🌍 Eco-Tycoon: Planet Rescue

> Trabalho Prático 2 — Phaser 3 | Tecnologias Multimédia 2025/2026

---

## 👥 Elementos do Grupo

| Nome          | Número |
|---------------|--------|
| Elisa Ribeiro | 33208  |


---

## 🎮 Descrição do Jogo

**Género:** Estratégia / Gestão / Tower-Defense Invertido

**Objetivo:** Controlas um robô num planeta devastado pela poluição. O teu objetivo é plantar árvores e construir purificadores de ar para limpar o planeta antes que a saúde planetária chegue a zero.

**Regras:**
- Nuvens de poluição e detritos espaciais caem do topo do ecrã em vagas progressivas
- Colisões com estes elementos aumentam a poluição e reduzem a saúde do planeta
- Árvores absorvem poluição passivamente (quanto mais crescidas, mais eficazes)
- Purificadores destroem automaticamente nuvens que os toquem
- Ganhas se reduzires a poluição a 0% após sobreviver às 5 vagas
- Perdes se a saúde do planeta chegar a 0

**Funcionalidades implementadas:**
- 5 vagas com dificuldade progressiva (mais nuvens, mais rápidas)
- 3 tipos de nuvens de poluição (pequena, média, grande)
- Árvores com 3 estágios de crescimento
- Sistema de recursos que se regenera com o tempo
- Detritos espaciais com drops de recursos
- Efeito visual de tint na câmara que muda conforme a poluição
- Sistema de partículas para fumo, purificação e folhas
- Pausa, reinício e retorno ao menu a qualquer momento

---

## ⌨️ Jogabilidade / Controlos

| Tecla | Ação |
|-------|------|
| `W` / `↑` | Mover para cima |
| `S` / `↓` | Mover para baixo |
| `A` / `←` | Mover para a esquerda |
| `D` / `→` | Mover para a direita |
| `E` | Plantar árvore (custa 2 recursos) |
| `Q` | Construir purificador (custa 5 recursos) |
| `P` | Pausar / Retomar |
| `R` | Reiniciar jogo |
| `M` | Voltar ao menu principal |

---

## 🚀 Como Executar

### Opção 1 — npx serve (recomendado, sem instalação)
```bash
npx serve . -p 8080
```
Abre `http://localhost:8080` no browser.


## 🌐 Suporte Multilíngue

O jogo suporta **2 línguas**:
- 🇵🇹 **Português** (PT) — idioma padrão
- 🇬🇧 **Inglês** (EN)

O seletor de idioma está acessível no **menu principal** (canto inferior). Toda a UI textual é traduzida dinamicamente. As traduções estão em ficheiros JSON separados em `src/i18n/`.

Estrutura:
```
src/i18n/
├── i18n.js   ← gestor de traduções (setLang, t)
├── pt.json   ← strings em português
└── en.json   ← strings em inglês
```

---

## 🎨 Aspectos Multimédia

### Arte / Sprites
| Asset | Formato | Tamanho | Criação |
|-------|---------|---------|---------|
| Robô (jogador) | Gerado via `Phaser.GameObjects.Graphics` | ~40×40 px | Procedural |
| Nuvens de poluição (3 tamanhos) | Gerado via Graphics API | 40–64 px | Procedural |
| Árvores (3 estágios) | Gerado via Graphics API | 30–44 px | Procedural |
| Purificador | Gerado via Graphics API | 40×36 px | Procedural |
| Detritos espaciais (4 variantes) | Gerado via Graphics API | 28×28 px | Procedural |
| Partículas (fumo, folhas, brilhos) | Gerado via Graphics API | 8–12 px | Procedural |

**Todos os sprites são gerados proceduralmente** em tempo real via `Phaser.GameObjects.Graphics.generateTexture()`. Não existem ficheiros de imagem externos, o que elimina quaisquer problemas de carregamento ou tamanho de assets.

### Som
| Som | Evento | Geração |
|-----|--------|---------|
| Plantar árvore | Ao pressionar `E` | Web Audio API — oscilador ascendente |
| Construir purificador | Ao pressionar `Q` | Web Audio API — ruído + sawtooth |
| Colisão com poluição | Ao ser atingido | Web Audio API — thud grave |
| Purificação | Purificador destrói nuvem | Web Audio API — sparkle agudo |
| Recolher recurso | Apanhar pickup | Web Audio API — bip duplo |
| Detritos | Impacto com detritos | Web Audio API — ruído + sawtooth |
| Game Over | Fim (derrota) | Web Audio API — melodia descendente |
| Vitória | Fim (vitória) | Web Audio API — fanfarra ascendente |
| Clique botão | UI | Web Audio API — bip curto |
| Ambiente | Durante o jogo | Web Audio API — hum suave em loop |

**Todos os sons são gerados proceduralmente** via `Web Audio API` (sem ficheiros de áudio externos). O `AudioManager` (`src/AudioManager.js`) centraliza toda a lógica sonora.

**Formatos utilizados:** Web Audio API (síntese em tempo real) — sem OGG/MP3/WAV.

### Justificação das Escolhas
- A geração procedural de arte e som elimina dependências externas e garante tamanho de projeto mínimo (~0 MB de assets).
- Os sprites são proporcionais ao uso real (40px para sprites 40px, nunca sobredimensionados).
- O sistema de partículas do Phaser 3 é usado extensivamente para feedback visual (fumo, folhas, sparkles).
- O tint da câmara muda dinamicamente com o nível de poluição, criando feedback visual imersivo.

---

## 🏗️ Estrutura do Projeto

```
eco-tycoon/
├── index.html              ← entry point (carrega Phaser via CDN)
├── package.json
├── .gitignore
├── README.md
└── src/
    ├── main.js             ← config Phaser, registo de cenas
    ├── AudioManager.js     ← sons procedurais via Web Audio API
    ├── i18n/
    │   ├── i18n.js         ← gestor de traduções
    │   ├── pt.json         ← strings PT
    │   └── en.json         ← strings EN
    └── scenes/
        ├── BootScene.js    ← arranque
        ├── PreloadScene.js ← geração de texturas procedurais
        ├── MenuScene.js    ← menu principal com seletor de idioma
        ├── GameScene.js    ← lógica principal do jogo
        ├── GameOverScene.js← ecrã de derrota
        ├── VictoryScene.js ← ecrã de vitória
        └── CreditsScene.js ← créditos
```

---

## ⚙️ Versão do Phaser

**Phaser 3.80.1** — incluído via **CDN**:
```html
<script src="https://cdn.jsdelivr.net/npm/phaser@3.80.1/dist/phaser.min.js"></script>
```

---

## 📋 Conceitos de Phaser 3 Aplicados

| Conceito | Implementação |
|----------|---------------|
| Cenas (`preload`, `create`, `update`) | 7 cenas: Boot, Preload, Menu, Game, GameOver, Victory, Credits |
| Sprites e imagens | `this.add.image`, `this.physics.add.image`, animações por troca de textura |
| Física Arcade — grupos | `staticGroup` (árvores, purificadores), `group` (nuvens, detritos, recursos) |
| Física Arcade — velocidades | `setVelocity`, `setAngularVelocity` em nuvens e detritos |
| Física Arcade — colisões | `physics.add.overlap` para player/cloud, player/debris, purifier/cloud, player/resource |
| Input (teclado) | `createCursorKeys`, `addKeys` (WASD), `addKey` (E, Q, R, P, M) |
| Estado de jogo | Score, saúde do planeta, poluição, recursos, contagem de vagas |
| Game Over / Vitória | Com transição de cena e reinício por tecla R |
| Partículas | `this.add.particles` com emitters para fumo, sparkles e folhas |
| Tweens | Movimento do robô no menu, crescimento de elementos UI, fade in/out |
| `generateTexture` | Todos os sprites gerados via Graphics API |
| Câmara | `flash`, `shake`, overlay de tint dinâmico |

---

