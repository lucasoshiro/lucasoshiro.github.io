---
layout: single
author_profile: no
lang: en
title: "Detailed resumé"

path-pt_br: /cv-en
---

This page contains is a detailed resumé. My intention here is to provide a
deeper description of my experiences and skills, without the restrictions of a
2-page resumé, LinkedIn, GitHub, ORCID and so on. Here, I'm not only listing
also describing them, how important they are and providing examples.

## Personal Info

- Birth: 1996
- Location: São Paulo, Brazil
- Citizenship: Brazilian and Portuguese
- Gender: Male

## Academic overview

### Studying for a [master's degree in Computer Science](https://www.ime.usp.br/pos-computacao/)
- Where: [University of São Paulo](https://usp.br)
- When: 2022-present

#### Research highlights
- Developed [GridGooseSV](https://github.com/lucasoshiro/GridGooseSV/), a ns-3 module for simulating the protocols SV and GOOSE
- Wrote a survey paper about Smart Grids communication simulators
- Wrote a paper describing GridGooseSV

#### Selected subjects and tasks
- Database systems: focused on DB foundations: storage, indexing, query
      processing and optimization, concurrency control, crash recovery
- Network programming: focused on learning each layer of the TCP/IP model; wrote
      a RabbitMQ-like [message broker](/software-en/2023-03-09-amqp_broker/) by
      implementing AMQP from scratch
- Languages and automata: focused on language theory, automata, Turing
      machines, regular expressions and context-free grammars

#### Extra activities
- [Hardware Livre](https://hardwarelivreusp.org): extension group focused on open-source hardware
- LIFT: extension group focused on functional programming languages

### [Bachelor in Computer Science](https://bcc.ime.usp.br/)
- Where: [University of São Paulo](https://usp.br)
- When: 2015-2019

#### Selected subjects and tasks
- Network programming: focused on learning each layer of the TCP/IP
      model; wrote an e-mail server by implementing IMAP from scratch
- Database laboratory: focused on SQL/NoSQL practices; developed a
      platform for restaurant queues
- Agile methods laboratory: focused on Agile practices; integrated a
      vote analysis tool with the Brazilian chamber of deputies API
- Algorithm analysis: time and space complexity, algorithm design
      paradigms, dynamic programming, greedy algorithms
- Graph algorithms: connectivity, strongly connected graphs, vertex
      coloring and other concepts about graphs and their main algorithms

#### Extra activities
- [FLUSP](https://flusp.ime.usp.br): extension group focused on contributions to open-source projects
- [Hardware Livre](https://hardwarelivreusp.org): extension group focused on open-source hardware

### [Technologist in Systems Analysis and Development](https://www.cps.sp.gov.br/cursos-fatec/analise-e-desenvolvimento-de-sistemas/)
- Where: [Fatec São Paulo](https://www.fatecsp.br/)
- When: 2014, unfinished

## Professional overview

### [Google Summer of Code](https://summerofcode.withgoogle.com/)

Google Summer of Code (aka GSoC) is a Mentoring program sponsored by Google for
introducing new contributors to open-source projects

#### 2025: Contributor to the [Git source code](https://git-scm.com/)
- Wrote the new built-in Git command `git repo`
- Worked with the Git development community, especially the GitLab Git team
- More information in my [GSoC blog](/gsoc-en/)

### [FAPESP](https://fapesp.br/)
The São Paulo Research Foundation

#### 2024-2025: [TT-IV Technical Researcher](https://fapesp.br/bolsas/tt)

- Developed a module (called [GridGooseSV](https://github.com/lucasoshiro/GridGooseSV/))
  for the network simulator [`ns-3`](https://www.nsnam.org) for
  implementing the protocols SV and GOOSE.
- Wrote two papers on simulating communications in Smart Grids

### [IME-USP](https://www.ime.usp.br/)
Institute of Mathematics and Statistics of University of São Paulo

#### 2024: Lecturer
- Gave a 12h course about OpenSCAD, a functional programming language
  targeted for modelling objects for 3D printing

#### 2023-2024: Teaching assistant

- Programming Techniques I: evaluated tasks and helped students with
  Assembly language, shell scripts and build tools

- Operating Systems: evaluated tasks and helped students with OS-related
  content, such as parallel and concurrent programming, memory management,
  process scheduling and file storage

### [Loggi](https://www.loggi.com/)
Loggi is a Brazilian logistics unicorn

#### 2020-2021: Software Engineer I / II

- Increased the coverage of the tests of the API endpoints
- Maintained the geocoding microservice (Kotlin/Micronaut)
- Developed internal tools for inspecting geocoded addresses using the Google
  Maps API, a PostgreSQL database, a Redshift data warehouse and logs
  indexed by Elasticsearch
- Integrated several internal micro-services (based on Kotlin/Micronaut,
  Kotlin/Camel and Python/Django) with the geocoding service
- Added special strategies for resolving addresses with different address
  formats
- Added charset detection for incoming data in the EDI service
- Presented lectures about Git, Jupyter and Pandas
- Wrote design docs for new features

#### 2020: Software Engineer Trainee
- Improved the stability of the Python/Django back-end

## Technical Skills

Here I classify my technical skills freely following the
[Dreyfus model](https://en.wikipedia.org/wiki/Dreyfus_model_of_skill_acquisition):

- **Novice**: I already worked with that skill, but I still don't have
  independence and need help from other people, from documentation, from online
  resources and so on;

- **Advanced beginner**: I have some independence and can perform simpler tasks
  without help, but I still need help (asking other people or trying to study by
  myself) to do more complex tasks;

- **Competent**: I am mostly independent, I can troubleshoot, I can solve
  problems, I can make technical decisions and I can plan tasks that depend on
  that skill. However, I still need guidance on special situations and I'm still
  mostly guided some patterns and recipes;

- **Proficient**: I'm independent on performing tasks that involves that skill
  and I don't need to follow patterns or guidance. If there's no expert in my
  team, probably I will be one of the people that my colleagues will ask for
  help;

- **Expert**: I deeply understand that skill, I'm was a reference in that skill
  in places that I worked and, sometimes, outside them.

Here I'm not only listing thoses skills, but explaning when and how I used them,
sometimes with examples.

### Programming languages

- **Python** (Proficient): my swiss-knife language.
 
- **C** (Proficient): the language that I used the most during my
  undergratuation;

- **OpenSCAD** (Proficient): OpenSCAD is my main tool for modeling objects for
  3D printing, for example, [this Braille generator](https://www.thingiverse.com/thing:6463849).
  I gave [a course divided in 6 classes](https://lucasoshiro.github.io/posts-en/2024-03-24-openscad/),
  probably the first one on this subject in Portuguese;

- **Kotlin** (Competent): my main language when working at
  [Loggi](https://www.loggi.com/), where I was in the team responsible for the
  geocoding microservice;

- **Java** (Competent): I used Java mainly for studying Algorithms and Data
  Structures through the [Sedgewick book](https://algs4.cs.princeton.edu/home/);

- **Ruby** (Competent): language that I use for automating tasks when the
  limitations of Bash become a limitation. I described its adavantages for that
  purpose [in this blogpost](https://lucasoshiro.github.io/posts-en/2024-06-17-ruby-shellscript/),
  that was disseminated by the creator of the language;

- **Bash** (Competent): At [Loggi](https://www.loggi.com/), I used Bash for
  writing Git hooks, at [GSoCC](https://summerofcode.withgoogle.com/) I used it
  for writing unit tests (Git uses its own test suite written in Bash). I also
  use Bash scripts for automating simple tasks in Linux or Bash;

- **C++** (Competent): During my master's research I needed to deal with the
  ns-3 network simulator codebase and write an
  [external module](https://github.com/lucasoshiro/GridGooseSV) for it.
  I also contributed to Marlin, a 3D printer firmware written in C++. My
  contributions for Marlin are listed [here](/floss-en/2020-06-30-Marlin/).

- **Lua** (Competent): I learned Lua for a subject at my University where we
  needed to develop a game for Android. I and my team developed a
  [brick breaker](https://github.com/lucasoshiro/AnotherBrick) using Lua and
  Löve2D. I also used Lua for implementing the algorithms from the 
  [CLRS book](https://en.wikipedia.org/wiki/Introduction_to_Algorithms), since
  Lua is 1-indexed.

- **Haskell** (Competent): my favorite programming language, even though I'm not a
  specialist in it. I only used it in side projects, such my 
  [own rewrite of Git](https://github.com/lucasoshiro/oshit);

- **x86-64 assembly** (Advanced beginner): I was a teaching assistant in a
  [subject](https://uspdigital.usp.br/jupiterweb/obterDisciplina?nomdis=&sgldis=mac0216)
  which covered x86-64 assembly using NASM syntax. I needed then to learn the
  basics of the languages to help the students;

- **JavaScript** (Advanced beginner): a language that I know only learn the
  subset that I need for what I'm working on;

- **LISP family** (Advanced beginner): most used for my Emacs configuration in
  Elisp, even though I played with Hy and Scheme. I understand the idea of this
  familiy of languages and I have experience with functional programming, so
  I'll probably learn quickly another language of this family, such as Clojure
  or Common Lisp, if I need;

### Code management

- **Git** (Expert): Git is the tool that I most deeply understand. I contributed
  to its [source code](/floss-en/2025-03-02-git/),
  wrote some blog posts about it, like 
  [this](https://lucasoshiro.github.io/posts-en/2023-02-13-git-debug/),
  [this](https://lucasoshiro.github.io/posts-en/2022-03-12-merge-submodule/) and
  [this](https://lucasoshiro.github.io/posts-en/2024-04-08-please_dont_squash/),
  translated to Portuguese the chapter about
  [its internals](https://lucasoshiro.github.io/floss-en/2021-09-18-pro_git/)
  from the official book and also rewrote a
  [subset of Git in Haskell](https://github.com/lucasoshiro/oshit) compatible
  with the official implementation. I also developed part of Git's source code
  in [GSoC](#google-summer-of-code), where I added a new subcommand to it;

- **GitHub actions** (Advanced beginner): Even though I worked with projects
  that used other CI tools (e.g. Travis CI and CircleCI), GitHub actions is the
  only one that configured from scratch. One example of code base that I used GH
  actions was the [ns-3 module](https://github.com/lucasoshiro/GridGooseSV/actions)
  that I developed during my master's research, using multiplatform tests.

### Infrastructure

- **Linux** (Proficient): I'm a daily user of Linux since 2014, and it is one of
  my main interests as a tech professional. In 2019 I was part of
  [FLUSP](https://lucasoshiro.github.io/floss-en/2020-06-06-kernel_linux/), a
  group of students who contributed to the Linux kernel, where I could sent some
  patches (listed
  [here](https://lucasoshiro.github.io/floss-en/2020-06-06-kernel_linux/)). I
  also attended two conferences on Linux:
  [DebConf19](https://debconf19.debconf.org/) and
  [LinuxDev-BR 2019](https://www.collabora.com/news-and-blog/news-and-events/linux-developer-conference-brazil-2019.html);

- **Docker** (Proficient): I've been using Docker since 2017, for
    reproducibility purposes (for University tasks), for running microservices
    locally (mainly at [Loggi](https://www.loggi.com/)).

- **Kubernetes** (Novice): At [Loggi](https://www.loggi.com/), our microservices
    were orchestrated by Kubernetes, which I started to learn.

- **AWS** (Novice): At [Loggi](https://www.loggi.com/) we used AWS as one of our
  clouds and I needed to deal directly with S3. I also completed the AWS Cloud
  Foundations course ([badge here](https://www.credly.com/badges/61b80dfe-66db-4afa-9225-a8231c8efc27/linked_in_profile)).

### Frameworks

- **Django** (Competent): I worked with Django during my undergration and while
  I was working at [Loggi](https://www.loggi.com/). At Loggi, I wasn't in a team
  that was directly responsible of a Django-based application, however, given
  the horizontality of my team I needed to deal with Django-based apps from
  several other teams at that company;

- **Micronaut** (Competent): At [Loggi](https://www.loggi.com/), our JVM-based
    microservices were mainly written using the Micronaut framework using
    gRPC/Protocol Buffers as protocols.

- **ns-3** (Competent): During my master's research, I needed to simulate
    IEC61850 protocols for Smart Grids, however, there wasn't any network
    simulator for that, which made me write a module for the network simulator
    [ns-3](https://www.nsnam.org/). The source code of this module is available
    [here](https://github.com/lucasoshiro/GridGooseSV).

- **Löve2D** (Advanced beginner): I used Löve 2D at the university for
    developing an [Android game](https://github.com/lucasoshiro/AnotherBrick);

- **Rails** (Advanced beginner): During my CS course I needed to write a SaaS
    for controlling the attendance of grad students in seminars. I also attended
    a Hackathon in 2017 ([HackathonUSP 2017](https://hackathonusp2017.devpost.com/))
    where my team developed a [SaaS in Rails](https://devpost.com/software/proton-audbpr)
    for connecting students and professors interested in scholarships.

- **Native Android** (Advanced beginner): During by CS course I attended a
    mobile development subject, where I needed to write an Android app using
    Java and the Android SDK. I also wrote an Android app that gets the user's
    geolocation and displays it as coordinates of a street atlas of São Paulo
    (source availabe [here](https://github.com/lucasoshiro/MapoGPSAndroid),
    description [here](https://github.com/lucasoshiro/MapoGPSAndroid))

- **React** (Novice): I only learned the basics of React when I was working at
    [Loggi](https://www.loggi.com/).

### Data science and analysis

- **Pandas** (Proficient): My swiss knife tool for data analisys. At
    [Loggi](https://www.loggi.com/) I used it to join data from databases
    (PostgreSQL and Amazon Redshift), Elasticsearch and external APIs for
    analisys and internal tools. I also used Pandas for general data analisys in
    academical purposes.

- **Jupyter** (Proficient): Jupyter Notebook is an essential tool for data
  analysis. Since I use Pandas intensively, I also use Jupyter as the
  environment for usint it. I also have contributed to
  [Jupyter Notebook](https://github.com/jupyter/notebook/pull/3535).

- **SQL** (Competent): At [Loggi](https://www.loggi.com/), I needed to use SQL
  for retrieving data from PostgreSQL and from Redshift. At the University, I
  had three subjects focused on databases, which, of course, needed SQL
  
- **TensorFlow** (Novice): During my master's I attended to Deep Learning
  classes. We were free to choose the tools, and I chose TensorFlow.

### Testing

- **JUnit**: I used JUnit at [Loggi](https://www.loggi.com/), for testing the
  Kotlin/JVM microservices;

- **PyTest**: I used PyTest at [Loggi](https://www.loggi.com/), for testing the
    Python microservices;

- **Git test suite**: [Git](https://git-scm.com) uses its own test suite,
  written in shell scripts. I needed to use it when contributing to its source
  code;

- **ns-3 test suite**: [ns-3](https://www.nsnam.org/) uses its own test suite,
  written in C++. I used it in my master's when developing
  [GridGooseSV](https://github.com/lucasoshiro/GridGooseSV/);

### General knowledge

- **Functional programming** (Competent): I have experience with functional
  programming in personal projects, but it is a subject that I'm really
  interested. I learned Haskell, a little bit of some Lisp flavours, and I
  understand a little about Category Theory and Lambda Calculus;

- **Algorithms and Data Structures** (Competent): I had several classes about
  Algorithms and Data Structures at the university

- **Electronics** (Advanced beginner): I never oficially studied electronics,
  but I'm interested in this topic. I assembled
  [my own 3D printer](https://lucasoshiro.github.io/hardware-en/2020-06-14-3d_printer/)
  at home and sometimes I like to fix old equipments, even if I need to spend time
  learning more about this subject;

- **Language and automata theory** (Advanced beginner): I attended to classes on
  the subject during my master's, following the
  [Sipser book](https://www.amazon.com.br/Introduction-Theory-Computation-Michael-Sipser/dp/113318779X).
  I also have contributed to a
  [Python library of context-free grammars](https://github.com/mahdavipanah/pyCFG/pull/3);

- **Category Theory** (Novice): this is a more abstract topic on Math, that I
  started to be interested after learning Haskell, which is a language based on
  its principles. Learning its basics allowed me to have a more abstract and
  higher-level perspective on programming;
  
- **Lambda calculus** (Novice): another abstract Math topic that I started to be
  interested after learning functional programming. I wrote a
  [quicksort using only lambda calculus](https://lucasoshiro.github.io/software-en/2020-06-06-lambdasort/).

- **Optimization** (Novice): I have attended classes about 
   [Linear Optimization](https://uspdigital.usp.br/jupiterweb/obterDisciplina?sgldis=MAP2315&verdis=1)
   at the university;

## Soft skills

- **Technical writing**:

- **Teaching**:

- **Resiliency**:

- **Problem solving**:

- **Ownership**:


## Languages

- **Portuguese**: Native

- **English**: Comprehends well, speaks well, reads well, writes well. All my
  writings in my master's were in English, and I attended to weekly 1:1 meetings
  during [GSoC](#google-summer-of-code)

- **Spanish**: Comprehends reasonably, speaks little, reads reasonably, writes
  little. I had Spanish classes in middle school, but I haven't practiced it
  since them. However, I can read and understand it due to its high simlarity
  with Portuguese

## Academic writings

- [Análise Preliminar da Detecção de Ataques Ofuscados e do Uso de Hardware de Baixo Custo em um Sistema para Detecção de Ameaças](https://sol.sbc.org.br/index.php/sbrc_estendido/article/view/7792)

## Awards

- **Honorable mention** in Simpósio Brasileiro de Redes de Computadores 2019 for
  the paper "Análise Preliminar da Detecção de Ataques Ofuscados e do Uso de
  Hardware de Baixo Custo em um Sistema para Detecção de Ameaças"

- **Honorable mention** in HackathonUSP 2017.1: A [platform](https://hackathon.ime.usp.br/)
  that gives statistics about USP alumni
  
- **3rd place** in HackathonUSP 2017.1: [Proton](https://devpost.com/software/proton-audbpr), a platform for
  finding students and professors interested in undergraduate research.

