---
title: "Python: 9 cool tricks with the * operator"
excerpt: "Expanding args are more useful than you think!"

lang: en
path-pt_br: /_posts-en/2024-05-11-splat-operator
---

## Intro

You may already know it, but the `*` unary operator in Python (also called
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
s = sum3(*my_dict) # = sum3(a=1, b=2) = 3, as c is using the default value (0)
```

It seems to be not so useful? Well, they're more then you think!
Here I'll show some cool constructions using `*` and `**`.

### Goals

- Show some tricks using `*` that can be helpful when dealing with lists, sets,
  tuples and dictionaries;

- Compare their performance to other imperative or functional
  constructions;

### Non-goals

- Replace `numpy`, `pandas`, `polars` or any other library that implements
  efficient data structures and their operations;

- Create a "good practice", "code standard", "do this because it is better",
  etc. **Be skeptical with everything that you read**.

## 1: Cast any iterator to lists, tuples or sets

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
and compare both approaches. We can check the bytecode using the module
`dis`. We can check the Python bytecode by running this:

```python
from dis import dis

def f(x):
    _ = [*x]
    _ = list(s)

dis(f)
```

<!-- TODO: Refazer com a versão 3.12 do python e arrumar os links! -->

This is the result:

```armasm
  2           0 BUILD_LIST               0
              2 LOAD_FAST                0 (x)
              4 LIST_EXTEND              1
              6 STORE_FAST               1 (_)

  3           8 LOAD_GLOBAL              0 (list)
             10 LOAD_FAST                0 (x)
             12 CALL_FUNCTION            1
             14 STORE_FAST               1 (_)
             16 LOAD_CONST               0 (None)
             18 RETURN_VALUE
```

The first half of that bytecode refers to `[*x]` and the second to `list(x)`.

In the **first** half (`[*x]`):

1. it creates an empty list (`BUILD_LIST 0`) and pushes it into the stack;
2. it loads the `x` into the stack;
3. it extends the empty list (`LIST_EXTEND 1`) with the iterable `x`. Equivalent to `list.extend(x)`;
4. it stores the resulting list in the variable `_`.

In the **second** half (`list(x)`):

1. it loads the `list` constructor to the stack (`LOAD_GLOBAL 0`);
2. it loads `x` into the stack (`LOAD_FAST 0`)
3. it calls `list(x)` (`CALL_FUNCTION 1`)
4. it stores the resulting list in the variable `_`.

>
> Note: `LOAD_CONST 0` and `RETURN_VALUE` are used as an implicit `return None`!
> After Python 3.12, that would be a single instruction `RETURN_CONST`.
> 

So, the key difference between them is that the first **creates an empty list**
then extend it, and the second calls the `list` constructor. Which is better?
Let's check the CPython source code!

- the `BUILD_LIST` instruction implementation 
  ([here](https://github.com/python/cpython/blob/caf6064a1bc15ac344afd78b780188e60b9c628e/Python/bytecodes.c#L1628-L1631))
  calls `_PyList_FromArraySteal`([this](https://github.com/python/cpython/blob/caf6064a1bc15ac344afd78b780188e60b9c628e/Objects/listobject.c#L3180-L3199)).
  When the size of the list is 0, it only calls `PyList_New`. It is, basically,
  memory allocation;

- the `LIST_EXTEND`instruction implementation ([here](https://github.com/python/cpython/blob/caf6064a1bc15ac344afd78b780188e60b9c628e/Python/bytecodes.c#L1633-L1649))
  calls `_PyListExtend`
  ([this](https://github.com/python/cpython/blob/caf6064a1bc15ac344afd78b780188e60b9c628e/Objects/listobject.c#L1430-L1434)),
  that is only a wrapper for `list_extend`
  ([this](https://github.com/python/cpython/blob/caf6064a1bc15ac344afd78b780188e60b9c628e/Objects/listobject.c#L1420-L1428))
  that is also only a wrapper for `_list_extend`
  ([this](https://github.com/python/cpython/blob/caf6064a1bc15ac344afd78b780188e60b9c628e/Objects/listobject.c#L1354-L1409)). 
  Then, `_list_extend` will perform different actions depending on the type of
  the parameter that was passed to it. But is enough for us to stop here;

- the `list` constructor also calls `_PyListExtend`

<!-- falar do init -->

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

The same could be done for tuples and sets, just like before. Of couse

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

Just like before, that can be used to create tuples and sets!

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
[PEP 584](https://peps.python.org/pep-0584/) in Python 3.9. That introduce an
union operator (`|`) for dictionaries just like we have in sets. Nowadays you
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

In Python we have list comprehensions, dictionary comprehensions and set
comprehensions. But we don't have tuple comprehensions:

```python
[2 * x for x in range(10)]     # list comprehension
{2 * x for x in range(10)}     # set comprehension
{x: 2 * x for x in range(10)}  # dict comprehension
(2 * x for x in range(10))     # tuple comp... no, it's a generator!
```

But we can sort of have a tuple comprehension by casting a generator to a tuple:

```python
(*(2 * x for x in range(10)),) # "tuple comprehension"
```

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
    print(pair)   # (0, 3) (1, 5) (2, 6)
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
[*zip(*my_matrix)] # transposed matrix!
```

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

## 9: Check if all elements are in a set of elements

That's a cool trick. If you want to check if all elements from a list are
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

### A note about complexity

A more imperative approach on this would be:

```python
result = True

for x in a:               # O(len(a))
   if x not in d:         # O(len(d))
       result = False
```

The `in` operation in lists are `O(n)`, so, this imperative approach is
`O(len(a) * len(d))` in the worst case and `O(len(d))` in the best case. 

Back to our previous solution, the set creation is `O(n)` and the operation
`set1 <= set2` is `O(len(set1))`, so, our solution is `O(len(a) + len(b))` in
the worst case. Much better, no doubt. But it in the best case it will also be
`O(len(a) + len(b))`, as it will need to iterate over _all_ elements from `a`
and `d` even if both lists are completely different!

This solution solves that, but of course it is not so elegant:

```python
set_d = {*d}
all(x in set_d for x in a) # it will be false on the first divergence!
```

Then, that solution is `O(len(d))` in the best case (the first element of `a` is
not in `d`), and it is still `O(len(a) + len(d))` in the worst case (all
elements of `a` are in `d`). But for small lists where this kind of concern is
not relevant I still prefer the first one only because it is so beautiful to
read.


## Conclusion

### Further readin

- [Python disassembler documentation](https://docs.python.org/3/library/dis.html)
