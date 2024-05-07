---
title: Please stop squash and merging!
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
this to have a squash-less life, so, don't read and **don't use squash and merge**.

But if you are brave to reconsider what you know and what you do, you'll
probably won't want to squash your anymore after reading this, except in some
**very specific cases** (and those cases are not what you're expecting).

If you consider that squash and merge is a good practice, have you ever thought
why, or are you only repeating something that you heard? Be honest. In the past,
I also thought it was cool, but as I studied Git a little deeper soon I figured
out that it doesn't make sense. Not only that, but it is **never mentioned** as
good practice in Git documentation, not even as a _practice_:

- [Pro Git](https://git-scm.com/book/en/v2) has two chapters and a appendix about
merge and it barely mentions squash in the merge context (it only mentions
[here](https://git-scm.com/book/en/v2/Git-Tools-Advanced-Merging#_subtree_merge)
and
[here](https://git-scm.com/book/en/v2/Git-and-Other-Systems-Git-as-a-Client#_git_branching_issues),
using squash only as intermediate tool);

- Apart from `git merge` manpage and Pro Git, the official Git documentation only mentions
squash in
[gitfaq](https://git-scm.com/docs/gitfaq#Documentation/gitfaq.txt-Whatkindsofproblemscanoccurwhenmerginglong-livedbrancheswithsquashmerges),
focusing on the _problems_ of doing that;

- Last but not least, Git itself doesn't have a single "squash and merge"
command, you have to run two commands to perform it (we'll discuss about that later).

Well, before we go deeper, I need you to ask you two things:

First, what do you think that a **squash** is in Git? 

<textarea id="what_is_squash" style="border: 1px solid black;" placeholder="What do you think that squash is?"></textarea>

(go ahead, write it, it's only a textarea without any hidden JavaScript)

Second, why do you think you should do it, given the first answer?

<textarea id="why_squash" style="border: 1px solid black;" placeholder="Why do you squash?"></textarea>

Ok, thanks! We'll come here later. Now, before I tell you why you shouldn't
squash your commits (and before you squash your commits again), we need to have
it clear what a squash actually is. And I must say most people who squash do it
because they **don't know** what a squash is. And, again, I must say this is
because they have two major misconceptions about Git.

There's where we start.

## The first misconception: what a commit stores

I strongly recommend you that you read [Pro Git](https://git-scm.com/book/en/v2), 
the official Git book. For our purposes here, [section 1.3](https://git-scm.com/book/en/v2/Getting-Started-What-is-Git%3F)
and [chapter 10](https://git-scm.com/book/en/v2/Git-Internals-Plumbing-and-Porcelain)
will be enough. But by now what we need to know from it is that **Git commits don't store changes**.
They store **snapshots**.

Repeat after me: **"Git commits don't store changes, they store snapshots"**.

And that's the first misconception. When we're using commands such as `git show`,
`git diff` or external tools such as the Pull Request UI on GitHub we think
that commits are sets of changes of states. But no, each commit **is** a state
plus some metadata.

Under the hood, Git stores the repository data in the so-called objects. Each
object stores data and is identified by its SHA-1 hash. Roughly saying, we have
three main types of objects:

<div class="img-container">
  <figure>
    <img class="large" src="{{ site.baseurl }}/assets/images/posts/2024-04-08-please_dont_squash/objects-en.svg">
    <figcaption>Blob, commit, tree and branch. Sorry for the awful diagram...</figcaption>
  </figure>
</div>


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

For now on, sometimes I'll refer to a commit pointed by a branch as just "a
branch".




I disccussed a little more about objects
[here]({{ site.baseurl }}/posts-en/2022-03-12-merge-submodule/#brief-explaination-about-objects),
but again, I strongly suggest you to read about that on Pro Git for more
datailed info.

### How merge works

Now that we know what a commit and a branch are, we can proceed to see how merge
works.

In Git, by "merge" we can think as three things, at least:

1. The command `git merge`
2. A merge commit (i.e. a commit with two or more parents)
3. The mechanism used by `git merge` to join the contents of both branches

When you run `git merge <another branch>`, you tell Git to join the contents of
both branches and create a merge commit. The merge commit will have as the first
parent the one pointed by the current HEAD and the commit pointed by the
merged branch as its second parent.

<div class="img-container">
  <figure>
    <img class="large" src="{{ site.baseurl }}/assets/images/posts/2024-04-08-please_dont_squash/merge.svg">
    <figcaption><i>Merging B on A</i></figcaption>
  </figure>
</div>

When the commit of the current branch is a direct ancestor of the commit of the
merged branch, Git will perform a **fast-forward**. Fast forwards don't create
merge commits, they only make the current branch point to the same commit as the
merged branch, so they are not true merges. You can change this behaviour by
using ``--no-ff``. GitHub also provides a feature for merging PRs without
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
    <img class="large" src="{{ site.baseurl }}/assets/images/posts/2024-04-08-please_dont_squash/3-way-merge-en.svg">
    <figcaption><i> Three-way merge</i></figcaption>
  </figure>
</div>

This mechanism is also used in other commands, such as cherry-pick,
revert, rebase and squash, but this is a topic for another post.

This is really brief explanation about merge and there's a lot to talk about
(e.g. how Git handles renames, file permissions, submodules and so on).
[Here]({{ site.baseurl }}/posts-en/2022-03-12-merge-submodule/#brief-explanation-about-merge)
I discussed a little more about merge, but by now this is enough.

If you are still questioning if Git really stores snapshots, try to imagine how
hard and expensive merge would be if Git stored changes.

### What _actually_ squash is

By now, we know what is a merge. But how about a squash merge? I just googled
"why squash merge?" and I found these definitions about what it is:

- "Instead of each commit on the topic branch being added to the history of the
  default branch, a squash merge adds all the file changes to a single new
  commit on the default branch"
  
- "It turns all your changes into one single commit and then adds that to the
  main branch"

- "By squashing commits, developers can condense a series of small, incremental
  changes into a single meaningful change"
  
- "Squashing retains the changes but discards all the individual commits"

Well, time to revisit your answer. Click [here](#what_is_squash) to see it. Is
your answer similar to those? Well, I ask you that because somthing that those
answers have in common: **they are all wrong!**

And they are wrong because, remember: **Git commits don't store changes, they store snapshots**.

Again: **Git commits don't store changes, they store snapshots**.

Now, an exercise: try to rewrite those answers (or your answer, if it has the
same idea) replacing the _wrong_ idea of commits storing changes by the
_correct_ idea of commits storing snapshots. Here's another textarea only for
your convenience:

<textarea style="border: 1px solid black;" placeholder="Come on, write!"></textarea>

Was it hard? Well, this is because that idea of a squash merge is based on a
wrong idea of Git is, and it doesn't make any sense in real life.

I bet that if you squash you do it by using the UI of GitHub or similar, and you
never did it locally on your machine through CLI. 

<!-- COLOCAR IMAGEM -->

<div class="img-container">
  <figure>
    <img class="large" src="{{ site.baseurl }}/assets/images/posts/2024-04-08-please_dont_squash/merge_button.png">
    <figcaption><i> Merge options on GitHub. One of them is squash and merge </i></figcaption>
  </figure>
</div>


Do you know what is the command for squashing a branch? If you answered "no",
you are right. **There's no command for squash merging** in Git! In fact, in order to
do the same thing as the "squash and merge" button on GitHub you'll need **two
commands**:

~~~bash
git merge --squash another_branch
git commit
~~~

Several useful Git commands that are a single command originally were a set of
commands, such as [`git stash`](https://marc.info/?l=git&m=118318197312297&w=2),
[`git subtree`](https://marc.info/?l=git&m=132569307707479&w=2) and so on, but this
never managed (at least so far) to be a single command. That should raise an
alert on you that something is out of place here. Do you have any idea why do we
need two commands and what they do? So:

- The first one is the squash itself. It merges the current branch with the other
  one, but it **doesn't create a merge commit**. Instead, it only merges the
  files (using the mechanism that we discussed before) in the filesystem (in Git
  jargon, working directory) and stages them just like `git add` (in Git jargon,
  it adds them to the index);

- The second is just a standard `git commit`. When we perform a `git commit` we
  create a new commit after the state of the index (the staging area), that
  contains the merged files and the untouched ones.
  
A commit whose contents are a merge of the two merged branches. Hmmmm, sounds
familiar? Isn't it a merge commit?

Oh wait, **isn't it a merge commit????**

**Are squash merge and standard merge the same??**

**WHAT???**

Please, calm down. They are different. How? Remember that a merge commit has two
or more parents? That's the difference. This commit has only **one** parent:
the commit pointed by the current branch before merging. This way,
there's no reference to the other branch, and that's **the only difference**
between the so-called "squash and merge" and the merge commit.

<div class="img-container">
  <figure>
    <img class="large" src="{{ site.baseurl }}/assets/images/posts/2024-04-08-please_dont_squash/squash_merge-en.svg">
    <figcaption><i>Squash merging B on A</i></figcaption>
  </figure>
</div>

Don't you believe? What more could change?

- The author, commiter, timestamps and message? These are only metadata
- The snapshot? No, it is the same

The only thing left is the parents. "Squash and merge" the same as the standard
merge but with a missing information: a reference to the merged branch.

Why is it good?

Is it good?

This leads to the second misconception.

## The second misconception: the fallacy of the clean history

I don't know if you still think that squash is a good idea after knowing what it
really is, but I'll give you a chance to read again what you said before about
why squash merging is a good thing, [click here](#why_squash).

Just like I did before, here are some answers from some of the first results
after a quick Google search for "why squash merge":

- "Squash merging keeps your default branch histories clean"
- "Your base branch remains clean"
- "This helps developers to maintain a clean Git commit history"
- "The use of squash merge is certainly not the only possible way to keep your
  version control history clean and readable"

See? It is very common to say that squash merges keeps the history clean by
having a single commit instead of several. And I ask you: why a commit history
with fewer commits are the better? Here's another textar... (no, enough textareas!)

If it is true, the best commit history is not commiting at all. So, the best way
to use Git is not using Git? Something is wrong here.

That is our second misconception. Cleaner commit histories are better, indeed,
but a history with fewer commits is not better. So, what is a good commit
history?

<!-- To com preguiça
Mas precisa por aqui as coisas que o matheus falou aqui: https://matheustavares.gitlab.io/slides/git_101.pdf
e por esse link tambem aqui.

falar de standard commits e git flow
-->

<!-- tambem falar das ferramentas de debug do git -->

### Case study: the repository that Git was made for

<!-- falar do kernel -->

## When squash can be evil

I think I have enough evidence for you to see that squash is not exactly
something good and the arguments to use it are based on wrong principles of Git
is and what are good practices about it. But something not being the best or
even not being 100% are not enough to convince people to stop doing it. That's
not the case of squash.

### Squashing submodules

First of all, if you use squash merges on repositories that are used as
submodules, **it can be harmful and break systems silently**.  Submodules
themselves are a pain, but sometimes they are the only available solution. But
they work if use them carefully.

Imagine this situation: you have a project A that has a project B as a
submodule. Imagine that you have a feature that need to be developed in both A
and B to work. Let's assume that on both repositories you have a `main` branch.

<!-- Por imagens -->

A safe workflow is:
1. develop the new feature in a branch X in B
2. wait for review and approval of X, then merge X on B's main
3. create a new branch Y in A,  makes it point to the commit pointed by B's main, develop the new feature in Y
4. wait for review and approval of Y, then merge Y on A's main
5. deploy

Please note that submodules don't point to branches, they point to **commits**.
If are not familiar with these, I discussed about how submodules work
[here]({{ site.baseurl }}/posts-en/2022-03-12-merge-submodule/#brief-explanation-about-submodules).

<div class="img-container">
  <figure>
    <img class="large" src="{{ site.baseurl }}/assets/images/posts/2024-04-08-please_dont_squash/submodule_merge-en.svg">
    <figcaption><i> The safe workflow. A is in blue, B is in red, and the dotted arrows are the submodule references </i></figcaption>
  </figure>
</div>

That is an ideal workflow, but sometimes in order to develop the new feature
faster people do this:

1. develop the new feature in a branch X in B
2. create a new branch Y in A, makes it point to the commit pointed by X, and develop the new feature in it
3. wait for review and approval of X, then merge X on B's main
5. wait for review and approval of Y, then merge X on A's main
6. deploy

<div class="img-container">
  <figure>
    <img class="large" src="{{ site.baseurl }}/assets/images/posts/2024-04-08-please_dont_squash/submodule_merge_faster-en.svg">
    <figcaption><i> A faster workflow. It's not wrong, but you need to be careful when doing this </i></figcaption>
  </figure>
</div>

No problem in doing that. You only need to be careful: step 4 is easy to forget,
specially for those who aren't familiar with submodules. The three-way merge
still works here, so it will always pick the new reference to the
submodule. That way, step 5 without step 4 would look like this:

<div class="img-container">
  <figure>
    <img class="large" src="{{ site.baseurl }}/assets/images/posts/2024-04-08-please_dont_squash/submodule_merge_step_5_wihout_4-en.svg">
    <figcaption><i> Step 5 of the faster workflow without step 4. </i></figcaption>
  </figure>
</div>

Note that doing that code won't break the code. A's main will point to X, and it
has the **same** code that it had previously plus the changes that were
introduced in X. The only drawback here would be that A's main would be not be
referencing the latest commit pointed by B's main, but it is not a problem, as
people in the future eventually will merge their branches on it and A will point
to that merge.

But things can break if you replace the merge in 3 by a squash and merge. Things
will even break __harder__ if you choose to automatically delete the branch
after merging. This is the case that I'll detail.

Let's go back to 4. Supposing that the developer and the reviewers tested the
code and see that it works. After squashing in 5 and merging (or squashing,
doesn't matter) in 6, the code breaks when we try to deploy it. And
it's worse: it only works on the machines where the people who developed and
reviewed the code before 5, but not on other machines!

What's happening?

Remember that when you squash you don't reference the commit pointed by the
original branch? If you delete the original branch (that is also a reference) on
GitHub or similar you'll lose the last remaining reference to that commit on the
remote repository, but you won't on the machines that have fetched them.

In this situation, the commit pointed by that branch is lost. And that is the
commit that A is pointing to after 2. From 6 on, A points to a commit that can't
be reached anymore, and the system can't be deployed.

It can be a nightmare: a code that only works on the developer and the reviewer
machines but not on anywhere else.

So, if someone uses your code as a submodule, stopping using squash is not
enough. I ask you: **DISABLE** the option to squash if you can.

## Is there any use case for squash?

## So, what should I do?

If you are used to perform squash merges probably your are thinking "what should
I do?", because it still feels comfortable to keep squashing even though you
they are not the best choice. Let's do the right things from now on.

### But squashing makes my life so easy...

Let's imagine you are driving a car with manual transmission. You have 5 gears
plus one reverse. Do you think it is a good idea to drive your car backwards
because you don't want to shift gears? I hope you don't, and I hope that you
suspect that the car have 5 gears because things _are not so easy_ and
_pretending they are easy_ will not help you. And here it is the same.

Some people say: "if you squash you have a linear history, only seing the
merge commits". Ok, but you can do it without squashing by running:

~~~bash
git log --first-parent
~~~

"Squash merges are easy to revert":

~~~bash
git revert -m 1 <commit>
~~~

"Squash mergs are easy to cherry-pick"

~~~bash
git cherry-pick -m 1 <commit>
~~~

"Squash merges are easy to `<insert something>`": read the documentation about
how to do `something`!

### Ok, I give up...

Here are some things that you can do:

- Try to apply **good commit practices** that we discussed before. It is hard at
  first, but it will pay your effort;

- On you code reviews, also **review the commit history**. Look if is clean and if
  it is not, ask to the author of the code to rewrite the history and apply
  those good commit practices;
  
- If you are a junior developer, listen to the seniors developers but don't take
  everything that they say as true. **Question everything**, and that willl make
  you grow;
  
- If you are a senior, **don't tell juniors to do something that you don't
  _exactly_ know**\, but you are only telling that because _some senior_ told you
  to do that when you were a junior.

## Conclusion

Thanks for your time!
