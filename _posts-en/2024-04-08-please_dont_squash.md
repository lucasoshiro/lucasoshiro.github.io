---
title: Please don't squash your commits!
excerpt: At least not before reading this!

header:
  image:
  teaser: 

lang: en
path-pt_br: /_posts-en/2024-04-08-please_dont_squash
---

It says "x minute read". 

If you're thinking "it's easy, I'll keep squashing so I can save those x minutes
from my life", well, I must say that it is not an excuse. You don't need to read
this to have a squash-less life, so, don't read and **don't squash**.

But if you are brave to reconsider what you know and what you do, you'll
probably won't want to squash your anymore after reading this, except in some
**very specific cases** (and those cases are not what you're expecting).

And why I'm telling you to not squash? Well, before we go deeper, I need you to
ask yourelf two things: 

First, what do you think that a **squash** is in Git?

<textarea id="what_is_squash" style="border: 1px solid black;" placeholder="What do you think that squash is?"></textarea>

Second, why do you squash your commits, given the first answer?

<textarea id="why_squash" style="border: 1px solid black;" placeholder="Why do you squash?"></textarea>

Ok, thanks! We'll come here later. Now, before I tell you why you shouldn't
squash your commits (and before you squash your commits again), we need to have
it clear what a squash actually is. And I must say most people who squash do it
because they **don't know** what I squash is. And, again, I must say this is
because they have two major misconceptions about Git.

There's where we start.

## The first misconception: Git does not store changes

I strongly recommend you that you read [Pro Git](https://git-scm.com/book/en/v2), 
the official Git book. For our purposes here, [section 1.3](https://git-scm.com/book/en/v2/Getting-Started-What-is-Git%3F)
and [chapter 10](https://git-scm.com/book/en/v2/Git-Internals-Plumbing-and-Porcelain)
will be enough.

But by now what we need to know from it is that **Git commits don't store changes**.
They store **snapshots**.

Repeat after me: **"Git commits don't store changes, they store snapshots"**.

And that's the first misconception. When we're using commands such as `git show`,
`git diff` and external tools such as the Pull Request UI on GitHub we think
that commits are sets of changes of states. But no, each commit **is** a state
plus some metadata.

Under the hood, Git stores the repository data in the so-called objects. Each
object stores data and is identified by its SHA-1 hash. Roughly saying, we have
three main types of objects:

- **Blob**: contains file contents;
- **Tree**: represents a directory. It is a list of files or directories, the
  hash of their contents (a blob if it is a file or a tree if it is a directory)
  and their file permissions;
- **Commit**: contains the **author**, the **commiter**, its **timestamp** ,
  its **message**, its **parents** and the **snapshot**
  
It is important to say that the child commit points to its parent or parents,
but the parent commit doesn't point to its children. The first commit doesn't
have any parent, and a merge commit has two parents or more. In the case of
merge commits, the parent order matters.

The **snapshot** of a commit is just the tree object that represents the root
directory of the commit when it was created.

Perhaps you are thinking: "that is not possible, that would be a waste of disk
space". But that it is not true: a file that hasn't changed between two commits
has the same content in both states, so their contents are stored in the same
blob. This is also true for directories. 

And if you're thinking "this is not true, I saw something about deltas, those
are the commit changes", yeah, those deltas are changes but they are not changes
between commits. They are related to a compresion that Git does using something
called [packfile](https://git-scm.com/book/en/v2/Git-Internals-Packfiles) but
you don't need to know about them by now. Only keep in mind that Git somehow
compresses the objects, so the disk space is not something you should care too
much. This way, saving disk space **is not an excuse** for squashing!

Just one more thing: branches ares not objects. They are references, they are
only pointers to commits. This is, there's no such thing as "a commit is in a
branch", as a branch is not a set of commits as we may think. But it is very
common to say that, even though it is not 100% correct. It is just a shorter
way to say "the commit is an ancestor of the commit pointed by the branch".

You can see that in this horrible picture:

<div class="img-container">
  <figure>
    <img class="large" src="{{ site.baseurl }}/assets/images/posts/2022-03-12-merge-submodule/objetos-en.svg">
    <figcaption>Blob, commit, tree and branch</figcaption>
  </figure>
</div>


I disccussed a little more about objects
[here]({{ site.baseurl }}/posts-en/2022-03-12-merge-submodule/#brief-explaination-about-objects),
but again, I strongly suggest you to read about that on Pro Git for more
datailed info.

## How merge works

Now that we know what a commit and a branch are, we can proceed to see how merge
works.

In Git, by "merge" we can think as three things, at least:

1. The command `git merge`
2. A merge commit (i.e. a commit with two or more parents)
3. The mechanism used by `git merge` to join the contents of both branches

When you run `git merge <another branch>`, you tell Git to join the contents of
both branches and create a merge commit. The merge commit will have the commit
pointed by the current HEAD as the first commit and the commit pointed by the
merged branch as its second parent.

<!-- COLOCAR IMAGEM -->

When the commit of the current branch is a direct ancestor of the commit of the
merged branch, Git will perform a **fast-forward**. Fast forwards don't create
merge commits, they only make the current branch point to the same commit as the
merged branch, so they are not true merges. You can change this behaviour by
using --no-ff. GitHub also provides a feature for merging PRs without
fast-forwarding them in those cases.

So, by now we know what is 1 (`git merge`) and 2 (merge commit), but what about
3? How does Git how to join the files of both branches? Well, Git performs an
algorithm called **three-way merge** that uses the snapshots of three commits in
order to figure out what should be kept in the merge commit and what should not:
the commit pointed by the current branch (named A), the commit pointed by the
merge branch (named B), and the commit that is the last common ancestor between
A and B (named O).

When performing a three-way merge, Git will keep everything that are the same
in A and B. If there's something different, it will compare O and A, and O and
B. If something doesn't changed from O to A but changed from O to B, it keeps
the change introduced in B, and vice-versa. If O, A and B differ, then we have a
conflict and you need to manually fix it.

This picture shows how the three-way merge works:

<div class="img-container">
  <figure>
    <img class="large" src="{{ site.baseurl }}/assets/images/posts/2022-03-12-merge-submodule/3-way-merge-en.svg">
    <figcaption><i> Three-way merge</i></figcaption>
  </figure>
</div>

This is really brief explanation about merge and there's a lot to talk about
(e.g. how Git handles renames, file permissions, submodules and so on).
[Here](http://localhost:4000/posts-en/2022-03-12-merge-submodule/#brief-explanation-about-merge)
I discussed a little more about merge, but by now this is enough.

If you are still questioning if Git really stores snapshots, try to imagine how
merge would be hard if Git stored changes.

## What __actually__ squash is

By now, we know what is a merge. But how about squash? Well, time to revisit
your answer. Click [here](#what_is_squash) to see it.

Have you answer something like "a squash is a commit that bundles all the changes
of the commits branch"? Well, if you did you are **wrong** just because 
**Git commits don't store changes, they store snapshots**. Try to rewrite this
answer with this new knowledge.

Try.

Is it hard? Well, this is because that idea of a squash is based on a wrong idea
of Git is, and it doesn't make any sense.

I bet that if you squash you do it by using the UI of GitHub or similar, and you
never did it locally on your machine through CLI. 

<!-- COLOCAR IMAGEM -->

Do you know what is the coommand for squashing a branch? Well, **there's no
command for squashing** in Git! In fact, in order to do the same thing as the
button 

## The second misconception: the fallacy of the clean history

