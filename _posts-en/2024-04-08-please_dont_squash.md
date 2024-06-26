---
title: Please stop squash merging!
excerpt: At least not before reading this!

header:
  image:
  teaser: 

lang: en
path-pt_br: /_posts-en/2024-04-08-please_dont_squash
---

## Intro

It says "x minute read". 

If you're thinking "it's easy, I'll keep squashing so I can save those x minutes
from my life", well, I must say that it is not an excuse. If you don't want to
read this, you don't need to, you can have a squash-less life without it, but
**stop doing squash merges**.

But if you are brave enough to reconsider what you know and what you do, you'll
probably won't want to squash your anymore after reading this, except in some
**very specific cases** (and those cases probably are not what you're
expecting).

So here go.

### Goals

- Explain what squash merges **actually** are, detailing how Git works under the
hood;
<!-- - Show good practices written by specists to make the commit history, in fact, **cleaner**; -->
- Show how the most well-known "pros" about squash merging are conceptually **wrong**;
- Discuss about situations that squash merges can be **harmful**;

### Non-goals

- Tell something that works for me and dictating that it will also work for you;
- Create another "good practice guide" for people follow without questioning if
  is true. **Be skeptical**;

### Why do you use squash merge?

If you consider that squash merge is a good practice, have you ever thought
**why** it is a good practice? Or are you only repeating something that you
heard?

Be honest.

In the past, I also thought it was cool, but as I studied Git a little deeper
soon I figured out that it doesn't make sense. Not only that, but it is **never
mentioned** as good practice in Git documentation, not even as a _practice_:

- [Pro Git](https://git-scm.com/book/en/v2) (the official Git book) has **two
chapters** and a appendix about **merge** and it barely mentions squash in the
merge context (it only mentions
[here](https://git-scm.com/book/en/v2/Git-Tools-Advanced-Merging#_subtree_merge)
and
[here](https://git-scm.com/book/en/v2/Git-and-Other-Systems-Git-as-a-Client#_git_branching_issues),
using squash only as an intermediate tool);

- Apart from `git merge` manpage and Pro Git, the official Git **documentation** only mentions
squash in
[gitfaq](https://git-scm.com/docs/gitfaq#Documentation/gitfaq.txt-Whatkindsofproblemscanoccurwhenmerginglong-livedbrancheswithsquashmerges),
focusing on the _problems_ of doing that;

- Last but not least, Git itself doesn't have a single "squash and merge"
command, you have to run two commands to perform it (we'll discuss about that later).

So, before we go deeper, I need you to ask you two things:

First, what do you think that a **squash merge** is? 

<textarea id="what_is_squash" style="border: 1px solid black;" placeholder="What do you think that squash is?"></textarea>

(go ahead, write it, it's only a textarea without any hidden JavaScript)

Second, why do you think you **should do it**, given the first answer?

<textarea id="why_squash" style="border: 1px solid black;" placeholder="Why do you squash?"></textarea>

Ok, thanks! We'll come here later. Now, before I tell you why you shouldn't
squash your commits (and before you squash your commits again), we need to have
it clear what a squash actually is. And I must say most people who squash do it
because they **don't know** what a squash merge is. And, again, I must say this
is because they have two major misconceptions about Git.

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
    <figcaption>Merging B on A</figcaption>
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
    <figcaption>Three-way merge</figcaption>
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
your answer similar to those? Well, I ask you that because there's something
that all those answers have in common: **they are all wrong!**

And they are wrong because, remember: **Git commits don't store changes, they store snapshots**.

Again: **Git commits don't store changes, they store snapshots**.

Now, an exercise: try to rewrite those answers (or your answer, if it has the
same idea) replacing the _wrong_ idea of commits storing changes by the
_correct_ idea of commits storing snapshots. Here's another textarea only for
your convenience:

<textarea style="border: 1px solid black;" placeholder="Come on, write!"></textarea>

Was it hard? Well, this is because that idea of **what a squash merge is** is
based on a wrong idea of what **Git is**, and it doesn't make any sense in real
life.

I bet that if you squash you do it by using the UI of GitHub or similar, and you
never did it locally on your machine through CLI. 

<!-- COLOCAR IMAGEM -->

<div class="img-container">
  <figure>
    <img class="large" src="{{ site.baseurl }}/assets/images/posts/2024-04-08-please_dont_squash/merge_button.png">
    <figcaption>Merge options on GitHub. One of them is squash and merge</figcaption>
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
alert on you that something is out of place here. 

Let's check what happens when we perform a squash merge locally:

- The first command is the squash itself. It merges the current branch with the other
  one, but it **doesn't create a merge commit**. Instead, it only merges the
  files (using the mechanism that we discussed before) in the filesystem (in Git
  jargon, working directory) and stages them just like `git add` (in Git jargon,
  it adds them to the index);

- The second command is just a standard `git commit`. When we perform a `git commit` we
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
    <figcaption>Squash merging B on A</figcaption>
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
really is. But anyway, let's read again why you think that squash merges are
good: [click here](#why_squash).

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

<div class="img-container">
  <figure>
    <img class="small" src="{{ site.baseurl }}/assets/images/posts/2024-04-08-please_dont_squash/clean_history-en.svg">
    <figcaption>The best Git history is not using Git at all (<b>this is a joke</b>)</figcaption>
  </figure>
</div>


That is our second misconception. Cleaner commit histories are better, indeed,
but a history with **fewer commits is not better**. So, what is a good commit
history?

### A good commit history

A good commit history is a history that contains **good commits**.

Personally, I'm intrigued that it is a common sense that most developers agree
that **code quality** and **data quality** are important while it is harder to
find someone that really cares about the quality of the **code repository**,
which is the **database where we store code**.

<div class="img-container">
  <figure style="padding-left: 25%; padding-right: 25%">
    <img class="large" src="{{ site.baseurl }}/assets/images/posts/2024-04-08-please_dont_squash/data_repo_code-en.svg">
    <figcaption>Your project repository is both a codebase and a database.</figcaption>
  </figure>
</div>

Lets recap some practices that we commonly associate with **code quality**:

- Code that is **easy to understand**;
- Code that implements **simple solutions**;
- Code that is **easy to debug**, when needed;
- Code that is **simple**;
- Code that can be **tested**;
- Code that follow the same **codestyle**;
- Good **documentation**.

And about **data quality**:

- Data that is **easy to retrieve**;
- Data that is **accurate**;
- Data that is **clean**.

I don't want to write a commit guideline here, but there is **a lot** of good
resources that you can read about. I'll leave some of them at the
[bottom of this page](#further-reading). I don't think that you should follow them as a
religion, but there are some practices that I think I should mention here:

1. **Atomic changes**: each commit should introduce an indivisible codeset;
2. **Write good commit messages**: use the commit message to describe the change
   you introduced;
3. **Don't commit incomplete work**: if it is not ready, then don't commit (use
   the staging area);

And we if we do that, we'll have **more commits**, but they will be
**good commits**.  They will be **meaningful** and they will be easier to debug with
tools such as the ones that I mentioned
[here]({{ site.baseurl }}/posts-en/2023-02-13-git-debug). Not only that, it will
be easier to **cherry-pick** and **revert** specific changes.

<!-- To com preguiça
Mas precisa por aqui as coisas que o matheus falou aqui: https://matheustavares.gitlab.io/slides/git_101.pdf
e por esse link tambem aqui.

falar de standard commits e git flow
-->

<!-- tambem falar das ferramentas de debug do git -->

### Case study: the repository that Git was made for

If you don't know, Git was created in 2005 by Linus Torvalds for being used by
the Linux kernel as its version control system (read more about that
[here](https://git-scm.com/book/en/v2/Getting-Started-A-Short-History-of-Git)).

Git is flexible enough to have several "right ways" to be used, so even though
the Linux kernel was the project that Git was created for, it doesn't mean that
you should do _exactly_ what they do. But of course, we can learn something
from there.

<!-- 
https://kernelnewbies.org/PatchPhilosophy
-->

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
    <figcaption>The safe workflow. A is in blue, B is in red, and the dotted arrows are the submodule references</figcaption>
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
    <figcaption>A faster workflow. It's not wrong, but you need to be careful when doing this </figcaption>
  </figure>
</div>

No problem in doing that. You only need to be careful: **step 4** is easy to forget,
specially for those who aren't familiar with submodules. The three-way merge
still works here, so it will always pick the new reference to the
submodule. That way, step 5 without step 4 would look like this:

<div class="img-container">
  <figure>
    <img class="large" src="{{ site.baseurl }}/assets/images/posts/2024-04-08-please_dont_squash/submodule_merge_step_5_wihout_4-en.svg">
    <figcaption> Step 5 of the faster workflow without step 4. </figcaption>
  </figure>
</div>

Note that doing that code won't break the code. A's main will point to X, and it
has the **same** code that it had previously plus the changes that were
introduced in X. The only drawback here would be that A's main would be not be
referencing the latest commit pointed by B's main, but it is not a problem, as
people in the future eventually will merge their branches on it and A' main will
point to that merge.

In this scenario, things can break if you replace the merge in 3 by a squash
merge. After merging a PR (true merge, squash merge or fast forward) on GitHub,
this shows up:

<div class="img-container">
  <figure>
    <img class="large" src="{{ site.baseurl }}/assets/images/posts/2024-04-08-please_dont_squash/delete_branch.png">
    <figcaption> A delete branch button </figcaption>
  </figure>
</div>

It's reasonable to click on it, as the code is already merged and you won't need
that reference anymore.

Supposing that the code worked for both the reviewers and the author, after
squash merging X on B's main and merging Y on A's main in 5, the code breaks
when we try to deploy it. And it's worse: **it only works** in the machines
where the people who developed and reviewed the code before 5, but it **doesn't
work** in other machines!

**What's happening???**

Remember that when you squash you don't reference the commit pointed by the
original branch? If you delete the original branch (that is also a reference) on
GitHub or similar you'll lose the last remaining reference to that commit on the
remote repository, but you won't in the machines that have fetched X before.

<div class="img-container">
  <figure>
    <img class="large" src="{{ site.baseurl }}/assets/images/posts/2024-04-08-please_dont_squash/submodule_squash-en.svg">
    <figcaption><i> The previous situation, but using squash merge </i></figcaption>
  </figure>
</div>

When a commit is not reachable by any reference (normally, branches and tags) of
its repository, it can't be fetched as `git fetch` (and of course, `git pull` or
`git clone`) only fetches given a reference. Not only that, but eventually that
commit will be deleted as it is unreachable. It means that the **commit pointed
as submodule by A's main is lost**. This way, the code will **depend on
something that doesn't exist** anymore!

A code that only works on the developer and the reviewer machines but not on
other machines would be a nightmare to debug. And who would suspect that the
guilty is the beloved squash merge...

So, if someone uses your code as a submodule, stopping using squash is not
enough. I ask you: **DISABLE** the option to squash if you can on GitHub or
similar. This is **harmful**.

## So, what should I do?

If you are used to perform squash merges probably your are thinking "what should
I do?", because it still feels comfortable to keep squashing even though you
they are not the best choice. Let's do the right things from now on.

### But squashing makes my life so easy...

Let's imagine you are driving a car with manual transmission. You have 5 forward
gears and one reverse. Do you think it is a good idea to drive your car
backwards because you don't want to shift gears? I hope you don't, and I hope
that you suspect that the car have 5 gears because things _are not so easy_ and
_pretending they are easy_ will not help you. And here it is the same.

<div class="img-container">
  <figure>
    <img class="small" src="{{ site.baseurl }}/assets/images/posts/2024-04-08-please_dont_squash/transmission.png">
    <figcaption></figcaption>
  </figure>
</div>


Some people say: "if you squash you have a linear history, only seeing the
merge commits". Ok, but you can do it without squashing by running:

~~~bash
git log --first-parent
~~~

"Squash merges are easy to revert":

~~~bash
git revert -m 1 <commit>
~~~

"Squash merges are easy to cherry-pick"

~~~bash
git cherry-pick -m 1 <commit>
~~~

"Squash merges are easy to `<insert something>`": read the documentation about
how to do `something` properly! No excuses!

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
  _exactly_ know**, but you are only telling that because _some senior_ told you
  to do that when you were a junior.

- The same applies here. Question **everything** that I said. Don't do
  anything only because I told here.

## Is there any use case for squash merge?

Oh yeah, of course. It is __a tool__ just like many others that Git has, so of
course it can be useful! But not as a mainstream tool, there are a lot of more
useful tools that people don't know, for example, some searching and debugging
tools that I explained [here]({{ site.baseurl }}/posts-en/2023-02-13-git-debug).

I stopped to think for about two minutes in a use case for squash. Here it is:
supposing that you have an old branch with only one commit diverging from you
main. Now you want to merge it, but the main branch changed so much that the
code would need to be compatible with those changes. 

<div class="img-container">
  <figure  style="padding-left: 25%; padding-right: 25%">
    <img class="large" src="{{ site.baseurl }}/assets/images/posts/2024-04-08-please_dont_squash/useful_squash.svg">
    <figcaption> This is the situation </figcaption>
  </figure>
</div>

An option here is to rebase `foo` onto `main`, make the code compatible with the
new `main`, and then `git commit --amend`. Other is to cherry-pick foo (in
practice, it would be the same as rebasing). But you can also do this:

~~~bash
git checkout main
git checkout -b bar
git merge --squash foo

# edit the code in order to make it compatible

git commit
~~~

In that situation, we're using `git merge --squash` to apply the changes
introduced in `foo` to our files, without commiting. Then we make the code
compatible and create a new commit.

<div class="img-container">
  <figure>
    <img class="large" src="{{ site.baseurl }}/assets/images/posts/2024-04-08-please_dont_squash/useful_squash_2.svg">
    <figcaption> After squashing `foo` on `bar`, changing it, and then commiting.</figcaption>
  </figure>
</div>


And that's it. A simple tool that may be useful in very specific situations.

## Conclusion

Thanks for your time! I hope that this may be useful.
If something is wrong, please open a
[issue](https://github.com/lucasoshiro/lucasoshiro.github.io/issues). 

And for the last time, remember:
**Git commits don't store changes, they store snapshots**!


### Further reading

For general Git information:

- [Pro Git](https://git-scm.com/book/pt-br/v2)

About commiting:
- [How to Write a Git Commit Message](https://cbea.ms/git-commit/)
- [Git 101](https://matheustavares.gitlab.io/slides/git_101.pdf)
- [Pro Git - commit guidelines](https://www.git-scm.com/book/en/v2/Distributed-Git-Contributing-to-a-Project#_commit_guidelines)


