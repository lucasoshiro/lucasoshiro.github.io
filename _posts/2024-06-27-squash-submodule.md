---
title: "Git: the danger of squash merging submodules"
excerpt: "Or: how to silently break your deploy"

header:
    teaser: /assets/images/posts/2024-04-08-please_dont_squash/evil_squash.svg

lang: pt_br
path-en: /posts-en/2024-06-27-squash-submodule
---

**TRADUÇÃO INCOMPLETA**

## Intro

Git submodules are something that haunts me. They are a pain, but sometimes they are
the only available solution. But, well, they work if used carefully.

However, not everyone use them carefully. I mean, I can't remember how many
times I needed to explain that submodules point to commits instead of
branches... But I can't blame them, it took me a some time to _really_
understand how work, even if I used them everyday. And there are even more
things that aren't so well-known about submodules, for example, how Git merges
them, as I explained [here]({{ site.baseurl
}}/posts-en/2022-03-12-merge-submodule).

<!-- Melhorar -->
So, here I'll show a situation that I once saw.

### Goals

- Discourage the use of **squash merge** in repositories that have **submodules**;

- Show how **squash merges** can break repositories that uses submodules.

### Non-Goals

- Explain how submodules work. I did that [here]({{ site.baseurl }}/posts-en/2022-03-12-merge-submodule/#brief-explanation-about-submodules).

- Discourage the use of squash merge in a general way. I did that [here]({{ site.baseurl }}/posts-en/2024-04-08-please_dont_squash).

- Discourage the use of submodules.

## The situation

Imagine this situation: you have a **project A** that has a **project B** as a
submodule. Imagine that you have a feature that need to be developed in both A
and B to work. Let's assume that on both repositories you have a `main` branch.

### A safe workflow

A safe workflow is this:

1. develop the new feature in a branch **X** in **B*;
2. wait for review and approval of **X**, then merge **X** on **B's main**;
3. develop the new feature in a branch **Y** in **A**,  making it point to **B's main**;
4. wait for review and approval of **Y**, then merge **Y** on **A's main**;
5. deploy.

Remember submodules don't point to branches, they point to **commits**. When we
make **Y** point to **B's main** we're actually making it point to the commit
that B's main references. If are not familiar with this concept, I discussed
about how submodules work
[here]({{ site.baseurl }}/posts-en/2022-03-12-merge-submodule/#brief-explanation-about-submodules).

<div class="img-container">
  <figure>
    <img class="large" src="{{ site.baseurl }}/assets/images/posts/2024-06-27-squash-submodule/submodule_merge-en.svg">
    <figcaption>The safe workflow. A is in blue, B is in red, and the dotted arrows are the submodule references</figcaption>
  </figure>
</div>

That is an ideal workflow, but it may be to slow as you need to wait the
approval _without_ writing the new code of Y.

### A faster workflow

Waiting **X** to be approved and merged takes time, and sometimes we don't want
to be blocked by it. We can use that wait time to develop our new feature in
**A**, by pointing to **X** instead of the **B's main**:

1. develop the new feature in a branch **X** in **B**, just like before;
2. develop the new feature in a branch **Y** in **A**,  making it point to **X**;
3. wait for review and approval of **X**, then merge X on **B's main**;
4. make **Y** point to **B's** main, as it now contains the new feature;
5. wait for review and approval of **Y**, then merge Y on **A's main**;
6. deploy.

<div class="img-container">
  <figure>
    <img class="large" src="{{ site.baseurl }}/assets/images/posts/2024-06-27-squash-submodule/submodule_merge_faster-en.svg">
    <figcaption>A faster workflow. It's not wrong, but you need to be careful when doing this </figcaption>
  </figure>
</div>

No problem in doing that. If we follow that, in **step 5** the three-way merge
algorithm will make **A's main** point to **B's main**, as I explained 
[here]({{ site.baseurl }}/posts-en/2022-03-12-merge-submodule/#brief-explanation-about-submodules).

However, **step 4** is easy to forget: **A** works when it is pointing to **X**,
so, it is easy to forget to make it point to **B's main** after **X** is
merged. After that, **step 5** would point to **X** instead of **B's main**:

<div class="img-container">
  <figure>
    <img class="large" src="{{ site.baseurl }}/assets/images/posts/2024-06-27-squash-submodule/submodule_merge_step_5_wihout_4-en.svg">
    <figcaption> Step 5 of the faster workflow without step 4. </figcaption>
  </figure>
</div>

Note that doing that code won't break the code. **A's main** will point to
**X**, and it has the **same** code that it had previously plus the changes that
were introduced in X. The only drawback here would be that A's main would not
be referencing the latest commit pointed by B's main.

In fact, even though it looks wrong and it's not the ideal situation, it won't
break anything, as after **X** was merged on **B's main**, the commit pointed by
**X** will be an ancestor of **B's main**. This way, **A** would be referencing
what can be considered an older version of **B's main**. The order of the parent
commits of a merge commit doesn't matter here, and that's one of the beauties of Git.

### But...

But it works because the commit pointed by **X** is still reachable from
**B's main**. And this is because we performed a **true merge**, keeping a
reference to the merged branch. 

This is not what would happen if we performed a
**squash merge**, as the **squash merge** is the same as the **true merge** except that 
it **doesn't keep the reference to the merged branch**, as I explained
[here]({{ site.baseurl }}/posts-en/2024-04-08-please_dont_squash).

Then, things can break if you replace the merge in 3 by a squash merge. After
merging a PR (true merge, squash merge or fast forward) on GitHub, this shows
up:

<div class="img-container">
  <figure>
    <img class="large" src="{{ site.baseurl }}/assets/images/posts/2024-06-27-squash-submodule/delete_branch.png">
    <figcaption> A delete branch button </figcaption>
  </figure>
</div>

It's reasonable to click on it, as the code is already merged and you won't need
that reference anymore.

So, let's imagine the sitation where we replaced the merge in step 3 by a
**squash merge** and then clicked that button to delete X. Then, we proceed to
step 5, where we merge Y on A's main.

Supposing that even if the code worked for both the reviewers and the author, it
will **break** if we try to deploy in that situation.

And it's worse: **it only works** on the machines where the people who developed
and reviewed the code before 5, but it **won't work** on other machines! This
way, both the reviewers and the developers will swear that the code **works**
while everyone else clearly see that it is **broken**!

### What's happening???

Remember that when you perform a **squash merge** you don't reference the commit
pointed by the original branch? If you delete the original branch (that is also
a reference) on GitHub or similar you'll **lose** the last remaining reference
to that commit on the **remote** repository, but you won't lose in the machines
that still have **X**.

<div class="img-container">
  <figure>
    <img class="large" src="{{ site.baseurl }}/assets/images/posts/2024-06-27-squash-submodule/submodule_squash-en.svg">
    <figcaption><i> The previous situation, but using squash merge </i></figcaption>
  </figure>
</div>

When a commit is not reachable by any reference (normally, branches and tags) of
its repository, it can't be fetched as `git fetch` (and of course, `git pull` or
`git clone`) only fetches given a reference. Not only that, but eventually that
commit will be deleted as it is unreachable (see 
[git gc](https://git-scm.com/docs/git-gc)). It means that the **commit pointed
as submodule by A's main is lost**. This way, the code will **depend on
something that doesn't exist** anymore! And, of course, if it depends on
something that doesn't exist it won't work!


## Conclusion

Code that only works on the developer and the reviewer machines but not on other
machines is a nightmare. This is a new level of **"but it works on my machine"**
because even if you have the exact same setup as the developer, the code will
break, as the problem is a commit that doesn't exist anymore.

So, if someone uses your code as a submodule, stopping using squash is not
enough. I ask you: **DISABLE** the option to squash if you can on GitHub or
similar. This is **harmful**.

Thanks for your time! I hope that this may be useful.
If something is wrong, please open a
[issue](https://github.com/lucasoshiro/lucasoshiro.github.io/issues). 
