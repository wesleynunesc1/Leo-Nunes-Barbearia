# Christmas Express 3.0

Faixa natalina animada em SVG para a Leo Nunes Barbearia. É uma **atualização da 2.0**: os mesmos componentes React/SVG, os mesmos quatro barbeiros, a mesma rena, o mesmo Papai Noel, trenó e presente verde com laço dourado — agora em um cenário nevado, com um duende, o espirro da rena, o quase tropeço do barbeiro 03 e uma coreografia de 24 s.

- **Sem dependências** além do React (16.8+). SVG inline + CSS + Web Animations API. Nada de vídeo, GIF, canvas ou biblioteca de animação.
- **~37 KB gzip** de código-fonte (JSX + JS + CSS, sem minificar).
- **Transparente** fora do que está desenhado; as bordas da faixa se dissolvem (não aparece retângulo sobre o site).
- `pointer-events: none` e `aria-hidden`: não bloqueia cliques, rolagem nem leitores de tela.
- Pausa sozinha fora da viewport e com a aba em segundo plano. Respeita `prefers-reduced-motion`.
- Nenhuma atualização de estado React por frame: o React monta o SVG uma vez; quem anima é o navegador.

## A cena (história-base de 24 s)

| Tempo     | O que acontece                                                                                   |
| --------- | ------------------------------------------------------------------------------------------------ |
| 0–4 s     | A rena entra correndo pela direita, puxando o trenó do Papai Noel.                               |
| 4–7 s     | Os quatro barbeiros aparecem correndo atrás (ordem: 03 · 02 · 01 · 04).                          |
| 7–9 s     | O duende aparece por último, tentando alcançar o grupo.                                          |
| 9–11 s    | A rena encolhe a cabeça, fecha os olhos e espirra uma nuvenzinha com poucos flocos — sem parar de galopar. O Noel leva um susto. |
| 11–14 s   | O 03 pisa torto: o pé desliza, o corpo vai para trás, os braços giram, cara de susto, neve espalhada. Recupera e segue. **Não cai.** O 02 e o 01 freiam de leve e se assustam junto. |
| 14–17 s   | O Noel olha para trás e pega a caixa verde da pilha.                                             |
| 17–20 s   | Lança o presente, que passa por cima do 03, do 02 e do 01.                                       |
| 20–22 s   | O 04 acelera, dá um pulinho e pega a caixa no ar.                                                |
| 22–24 s   | Todos seguem correndo; os outros olham para trás, o Noel acena.                                  |
| +4 s      | Saída acelerada até o último personagem sumir.                                                   |
| +5 s      | Pausa com a faixa vazia (cenário e neve continuam), e recomeça.                                  |

Ciclo completo padrão: 24 + 4 + 5 = **33 s**.

### Como a travessia é sincronizada com a tela

O conjunto inteiro mede 4,5 × a altura da faixa (≈ 675 px no desktop, ≈ 380 px no celular). A posição ao longo do tempo é **planejada a partir da largura real do contêiner** (`planTravel` em `story.js`), de modo que cada acontecimento ocorra com o seu personagem dentro da área visível:

- **Telas largas** (contêiner ≥ 1,8 × o conjunto): as entradas seguem os tempos do roteiro (trenó até 4 s, barbeiros até 7 s, duende até 9 s) e a fila inteira ainda está visível no aceno final.
- **Telas estreitas / celular**: o conjunto é quase da largura da tela, então a faixa funciona como uma câmera que acompanha a ação — rena no espirro, 03 no tropeço, trenó no lançamento, 04 na captura. Os tempos das ações são os mesmos; o que muda é a entrada: os barbeiros e o duende aparecem mais tarde (o duende por volta dos 16 s em 390 px).
- A velocidade é ajustada sozinha (nunca corta uma ação) e o conjunto nunca anda para trás. Ao redimensionar a janela, o plano é refeito sem reiniciar a cena.

## Arquivos

```
christmas-express/
├─ index.js                     exportações
├─ index.d.ts                   tipos (para projetos TypeScript)
├─ ChristmasExpress.jsx         componente: travessia, rastro, pausa, reduced motion
├─ ChristmasExpress.css         estilos e keyframes (prefixo .cx-)
├─ story.js                     linha do tempo (T), coreografia e plano da travessia
├─ geometry.js                  viewBox, linha do chão, posição de cada um na fila     [novo]
├─ scene/
│  └─ Scenery.jsx               chão nevado, pinheiros, pontos de luz, neve caindo      [novo]
├─ characters/
│  ├─ Reindeer.jsx              rena (+ espirro, sombra, neve dos cascos)
│  ├─ SantaSleigh.jsx           trenó, Papai Noel e presentes (+ balanço, reações)
│  ├─ Elf.jsx                   duende natalino                                         [novo]
│  ├─ SnowFx.jsx                sombras, neve dos pés, vento, nuvem do espirro, susto   [novo]
│  ├─ Sparkles.jsx              partículas douradas
│  ├─ Gift.jsx                  caixa verde com laço dourado
│  ├─ GiftFlight.jsx            trajetória do presente em voo
│  ├─ shared.jsx                paleta e utilitário de pivô
│  └─ barbers/
│     ├─ Barber01.jsx … Barber04.jsx   um componente por barbeiro
│     ├─ Barber.jsx             corpo articulado (vista lateral)
│     ├─ BarberHead.jsx         rostos, cabelos, barbas e óculos
│     ├─ BarberFront.jsx        vista frontal (só para a prancha; não entra na animação)
│     └─ config.js              proporções, cores, poses e ciclos de corrida
├─ preview.html                 prévia executável (abra direto no navegador)
└─ preview-src/                 fonte da prévia (não precisa ir para o site)
```

## Integração

1. Copie a pasta `christmas-express/` para o projeto, por exemplo `src/components/christmas-express/` (`preview.html` e `preview-src/` não precisam ir junto). Se a 2.0 já estiver lá, substitua a pasta inteira.

2. Envolva a faixa de cards em um contêiner com `position: relative` e renderize o componente dentro dele:

```jsx
import ChristmasExpress from './components/christmas-express';

function FaixaNatal() {
  return (
    <div style={{ position: 'relative', marginTop: 'clamp(84px, 11vw, 150px)' }}>
      <ChristmasExpress />
      <CardsStrip /> {/* a faixa de cards existente */}
    </div>
  );
}
```

O cenário ocupa **a largura desse contêiner**. Para a faixa ir de ponta a ponta, o contêiner relativo deve ter a largura total da página (os cards podem continuar em um contêiner interno com `max-width`).

3. Por padrão a faixa fica **inteira acima** da borda superior dos cards (`--cx-offset-y: -100%`), sem cobrir nenhum texto. Reserve o respiro acima com `margin-top`/`padding-top` igual a `--cx-height`, como no exemplo. O componente tem `overflow: hidden`, então não gera rolagem horizontal.

### Mudanças em relação à 2.0 (para quem já integrou)

| Item              | 2.0                         | 3.0                                             |
| ----------------- | --------------------------- | ----------------------------------------------- |
| `duration`        | 15 (travessia)              | 24 (história) + `exit` 4 + `pause` 5            |
| `--cx-height`     | `clamp(64px, 13vw, 136px)`  | `clamp(84px, 11vw, 150px)`                      |
| `--cx-offset-y`   | `-88%`                      | `-100%`                                         |
| viewBox das peças | `0 0 915 200`               | `0 -4 1000 222` (`VIEW_BOX` em `geometry.js`)   |
| `halo`            | recomendado em fundo escuro | opcional: o brilho do cenário já dá contraste   |
| Novas props       | —                           | `exit`, `backdrop`, `snowfall`                  |

### Props

| Prop            | Padrão     | Descrição                                                                                 |
| --------------- | ---------- | ----------------------------------------------------------------------------------------- |
| `duration`      | `24`       | Segundos da história. Toda a coreografia é esticada/encolhida na mesma proporção.          |
| `exit`          | `4`        | Segundos da saída acelerada depois da história.                                            |
| `pause`         | `5`        | Segundos de pausa, com tudo fora da tela, antes de recomeçar.                              |
| `backdrop`      | `'soft'`   | Brilho noturno azulado atrás da cena, dissolvido nas bordas. `'none'` deixa só os desenhos. |
| `snowfall`      | `true`     | Neve caindo de leve.                                                                       |
| `halo`          | `false`    | Contorno claro em volta dos personagens (`drop-shadow`; custa GPU — evite no iPhone).      |
| `reducedMotion` | `'static'` | Com `prefers-reduced-motion`: `'static'` (cena parada, centralizada) ou `'hide'`.          |
| `className`     | —          | Classe extra no elemento raiz.                                                             |
| `style`         | —          | Estilos/variáveis CSS no elemento raiz.                                                    |

### Variáveis CSS

| Variável        | Padrão                     | Descrição                                                                 |
| --------------- | -------------------------- | ------------------------------------------------------------------------- |
| `--cx-height`   | `clamp(84px, 11vw, 150px)` | Altura da faixa: ~84 px no celular, 150 px no desktop (≥ 1364 px).        |
| `--cx-offset-y` | `-100%`                    | `-100%` = faixa inteira acima dos cards; `0%` = alinhada ao topo deles.   |
| `--cx-z`        | `5`                        | `z-index` do overlay.                                                     |
| `--cx-stride`   | `0.56s`                    | Duração de uma passada da rena.                                           |

### Observações por stack

- **Vite / CRA**: funciona como está (o componente importa o próprio CSS).
- **Next.js (App Router)**: adicione `'use client';` na primeira linha de `ChristmasExpress.jsx`. No Pages Router, remova o `import './ChristmasExpress.css'` e importe o CSS em `_app`.
- **TypeScript**: os tipos estão em `index.d.ts`; é preciso `allowJs: true` no `tsconfig`, ou renomeie os `.jsx`/`.js` para `.tsx`/`.ts`.
- **Só no período de Natal**: `{isNatal && <ChristmasExpress />}`.

## Como funciona

- **Duas camadas**: o cenário (`Scenery`) é fixo; a pista (`.cx-track`) carrega um único SVG com todos os personagens e passa por dentro dele. As árvores não acompanham ninguém e ficam sempre atrás dos personagens.
- **Um relógio só**: a travessia e cada peça da coreografia são animações WAAPI infinitas com a mesma duração (história + saída + pausa). Por isso tudo fica sincronizado, pausa junto e recomeça fora da tela.
- **Corrida**: rena, trenó, Noel, duende e os barbeiros 01 e 02 usam keyframes CSS (herdados da 2.0). Os barbeiros 03 e 04 têm o mesmo ciclo gerado em `story.js`, para que o tropeço e a captura entrem e saiam do compasso da corrida sem tranco.
- **Chão**: cada personagem tem a sua sombra e a sua neve levantada dentro do próprio grupo (acompanham cada passo). As marcas de passos e dos patins do trenó ficam em um rastro que recebe o movimento inverso da pista — as marcas ficam paradas no chão e somem aos poucos atrás do grupo.
- **Um presente só**: a caixa verde existe em quatro lugares (pilha do trenó, mão do Noel, voo, braços do 04), mas só um fica visível por vez; as trocas acontecem no mesmo ponto e no mesmo instante. O presentinho do duende é outro (vermelho com fita creme), para não confundir.
- **Duende**: pernas, braços, cabeça, gorro, ponta do gorro, guizo e orelha têm ciclos independentes, com atraso entre si (movimento secundário). A linha do tempo só o faz ficar para trás e correr para alcançar.
- **Pausa**: `IntersectionObserver` + `visibilitychange` pausam as animações WAAPI e alternam `data-playing`, que pausa os keyframes CSS. Ao desmontar, animações, observers e listeners são removidos.
- **Movimento reduzido**: nenhuma animação é criada; o conjunto aparece parado e centralizado no cenário (ou nada é renderizado com `reducedMotion="hide"`).
- **Celular**: menos flocos, estrelas e árvores; sem filtros; só `transform` e `opacity` são animados.

## Personalização

- **Tempos da cena**: objeto `T` em `story.js` (segundos-base).
- **Posição de cada um na fila**: `LANE` em `geometry.js`. Se mexer, confira `SPAN` (o trecho da fila que precisa estar na tela em cada acontecimento).
- **Aparência dos barbeiros**: `characters/barbers/config.js` e `BarberHead.jsx`. Ciclos de corrida do 03 e do 04: `RUN_CYCLE` em `config.js`; do 01 e 02: blocos `.cx-barber--b01/--b02` no CSS.
- **Cenário**: `scene/Scenery.jsx` (árvores, estrelas, flocos, relevo do chão) e a seção de cenário do CSS.
- **Ponto de captura**: `CATCH` em `story.js` é onde a caixa segurada pelo 04 está no instante da captura (unidades do viewBox). Se mudar a pose de captura, a posição ou a altura do 04, meça de novo com o botão **Medir captura** da prévia e atualize o valor — senão a caixa "pula" na troca.
- **Cores gerais**: objeto `P` em `characters/shared.jsx`.

## Prévia

Abra `preview.html` no navegador (arquivo único, funciona offline). Ela simula a seção escura com os cards e traz: play/pause, reiniciar, barra de tempo, atalhos para cada momento, larguras de teste (desktop, tablet, celular), duração e os interruptores de `backdrop`, `snowfall` e `halo`.

Para regerar a prévia depois de editar o componente: na pasta que contém `christmas-express/`, com `react`, `react-dom` e `esbuild` instalados, rode `node christmas-express/preview-src/build.mjs`.

## Limitações conhecidas

- **Ritmo**: com 24 s de história, o conjunto cruza a tela mais devagar do que na 2.0 (15 s), mas as passadas têm o mesmo ritmo. A neve levantada, os riscos de vento e as marcas no chão ajudam a vender a velocidade; se quiser uma corrida mais "colada" ao chão, use `duration={18}` — as ações ficam mais rápidas na mesma proporção.
- **Celular**: nem todos cabem na tela ao mesmo tempo durante a entrada (ver "Como a travessia é sincronizada").
- **Cenário**: foi desenhado a partir da descrição do briefing (faixa nevada, pinheiros nas pontas, noite com pontos de luz). Para aproximar de uma imagem de referência específica, ajuste `Scenery.jsx` e as cores no topo do arquivo.

## Compatibilidade

Chrome/Edge 84+, Firefox 75+, Safari 13.1+ (Web Animations API e `ResizeObserver`). Em navegadores sem `element.animate`, só o cenário aparece (os personagens ficam fora da faixa).
