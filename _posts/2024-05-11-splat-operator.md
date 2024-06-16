---
title: "Python: 9 truques legais com o operador *"
excerpt: "Expandir argumentos é mais útil do que você pensa!"

header:
  teaser: /assets/images/posts/2024-05-11-splat-operator/python.jpg

lang: pt_br
path-en: /posts-en/2024-05-11-splat-operator
---

## Introdução

Você provavelmente já o conhece, mas de qualquer forma, o operador unário (`*`)
em Python (também conhecido como operador _splat_ ) expande qualquer iterável
(exemplos: listas, tuplas, conjuntos ou geradores) em argumentos posicionais de
funções. Por exemplo:

```python
def sum3(a, b, c):
    return a + b + c
    
my_list = [1, 2, 3]
sum3(*my_list) # = sum3(1, 2, 3) = 6
sum3(*range(3)) # = sum3(0, 1, 2) = 3
```

Também existe o operador `**`, ele expande 
[mapeamentos](https://docs.python.org/3/glossary.html#term-mapping) (isto é, um
objeto que mapeia uma chaves a valaores, como um `dict`, um `orderedDict` ou até
um `pandas.Series`) em argumentos nomeados:

```python
def sum3(a=0, b=0, c=0):
    return a + b + c
    
my_dict = {'a': 1, 'b': 2}
s = sum3(**my_dict) # = sum3(a=1, b=2) = 3, já que c usa o valor padrão (0)
```

Isso não parece muito útil? Bom, eles são mais do que você pensa! Aqui vou
mostrar algumas construções legais usando `*` e `**`.

### Objetivos

- Mostrar alguns truques usando `*` que podem ser úteis quando estamos lidando
  com listas, conjuntos, tuplas, dicionários e até strings;

- Comparar seu desempenho com outras construções funcionais ou imperativas,
  medindo o tempo, olhando o bytecode e o olhando código-fonte do CPython.

### Não-objetivos

- Substituir `numpy`, `pandas`, `polars` ou qualquer outra biblioteca que
  implementa estruturas de dados eficientes e suas operações;

- Criar uma "boa prática", "padrão de código", dizer "faça isso porque é
  melhor", etc. **Encare com ceticismo tudo que você lê**.

## 1: Converter entre para listas, tuplas e conjuntos

Eu mencionei sobre o `*` sendo usado como expansão de parâmetros em funções,
mas ele também pode ser usado para expandir elementos na sintaxe de declaração
de listas, tuplas e conjuntos, então, você pode usar ele facilmente para fazer
conversões entre esses tipos:

```python
# convertendo listas, tuplas e conjuntos
my_list = [1, 2, 3]
[*my_list]  # = [1, 2, 3]
{*my_list}  # = {1, 2, 3}
(*my_list,) # = (1, 2, 3), note a vírgula para garantir que é uma tupla!
```

### Como isso se compara a usar um construtor?

Talvez você está pensando que você pode fazer a mesma coisa usando **construtores**
de listas, tuplas e conjuntos, dessa forma:

```python
# convertendo listas, tuplas e conjuntos
my_list = [1, 2, 3]
list(my_list)  # = [1, 2, 3]
set(my_list)   # = {1, 2, 3}
tuple(my_list) # = (1, 2, 3)
```

Sem problemas, use o que você preferir. Mas vamos analisar o que acontece
debaixo dos panos e comparar as duas abordagens no caso das listas. Podemos
conferir o bytecode usando o módulo `dis`:

```python
from dis import dis

def f(x):
    _ = [*x]
    _ = list(x)

dis(f)
```

Este é o resultado (estou executando Python 3.12):

```armasm
  2           2 BUILD_LIST               0
              4 LOAD_FAST                0 (x)
              6 LIST_EXTEND              1
              8 STORE_FAST               1 (_)

  3          10 LOAD_GLOBAL              1 (NULL + list)
             20 LOAD_FAST                0 (x)
             22 CALL                     1
             30 STORE_FAST               1 (_)
             32 RETURN_CONST             0 (None)
```

A primeira metade do bytecode se refere a `[*x]` e a segunda a `list(x)`.

Na primeira metade (`[*x]`):

1. cria uma lista vazia (`BUILD_LIST 0`) e manda para o topo da pilha de execução;
2. carrega `x` no topo da pilha (`LOAD_FAST 0`);
3. estende a lista vazia (`LIST_EXTEND 1`) com o iterável `x`. Equivalente a `list.extend(x)`;
4. guarda o resultado na variável `_` (`STORE_FAST 1`).

Na segunda metade (`list(x)`):

1. carrega o construtor `list` na pilha (`LOAD_GLOBAL 1`);
2. carrega `x` na pilha (`LOAD_FAST 0`)
3. chama o construtor `list` passando `x`como argumento `list(x)` (`CALL 1`)
4. guarda o resultado na variável `_` (`STORE_FAST 1`).


> Nota: `RETURN_CONST 0` faz a função devolver `None`, já que esse é o
> comportamento padrão em Python para funções que não têm valor de retorno

Então, a principal diferença entre elas é que a primeira **cria uma lista
vazia** e depois a estende, enquanto que a segunda chama o construtor
`list`. Qual é melhor? Vamos ver o código fonte do CPython!

- a implementação da instrução `BUILD_LIST` 
  ([aqui](https://github.com/python/cpython/blob/3.12/Python/bytecodes.c#L1501-L1504))
  chama a função `_PyList_FromArraySteal`([esta](https://github.com/python/cpython/blob/3.12/Objects/listobject.c#L2566-L2579)).
  Quando o tamanho da lista é 0, ela somente chama `PyList_New`. Ela é, basicamente
  alocação de memória;

- a implementação da instrução `LIST_EXTEND` ([aqui](https://github.com/python/cpython/blob/3.12/Python/bytecodes.c#L1506-L1522))
  chama a função `_PyListExtend`
  ([esta](https://github.com/python/cpython/blob/3.12/Objects/listobject.c#L979-L995)),
  que é só uma casca para `list_extend`, que vai estender a lista vazia com os 
  valores  de `x`;

- o inicializador de `list`
  ([aqui](https://github.com/python/cpython/blob/3.12/Objects/listobject.c#L2784-L2805))
  também vai chamar `list_extend`, estendendo a lista vazia recém criada com
  valores de `x`.

Dessa forma, ambas fazem a mesma coisa!

## 2: Criar listas a partir de geradores

Como eu disse antes, `*` pode expandir qualquer iterável, então, você pode
usá-lo com qualquer gerador. Por exemplo, o clássico `range`:


```python
[*range(5)] # = [0, 1, 2, 3, 4]
```

Mas você também pode usar ele com geradores mais interessantes. Eu recomendo
fortemente que você leia sobre o módulo _built-in_
[itertools](https://docs.python.org/pt-br/3/library/itertools.html). Ele
disponibiliza vários iteradores interessantes que você também pode usar
aqui. Por exemplo:

```python
from functools import permutations, pairwise

# Permutaç~oes
[*permutations([1, 2, 3])] # = [(1, 2, 3), (1, 3, 2), (2, 1, 3), (2, 3, 1), (3, 1, 2), (3, 2, 1)]

# Mapeia cada elemento com o seu próximo
[*pairwise([1, 2, 3, 4])]  # = [(1, 2), (2, 3), (3, 4)]
```

A mesma coisa pode ser feita para **tuplas** e **conjuntos**, da mesma forma que
antes! E, da mesma forma que antes, a gente pode usar os construtores `list`,
`tuple` e `set` no lugar da sintaxe correspondente (e eles vão fazer basicamente
a mesma coisa debaixo dos panos, da mesma forma que o truque anterior).

## 3: Concatenar listas, tuplas e conjuntos

Como `*` pode ser usado em declaração de listas, você também pode usar para
juntar uma ou mais delas:


```python

list_1 = [1, 2, 3]
list_2 = [4, 5, 6]

[*list_1, *list_2] # = [1, 2, 3, 4, 5, 6]

```

Você ainda pode misturar listas (e outros iteráveis) e elementos soltos:

```python
list_1 = [1, 2, 3]
list_2 = [4, 5, 6]

[*list_1, 11, *list_2, 12, 13, *range(3)] # = [1, 2, 3, 11, 4, 5, 6, 12, 13, 0, 1, 2]
```

Da mesma forma que os truques anteriores, isso pode usado para criar tuplas e
conjuntos!

### Olhando o bytecode de novo

Ok, mas o que acontece internamente? Vamos usar `dis` novamente aqui:

~~~python
def f(a, b, c):
    _ = [*a, *b, *c]

dis(f)
~~~

E esse é o resultado:

~~~armasm
  2           2 BUILD_LIST               0
              4 LOAD_FAST                0 (a)
              6 LIST_EXTEND              1
              8 LOAD_FAST                1 (b)
             10 LIST_EXTEND              1
             12 LOAD_FAST                2 (c)
             14 LIST_EXTEND              1
             16 STORE_FAST               3 (_)
             18 RETURN_CONST             0 (None)

~~~

Bem parecido com a saída do truque 1, mas aqui `LOAD_FAST` e `LIST_EXTEND` são
chamados 3 vezes em vez de apenas 1 (como esperado, já que estamos concatenando
3 listas).

## 4: Concatenando dicionários

Da mesma forma, você pode concatenar dois ou mais dicionários, porém usando `**`
    já que estamos lidando com mapeamentos em vez de um iterador:

```python
d1 = {'I': 1, 'V': 5, 'X': 10}
d2 = {'L': 50, 'C': 100}

{**d1, **d2} # = {'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100}

```

Repare que você precisa usar `**` aqui. Se você usar `*`, ele vai expandir
apenas as **chaves** do dicionário, e então vai construir um **conjunto** em vez
de um dicionário:

```python
{*d1, *d2} # = {'C', 'I', 'L', 'V', 'X'}
```

### Comentário sobre PEP 584

Essa construção era mais útil antes da
[PEP 584](https://peps.python.org/pep-0584/) em Python 3.9.
Ela introduziu o operador de união (`|`) para **dicionários** da mesma forma
como já havia para **conjuntos**. Hoje em dia você pode juntar dois dicionários
da seguinte forma:

```python
d1 | d2 # = {'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100}
```

Isso não significa que este truque se tornou inútil. Você pode usá-la para
criar um novo dicionário a partir de outros dicionários e de novas chaves, por
exemplo:

```python
{**d1, **d2, 'D': 500, 'M': 1000} # = {'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C':100, 'D': 500, 'M': 1000}
```

## 5: Tuple comprehensions

Em Python nós temos **list comprehensions**, **dictionary comprehensions** e **set
comprehensions**. Mas não temos **tuple comprehensions**:

```python
[2 * x for x in range(10)]     # list comprehension
{2 * x for x in range(10)}     # set comprehension
{x: 2 * x for x in range(10)}  # dict comprehension
(2 * x for x in range(10))     # tuple comp... não, é um gerador!
```

Mas a gente meio que pode ter uma "tuple comprhension" convertendo um gerador
para uma tupla usando o truque 2:

```python
(*(2 * x for x in range(10)),) # "tuple comprehension"
```

> Note: se isso parece útil para você, então talvez tuplas não seja o que você
> está precisando! Tuplas são mais do que listas imutáveis: tipicamente, você
> usa tuplas quando cada posição tem um significado, como em um par ordenado.
> Como sugestão, leia a seção "Tuplas não são apenas listas imutáveis"
> no livro **Python Fluente** de Luciano Ramalho.

## 6: Imprimir listas de forma bonita

Às vezes você quer imprimir uma lista, mas em uma forma mais legível para humano
do que a representação `[foo, bar]`. Você pode, por exemplo, usar `str.join`:

```python
my_list = [1, 2, 3]
print(' -> '.join([str(x) for x in my_list])) # 1 -> 2 -> 3
```

Mas existe uma solução ainda mais limpa: você pode usar `*` para passar cada
elemento da lista como um parâmetro. Depois você pode especificar qual separador
você quer usar (por padrão, espaço):

```python
print(*my_list)             # 1 2 3
print(*my_list, sep=' -> ') # 1 -> 2 -> 3
```

Muito mais limpo. Outro exemplo, um código simples para gerar um arquivo CSV
em apenas 3 linhas:

```python
data = [
    (1, 2, 3),
    (4, 5, 6),
    (7, 8, 9)
]

with open('output.csv', 'w') as f:
    for row in data:
        print(*row, sep=',', file=f)
```

## 7: Transpor matrizes

A função `zip` itera simultaneamente sobre dois iteradores, por exemplo:

```python
for pair in zip(range(3), range(3, 6)):
    print(pair)   # (0, 3) (1, 4) (2, 5)
```

Dessa forma, você pode usar `*` para iterar sobre elementos de todas as linhas
ao mesmo tempo usando `zip`, ou em outras palavras, iterar sobre as colunas:


```python
my_matrix = [
    (1, 2, 3),
    (4, 5, 6),
    (7, 8, 9)
]

for column in zip(*my_matrix):
    print(column)   # (1, 4, 7) (2, 5, 8) (3, 6, 9)
```

Se você criar uma lista de colunas, então você terá uma matriz transposta! Você
só precisa converter `zip(*my_matrix)` para uma lista usando a mesma sintaxe de
antes:

```python
[*zip(*my_matrix)] # [(1, 4, 7), (2, 5, 8), (3, 6, 9)]
```

### E o NumPy?

O NumPy é incrível, é claro! Você pode transpor uma matriz usando `my_matrix.T`, 
e isso é `O(1)`. Mas você precisará:

1. importar NumPy
2. usar `numpy.array` ou similar

Se você já está usando o NumPy e você precisa transpor uma matriz, vá em frente,
use `.T`. Mas se você vai usar NumPy apenas para transpor uma matriz, talvez ele
não seja a melhor opção. Importar o NumPy e converter uma matriz de listas do
Python para NumPy custa tempo.

Aqui vai um teste simples (tente rodá-lo em sua máquina)

~~~python
from time import time

a = time(); import numpy as np; b = time()
print('Numpy loading time: ', b - a)

my_matrix = [[i * 10 + j for j in range(10)] for i in range(10)]

a = time(); transposed = [*zip(*my_matrix)]; b = time()
print('zip time: ', b - a)

a = time(); transposed = np.array(my_matrix).T; b = time()
print('numpy time: ', b - a)
~~~

Na minha máquina (um velho i5 de segunda geração), essa é a saída:

~~~
Numpy loading time:  0.10406970977783203
zip time:  7.62939453125e-06
numpy time:  1.6450881958007812e-05
~~~

Repare que ele tomou **2x** mais tempo para **criar** um `np.array` a partir de
uma matriz existente e o transpor, e tomou mais de **10000x** o tempo para
importar o NumPy! E essa é uma matriz relativamente grande (10x10)!

> "Não use um canhão para matar um mosquito" - Confúcio

## 8: Selecionar elementos sem repetição

Uma das diferenças entre listas e conjuntos é que conjuntos não podem conter o
mesmo elemento duas vezes. Então, se nós queremos uma lista com elementos
únicos, nós podemos convertê-la para um conjunto e convertê-la de volta para uma
lista:

```python
list = [1, 1, 2, 3, 5]
[*{*list}] # [1, 2, 3, 5]
```

Note que conjuntos não têm ordem. Mas você pode usar um `collections.Counter`
aqui e ele irá preservar a primeira ocorrência (caso precise):

```python
from collections import Counter

[*Counter(list)] # [1, 2, 3, 5]

# or

Counter(list).elements()
```

> Da mesma forma que antes, você poderia usar `numpy.unique`, mas lembre-se de Confúcio!

## 9: Conferir se todos os elementos estão em um conjunto

Este é meu preferido. Se você quer conferir se todos os elementos de uma lista
estão contidos em outra lista, você pode fazer isso (quando os operandos são
conjuntos, o operador `<=` significa "é um subconjunto de"):

```python
a = [11, 22, 33]
b = [11, 22, -1]
c = [11]
d = [11, 22, 33, 44]

{*a} <= {*d} # true
{*b} <= {*d} # false
{*c} <= {*d} # false
```

Você também pode usar `==` para conferir se os elementos de duas são os mesmos
(mesmo que sua ordem seja diferente ou que eles tenham elementos repetidos):

```python
{*a} == {*d}
```

Você também pode usar isso com strings. Este exemplo checa se uma string contém
apenas vogais:

~~~python
{*my_string} <= {*'aeiou'}
~~~

### Complexidade

Uma abordagem mais imperativa sobre isso seria:

```python
result = True

for x in a:               # O(len(a))
   if x not in d:         # O(len(d))
       result = False
       break
```

A operação `in` sobre listas é `O(n)`, então, essa abordagem **imperativa** é 
`O(len(a) * len(d))` no pior caso e `O(len(d))` no melhor caso. 

De volta à nossa solução anterior, a criação de um conjunto é `O(n)` e a operaçao
`set1 <= set2` é `O(len(set1))`, então, nossa solução é `O(len(a) + len(b))` no
pior caso. Muito melhor, sem dúvida. Mas no melhor caso ela também vai ser
`O(len(a) + len(b))`, já que ela precisa iterar sobre _todos_ os elementos de
`a` e `d` mesmo que essas listas sejam completamente diferentes! Então, a gente
pode **melhorar nossa solução**, pelo menos em termos de complexidade.

A nossa solução resolve isso, mas claro que ela não é tão elegante:

```python
set_d = {*d}
all(x in set_d for x in a) # devolverá False na primeira divergência!
```

Então, essa solução é `O(len(d))` no melhor caso (o primeiro elemento de `a` não
está em `d`) e ainda será `O(len(a) + len(d))` no pior caso (todos os elementos
de `a` estão em `d`). Mas para **listas pequenas** (ou strings, tuplas, etc)
esse tipo de problema não é muito relevante.

## Conclusão

Eu espero que você tenha gostado deste texto! Se você conhece algum outro truque
legal usando `*` ou `**`, se você encontrou alguma coisa errada, ou se você tem
alguma sugestão, por favor me diga 
[aqui](https://github.com/lucasoshiro/lucasoshiro.github.io/issues).

### Leitura complementar

- [Documentação do disassembler do Python](https://docs.python.org/3/library/dis.html)
- [Python Fluente, de Luciano Ramalho](https://pythonfluente.com/)
- [Complexidade de tempo em Python](https://wiki.python.org/moin/TimeComplexity)
