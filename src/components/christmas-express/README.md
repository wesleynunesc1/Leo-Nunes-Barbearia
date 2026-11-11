# Christmas Express 2.0

Animação 2D em SVG para a faixa natalina da Leo Nunes Barbearia. A rena puxa o trenó do Papai Noel, os quatro barbeiros correm atrás e, no meio da travessia, o Noel lança um presente que o barbeiro 04 pega no ar.

- **Sem dependências** além do React (16.8+). SVG inline + CSS + Web Animations API.
- **~21 KB gzip** de código-fonte (JSX + JS + CSS, sem minificar). Fundo transparente.
- Travessia de 15 s, pausa de 5 s, loop contínuo.
- `pointer-events: none`: não bloqueia cliques, rolagem nem navegação.
- Pausa sozinha fora da viewport e com a aba em segundo plano.
- Respeita `prefers-reduced-motion` (cena estática ou oculta).

## A cena (travessia-base de 15 s)

| Tempo    | O que acontece                                                                 |
| -------- | ------------------------------------------------------------------------------ |
| 0–4 s    | A rena puxa o trenó; os barbeiros correm atrás (ordem: 03 · 02 · 01 · 04).      |
| 4–6 s    | O Papai Noel olha para trás e pega a caixa verde com laço dourado.              |
| 6–9 s    | Lança o presente, que passa por cima do 03, do 02 e do 01.                      |
| 9–11 s   | O 04 acelera, estende os braços e pega a caixa no ar (surpresa, depois sorriso). |
| 11–15 s  | O 04 corre com o presente; os outros três olham para trás, surpresos; o Noel acena. |

## Arquivos

```
christmas-express/
├─ index.js                     exportações
├─ index.d.ts                   tipos (para projetos TypeScript)
├─ ChristmasExpress.jsx         componente: travessia, pausa, reduced motion
├─ ChristmasExpress.css         estilos e keyframes (prefixo .cx-)
├─ story.js                     linha do tempo da cena do presente
├─ characters/
│  ├─ Reindeer.jsx              rena
│  ├─ SantaSleigh.jsx           trenó, Papai Noel e presentes
│  ├─ Sparkles.jsx              partículas douradas
│  ├─ Gift.jsx                  caixa verde com laço dourado
│  ├─ GiftFlight.jsx            trajetória do presente em voo
│  ├─ shared.jsx                paleta e utilitário de pivô
│  └─ barbers/
│     ├─ Barber01.jsx … Barber04.jsx   um componente por barbeiro
│     ├─ Barber.jsx             corpo articulado (vista lateral)
│     ├─ BarberHead.jsx         rostos, cabelos, barbas e óculos
│     ├─ BarberFront.jsx        vista frontal (só para a prancha; não entra na animação)
│     └─ config.js              proporções, cores e poses de cada um
└─ preview.html                 prévia executável (abra direto no navegador)
```

## Integração

1. Copie a pasta `christmas-express/` para o projeto, por exemplo `src/components/christmas-express/` (`preview.html` não precisa ir junto). Nenhum arquivo existente do site precisa ser alterado além do ponto onde a faixa é renderizada.

2. Envolva a faixa de cards em um contêiner com `position: relative` e renderize o componente dentro dele:

```jsx
import ChristmasExpress from './components/christmas-express';

function FaixaNatal() {
  return (
    <div style={{ position: 'relative' }}>
      <ChristmasExpress halo />
      <CardsStrip /> {/* a faixa de cards existente */}
    </div>
  );
}
```

O conjunto atravessa **a largura desse contêiner**. Para cruzar a tela de ponta a ponta, o contêiner relativo deve ter a largura total da página (os cards podem continuar em um contêiner interno com `max-width`).

3. Por padrão a animação fica logo acima da borda superior da faixa. Reserve um respiro acima (`margin-top` ≈ altura da animação) ou ajuste a posição com `--cx-offset-y`.

### Props

| Prop            | Padrão     | Descrição                                                                 |
| --------------- | ---------- | ------------------------------------------------------------------------- |
| `duration`      | `15`       | Segundos de cada travessia. A cena do presente é esticada na mesma proporção. |
| `pause`         | `5`        | Segundos de pausa antes de recomeçar.                                     |
| `halo`          | `false`    | Contorno claro em volta dos personagens. Use em fundo escuro: a roupa dos barbeiros é preta. |
| `reducedMotion` | `'static'` | Com `prefers-reduced-motion`: `'static'` (cena parada) ou `'hide'`.       |
| `className`     | —          | Classe extra no elemento raiz.                                            |
| `style`         | —          | Estilos/variáveis CSS no elemento raiz.                                   |

### Variáveis CSS

| Variável        | Padrão                     | Descrição                                               |
| --------------- | -------------------------- | ------------------------------------------------------- |
| `--cx-height`   | `clamp(64px, 13vw, 136px)` | Altura do conjunto (a largura é 4,575 × a altura).      |
| `--cx-offset-y` | `-88%`                     | Posição vertical: `0%` = dentro da faixa, alinhado ao topo; `-100%` = totalmente acima. |
| `--cx-z`        | `5`                        | `z-index` do overlay.                                   |
| `--cx-stride`   | `0.56s`                    | Duração de uma passada da rena.                         |

### Observações por stack

- **Vite / CRA**: funciona como está (o componente importa o próprio CSS).
- **Next.js (App Router)**: adicione `'use client';` na primeira linha de `ChristmasExpress.jsx`. No Pages Router, remova o `import './ChristmasExpress.css'` e importe o CSS em `_app`.
- **TypeScript**: os tipos estão em `index.d.ts`; é preciso `allowJs: true` no `tsconfig`, ou renomeie os `.jsx`/`.js` para `.tsx`/`.ts`.
- **Só no período de Natal**: `{isNatal && <ChristmasExpress />}`.

## Como funciona

- **Travessia**: um único `element.animate()` infinito move a pista de `translate3d(0)` a `translate3d(-100%)`, com o trecho final do ciclo parado fora da tela (a pausa). Nada é medido em JS.
- **Corrida**: keyframes CSS dentro do SVG. Os quatro barbeiros compartilham o mesmo ciclo, parametrizado por variáveis (`--cx-bs`, `--cx-th-a`, `--cx-ar-a`…): o 02 tem braços mais fortes, o 03 é mais solto e tem a mecha da nuca balançando, o 04 tem passadas curtas e rápidas.
- **Cena do presente** (`story.js`): cada peça recebe uma animação WAAPI infinita com a mesma duração da travessia, então tudo fica sincronizado e pausa junto. Os tempos estão em segundos no topo do arquivo.
- **Um presente só**: a caixa existe em quatro lugares (pilha do trenó, mão do Noel, voo, braços do 04), mas só um fica visível por vez; as trocas acontecem no mesmo ponto e no mesmo instante.
- **Peças presas ao personagem**: óculos, cabelo e barba estão dentro do grupo da cabeça; as tatuagens do 03 e a caixa do 04 estão dentro dos grupos dos braços. Nada desliza.
- **Pausa**: `IntersectionObserver` + `visibilitychange` pausam as animações WAAPI e alternam `data-playing`, que pausa os keyframes CSS.
- **Movimento reduzido**: nenhuma animação é criada; a cena aparece parada à direita (ou não é renderizada com `reducedMotion="hide"`).

## Personalização

- **Aparência dos barbeiros**: `characters/barbers/config.js` (tom de pele, proporções do rosto, altura, barba) e `BarberHead.jsx` (cabelos e óculos).
- **Ritmo de cada corrida**: blocos `.cx-barber--b01` … `--b04` no CSS.
- **Tempos da cena**: objeto `T` em `story.js`.
- **Ajustar a trajetória**: `CATCH` em `story.js` é o ponto (em unidades do viewBox) onde a caixa segurada pelo 04 está no instante da captura. Se mudar a pose de captura, a posição do 04 ou a altura dele, esse ponto precisa ser medido de novo, senão a caixa "pula" na troca.
- **Cores gerais**: objeto `P` em `characters/shared.jsx`.

## Compatibilidade

Chrome/Edge 84+, Firefox 75+, Safari 13.1+ (Web Animations API). Em navegadores sem `element.animate`, a animação não aparece. O `halo` usa `filter: drop-shadow` no SVG inteiro e custa um pouco mais de GPU; deixe desligado em fundo claro.
