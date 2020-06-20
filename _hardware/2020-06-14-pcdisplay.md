---
title: "PCDisplay"
excerpt: "Display com informações do computador"
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
