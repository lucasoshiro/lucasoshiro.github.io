---
title: "Tocando música na impressora 3D"
excerpt: "Como se o som dos motores já não fosse música"
author_profile: true

lang: pt_br
path-en: "/software-en/2020-07-31-music_gcode/"

---

GitHub: [https://github.com/lucasoshiro/music2gcode](https://github.com/lucasoshiro/music2gcode)

## Como assim?

Os ruídos de motores de passo são causados por suas vibrações. Quantos mais
passos um motor de passo fizer por segundo, mais alta será a frequência,
consequentemente, mais agudo será o som. Aqui descrevo como que fiz para usá-los
para tocar música.

Manipular a frequências de um motor de passo individualmente, quando se tem
acesso direto a eles é bastante simples Um exemplo: se eles estiverem conectados
a um Arduino através de um driver. Apesar de eu ter montado a minha
[impressora 3D](https://lucasoshiro.github.io/hardware/2020-06-14-impressora_3d/)
com um Arduino e drivers de motor de passo, controlar a frequência de rotação de
cada motor dela individualmente iria requerer alterações diretas no firmware, o
que foge do escopo deste projeto, que visa tocar a música __apenas__ usando um
protocolo que normalmente seria usado para impressões 3D comuns.

Para fazer isso, escrevi um programa na linguagem Haskell que recebe como
entrada uma música escrita em um formato específico, e devolve como saída
comandos no protocolo G-Code que quando executados pela impressora tocam a música
em seus motores.

Apesar de o G-Code ser um protocolo universal que vai além das impressoras 3D
(também funciona, por exemplo,  em cortadoras laser), o foco aqui são apenas as impressoras 3D
de filamento com movimentação cartesiana (acredito que sejam as mais
comuns...). Não funcionaria por exemplo, em impressoras do tipo Delta.

### Entrada

A entrada é uma música descrita em um formato que é uma versão
simplificada
[do que eu defini neste projeto](https://hardwarelivreusp.org/projetos/2019/03/02/musical_lpt/).
Do ponto de vista musical, ele é muito básico e pouco flexível em relação aos
formatos mais conhecidos, como MIDI, MusicXML, e de programas para notação
musical (Finale, Encore, Sibelius, GuitarPro, Musescore, etc), porém, ele é
muito fácil de ser escrito por humanos e ser parseado por software. Ele é
consiste no seguinte:


```
TEMPO <bpm>

BEGINCH
<nota 1 do primeiro canal>
<nota 2 do primeiro canal>
...
ENDCH

BEGINCH
<nota 1 do segundo canal>
<nota 2 do segundo canal>
ENDCH

```

Como é de se imaginar, `BEGINCH` e `ENDCH` definem o início e o fim de um
canal. Os canais são tocados simultaneamente.

Cada nota é representada como `<nota> <oitava> <duração>`, com a nota em forma
anglo-saxônica (CDEFGAB), podendo ter sustenido (`#`) e bemol (`b`), e a
duração em unidades de tempo. Dobrados sustenidos, dobrados bemóis, etc, não são
suportados. Silêncios são descritos como `- <duração>`.

A seguir demonstro como o trecho inicial do chorinho Brejeiro, de Ernesto Nazareth (se
você não conhece, [ouça aqui no Spotify](https://open.spotify.com/track/7IqgU1s9DQbSp5fndjVbQS?si=QzeWZO5sTjulrD2rNjrDcQ)),
escrito na forma de partitura, pode ser transcrito para esse formato:


<div class="img-container">
  <figure>
    <img class="large" src="{{ site.baseurl }}/assets/images/software/2020-07-31-musica_gcode/brejeiro.jpg">
    <figcaption>Transcrição de uma partitura para o formato aceito pelo programa (perdão pela minha letra horrível)</figcaption>
  </figure>
</div>



### Saída

A saída são comandos do protocolo G-Code. Mais especificamente, são gerados
comandos [G0 (Linear Move)](https://marlinfw.org/docs/gcode/G000-G001.html). Em
suma, eles seguem o seguinte formato:

```
G0 X<posição X> Y<posição Y> Z<posição Z> F<velocidade>
```

Por exemplo: `G0 X10 Y20 Z30 F200` vai mover linearmente o bico de impressão
para a posição (10mm, 20mm, 30mm) a uma velocidade de 200mm/min.


## Funcionamento

Ainda tomando como exemplo a partitura de Brejeiro, a conversão ocorre conforme
a imagem a seguir. Os números indicam as etapas da conversão:


<div class="img-container">
  <figure>
    <img class="large" src="{{ site.baseurl }}/assets/images/software/2020-07-31-musica_gcode/overview.jpg">
    <figcaption>Etapas da conversão em G-Code</figcaption>
  </figure>
</div>

Daqui pra frente explico melhor cada uma delas.

### Etapa 1: Parser

Vou pular a implementação do parser por ela ser entediante... Em suma, basta saber que
há uma função
~~~haskell
parseSong :: [String] -> Song
~~~
(ou seja, recebe uma lista de `Strings` e devolve um `Song`), em que:

~~~haskell
type Hz  = Float
type Sec = Float
type Bpm = Int

data SongAtom = Silence Sec | Note (String, Int, Sec)
type Channel  = [SongAtom]
type Song     = (Bpm, [Channel])
~~~

Traduzindo, isso significa que `Hz` e `Sec` são apenas tipos de sinômios de
`Float` e `Bpm` de `Int`. `Song` é, então, composto do andamento da música em bpm
e uma lista de canais, cada canal composto por `SongAtom`s, que podem ser
silêncios ou notas.

### Etapas 2 e 3: Tabela de frequências


#### Obtendo as frequências

Queremos construir uma tabela com eventos mostrando qual frequência será tocada
por cada eixo em cada instante de tempo tendo como base a música parseada na
etapa anterior. Peço perdão pelo uso do voculário musical aqui, mas não tenho
como fugir dele... De qualquer forma, queremos uma função
`freqEventsFromSong`, em que:

~~~haskell
type FreqEvent = (MiliSec, Hz, Hz, Hz)
freqEventsFromSong :: Song -> [FreqEvent]
~~~

Certo. Antes de tudo, precisamos saber como descobrir a frequência de cada nota
musical. Baseando-se [nesta fórmula contida neste site](https://pages.mtu.edu/~suits/NoteFreqCalcs.html), podemos fazer uma versão
um pouco diferente:

~~~haskell
c0 = 16.351597831287418
baseExp = 1.0594630943592953


freq :: SongAtom -> Hz
freq (Silence _) = 0.0
freq (Note n) = mult * c0 * baseExp ** (fromIntegral $ fromFigure figure)
  where (figure, octave, _) = n
        mult = fromIntegral $ ((2 :: Int) ^ octave)
~~~

AAAAAH QUÊ? Bom, a frequência do silêncio obviamente é 0 Hz, então, já deixamos
isso definido hardcoded. `c0` é a frequência do **Dó 0** (confere
naquele site que eu falei antes), e ela vai ser usado para o cálculo das frequências
de outras notas. O valor `mult` é o multiplicador da oitava: como a frequência
de uma nota é o dobro de sua oitava inferior, esse multiplicador é `2 ^ oitava`.

`fromFigure` é uma função com a seguinte assinatura:
`fromFigure :: String -> Int`.
Não vou entrar em detalhes na implementação dela, basta saber que dada uma
nota expressa em uma string (exemplo, `A#`), ela dá quantos semitons ela tem de
distância em relação ao Dó da mesma oitava (no caso do exemplo, 10). `baseExp` é
a razão entre a frequência de uma nota e a frequência da nota um semitom abaixo,
ou seja `2^(1/12)`.

Juntando as duas coisas, calcula-se frequência da nota como `mult * c0 *
(baseExp ^ (fromFigure figura))`.

#### Obtendo as durações

Quanto às durações das notas, temos a seguinte função:

~~~haskell
period :: Int -> Float -> Sec
period bpm beats = 60 * beats / (fromIntegral bpm)
~~~

Em prosa, é uma regra de três: se faz `bpm` batidas em 60 segundos, quantos
segundos leva para `beats` batidas.


#### Juntando os 3 canais em uma tabela

Obtidas então as durações e as frequências de cada nota ou silêncio de cada
canal, precisamos juntar as informações dos três canais em uma só tabela, no
formato descrito no começo desta etapa (uma tabela de `FreqEvent`s).

Por enquanto, temos 3 tabelas, uma para cada canal, cujas colunas são `(Duração,
Frequência)`. Como saber quando cada nota irá iniciar? Simples, como dentro de
cada canal elas são sequenciais, o início dela é igual à soma da duração de
todas as notas anteriores.

Com isso, pode-se juntar da seguinte forma: cada entrada na tabela indica quando
há uma alteração de frequência em um dos canais, contendo a frequência nova, e
copiando a frequência anterior dos outros canais. Assim, conseguimos chegar no
resultado esperado de `freqEventsFromSong`

### Etapa 4: Variações de posição e velocidade

Nesta etapa, queremos pegar a saída da etapa anterior e usá-la para descobrir o
quanto e em que velocidade cada eixo deverá se mover a fim de obter as notas, ou
seja, a função `fromFreqEvents` em que:

~~~haskell

type MM       = Float
type MM_s     = Float
type Movement = (MM, MM, MM, MM_s)

fromFreqEvents :: Printer -> [FreqEvent] -> [Movement]
~~~

em que `Printer` carrega informações sobre a impressora, `[FreqEvent]` é a lista
de eventos da etapa anterior e `[Movement]` é uma lista de movimentos
resultantes.

Como eu disse anteriormente, a variação de nota pelos motores ocorre com a
frequência que eles são movimentados. E a duração? Bom, isso é fácil, nós apenas
precisamos multiplicar a frequência pela duração, com `p = Δt * f`, em que `p` é
o número de passos, `Δt` é a duração e `f` é a frequência. Por exemplo: se temos
uma nota de 440Hz tocada por dois segundos, então significa que devemos mover
880 passos o motor a 440Hz.

E como eu disse anteriormente, não temos o controle disso diretamente por
G-Code, porém, podemos controlar quantos **milímetros** cada eixo irá se mover,
e a velocidade dessa movimentação, em **milímetros por minuto**. E como calular
isso? Bom, simples, para cada eixo, a posição pode ser calculada com a fórmula
`Δs = p * (pmm)` em que `p` é o número de passos e `pmm` é o número de passos
necessários para que o eixo se mova 1mm.

O cálculo da velocidade precisa ser feito em conjunto com os três
eixos. Lembrando de física, a velocidade para cada eixo deveria ser calculada
como `v = Δs / Δt`. Mas como a velocidade que deve ser fornecida no G-Code é a
norma da soma vetorial das velocidades dos três eixos, o `Δs` deverá ser a norma
da soma vetorial dos deslocamentos de cada eixo. Ou, em outras palavras:
`Δs = sqrt (Δsx² + Δsy² + Δsz²)`.

Feito isso, é nessário fazer as conversões de unidade da velocidade, uma vez que
estávamos trabalhando com **milímetros** e **milisegundos** e o G-Code trabalha
com **milímetros por minuto**.

### Etapa 5: Posicionamento absoluto e G-Code

Esta é a última etapa, e é a mais delicada. Até agora, temos uma tabela que nos
diz **quantos** mílimitros cada eixo deverá se mover, e a velocidade do
movimento. O que queremos, no G-Code, é a posição **absoluta** para onde a
impressora deverá movimentar a extrusora. Para isso, é necessário tomar cuidado
para que os movimentos sejam todos feitos dentro do espaço de impressão, caso
contrário, além de não funcionar poderá trazer danos à impressora.

Em termos de código, queremos uma função assim:

~~~haskell
fromRelativeMovements :: Printer -> [Movement] -> GCode
~~~

ou seja, recebe informações sobre a impressora (no caso, o que importa aqui são
os limites de cada eixo), a lista de movimentos relativos mencionados da etapa
anterior, e devolve o G-Code resultante.

A primeira posição é o ponto de partida para a sequência de movimentos
seguintes, e está definida assim:

~~~haskell
fstPos = (x0, y0, z0, homeSpeed)
~~~

A partir de uma posição, podemos calcular a posição seguinte,
recursivamente. Bom, tendo em mãos essa primeira posição, e a lista de
movimentos relativos, podemos calcular as posições absolutas assim:

~~~haskell
absolutes = foldl nextSafePositions' [fstPos] movements
  where nextSafePositions' l d = l ++ nextSafePositions printer (last l) d

~~~

Ou em português: a aplicação da função `nextSafeMovement` tendo como argumentos
`printer` (as informações da impressora), uma posição absoluta, e a posição
relativa referente ao próximo movimento relativo devolve quais são as posições
necessárias para o cumprimento desse movimento. Bom, um pouco confuso, sim. O
que o ocorre aqui é que um único movimento relativo poderá ser convertido em
mais de um movimento absoluto, já que ele poderá ser "quebrado" em dois
movimentos ou mais caso ele extrapole os limites da impressora.

Tá, mas e o que é `nextSafeMovement`? Bom, uma função
com essa assinatura:

~~~haskell
nextSafePositions :: Printer -> Position -> Movement -> [Position]
~~~

ou seja, nada além do mencionado anteriormente, recebe as informações da
impressora, a última posição absoluta calculada, o movimento relativo que se
quer aplicar, e devolve uma lista de posições relativas.

O funcionamento interno dessa função é um pouco longo para ser descrito em mais
detalhes aqui, porém, basta saber que:

- o sentido da movimentação de cada eixo escolhido é o que se move em direção à
  borda mais distante do eixo, dando mais espaço para a movimentação;

- caso haja espaço suficiente para fazer um só movimento, ele é o que será usado;

- caso não haja, a movimentação será feita até encontrar com uma borda. A
  posição resultante e o movimento relativo restante é usado como parâmetros da
  aplicação da mesma função. Essa chamada recursiva é feita até que não haja
  mais movimento relativo restante;

- a velocidade é sempre a mesma calculada no movimento relativo, não é
  necessário alterar ela em nada.

Temos então uma lista de para quais posições cada eixo deverá se movimentar, e
qual a velocidade que eles devem se mover para cada posição. Isso, em si, já são
os parâmetros do comando G0 do G-Code, ou seja, basta formatálos como descrito
[láááááá no começo desse post]({{ site.baseurl
}}/software/2020-07-31-musica_gcode/#saída).


### Enfim, G-Code

Já temos então o G-Code, que poderá ser colocado em um cartão de memória, ou
enviado para a impressora através do software de sua preferência.

## Possíveis features para o futuro

- Mostrar a letra da música no display da impressora
- Usar o motor da extrusora como um canal extra
- Usar o buzzer como um canal extra
- Adicionar suporte a impressoras dos tipos Delta e CoreXY


### 2023 Update

Faltou um video disso funcionando. Aqui vai ele:

<blockquote class="instagram-media" data-instgrm-captioned data-instgrm-permalink="https://www.instagram.com/reel/Cha_0K2LcN3/?utm_source=ig_embed&amp;utm_campaign=loading" data-instgrm-version="14" style=" background:#FFF; border:0; border-radius:3px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 1px; max-width:540px; min-width:326px; padding:0; width:99.375%; width:-webkit-calc(100% - 2px); width:calc(100% - 2px);"><div style="padding:16px;"> <a href="https://www.instagram.com/reel/Cha_0K2LcN3/?utm_source=ig_embed&amp;utm_campaign=loading" style=" background:#FFFFFF; line-height:0; padding:0 0; text-align:center; text-decoration:none; width:100%;" target="_blank"> <div style=" display: flex; flex-direction: row; align-items: center;"> <div style="background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 40px; margin-right: 14px; width: 40px;"></div> <div style="display: flex; flex-direction: column; flex-grow: 1; justify-content: center;"> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; margin-bottom: 6px; width: 100px;"></div> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; width: 60px;"></div></div></div><div style="padding: 19% 0;"></div> <div style="display:block; height:50px; margin:0 auto 12px; width:50px;"><svg width="50px" height="50px" viewBox="0 0 60 60" version="1.1" xmlns="https://www.w3.org/2000/svg" xmlns:xlink="https://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-511.000000, -20.000000)" fill="#000000"><g><path d="M556.869,30.41 C554.814,30.41 553.148,32.076 553.148,34.131 C553.148,36.186 554.814,37.852 556.869,37.852 C558.924,37.852 560.59,36.186 560.59,34.131 C560.59,32.076 558.924,30.41 556.869,30.41 M541,60.657 C535.114,60.657 530.342,55.887 530.342,50 C530.342,44.114 535.114,39.342 541,39.342 C546.887,39.342 551.658,44.114 551.658,50 C551.658,55.887 546.887,60.657 541,60.657 M541,33.886 C532.1,33.886 524.886,41.1 524.886,50 C524.886,58.899 532.1,66.113 541,66.113 C549.9,66.113 557.115,58.899 557.115,50 C557.115,41.1 549.9,33.886 541,33.886 M565.378,62.101 C565.244,65.022 564.756,66.606 564.346,67.663 C563.803,69.06 563.154,70.057 562.106,71.106 C561.058,72.155 560.06,72.803 558.662,73.347 C557.607,73.757 556.021,74.244 553.102,74.378 C549.944,74.521 548.997,74.552 541,74.552 C533.003,74.552 532.056,74.521 528.898,74.378 C525.979,74.244 524.393,73.757 523.338,73.347 C521.94,72.803 520.942,72.155 519.894,71.106 C518.846,70.057 518.197,69.06 517.654,67.663 C517.244,66.606 516.755,65.022 516.623,62.101 C516.479,58.943 516.448,57.996 516.448,50 C516.448,42.003 516.479,41.056 516.623,37.899 C516.755,34.978 517.244,33.391 517.654,32.338 C518.197,30.938 518.846,29.942 519.894,28.894 C520.942,27.846 521.94,27.196 523.338,26.654 C524.393,26.244 525.979,25.756 528.898,25.623 C532.057,25.479 533.004,25.448 541,25.448 C548.997,25.448 549.943,25.479 553.102,25.623 C556.021,25.756 557.607,26.244 558.662,26.654 C560.06,27.196 561.058,27.846 562.106,28.894 C563.154,29.942 563.803,30.938 564.346,32.338 C564.756,33.391 565.244,34.978 565.378,37.899 C565.522,41.056 565.552,42.003 565.552,50 C565.552,57.996 565.522,58.943 565.378,62.101 M570.82,37.631 C570.674,34.438 570.167,32.258 569.425,30.349 C568.659,28.377 567.633,26.702 565.965,25.035 C564.297,23.368 562.623,22.342 560.652,21.575 C558.743,20.834 556.562,20.326 553.369,20.18 C550.169,20.033 549.148,20 541,20 C532.853,20 531.831,20.033 528.631,20.18 C525.438,20.326 523.257,20.834 521.349,21.575 C519.376,22.342 517.703,23.368 516.035,25.035 C514.368,26.702 513.342,28.377 512.574,30.349 C511.834,32.258 511.326,34.438 511.181,37.631 C511.035,40.831 511,41.851 511,50 C511,58.147 511.035,59.17 511.181,62.369 C511.326,65.562 511.834,67.743 512.574,69.651 C513.342,71.625 514.368,73.296 516.035,74.965 C517.703,76.634 519.376,77.658 521.349,78.425 C523.257,79.167 525.438,79.673 528.631,79.82 C531.831,79.965 532.853,80.001 541,80.001 C549.148,80.001 550.169,79.965 553.369,79.82 C556.562,79.673 558.743,79.167 560.652,78.425 C562.623,77.658 564.297,76.634 565.965,74.965 C567.633,73.296 568.659,71.625 569.425,69.651 C570.167,67.743 570.674,65.562 570.82,62.369 C570.966,59.17 571,58.147 571,50 C571,41.851 570.966,40.831 570.82,37.631"></path></g></g></g></svg></div><div style="padding-top: 8px;"> <div style=" color:#3897f0; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:550; line-height:18px;">View this post on Instagram</div></div><div style="padding: 12.5% 0;"></div> <div style="display: flex; flex-direction: row; margin-bottom: 14px; align-items: center;"><div> <div style="background-color: #F4F4F4; border-radius: 50%; height: 12.5px; width: 12.5px; transform: translateX(0px) translateY(7px);"></div> <div style="background-color: #F4F4F4; height: 12.5px; transform: rotate(-45deg) translateX(3px) translateY(1px); width: 12.5px; flex-grow: 0; margin-right: 14px; margin-left: 2px;"></div> <div style="background-color: #F4F4F4; border-radius: 50%; height: 12.5px; width: 12.5px; transform: translateX(9px) translateY(-18px);"></div></div><div style="margin-left: 8px;"> <div style=" background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 20px; width: 20px;"></div> <div style=" width: 0; height: 0; border-top: 2px solid transparent; border-left: 6px solid #f4f4f4; border-bottom: 2px solid transparent; transform: translateX(16px) translateY(-4px) rotate(30deg)"></div></div><div style="margin-left: auto;"> <div style=" width: 0px; border-top: 8px solid #F4F4F4; border-right: 8px solid transparent; transform: translateY(16px);"></div> <div style=" background-color: #F4F4F4; flex-grow: 0; height: 12px; width: 16px; transform: translateY(-4px);"></div> <div style=" width: 0; height: 0; border-top: 8px solid #F4F4F4; border-left: 8px solid transparent; transform: translateY(-4px) translateX(8px);"></div></div></div> <div style="display: flex; flex-direction: column; flex-grow: 1; justify-content: center; margin-bottom: 24px;"> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; margin-bottom: 6px; width: 224px;"></div> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; width: 144px;"></div></div></a><p style=" color:#c9c8cd; font-family:Arial,sans-serif; font-size:14px; line-height:17px; margin-bottom:0; margin-top:8px; overflow:hidden; padding:8px 0 7px; text-align:center; text-overflow:ellipsis; white-space:nowrap;"><a href="https://www.instagram.com/reel/Cha_0K2LcN3/?utm_source=ig_embed&amp;utm_campaign=loading" style=" color:#c9c8cd; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:normal; line-height:17px; text-decoration:none;" target="_blank">A post shared by Lucas Oshiro (@lucasseikioshiro)</a></p></div></blockquote>
<script async src="//www.instagram.com/embed.js"></script>
