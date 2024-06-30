---
title: "Git: the danger of squash merging submodules"
excerpt: "Or: how to silently break your deploy"

header:
    teaser: /assets/images/posts/2024-04-08-please_dont_squash/evil_squash.svg

lang: en
path-pt_br: /posts-en/2024-06-27-squash-submodule
---

## Intro

Git submodules are something haunts me. They are a pain, but sometimes they are
the only available solution. But, well, they work if used carefully.

But not everyone use them carefully. I mean, I can't remember how many times I
needed to tell that submodules point to commits instead of branches... But I
can't blame them, it took me a some time to _really_ understand how work, even
if I used them everyday. And there are even more things that aren't so
well-known about submodules, for example, how Git merges them, as I explained
[here]({{ site.baseurl }}/posts-en/2022-03-12-merge-submodule).

<!-- Melhorar -->
So, here I'll show a situation that I once saw.

### Goals

- Discourage the use of squash merge in repositories that have submodules

- Show how squash merging can break repositories that uses submodules

### Non-Goals

- Explain how submodules work. I did that [here]({{ site.baseurl }}/posts-en/2022-03-12-merge-submodule/#brief-explanation-about-submodules).

- Discourage the use of squash merge in a general way. I did that [here]({{ site.baseurl }}/posts-en/2024-04-08-please_dont_squash).

- Discourage the use of submodules.

## The situation

Imagine this situation: you have a project A that has a project B as a
submodule. Imagine that you have a feature that need to be developed in both A
and B to work. Let's assume that on both repositories you have a `main` branch.

<!-- Por imagens -->

## A safe workflow

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

That is an ideal workflow, but it may be to slow as you need to wait the
approval _without_ writing the new code of Y.

## A faster workflow

Sometimes in order to develop the new feature faster people do this:

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

## But...

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
