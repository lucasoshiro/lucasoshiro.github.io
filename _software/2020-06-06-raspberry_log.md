---
title: "Raspberry Log"
excerpt: "Utilitário para captura de dados da Raspberry Pi"
author_profile: true
header:
   teaser: "https://www.raspberrypi.org/app/uploads/2011/10/Raspi-PGB001-300x267.png"

lang: pt_br

last_modified_at: 2023-02-21

---

GitHub: [https://github.com/lucasoshiro/raspberry-log](https://github.com/lucasoshiro/raspberry-log)

Utilitário para captura de dados da Raspberry Pi. Pode realizar as seguintes
medições:

- Temperatura da CPU
- Uso de CPU
- Potência (se estiver com um sensor INA219 medindo a própria corrente)
- Uso de RAM
- Taxa de download
- Taxa de upload
- IO em disco:
  - número de leituras e escritas
  - número de bytes lidos e escritos
  - tempo dedicado para leitura/escrita em disco

## 2023 update

Isso foi muito útil no meu TCC e alguns trabalhos posteriores.

Mas por que raios eu estava parseando flags na mão em vez de usar `argparse`?
