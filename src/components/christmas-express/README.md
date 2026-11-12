# Christmas Express 3.1

Faixa natalina animada em SVG para a Leo Nunes Barbearia. É uma **atualização da 3.0**: mesmos personagens, mesmo cenário, mesma estrutura React/SVG/CSS e a mesma lógica de animação — agora com seis microcenas novas e uma linha do tempo de 32 s.

- **Sem dependências** além do React (16.8+). SVG inline + CSS + Web Animations API. Nada de vídeo, GIF, canvas ou biblioteca de animação.
- **~47 KB gzip** de código-fonte (JSX + JS + CSS, sem minificar).
- **Cenário fixo**: chão, pinheiros, fundo e neve ambiente não se movem com a corrida. Só os personagens e os efeitos ligados a eles andam.
- **Transparente** fora do que está desenhado; as bordas da faixa se dissolvem.
- `pointer-events: none` e `aria-hidden`. Pausa fora da viewport e com a aba oculta. Respeita `prefers-reduced-motion`.
- Nenhuma atualização de estado React por frame.

## O que mudou da 3.0 para a 3.1

| Cena | O que acontece |
| ---- | -------------- |
| **A · Óculos do 01** | Os óculos escorregam pelo nariz, ele arregala os olhos, empurra de volta com a mão e segue correndo. Os óculos nunca caem. |
| **B · Cabelo do 03** | Uma rajada joga a mecha para trás e arrepia os fios; ele leva a mão à cabeça e alisa duas vezes. O penteado comprido continua por baixo e o balanço normal volta depois. |
| **C · Espirro no 02** | A neve do espirro da rena voa para trás, passa por cima do trenó e acerta o rosto do 02: ele fecha os olhos, leva o tranco, sacode a cabeça e a neve cai em menos de 1 s. |
| **D · Carona** | O duende acelera, ergue o braço com o presentinho, acena aos pulinhos olhando para o 04 (que olha para trás) e só então pula nas costas dele. O 04 se desequilibra, gira os braços e se recupera. |
| **E · Incentivo** | O 04 para, mãos nos joelhos, ofegante (bafinhos). O duende desce, dá tapinhas, aponta "vamos!" com dois pulinhos; o 04 se endireita e os dois voltam a correr. |
| **F · Queda final** | O 04 cai de frente na neve (salvando a caixa no alto). O duende dá um pulo de susto. O 03 freia levantando neve, vira, volta pela pista da frente, agacha, puxa o 04 pela mão e o levanta. O grupo retoma a corrida. |

Mantido da 3.0: espirro da rena, quase tropeço do 03, lançamento e captura do presente (um presente só), aceno do Noel, sombras, pegadas, neve dos pés.

Para quem já integrou a 3.0: a API é a mesma. Só mudam os padrões de tempo — `duration` passa de 24 para **32** — e a pasta deve ser substituída inteira.

## Linha do tempo (história-base de 32 s)

| Tempo        | O que acontece                                                                 |
| ------------ | ------------------------------------------------------------------------------ |
| 0–4 s        | A rena entra pela direita puxando o trenó.                                     |
| 4–7 s        | Entram os quatro barbeiros (03 · 02 · 01 · 04) e, logo atrás, o duende.        |
| 7,2–9 s      | **A** — óculos do 01.                                                          |
| 9,2–11 s     | **B** — vento no cabelo do 03.                                                 |
| 11–13,5 s    | **C** — a rena espirra (11,8 s); a neve acerta o 02 (12,55 s); ele sacode a cabeça. |
| 13,3–15,2 s  | **D** — o duende alcança o 04 e pede carona.                                   |
| 15,2–17 s    | Salto nas costas (pousa aos 15,65 s); o 04 quase cai e se recupera.            |
| 17–18,9 s    | O 04 para, mãos nos joelhos, ofegante.                                         |
| 18,9–20,8 s  | **E** — o duende desce, incentiva; os dois voltam a correr.                    |
| 20,9–24,6 s  | O Noel olha para trás, pega a caixa, lança; o 04 pega no ar (24,6 s).          |
| 25,3–27,2 s  | Reta final: o 03 quase tropeça e se recupera (gag da 3.0).                     |
| 27,6–31 s    | **F** — queda do 04, susto do duende, freada e volta do 03, o 04 é levantado.  |
| 31–32 s      | Grupo reunido correndo; o Noel acena.                                          |
| +4 s         | Saída acelerada até o último personagem sumir.                                 |
| +5 s         | Pausa com a faixa vazia; reinício invisível.                                   |

Ciclo completo padrão: 32 + 4 + 5 = **41 s**. O roteiro sugeria 30 s; usei 32 (dentro da faixa de 28–32 pedida) para a queda final ter tempo de leitura. A ordem dos acontecimentos é a do roteiro.

Depois da queda, o 03 fica ao lado do 04 no fim da fila (ordem de saída: 02 · 01 · 03 · 04 · duende). A ordem original volta no reinício, fora da tela.

## Cenário fixo e personagens parados

O cenário (`Scenery`) é uma camada própria e nunca recebe movimento. A pista (`.cx-track`) leva os personagens por dentro dele.

Quando alguém **para** — o 04 ofegante, o 04 caído, o 03 agachado ajudando, o duende ao lado — a posição desse personagem recebe o movimento inverso da pista, quadro a quadro, e os pés ficam cravados na neve enquanto o resto do grupo segue. Para ele não ficar longe demais, o grupo anda mais devagar nesses dois trechos (17–20,8 s e 27,8–31 s). Depois quem parou corre para alcançar.

Três camadas, como pedido: (1) cenário estático, (2) personagens, (3) partículas e efeitos, que ficam dentro do grupo de cada personagem ou em grupos próprios do SVG.

## Como a travessia se adapta à tela

A posição do conjunto ao longo do tempo é planejada a partir da largura real do contêiner (`planTravel` em `story.js`), para cada acontecimento ocorrer com os seus personagens dentro da área visível.

- **Telas largas** (contêiner ≥ 1,8 × o conjunto): entradas nos tempos do roteiro e fila inteira visível até o fim da história.
- **Celular**: o conjunto tem quase a largura da tela, então a faixa funciona como uma câmera. Como o espirro precisa mostrar a rena e o 02 ao mesmo tempo, o grupo inteiro já está na tela por volta dos 7–12 s; depois a câmera acompanha a cauda da fila (carona, cansaço, queda).
- O conjunto nunca anda para trás. Ao redimensionar, o plano é refeito sem reiniciar a cena.

## Arquivos

```
christmas-express/
├─ index.js                     exportações
├─ index.d.ts                   tipos
├─ ChristmasExpress.jsx         componente: travessia, rastro, pausa, reduced motion
├─ ChristmasExpress.css         estilos e keyframes (prefixo .cx-)
├─ story.js                     linha do tempo (T), todas as microcenas e o plano da travessia   [atualizado]
├─ geometry.js                  viewBox, linha do chão, posições na fila, trechos visíveis       [atualizado]
├─ scene/
│  └─ Scenery.jsx               chão nevado, pinheiros, pontos de luz, neve caindo               [igual à 3.0]
├─ characters/
│  ├─ Reindeer.jsx              rena                                                              [igual à 3.0]
│  ├─ SantaSleigh.jsx           trenó, Papai Noel e presentes                                     [igual à 3.0]
│  ├─ Elf.jsx                   duende (+ grupos de salto e carona)                               [atualizado]
│  ├─ SnowFx.jsx                sombras, neve, vento (+ neve do espirro, rajada, bafinhos)        [atualizado]
│  ├─ Sparkles.jsx · Gift.jsx · GiftFlight.jsx · shared.jsx                                       [iguais à 3.0]
│  └─ barbers/
│     ├─ Barber01.jsx           [igual]   Barber02.jsx  (+ neve no rosto)
│     ├─ Barber03.jsx           (+ virar o corpo)   Barber04.jsx  (+ queda, bafinhos)
│     ├─ Barber.jsx             corpo articulado                                                  [igual à 3.0]
│     ├─ BarberHead.jsx         rostos e cabelos (+ fios arrepiados do 03, neve no rosto)         [atualizado]
│     ├─ BarberFront.jsx        vista frontal (prancha)                                           [igual à 3.0]
│     └─ config.js              proporções, cores, ciclos de corrida                              [atualizado]
├─ preview.html                 prévia executável (abra direto no navegador)
└─ preview-src/                 fonte da prévia (não precisa ir para o site)
```

Nenhum personagem foi redesenhado: as peças novas são grupos adicionais dentro dos componentes existentes.

## Integração

1. Copie a pasta `christmas-express/` para o projeto (por exemplo `src/components/christmas-express/`), substituindo a 3.0 se ela já estiver lá. `preview.html` e `preview-src/` não precisam ir junto.

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

O cenário ocupa a largura desse contêiner; para ir de ponta a ponta, ele deve ter a largura total da página.

3. Por padrão a faixa fica inteira acima da borda superior dos cards (`--cx-offset-y: -100%`). Reserve o respiro com `margin-top` igual a `--cx-height`, como no exemplo. O componente tem `overflow: hidden` e não gera rolagem horizontal.

### Props

| Prop            | Padrão     | Descrição                                                                                 |
| --------------- | ---------- | ----------------------------------------------------------------------------------------- |
| `duration`      | `32`       | Segundos da história. Toda a coreografia é esticada/encolhida na mesma proporção.          |
| `exit`          | `4`        | Segundos da saída acelerada depois da história.                                            |
| `pause`         | `5`        | Segundos de pausa, com tudo fora da tela, antes de recomeçar.                              |
| `backdrop`      | `'soft'`   | Brilho noturno azulado atrás da cena, dissolvido nas bordas. `'none'` deixa só os desenhos. |
| `snowfall`      | `true`     | Neve ambiente caindo de leve.                                                              |
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
- **TypeScript**: os tipos estão em `index.d.ts`; é preciso `allowJs: true`, ou renomeie os arquivos para `.tsx`/`.ts`.
- **Só no período de Natal**: `{isNatal && <ChristmasExpress />}`.

## Como funciona

- **Um relógio só**: a travessia e cada peça da coreografia são animações WAAPI infinitas com a mesma duração (história + saída + pausa). Tudo fica sincronizado, pausa junto e recomeça fora da tela.
- **Corrida**: rena, trenó, Noel e os barbeiros 01 e 02 usam os keyframes CSS da 3.0. O 03, o 04 e o duende têm o mesmo ciclo gerado em `story.js`, para que cada gag entre e saia do compasso da corrida sem tranco. Do 01, só o braço da frente passou para a linha do tempo (para ajeitar os óculos).
- **Helpers novos em `story.js`**: `script()` encadeia ciclo → gag → ciclo → gag na mesma faixa; `pulses()` faz piscadas e sobrancelhas; `makeDrift()` calcula o movimento inverso da pista para quem está parado.
- **Carona**: o duende não é duplicado. Ele fica preso às costas do 04 porque a posição dele usa os mesmos quadros do tronco do 04, girando em torno do quadril dele.
- **Um presente só**: a caixa verde existe em quatro lugares (pilha, mão do Noel, voo, braço do 04) e só um fica visível por vez. Na queda ela continua no braço do 04, erguida. O presentinho do duende é outro (vermelho).
- **Passagem do 03**: ao voltar para ajudar, ele passa pelo 02 e pelo 01 numa pista ligeiramente à frente (desenhado por cima, 5 unidades abaixo), em vez de atravessá-los.
- **Pausa**: `IntersectionObserver` + `visibilitychange` pausam as animações WAAPI e alternam `data-playing`, que pausa os keyframes CSS. Ao desmontar, animações, observers e listeners são removidos.
- **Movimento reduzido**: nenhuma animação é criada; o conjunto aparece parado e centralizado no cenário.

## Personalização

- **Tempos**: objeto `T` em `story.js` (segundos-base). Cada microcena está num bloco comentado com a letra do roteiro (A–F).
- **Posições na fila**: `LANE` em `geometry.js`; `SPAN` diz que trecho da fila precisa estar na tela em cada cena.
- **Ponto de captura**: `CATCH` em `story.js`. Se mudar a pose de captura, a posição ou a altura do 04, meça de novo com o botão **Medir captura** da prévia.
- **Queda final**: `LAG` (quanto o 04 já vinha atrás), `HANDS` (onde o 03 para) e `HAUL` (quanto o 04 avança ao ser levantado), no topo de `tracks()`.
- **Carona**: `SEAT` (onde o duende senta nas costas do 04).
- **Aparência**: `characters/barbers/config.js`, `BarberHead.jsx`, `scene/Scenery.jsx`, objeto `P` em `shared.jsx`.

## Prévia

Abra `preview.html` no navegador (arquivo único, funciona offline). Simula a seção escura com os cards e traz play/pause, reiniciar, barra de tempo, um atalho para cada cena (A–F), larguras de teste, duração e os interruptores de `backdrop`, `snowfall` e `halo`.

Para regerar depois de editar: na pasta que contém `christmas-express/`, com `react`, `react-dom` e `esbuild` instalados, rode `node christmas-express/preview-src/build.mjs`.

## Limitações conhecidas

- **Viradas de cabeça**: "olhar para trás" espelha a cabeça em 0,2 s, como na 2.0/3.0; num quadro congelado no meio da virada a cabeça aparece estreita.
- **Ritmo**: com 32 s de história o grupo cruza a tela devagar em relação às passadas (como na 3.0), e mais devagar ainda nos dois trechos em que o 04 está parado. Neve dos pés, riscos de vento e pegadas ajudam. `duration={28}` acelera tudo na mesma proporção.
- **Celular**: a largura da tela é quase a do conjunto, então o deslocamento sobre o chão é pequeno na segunda metade da história.
- **Braços curtos**: no estilo dos personagens, a mão não alcança o topo da cabeça; o 03 alisa o cabelo pela lateral/nuca e os tapinhas do duende são na altura do quadril do 04.
- **Testes**: verificado quadro a quadro em Chromium (1440, 768, 390 e 360 px). Não foi testado em iPhone/Safari nem em Android reais.

## Compatibilidade

Chrome/Edge 84+, Firefox 75+, Safari 13.1+ (Web Animations API e `ResizeObserver`). Em navegadores sem `element.animate`, só o cenário aparece.
