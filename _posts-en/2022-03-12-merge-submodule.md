---
title: "Git: merge with submodules"
excerpt: "Post about how Git merges merges submodules"

header:
  image: /assets/images/posts/2022-03-12-merge-submodule/conflito_submodulo-en.svg
  teaser: /assets/images/posts/2022-03-12-merge-submodule/conflito_submodulo-en.svg

lang: en
path-pt_br: /posts/2022-03-12-merge-submodule
---

If you work in a project that uses Git as its version control system and and
uses submodules, maybe you have faced a situation where you needed to change a
submodule in a branch and needed to merge that branch into another.

For example: assuming that your project structure is the following, with two
Python files (one being inside a subdirectory), and a subdirectory containing a
library. In this example, that library **is not** a directory that was "copied"
into the project. Instead, the library is an external project that was included
here as a submodule:

~~~bash
$ tree 

├── some_file.py
├── some_directory
│   └── another_file.py
└── library_inside_a_submodule
│   └── library_file.py
└── .gitmodules
~~~

Due to the fact that the library is included as a submodule, its version will
be **fixed** in a commit until someone explicitly change it. That can be done
this way, for example:

~~~bash
$ git -C library_inside_a_submodule fetch
$ git -C library_inside_a_submodule checkout <commit of the new version>
$ git add library_inside_a_submodule
$ git commit
~~~

If you have done that change in a branch of yours and you want that it be
applied to another branch, you'll probably will do it by merging them. Assuming
that the other branch is called `main` and the branch of yours is called
`pr-branch`:

~~~bash
$ git checkout main
$ git merge pr-branch
~~~

Then, the commit graph look like the following, with the dotted arrows pointing
to each version of the submodule:

<div class="img-container">
  <figure>
    <img class="large" src="{{ site.baseurl }}/assets/images/posts/2022-03-12-merge-submodule/merge_duvida-en.svg">
    <figcaption>Commit graph</figcaption>
  </figure>
</div>


As we can se in the picture, we want to know **what commit** of the submodule
the merge commit will point to.

If the branch `main` haven't been changed while you was developing on
`pr-branch`, then `pr-branch` will be merged as expected, and the library will
be on the new version. Otherwise, the behavior isn't trivial:

- maybe the version on `main` will be kept;
- maybe the version on `pr-branch` will be kept;
- maybe we have a **conflict** that Git won't be able to solve without human intervention.

From this point on, I haven't found any content that explained in a complete way
what is the behavior of Git in that situation. In order to understand it, I
needed to study Git in a deeper level, even reading the source code. Then,
I wrote this post :-).

## Brief explaination about objects

If you are familiar about what are objects in Git and how they work, you can
skip to the next section. It is not my goal here to explaing deeply how they
work, only what is enough to understand merge and submodules.

So, if you are not familiar about how Git works under the hood, I suggest you to
read the sections 1.3 "What is Git", 10.2 "Git Objects" and 10.3 "Git
References" of the book Pro Git, available in several formats on
[https://git-scm.com/book/en/v2](https://git-scm.com/book/en/v2).

A brief tl;dr with what we need: the data of a repository (I'm calling
"repository" the **local** repository, on each machine) are stored in units
called **objects**. Here's a very basic graphical representation of how the
objects relate to each other:

<div class="img-container">
  <figure>
    <img class="large" src="{{ site.baseurl }}/assets/images/posts/2022-03-12-merge-submodule/objetos-en.svg">
    <figcaption>Objects blob, commit e tree, e branch</figcaption>
  </figure>
</div>


One type of object is our old friend _commit_. Each commit stores the state of the
entire project at the time it is created (not only the changes). That state
is called _snapshot_, as it can be understood as a picture of the project at
that time.

Other types of objects are _tree_ and _blob_. A tree represents the state of a
directory, being, basically, a list of its contents: subdirectories (each one
with its content being represented by a tree), or files (each one with its
content represented by a blob).

Each commit points to the tree that represents the project root at the state
that the commit stores.

Each commit also points to it(s) parent(s) commit(s), if it/they exist(s):

- A initial commit doesn't have a parent;
- A standard commit only has one parent;
- A merge commit has two or more parents, pointing to the commits that were
  merged in order to this commit be created. Usually, we merge only one branch
  into another, consequently, the resulting commit usually has two parents.

Every object is identified by its SHA-1 hash. Objects are **unique** and
**immutable**. This means, for example, that:

- two identical files are represented by the same blob;
- two identical directories are represented by the same tree;
- a file that contains different contents on distinct commits is represented by
  different blobs, each one representing the content of the file on each commit;

A branch is not an object. It is only a reference, a pointer to a
commit. Internally, it is only a file containing a hash of a commit.

## Brief explanation about merge

### Fast-forward

On the same example, if we run `git merge pr-branch`, we can find ourselves in a
situation where `pr-branch` points to a **descendent** commit of the commit that
`main` points to. In this case, by default Git doesn't do a true merge,
performing a _fast-forward_ instead. That means that Git will simply make `main`
point to the same commit as `pr-branch`.

The situation before the fast-forward looked like the following, with the blue
graph representing the commits of the project, and the red graph representing
the commits of the submodule:

<div class="img-container">
  <figure>
    <img class="large" src="{{ site.baseurl }}/assets/images/posts/2022-03-12-merge-submodule/ff-antes.svg">
    <figcaption>Commit graph before the fast-forward</figcaption>
  </figure>
</div>

After the fast-forward:

<div class="img-container">
  <figure>
    <img class="large" src="{{ site.baseurl }}/assets/images/posts/2022-03-12-merge-submodule/ff-depois.svg">
    <figcaption>Commit graph after the fast-forward</figcaption>
  </figure>
</div>

This case doesn't need further explanation about the main point of this post, as
the library will obviously be in the same version as `pr-branch` after the
fast-forward, since `main` will point to the same commit as `pr-branch`.

### True merge

A true merge happens if the commit that `pr-branch` points to is not a
descendant of the commit that `main` points to. Thus, the merge commit will be
created with two parents, just like I said before. That behavior can also be
forced even when it's possible to perform a fast-forward, using the flag
`--no-ff`.

`git merge` may have distinct behaviors depending on the selected stragy. By
default on the newer versions of Git, it uses `ort` as merge strategy. On older
versions, the default merge strategy is `recursive`.

Hence, this post will describe how `ort` works and it is also applicable to
`recursive`, however, it is not applicable to the other ones.

### Three-way merge

The decision of what is chosen to be kept in the merge commit is made by an
algorithm called _three-way merge_. It is based on three commits: the two
commits pointed by the branches that we are merging, and the best common
ancestor between them.

By "best common ancestor" we mean: a common ancestor between two commits X is
better than another common ancestor Y if X is descendant of Y. The "best of all"
will be used. More information in [git merge-base manpage](https://git-scm.com/docs/git-merge-base).

In the following three examples, the best common ancestor of two branches A and
B is the yellow commit:

<div class="img-container">
  <figure>
    <img class="large" src="{{ site.baseurl }}/assets/images/posts/2022-03-12-merge-submodule/merge_base.svg">
    <figcaption>Best common ancestors</figcaption>
  </figure>
</div>

Let's denote by `A` and `B` the two commits pointed by the branches that we want
to merge, and By `O` the best common ancestor between them. Here, a file may
have, then, up to three distinct versions, one in `A`, one `B` and one in `O`.

In order decide which version will be used, the three-way merge algorithm follow
this rule:

- If the file has the same content in both `A` and `B`, it will be kept in the
  merge
- Otherwise:
  - If the file has the same content in `A` and in `O`, the content in `B` will
    be used
  - If the file has the same content in `B` and in `O`, the content in `A` will
    be used
  - Otherwise (the contents of the file diverge in `A`, `B` and `O`): **conflict**.

We can see that in the following image. The inner circles represent the content
of a file on each commit:

<div class="img-container">
  <figure>
    <img class="large" src="{{ site.baseurl }}/assets/images/posts/2022-03-12-merge-submodule/3-way-merge-en.svg">
    <figcaption><i> Three-way merge</i></figcaption>
  </figure>
</div>

The comparison between those contents isn't made using the entire file: Git
compares the hash of the contents of each state, which is enough do
decide whether they are equal or not (remember: if the file is the same on
different commits, its content is the same, thus it is represented by the same
blob).

If there is a conflict and it's a plaintext file, then Git, by default, performs
a three-way merge internally on the file. This way, for example, if the change
from `O` to `A` was introduced in a different place of the file than the change
between `O` and `B`, both are preserved. If they were made in the same place,
then Git adds the conflict marks (`<<<<<<<`, `=======` e `>>>>>>>`) in order to
be resolved by the user.

Binary files are not resolved. The user must choose which one will be kept in
the merge commit.

## Brief explanation about submodules

Well, if you are reading this, probably you won't need an introduction to
submodules. However, it is worth to show how they are represented under the hood.

We saw that each tree represents the content of a directory. With the command
`git ls-tree` we can inspect the content of a tree. If we run `git ls-tree HEAD`
we can check the content of the tree of the current commit. In our example, it
would be something like that:

~~~bash
$ git ls-tree HEAD
100644 blob 123abc456def123abc456def123abc456def9999 .gitmodules
100644 blob 1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1234 some_file.py
040000 tree aaaaabbbbbcccccdddddeeeeefffff1111122222 some_directory
160000 commit fedcba0123456789fedcba012345678912345678 library_inside_a_submodule
~~~

The hashes in the entries of the files `some_file.py` and `.gitmodules` point to
the blobs that store its respective contents. The hash in the entry of
`some_directory` points to the tree which stores the content of that directory.

However, in the line of the `library_inside_a_submodule`, the corresponding hash
is exactly the hash of the commit of the submodule containing the current version
of the library. If we change the version of that library, that hash
changes. Consequently, the tree that represent the root directory of the project
will be another object, or in other words, other snapshot.

Graphically, the submodules would be like that:

<div class="img-container">
  <figure>
    <img class="large" src="{{ site.baseurl }}/assets/images/posts/2022-03-12-merge-submodule/objetos_submodulo-en.svg">
    <figcaption>Submodules in a commit graph</figcaption>
  </figure>
</div>

Besides that, we also have the file `.gitmodules`, that stores properties of the
submodules, for example, their directories (`path`) and the URL of the
repository from where it was cloned (`url`). More information about
`.gitmodules` can be found on its [manpage](https://git-scm.com/docs/gitmodules).

## Three-way merge of submodules

The three-way merge algorithm is also used when we merge two commits that
contains submodules. It is powered by the same mechanism that performs the
three-way merge of files. However, instead of comparing hashes of blobs, it
compares hashes of the commits of submodules:

- If the submodule points to the same commit in both `A` and `B`, that commit
  will be kept on the merge commit;
- Otherwise:
  - If the submodule points to the same commit in both `A` and `O`, the commit
    that it points to in `B` will be used in the merge commit;
  - If the submodule points to the same commit in both `B` and `O`, the commit
    that it points to in `A` will be used in the merge commit;
  - Otherwise (the commits that the submodule points to in `A`, `B` and `O`
    diverge): **conflict**

Everything is ok until here, however things can get complicated when we have a conflict...

## Resolving submodule conflicts

If we have conflicts between submodules, depending on the situation Git tries to
resolve automatically: if the commit of the submodule in `A` is descendent of the
commit of the submodule in `B`, the commit of the submodule in `A` will be
used. The opposite is also true: if the commit of the submodule in `B` is
descendant of the commit of the submodule in `A`, then the commit of the
submodule in `B` will be used. That behavior you can see 
[here, on Git source code](https://github.com/git/git/blob/c2162907e9aa884bdb70208389cb99b181620d51/merge-ort.c#L1653-L1669). 
In other words, a fast-forward is performed in the submodule.

Graphically, before merging A and B, the situation was like that:

<div class="img-container">
  <figure>
    <img class="large" src="{{ site.baseurl }}/assets/images/posts/2022-03-12-merge-submodule/ff-submodulo-antes.svg">
    <figcaption> A and B pointing to different commits of the submodule</figcaption>
  </figure>
</div>


After the merge that performs a fast-forward on the submodule, the situation is
like that:

<div class="img-container">
  <figure>
    <img class="large" src="{{ site.baseurl }}/assets/images/posts/2022-03-12-merge-submodule/ff-submodulo-depois.svg">
    <figcaption> Fast-forwarding the submodule after the merge</figcaption>
  </figure>
</div>

If it's not possible to perform that fast-forward, then Git tells us that we
have a **conflict** and the user should resolve it manually, like in this
situation: 

<div class="img-container">
  <figure>
    <img class="large" src="{{ site.baseurl }}/assets/images/posts/2022-03-12-merge-submodule/conflito_submodulo_antes.svg">
    <figcaption>Submodule conflict</figcaption>
  </figure>
</div>

Even so, if one of those commits is not descendent of the other **but** there is
a merge commit that are descendant of both, then that merge commit will be
**suggested** to the user as a solution of the conflict. Then the user may
accept the suggestion or not. That behavior can be seen
[here, on Git source code](https://github.com/git/git/blob/c2162907e9aa884bdb70208389cb99b181620d51/merge-ort.c#L1671-L1714).

Note that those submodule conflict resolution solutions are only possible if we
locally have the corresponding commit objects of the submodule. If they are not
present (for example, due to the lack of the flag `--recursive` when calling
`git clone`, or due to not running a `git submodule update`), then Git will not
be capable of resolve the conflict and then will indicate it.

## How about GitHub and GitLab?

`libgit2` is a C library that provides Git functionality. According to its 
[README](https://github.com/libgit2/libgit2/blob/9c9405df21051791d0a9092d6f363dfce3fe4544/README.md),
both GitHub and GitLab use `libgit2`. That library doesn't try to resolve
submodule conflicts as Git does, as it can be seen
[here, on libgit2 source-code](https://github.com/libgit2/libgit2/blob/2a0d0bd19b5d13e2ab7f3780e094404828cbb9a7/src/libgit2/merge.c#L862-L866),
and it is also valid for GitHub and GitLab.

Here's how we can see that:

~~~bash
$ git checkout main
$ git submodule update --init
$ git branch pr-branch

# Adding a commit to the branch main
$ git -C library_inside_a_submodule checkout some_commit~ # please, note the ~
$ git add library_inside_a_submodule
$ git commit

# Adding a commit to the branch pr-branch
$ git checkout pr-branch
$ git submodule update --init
$ git -C library_inside_a_submodule checkout some_commit # descendant of the commit in main
$ git add library_inside_a_submodule
$ git commit

# Git push, in order to make PR/MR
$ git push origin pr-branch # assuming your remote is called "origin"
~~~

Now, we are in a situation like that:

<div class="img-container">
  <figure>
    <img class="large" src="{{ site.baseurl }}/assets/images/posts/2022-03-12-merge-submodule/merge-github-antes.svg">
    <figcaption>Branches pointing to commits of the submodule that a fast-forward could be performed on</figcaption>
  </figure>
</div>

Locally, in that case, if we run `git checkout main && git merge pr-branch` it
would work, as Git would perform a fast-forward of the submodule. However, if
you open a Pull Request (GitHub) or Merge Request (GitLab) asking for merge
`pr-branch` into `main`, a submodule conflict will be indicated.

### How we can solve it?

If you are in a situation like that, you can do this:

~~~bash
$ git fetch origin main # assuming your remote is called "origin" 
$ git checkout pr-branch
$ git submodule update --init
$ git merge origin/main
$ git push origin pr-branch # assuming your remote is called "origin"
~~~

Then your commit graph will look like that:

<div class="img-container">
  <figure>
    <img class="large" src="{{ site.baseurl }}/assets/images/posts/2022-03-12-merge-submodule/merge-github-ff.svg">
    <figcaption>Merging <code>main<code> into </code>pr-branch</code></figcaption>
  </figure>
</div>

Then, the PR/MR will not be in conflict with the branch `main`. So, why does it
work? Well, we merged `main` into `pr-branch`, and locally it succeeded, as Git
could fast-forward the submodule.

After we `git push` it:

1. If no one commit any change to the `main` during that operation, then
   `pr-branch` will be descendant of `main`, and it's possible to perform a
   fast-forward;
2. If someone changed the branch `main` during that operation, then the former
   `main` (the one the you `git fetch`ed) would be the best common ancestor
   between the newer `main` (with the changes introduced by the other person) and
   `pr-branch`. This way, if the newer `main` didn't change the submodule since
   the older `main`, then the commit of the submodule from `pr-branch` will be
   chosen. It would be also true if you are not using fast-forward on GitHub or
   GitLab.


## Conclusion

When we run `git merge pr-branch`, Git tries to merge the submodules using the
three-way merge algorithm. If it is not possible, it tries to fast-forward the
submodule to the descendant commit, if there is one that is pointed by one of
the branches. GitHub and GitLab don't perform a fast-forward, so we need to merge
locally, resolving the conflict automatically or manually, in a way that allows
GitHub or GitLab perform the three-way merge without conflicts.
