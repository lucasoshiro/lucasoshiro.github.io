---
title: "Python: 9 cool tricks with the * operator"
excerpt: "Expanding args are more useful than you think!"

lang: en
path-pt_br: /posts/2024-05-11-splat-operator
---

## Intro

You may already know it, but anyway, the `*` unary operator in Python (also called
_splat operator_) expands any iterable (e. g. lists, tuples, sets and
generators) into function positional arguments. For example:

```python
def sum3(a, b, c):
    return a + b + c
    
my_list = [1, 2, 3]
sum3(*my_list) # = sum3(1, 2, 3) = 6
sum3(*range(3)) # = sum3(0, 1, 2) = 3
```

There's also the `**` operator, it expands
[mappings](https://docs.python.org/3/glossary.html#term-mapping) (i. e. a objet
that maps a key to a value, such as `dict`, a `orderedDict` or even
a `pandas.Series`) into named arguments:

```python
def sum3(a=0, b=0, c=0):
    return a + b + c
    
my_dict = {'a': 1, 'b': 2}
s = sum3(**my_dict) # = sum3(a=1, b=2) = 3, as c is using the default value (0)
```

It seems to be not so useful? Well, they're more then you think!
Here I'll show some cool constructions using `*` and `**`.

### Goals

- Show some tricks using `*` that can be helpful when dealing with lists, sets,
  tuples and dictionaries and even strings;

- Compare their performance to other imperative or functional constructions,
  measuring their time, inspecting the bytecode and inspecting CPython source
  code.

### Non-goals

- Replace `numpy`, `pandas`, `polars` or any other library that implements
  efficient data structures and their operations;

- Create a "good practice", "code standard", "do this because it is better",
  etc. **Be skeptical with everything that you read**.

## 1: Cast between lists, tuples and sets

I mentioned about the `*` being used in parameter expansion in functions, but it
can also be used to expand elements in list, tuple and set declaration syntax,
so, you can use them to easily cast between those types:

```python
# casting lists, tuples and sets
my_list = [1, 2, 3]
[*my_list]  # = [1, 2, 3]
{*my_list}  # = {1, 2, 3}
(*my_list,) # = (1, 2, 3), note the comma to ensure it's a tuple!
```

### How does it compare to using a constructor?

Perhaps you're thinking you can do the same using list, tuple and set
**constructors**, like this:

```python
# casting lists, tuples and sets
my_list = [1, 2, 3]
list(my_list)  # = [1, 2, 3]
set(my_list)   # = {1, 2, 3}
tuple(my_list) # = (1, 2, 3)
```

No problem, use what you prefer. But let's analyse what happens under the hood
and compare both approaches in the case of lists. We can check the bytecode
using the module `dis`:

```python
from dis import dis

def f(x):
    _ = [*x]
    _ = list(x)

dis(f)
```

This is the result (I'm running Python 3.12):

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

The first half of that bytecode refers to `[*x]` and the second to `list(x)`.

In the **first** half (`[*x]`):

1. it creates an empty list (`BUILD_LIST 0`) and pushes it into the stack;
2. it loads the `x` into the stack (`LOAD_FAST 0`);
3. it extends the empty list (`LIST_EXTEND 1`) with the iterable `x`. Equivalent to `list.extend(x)`;
4. it stores the resulting list in the variable `_` (`STORE_FAST 1`).

In the **second** half (`list(x)`):

1. it loads the `list` constructor to the stack (`LOAD_GLOBAL 1`);
2. it loads `x` into the stack (`LOAD_FAST 0`)
3. it calls the `list` constructor passing x as argument: `list(x)` (`CALL 1`)
4. it stores the resulting list in the variable `_` (`STORE_FAST 1`).

> Note: `RETURN_CONST 0` will make the function return `None`, as it is the
> default behaviour in Python for functions that don't have a return value!

So, the key difference between them is that the first **creates an empty list**
then extend it, and the second calls the `list` constructor. Which is better?
Let's check the CPython source code!

- the `BUILD_LIST` instruction implementation 
  ([here](https://github.com/python/cpython/blob/3.12/Python/bytecodes.c#L1501-L1504)
  calls `_PyList_FromArraySteal`([this](https://github.com/python/cpython/blob/3.12/Objects/listobject.c#L2566-L2579)).
  When the size of the list is 0, it only calls `PyList_New`. It is, basically,
  memory allocation;

- the `LIST_EXTEND`instruction implementation ([here](https://github.com/python/cpython/blob/3.12/Python/bytecodes.c#L1506-L1522))
  calls `_PyListExtend`
  ([this](https://github.com/python/cpython/blob/3.12/Objects/listobject.c#L979-L995),
  that is only a wrapper for `list_extend`, that will extend the empty list with
  the values from `x`;

- the `list` initializer
  ([here](https://github.com/python/cpython/blob/3.12/Objects/listobject.c#L2784-L2805))
  will also call `list_extend`, extending the just created list with the values
  from `x`.

So, both of them do the same!

## 2: Create lists from generators

As I said before, `*` can expand any iterable, so, you can use it with any
generator. For example, the classic `range`:

```python
[*range(5)] # = [0, 1, 2, 3, 4]
```

But you can use it with more interesting generators. I strongly suggest you to
read about the built-in module 
[itertools](https://docs.python.org/pt-br/3/library/itertools.html). It provides
several cool iterators that you can also use here. For example:

```python
from functools import permutations, pairwise

# Permutations
[*permutations([1, 2, 3])] # = [(1, 2, 3), (1, 3, 2), (2, 1, 3), (2, 3, 1), (3, 1, 2), (3, 2, 1)]

# Map each element to its next
[*pairwise([1, 2, 3, 4])]  # = [(1, 2), (2, 3), (3, 4)]
```

The same could be done for **tuples** and **sets**, just like before! And, just
like before, we can use the `list`, `tuple` and `set` constructors instead of
this syntax (and they'll do the basically the same under the hood, just like we
did in the previous trick).

## 3: Concatenate lists, tuples or sets

Since `*` can be used in declaration of lists, you can use it to join two or
more of them:

```python

list_1 = [1, 2, 3]
list_2 = [4, 5, 6]

[*list_1, *list_2] # = [1, 2, 3, 4, 5, 6]

```

You can also mix lists (and other iterables) and single elements:

```python
list_1 = [1, 2, 3]
list_2 = [4, 5, 6]

[*list_1, 11, *list_2, 12, 13, *range(3)] # = [1, 2, 3, 11, 4, 5, 6, 12, 13, 0, 1, 2]
```

Just like the previous tricks, that can be used to create tuples and sets!

### Checking the bytecode again!

Ok, but what happens internally? We can use `dis` again here:

~~~python
def f(a, b, c):
    _ = [*a, *b, *c]

dis(f)
~~~

And this is the result:

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

Quite similar to the output of the the trick 1, but here `LOAD_FAST` and
`LIST_EXTEND` are called 3 times instead of 1 (as expected, as we are
concatenating 3 lists).

## 4: Concatenate dicts

Similarly, you can concatenate two or more dictionaries, but using `**` as we're
dealing with a mapping instead of a iterator:

```python
d1 = {'I': 1, 'V': 5, 'X': 10}
d2 = {'L': 50, 'C': 100}

{**d1, **d2} # = {'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100}

```

Note that you need to use `**` here. If you use `*`, it will only expand the
**keys** of the dictionary, and then it will construct a **set** instead of a
dictionary:

```python
{*d1, *d2} # = {'C', 'I', 'L', 'V', 'X'}
```

### Note on PEP 584

That construction was more useful prior to 
[PEP 584](https://peps.python.org/pep-0584/) in Python 3.9. It introduced an
union operator (`|`) for **dictionaries** just like we have in **sets**. Nowadays you
can join two dictionaries this way:

```python
d1 | d2 # = {'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100}
```

It doesn't mean that it is useless. You can use it to create a new dictionary from other
dictionaries and new keys, for example:

```python
{**d1, **d2, 'D': 500, 'M': 1000} # = {'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C':100, 'D': 500, 'M': 1000}
```

## 5: Tuple comprehensions

In Python we have **list comprehensions**, **dictionary comprehensions** and **set
comprehensions**. But we don't have **tuple comprehensions**:

```python
[2 * x for x in range(10)]     # list comprehension
{2 * x for x in range(10)}     # set comprehension
{x: 2 * x for x in range(10)}  # dict comprehension
(2 * x for x in range(10))     # tuple comp... no, it's a generator!
```

But we can sort of have a tuple comprehension by casting a generator to a tuple,
using the trick 1:

```python
(*(2 * x for x in range(10)),) # "tuple comprehension"
```

> Note: if this it looks useful for you, perhaps tuples are not what you need.
> Tuples are more than immutable lists: typically, you use tuples where each
> position has a meaning, like an ordered pair. As a suggestion, read the
> section "Tuples Are Not Just Immutable Lists" in Luciano Ramalho's
> **Fluent Python**!

## 6: Pretty-print lists

Sometimes you want to print a list, but in a more human-readable way then the 
`[foo, bar]` representation. You can, for example, use `str.join`:

```python
my_list = [1, 2, 3]
print(' -> '.join([str(x) for x in my_list])) # 1 -> 2 -> 3
```

But there's a cleaner solution: you can use `*` to pass each element of the list
as a parameter. Then you can specify what separator you want to use:

```python
print(*my_list, sep=' -> ') # 1 -> 2 -> 3
```

Much cleaner. Another example: a simple code to generate a `.csv` file in only 3
lines:

```python
data = [
    (1, 2, 3),
    (4, 5, 6),
    (7, 8, 9)
]

with open('output.csv', 'w') as f:
    for row in data:
        print(*row, sep=',')
```

## 7: Transpose matrices

The `zip` function iterates simultaneously over two iterators, for example:

```python
for pair in zip(range(3), range(3, 6)):
    print(pair)   # (0, 3) (1, 4) (2, 5)
```

This way, you can use `*` to iterate over the elements from all the rows at the
same time using `zip`, in other words, iterate over the columns:

```python
my_matrix = [
    (1, 2, 3),
    (4, 5, 6),
    (7, 8, 9)
]

for column in zip(*my_matrix):
    print(column)   # (1, 4, 7) (2, 5, 8) (3, 6, 9)
```

If you create a list of columns, you'll have a transposed matrix! We only need
to cast `zip(*my_matrix)` into a list using the same syntax as before:

```python
[*zip(*my_matrix)] # [(1, 4, 7), (2, 5, 8), (3, 6, 9)]
```

### What about NumPy?

**NumPy** is great, of course! You can transpose a matrix only using `my_matrix.T`,
and it is **`O(1)`**. But you need to:

1. import NumPy
2. use `numpy.array` or similar

If you are already using NumPy and you need to transpose a matrix, go on, use
`.T`. But if you are going to use NumPy only to transpose a matrix, maybe it's
not the best choice. Importing NumPy and converting a vanilla matrix to NumPy
takes time.

Here's a simple test (try to run it on your machine):

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

In my machine (an old 2nd generation i5), this is the output:

~~~
Numpy loading time:  0.10406970977783203
zip time:  7.62939453125e-06
numpy time:  1.6450881958007812e-05
~~~

Note that it took **2x** the time to **create** an `np.array` from an existing
matrix and transpose it, and it took more than **10000x** to import NumPy! And
that is relatively large matrix (10x10)!

> "Do not use a cannon to kill a mosquito" - Confucius

## 8: Select unique elements

One of the differences between lists and sets is that sets can't contain the
same element twice. So, if we want a list with unique elements, we can cast it
to a set and cast it back to a list:

```python
list = [1, 1, 2, 3, 5]
[*{*list}] # [1, 2, 3, 5]
```

Note that sets are not ordered. But you can use a `collections.Counter` here,
and it will preserve the first occurence:

```python
from collections import Counter

[*Counter(list)] # [1, 2, 3, 5]

# or

Counter(list).elements()
```

> Just like before, you could use `numpy.unique`, but remember Confucius!

## 9: Check if all elements are in a set of elements

That's my favorite. If you want to check if all elements from a list are
contained in another list, you can do this (when the operands are sets, `<=`
means "is subset of"):

```python
a = [11, 22, 33]
b = [11, 22, -1]
c = [11]
d = [11, 22, 33, 44]

{*a} <= {*d} # true
{*b} <= {*d} # false
{*c} <= {*d} # false
```

You can also use `==` that to check if the elements of two lists are the same
(even if their order are different, or if they have repeated elements):

```python
{*a} == {*d}
```

You can even use it with strings. This example checks if the string contains
only vowels:

~~~python
{*my_string} <= {*'aeiou'}
~~~

### Complexity

A more imperative approach on this would be:

```python
result = True

for x in a:               # O(len(a))
   if x not in d:         # O(len(d))
       result = False
```

The `in` operation on lists are `O(n)`, so, this **imperative** approach is
`O(len(a) * len(d))` in the worst case and `O(len(d))` in the best case. 

Back to our previous solution, the set creation is `O(n)` and the operation
`set1 <= set2` is `O(len(set1))`, so, our solution is `O(len(a) + len(b))` in
the worst case. Much better, no doubt. But it in the best case it will also be
`O(len(a) + len(b))`, as it will need to iterate over _all_ elements from `a`
and `d` even if both lists are completely different! So, we can **improve our
solution**, at least in terms of complexity.

This next solution solves that, but of course it is not so elegant:

```python
set_d = {*d}
all(x in set_d for x in a) # it will be false in the first divergence!
```

Then, that solution is `O(len(d))` in the best case (the first element of `a` is
not in `d`), and it is still `O(len(a) + len(d))` in the worst case (all
elements of `a` are in `d`). But for **small lists** (or strings, tuples, etc)
where this kind of concern is not so relevant.


## Conclusion

I hope you liked this text! You if know another cool trick using `*` or `**`, if
you find something wrong, or if you have any suggestion, please let me know
[here](https://github.com/lucasoshiro/lucasoshiro.github.io/issues).

### Further reading

- [Python disassembler documentation](https://docs.python.org/3/library/dis.html)
- [Fluent Python by Luciano Ramalho](https://www.oreilly.com/library/view/fluent-python-2nd/9781492056348/)
