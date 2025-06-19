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
|repo-info: add new command for retrieving repository info          |[PATCH](https://lore.kernel.org/git/20250610152117.14826-1-lucasseikioshiro@gmail.com/)| <o>Under review</o>             |

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
