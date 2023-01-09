---
title: "PCDisplay"
excerpt: "Display com informações do computador"
author_profile: true
gallery:
  - url: "/assets/images/hardware/2020-06-14-pcdisplay/hostname.jpg"
    "image_path": "/assets/images/hardware/2020-06-14-pcdisplay/hostname.jpg"
    alt: "Hostname/disto"
    title: "Hostname e distro Linux"

  - url: "/assets/images/hardware/2020-06-14-pcdisplay/data.jpg"
    "image_path": "/assets/images/hardware/2020-06-14-pcdisplay/data.jpg"
    alt: "Data/hora"
    title: "Data e hora"

  - url: "/assets/images/hardware/2020-06-14-pcdisplay/cpu.jpg"
    "image_path": "/assets/images/hardware/2020-06-14-pcdisplay/cpu.jpg"
    alt: "CPU"
    title: "Uso de CPU"

  - url: "/assets/images/hardware/2020-06-14-pcdisplay/ram.jpg"
    "image_path": "/assets/images/hardware/2020-06-14-pcdisplay/ram.jpg"
    alt: "RAM"
    title: "Uso de RAM"

  - url: "/assets/images/hardware/2020-06-14-pcdisplay/temperatura.jpg"
    "image_path": "/assets/images/hardware/2020-06-14-pcdisplay/temperatura.jpg"
    alt: "Temperatura"
    title: "Temperatura da CPU"

  - url: "/assets/images/hardware/2020-06-14-pcdisplay/rede.jpg"
    "image_path": "/assets/images/hardware/2020-06-14-pcdisplay/rede.jpg"
    alt: "Vazão de rede"
    title: "Vazão de rede"

  - url: "/assets/images/hardware/2020-06-14-pcdisplay/musica.jpg"
    "image_path": "/assets/images/hardware/2020-06-14-pcdisplay/musica.jpg"
    alt: "Música"
    title: "Música"

last_modified_at: 2021-10-24

header:
   image: /assets/images/hardware/2020-06-14-pcdisplay/cpu.jpg
   teaser: /assets/images/hardware/2020-06-14-pcdisplay/cpu.jpg

lang: pt_br
path-en: /hardware-en/2020-06-14-pcdisplay/

---

Github: [https://github.com/lucasoshiro/pcdisplay](https://github.com/lucasoshiro/pcdisplay)

Este projeto trata-se de um display LCD acoplado ao gabinete de meu computador,
mostrando as seguintes informações:

- Uso de CPU
- Uso de RAM
- Velocidade de download/upload
- Temperatura do processador
- Data e hora
- Hostname e versão do sistema operacional
- Título e artista da faixa em execução

O hardware foi feito com um Arduino Nano junto do display em si. No repositório
está contido o código __host__, feito em Ruby, que centraliza as informações do
computador e as fornece para o Arduino, e o código __guest__, usado pelo Arduino
para controlar o display.

### Fluxo
<pre style="font-size: 10px; font-family: courier">

+-----+           +---------+     Requisição    +------------+
|Botão| --------> | Arduino | ----------------> |     PC     |
+-----+           | (guest) |                   |   (host)   |
                  |         | <---------------- |            |
                  +---------+       Dados       +------------+
                       |
                       |
                       |
                       V
                  +---------+
                  | Display |
                  +---------+
</pre>

As requisições têm o formato `REQUISIÇÃO <argumentoss>`, com cada argumento
separado por espaço. O argumento também pode vir entre aspas, podendo ser
escapado da mesma forma que no bash. As respostas são enviadas no formato
`REQUISIÇÃO <dados>`, com o mesmo nome da requisição.

### PCDisplay Host

O PCDisplay host é executado no computador e envia os dados ao Arduino. Ele é
composto pelos seguintes arquivos:

- `arduino_serial.rb`: contém a classe Arduino, que abstrai a biblioteca
  SerialPort, para facilitar a comunicação com o Arduino;

- `serial_server.rb`: biblioteca que permite a criação de um servidor capaz de
  processar uma requisição feita pelo Arduino, e enviar os dados requeridos, com
  sintaxe semelhante ao framework Sinatra;

- `pc.rb`: contém a classe Singleton `PC`, que centraliza as diversas leituras
  do computador, provendo sempre de forma rápida os dados. Cada "leitor" é
  executado em uma thread diferente, atualizando os dados do singleton `PC`
  conforme os dados são obtidos;

- `main.rb`: neste arquivo são definidas os callbacks para cada requisição, no
  seguinte formato:

~~~ruby
request 'REQUISIÇÃO' do
   dado = algum_processamento
   "REQUISIÇÃO #{dado}"
end
~~~


Ou seja, o fluxo é o seguinte:

<pre style="font-size: 10px; font-family: courier">


+-------+   Requisição   +------------+      +--------+
|       | -------------> |SerialServer| ---> |        |
|Arduino|                +------------+      |callback|
|       | <--------------------------------- |        |
+-------+             Dados                  +--------+
                                                  ^
                                                  |
                                            +------------+        +--------+
                                            |            | <----- | Player |
                                            |     PC     |        +--------+
                                            |            |
                                            +------------+ <----- +--------+
                                            ^ ^   ^   ^ ^         |  Rede  |
                                            | |   |   | |         +--------+
                                      +-----+ | +---+ | +----+
                                      | CPU | | |RAM| | |Hora|
                                      +-----+ | +---+ | +----+
                                              |       |
                                         +--------+  +-----------+
                                         |Hostname|  |Temperatura|
                                         +--------+  +-----------+


</pre>

### PCDisplay Guest

O PCDisplay Guest é executado no Arduino, e ele funciona como uma máquina de
estados:

<pre style="font-size: 10px; font-family: courier">

+---------+         +------+          +-----+
| SYSINFO | ------> | TIME | -------> | CPU |
+---------+         +------+          +-----+
     ^                                    |
     |                                    V
+-------+     +-----+      +------+     +-----+
| MEDIA | <-- | NET | <--- | TEMP | <-- | RAM |
+-------+     +-----+      +------+     +-----+

</pre>

Cada estado tem uma função de atualização da tela associada, que lê as
informações contidas na struct global `INFO`, e as mostra na tela.

O loop principal realiza um ciclo das seguintes ações:

1. Caso uma troca de estado esteja agendada, troca de estado, senão permanece no
   atual;

2. Envia uma requisição das listas de requisições;

3. Espera o resultado e atualiza a struct `INFO` com os dados vindos do
   computador. Caso exceda o limite de tempo, entende-se a conexão foi perdida e
   tenta-se conectar novamente;

4. Mostra a informação na tela, executando-se a função associada ao estado.

O agendamento de uma troca de estado ocorre quando o botão é pressionado. Esse
evento causa uma interrupção, ativando uma flag que indica que no próximo ciclo
o estado deverá ser trocado.


### Galeria
{% include gallery caption="Galeria" %}


### Update (10/2021)

Depois de algum tempo, o display tinha dado problema e eu resolvi trocar por um
novo, gráfico, de 128x64 pixels. Nesse novo display é possível mostrar todas as
informações em uma só tela, não é necessário mais usar a máquina de estados.

Quanto ao resto do código, permanece igual.

<div class="img-container">
  <figure>
    <img class="large" src="{{ site.baseurl }}/assets/images/hardware/2020-06-14-pcdisplay/128.jpg">
    <figcaption>Display gráfico, com informações de rede, CPU, memória, temperatura e música</figcaption>
  </figure>
</div>
