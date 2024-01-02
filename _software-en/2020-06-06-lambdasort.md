---
title: "Lambdasort"
excerpt: "Quicksort written in Python only using lambdas"
author_profile: true

header:
   image: "/assets/images/software/2020-06-06-lambdasort/lambdasort.png"
   teaser: "/assets/images/software/lambdasort.svg"

hidden: false

lang: en
path-pt_br: "/software/2020-06-06-lambdasort"
---

**UNDER TRANSLATION**

Quicksort written in Python only using lambdas!

GitHub: [https://github.com/lucasoshiro/lambdasort](https://github.com/lucasoshiro/lambdasort)

## Lambda calculus

Python, just like many other programming languages, supports **high-order
functions** and **anonymous functions**. This means, basically, that we can
do this:

~~~python

# anonymous function (lambda). This is equivaltent to sqrt:
lambda n: n ** 0.5

# function that takes another function as parameter
def apply_func(func, parameter):
    return func(parameter)

# function that returns another function. in this case, this is a mutiplier factory
def multiplier_factory(n):
    return lambda x: n * x
~~~

Right. This way, **functions are values** that can be created and returned by
other functions.

What if we write a code that has no value that isn't a function? For example:

~~~python
t = lambda a: lambda b: a
f = lambda a: lambda b: b
x = (lambda a: lambda b: a(b)(f))(t)(f)
~~~

At first look it seems to be useless. However, believe it or not (spoiler: this
will be explained further), that is a boolean `and` of `True` and `False`!

The famous **lambda calculus** is it. It only has functions that get
functions as parameters and return other functions. For us, that is enough, but
if you want to read more about it, I really suggest you
[this article on Wikipedia](https://en.wikipedia.org/wiki/Lambda_calculus).

Even though it seems to be insufficient to do anything, actually lambda calculus
can solve any problem that can be solved with an algorithm, as it is
**Turing-complete**! [Alan Turing](https://www.cambridge.org/core/journals/journal-of-symbolic-logic/article/abs/computability-and-definability/FE8B4FC84276D7BACB8433BD578C6BFD#access-block)
itself has proven it!

The excellent [Programming with  Nothing](https://tomstu.art/programming-with-nothing)
by Tom Stuard shows how to write a fizzbuzz using lambda calculus in Ruby.
When I read it the first time I wanted to do something similar to it, so I made
this: **A QUICKSORT IN LAMBDA CALCULUS**.

I tell you all the steps of how I did that!

## The beginning: a normal quicksort in Python

The first step was to write a quicksort in Python, but with a difference
compared to the traditional quicksort: it **doesn't change** the original list,
instead, it **returns** a new list, just like the `sorted` in Python:

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

    L, R = [], []

    for x in cdr(A):
        if x < p:
            L, R = cons(x, L), R
        else:
            L, R = L, cons(x, R)

    L, R = L, cons(p, R)

    return L, R
~~~

Take a look in the use of the functions `car`, `cdr` and `cons`. I followed the
Lisp nomenclature for those functions. They will be further
implemented the same way as some Lisp dialects, so I tried to be closer to them
in how lists work instead of the usual in Python:

- The `car` function returns the **first** element
- The `cdr` function returns a list with the **rest** of the elements. In other
  words, all the elements except the first
- By now, I also implemented `cons` as a function that returns a new list that
  looks the same as the provided but **appending**  a new element to its
  beginning, but `cons` is more than that (I'll discuss it later)
- The `concat` function **concatenates** two lists.

The rest is only a standard quicksort:

- The `partition` function **splits** a list in two, the left one being a list
  that all of its elements are lesser than the first element of the right one
  (the pivot), and the right one being a list that all elements are greater or
  equal to the pivot.

- The `quicksort` function calls `partition` to split the list that we want to
  sort into two and **sorts** each one using `quicksort` itself, recursively,
  being the base of the recursions lists with length lesser or equal to 1.

As for the weird constructions `L, R = ...`, by now it is useless to do those
parallel attributions, but this will be helpful in the future.

## Redefining types

As the idea is to rewrite quicksort using only lambdas, we need to somehow **represent
data** using only functions. The types here are:

- integers (the values in the list that we want to sort)
- lists
- pairs (used by the functions that return more than one value)
- booleans (used by the verifications)

Luckly, the creator of lambda calculus, **Alonzo Church** has also shown us how
to do that. There's an [article about it](https://en.wikipedia.org/wiki/Church_encoding)
on Wikipedia.

### Booleans

Let's start by the easier ones, **booleans**:

~~~python
#boolean constants
LAMBDA_TRUE = lambda a: lambda b: a
LAMBDA_FALSE = lambda a: lambda b: b

#boolean opearations
LAMBDA_OR = lambda a: lambda b: a(LAMBDA_TRUE)(b)
LAMBDA_AND = lambda a: lambda b: a(b)(LAMBDA_FALSE)
LAMBDA_NOT = lambda a: a(LAMBDA_FALSE)(LAMBDA_TRUE)
~~~

Yeah, `true` is only a function that takes **two arguments** and returns **the
 first one**, and `false` is a function that takes two arguments and returns
 **the second one**.

I know that you're thinking: "it should be `lambda a, b: a` and `lambda a, b:
b`, why there are two `lambdas`?". This is because in the definition of lambda
calculus, functions can only take **one argument**. Contrary to that definition,
in Python `lambda` can take zero or more arguments, but here I'm restricting
myself to only use functions that take only one argument in order to stick to
the definition. This way, what would be written as `lambda a1, a2, a3, ..., an:`
will be written as `lambda a1: lambda a2: lambda a3: ... lambda an:`. When
calling the function, we use `(a1)(a2)(a3)...(an)` instead of `(a1, a2,
a3, ..., an)`. The name of that conversion is
**[currying](https://en.wikipedia.org/wiki/Currying)**, named after Haskell
Curry. An exemple of language that natively uses currying to handle function is
Haskell (you don't say!).

After that, I implemented the tree basic **boolean operations**:

- `not`: takes a Church boolean, and calls it using as parameters `false` and
  `true`. If the boolean is `true`, it returns the **first argument** (`false`);
  if it is `false`, then it returns the **second argument** (`true`).

- `or`: takes two Church booleans, calls the first one passing as arguments
  `true` and the second boolean. If the first argument of `or ` is `true`, then
  it returns its **first argument** (`true`); if it is `false`, then it returns
  its **second argument** (the second argument of `or`).

- `and`: much like `or`. Try to simulate it mentally ;-)
  
We can also define an `if`:

#### if

~~~python
LAMBDA_IF = lambda c: lambda t: lambda e: c(t)(e)
~~~

In `if`, `c`is the **condition**; `t` is the "then" block, what happens when the
**condition is true**, and `e` is the "else" block, what happens when the
condition is **false**.

This way, `if` is closer to an **if-expression** in Python (or ternary operator)
than a control flow `if`:

~~~python
use_5 = LAMBDA_TRUE
dont_use_5 = LAMBDA_FALSE

a = LAMBDA_IF(use_5)(5)(0) # a = 5
b = LAMBDA_IF(dont_use_5)(5)(0) # a = 0
~~~

#### Conversion

I also defined two functions to convert Church booleans to Python booleans
(`l2b`)  and vice-versa (`b2l`):

~~~python
#boolean conversion
def l2b(l):
    return l(True)(False)

def b2l(b):
    return LAMBDA_TRUE if b else LAMBDA_FALSE
~~~

Mental exercise: simulate them!

### Integers

**Chuch numerals** are defined as:

~~~python
LAMBDA_ZERO = lambda p: lambda x: x
LAMBDA_ONE = lambda p: lambda x: p(x)
LAMBDA_TWO = lambda p: lambda x: p(p(x))
# etc
~~~

This is, all the integers are functions that take **two arguments** `p` and `x`
this way:

- 0 is a function that returns `x` (just like `false`)
- 1 is a function that returns `p(x)`
- 2 is a function that returns `p(p(x))`

and so on. However, we can represent negative numbers using this encoding.

#### Increment and decrement

**Increment** is easy to define, it is a function that adds another layer of `p(...)`:

~~~python
LAMBDA_INCREMENT = lambda l: lambda p: lambda x: p(l(p)(x))
~~~

But **decrement** is far harder. Explaining it takes some time, and
understanding it is not useful for us right now. If you really want to know how
it works, try it by yourself. If you don't care, just trust ~~me~~ Church that
it works:

~~~python
LAMBDA_DECREMENT = lambda n: lambda f: lambda x: n(lambda g: lambda h: h(g(f)))(lambda y: x)(lambda y: y)
~~~

If you tried to simulate it by yourself, you probably tried to figure out what
happens if you decrement zero. And you found that the **decrement of zero is
zero** here. Sadly this is a limitation, and we'll need to remember it soon in
the future.

#### Add and subtraction

Ok, we have increment and decrement. If we increment `n` times a number `m`,
then we'll have `m + n`, and if we decrement `n` times we'll have `m - n`.

We can define add and subtraction this way:

~~~python
LAMBDA_ADD = lambda m: lambda n: n(LAMBDA_INCREMENT)(m)
LAMBDA_SUB = lambda m: lambda n: n(LAMBDA_DECREMENT)(m)
~~~

Note that increment and decrement will passed as the `p` argument of the number
`n` and `m` will be the `x` argument. In other words, `m` will be incremented or
decremented **the same amount** of times than the number of calls that `p` has
in `n`, this is, `n` times. Very, very beautiful.

Even so, a consequence of the decrement of zero being zero here is that `n - m`
will always be zero if `m > n`.

Multiplication and division are also possible, but they won't be useful for this
quicksort.

#### Comparisons

The integer operations that will actually be useful for implementing quicksort
are the **comparisons**. Let's start by defining the function that tells if a
Church number is or not zero (mental exercise: why does this work?):

~~~python
LAMBDA_EQZ = lambda n: n(lambda x: LAMBDA_FALSE)(LAMBDA_TRUE)
~~~

Using only the operation of **equals zero**, combined with **boolean** and
**aritmetic** operations we can define the others:

- `m <= n`: `(m - n) == 0` (remember: `m - n = 0` if `n > m`)
- `m == n`: `(m <= n) and (n <= m)`
- `n < m`: `(m <= n) and not (m == n)`

Or, in Python / lambda calculus:

~~~python
LAMBDA_LEQ = lambda m: lambda n: LAMBDA_EQZ(LAMBDA_SUB(m)(n))
LAMBDA_EQ = lambda m: lambda n: LAMBDA_AND(LAMBDA_LEQ(m)(n))(LAMBDA_LEQ(n)(m))
LAMBDA_LESS = lambda m: lambda n: LAMBDA_AND(LAMBDA_LEQ(m)(n))(LAMBDA_NOT(LAMBDA_EQ(m)(n)))
~~~

#### Conversion

If we want to **convert** a Church number to a Python integer we'll only need to
pass the increment function as the first argument (`p`) and 0 as the second:

~~~python
def l2i(l):
    return l(lambda x: x + 1)(0)
~~~

We can do the inverse: we can **increment** several times the Church zero until
we reach the number:

~~~python
def i2l(i):
    l = LAMBDA_ZERO
    for j in range(0, i):
        l = LAMBDA_INCREMENT(l)

    return l
~~~

We can also define functions to convert Python integer lists into Church number
lists and vice-versa:

~~~python
def llist2pylist(L):
    return list(map(l2i, L))

def pylist2llist(L):
    return list(map(i2l, L))
~~~

#### Using Church numbers

As we can convert Python integer lists into Church number lists and vice-versa
and we can compare Chuch numbers, we can apply the first change to Quicksort:

~~~python
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

    L, R = [], []

    for x in cdr(A):
        if l2b(LAMBDA_LESS(x)(p)):
            L, R = cons(x, L), R
        else:
            L, R = L, cons(x, R)
    L, R = L, cons(p, R)

    return L, R
~~~

The `partition` funcion now operates over **Church number lists**. In order to
do that, we replaced `x < p` by `LAMBDA_LESS(x)(p)`, that returns a Church
boolean instead of `True` and `False`. I needed to use `l2b` to convert the
Church boolean to a Python boolean so we can keep the compatibility with `if`.

The function `partition_wrapper` **adapts** the new `partition` in a way that it
takes Python integers, but partitioning using the new `partition` function.

In the following sections I will make several substitutions of types, functions
and operators by functions in lambda calculus, just like I did so far. I'll try
to change only what is relevant for each step, using the conversion functions if
necessary.

### Pairs and lists

Our basic data structure is the **pair**. The pair is really a pair of values,
just like a Python tuple of size 2. In Church encoding, a pair and its basic
operations are defined like this:

~~~python
LAMBDA_CONS = lambda a: lambda b: lambda l: l(a)(b)
LAMBDA_CAR = lambda p: p(lambda a: lambda b: a)
LAMBDA_CDR = lambda p: p(lambda a: lambda b: b)
~~~

The first function, `LAMBDA_CONS`, defines the pair. Note that, when passing two
values as its arguments (e. g. `LAMBDA_CONS(15)(20)`), it will return a function
that takes an argument `l` and **returns** the `l` call using the pair elements
as **arguments** (in our example, `l(15)(20)`). That is: `LAMBDA_CONS(15)(20) =
lambda l: l(15)(20)`. In Python and other languages that supports first-class
functions, those two values are stored in a
**[closure](https://en.wikipedia.org/wiki/Closure_(computer_programming))**, and
we can even get them this way:

~~~python
l = LAMBDA_CONS(15)(20)
a, b = (x.cell_contents for x in l.__closure__) # a = 15, b = 20
~~~

Quanto às funções `LAMBDA_CAR` e `LAMBDA_CDR`, elas devolvem o **primeiro** e o
**segundo** elemento do par, respectivamente.

Exercício mental: tente entender porque `LAMBDA_CAR` e `LAMBDA_CDR` funcionam!

#### Listas

Se você prestou atenção, reparou que `car`, `cdr` e `cons` é o mesmo nome que
das funções que definimos que operam em **listas**. E de fato, elas são as
mesmas. Isso acontece por causa da forma como as listas são implementadas na
codificação de Church.

As **listas de Church** são simplesmente pares em que:

- o primeiro elemento do par é o **primeiro elemento** da lista
- o segundo elemento é uma **lista com o restante** dos elementos

Essa é uma definição recursiva em que a base da recursão, ou seja, a
**lista vazia**, pode ser implementada de várias formas. Aqui, usamos para
representar a lista vazia o booleano `LAMBDA_FALSE`:

~~~python
LAMBDA_EMPTY = LAMBDA_FALSE
~~~

Dessa forma, uma lista com os valores `[1, 2, 3]` é declarada assim:

~~~python
LAMBDA_CONS(1)(LAMBDA_CONS(2)(LAMBDA_CONS(3)(LAMBDA_FALSE)))
~~~

O que, na prática, são pares recursivos, na seguinte forma:

~~~python
(1, (2, (3, LAMBDA_EMPTY)))
~~~

Quantos parênteses! Mas repare que nesse ponto, `LAMBDA_CAR`, `LAMBDA_CDR` e 
`LAMBDA_CONS`, quando aplicadas a **listas**, têm o mesmo comportamento das funções
`car`, `cdr` e `cons` que definimos para operar em listas do Python:

- `LAMBDA_CAR` devolve o primeiro elemento do primeiro par, ou seja, **o primeiro elemento** da lista (`1`)
- `LAMBDA_CDR` devolve o primeiro elemento do segundo par, ou seja, **o restante** da lista (`(2, (3, LAMBDA_EMPTY))`)
- `LAMBDA_CONS` adiciona mais um par, acomodando **um novo elemento**

Como a definição dessas listas é recursiva, a iteração sobre seus ela também
será feita de forma recusiva. A função que iremos usar para saber se a recursão
chegou ao fim é esta:

~~~python
LAMBDA_ISEMPTY = lambda l: l(lambda h: lambda t: lambda d: LAMBDA_FALSE)(LAMBDA_TRUE)
~~~

Ou seja:
- se `l` for **vazio** (é igual a `LAMBDA_EMPTY`) , devolve o segundo argumento: `LAMBDA_TRUE`
- se `l` não **for vazio**, então `l` é um par (ex:
`lambda l: l(1)(resto_da_lista)`, e passaremos como argumento uma função
`(lambda h: lambda t: lambda d: LAMBDA_FALSE)`

#### Conversão

**Pares** poderão ser convertidos de e para listas de Python com apenas dois
elementos. O jeito pythônico de fazer isto seria com tuplas de apenas dois
elementos, mas, para manter a homogeinidade do código, usarei listas:

~~~python
def l2p(l):
    return [LAMBDA_CAR(l), LAMBDA_CDR(l)]

def p2l(p):
    return LAMBDA_CONS(p[0])(p[1])
~~~

Da mesma forma, podemos converter listas de Python e listas de Church:

~~~python
def ll2pl(l):
    if l2b(LAMBDA_ISEMPTY(l)): return []
    return [LAMBDA_CAR(l)] + ll2pl(LAMBDA_CDR(l))

def pl2ll(l):
    if len(l) == 0: return LAMBDA_EMPTY
    return LAMBDA_CONS(l[0])(pl2ll(l[1:]))
~~~

#### Usando pares de Church no `partition`

Como a função `partition` devolve dois valores (uma tupla do Python), podemos
usar aqui um par de Church:

~~~python
    # antes:
    return L, R

    # depois:
    return LAMBDA_CONS(L)(R)
~~~

#### Usando listas de Church no `partition`

Vamos adicionar listas de Church ao quicksort! Primeiro, vamos converter o
`partition` para operar em listas de Church. A situação atual é esta:

~~~python
def partition(A):
    p = car(A)

    L, R = [], []

    for x in cdr(A):
        if l2b(LAMBDA_LESS(x)(p)):
            L, R = cons(x, L), R
        else:
            L, R = L, cons(x, R)
    L, R = L, cons(p, R)

    return L, R
~~~

Então vamos substitur `car`, `cdr`, `cons` e `[]` por seus equivalentes em
cálculo lambda.

~~~python
def partition(A):
    p = LAMBDA_CAR(A)
    L, R = LAMBDA_EMPTY, LAMBDA_EMPTY

    for x in lliterator(LAMBDA_CDR(A)):
        if l2b(LAMBDA_LESS(x)(p)):
            L, R = LAMBDA_CONS(x)(L), R
        else:
            L, R = L, LAMBDA_CONS(x)(R)
    L, R = L, LAMBDA_CONS(p)(R)

    return LAMBDA_CONS(L)(R)
~~~

Repare que para iterar sobre a lista de Church criei o generator `lliterator`:

~~~python
def lliterator(l):
    while not l2b(LAMBDA_ISEMPTY(l)):
        yield LAMBDA_CAR(l)
        l = LAMBDA_CDR(l)
~~~


#### Usando listas de Church no `quicksort`

Agora vamos adicionar as **listas de Church** à função `quicksort`! Ainda
precisamos definir a função `concat` para as listas de Church. Podemos
implementá-la de forma recursiva:

- Se a lista à esquerda **for vazia**, então usamos a **segunda**
- Se a lista à esquerda **não for vazia**, devolvemos uma lista em que:
  - o primeiro elemento é o **primeiro elemento** (`car`) da lista da **esquerda**
  - o resto da lista é a concatenação do **resto** (`cdr`) da lista da **esquerda** com a lista da **direita**

Isso ficaria assim (note o currying):

~~~python
def LAMBDA_CONCAT(l1):
    def _LAMBDA_CONCAT(l2):
        if l2b(LAMBDA_ISEMPTY(LAMBDA_CDR(l1))):
            return LAMBDA_CONS(LAMBDA_CAR(l1))(l2)
        else:
            return LAMBDA_CONS(LAMBDA_CAR(l1))(LAMBDA_CONCAT(LAMBDA_CDR(l1))(l2))
    return _LAMBDA_CONCAT
~~~

Isso fica um tanto distante das outras operações que foram escritas em só uma
expressão. Spoiler: vamos tratar isso depois.

~~~python
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

## Transformando laços em funções recursivas

No cálculo lambda, como **não temos estados**, não podemos fazer laços como em
linguagens imperativas, ou seja, repetindo um trecho de código e alterando o
estado de alguma variável.

E por não ter estados, em vez de alterar algum valor já existente, devolvemos um
**novo** valor, da mesma forma como fiz ao substituir o comportamento clássico do
quicksort para devolver uma lista ordenada em vez de ordernar a lista original.
    
Mesmo quando estamos em linguagens que implementam tanto o paradigma
funcional quanto o imperativo, como Python, se nos restringirmos a escrever um
código de forma funcional também não podemos usar laços.

E como fazemos para resolver os problemas que seriam solucionados com laços?
Existem várias soluções dependendo do caso, por exemplo, podemos usar `reduce`,
_list comprehensions_, `map`, `filter`, funções recursivas, entre outros. Neste
`quicksort`, temos apenas **um laço**, na função `partition`. Iremos substituí-lo
por uma **função recursiva**.

### Transformando o `for` em `while`

Neste momento, o laço está assim:

~~~python
p = LAMBDA_CAR(A)
L, R = LAMBDA_EMPTY, LAMBDA_EMPTY

for x in lliterator(LAMBDA_CDR(A)):
    if l2b(LAMBDA_LESS(x)(p)):
        L, R = LAMBDA_CONS(x)(L), R
    else:
        L, R = L, LAMBDA_CONS(x)(R)
~~~

Tirando o iterador `lliterator` e substituindo o `for` por um `while`, chegamos
nisto:

~~~python
p = LAMBDA_CAR(A)
L, R = LAMBDA_EMPTY, LAMBDA_EMPTY

S = LAMBDA_CDR(A)
while True:
    if l2b(LAMBDA_ISEMPTY(S)): break
    x = LAMBDA_CAR(S)
    if l2b(LAMBDA_LESS(x)(p)):
        L, R = LAMBDA_CONS(x)(L), R
    else:
        L, R = L, LAMBDA_CONS(x)(R)
    S = LAMBDA_CDR(S)
~~~

Ou seja: a princípio a lista `S` é igual à entrada sem o primeiro elemento (que
é o pivô `p`). Cada iteração do `while` **retira** um valor de `S` e o
**armazena** em `x`. Caso `x < p`, `x` é adicionado ao começo de `L` e caso
contrário é adicionado ao fim de `R`. A **condição de parada** é quando a lista `S`
for vazia.

A partir daqui podemos identificar os elementos que serão importantes para
escrever este laço como uma função recursiva: 

- as entradas `L` e `R`, a princípio, listas de Church vazias;
- a entrada `S`, a princípio, igual a `LAMBDA_CDR(A)`;
- as saídas, ou seja, os valores de `L` e `R` ao final do laço;
- a condição de parada, ou seja, `S` estar vazia;

### Transformando o `while` em recursão

Legal, partindo do que temos, já conseguimos escrever uma **função recursiva**
(que chamei aqui de `_partition`), partindo do próprio código do `while`:

~~~python
p = LAMBDA_CAR(A)
L, R = LAMBDA_EMPTY, LAMBDA_EMPTY

S = LAMBDA_CDR(A)

def _partition(S, L, R):
    if l2b(LAMBDA_ISEMPTY(S)): return L, R
    x = LAMBDA_CAR(S)
    if l2b(LAMBDA_LESS(x)(p)):
        nL, nR = LAMBDA_CONS(x)(L), R
    else:
        nL, nR = L, LAMBDA_CONS(x)(R)
    S = LAMBDA_CDR(S)
    return _partition(S, nL, nR)

nL, nR = _partition(S, L, R)
~~~

Repare que a função `_partition` não altera o estado das entradas `L` e `R`.
Em vez de _alterar_ os dados originais, ela devolve _novos_ dados que ficam nas
variáveis `nL` e `nR`, que são os argumentos `L` e `R` da próxima chamada
recursiva.

Podemos fazer essa função também devolver pares de Church em vez de tuplas:

~~~python
p = LAMBDA_CAR(A)
L, R = LAMBDA_EMPTY, LAMBDA_EMPTY

S = LAMBDA_CDR(A)

def _partition(S, L, R):
    if l2b(LAMBDA_ISEMPTY(S)): return LAMBDA_CONS(L)(R)
    x = LAMBDA_CAR(S)
    if l2b(LAMBDA_LESS(x)(p)):
        nL, nR = LAMBDA_CONS(x)(L), R
    else:
        nL, nR = L, LAMBDA_CONS(x)(R)
    S = LAMBDA_CDR(S)
    return _partition(S, L, R)

LR = _partition(S, L, R)
nL, nR = LAMBDA_CAR(LR), LAMBDA_CDR(LR)
~~~

## Substituindo variáveis por `let`s

Uma [expressão let](https://en.wikipedia.org/wiki/Let_expression) permite
definir um valor a uma variável dentro de um **escopo**, de forma que o valor
dela **nunca seja alterado**. Em Python, esse conceito não faz tanto sentido,
mas ele é implementado de diferentes formas em diferentes linguagens. Vou
mostrar em algumas.

Começando por **Kotlin**, o let é um método que pode ser usado em qualquer objeto, 
de forma que a gente pode dar um nome temporário a ele:

~~~kotlin
val x = 2.let { a -> 
   3.let { b ->
      a + b * a
   }
}
~~~

Em **Haskell**, o let é uma expressão, em que a primeira parte é atribuição dos
valores e a segunda é a expressão que queremos obter:

~~~haskell
x = let a = 2
        b = 3
    in a + b * a
~~~

Em **[Hy](http://hylang.org)** (Python com sintaxe de Lisp), é bastante parecido
com Haskell, primeiro atribuimos os valores às variáveis depois declaramos
a expressão que irá usá-los:

~~~hy
(setv x
   (let [
      a 2
      b 3
      ]
      (+ a (* b a))
   )
)
~~~

(Nos três exemplos, `x` terá valor 8)

Essa é uma construção bastante usada em linguagens funcionais, já que nelas as
variáveis têm um **valor fixo** dentro de um escopo. Além disso, elas são fáceis
de serem escritas usando **cálculo lambda**. Podemos escrever o exemplo usado
nessas três linguagens assim:

~~~python
def _f(a, b):
   return a + b * a
x = _f(2, 3)

# ou, usando lambda e currying:

x = (lambda a: lambda b: a + b * a)(2)(3)
~~~

Repare que, da mesma forma, estamos atribuindo 2 a `a` e 3 a `b`, e calculando
`a + b * a`.

A missão dessa etapa é colocar **todas as variáveis** que não sejam argumentos
ou constantes em lets, já que assim elas poderão ser usadas no cálculo lambda.

A partir deste momento, o código começa ficar bastante ilegível, mas vamos focar
em um exemplo de como essa substituição é feita, já que as outras substituições
são parecidas. Na função `_partition` que definimos anteriormente, vamos
substituir a variável `x` por um let. No momento essa função está assim:

~~~python
def _partition(S, L, R):
    if l2b(LAMBDA_ISEMPTY(S)): return LAMBDA_CONS(L)(R)
    x = LAMBDA_CAR(S)
    if l2b(LAMBDA_LESS(x)(p)):
        nL, nR = LAMBDA_CONS(x)(L), R
    else:
        nL, nR = L, LAMBDA_CONS(x)(R)
    S = LAMBDA_CDR(S)
    return _partition(S, L, R)
~~~

Como o `if` serve apenas para mudar o valor de `L` e `R`, podemos reescrevê-lo
como uma **if-expression**:

~~~python
def _partition(S, L, R):
    if l2b(LAMBDA_ISEMPTY(S)): return LAMBDA_CONS(L)(R)
    x = LAMBDA_CAR(S)
    nL, nR = (LAMBDA_CONS(x)(L), R) if l2b(LAMBDA_LESS(x)(p)) else (L, LAMBDA_CONS(x)(R))

    S = LAMBDA_CDR(S)
    return _partition(S, nL, nR)
~~~

Como o `x` só é calculado para ser usado nessa if-expression, podemos usar um
`let`:
- **atribuição**: `x = LAMBDA_CAR(S)`
- **expressão**: a if-expression que acabamos de introduzir

Vamos declarar, para isso, uma nova função `_partition2`, recebendo como
argumento `x`, e chamá-la logo em seguida, recebendo como argumento `x =
LAMBDA_CAR(S)`:

~~~python
def _partition(S, L, R):
    if l2b(LAMBDA_ISEMPTY(S)): return LAMBDA_CONS(L)(R)

    def _partition2(x):
        return (LAMBDA_CONS(x)(L), R) if l2b(LAMBDA_LESS(x)(p)) else (L, LAMBDA_CONS(x)(R))

    nL, nR = _partition2(LAMBDA_CAR(S))

    S = LAMBDA_CDR(S)
    return _partition(S, nL, nR)
~~~

Temos um let! Vamos aproveitar e substituir a tupla por um **par de Church**:

~~~python
def _partition(S, L, R):
    if l2b(LAMBDA_ISEMPTY(S)): return LAMBDA_CONS(L)(R)

    def _partition2(x):
        return LAMBDA_CONS(LAMBDA_CONS(x)(L))(R) if l2b(LAMBDA_LESS(x)(p)) else LAMBDA_CONS(L)(LAMBDA_CONS(x)(R))

    LR = _partition2(LAMBDA_CAR(S))
    nL, nR = LAMBDA_CAR(LR), LAMBDA_CDR(LR)

    return _partition(LAMBDA_CDR(S), nL, nR)
~~~

## Reescrevendo as funções usando `lambda`

Neste ponto, feitas todas as substituições de **variáveis por let**, as funções
`partition` e `quicksort` já não têm mais variáveis. Elas só têm alguns `if`s, a
expressão do `return` e a definição das **funções internas** usadas para fazer os
lets (que têm as mesmas características).

Dê só uma olhada (só uma olhada mesmo, o código já está ilegível):

~~~python
def quicksort(A):
    if l2b(LAMBDA_ISEMPTY(A)): return A
    if l2b(LAMBDA_ISEMPTY(LAMBDA_CDR(A))): return A

    def _quicksort(A, LR):
        return LAMBDA_IF(LAMBDA_ISEMPTY(quicksort(LAMBDA_CAR(LR))))(LAMBDA_CONS(LAMBDA_CAR(LAMBDA_CDR(LR)))(quicksort(LAMBDA_CDR(LAMBDA_CDR(LR)))))(LAMBDA_CONCAT(quicksort(LAMBDA_CAR(LR)))(LAMBDA_CONS(LAMBDA_CAR(LAMBDA_CDR(LR)))(quicksort(LAMBDA_CDR(LAMBDA_CDR(LR))))))

    return _quicksort(A, partition(A))

def partition(A):
    def _partition(S, L, R, p):
        if l2b(LAMBDA_ISEMPTY(S)): return LAMBDA_CONS(L)(R)
        def _partition2(x, L, R, p):
            if l2b(LAMBDA_LESS(x)(p)): return LAMBDA_CONS(LAMBDA_CONS(x)(L))(R)
            else: return LAMBDA_CONS(L)(LAMBDA_CONS(x)(R))

        def _partition3(S, LR, p):
            return _partition(LAMBDA_CDR(S), LAMBDA_CAR(LR), LAMBDA_CDR(LR), p)

        return _partition3(S, _partition2(LAMBDA_CAR(S), L, R, p), p)

    def _partition4(LR):
        return LAMBDA_CONS(LAMBDA_CAR(LR))(LAMBDA_CONS(LAMBDA_CAR(A))(LAMBDA_CDR(LR)))

    return _partition4(_partition(LAMBDA_CDR(A), LAMBDA_EMPTY, LAMBDA_EMPTY, LAMBDA_CAR(A)))
~~~

Podemos **substituir** esses `if`s por **if-expressions**, e essas
if-expressions pelo `LAMBDA_IF` que criamos com booleanos de Church. Além disso,
as **funções internas** podem ser definidas usando `lambda` em vez de `def`, por
só terem a **expressão de retorno**. Chegamos neste código horroroso:


~~~python
def quicksort(A):
    _quicksort = lambda A: lambda LR: LAMBDA_CONCAT(quicksort(LAMBDA_CAR(LR)))(LAMBDA_CONS(LAMBDA_CAR(LAMBDA_CDR(LR)))(quicksort(LAMBDA_CDR(LAMBDA_CDR(LR)))))

    _quicksort2 = lambda A: LAMBDA_IF(LAMBDA_ISEMPTY(A))(lambda A: A)(lambda A: LAMBDA_IF(LAMBDA_ISEMPTY(LAMBDA_CDR(A)))(A)(_quicksort(A)(partition(A))))

    return _quicksort2(A)(A)

def partition(A):
    _partition2 = lambda x: lambda L: lambda R: lambda p: LAMBDA_IF(LAMBDA_LESS(x)(p))(LAMBDA_CONS(LAMBDA_CONS(x)(L))(R))(LAMBDA_CONS(L)(LAMBDA_CONS(x)(R)))

    _partition3 = lambda S: lambda LR: lambda p: _partition(LAMBDA_CDR(S))(LAMBDA_CAR(LR))(LAMBDA_CDR(LR))(p)

    _partition = (lambda S: LAMBDA_IF(LAMBDA_ISEMPTY(S))(lambda L: lambda R: lambda p: LAMBDA_CONS(L)(R))(lambda L: lambda R: lambda p: _partition3(S)(_partition2(LAMBDA_CAR(S))(L)(R)(p))(p)))

    _partition4 = (lambda A: lambda LR: LAMBDA_CONS(LAMBDA_CAR(LR))(LAMBDA_CONS(LAMBDA_CAR(A))(LAMBDA_CDR(LR))))(A)

    return _partition4(_partition(LAMBDA_CDR(A))(LAMBDA_EMPTY)(LAMBDA_EMPTY)(LAMBDA_CAR(A)))
~~~

Neste caso, as funções internas, apesar de terem se tornado variáveis, elas são
na verdade **constantes**. Sendo assim, elas não precisam mais ficar dentro das
funções `quicksort` e `partition`. Dessa forma, `quicksort` e `partition` só
teriam a **expressão de retorno**, logo, também poderiam ser escritas usando
`lambda` em vez de `def`:

~~~python
_quicksort = lambda A: lambda LR: LAMBDA_CONCAT(quicksort(LAMBDA_CAR(LR)))(LAMBDA_CONS(LAMBDA_CAR(LAMBDA_CDR(LR)))(quicksort(LAMBDA_CDR(LAMBDA_CDR(LR)))))
_quicksort2 = lambda A: LAMBDA_IF(LAMBDA_ISEMPTY(A))(lambda A: A)(lambda A: LAMBDA_IF(LAMBDA_ISEMPTY(LAMBDA_CDR(A)))(A)(_quicksort(A)(partition(A))))
quicksort = lambda A: _quicksort2(A)(A)
_partition2 = lambda x: lambda L: lambda R: lambda p: LAMBDA_IF(LAMBDA_LESS(x)(p))(LAMBDA_CONS(LAMBDA_CONS(x)(L))(R))(LAMBDA_CONS(L)(LAMBDA_CONS(x)(R)))
_partition3 = lambda S: lambda LR: lambda p: _partition(LAMBDA_CDR(S))(LAMBDA_CAR(LR))(LAMBDA_CDR(LR))(p)
_partition = (lambda S: LAMBDA_IF(LAMBDA_ISEMPTY(S))(lambda L: lambda R: lambda p: LAMBDA_CONS(L)(R))(lambda L: lambda R: lambda p: _partition3(S)(_partition2(LAMBDA_CAR(S))(L)(R)(p))(p)))
_partition4 = (lambda A: lambda LR: LAMBDA_CONS(LAMBDA_CAR(LR))(LAMBDA_CONS(LAMBDA_CAR(A))(LAMBDA_CDR(LR))))
partition = lambda A:_partition4(A)(_partition(LAMBDA_CDR(A))(LAMBDA_EMPTY)(LAMBDA_EMPTY)(LAMBDA_CAR(A)))
~~~

### Recursão e combinador Y

Algumas dessas funções lambda são **recursivas**:
- `quicksort` chama `_quickssort2` que chama `quicksort`
- `_partition` chama `_partition3` que chama `_partition`

Porém, um dos pontos do cálculo lambda é que uma função **não precisa ter
nome**. Mas como uma função pode referenciar a si mesma sem saber o próprio nome?
A resposta para isso é o **[Combinador Y](https://en.wikipedia.org/wiki/Fixed-point_combinator#Fixed-point_combinators_in_lambda_calculus)**.

Para ilustrar o combinador Y em ação, vamos usar como exemplo uma função que
calcula fatorial:

~~~python
def fac(n):
   return 1 if n == 0 else n * fac(n-1)

# usando lambda:
fac = lambda n: 1 if n == 0 else n * fac(n-1)
~~~

Usamos então, o combinador Y para substituir a chamada de `fac`:

~~~python
fac = (lambda f: f(f))(lambda f: lambda n: 1 if n == 0 else n * f(f)(n-1))

# nem precisamos dar o nome fac. Esta expressão calcula 5! = 120 recursivamente:
(lambda f: f(f))(lambda f: lambda n: 1 if n == 0 else n * f(f)(n-1))(5)
~~~

O que acontece aí dentro? Repare que temos uma função `(lambda f: lambda n: 1 if
n == 0 else n * f(f)(n-1))` bastante parecida com a `fac` original, **exceto**
por receber um argumento `f` e chamar `f(f)` em vez de `fac`. A ideia do
combinador Y é que `f` seja sempre **mesma função**, e ela passe a **si mesma
como argumento**, recursivamente, para as chamadas recursivas tenham como fazer
outras chamadas recursivas. Quem irá garantir a **base** dessa recursão é
`(lambda f: f(f))`, que vai prover a primeira passagem daquela função para ela
mesma.

Exercício mental: simule `fac(2)`, e veja a mágica acontecendo.

#### Usando o combinador Y

Ok, vamos focar em substituir a chamada recursiva de `quicksort` pelo combinador
Y. A situação no momento é essa:

~~~python
_quicksort2 = lambda A: LAMBDA_IF(LAMBDA_ISEMPTY(A))(lambda A: A)(lambda A: LAMBDA_IF(LAMBDA_ISEMPTY(LAMBDA_CDR(A)))(A)(_quicksort(A)(partition(A))))
quicksort = lambda A: _quicksort2(A)(A)
~~~

Substituindo pelo combinador Y:

~~~python
_quicksort2 = lambda r: lambda A: LAMBDA_IF(LAMBDA_ISEMPTY(A))(lambda A: A)(lambda A: LAMBDA_IF(LAMBDA_ISEMPTY(LAMBDA_CDR(A)))(A)(_quicksort(r)(A)(partition(A))))
quicksort = (lambda r: r(r))lambda A: _quicksort2(r)(A)(A)
~~~

Exercício mental: a chamada de `quicksort` **não está** no próprio `quicksort`, e
sim em `_quicksort2` (que é chamado por `quicksort`). Como consegui usar o
combinador Y nessa situação?

## Expandindo tudo!

Neste ponto, todos os **valores**, **estruturas de dados** e `if`s são
**funções**. Além disso, essas e todas as outras funções são **valores** que podem ser
escritos em uma única expressão.

O trabalho aqui é, basicamente, substituir **todas as constantes** pelos seus
**valores**, de forma que a função `quicksort` vire uma única expressão. Isso
pode ser feito usando a própria substituição de um editor de texto, por exemplo.

Eis que chegamos nesta coisa horrível:

`quicksort = (lambda r: r(r))(lambda r: lambda A: (lambda r: lambda A: (lambda c: lambda t: lambda e: c(t)(e))((lambda l: l(lambda h: lambda t: lambda d: (lambda a: lambda b: b))((lambda a: lambda b: a)))(A))(lambda A: A)(lambda A: (lambda c: lambda t: lambda e: c(t)(e))((lambda l: l(lambda h: lambda t: lambda d: (lambda a: lambda b: b))((lambda a: lambda b: a)))((lambda p: p(lambda a: lambda b: b))(A)))(A)((lambda r: lambda A: lambda LR: (lambda c: lambda t: lambda e: c(t)(e))((lambda l: l(lambda h: lambda t: lambda d: (lambda a: lambda b: b))((lambda a: lambda b: a)))(r(r)((lambda p: p(lambda a: lambda b: a))(LR))))((lambda a: lambda b: lambda l: l(a)(b))((lambda p: p(lambda a: lambda b: a))((lambda p: p(lambda a: lambda b: b))(LR)))(r(r)((lambda p: p(lambda a: lambda b: b))((lambda p: p(lambda a: lambda b: b))(LR)))))(((lambda r: r(r)) (lambda r: lambda l1: (lambda c: lambda t: lambda e: c(t)(e))((lambda l: l(lambda h: lambda t: lambda d: (lambda a: lambda b: b))((lambda a: lambda b: a)))((lambda p: p(lambda a: lambda b: b))(l1)))(lambda l2: (lambda a: lambda b: lambda l: l(a)(b))((lambda p: p(lambda a: lambda b: a))(l1))(l2))((lambda r: lambda l2: (lambda a: lambda b: lambda l: l(a)(b))((lambda p: p(lambda a: lambda b: a))(l1))(r(r)((lambda p: p(lambda a: lambda b: b))(l1))(l2)))(r))))(r(r)((lambda p: p(lambda a: lambda b: a))(LR)))((lambda a: lambda b: lambda l: l(a)(b))((lambda p: p(lambda a: lambda b: a))((lambda p: p(lambda a: lambda b: b))(LR)))(r(r)((lambda p: p(lambda a: lambda b: b))((lambda p: p(lambda a: lambda b: b))(LR)))))))(r)(A)((lambda A:((lambda A: lambda LR: (lambda a: lambda b: lambda l: l(a)(b))((lambda p: p(lambda a: lambda b: a))(LR))((lambda a: lambda b: lambda l: l(a)(b))((lambda p: p(lambda a: lambda b: a))(A))((lambda p: p(lambda a: lambda b: b))(LR)))))(A)(((lambda r: r(r))(lambda r: lambda S: (lambda c: lambda t: lambda e: c(t)(e))((lambda l: l(lambda h: lambda t: lambda d: (lambda a: lambda b: b))((lambda a: lambda b: a)))(S))(lambda L: lambda R: lambda p: (lambda a: lambda b: lambda l: l(a)(b))(L)(R))(lambda L: lambda R: lambda p: (lambda r: lambda S: lambda LR: lambda p: r(r)((lambda p: p(lambda a: lambda b: b))(S))((lambda p: p(lambda a: lambda b: a))(LR))((lambda p: p(lambda a: lambda b: b))(LR))(p))(r)(S)((lambda x: lambda L: lambda R: lambda p: (lambda c: lambda t: lambda e: c(t)(e))((lambda m: lambda n: (lambda a: lambda b: a(b)((lambda a: lambda b: b)))((lambda m: lambda n: (lambda n: n(lambda x: (lambda a: lambda b: b))((lambda a: lambda b: a)))((lambda m: lambda n: n((lambda n: lambda f: lambda x: n(lambda g: lambda h: h(g(f)))(lambda y: x)(lambda y: y)))(m))(m)(n)))(m)(n))((lambda a: a((lambda a: lambda b: b))((lambda a: lambda b: a)))((lambda m: lambda n: (lambda a: lambda b: a(b)((lambda a: lambda b: b)))((lambda m: lambda n: (lambda n: n(lambda x: (lambda a: lambda b: b))((lambda a: lambda b: a)))((lambda m: lambda n: n((lambda n: lambda f: lambda x: n(lambda g: lambda h: h(g(f)))(lambda y: x)(lambda y: y)))(m))(m)(n)))(m)(n))((lambda m: lambda n: (lambda n: n(lambda x: (lambda a: lambda b: b))((lambda a: lambda b: a)))((lambda m: lambda n: n((lambda n: lambda f: lambda x: n(lambda g: lambda h: h(g(f)))(lambda y: x)(lambda y: y)))(m))(m)(n)))(n)(m)))(m)(n))))(x)(p))((lambda a: lambda b: lambda l: l(a)(b))((lambda a: lambda b: lambda l: l(a)(b))(x)(L))(R))((lambda a: lambda b: lambda l: l(a)(b))(L)((lambda a: lambda b: lambda l: l(a)(b))(x)(R))))((lambda p: p(lambda a: lambda b: a))(S))(L)(R)(p))(p))))((lambda p: p(lambda a: lambda b: b))(A))((lambda a: lambda b: b))((lambda a: lambda b: b))((lambda p: p(lambda a: lambda b: a))(A))))(A)))))(r)(A)(A))`
