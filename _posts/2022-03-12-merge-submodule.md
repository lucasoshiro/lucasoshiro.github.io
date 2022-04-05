---
title: "Git: merge com submódulos"
excerpt: "Post explicando como o git-merge lida com submódulos"

header:
  image: /assets/images/posts/2022-03-12-merge-submodule/conflito_submodulo.svg
  teaser: /assets/images/posts/2022-03-12-merge-submodule/conflito_submodulo.svg
---

Se você lida com um projeto versionado com o Git e que usa submódulos, talvez
você já tenha passado por uma situação em que precisou alterar um submódulo em
uma _branch_, e precisou fazer o _merge_ dessa _branch_ em outra.

Por exemplo, supondo que a estrutura do seu projeto seja esta a seguir, com dois
arquivos Python (sendo um dentro de um subdiretório) e um diretório contendo uma
biblioteca. Neste exemplo, essa biblioteca **não** é um diretório "copiado" para
dentro do projeto, e sim um projeto separado mas que é incluído aqui através de
um submódulo:

~~~bash
$ tree 

├── algum_arquivo.py
├── algum_diretorio
│   └── outro_arquivo.py
└── biblioteca_que_fica_em_submodulo
│   └── arquivo_da_biblioteca.py
└── .gitmodules
~~~

Como essa biblioteca é incluída via submódulo, sua versão ficará **fixada** em
um _commit_ até que alguém explicitamente a mude. Isso pode ser feito, por
exemplo, da seguinte forma:

~~~bash
$ git -C biblioteca_que_fica_em_submodulo fetch
$ git -C biblioteca_que_fica_em_submodulo checkout <commit da versão nova>
$ git add biblioteca_que_fica_em_submodulo
$ git commit
~~~

Caso você tenha feito isso em uma _branch_ sua e queira que essa alteração entre
em outra _branch_, provavelmente você fará um _merge_.  Supondo que essa outra
_branch_ seja a `main` e a sua seja chamada `pr-branch`:

~~~bash
$ git checkout main
$ git merge pr-branch
~~~

O grafo de _commits_ ficaria assim, com as setas pontilhadas apontando para as
versões dos submódulos:

<div class="img-container">
  <figure>
    <img class="large" src="{{ site.baseurl }}/assets/images/posts/2022-03-12-merge-submodule/merge_duvida.svg">
    <figcaption>Grafo de <i>commits</i></figcaption>
  </figure>
</div>

Como a imagem mostra, queremos saber **para qual _commit_** do submódulo o
_commit_ de _merge_ vai apontar.

Caso a `main` **não** tenha tido nenhuma alteração no submódulo enquanto você
desenvolvia a `pr-branch`, o _merge_ ocorre do jeito esperado e a
biblioteca fica na versão nova. Caso contrário, o comportamento não é tão
trivial: 

- pode ser que a versão que esteja na `main` permaneça;
- pode ser que a que esteja na `pr-branch` permaneça;
- pode ser que aconteça um conflito que o Git não consiga resolver
  automaticamente sem intervenção de alguém.

A partir desse ponto, não encontrei algum material que explicasse de forma
completa qual é o comportamento do Git nesses casos. Para entender o que
acontece, precisei ir mais a fundo no Git, inclusive lendo o código fonte, e
então resolvi escrever este post :-).

## Breve explicação sobre objetos

Caso você já tenha familiaridade com o funcionamento dos objetos no Git, pode
pular para a próxima seção. Aqui não é meu objetivo explicar a fundo como eles
funcionam, só o que precisamos para entender o _merge_ e os submódulos.

Então, caso você não tenha familiaridade com o funcionamento interno do Git,
sugiro fortemente as seções 1.3 "What is Git?", 10.2 "Git Objects" e 10.3 "Git
References" do livro Pro Git, disponível gratuitamente em vários formatos em
[https://git-scm.com/book/en/v2](https://git-scm.com/book/en/v2).

Um tl;dr rápido com o que precisamos: os dados de um repositório (por
"repositório" entenda o repositório **local** em cada máquina) é armazenado em
unidades chamadas **objetos**. Esta é uma representação gráfica bem básica de
como os objetos se relacionam entre si:

<div class="img-container">
  <figure>
    <img class="large" src="{{ site.baseurl }}/assets/images/posts/2022-03-12-merge-submodule/objetos.svg">
    <figcaption>Objetos <i>blob</i>, <i>commit</i> e <i>tree</i>, e <i>branch</i></figcaption>
  </figure>
</div>


Um tipo de objeto é o nosso velho conhecido _commit_. Cada _commit_ guarda o
estado de todo o projeto no momento em que foi feito (e não apenas as
alterações). Esse estado é chamado de _snapshot_, e pode ser entendido como uma
"fotografia" do projeto naquele momento.

Outros tipos de objetos são _tree_ e _blob_. Uma _tree_ representa o estado de
um diretório, sendo uma listagem de seus conteúdos: outros diretórios filhos
(cada um com seu conteúdo representado por uma _tree_), ou arquivos (cada um com
seu conteúdo representado por um _blob_).

Cada _commit_ aponta para a _tree_ que representa a raiz do projeto no estado
que o _commit_ guarda.

Cada _commit_ aponta para seu(s) _commit(s)_ pai(s), se houver:
- Um _commit_ inicial não tem pai;
- Um _commit_ comum tem apenas um pai;
- Um _commit_ de _merge_ tem dois ou mais pais, apontando para quais _commits_
  foram mesclados para que este _commit_ fosse criado. Normalmente fazemos
  _merge_ de apenas uma _branch_ em outra, logo, o _commit_ resultante
  normalmente tem dois pais.

Todo objeto é identificado por seu _hash_ SHA-1. Objetos são **únicos** e
**imutáveis**. Isso significa, por exemplo, que:
- dois arquivos iguais são representados pelo mesmo _blob_;
- dois diretórios iguais são representados pela mesma _tree_;
- um arquivo que tem o mesmo conteúdo em _commits_ distintos é
  representado pelo mesmo _blob_ em ambos;
- um arquivo que tem conteúdos diferentes em _commits_ distintos é representado
  por _blobs_ diferentes uns dos outros em cada um dos _commits_.

Uma _branch_ não é um objeto. Ela é apenas uma referência, um ponteiro para um
_commit_. Internamente, ela é simplesmente um arquivo com o _hash_ de um
_commit_ dentro.

## Breve explicação sobre _merge_

### _Fast-forward_

Ainda no mesmo exemplo, quando fizemos `git merge pr-branch`, podemos ter
uma situação que a `pr-branch` aponta para um _commit_ **descendente** do
_commit_ que `main` aponta. Nesse caso, por padrão o Git não faz um _merge_
verdadeiro, e sim um _fast-forward_. Isso significa que o Git simplesmente vai
alterar a `main` para que aponte para o mesmo _commit_ que a
`pr-branch`.

Ilustrando como isso acontece, a situação antes do _fast-forward_ era esta, com
o grafo azul representando os _commits_ do projeto, e o vermelho representando os
_commits_ do submódulo:

<div class="img-container">
  <figure>
    <img class="large" src="{{ site.baseurl }}/assets/images/posts/2022-03-12-merge-submodule/ff-antes.svg">
    <figcaption>Grafo de <i>commits</i> antes do <i>fast-forward</i></figcaption>
  </figure>
</div>

Depois do _fast-forward_:

<div class="img-container">
  <figure>
    <img class="large" src="{{ site.baseurl }}/assets/images/posts/2022-03-12-merge-submodule/ff-depois.svg">
    <figcaption>Grafo de <i>commits</i> do <i>fast-forward</i></figcaption>
  </figure>
</div>

Esse caso dispensa mais explicações quanto ao ponto principal do post, já que,
obviamente, a biblioteca estará na mesma versão que a `pr_branch` após o
_fast-forward_, já que a `main` passa a apontar para o mesmo _commit_ que
`pr-branch`.

### _Merge_ verdadeiro

Um _merge_ verdadeiro ocorre caso o _commit_ que `pr_branch` aponta não
seja descendente do _commit_ que `main` aponta, sendo então criado o _commit_
com dois pais que mencionei anteriormente. Esse comportamento também pode ser
forçado mesmo quando é possível um _fast-forward_, usando a _flag_ `--no-ff`.

O `git merge` pode ter comportamentos distintos de acordo com a estratégia
escolhida. Por padrão nas versões mais novas do Git a estratégia usada é a
`ort`. Em versões um pouco mais antigas, a estretégia padrão é a `recursive`.

Este post irá abordar a partir daqui, o comportamento da `ort`. Porém, o que for
abordado também vale para a `recursive`, mas não para as outras.

### _Three-way merge_

A decisão sobre o que deve ser escolhido para entrar no _commit_ de merge é
feita por um algoritmo chamado _three-way merge_. Esse algoritmo se baseia em
três _commits_: os dois _commits_ apontados pelas _branches_ que queremos fazer
o _merge_, e o melhor ancestral comum desses dois _commits_.

Por "melhor ancestral comum" entre dois _commits_, entenda: um ancestral comum
de dois _commits_ X é melhor que outro ancestral comum Y se X for descendente de
Y. O "melhor de todos" é o que será usado. Mais informações na 
[manpage do git merge-base](https://git-scm.com/docs/git-merge-base).

Nos três exemplos a seguir, o "melhor ancestral comum" das _branches_ A e B é o
_commit_ amarelo:

<div class="img-container">
  <figure>
    <img class="large" src="{{ site.baseurl }}/assets/images/posts/2022-03-12-merge-submodule/merge_base.svg">
    <figcaption>Melhores ancestrais comuns</figcaption>
  </figure>
</div>

Vamos denotar por A e B os dois _commits_ apontados pelas _branches_ que
queremos fazer o _merge_, e por O o melhor ancestral comum a eles dois. Um
arquivo poderá, então, ter até três versões diferentes, uma em A, uma em B e
outra em O.

Para tomar a decisão de qual será usada, o _three-way merge_ faz a seguinte regra:
- Se o arquivo tem o mesmo conteúdo em A e em B, no _commit_ de merge ele terá esse conteúdo;
- Caso contrário:
  - Se o arquivo tem o mesmo conteúdo em A e em O, no _commit_ de merge ele terá
    o conteúdo de B;
  - Se o arquivo tem o mesmo conteúdo em B e em O, no _commit_ de merge ele terá
    o conteúdo de A;
- Caso contrário (o arquivo tem conteúdos distintos entre si em A, B e O): **conflito**.

Podemos ver isso na imagem a seguir. As bolinhas representam conteúdos
diferentes do mesmo arquivo ao longo dos _commits_.

<div class="img-container">
  <figure>
    <img class="large" src="{{ site.baseurl }}/assets/images/posts/2022-03-12-merge-submodule/3-way-merge.svg">
    <figcaption><i> Three-way merge</i></figcaption>
  </figure>
</div>

A comparação entre os estados não é feita usando o arquivo inteiro: o Git
compara o _hash_ dos _blobs_ em cada um dos estados, o que é suficiente pra
dizer se eles são iguais ou não (lembrando: caso o arquivo seja igual em
_commits_ diferentes, ele é representado pelo mesmo _blob_).

Caso haja um conflito e o arquivo for um arquivo de texto puro, o Git por padrão
ainda faz o _three-way merge_ internamente no conteúdo. Dessa forma, por
exemplo, se a mudança de O para A seja em um local distinto de O pra B dentro do
arquivo, ambas são preservadas. Caso elas tenham sido feitas no mesmo local, o
Git adiciona as marcas de conflito para que sejam resolvidas pelo usuário
(aquelas `<<<<<<<`, `=======` e `>>>>>>>`).

Arquivos binários não são resolvidos, o usuário deverá escolher qual versão que
deverá ser usada no _commit_ de merge.

## Breve explicação sobre submódulos

Bom, se você chegou até aqui, provavelmente não precisa de uma introdução aos
submódulos. Mas ainda assim, vale a pena mostrar como eles são representados
internamente.

Vimos que cada _tree_ representa o conteúdo de um diretório. Com o comando
`git ls-tree` podemos ver o conteúdo de uma _tree_ . Se fizermos
`git ls-tree HEAD` podemos verificar o conteúdo da `tree` do _commit_ atual.
No nosso exemplo, seria algo parecido com isso:

~~~bash
$ git ls-tree HEAD
100644 blob 123abc456def123abc456def123abc456def9999 .gitmodules
100644 blob 1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1234 algum_arquivo.py
040000 tree aaaaabbbbbcccccdddddeeeeefffff1111122222 algum_diretorio
160000 commit fedcba0123456789fedcba012345678912345678 biblioteca_que_fica_em_submodulo
~~~

Os _hashes_ nas linhas do `algum_arquivo.py` e do `.gitmodules` indicam os
_blobs_ que armazenam seus respectivos conteúdos, e da mesma forma, o _hash_ na
linha de `algum_diretorio` indica a _tree_ que armazena o conteúdo desse
diretório.

Porém, na linha da `biblioteca_que_fica_em_submodulo`, o _hash_ que aparece é
justamente o _hash_ do _commit_ do submódulo referente à versão atual da
biblioteca. Caso seja feita uma alteração da versão dessa biblioteca, esse _hash_
muda, consequentemente a _tree_ que representa o diretório raiz do projeto será
outro objeto, ou seja, será outro _snapshot_.

Ilustrando isso, os submódulos ficam assim:

<div class="img-container">
  <figure>
    <img class="large" src="{{ site.baseurl }}/assets/images/posts/2022-03-12-merge-submodule/objetos_submodulo.svg">
    <figcaption>Submódulos dentro do grafo dos objetos</figcaption>
  </figure>
</div>

Além disso, ainda temos o arquivo `.gitmodules`, que armazena propriedades dos
submódulos, como, por exemplo, seu diretório (`path`) e a URL do repositório de
onde ele é clonado (`url`). Mais informações sobre o `.gitmodules` estão na sua
[manpage](https://git-scm.com/docs/gitmodules).

## _Three-way merge_ de submódulos

O _three-way merge_ ainda valerá se fizermos o _merge_ de _commits_ que tenham
submódulos. E o mecanismo é o mesmo que serviria para fazer o _three-way merge_
de arquivos, porém, em vez de comparar _hashes_ de _blobs_, comparamos _hashes_
de _commits_ do submódulo:

- Se o submódulo aponta para o mesmo _commit_ em A e B, esse _commit_ será usado
  no _commit_ de merge;
- Caso contrário:
  - Se o submódulo aponta para o mesmo _commit_ em A e em O, o _commit_ para que
    ele aponta em B será usado no _commit_ de merge;
  - Se o submódulo aponta para o mesmo _commit_ em B e em O, o _commit_ para que
    ele aponta em A será usado no _commit_ de merge;
- Caso contrário (o submódulo aponta para _commits_ distintos em A, B e O): **conflito**.

Tudo tranquilo até aqui, mas o que acontece quando temos um conflito...

## Resolução de conflitos de submódulos

Caso haja um conflito entre submódulos, dependendo da situação o Git tenta
resolver automaticamente: caso o _commit_ do submódulo em A seja descendente do
_commit_ do submódulo em B, o _commit_ do submódulo em A será usado. O contrário
também vale: caso o _commit_ do submódulo em B seja descendente do _commit_ do
submódulo em A, o _commit_ do submódulo em B será usado. Esse comportamento você
pode ver
[aqui, no código-fonte do Git](https://github.com/git/git/blob/c2162907e9aa884bdb70208389cb99b181620d51/merge-ort.c#L1653-L1669).
Em outras palavras, é feito um _fast-forward_ no submódulo.

Graficamente, a situação antes era esta:

<div class="img-container">
  <figure>
    <img class="large" src="{{ site.baseurl }}/assets/images/posts/2022-03-12-merge-submodule/ff-submodulo-antes.svg">
    <figcaption><i> Fast-forward </i> de submódulos antes do merge</figcaption>
  </figure>
</div>


Depois do _merge_ com _fast-forward_ de submódulo, a situação é esta:

<div class="img-container">
  <figure>
    <img class="large" src="{{ site.baseurl }}/assets/images/posts/2022-03-12-merge-submodule/ff-submodulo-depois.svg">
    <figcaption><i> Fast-forward </i> de submódulos depois do merge</figcaption>
  </figure>
</div>

Caso não seja possível esse _fast-forward_, o Git indica **conflito** e o
usuário deverá resolver manualmente, como nesta situação:

<div class="img-container">
  <figure>
    <img class="large" src="{{ site.baseurl }}/assets/images/posts/2022-03-12-merge-submodule/conflito_submodulo_antes.svg">
    <figcaption>Conflito de submódulos</figcaption>
  </figure>
</div>

Ainda assim, caso esses _commits_ não sejam descendentes um do outro **mas**
exista algum _commit_ de _merge_ que seja descendente de ambos, esse _commit_
será **sugerido** para o usuário como uma possível solução para usar como _commit_
do submódulo no _merge_, e cabe ao usuário aceitá-la ou não. Esse comportamento pode ser visto
[aqui, no código-fonte do Git](https://github.com/git/git/blob/c2162907e9aa884bdb70208389cb99b181620d51/merge-ort.c#L1671-L1714).

Vale ressaltar também que essas formas de resolução de conflitos só são
possíveis caso estejam presentes localmente os objetos referentes aos _commits_
do submódulo. Caso eles não estejam presentes (por exemplo, por um `git clone`
sem `--recursive`, ou por falta de um `git submodule update`), o Git não será
capaz de resolver e irá indicar **conflito**.

## E o GitHub e o GitLab?

A `libgit2` é uma biblioteca em C que provê as funcionalidades do Git.
Segundo o [README](https://github.com/libgit2/libgit2/blob/9c9405df21051791d0a9092d6f363dfce3fe4544/README.md) da `libgit2`,
tanto o GitHub e o GitLab trabalham usando a `libgit2`. A
`libgit2` não tenta resolver conflitos de submódulos, como pode ser visto
[aqui, no código-fonte da libgit2](https://github.com/libgit2/libgit2/blob/2a0d0bd19b5d13e2ab7f3780e094404828cbb9a7/src/libgit2/merge.c#L862-L866),
e isso também vale para o GitHub e o GitLab.

Para ver isso na prática:
~~~bash
$ git checkout main
$ git submodule update --init
$ git branch pr-branch

# Adicionando um commit à main
$ git -C biblioteca_que_fica_em_submodulo checkout algum_commit~ # esse ~ é proposital
$ git add biblioteca_que_fica_em_submodulo
$ git commit

# Adicionando um commit à pr-branch
$ git checkout pr-branch
$ git submodule update --init
$ git -C biblioteca_que_fica_em_submodulo checkout algum_commit # descendente do commit na main
$ git add biblioteca_que_fica_em_submodulo
$ git commit

# Git push, para fazermos um PR/MR logo em seguida
$ git push origin pr-branch # supondo que seu remote se chame origin
~~~

Chegamos a uma situação parecida com esta:

<div class="img-container">
  <figure>
    <img class="large" src="{{ site.baseurl }}/assets/images/posts/2022-03-12-merge-submodule/merge-github-antes.svg">
    <figcaption><i>Branches</i> apontando para <i>commits</i> de submódulos em que pode ser feito um <i>fast-forward</i></figcaption>
  </figure>
</div>


Localmente, nesse caso um `git checkout main && git merge pr-branch` funciona,
porque o Git fará um _fast-forward_ do submódulo. Mas se você abrir um Pull
Request (GitHub) ou Merge Request (GitLab) para a _branch_ `pr-branch`, vai ser
indicado um conflito no submódulo.

### Como resolver?

Caso você esteja nessa situação, pode fazer isto:

~~~bash
$ git fetch origin main # supondo que seu remote se chame "origin"
$ git checkout pr-branch
$ git submodule update --init
$ git merge origin/main
$ git push origin pr-branch # supondo que seu remote se chame "origin"
~~~

O que deixará o grafo de _commits_ nesta situação:

<div class="img-container">
  <figure>
    <img class="large" src="{{ site.baseurl }}/assets/images/posts/2022-03-12-merge-submodule/merge-github-ff.svg">
    <figcaption><i>Merge</i> de <code>main</code> na <code>pr-branch</code></figcaption>
  </figure>
</div>


O PR/MR não estará mais com conflito. E por que funciona? Bom, fizemos um
_merge_ da `main` na `pr-branch`, o que localmente é bem-sucedido já que o Git
foi capaz de fazer um _fast-forward_ do submódulo.

Quando fizermos o `push`:
1. Se ninguém alterar a `main` nesse meio-tempo, `pr-branch` será descendente da
   `main`, o que permite um _fast-forward_;
2. Caso alguém tenha alterado a `main` nesse meio-tempo, a `main` antiga (que
   você fez o `fetch`) será a melhor ancestral comum entre a `main` nova (com a
   alteração da outra pessoa) e `pr-branch`. Dessa forma, caso a `main` nova não
   tenha alterado o submódulo em relação à `main` antiga, o submódulo da
   `pr-branch` será escolhido no _three-way merge_. Isso também valerá caso você
   opte por não usar um _fast-forward_ no GitHub/GitLab.


## Conclusão

Quando fazemos `git merge pr-branch`, o Git tenta mesclar os submódulos usando
_three-way merge_. Se não for possível, tenta um _fast-forward_ para o _commit_
descendente do submódulo, se houver. GitHub e GitLab não fazem esse
_fast-forward_, então, precisamos fazer o _merge_ localmente, resolvendo o
conflito do submódulo manualmente ou automaticamente, de forma que permita o
que o GitHub ou GitLab façam o _three-way merge_ sem cair no caso de conflito.
