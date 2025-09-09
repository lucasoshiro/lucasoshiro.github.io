---
title: "Google Summer of Code - Git"
excerpt: "My GSoC blog"

header:
  image: 
  teaser: 

lang: en
path-pt_br: /gsoc-en

layout: single
---

<style>
r { color: Red }
o { color: Orange }
g { color: Green }
</style>

## Info

- [Proposal PDF](/assets/pdf/gsoc/proposal.pdf)
- [Project details](https://summerofcode.withgoogle.com/programs/2025/projects/fGgMYHwl)
- [Interactions on the Git mailing list](https://lore.kernel.org/git/?q=%22Lucas+Seiki+Oshiro%22+%22GSoC%22)

## Final report

### Goals of the project

The main goal of this project was to introduce a new command to Git that would
be the main command for retrieving metadata from a repository. Initially called
`git repo-info`, it was later renamed to `git repo`, with `info` being a
subcommand. This allows expansions by other Git developers, for example, one
called `git repo survey` which is planned to return statistics about the
repository.

This new command is a _plumbing_ command, which in the Git jargon means that it
is a command that returns machine-readable values instead of a more
human-readable output (which in the Git jargon is called _porcelain_).

The first idea of this command was to use JSON as the output format, however, 
during the GSoC program I dropped that format because it was harder to maintain,
no other Git command returns JSON by default, and there's no real benefit on
using it. It was replaced by two other formats already used by Git: a
`<key>=<value>` and a null-terminated format.

### What was done and current state

During the GSoC period, I implemented the infrastructure of `git repo` and the
basic functionality of `git repo info`:

- Support for the `keyvalue` format
- Support for the `nul` format
- Retrieving the reference storage format (`references.format`)
- Retrieving whether the repository is shallow (`layout.shallow`)
- Retrieving whether the repository is bare (`layout.bare`)

All those features were already merge to `master`. There are two more features
under review:

- Using `-z` as an alias for `--format=null`
- Retrieving the object hashing algorithm (`object.format`)

There is other feature that is currently under development and wasn't yet
submitted for being reviewed: adding support for returning path-related values.

You can find all my interactions in the mailing list including the source code
that was submitted [here](https://lore.kernel.org/git/?q=%22Lucas+Seiki+Oshiro%22+%22GSoC%22).

### Features left

Some features that were planned but weren't submitted:

- add a `--all` flag (or similar) for returning all the values
- return path-related fields (even though it was started)
- use the top-level category name as the key

### Merged code

During the period of GSoC, only [this patchset](https://lore.kernel.org/git/20250610152117.14826-1-lucasseikioshiro@gmail.com/)
were merged. You can check its commit history by running
~~~
git log -p v2.50.0..a81224d
~~~
or you can check only the changes by running
~~~
git diff v2.50.0..a81224d
~~~
in the Git source code repository. If you don't have it cloned locally, you can
check through [GitHub's compare](https://github.com/git/git/compare/v2.50.0..a81224d).

Most of the work in this GSoC project was writing code, but interacting in the
mailing list as this is a new command and the decisions about it must be done
correctly. The dicussion about that patchset can be seen
[here](https://lore.kernel.org/git/20250610152117.14826-1-lucasseikioshiro@gmail.com/T/#u).

The other patches that I sent in the context of GSoC but before GSoC started
itself can be seen in the section ["Patches"](#patches) of this page.

### Challenges

The main challenges in this project were related to the decisions of how this
new command would behave. Writing the code itself wasn't really hard, however,
I needed to make many decisions on the output formats, the names, the behavior
and so on. The Git development is code-oriented, and even the first drafts of
how this new command would behave needed to be delivered as a code, with
documentation, tests and well-written commit history.

The development being so code-oriented has its advantages, and one that I makes
it a good approach is that one can apply the patches and see the proposal
running instead of only being planned. However, I think it made the development
slower than what I'm used to because some design decisions started to being
questioned only in their 9th version.

### Final words

I found the experience very positive. Git is a tool that I really admire and it
is very nice to be now part of it! Working on with while I was finishing my
master's degree was tiring, but it was really fun! I also had the opportunity to
work with great people, in special:

- Karthik Nayak and Patrick Steinhardt, my GSoC mentors
- Junio Hamano, the Git maintainer
- Phillip Wood and Eric Sunshine, who weren't my mentors or part of GSoC but
  reviewed almost every version of my patches
- Justin Tobler, who was interested in join forces with me, planning to add his
  work as the second subcommand of `git repo` in the future, which will perhaps
  be called `git repo survey`
- Kaartic Sivaraam and Christian Couder, the Org Admins of Git in GSoC

## Patches

| Title                                                             | URL                                                                                   | Status                          |
|-------------------------------------------------------------------|---------------------------------------------------------------------------------------|---------------------------------|
|t7603: replace test -f by test_path_is_file                        |[PATCH](https://lore.kernel.org/git/20250208165731.78804-1-lucasseikioshiro@gmail.com/)| <g>Merged to <b>master</b></g>  |
|merge-strategies.adoc: detail submodule merge                      |[PATCH](https://lore.kernel.org/git/20250227014406.20527-1-lucasseikioshiro@gmail.com/)| <g>Merged to <b>master</b></g>  |
|Add --subject-extra-prefix flag to format-patch                    |[PATCH](https://lore.kernel.org/git/20250303220029.10716-1-lucasseikioshiro@gmail.com/)| <r>Rejected</r>                 |
|Microproject Info: replace [Mentoring][PATCH] by [Mentoring PATCH] |[PATCH](https://github.com/git/git.github.io/pull/756)                                 | <g>Merged to <b>master</b></g>  |
|userdiff: add builtin driver for INI files                         |[PATCH](https://lore.kernel.org/git/20250331031309.94682-1-lucasseikioshiro@gmail.com/)| <g>Merged to <b>master</b></g>  |
|revision: remove log_reencode field from rev_info                  |[PATCH](https://lore.kernel.org/git/20250414151438.22232-1-lucasseikioshiro@gmail.com/)| <g>Merged to <b>master</b></g>  |
|json-writer: add docstrings to jw_* functions                      |[PATCH](https://lore.kernel.org/git/20250516010159.27042-1-lucasseikioshiro@gmail.com/)| <g>Merged to <b>master</b></g>  |
|Update MyFirstObjectWalk with struct repository and meson          |[PATCH](https://lore.kernel.org/git/20250529192036.75408-1-lucasseikioshiro@gmail.com/)| <g>Merged to <b>master</b></g>  |
|repo-info: add new command for retrieving repository info          |[PATCH](https://lore.kernel.org/git/20250610152117.14826-1-lucasseikioshiro@gmail.com/)| <g>Merged to <b>master</b></g>  |
|repo: add -z and objects.format                                    |[PATCH](https://lore.kernel.org/git/20250820144247.79197-1-lucasseikioshiro@gmail.com/)| <g>Merged to <b>next</b></g>  |

## Weeks

### Application (Jan 20th to May 8th)

During the application period, I sent in total 6 patches to the Git codebase and
one patch to git.github.io. 5 of them were accepted, while one was rejected and
one is currently under revision.

Also during that period, given my intentions to apply to GSoC, a professor from
my university asked me to give two talks about Git on his Free Software
Development classes:

- One about Git send-email, available [here, in Portuguese](/assets/pdf/gsoc/send-email.pdf)
- Other about contributing to Git, available [here, in Portuguese](/assets/pdf/gsoc/contributing.pdf)

### Community Bonding Period (May 8th to Jun 1st)

After being accepted in GSoC, I had two calls: one with all the other GSoC
mentees and another one with the GSoC mentors and mentees from Git.

I also inspected the Git codebase in order to understand a little better how I
would serialize data into a JSON. I found the `json-writer` module, which does
exactly what I need. Even though its source code is clear and easy to use, it
lacked an overview for people who are not familiarized with it yet. I sent a
[PATCH](https://lore.kernel.org/git/20250516010159.27042-1-lucasseikioshiro@gmail.com/)
documenting how to use this module. It was already accepted and merged to `next`.

In the last days, I followed the tutorial 
[My First Object Walk](https://github.com/git/git/blob/master/Documentation/MyFirstObjectWalk.adoc),
for learning how to declare a new command on Git. It was a little outdated, and 
it was an opportunity to send another
[patch](https://lore.kernel.org/git/20250529192036.75408-1-lucasseikioshiro@gmail.com/)
fixing it.


### Week 1 (Jun 2nd to Jun 8th)

#### First draft of `git repo-info`

In this first week, I sent a first RFC to my mentors (Karthik and Patrick). I
was asking for internal feedback, and this patch wasn't sent to the Git mailing
list.

This first version of `git repo` worked like that:

~~~
$ git repo-info
{
    "object-format": "sha1",
    "ref-format": "files"
}
~~~

The field `object-format` corresponds to the output of
`git rev-parse --show-object-format` while the field `ref-format` corresponds to
the output of `git rev-parse --show-ref-format`.

Some of the suggestions from my mentors were:

1. Change the JSON schema, grouping the fields
2. Allow the user to choose which fields it wants
3. Also support a format simpler than JSON, like LF-terminated or NUL-terminated
   text

#### First version of the RFC on `git repo-info`

After the first review by my mentors, I developed a new version, which was sent
to the Git mailing list and can be seen 
([here](https://lore.kernel.org/git/20250610152117.14826-1-lucasseikioshiro@gmail.com/)).

This second version address the requests from the review of the first version.
This way, `repo-info` was redesigned, focusing on a good support for both JSON
and linewise plaintext formats, flexibility for new features and control over
the returned fields.

In this second version, I've chosen to return whether the repository is bare and
whether it is shallow instead of the object format in order to focus in the
idea of the command instead of the implementation details.

Then, this version works like that, using `JSON` as the default output format:

~~~
$ git repo-info
{
  "references": {
    "format": "files"
  },
  "layout": {
    "bare": false,
    "shallow": false
  }
}
~~~

Using the plaintext format, this is the output (one field per line):

~~~
$ git repo-info --format=plaintext
files
false
false
~~~

It will also allow the user to get only the desired fields, like this (note
that we're respecting the order of the fields requested by the user):

~~~
$ git repo-info --format=plaintext layout.bare references.format layout.shallow
false
files
false
~~~

Or, using the JSON format (note that the order of fields are now ignored, as it
won't work in this format):

~~~
$ git repo-info --format=json layout.bare references.format layout.shallow
{
  "references": {
    "format": "files"
  },
  "layout": {
    "bare": false,
    "shallow": false
  }
}
~~~

### Week 2 (Jun 9th to Jun 15th)

After sending [the first version](https://lore.kernel.org/git/20250610152117.14826-1-lucasseikioshiro@gmail.com/)
in the previous week, this second week was mostly focused on receiving feedback
from the mailing list.

#### Review about the plaintext format

Two questions have arisen about the plaintext format:

1. [Ben Knoble](https://lore.kernel.org/git/CE4644B2-3FCF-47D2-B869-8926BD58A8AE@gmail.com/) and
   [Junio Hamano](https://lore.kernel.org/git/xmqqfrfzz4xq.fsf@gitster.g/)
   questioned why not use a `key=value` format in the plaintext output.
   Karthik Nayak also questioned about this in our weekly meeting, so after
   three people asking it, this looks like it's the right path :-).
   This will be implemented the next version.
   
2. [Junio Hamano](https://lore.kernel.org/git/xmqq4iwkd68p.fsf@gitster.g/)
   suggested a better output format, considering the fields may contain
   line breaks. Currently, `rev-parse` doesn't take it correctly into account
   and it breaks the assumption that each field will be returned in its own
   lines. For example, this asks for two fields and returns three lines:
   
~~~
$ git init 'my
 repo'

$ cd my\nrepo/
$ git rev-parse --show-toplevel --is-bare-repository
/private/tmp/my
repo
false
~~~
   
   Junio also said:

> As often said, an earlier mistake is not an excuse to pile more of
> them on top.  Isn't the whole point of this new command to remove
> these kitchen-sink options out of rev-parse and give them better
> home?  Let's learn from our earlier mistakes and do it right in the
> new incarnation.

   So let's do it correctly now!

#### Review about the CLI

About the CLI, the only reviews were from Karthik:

1. It wasn't clear why I added the `--allow-empty` flag. Karthik is not against
   it, but he thinks that it should be clear why it existed. In fact, I added
   this flag targeting the use case of scripts, this way, the scripts can
   assume one field per requested option.
   
2. Karthik suggested in our weekly meeting that the option list also could also
   accept the category (e.g. `objects` or `path`) as an option, so the user
   won't need to select each of its fields.

#### Long running server mode

Junio asked if I'm planning to add a long-running mode like `cat-file` has
`--batch-command`. I didn't plan that at first, but after his review, I'm
considering adding this feature after having the basic functionality working.


### Week 3 (Jun 16th to Jun 22th)

Given the feedback of the v1, it was time to send the v2
(which can be seen
[here](https://lore.kernel.org/git/20250619225751.99699-1-lucasseikioshiro@gmail.com/))

#### Major changes in v2

The major changes were:

- The plaintext format now returns its fields in a key=value format

- The tests were renumbered to t1900, since it's a new command (the previous was
  t1518, following the numbering of rev-parse)

- The test function 'test_repo_info' now has a docstring, and it is more flexible
  for using more complex repository initializations

- The flag --allow-empty is now introduced in its own commit

- The plaintext and the JSON formats are now introduced in their own commits

- The JSON format tests, which depends on the Perl's JSON module, are now marked
  with the PERLJSON lazy prereq, being skipped in environments that don't have
  that module installed

#### Tasks left for future versions

Some things pointed in the last review weren't implemented as I prefer to do
them in another iteration of repo-info after having its basic functionality
working:

- Remove the dependency on `the_repository` when calling `is_bare_repository`

- Add a `--batch-command` mode, based on the `--batch-command` flag of
  `cat-file`, which is a long-running mode where the data is requested from
  `stdin` instead of the CLI

- Add documentation for this new command

- Use the category as key instead of only accepting category.key. In the current
  patchset, `git repo-info layout` would equivalent to
  `git repo-info layout.bare layout.shallow`

The task of removing this dependency is related to the project of 
[Ayush](https://ayu-ch.github.io/), another GSoC '25 mentee. I asked him if he
intends to do it, and he'll consider that for other patches in the future
[discussion here](https://lore.kernel.org/git/CAE7as+bTKE5opov-Xn0P8R+cy+=-XRkX9Wpie_W0717XMF1b_w@mail.gmail.com/)

About the `--batch-command` mode, I asked Karthik about the use cases of
`cat-file --batch-command` and if it would be useful to have a similar feature
in `repo-info`. He told me that `cat-file --batch-command` is used for
retrieving several data that `cat-file` already returned in its CLI mode, but
keeping the same process running instead of calling `git cat-file` for each
object. However, `cat-file` deals with every object stored in Git, or in other
words, the set of data that it can return contains, at least, every version of
every tracked file, every version of every tracked directory, and every commit
in the history. `git repo-info` will return a fixed and small set of data, which
shouldn't be a problem to be entirely retrieved if the user doesn't know
beforehand which fields will be necessary. This way, I decided to discard
`--batch-command`.

The reviews (Karthik and Junio) missed the documentation in this v2, which I
must admit that it was my bad :-(.

The last feature (using a category as a key in CLI) is not discarded. It'll be
implemented in a future version after having the basic functionality working and
ready to use.

#### The UTF-8 problem

By now, I'm not dealing with paths, however, Phillip Wood presented an important
discussion about it: JSON is an UTF-8 encoded format, but this charset
restriction can't be supposed in different filesystems.

This way, it's not safe to just dump a path as a value when serializing to JSON.
Since I'm not dealing with paths yet I'll not address this issue by now, but
dealing with charset issues is something that I can't avoid in the future.

### Week 4 (Jun 23th ~ Jun 29th)

The fourth week, unlike the previous ones, didn't result in another version of
the patchset. However, during that week I was working on trying to address the
issues from the previous review:

- About the documentation, I finally wrote one for `git repo-info`. It basically
  describes the new command syntax, its two output formats, and the data that it
  currently retrieves.
  
- Karthik also told me that the commits weren't descriptive enough. I also fixed
  that.

- About the tests, Phillip Wood asked me to fix
  [several issues]((https://lore.kernel.org/git/254e4819-a693-4fb7-aa92-260038cbfbe2@gmail.com/))
  in the tests for this command (`t1900`), which I did in this week.

- About the `--allow-empty` flag, I decided to remove it and add a `--all` flag
  in the future, after the comments of
  [Junio](https://lore.kernel.org/git/xmqq1pre14ae.fsf@gitster.g/) and
  [Karthik](https://lore.kernel.org/git/CAOLa=ZTCoc9vfeMrWxqU5psmbxGzW=B-QULeSR+uvF9kQi9WzQ@mail.gmail.com/).

- Phillip [suggested](https://lore.kernel.org/git/223c7cbd-610e-49e2-90e2-5914cbc0f1d7@gmail.com/)
  another format instead of the key=value that I was using: a null-terminated
  format where the keys and values are separated by a line feed
  (`<key><LF><value><NUL>`). Given that it solves the problem of parsing special
  characters, that it is already used by `git config --list -z` and that it
  doesn't have any downsides, I'll use it.

- There were some minor code changes that I also addressed.

[Phillip](https://lore.kernel.org/git/223c7cbd-610e-49e2-90e2-5914cbc0f1d7@gmail.com/)
is concerned about the (yet to be implemented) field `git-dir`, which may induce
users to try to build some paths using this value instead of using `git
rev-parse --path`. Given that the `--path` options handles several special
cases, my first idea is to list all of them under the `path` category. But I'll
leave that decision to a future iteration, as I'm focusing more on the
documentation and the machinery of this command by now.

### Week 5 (Jun 30th ~ Jul 7th)

This week was dedicated to finish the work that still remained from the last
week and then I could send a v3 with the pending changes. This third version
can be seen [here](https://lore.kernel.org/git/20250706231938.16113-1-lucasseikioshiro@gmail.com/).

There were two reviews from Patrick that I didn't include in my v3 and that
should be highlighted:

- The [first](https://lore.kernel.org/git/aGZqK5eBA18vHAa_@pks.im/)
  is about `git survey`, another command that is still under development
  (as seen [here](https://gitlab.com/gitlab-org/git/-/merge_requests/369)).
  Patrick was thinking about merging `git survey` and `git repo-info` in a
  new command called `git repo`, with subcommands housing the functionality
  of those two commands.

- The [second](https://lore.kernel.org/git/aGZqN-oqctJ79Chz@pks.im/)
  is about refactoring the category and field declaration, which would reduce
  the number of nested `switch`es.
  [Phillip](https://lore.kernel.org/git/c1f871ec-96a0-4dbc-b84b-4add36bec682@gmail.com/)
  and [Junio](https://lore.kernel.org/git/xmqqh60ayrqp.fsf@gitster.g/) also
  have similar proposals of refactoring. This will be done in v4.

Besides my work in `repo-info`, there are one extra thing that I would like to
comment. In the [application period](#application-jan-20th-to-may-8th) entry of
this blog I mentioned the Free Software Development subject of my university,
where the students needs to contribute to free software. After my short talks
about Git, some students became interested in contributing to Git and about GSoC.
Some of those students sent some small patches and
[one of those patches](https://lore.kernel.org/git/20250617002939.24478-1-rodmichelassi@gmail.com/),
developed by Isabella Caselli and Rodrigo Michelassi, is already merged to `master`!
The experiences of Isabella and Rodrigo are related in [her blog](https://isacaselli.github.io/posts/git/).

Apart from that university subject, a friend of mine (Rodrigo Carvalho) was also
interested in contributing to Git. He sent two patches
[this](https://lore.kernel.org/git/20250529221805.97036-1-rodrigorsdc@gmail.com/)
and [this](https://lore.kernel.org/git/20250510230909.65519-1-rodrigorsdc@gmail.com/#t),
which are also already merged to `master`.

### Week 6 (Jul 8th ~ Jul 13th)

In the previous week, Patrick
[told me](https://lore.kernel.org/git/aGZqK5eBA18vHAa_@pks.im/) that Justin
Tobler was working on the
[git-survey](https://gitlab.com/gitlab-org/git/-/merge_requests/369),
which would be a Git-native replacement for
[git-sizer](https://github.com/github/git-sizer).

After a meeting with my mentors, we agreed that merging Justin's work and 
mine would be a good idea. In the context of GSoC, I would still focus on
developing the `git repo-info` features while making room for the new
functionality from `git survey`.

Justin contacted me, and we had a call last Friday (July 11th) about this
collaboration. Some highlights of our discussion:

1. How would this integration be done? Making this `git repo` command only as a
   house for two different subcommands, or making it a common interface for our
   work? An argument for separated subcommands is that `repo-info` is a light
   command, while `survey` is more computationally expensive. An argument for
   having a common interface is having a standard format for requesting and
   retrieving data from both sources.

2. A solution for 1. would be keeping the idea of having `repo-info` and
   `survey` as two subcommands (perhaps called `git repo info` and `git repo
   survey`), following the same output format. This would also make room for a
   third command which would return data from both commands. Then `git repo`
   would be a plumbing command (`git survey` is more porcelain-ish), and its
   machinery could be used by a separate porcelain command for formatting its
   output in a more human-readable way.

3. Justin asked me about "why JSON?". And yeah, to be honest I'm using JSON
   because it was listed in the GSoC idea of a machine-readable format that could
   be easily parsed by other applications. Given that this would be (as far as I
   remember) the only Git command that outputs JSON, it would be out of place,
   while the other format (null-terminated) is easier to manipulate (e.g. JSON
   has Unicode issues mentioned by Phillip) and follows an already used syntax
   (the same as `git config --list -z`). This way, it seems to me that dropping
   JSON is the way to go.

Then, instead of introducing a new command `git repo-info`, I would declare a
new command called `git repo` with two subcommands:

- `git repo info`, which is my GSoC project.
- `git repo survey`, which will include Justin's work.

Additionally, JSON formatting will be dropped, as the null-terminated format is
good enough and JSON offers no significant advantages for this command. Removing
JSON will also simplify the code, as I won't need to handle the details of those
formats.

I have submitted a
[v4](https://lore.kernel.org/git/20250714235231.10137-1-lucasseikioshiro@gmail.com/)
with these changes. Let's wait for the review.

### Week 7 (Jul 14th ~ Jul 20th)

After sending the [v4](https://lore.kernel.org/git/20250714235231.10137-1-lucasseikioshiro@gmail.com/),
I feel that we're converging on what `git repo` will behave :-).

There was a discussion on whether I should use the name `repo` for the command
or not. After hearing some suggestions, I'll keep the name `repo`, even though
it sounds a little bit generic.

Justin suggested to bring back the idea of having more than one format, however
this time is for also having a key-value format but more suitable for being read
by humans. The format [he suggested](https://lore.kernel.org/git/mgdervgp34m6ipfbodsfn7cztcl7gdeggzemfgivzvuyk7qtba@wdijebkuioxg/)
was a simple `key=value` format. That's the only new "feature request" of this
iteration, while most of the other comments were about code style (which I
reckon that I was consistently inconsistent...), typos and suggestions for
refactoring.

Then I sent
[v5](https://lore.kernel.org/git/20250722002835.33428-1-lucasseikioshiro@gmail.com/)
addressing all those issues.

### Week 8 (Jul 21th ~ Jul 27th)

The review of v5 was focused in minor changes, such as naming of constants,
CLI values and documentation.

Perhaps the biggest issue was about the functions that retrieve the values.
In v5 they returned constant strings, which would be a problem for future
versions where I'll need to generate a new string.

Patrick and Junio were [discussing](https://lore.kernel.org/git/aIHRCz_qswp7RgSy@pks.im/)
about whether we should escape the values using `quote_c_style`. By now, it
wouldn't affect the current values, so I decided to don't use it in v6.

The v6 of this patchset, then, had smaller changes, without the rewrites in
the previous versions. It can be seen 
[here](https://lore.kernel.org/git/20250727175110.84770-1-lucasseikioshiro@gmail.com/).

In parallel, I started working in the next fields, and thinking about what would
be the next challenges about then:

- `objects.object-format`: It will return the algorithm used for hashing the
   objects (i.e. `sha1` or `sha256`), which will query the same data as
   `git rev-parse --show-object-format`. However, the flag `--show-object-format`
   comes in three flavours: `storage`, `input` and `output`, which currently
   are the same but may change in the future. I can think in two solutions:

  1. Split into three values: `objects.object-format-(storage|input|output)`,
     which seems to be confusing

  2. Use `objects.object-format` as a set of three values (
  `objects.object-format.(storage|input|output)`), but it seems to be a little
  bit overengineered

- `path.*`: there are some things that need to be solved for retrieving those values:
  1. Should we use absolute or relative paths? Or should we use a flag for that?
  2. The same discussion about quoting

### Week 9 (Jul 28th ~ Ago 3rd)

The reviews of v6 were mainly focused in the tests. Eric Sunshine joined the
discussion of this new command and suggested several changes in the tests.
You can follow the discussion of v6 [here](https://lore.kernel.org/git/20250727175110.84770-1-lucasseikioshiro@gmail.com/).
Those changes really improved the readability and the robustness of the tests.

Given that the reviews didn't require major changes, I could also send a
[v7](https://lore.kernel.org/git/20250801131111.8115-1-lucasseikioshiro@gmail.com/),
addressing those issues. This new version already has some reviews by Eric and
Patrick.

In paralell, I started working on a patch to `git repo` for adding `-z` as an
alias for `--format=null`. This patch will eventually be rebased and will be
part of a patchset containing some of the features that I developed in week 8.

### Week 10 (Ago 4th ~ Ago 10th)

This week was focused in polishing the patchset in order to being accepted. The
reviews of [v7](https://lore.kernel.org/git/20250801131111.8115-1-lucasseikioshiro@gmail.com/)
were focused on small refactors in the tests, documentation and error handling.
This resulted in a [v8](https://lore.kernel.org/git/20250806195537.93302-1-lucasseikioshiro@gmail.com/)
that basically applies the suggestions from the reviewers.

Karthik and Patrick reviewed the [v8](https://lore.kernel.org/git/20250806195537.93302-1-lucasseikioshiro@gmail.com/)
asking for smaller nitpicks. Junio had already accepted and merged it to his
`seen` branch, however, the suggestions from Karthik and Patrick were simple
enough to be applied in a
[v9](https://lore.kernel.org/git/20250807150239.6987-1-lucasseikioshiro@gmail.com/#t) 
that was sent in the same day.

The patch wasn't merged to `next` yet, however, Junio announced in his 
["What's cooking" mail](https://lore.kernel.org/git/xmqqectl6unf.fsf@gitster.g/)
that it will be merged. This way, I think I can say the basic functionality of
this new command is finished! There are, of course, many features that still
need to be added, however, the most important decisions have already been made
in that first patchset.

In week 8 I related that I started working on the next features. I already
have branches for them:

- [This](https://github.com/lucasoshiro/git/tree/repo-info-features) retrieves
  the object format and adds a new flag `-z` as an alias for `--format=null`.
  This is ready to be sent to the mailing list.

- [This](https://github.com/lucasoshiro/git/tree/repo-info-path) adds the
  infrastructure for retrieving path-related data. This needs more discussion,
  as I said in Week 8.

### Week 11 (Ago 11th ~ Ago 17th)

Last week, I told that my first patchset was ready to be merged. However, after
that last email, Phillip, Eric and Junio requested to change some things in the
command. The major change is that `git repo info` now doesn't return the
key-value pairs sorted by the keys and now it doesn't drop duplicated keys.
The values are now returned in the same order they were requested. This resulted
in more two versions of this patchset
([v10](https://lore.kernel.org/git/20250815135521.44044-1-lucasseikioshiro@gmail.com/)
and
[v11](https://lore.kernel.org/git/20250816224603.3307-1-lucasseikioshiro@gmail.com/)).

During this week, I also asked my mentors to review
[this patchset](https://github.com/lucasoshiro/git/tree/repo-info-features)
mentioned in the last week. I couldn't send that to the mailing list yet as
it depends on having the first patchset merged, so the internal review from
Patrick and Karthik hopefully will make this be merged a little faster than the
previous one.

I also polished a little more the
[support for path-related values](https://github.com/lucasoshiro/git/tree/repo-info-path),
but it will only be sent after the two previous patchsets are merged.

### Week 12 (Ago 18th ~ Ago 25th)

This was the final week of my GSoC, and it felt really fast!

In this week, my first patchset was finally merged to `next` and `master`!
This means that I would be free to do more things.

The patchset that I was working on last week (the one that that adds `-z` and
`objects.format`) could be finally sent to the Git mailing list, and its first
version can be seen
[here](https://lore.kernel.org/git/8EB9C032-6739-48F2-9097-9833FC3CAA28@gmail.com/T/#m23ebb30ec9002d9fdb94fae43b1f63a9d7739e19).

After sending that first version, I received some reviews from Junio, Patrick,
Karthik and Jean-Noël Avila. They asked me to change minor things:

- fix the usage string, making it follow the guidelines

- rename `objects.format` to `object.format`

Then, I sent a [v2](https://lore.kernel.org/git/8EB9C032-6739-48F2-9097-9833FC3CAA28@gmail.com/T/#md2fe6d9993b829f21a575bec3b9564c8a05395a0)
replacing that.
