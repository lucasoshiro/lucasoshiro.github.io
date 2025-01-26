---
title: "Python: re-creating async in 10 lines using generators"
excerpt: "Iterators + threads will be enough, blessed by functors"

header:
  teaser: /assets/images/posts/2024-05-11-splat-operator/python.jpg

lang: en
path-pt_br: /software/2025-01-25-python_async_iterators
---

## Why is it useful?

**It's not useful**. I mean, nowadays Python has
[native coroutines](https://peps.python.org/pep-0492/) and in the past we could
use a specialized library such as [ReactiveX](https://reactivex.io).

It doesn't mean that we can't have fun and try to write the simplest coroutine
implementation that I can think of. Asynchronous programming is often a
considered a hard concept to be fully understood, but actually, they can be
quite simple to implement.

This implementation is based on
[JS's promises](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Promise)
and on Haskell's [IO Monad](https://www.haskell.org/tutorial/io.html).
But you don't have to understand them previously to follow this.

### Goals

- Write a simple async implementation
- Use only functions, threads and iterator-based stuff
- Get inspiration from functional programming and category theory, specially
  from the concept of a functor

### Non-goals

- Replace the native async or any other implemention
- Explain monads. I won't say anything about monads, only functors

## The problem

Let's imagine this simple situation: we have two large **files**, `long1.txt` and
`long2.txt`. They are only **lists of numbers**:

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

If you want to follow this in your machine, I wrote a simple script for
generating those files [here](https://github.com/lucasoshiro/async_generator/blob/main/gen_long_files.py)

We want to **add the second-to-last numbers of the two files** in a dumb way,
reading the two files into the memory, getting the lines, casting into numbers
and adding them:

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

Note that `lines1` and `lines2` are lists of lines.

If you run this code (available
[here](https://github.com/lucasoshiro/async_generator/blob/main/not_async_read.py)), you'll see this output:

~~~
reading file long1.txt
file read long1.txt
reading file long2.txt
file read long2.txt
149999994
~~~

This is, firstly it reads `long1.txt` entirely, then it reads `long2.txt`
entirely and after that it prints the result.

## Asynchronous reading

Cool, but reading files are mostly IO operations. It **blocks** our program,
waiting until both of those reads finish their readings.

**JavaScript** solves that using that using Promises. The equivalent code in Node.js
and using Promises would be this:

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

This way, `async_lines1` and `async_lines2` are not lists of lines. They are
Promises of lists of lines. A Promise is not the value itself, it is a
_promise_ that the value will eventually exist. All you can do is tell what
to do with the value when it arrives (`.then`), although it's possible to join
many Promises of single values into a single promise of many values (`.all`).

This way, `async_lines2` will be created even if `long1.txt` is not read
completely. In other words, that program will **not be blocked** by the slow IO
operation, it will go on. When the IO operation finishes, then it can proceed to
execute the action of printing.

## Functors

Before going on, I'll try to introduce the concept of **functor**.
Functor is a concept that
[comes from category theory](https://pt.wikipedia.org/wiki/Functor), but in our
context, it will be enough to see them as types which somehow contains values 
that can be mapped.

This is, given a functor **F**, for each **type** (int, float, string, and so
on) you'll have **another type** (F of int, F of float, F of string and so
on). Also, for each **function** between those types (e.g., a function that
takes float and returns int) you'll have **other function** between F of those
types (that is, a function that takes F of float and returns F of int). By
function here I mean in the math sense, where it can be in Python a function, an
operation, an expression and so on.

In other words, for each _type_ you'll have a doppelgänger **F of _type_** that
has doppelgänger **values** and doppelgänger **functions**.

Confused? Let me give a example: **list** is a functor. For each _type_
available in Python (int, string, float, and so on), we also have a _list of
type_ (list of int, list of string, list of float). Perhaps in Python this is
not so clear because lists don't have the constraint of having only one type,
but in Java, for example, you would need to declare the type that the list
holds:

~~~java
String aString;
List<String> aListOfStrings;
~~~

Ok, but, how about the functions? Back to Python, I'll use as example `int`,
which is a function that can take a string and returns a int. The doppelgänger of
that function is taking a _list of string_ and returning a _list of int_,
this way:

~~~python
my_string = '1'
my_list_of_string = ['1', '2', '3']

# takes a string, returns an int
my_int = int(my_string)

# takes a list of string, returns a list of int
my_list_of_int = [int(x) for x in my_list_of_strings]
~~~

Want another example? Now, in JS: **Promises** are functors. For each type
(Number, Boolean, String, ...) you have a Promise of that type (Promise of
Number, Promise of Boolean, Promise of String, ...). And you'll can **map the
functions** between those types to functions between Promises of those types
using `.then`:

~~~javascript
my_string = '1';
my_promise_of_string = new Promise((resolve, _) => resolve('1'));

// takes a string, returns a int
my_int = parseInt(my_string);

// takes a Promise of string, returns a Promise of int
my_promise_of_int = my_promise_of_string.then(s => parseInt(s));
~~~

Just as a quick note, all the IO in Haskell works in a way similar to JS
Promises.

Note that **lists and Promises** are completely different things, but they
follow the same rules that make both of them functors.

## Generators

We see that lists and Promises are both functors, and we can see that the list
comprehension is the way to convert a function between two types to a function
between lists of those two types. So, can we do something similar but for a
"Promise" in Python?

Of course we can't use list comprehensions, as they are for lists. But we can
implement our promises as **[generators](https://wiki.python.org/moin/Generators)**
and then use the **generator expressions** (similar to the list comprehensions) as
our interface to **convert functions** to **functions on Promises**.

Our objective is being capable of doing something like that:

~~~python
# create a promise that returns the square of the second-to-last line in long1.txt
promise_of_lines = async_lines('long1.txt')
promise_of_line = (lines[-2] for lines in promise_of_lines)
promise_of_int = (int(line) for line in promise_of_line)
promise_of_square = (n * n for n in promise_of_int)

# print the result
promise_of_print = (print(sq) for sq in promise_of_square)
next(promise_of_print)
~~~

Note that in order to make the print happen after the reading of `long1.txt` and
its processing we used `next`. In JS, this would be equivalent to `await`.

## Threads

We want to run the file reading in **background** without blocking our program,
and we can do that by using **threads**.

Now we rewrite our function that reads lines from a file but in this
asynchronous way: returning a **promise of list of lines** instead of a **list of
lines**. When the function is called, the thread starts and it returns the
generator that works as promise. When we run `next` on that generator, it waits
for the thread to finish its job and them return the result. Between the
creation of the promise and running `next`, you can operate on the promise
(using generator expressions, our equivalent to `.then`) or doing any other
things that you want.

Look at the resulting code. Note that file reading is inside `callback`, which
is used as the target function in the thread. The list `return_value` is only a
container for a single value, which is the result of the callback function.
The returned generator will only generate a single value: the promised
value. The `or` inside the generator will make sure that the thread finished
before getting the returned value:

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

## Generalizing our solution

This function reads files in the background, but can we **generalize** it for any
other job? We just need to take that job as a parameter and put it inside the
target function of the thread. This way: 

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

And that's it, this is enough to create a promise from anything! Now, we can
re-define our `async_lines` using it:

~~~python
def async_lines(path):
    def read_lines():
        print('reading file', path)
        with open(path) as f: return_value = [*f]
        print('file read', path)

        return return_value

    return async_generator(read_lines)
~~~

## Reading two files

Ok, this seems to work quite well for a single a file. But what if we want to
operate over **two files**, just like the problem in the beginning of this
article?

We can do the same way we did in JS using `.all`: creating a **promise of list**
from a **list of promises** and then do something with the promised values. This
is also what we can do in Haskell using `sequence`:

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

But, well, we don't need to. Since we are dealing with **generators**, we simply
nest two iterations:

~~~python
result = (
    int(lines1[-2]) + int(lines2[-2])
    for lines1 in async_lines1
    for lines2 in async_lines2
)
~~~

### Does it make sense?

Just as a quick side note, in Haskell we can join two IOs of strings into a IO
of a tuple of strings by:

~~~haskell
joinIOs :: IO String -> IO String -> IO (String, String)
joinIOs io1 io2 = do
  x1 <- io1
  x2 <- io2
  return (x1, x2)
~~~

By only changing IOs of strings by lists of strings, we have this, the cartesian
product of two lists:

~~~haskell
joinLists :: [String] -> [String] -> [(String, String)]
joinLists l1 l2 = do
  x1 <- l1
  x2 <- l2
  return (x1, x2)
~~~

In Python, that is equivalent to this:

~~~python
def joinLists(l1, l2):
    return [
        (x1, x2)
        for x1 in l1
        for x2 in l2
    ]
~~~

which has the **same structure as our solution** and again, showing that our
async and lists are similar by the functor perspective!

## Conclusion

Finally, we can rewrite the code of the beginning using our `async_generator`:

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

And its output:

~~~
reading file long1.txt
reading file long2.txt
file read long2.txt
file read long1.txt
149999994
~~~

Note that it starts to read the **second file** before finishing the 
**reading of the first file**, and both files could be read in a non-blocking
way.
