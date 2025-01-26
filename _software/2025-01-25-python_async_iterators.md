---
title: "Python: recriando async em 10 linhas usando generators"
excerpt: "Generators + threads serão suficientes, com a benção dos funtores"

header:
  teaser: /assets/images/posts/2024-05-11-splat-operator/python.jpg

lang: pt_br
path-en: /software-en/2025-01-25-python_async_iterators
---

## Por que isso é útil

**Não é útil**. Quero dizer, hoje em dia Python tem
[co-rotinas nativas]((https://peps.python.org/pep-0492/)) e antes poderia usar 
bibliotecas especializadas como [ReactiveX](https://reactivex.io).

Isso não significa que a gente não pode se divertir e tentar escrever a
implementação de co-rotina mais simples que eu consigo imaginar. Programação
assíncrona geralmente é considerada um conceito difícil de ser compreendido
completamente, mas na verdade, ela pode ser bem simples de implementar.

Esta implementação é baseada nas
[promessas do JS](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Promise)
e na [IO Monad](https://www.haskell.org/tutorial/io.html) do Haskell
Mas você não precisa conhecê-las previamente para entender isto.

### Objetivos

- Escrever uma implementação de async simples
- Usar somente funções, threads e coisas relacionadas a iteradores
- Usar como inspiração programação funcional e teoria das categorias,
  principalmente o conceito de funtor


### Não objetivos

- Substituir o async nativo ou qualquer outra implementação
- Explicar monads. Não vou falar nada sobre monads, só sobre funtores

## O problema

Vamos imaginar essa situação simples: temos dois **arquivos** grandes,
`long1.txt` e `long2.txt`. Eles são apenas **listas de números**:

`long1.txt`:
~~~
0
1
2
3
...
49999999
~~~

`long2.txt`:
~~~
0
2
4
6
...
99999998
~~~

Se você quer seguir isto na sua máquina, eu escrevi um script simples para gerar
esses arquivos, disponível [aqui](https://github.com/lucasoshiro/async_generator/blob/main/gen_long_files.py)

Nós queremos **adicionar os penúltimos números dos dois arquivos** de uma
maneira burra, lendo os dois arquivos na memória, pegando suas penúltiimas
linhas, convertendo elas em números e as adicionando:

~~~python
def not_async_lines(path):
    print('reading file', path)
    with open(path) as f: lines = [*f]
    print('file read', path)

    return lines

lines1 = not_async_lines('long1.txt')
lines2 = not_async_lines('long2.txt')

result = int(lines1[-2]) + int(lines2[-2])

print(result)
~~~

Note que  `lines1` e `lines2` asão listas de linhas.

Se você rodar esse código (disponível
[aqui](https://github.com/lucasoshiro/async_generator/blob/main/not_async_read.py)), 
você verá essa saída:

~~~
reading file long1.txt
file read long1.txt
reading file long2.txt
file read long2.txt
149999994
~~~

Isto é, ele lê primeiro `long1.txt` completamente, depois lê `long2.txt`
complemente e por fim mostra o resultado.

## Leitura assíncrona

Legal, mas ler arquivos é na maior parte operações de IO. Isso **bloqueia**
nosso programa, esperando até que essas duas leituras terminem.

**JavaScript** resolve isso usando Promisses. O código equivalente em Node.js e
que usa Promisses é este:

~~~javascript
import { readFile } from 'fs/promises';

function read_lines(path) {
    return readFile(path, 'utf-8').then(raw => raw.split("\n"));
}

let async_lines1 = read_lines('long1.txt');
let async_lines2 = read_lines('long2.txt');

Promise.all([async_lines1, async_lines2]).then(([lines1, lines2]) => {
    console.log(
        parseInt(lines1[lines1.length - 2]) +
        parseInt(lines2[lines1.length - 2])
    );
});
~~~

Dessa forma, `async_lines1` e `async_lines2` não são listas de linhas. Eles são
Promises de listas de linhas. Uma Promise por si só não é o valor, ela é uma
_promessa_ de que o valor eventualmente existirá. Tudo que você fazer é dizer o
que fazer com o valor quando ele chegar (`.then`), ainda que seja possível
juntar várias Promises de valores únicos em uma única Promise com vários valores
(`.all`).

Dessa forma, `async_lines2` será criado se `long1.txt` não foi lido completamente
Em outras palavras, o programa **não será bloqueado** pela lenta operação de IO,
ele irá seguir em frente. Quando a operação de IO terminar, então ele poderá
completar a ação de mostrar o resultado.

## Funtores

Antes de seguir em frente, vou tentar introduzir o conceito de **funtor**.
Funtors (em inglês, _functors_) são um conceito que
[vêm da teoria das categorias](https://pt.wikipedia.org/wiki/Functor), mas que
no nosso contexto, é suficiente vê-los como tipos que de alguma forma contêm
valores que podem ser mapeados.

Isso é, dado um funtor **F**, para cada **tipo** (int float, string, etc) você
terá **outro tipo** (F de int, F de float, F de string, etc). Além disso, para
cada **função** entre esses tipos (ex: uma função que recebe float e devolve
int) você terá **outras funções** entre os F desses tipos (no exemplo: uma
função que recebe F de float e devolve F de int). Por função aqui digo no
sentido matemático, que em Python pode ser uma função, uma operação, uma
expressão e por aí vai.

Em outras palavras, para cada _tipo_ você terá um doppelgänger
**F of _type_** que tem **valores** doppelgänger e **funções** doppelgänger.

Confuso? Deixe-me dar uma exemplo: **lista** é funtor. Para cada _tipo_
disponível em Python (int, string, float, etc) você terá uma _lista desse tipo_
(lista de int, lista de string, lista de float, etc). Talvez em Python isso não
é muito claro porque as listas não têm restrições de ter elementos de um único
tipo, porém, em Java, por exemplo, você precisa declarar o tipo que a lista
guarda:

~~~java
String aString;
List<String> aListOfStrings;
~~~

Ok, mas, e quanto às funções? De volta ao Python, vou usar como exemplo `int`,
que é uma função que pode receber uma string e devolve um int. O doppelgänger
dessa função é pegar uma _lista de string_ e devolver uma _lista de int_, assim:

~~~python
my_string = '1'
my_list_of_string = ['1', '2', '3']

# recebe uma string, devolve um int
my_int = int(my_string)

# recebe uma lista de string, devolve uma lista de int
my_list_of_int = [int(x) for x in my_list_of_strings]
~~~

Quer outro exemplo? Agora, em JS: **Promises** são funtores. Para cada tipo
(Number, Boolean, String, ...) você terá uma Promise desse tipo (Promise de
Number, Promise de Boolean, Promise de String, ...). E você pode
**mapear as funções** entre esses tipos para funções entre Promises desses tipos
usando `.then`


~~~javascript
my_string = '1';
my_promise_of_string = new Promise((resolve, _) => resolve('1'));

// recebe string, devolve int
my_int = parseInt(my_string);

// recebe promise de string, devolve promise de int
my_promise_of_int = my_promise_of_string.then(s => parseInt(s));
~~~

Como uma nota rápida, todo o IO em Haskell funciona de forma similar às Promises
do JS.

Repare que **listas e Promises** são coisas completamente diferentes, mas elas
seguem as mesmas regras que fazem delas duas funtores.

## Geradores

Podemos ver que listas e Promises são ambos funtores, e podemos ver que a list
comprehensoin é uma forma de converter uma função entre dois tipos para uma
função entre listas desses dois tipos. Então, podemos fazer algo similar para
uma "Promise" em Python?

Claro que nós não podemos usar list comprehensions, já que eles são para
listas. Mas nós podemos implementar nossas Promises como
**[geradores](https://wiki.python.org/moin/Generators)** (generators) e então
usar as **generator expressions** (similar às list comprehensions) como
nossa interface para **converter funções** para **funções sobre Promises**.

Nosso objetivo é ser capaz de fazer algo como isso:

~~~python
# cria uma "Promise" que retorna o quadrado da penúltima linha do long1.txt
promise_of_lines = async_lines('long1.txt')
promise_of_line = (lines[-2] for lines in promise_of_lines)
promise_of_int = (int(line) for line in promise_of_line)
promise_of_square = (n * n for n in promise_of_int)

# mostra o resultado
promise_of_print = (print(sq) for sq in promise_of_square)
next(promise_of_print)
~~~

Note que usamos `next` para mostrar o resultado após a leitura do arquivo
`long1.txt` e seu processamento. Em JS, isso seria o equivalente ao `await`.

## Threads

Queremos executar a leitura do arquivo em **segundo plano** sem bloquear nosso
programa, e podemos fazer isso usando **threads**.

Agora vamos reescrever nossa função que lê linhas de um arquivo, porém de uma
forma assíncrona: devolvendo uma **Promise de lista de linhas** em vez de uma
**lista de linhas**. Quando a função é chamada, a thread inicia e retorna um
gerador que funciona como Promise. Quando executamos `next` nesse gerador, ele
espera o término da thread para depois devolver o resultado. Entre a criação da
Promise e a execução do `next` você pode operar sobre a Promise (usando
generator expressions, nosso equivalente ao `.then`) ou fazer qualquer outra
coisa que você queira.

Veja agora o código resultante. Repare que a leitura do arquivo está dentro de
`callback`, que é usada como uma função alvo da thread. A lista `return_value` é
apenas um contêiner para um único valor, que será o resultado da função
callback. O gerador devolvido irá gerar apenas um único valor: o valor
prometido. O `or` dentro do gerador vai garantir que a thread terminou antes de
tentar obter o valor retornado:

~~~python
def async_lines(path):
    return_value = []

    def callback():
        print('reading file', path)
        with open(path) as f: return_value.append([*f])
        print('file read', path)

    thread = Thread(target=callback)
    thread.start()

    return (
        thread.join() or return_value[0]
        for _ in [None]
    )
~~~

## Generalizando nossa solução

Essa função lê arquivos em segundo plano, mas é possível **generalizar** ela
para qualquer outro trabalho? Só precisamos receber esse trabalho como parâmetro
e colocá-lo dentro da função alvo da thread. Assim:

~~~python
def async_generator(callback):
    return_value = []

    thread = Thread(target=lambda: return_value.append(callback()))
    thread.start()

    return (
        thread.join() or return_value[0]
        for _ in [None]
    )
~~~

E é isso, isso é suficiente para criar uma Promise a partir de qualquer coisa!
Agora, nós podemos redefinir nosso `async_lines` usando isso:

~~~python
def async_lines(path):
    def read_lines():
        print('reading file', path)
        with open(path) as f: return_value = [*f]
        print('file read', path)

        return return_value

    return async_generator(read_lines)
~~~

## Lendo dois arquivos

Ok, isso parece funcionar até que bem para um único arquivo. Mas e só nos
quisermos operar sobre **dois arquivos**, assim como o problema no início deste
artigo?

Nós podemos fazer igual o que fizemos em JS usando `.all`: criar uma
**Promise de lista** a partir de uma **lista de Promises** e então fazer algo
com os valores prometidos. Isso é também o que fazemos em Haskell com `sequence`.

~~~python
async_lines1 = async_lines('long1.txt')
async_lines2 = async_lines('long2.txt')

async_lines = (
    [
        line
        for async_line in [async_lines1, async_lines2]
        for line in async_line
    ]
    for _ in [None]
)

result = (
    int(line1[-2]) + int(line2[-2])
    for line1, line2 in async_lines
)
~~~

Porém, nós não precisamos disso tudo. Como estamos lidando com **geradores**,
nós podemos simplesmente aninhar duas iterações:

~~~python
result = (
    int(lines1[-2]) + int(lines2[-2])
    for lines1 in async_lines1
    for lines2 in async_lines2
)
~~~

### Mas isso faz sentido?

Apenas como uma nota rápida, em Haskell nós podemos juntar dois IOs de strings
em um IO de tupla de duas strings:

~~~haskell
joinIOs :: IO String -> IO String -> IO (String, String)
joinIOs io1 io2 = do
  x1 <- io1
  x2 <- io2
  return (x1, x2)
~~~

Trocando apenas os IOs de strings por listas de strings, chegamos nisto, um
produto cartesiano das listas:

~~~haskell
joinLists :: [String] -> [String] -> [(String, String)]
joinLists l1 l2 = do
  x1 <- l1
  x2 <- l2
  return (x1, x2)
~~~

Em Python, o produto cartesiano de listas pode ser feito assim:

~~~python
def joinLists(l1, l2):
    return [
        (x1, x2)
        for x1 in l1
        for x2 in l2
    ]
~~~

que tem a mesma **estrutura da nossa solução** e de novo, mostrando que nosso
async e listas são similares!

## Conclusão

Por fim, podemos reescrever o código do começo usando nosso `async_generator`:

~~~python
from threading import Thread

def async_generator(callback):
    return_value = []

    thread = Thread(target=lambda: return_value.append(callback()))
    thread.start()

    return (
        thread.join() or return_value[0]
        for _ in [None]
    )

def async_lines(path):
    def read_lines():
        print('reading file', path)
        with open(path) as f: return_value = [*f]
        print('file read', path)

        return return_value

    return async_generator(read_lines)

async_lines1 = async_lines('long1.txt')
async_lines2 = async_lines('long2.txt')

result = (
    int(lines1[-2]) + int(lines2[-2])
    for lines1 in async_lines1
    for lines2 in async_lines2
)

print(next(result))
~~~

Sendo sua saída:

~~~
reading file long1.txt
reading file long2.txt
file read long2.txt
file read long1.txt
149999994
~~~

Note que ele começa a ler o **segundo arquivo** antes de terminar a **leitura do
primeiro arquivo**, e ambos os arquivos puderam ser lidos de uma forma que não
bloqueou o código.
