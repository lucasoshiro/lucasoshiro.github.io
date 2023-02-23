---
title: "Raspberry Log"
excerpt: "Utilitário para captura de dados da Raspberry Pi"
author_profile: true
header:
   teaser: "https://www.raspberrypi.org/app/uploads/2011/10/Raspi-PGB001-300x267.png"

lang: en

path-pt_br: "/software/2020-06-06-raspberry_log"

last_modified_at: 2023-02-21

---

GitHub: [https://github.com/lucasoshiro/raspberry-log](https://github.com/lucasoshiro/raspberry-log)

Raspberry Pi usage dada utility. It can measure the following metrics:

- CPU Temperature;
- CPU Usage;
- Power (if it is connect to an INA219 sensor, measuring its own current);
- RAM Usage;
- Download rate;
- Upload rate;
- Disk I/O:
  - read and write count;
  - read and write byte count;
  - time spent on reading and writing on disk;

## 2023 update

It was useful to use in my course conclusion work and some other thing that I
needed do to after it.

But why on earth I wrote a code to parse flags instead of use `argparse`?
