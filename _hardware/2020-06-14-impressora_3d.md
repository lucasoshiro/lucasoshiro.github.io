---
title: "Impressora 3D"
excerpt: "Impressora 3D feita artesanalmente usando Arduino"

header:
  image: /assets/images/hardware/2020-06-14-impressora_3d/hermione.jpg
  teaser: /assets/images/hardware/2020-06-14-impressora_3d/hermione.jpg

last_modified_at: 2023-01-08

lang: pt_br
path-en: /hardware-en/2020-06-14-3d_printer/

---

### Introdução

Bom, se você chegou até esta página, você já deve saber o que é uma impressora
3D, então, sem muitas apresentações e vamos ao que interessa!

Neste projeto, que fiz durante minhas férias, construí esta impressora 3D de
filamento. Ela tem as seguintes características:

- Mesa aquecida;
- Compatível com G-code;
- Software e hardware livres;
- Bowden;
- Nivelamento automático;
- Display gráfico;
- Interface em português;
- Suporte para cartão SD;
- Jogos;

Esta impressora é ~~uma cópia~~ baseada na
[Cianofícea](https://linux.ime.usp.br/~brunobra/3Dprinter.html), construída pelo
também membro do Hardware Livre [Bruno](https://linux.ime.usp.br/~brunobra).

Esta post também está no [site do Hardware Livre](https://hardwarelivreusp.org/projetos/2020/06/19/impressora_3d/).

### Estrutura

A estrutura da impressora 3D é feita de MDF, cortado a laser no InovaLab, na
POLI-USP. O modelo usado é o [Graber i3](https://github.com/sgraber/Graber),
criado por Shanon Graber, e que é baseado na impressora Prusa i3, porém feito
para ser feito com partes cortadas a laser em vez de impressas.

Para isso foi comprada uma placa de MDF de 90cm x 1m, cortada em duas
partes para caber na cortadora laser. As partes cortadas foram
pintadas com spray automotivo preto, para maior resistencia contra a
umidade.

Essa estrutura, porém, não foi feita para o display que eu usei. Para usá-lo,
precisei cortar a laser outra peça, disponível
[aqui](https://www.thingiverse.com/thing:1186465#Summary).

Para cada eixo há um par de barras de aço com espessura de 8mm. Aqui vai uma
dica: evite comprar barras específicas para impressoras 3D aqui. Elas são caras
e são iguais às que podem ser encontradas em impressoras jato de tinta
inoperantes e em serralherias, por um preço bem mais barato.

Preços:
- MDF: R$50,00
- Parafusos ≃ R$30,00
- Barras de inox 8mm: R$30,00

<div class="img-container">
  <figure>
    <img class="large" src="{{ site.baseurl }}/assets/images/hardware/2020-06-14-impressora_3d/hermione1.jpg">
    <figcaption>Estrutura de MDF, depois de cortada</figcaption>
  </figure>
</div>

<div class="img-container">
  <figure>
    <img class="large" src="{{ site.baseurl }}/assets/images/hardware/2020-06-14-impressora_3d/hermione2.jpg">
    <figcaption>Estrutura de MDF, depois de cortada, e pintada</figcaption>
  </figure>
</div>

### Eletrônica

O coração da impressora é um Arduino Mega, com um shield RAMPS acoplado. O
RAMPS é um shield feito para o controle dos componentes elétricos de uma
impressora 3D.

Sobre o RAMPS foram encaixados 4 drivers DRV8825. Eles são responsáveis pelo
controle dos motores de passo. Cada driver controla um dos três eixos da
impressora, além de um quarto para o controle do fluxo de filamento para a
extrusora. O RAMPS ainda permite mais um motor de passo para uma segunda
extrusora, mas não usei isso porque ela só terá uma (bom, pelo menos por
enquanto...).

Também está conectado ao RAMPS o display RepRap Full Graphics Display, com
um encoder rotativo para controle da interface e porta para cartão SD. Ao
contrário de outros displays mais simples, este consegue desenhar algumas
figuras e ter uma interface mais gráfica do que outros que mostram apenas texto
puro. Também permite alguns joguinhos 😉.

O Arduino Mega, o RAMPS, os drivers e o display foram comprados em um único kit,
junto de alguns outros componentes. É bom pesquisar se compensa comprar um kit
como esse ou comprar as peças avulsas.

Preço:
- Kit de impressora 3D: 279,95

  - Arduino Mega
  - Mesa
  - 6x Endstops
  - Arduino Mega
  - RAMPS
  - RepRap Full Graphics Display
  - 5x Drivers de motor de passo DRV8825
  - Cabo USB

<div class="img-container">
  <figure>
    <img class="large" src="{{ site.baseurl }}/assets/images/hardware/2020-06-14-impressora_3d/eletronicos.jpg">
    <figcaption>Eletrônicos. Azul: Arduino Mega; Vermelho: RAMPS; Roxo: DRV8825</figcaption>
  </figure>
</div>



### Motores

Foram usados 5 motores de passo NEMA 17. Um para o eixo X, um para o eixo Y,
dois para o eixo Z e um para a extrusora. Esses motores de passo devem ser
ligados no RAMPS ao lado de seus respectivos drivers. Os motores do eixo Z
compartilham o mesmo driver de motor de passo.

Ao instalar os motores de passo, deve-se regular cada driver para fornecer a
corrente correta. Isso deve ser feito com o auxílio de um multímetro, fazendo a
regulagem no potênciometro que fica na parte de cima do driver. Para fazer isso,
deve-se ler o datasheet do motor de passo e consultar qual deve ser a leitura da
diferença de potencial entre a parte de metal do potenciômetro e o GND, tomando
o **máximo** de cuidado para não deixar a ponta de prova do multímetro escapar e
provocar algum curto-circuito. Isso pode inutilizar o Arduino (sim, isso
aconteceu comigo).

Preço:
- 5x NEMA 17: 5x R$ 59,95 = R$299,90

<div class="img-container">
  <figure>
    <img class="large" src="{{ site.baseurl }}/assets/images/hardware/2020-06-14-impressora_3d/nema.jpg">
    <figcaption>Motores de passo NEMA 17. Veio tão bem embalado que deu até dó de tirar...</figcaption>
  </figure>
</div>

### Alimentação

Uma fonte chaveada provê tensão de 12V para o shield RAMPS. Ele, por sua vez,
alimenta o Arduino e as outros componentes. O Arduino em si pode ser alimentado
por USB a 5V, conseguindo alimentar também o display e o servo (falarei dele
mais para frente), mas sendo incapaz de mover os motores de passo e aquecer a
mesa e a extrusora.

Fonte chaveada 12V 30A: R$120

<div class="img-container">
  <figure>
    <img class="large" src="{{ site.baseurl }}/assets/images/hardware/2020-06-14-impressora_3d/fonte.jpg">
    <figcaption>Fonte</figcaption>
  </figure>
</div>


### Aquecimento

Durante a impressão, um dos motores de passo empurra o filamento em direção ao
bico que, aquecido, derrete o filamento e o faz sair pelo seu orifício. Um
cartucho aquecedor e um termistor são acoplados ao bloco de aquecimento onde
fica encaixado o bico. Sobre eles, há um dissipador de calor e um cooler. Esse
conjunto permite controlar a temperatura, que deve estar na faixa recomendada
para o tipo de filamento escolhido.

A mesa aquecida permite melhor aderência e melhor qualidade de impressão. Sob
ela foi preso um termistor igual ao da extrusora com cola de silicone,
resistente a altas temperaturas. A mesa nada mais é que um grande resistor, que
é alimentado pelo RAMPS a 12V. Ela é fixada sobre sua base por quatro molas,
cada uma com um parafuso passando por dentro.

A impressão não deve ser feita diretamente sobre a mesa aquecida: é necessário
usar um vidro sobre ela como base para a impressão. Pode-se usar um vidro comum
de 3mm, de um tamanho que caiba sobre a mesa sem encostar nos parafusos.

Preço:

- Extrusora: R$ 95,00

  - Hotend
  - Bico 0.4mm
  - Cooler
  - Bowden
  - Termistor

- Termisor para mesa: R$13,50
- Vidro R$7,00

<div class="img-container">
  <figure>
    <img class="large" src="{{ site.baseurl }}/assets/images/hardware/2020-06-14-impressora_3d/tralhas.jpg">
    <figcaption>Mesa aquecida, extrusora, etc...</figcaption>
  </figure>
</div>

### Partes mecânicas

A mesa se move sobre o eixo Y, o eixo X se move sobre o eixo Z, e a extrusora se
move sobre o eixo X. O movimento sobre esses eixos é guiado por rolamentos
lineares, no caso, os rolamentos lineares LM8UU.

O movimento dos motores dos eixos X e Y é transmitido através de um conjunto de
correia dentada, polia e rolamento para cada um desses eixos. A correia não deve
estar muito tensionada, e nem muito frouxa.

Quanto ao eixo Z, ele é movimentado através de de porcas que se locomovem
conforme o movimento das barras roscadas que são presas aos dois motores de
passo desse eixo através de dois acoplamentos flexíveis.

Da mesma forma que as barras lisas de aço, esta barra roscada pode ser comprada
em lojas de parafuso ou de construção por um preço mais barato que as
específicas para impressoras 3D.

Quanto ao sistema de movimentação do filamento, há um conjunto de uma alavanca
com uma mola e um rolamento que, juntos, pressionam o filamento contra uma polia
preso ao motor de passo da extrusora, que o empurra através da mangueira do
bowden.

- Kit gadgets de impressora 3D: R$111,09

  - 12x Rolamento linear LM8UU
  - 2x polia GT2
  - 2m correia GT2
  - 5x Rolamentos
  - 2x acoplamentos 5mmx5mm

- Kit para extrusora (alavanca): R$60,00

- Barras roscadas 5mm: R$5,00

<div class="img-container">
  <figure>
    <img class="large" src="{{ site.baseurl }}/assets/images/hardware/2020-06-14-impressora_3d/motor_filamento.jpg">
    <figcaption>Conjunto de movimentação do filamento</figcaption>
  </figure>
</div>


### Endstops

Os endstops servem para detectar que um eixo chegou no fim ou no começo de seu
curso.

Devido ao formato da fonte que comprei, esta impressora tem o eixo X
espelhado em relação ao que normalmente é usado para a Graber. Desta forma, a
montagem ficava mais limpa em usar um endstop no eixo X no fim de seu curso,
enquanto que nos eixos Y e Z o endstop indica o começo do curso.

Os endstops, então, ficaram montados da seguinte forma:

- Eixo X: Preso junto à estrutura de MDF que segura o motor, na direita;
- Eixo Y: Preso sob a mesa, na parte de trás, encostando na traseira da
  impressora quando Y = 0;
- Eixo Z: Preso a uma peça impressa, que é baixada por um servo, possibilitando
  que o endstop fique em uma posição segura que não atrapalhe a impressão;

Obs.: a peça em que o endstop é preso foi feita na própria impressora 😁.

Preço:
- Servo 9g: R$15,44

<div class="img-container">
  <figure>
    <img class="large" src="{{ site.baseurl }}/assets/images/hardware/2020-06-14-impressora_3d/endstop.jpg">
    <figcaption>Conjunto de movimentação do endstop do eixo Z</figcaption>
  </figure>
</div>


### Suporte para a bobina do filamento

Como o projeto Graber i3 não traz um suporte para o rolo de filamento, como é
nas Sethi AiP do Lab3D, meu pai fez esse suporte com alguns restos de acrílico e
ferro. Ficou legal:

<div class="img-container">
  <figure>
    <img class="large" src="{{ site.baseurl }}/assets/images/hardware/2020-06-14-impressora_3d/suporte.jpg">
    <figcaption>Suporte da bobina de filamento</figcaption>
  </figure>
</div>


### Et Cetera


Preço:
- Organizadores de cabos, pacote de fita hellerman, fios, terminais, etc: R$ 20,00

### Firmware

O firmware usado é o [Marlin](https://marlinfw.org/). Esse firmware é fácil de
ser configurado apenas definindo algumas constantes em dois arquivos de
cabeçalho (.h), contando com uma ótima documentação oficial.

Até o momento, precisei configurar isto:

- Baudrate: de 250000 para 115200
- Diâmetro do filmaneto: de 3mm para 1.75mm
- Ativar o termistor da mesa
- Inversão da lógica dos endstops
- Endstop do eixo indicando a posição máxima
- Passos/mm para cada um dos eixos
- Dimensões do espaço de impressão
- PID tuning
- Configurações do servo
- Interface em português
- Permitir diferentes frequências no buzzer
- Ativar cartão SD
- Usar display Full Graphics
- Ativar jogo brickout

Eu mantenho meu fork com as configurações e alterações específicas para esta
impressora [aqui](https://github.com/lucasoshiro/Hermione3D)

### Resultado

A impressora, pronta, ficou assim:

<div class="img-container">
  <figure>
    <img class="large" src="{{ site.baseurl }}/assets/images/hardware/2020-06-14-impressora_3d/hermione.jpg">
    <figcaption>!!!</figcaption>
  </figure>
</div>

Aqui estão algumas impressões feitas nela:

<div id="impressoes" style="text-align:center">
<div class="img-container" style="display:inline-block">
  <figure>
    <img src="{{ site.baseurl }}/assets/images/hardware/2020-06-14-impressora_3d/scrat.jpg">
    <figcaption>Scrat carregando sua noz. E cheio de suporte embaixo...</figcaption>
  </figure>
</div>

<div class="img-container" style="display:inline-block">
  <figure>
    <img src="{{ site.baseurl }}/assets/images/hardware/2020-06-14-impressora_3d/vaso.jpg">
    <figcaption>Vaso</figcaption>
  </figure>
</div>

<div class="img-container" style="display:inline-block">
  <figure>
    <img src="{{ site.baseurl }}/assets/images/hardware/2020-06-14-impressora_3d/transparente.jpg">
    <figcaption>Para aqueles que dizem ser impossível imprimir transparente...</figcaption>
  </figure>
</div>
</div>

E por último, uma impressão que desde o começo eu gostaria de fazer: o chaveiro
do Mr. FLUSP. Em maio de 2019, o Marcelo imprimiu nas impressoras Goku e Vegeta
[estes chaveiros](http://localhost:4000/lab3d/2019/08/10/maio_de_2019/), que 
ficaram muito bons. Como eu tenho um desses chaveiros, e como estão disponíveis
[os modelos e as configurações do slicer CuraEngine](https://gitlab.com/flusp/arts/-/tree/master/3D/mr_flusp_high_relief),
foi possível comparar a qualidade de impressão com a das impressoras do Lab3D. O
resultado pode ser visto na foto a seguir, sendo que o chaveiro azul e branco é
o feito no Lab3D e o transparente e cinza é o que foi feito nesta impressora
3D. Nada mal para uma impressora que custou 70% a menos 😉.

<div class="img-container">
  <figure>
    <img class="large" src="{{ site.baseurl }}/assets/images/hardware/2020-06-14-impressora_3d/mr_flusp.jpg">
    <figcaption>Chaveiros</figcaption>
  </figure>
</div>

### Atualização (2023)

Quase três anos já se passaram, com a impressora trabalhando duro durante todo
esse tempo. Algumas melhorias foram feitas durante esse tempo:

- Um novo suporte para o endstop do eixo Z;
- [WiFi](/hardware/2021-06-06-esp3d/);
- Controle da temperatura da mesa usando um MOSFET externo para passar menos
  corrente no RAMPS.

Não apenas isso, mas depois de passar tanto tempo imprimindo estou mais
familiarizado com o processo de impressão, de uma forma geral. Minhas impressões
estão bem melhores:

<blockquote class="instagram-media" data-instgrm-captioned data-instgrm-permalink="https://www.instagram.com/p/CjoKvWqrlsb/?utm_source=ig_embed&amp;utm_campaign=loading" data-instgrm-version="14" style=" background:#FFF; border:0; border-radius:3px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 1px; max-width:540px; min-width:326px; padding:0; width:99.375%; width:-webkit-calc(100% - 2px); width:calc(100% - 2px);"><div style="padding:16px;"> <a href="https://www.instagram.com/p/CjoKvWqrlsb/?utm_source=ig_embed&amp;utm_campaign=loading" style=" background:#FFFFFF; line-height:0; padding:0 0; text-align:center; text-decoration:none; width:100%;" target="_blank"> <div style=" display: flex; flex-direction: row; align-items: center;"> <div style="background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 40px; margin-right: 14px; width: 40px;"></div> <div style="display: flex; flex-direction: column; flex-grow: 1; justify-content: center;"> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; margin-bottom: 6px; width: 100px;"></div> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; width: 60px;"></div></div></div><div style="padding: 19% 0;"></div> <div style="display:block; height:50px; margin:0 auto 12px; width:50px;"><svg width="50px" height="50px" viewBox="0 0 60 60" version="1.1" xmlns="https://www.w3.org/2000/svg" xmlns:xlink="https://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-511.000000, -20.000000)" fill="#000000"><g><path d="M556.869,30.41 C554.814,30.41 553.148,32.076 553.148,34.131 C553.148,36.186 554.814,37.852 556.869,37.852 C558.924,37.852 560.59,36.186 560.59,34.131 C560.59,32.076 558.924,30.41 556.869,30.41 M541,60.657 C535.114,60.657 530.342,55.887 530.342,50 C530.342,44.114 535.114,39.342 541,39.342 C546.887,39.342 551.658,44.114 551.658,50 C551.658,55.887 546.887,60.657 541,60.657 M541,33.886 C532.1,33.886 524.886,41.1 524.886,50 C524.886,58.899 532.1,66.113 541,66.113 C549.9,66.113 557.115,58.899 557.115,50 C557.115,41.1 549.9,33.886 541,33.886 M565.378,62.101 C565.244,65.022 564.756,66.606 564.346,67.663 C563.803,69.06 563.154,70.057 562.106,71.106 C561.058,72.155 560.06,72.803 558.662,73.347 C557.607,73.757 556.021,74.244 553.102,74.378 C549.944,74.521 548.997,74.552 541,74.552 C533.003,74.552 532.056,74.521 528.898,74.378 C525.979,74.244 524.393,73.757 523.338,73.347 C521.94,72.803 520.942,72.155 519.894,71.106 C518.846,70.057 518.197,69.06 517.654,67.663 C517.244,66.606 516.755,65.022 516.623,62.101 C516.479,58.943 516.448,57.996 516.448,50 C516.448,42.003 516.479,41.056 516.623,37.899 C516.755,34.978 517.244,33.391 517.654,32.338 C518.197,30.938 518.846,29.942 519.894,28.894 C520.942,27.846 521.94,27.196 523.338,26.654 C524.393,26.244 525.979,25.756 528.898,25.623 C532.057,25.479 533.004,25.448 541,25.448 C548.997,25.448 549.943,25.479 553.102,25.623 C556.021,25.756 557.607,26.244 558.662,26.654 C560.06,27.196 561.058,27.846 562.106,28.894 C563.154,29.942 563.803,30.938 564.346,32.338 C564.756,33.391 565.244,34.978 565.378,37.899 C565.522,41.056 565.552,42.003 565.552,50 C565.552,57.996 565.522,58.943 565.378,62.101 M570.82,37.631 C570.674,34.438 570.167,32.258 569.425,30.349 C568.659,28.377 567.633,26.702 565.965,25.035 C564.297,23.368 562.623,22.342 560.652,21.575 C558.743,20.834 556.562,20.326 553.369,20.18 C550.169,20.033 549.148,20 541,20 C532.853,20 531.831,20.033 528.631,20.18 C525.438,20.326 523.257,20.834 521.349,21.575 C519.376,22.342 517.703,23.368 516.035,25.035 C514.368,26.702 513.342,28.377 512.574,30.349 C511.834,32.258 511.326,34.438 511.181,37.631 C511.035,40.831 511,41.851 511,50 C511,58.147 511.035,59.17 511.181,62.369 C511.326,65.562 511.834,67.743 512.574,69.651 C513.342,71.625 514.368,73.296 516.035,74.965 C517.703,76.634 519.376,77.658 521.349,78.425 C523.257,79.167 525.438,79.673 528.631,79.82 C531.831,79.965 532.853,80.001 541,80.001 C549.148,80.001 550.169,79.965 553.369,79.82 C556.562,79.673 558.743,79.167 560.652,78.425 C562.623,77.658 564.297,76.634 565.965,74.965 C567.633,73.296 568.659,71.625 569.425,69.651 C570.167,67.743 570.674,65.562 570.82,62.369 C570.966,59.17 571,58.147 571,50 C571,41.851 570.966,40.831 570.82,37.631"></path></g></g></g></svg></div><div style="padding-top: 8px;"> <div style=" color:#3897f0; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:550; line-height:18px;">View this post on Instagram</div></div><div style="padding: 12.5% 0;"></div> <div style="display: flex; flex-direction: row; margin-bottom: 14px; align-items: center;"><div> <div style="background-color: #F4F4F4; border-radius: 50%; height: 12.5px; width: 12.5px; transform: translateX(0px) translateY(7px);"></div> <div style="background-color: #F4F4F4; height: 12.5px; transform: rotate(-45deg) translateX(3px) translateY(1px); width: 12.5px; flex-grow: 0; margin-right: 14px; margin-left: 2px;"></div> <div style="background-color: #F4F4F4; border-radius: 50%; height: 12.5px; width: 12.5px; transform: translateX(9px) translateY(-18px);"></div></div><div style="margin-left: 8px;"> <div style=" background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 20px; width: 20px;"></div> <div style=" width: 0; height: 0; border-top: 2px solid transparent; border-left: 6px solid #f4f4f4; border-bottom: 2px solid transparent; transform: translateX(16px) translateY(-4px) rotate(30deg)"></div></div><div style="margin-left: auto;"> <div style=" width: 0px; border-top: 8px solid #F4F4F4; border-right: 8px solid transparent; transform: translateY(16px);"></div> <div style=" background-color: #F4F4F4; flex-grow: 0; height: 12px; width: 16px; transform: translateY(-4px);"></div> <div style=" width: 0; height: 0; border-top: 8px solid #F4F4F4; border-left: 8px solid transparent; transform: translateY(-4px) translateX(8px);"></div></div></div> <div style="display: flex; flex-direction: column; flex-grow: 1; justify-content: center; margin-bottom: 24px;"> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; margin-bottom: 6px; width: 224px;"></div> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; width: 144px;"></div></div></a><p style=" color:#c9c8cd; font-family:Arial,sans-serif; font-size:14px; line-height:17px; margin-bottom:0; margin-top:8px; overflow:hidden; padding:8px 0 7px; text-align:center; text-overflow:ellipsis; white-space:nowrap;"><a href="https://www.instagram.com/p/CjoKvWqrlsb/?utm_source=ig_embed&amp;utm_campaign=loading" style=" color:#c9c8cd; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:normal; line-height:17px; text-decoration:none;" target="_blank">A post shared by Lucas Oshiro (@lucasseikioshiro)</a></p></div></blockquote> <script async src="//www.instagram.com/embed.js"></script>
<blockquote class="instagram-media" data-instgrm-captioned data-instgrm-permalink="https://www.instagram.com/p/CVJ_slOA5UE/?utm_source=ig_embed&amp;utm_campaign=loading" data-instgrm-version="14" style=" background:#FFF; border:0; border-radius:3px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 1px; max-width:540px; min-width:326px; padding:0; width:99.375%; width:-webkit-calc(100% - 2px); width:calc(100% - 2px);"><div style="padding:16px;"> <a href="https://www.instagram.com/p/CVJ_slOA5UE/?utm_source=ig_embed&amp;utm_campaign=loading" style=" background:#FFFFFF; line-height:0; padding:0 0; text-align:center; text-decoration:none; width:100%;" target="_blank"> <div style=" display: flex; flex-direction: row; align-items: center;"> <div style="background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 40px; margin-right: 14px; width: 40px;"></div> <div style="display: flex; flex-direction: column; flex-grow: 1; justify-content: center;"> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; margin-bottom: 6px; width: 100px;"></div> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; width: 60px;"></div></div></div><div style="padding: 19% 0;"></div> <div style="display:block; height:50px; margin:0 auto 12px; width:50px;"><svg width="50px" height="50px" viewBox="0 0 60 60" version="1.1" xmlns="https://www.w3.org/2000/svg" xmlns:xlink="https://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-511.000000, -20.000000)" fill="#000000"><g><path d="M556.869,30.41 C554.814,30.41 553.148,32.076 553.148,34.131 C553.148,36.186 554.814,37.852 556.869,37.852 C558.924,37.852 560.59,36.186 560.59,34.131 C560.59,32.076 558.924,30.41 556.869,30.41 M541,60.657 C535.114,60.657 530.342,55.887 530.342,50 C530.342,44.114 535.114,39.342 541,39.342 C546.887,39.342 551.658,44.114 551.658,50 C551.658,55.887 546.887,60.657 541,60.657 M541,33.886 C532.1,33.886 524.886,41.1 524.886,50 C524.886,58.899 532.1,66.113 541,66.113 C549.9,66.113 557.115,58.899 557.115,50 C557.115,41.1 549.9,33.886 541,33.886 M565.378,62.101 C565.244,65.022 564.756,66.606 564.346,67.663 C563.803,69.06 563.154,70.057 562.106,71.106 C561.058,72.155 560.06,72.803 558.662,73.347 C557.607,73.757 556.021,74.244 553.102,74.378 C549.944,74.521 548.997,74.552 541,74.552 C533.003,74.552 532.056,74.521 528.898,74.378 C525.979,74.244 524.393,73.757 523.338,73.347 C521.94,72.803 520.942,72.155 519.894,71.106 C518.846,70.057 518.197,69.06 517.654,67.663 C517.244,66.606 516.755,65.022 516.623,62.101 C516.479,58.943 516.448,57.996 516.448,50 C516.448,42.003 516.479,41.056 516.623,37.899 C516.755,34.978 517.244,33.391 517.654,32.338 C518.197,30.938 518.846,29.942 519.894,28.894 C520.942,27.846 521.94,27.196 523.338,26.654 C524.393,26.244 525.979,25.756 528.898,25.623 C532.057,25.479 533.004,25.448 541,25.448 C548.997,25.448 549.943,25.479 553.102,25.623 C556.021,25.756 557.607,26.244 558.662,26.654 C560.06,27.196 561.058,27.846 562.106,28.894 C563.154,29.942 563.803,30.938 564.346,32.338 C564.756,33.391 565.244,34.978 565.378,37.899 C565.522,41.056 565.552,42.003 565.552,50 C565.552,57.996 565.522,58.943 565.378,62.101 M570.82,37.631 C570.674,34.438 570.167,32.258 569.425,30.349 C568.659,28.377 567.633,26.702 565.965,25.035 C564.297,23.368 562.623,22.342 560.652,21.575 C558.743,20.834 556.562,20.326 553.369,20.18 C550.169,20.033 549.148,20 541,20 C532.853,20 531.831,20.033 528.631,20.18 C525.438,20.326 523.257,20.834 521.349,21.575 C519.376,22.342 517.703,23.368 516.035,25.035 C514.368,26.702 513.342,28.377 512.574,30.349 C511.834,32.258 511.326,34.438 511.181,37.631 C511.035,40.831 511,41.851 511,50 C511,58.147 511.035,59.17 511.181,62.369 C511.326,65.562 511.834,67.743 512.574,69.651 C513.342,71.625 514.368,73.296 516.035,74.965 C517.703,76.634 519.376,77.658 521.349,78.425 C523.257,79.167 525.438,79.673 528.631,79.82 C531.831,79.965 532.853,80.001 541,80.001 C549.148,80.001 550.169,79.965 553.369,79.82 C556.562,79.673 558.743,79.167 560.652,78.425 C562.623,77.658 564.297,76.634 565.965,74.965 C567.633,73.296 568.659,71.625 569.425,69.651 C570.167,67.743 570.674,65.562 570.82,62.369 C570.966,59.17 571,58.147 571,50 C571,41.851 570.966,40.831 570.82,37.631"></path></g></g></g></svg></div><div style="padding-top: 8px;"> <div style=" color:#3897f0; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:550; line-height:18px;">View this post on Instagram</div></div><div style="padding: 12.5% 0;"></div> <div style="display: flex; flex-direction: row; margin-bottom: 14px; align-items: center;"><div> <div style="background-color: #F4F4F4; border-radius: 50%; height: 12.5px; width: 12.5px; transform: translateX(0px) translateY(7px);"></div> <div style="background-color: #F4F4F4; height: 12.5px; transform: rotate(-45deg) translateX(3px) translateY(1px); width: 12.5px; flex-grow: 0; margin-right: 14px; margin-left: 2px;"></div> <div style="background-color: #F4F4F4; border-radius: 50%; height: 12.5px; width: 12.5px; transform: translateX(9px) translateY(-18px);"></div></div><div style="margin-left: 8px;"> <div style=" background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 20px; width: 20px;"></div> <div style=" width: 0; height: 0; border-top: 2px solid transparent; border-left: 6px solid #f4f4f4; border-bottom: 2px solid transparent; transform: translateX(16px) translateY(-4px) rotate(30deg)"></div></div><div style="margin-left: auto;"> <div style=" width: 0px; border-top: 8px solid #F4F4F4; border-right: 8px solid transparent; transform: translateY(16px);"></div> <div style=" background-color: #F4F4F4; flex-grow: 0; height: 12px; width: 16px; transform: translateY(-4px);"></div> <div style=" width: 0; height: 0; border-top: 8px solid #F4F4F4; border-left: 8px solid transparent; transform: translateY(-4px) translateX(8px);"></div></div></div> <div style="display: flex; flex-direction: column; flex-grow: 1; justify-content: center; margin-bottom: 24px;"> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; margin-bottom: 6px; width: 224px;"></div> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; width: 144px;"></div></div></a><p style=" color:#c9c8cd; font-family:Arial,sans-serif; font-size:14px; line-height:17px; margin-bottom:0; margin-top:8px; overflow:hidden; padding:8px 0 7px; text-align:center; text-overflow:ellipsis; white-space:nowrap;"><a href="https://www.instagram.com/p/CVJ_slOA5UE/?utm_source=ig_embed&amp;utm_campaign=loading" style=" color:#c9c8cd; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:normal; line-height:17px; text-decoration:none;" target="_blank">A post shared by Lucas Oshiro (@lucasseikioshiro)</a></p></div></blockquote> <script async src="//www.instagram.com/embed.js"></script>
<blockquote class="instagram-media" data-instgrm-captioned data-instgrm-permalink="https://www.instagram.com/p/CmpwIA0AHvA/?utm_source=ig_embed&amp;utm_campaign=loading" data-instgrm-version="14" style=" background:#FFF; border:0; border-radius:3px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 1px; max-width:540px; min-width:326px; padding:0; width:99.375%; width:-webkit-calc(100% - 2px); width:calc(100% - 2px);"><div style="padding:16px;"> <a href="https://www.instagram.com/p/CmpwIA0AHvA/?utm_source=ig_embed&amp;utm_campaign=loading" style=" background:#FFFFFF; line-height:0; padding:0 0; text-align:center; text-decoration:none; width:100%;" target="_blank"> <div style=" display: flex; flex-direction: row; align-items: center;"> <div style="background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 40px; margin-right: 14px; width: 40px;"></div> <div style="display: flex; flex-direction: column; flex-grow: 1; justify-content: center;"> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; margin-bottom: 6px; width: 100px;"></div> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; width: 60px;"></div></div></div><div style="padding: 19% 0;"></div> <div style="display:block; height:50px; margin:0 auto 12px; width:50px;"><svg width="50px" height="50px" viewBox="0 0 60 60" version="1.1" xmlns="https://www.w3.org/2000/svg" xmlns:xlink="https://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-511.000000, -20.000000)" fill="#000000"><g><path d="M556.869,30.41 C554.814,30.41 553.148,32.076 553.148,34.131 C553.148,36.186 554.814,37.852 556.869,37.852 C558.924,37.852 560.59,36.186 560.59,34.131 C560.59,32.076 558.924,30.41 556.869,30.41 M541,60.657 C535.114,60.657 530.342,55.887 530.342,50 C530.342,44.114 535.114,39.342 541,39.342 C546.887,39.342 551.658,44.114 551.658,50 C551.658,55.887 546.887,60.657 541,60.657 M541,33.886 C532.1,33.886 524.886,41.1 524.886,50 C524.886,58.899 532.1,66.113 541,66.113 C549.9,66.113 557.115,58.899 557.115,50 C557.115,41.1 549.9,33.886 541,33.886 M565.378,62.101 C565.244,65.022 564.756,66.606 564.346,67.663 C563.803,69.06 563.154,70.057 562.106,71.106 C561.058,72.155 560.06,72.803 558.662,73.347 C557.607,73.757 556.021,74.244 553.102,74.378 C549.944,74.521 548.997,74.552 541,74.552 C533.003,74.552 532.056,74.521 528.898,74.378 C525.979,74.244 524.393,73.757 523.338,73.347 C521.94,72.803 520.942,72.155 519.894,71.106 C518.846,70.057 518.197,69.06 517.654,67.663 C517.244,66.606 516.755,65.022 516.623,62.101 C516.479,58.943 516.448,57.996 516.448,50 C516.448,42.003 516.479,41.056 516.623,37.899 C516.755,34.978 517.244,33.391 517.654,32.338 C518.197,30.938 518.846,29.942 519.894,28.894 C520.942,27.846 521.94,27.196 523.338,26.654 C524.393,26.244 525.979,25.756 528.898,25.623 C532.057,25.479 533.004,25.448 541,25.448 C548.997,25.448 549.943,25.479 553.102,25.623 C556.021,25.756 557.607,26.244 558.662,26.654 C560.06,27.196 561.058,27.846 562.106,28.894 C563.154,29.942 563.803,30.938 564.346,32.338 C564.756,33.391 565.244,34.978 565.378,37.899 C565.522,41.056 565.552,42.003 565.552,50 C565.552,57.996 565.522,58.943 565.378,62.101 M570.82,37.631 C570.674,34.438 570.167,32.258 569.425,30.349 C568.659,28.377 567.633,26.702 565.965,25.035 C564.297,23.368 562.623,22.342 560.652,21.575 C558.743,20.834 556.562,20.326 553.369,20.18 C550.169,20.033 549.148,20 541,20 C532.853,20 531.831,20.033 528.631,20.18 C525.438,20.326 523.257,20.834 521.349,21.575 C519.376,22.342 517.703,23.368 516.035,25.035 C514.368,26.702 513.342,28.377 512.574,30.349 C511.834,32.258 511.326,34.438 511.181,37.631 C511.035,40.831 511,41.851 511,50 C511,58.147 511.035,59.17 511.181,62.369 C511.326,65.562 511.834,67.743 512.574,69.651 C513.342,71.625 514.368,73.296 516.035,74.965 C517.703,76.634 519.376,77.658 521.349,78.425 C523.257,79.167 525.438,79.673 528.631,79.82 C531.831,79.965 532.853,80.001 541,80.001 C549.148,80.001 550.169,79.965 553.369,79.82 C556.562,79.673 558.743,79.167 560.652,78.425 C562.623,77.658 564.297,76.634 565.965,74.965 C567.633,73.296 568.659,71.625 569.425,69.651 C570.167,67.743 570.674,65.562 570.82,62.369 C570.966,59.17 571,58.147 571,50 C571,41.851 570.966,40.831 570.82,37.631"></path></g></g></g></svg></div><div style="padding-top: 8px;"> <div style=" color:#3897f0; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:550; line-height:18px;">View this post on Instagram</div></div><div style="padding: 12.5% 0;"></div> <div style="display: flex; flex-direction: row; margin-bottom: 14px; align-items: center;"><div> <div style="background-color: #F4F4F4; border-radius: 50%; height: 12.5px; width: 12.5px; transform: translateX(0px) translateY(7px);"></div> <div style="background-color: #F4F4F4; height: 12.5px; transform: rotate(-45deg) translateX(3px) translateY(1px); width: 12.5px; flex-grow: 0; margin-right: 14px; margin-left: 2px;"></div> <div style="background-color: #F4F4F4; border-radius: 50%; height: 12.5px; width: 12.5px; transform: translateX(9px) translateY(-18px);"></div></div><div style="margin-left: 8px;"> <div style=" background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 20px; width: 20px;"></div> <div style=" width: 0; height: 0; border-top: 2px solid transparent; border-left: 6px solid #f4f4f4; border-bottom: 2px solid transparent; transform: translateX(16px) translateY(-4px) rotate(30deg)"></div></div><div style="margin-left: auto;"> <div style=" width: 0px; border-top: 8px solid #F4F4F4; border-right: 8px solid transparent; transform: translateY(16px);"></div> <div style=" background-color: #F4F4F4; flex-grow: 0; height: 12px; width: 16px; transform: translateY(-4px);"></div> <div style=" width: 0; height: 0; border-top: 8px solid #F4F4F4; border-left: 8px solid transparent; transform: translateY(-4px) translateX(8px);"></div></div></div> <div style="display: flex; flex-direction: column; flex-grow: 1; justify-content: center; margin-bottom: 24px;"> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; margin-bottom: 6px; width: 224px;"></div> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; width: 144px;"></div></div></a><p style=" color:#c9c8cd; font-family:Arial,sans-serif; font-size:14px; line-height:17px; margin-bottom:0; margin-top:8px; overflow:hidden; padding:8px 0 7px; text-align:center; text-overflow:ellipsis; white-space:nowrap;"><a href="https://www.instagram.com/p/CmpwIA0AHvA/?utm_source=ig_embed&amp;utm_campaign=loading" style=" color:#c9c8cd; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:normal; line-height:17px; text-decoration:none;" target="_blank">A post shared by Lucas Oshiro (@lucasseikioshiro)</a></p></div></blockquote> <script async src="//www.instagram.com/embed.js"></script>
