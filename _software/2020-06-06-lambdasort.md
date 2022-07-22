---
title: "Lambdasort"
excerpt: "Quicksort implementado apenas com lambdas, em Python"
author_profile: true
header:
   teaser: "/assets/images/software/lambdasort.svg"
lang: pt_br

hidden: true

path-en: "/software/2020-06-06-lambdasort-en"
---

## O cálculo lambda

O Python, assim como várias outras linguagens, suporta funções de alta ordem e
funções anônimas. Isto significa, essencialmente, que podemos fazer isso:

~~~python

# função anônima (lambda). Esta é equivalente à função sqrt:
lambda n: n ** 0.5

# função que recebe função como parâmetro, neste caso, func
def aplica(func, parametro):
    return func(parametro)

# função que devolve outra função, neste caso, fabrica multiplicadores
def fabrica_multiplicador(n):
    return lambda x: n * x
~~~

Certo. Com isso as funções são valores, que podem ser criados por outras
funções, podem ser devolvidos por outras funções, e que ainda assim podem ser
chamadas.

E se escrevermos um código que nenhum valor seja de um tipo diferente de função? Por exemplo:

~~~python

t = lambda a: lambda b: a
f = lambda a: lambda b: b

e = lambda a: lambda b: a(b)(f)
ou = lambda a: lambda b: a(t)(b)
nao = lambda a: a(f)(t)

xor = lambda a: lambda b: ou(e(a)(nao(b)))(e(nao(a))(b))
~~~

Olhando pela primeira vez parece que não é possível fazer nada com isso. Só que,
como é possível suspeitar pelos nomes, isso foi suficiente para que fosse
possível definir a algebra booleana (verdadeiro, falso, conjunção, disjunção e
negação), e até definir uma outra operação (um XOR) usando essa algebra booleana
que declaramos.

O famoso cálculo lambda é isso. Nele temos apenas funções que recebem funções e
devolvem funções. Para esse post, isso basta, mas caso queira ler mais sobre, o
[artigo na Wikipedia sobre oa ssunto](https://en.wikipedia.org/wiki/Lambda_calculus)
é bem interessante.

Apesar de parecer insuficiente para fazer qualquer coisa, na verdade só com o
cálculo lambda conseguimos resolver qualquer problema que seria resolvido com
qualquer algoritmo, já que ele é **Turing-completo**! E quem provou isso foi o
próprio [Alan Turing](https://www.cambridge.org/core/journals/journal-of-symbolic-logic/article/abs/computability-and-definability/FE8B4FC84276D7BACB8433BD578C6BFD#access-block)!

O excelente [Programming with Nothing](https://tomstu.art/programming-with-nothing)
de Tom Stuart mostra como fazer um fizzbuzz apenas com cálculo lambda em Ruby.
Quando conheci o Programming with Nothing fiquei com vontade de fazer algo
parecido, e então fiz esta loucura: um **QUICKSORT EM CÁLCULO LAMBDA!**

Aqui vou contar todas as etapas de como ele foi feito.

## O início: um quicksort normal em Python

A primeira etapa foi escrever um quicksort em Python, com uma diferença do
quicksort tradicional: ele não altera a lista original, na verdade, ele devolve
nova lista, assim como a função `sorted` do Python:

~~~python
def car(A):
    return A[0]

def cdr(A):
    return A[1:]

def cons(A, x):
    return [x] + A

def concat(A, B):
    return A + B

def quicksort(A):
    if len(A) <= 1: return A
    L, R = partition(A)
    p = car(R)
    L = quicksort(L)
    R = quicksort(cdr(R))
    return concat(L, concat([p], R))

def partition(A):
    p = car(A)
    L = []
    R = []

    for x in cdr(A):
        if x < p: L = cons(L, x)
        else: R = cons(R, x)

    R = cons(R, p)

    return L, R
~~~

Repare no uso das funções `car`, `cdr` e `cons`. Segui a mesma nomenclatura de
Lisp para essas funções. A forma como as listas serão implementadas mais a
frente será a mesma de como é implementada em alguns dialetos de Lisp, então
tentei me aproximar mais de como as listas funcionam em Lisp do que o usual em
em Python.

A função `car` devolve o primeiro elemento, a função `cdr` devolve uma lista com
todos os elementos exceto o primeiro. Por ora, também implementei `cons` como
uma forma de devolver uma nova lista idêntica mas adicionando um novo elemento,
apesar de `cons` ser mais do que isso (falarei dele mais adiante). A função
`concat` junta duas listas.

De resto, é apenas um quicksort comum. A função `partition` recebe uma lista e
separa em duas, sendo a da esquerda com todos os elementos menores que o
primeiro elemento da lista da direita (o pivô), e a da direita com todos os
elementos maiores ou iguais ao pivô. A função `quicksort` chama `partition` para
separar a lista que será ordenada em duas, e ordena cada uma das duas com o
próprio `quicksort` recursivamente, sendo a base da recursão listas de tamanho
menor ou igual a 1.

## Redefinindo tipos

Como a ideia é reescrever o quicksort apenas com lambdas, precisamos representar
de alguma forma usando apenas funções. Os tipos de dados envolvidos aqui são:

- inteiros (os valores dentro da lista que queremos ordenar)
- listas (obviamente...)
- pares (para as funções que retornam mais de um valor)
- booleanos (para as verificações)

Felizmente, o próprio criador do cálculo lambda, Alonzo Church, também nos
mostrou como fazer isso. A Wikipedia também tem um ótimo
[artigo sobre isso](https://en.wikipedia.org/wiki/Church_encoding).


### Booleanos

Vamos começar com os mais fáceis, os booleanos. O primeiro exemplo de código
Python apenas com lambdas que mencionei no começo desse texto já é a forma como
Church define os booleanos no cálculo lambda.

Aqui está a forma como implementei de fato no Lambdasort:

~~~python
#boolean constants
LAMBDA_TRUE = lambda a: lambda b: a
LAMBDA_FALSE = lambda a: lambda b: b

#boolean opearations
LAMBDA_OR = lambda a: lambda b: a(LAMBDA_TRUE)(b)
LAMBDA_AND = lambda a: lambda b: a(b)(LAMBDA_FALSE)
LAMBDA_NOT = lambda a: a(LAMBDA_FALSE)(LAMBDA_TRUE)
~~~

Sim, o `true` é só uma função que recebe dois argumentos e devolve o primeiro,
e `false` uma função que recebe dois argumentos e devolve o segundo.

Sei que você está pensando "deveria ser então `lambda a, b: a` e `lambda a, b: b`,
por que dois `lambdas`?". Isso é porque na definição do cálculo lambda, as
funções só podem receber um argumento. Ao contrário dessa definição, o `lambda` 
em Python pode aceitar zero ou mais argumentos, mas aqui optei por me restringir
a só usar funções que recebem um argumento para me manter fiel à definição. 
Dessa forma, o que seria ser escrito como `lambda a1, a2, a3, ..., an:` passa a
ser escrito como `lambda a1: lambda a2: lambda a3: ... lambda an:`. Na hora de 
chamar a função, chamamos com `(a1)(a2)(a3)...(an)` em vez de 
`(a1, a2, a3, ..., an)`. O nome dessa conversão é
[currying](https://en.wikipedia.org/wiki/Currying), em homenagem a Haskell
Curry. Um exemplo de uma linguagem que nativamente usa currying para tratar
funções com vários argumentos é Haskell (não me diga...).

Logo em seguida implementei as três operações booleanas básicas:

- `not`: recebe um booleano de Church, e o chama usando como argumentos `false`
e `true`.  Se o booleano for `true`, irá devolver o primeiro argumento
(`false`), caso contrário, devolve o segundo (`true`).

- `or`: recebe dois booleanos de church, chama o primeiro passando como
  argumentos `true` e segundo booleano. Caso o primeiro argumento do `or` seja
  `true`, devolve seu primeiro argumento (`true`); caso ele seja `false`,
  devolve seu segundo argumento (que é o segundo argumento do `or`)
  
- `and`: bem parecido com o `or`. Simule ele mentalmente ;-).

Podemos também definir um `if`:

#### if

~~~python
LAMBDA_IF = lambda c: lambda t: lambda e: c(t)(e)
~~~

No `if`, `c` é a condição; `t` é o "then", aquilo que acontece quando a condição
é verdadeira, e `e` é o "else", o que acontece quando a condição é falsa.

O `if` então é mais próximo de uma if-expression do Python (ou operador
ternário) que um `if` de controle de fluxo:

~~~python
uso_5 = LAMBDA_TRUE
nao_uso_5 = LAMBDA_FALSE

a = LAMBDA_IF(uso_5)(5)(0) #5
b = LAMBDA_IF(nao_uso_5)(5)(0) #0
~~~

#### Conversão

Defini duas funções, para converter os booleanos de Church para os de Python
(`l2b`) e vice-versa (`b2l`):

~~~python
#boolean conversion
def l2b(l):
    return l(True)(False)

def b2l(b):
    return LAMBDA_TRUE if b else LAMBDA_FALSE
~~~

Exercício mental: simule elas!


### Inteiros

Os numerais de Church são definidos assim:

~~~python
LAMBDA_ZERO = lambda p: lambda x: x
LAMBDA_ONE = lambda p: lambda x: p(x)
LAMBDA_TWO = lambda p: lambda x: p(p(x))
# etc
~~~

Ou seja, todos os inteiros são funções que recebem dois argumentos `p`e
`x`. Zero é a função que devolve apenas o `x` (igual ao `false`). Um devolve
`p(x)`, dois devolve `p(p(x))`, e assim por diante. Obviamente, não conseguimos
representar números negativos.

#### Incremento e decremento

O incremento é bem fácil de definir, é uma função que poe mais uma camada de
`p(...)`:

~~~python
LAMBDA_INCREMENT = lambda l: lambda p: lambda x: p(l(p)(x))
~~~

Já o decremento é mais complicado. Explicar ele leva algum tempo, e não
acrescenta tanto para nós neste momento saber como ele funciona. Se quiserem
ver como funciona, tentem em casa. Se não, só confiem em ~~em mim~~ em Church
que isto funciona:

~~~python
LAMBDA_DECREMENT = lambda n: lambda f: lambda x: n(lambda g: lambda h: h(g(f)))(lambda y: x)(lambda y: y)
~~~

Se você tentou simular isso em casa, tentou ver o que aconteceria se decrementar
zero. E viu que o decremento de zero é zero aqui. Infelizmente, essa é uma
limitação.

#### Soma e subtração

Ok, temos então incremento e decremento. Se fizermos `m` incrementos em um
número `n`, teremos `m + n`, e se fizermos `n` decrementos teremos `m - n`.

Podemos definir soma e subtração assim:

~~~python
LAMBDA_ADD = lambda m: lambda n: n(LAMBDA_INCREMENT)(m)
LAMBDA_SUB = lambda m: lambda n: n(LAMBDA_DECREMENT)(m)
~~~

Repare que o incremento ou decremento será passado como o argumento `p` do
número `n` e o `m` será o `x`. Isto é, `m` será incrementado ou decrementado com
mesma quantidade que chamadas de `p` que tem em `n`, e que é justamente `n` vezes.
Muito, muito bonito.

Ainda assim, uma consequencia do decremento de zero ser zero aqui é que
`n - m = 0` sempre que `m > n`.

Só precisaremos dessas duas operações aritméticas aqui!

#### Comparações

As operações com inteiros que de fato são importantes para o quicksort são as
comparações. Com apenas a operação de igual a zero, combinada com
operações booleanas e aritméticas, conseguimos as outras:

- m <= n: `(m - n) == 0` (lembrando que `m - n = 0` se `n > m`)
- m == n: `(m <= n) and (n <= m)`
- n < m: `(m <= n) and not (m == n)`

Ou, seja:

~~~python
LAMBDA_EQZ = lambda n: n(lambda x: LAMBDA_FALSE)(LAMBDA_TRUE)
LAMBDA_LEQ = lambda m: lambda n: LAMBDA_EQZ(LAMBDA_SUB(m)(n))
LAMBDA_EQ = lambda m: lambda n: LAMBDA_AND(LAMBDA_LEQ(m)(n))(LAMBDA_LEQ(n)(m))
LAMBDA_LESS = lambda m: lambda n: LAMBDA_AND(LAMBDA_LEQ(m)(n))(LAMBDA_NOT(LAMBDA_EQ(m)(n)))
~~~

#### Conversões

Converter o numeral de Church para um inteiro do Python é só passar uma função de
incremento como primeiro argumento (o `p`) e 0 (do Python) como o segundo:

~~~python
def l2i(l):
    return l(lambda x: x + 1)(0)
~~~

Da mesma forma, podemos fazer o inverso: podemos incrementar o varias vezes o
zero de Church até chegar no número:

~~~python
def i2l(i):
    l = LAMBDA_ZERO
    for j in range(0, i):
        l = LAMBDA_INCREMENT(l)

    return l
~~~

Também poderemos definir funções para a conversão de listas de inteiros do
Python para listas de numerais de Church e vice-versa:

~~~python
def llist2pylist(L):
    return list(map(l2i, L))

def pylist2llist(L):
    return list(map(i2l, L))
~~~

#### Usando numerais de Church

Como já conseguimos transformar listas de inteiros do Python em listas de
numerais de Church e vice-versa, além de que sabemos realizar comparações de
numerais de Church, já é possível fazer a primeira alteração no Quicksort:

~~~python3
def quicksort(A):
    if len(A) <= 1: return A
    L, R = partition_wrapper(A)
    p = car(R)
    L = quicksort(L)
    R = quicksort(cdr(R))
    return concat(L, concat([p], R))

def partition_wrapper(A):
    B = pylist2llist(A)
    L, R = partition(B)
    return llist2pylist(L), llist2pylist(R)

def partition(A):
    p = car(A)
    L = []
    R = []

    for x in cdr(A):
        if l2b(LAMBDA_LESS(x)(p)): L = insert(L, x)
        else: R = insert(R, x)

    R = insert(R, p)

    return L, R
~~~

A função `partition` passa a operar sobre listas de numerais de Church. Para
isso, substituí `x < p` por `LAMBDA_LESS(x)(p)`, que devolve um booleano de
Church em vez de `True` ou `False`. Precisei usar `l2b` para converter o
booleano de Church para booleano de Python, para manter a compatibilidade com o
`if`.

A função `partition_wrapper` age como um adaptdor do novo `partition`, de forma
que recebe inteiros de Python, mas com a partição sendo de fato realizada pelo
novo `partition`.

Farei nas próximas seções várias substituições de tipos, funções e operadores do
Python por funções em cálculo lambda, assim como fiz agora. Tentarei só alterar
aquilo que for relevante para cada etapa, usando as funções de conversão se for
necessário.

### Pares e listas

Nossa estrutura de dados mais básica é o par. O par é, de fato, um par de
valores. Na codificaçao de Church, um par e suas operações básicas são definidos
assim:

~~~python3
LAMBDA_CONS = lambda a: lambda b: lambda l: l(a)(b)
LAMBDA_CAR = lambda p: p(lambda a: lambda b: a)
LAMBDA_CDR = lambda p: p(lambda a: lambda b: b)
~~~

A primeira função, `LAMBDA_CONS`, define o par. Repare, que ao passar dois
valores como seus argumentos, por exemplo, `LAMBDA_CONS(1)(2)`, ela irá devolver
uma função que recebe um argumento `l` e devolve a chamada de `l` usando os
elementos do par como argumentos, no nosso exemplo, `l(1)(2)`. Ou seja:
`LAMBDA_CONS(1)(2) = lambda l: l(1)(2)`.

A segunda função, `LAMBDA_CAR`, devolve o primeiro elemento do par, e a terceira
função, `LAMBDA_CDR`, devolve o segundo elemento. No caso, ambas as funções
chamam o par, só que `LAMBDA_CAR` passa como argumento uma função que devolve o
primeiro argumento e `LAMBDA_CDR` passa como argumento uma função que devolve o
segundo argumento.

#### Listas

Se você prestou atenção, reparou que `car`, `cdr` e `cons` é o mesmo nome que
das funções que operam em listas. E de fato, elas são as mesmas. Isso acontece
por causa da forma como as listas são implementadas na codificação de Church.
As listas de Church são simplesmente pares, em que o primeiro elemento do par é
o primeiro elemento da lista, e o segundo elemento é uma lista com restantes dos
elementos. Essa é uma definição recursiva em que a base da recursão, ou seja, a
lista vazia, pode ser implementada de várias formas. Aqui, usarei para
representar a lista vazia o booleano `LAMBDA_FALSE`:

~~~python3
LAMBDA_EMPTY = LAMBDA_FALSE
~~~

Dessa forma, uma lista com os valores `[1, 2, 3]` é declarada assim:

~~~python3
LAMBDA_CONS(1)(LAMBDA_CONS(2)(LAMBDA_CONS(3)(LAMBDA_FALSE)))
~~~

Quantos parênteses! Mas repare que nesse ponto, `LAMBDA_CAR`, `LAMBDA_CDR` e 
`LAMBDA_CONS`, quando aplicadas a listas, têm o mesmo comportamento das funções
`car`, `cdr` e `cons` que definimos para operar em listas do Python.

Como a definição dessas listas é recursiva, a iteração sobre seus ela também
será feita de forma recusiva. A função que iremos usar para saber se a recursão
chegou ao fim é esta:

~~~python3
LAMBDA_ISEMPTY = lambda l: l(lambda h: lambda t: lambda d: LAMBDA_FALSE)(LAMBDA_TRUE)
~~~

Ou seja, se `l` for `LAMBDA_EMPTY` (= `LAMBDA_FALSE`), devolve o segundo
argumento:`LAMBDA_TRUE`.  Caso contrário, ela será um par
(ex: `lambda l: l(1)(resto_da_lista)`, e passaremos como argumento uma função
`lambda h: lambda t: lambda d: LAMBDA_FALSE` e `LAMBDA_TRUE`. Os valores do par
e o valor `LAMBDA_TRUE` serão ignorados, e apenas o valor `LAMBDA_FALSE` será
devolvido, independente de qual for o conteúdo do par. Uma solução bem elegante!

#### Conversão

Pares poderão ser convertidos de e para listas de Python com apenas dois
elementos. O jeito pythônico de fazer isto seria com tuplas de apenas dois
elementos, mas, para manter a homogeinidade do código, usarei listas:

~~~python3
def l2p(l):
    return [LAMBDA_CAR(l), LAMBDA_CDR(l)]

def p2l(p):
    return LAMBDA_CONS(p[0])(p[1])
~~~

Da mesma forma, podemos converter listas de Python e listas de Church:

~~~python3
def ll2pl(l):
    if l2b(LAMBDA_ISEMPTY(l)): return []
    return [LAMBDA_CAR(l)] + ll2pl(LAMBDA_CDR(l))

def pl2ll(l):
    if len(l) == 0: return LAMBDA_EMPTY
    return LAMBDA_CONS(l[0])(pl2ll(l[1:]))
~~~

#### Usando listas de Church no `partition`

Vamos adicionar listas de Church ao quicksort! Primeiro, vamos converter o
`partition` para operar em listas de Church:

~~~python3
def lliterator(l):
    while not l2b(LAMBDA_ISEMPTY(l)):
        yield LAMBDA_CAR(l)
        l = LAMBDA_CDR(l)

def partition_wrapper(A):
    B = pl2ll(list(map(i2l, A)))
    L, R = partition(B)
    return list(map(l2i, ll2pl(L))), list(map(l2i, ll2pl(R)))

def partition(A):
    p = LAMBDA_CAR(A)
    L = LAMBDA_EMPTY
    R = LAMBDA_EMPTY

    for x in lliterator(LAMBDA_CDR(A)):
        if l2b(LAMBDA_LESS(x)(p)): L = LAMBDA_CONS(x)(L)
        else: R = LAMBDA_CONS(x)(R)

    R = LAMBDA_CONS(p)(R)

    return L, R
~~~

A alteração aqui foi bem óbvia: só substiuímos `car`, `cdr`, `cons` e `[]` seus
equivalentes em cálculo lambda. Além disso, para iterar sobre a lista de Church
criei o generator `lliterator`.

#### Usando listas de Church no `quicksort`

Agora vamos adicionar as listas de Church ao quicksort! Ainda precisamos definir
a função `concat` para as listas de Church.

Uma primeira implementação para elas poderia ser:

TODO: melhorar isso aqui

~~~python3
def LAMBDA_CONCAT(l1):
    def _LAMBDA_CONCAT(l2):
        if l2b(LAMBDA_ISEMPTY(LAMBDA_CDR(l1))):
            return LAMBDA_CONS(LAMBDA_CAR(l1))(l2)
        else:
            return LAMBDA_CONS(LAMBDA_CAR(l1))(LAMBDA_CONCAT(LAMBDA_CDR(l1))(l2))
    return _LAMBDA_CONCAT
~~~

~~~
def quicksort(A):
    # len(A) <= 1
    if l2b(LAMBDA_ISEMPTY(A)): return A
    if l2b(LAMBDA_ISEMPTY(LAMBDA_CDR(A))): return A

    L, R = partition(A)
    p = LAMBDA_CAR(R)

    L = quicksort(L)
    R = quicksort(LAMBDA_CDR(R))

    return LAMBDA_IF(LAMBDA_ISEMPTY(L))(LAMBDA_CONS(p)(R))(LAMBDA_CONCAT(L)(LAMBDA_CONS(p)(R)))
~~~
