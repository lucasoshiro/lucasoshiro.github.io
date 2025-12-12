---
title: Using the first and the last versions of Torvalds' Git
excerpt:

header:
  image:
  teaser: 

lang: en
path-pt_br: /_posts-en/2025-12-12-using-torvalds-git
---

## Intro

## Setup

Docker

- Ubuntu 7.10 (from [here](https://hub.docker.com/r/icomputer7/ancient-ubuntu-docker/))
- Add the Git source directory to `PATH`

- Trying to do a simple fizzbuzz in C:
  1. First commit: a simple C code with only "#include <stdio.h>" + main return 0
  2. Second commit: add for
  3. Third and fourth commit: one adding fizz and other buzz, in parallel
  4. Fourth commit: merge 

## The first version

- Clone git
- Checkout to e83c5163
- Git doesn't have 
- `git` is not a command, but a collection of only 6 commands:
  - `init-db`: equivalent to `git init`
  - `update-cache`: equivalent to `git update-index` or `git-add`

  - `cat-file`: equivalent to `git cat-file -t` + `git cat-file -p` redirecting
    the output to a temp file
  - `show-diff`: equivalent to `git diff` on workdir

  - `commit-tree`: like `git commit-tree`
  - `read-tree`: like `git read-tree`
  - `write-tree`: like `git write-tree`

1. `init-db`
   - weird message "defaulting to private storage area"
   - it doesn't create `.git`, but a `.dircache` directory, containing:
     - index: perhaps the same that we know? 
     - objects: perhaps the same that we know? It already contains 256 subdirs named 
     from 00 to ff

2. Trying to add a the first draft to the index
   - First step to create a commit: add the file to the index
   - `update-cache `:
     - Seems to be ok
     - I can see that an object was created, but I can't check manually it without having `zlib-flate`
   - `cat-file`:
     - 88fac3c1271f86c06acb743615aa5b8fd3748401
     - It only says `temp_git_file_YfTAvs: blob`
     - that file contains the content
   - `show-diff`:
     - it only says `fizzbuzz.c: ok`
     - after changing one line: it shows me the diff, as its name says

3. Trying to commit
   - Let's try `write-tree` + `commit-tree`
   - `write-tree`
     - Returned a hash bf7e301ed0ed8632400aef54b1400d4d59fea672
     - `cat-file` says it's a tree
       - The file is the binary content of the tree
     - so far so good
   - `commit-tree`:
     - Returned a hash
     - `cat-file` says it's a commit. the generated file contains the commit content
     - The author of the commit is username@hostname

4. Restoring the content of a commit
   - Deleting the C code and trying to restore it from the Git history
   - Let's try `read-tree`
     - `git read tree` supports tree-ish. Would this also support it? Let's try
       providing my commit hash
       No.
     - Second try: using the hash of the tree. Seems to be working
   - There's no way to directly unpack the index to the working directory.
     1. `cat-file` the commit
     2. `cat-file` the tree + hexdump
     3. using the hash of the file from hexdump and using `cat-file` with it
     4. rename the temp file to fizzbuzz.c
   - Really not trivial. I only could do that because I know the tree binary format

5. Creating the second commit
   - Same as 2 and 3, but providing -p to `commit-tree`
   - The second commit: 27523add1972b8d37c78687b91ae1e645c09ac88
   
6. Creating the third and fourth commits
   - Same as 5, but using the commit from 5 as the parent
   - fizz: c235eb9f2b9c9cbc50ad27c52bbe20d754fe1405
   - buzz: fe67322264658b6b83d896c35d6c518be562db92

7. Merge
   - There's no merging algorithm
   - The file needed to be merged manually
   - `commit-tree` with using the two previous commits

8. Compatibility
   - Moving `.dircache` contents to a modern `.git` directory
   - Index is broken
   - `git fsck` shows that none of the hashes match
   - `git log` seems to be working. `git checkout` complains the hash mismatch

The `git add` + `git commit` sequence would be:

~~~bash

# git add fizzbuzz.c
update-cache fizzbuzz.c

# git commit -m "my commit"
echo "my commit" | commit-tree $(write-tree) -p <parent commit>
~~~

Oh

## The last version

- ["Meet the new maintainer"](https://lore.kernel.org/git/Pine.LNX.4.58.0507262004320.3227@g5.osdl.org/)
  - 2005-07-15
  - Only after 3 months
- The last released by Linus Torvalds should be around there
  - v0.99 points to a commit by Junio, but still Signed-off-by Linus
  - This anotated tag doesn't have author info because it wasn't implemented yet!
  - v0.99.1 is authored by Linus, and it's the last version before the "Meet the new maintainer" e-mail
  - v0.99.2 is authored and Signed-off-by Junio
  - v0.99.1 is the last Linus' Git
- v0.99.1 already has `git`, which is only a script for calling other commands,
  many of them are familiar
- `http-push` doesn't work. I needed to remove it

1. `git init`:
  -  still shows the weird message. But now it names the directory `.git`, which
  now contains HEAD and refs
  - HEAD is now symbolic-ref
  
2. `git add`:
   - now it works
   - `git status` doesn't work. It shows a `git-diff-cache` usage message.
     - Perhaps becaus `status` in this version is a script that calls `git-diff-cache`
   - `git ls-files` shows the file. ok

3. `git commit`:
   - it seems to work just like in modern Git

4. Restoring the content of a commit:
   - `git status` now works. Perhaps it needs to have a commit to work?
   - `git checkout -f` restores the contents of fizzbuzz.c, but `git checkout fizzbuzz.c` don't

5. Creating the second commit
   - `git add` + `git commit` working
   - `git log` works!
   - `git checkout` can't detach HEAD. It only works with branches
   
6. Creating the third and fourth commits
   - Now we can create a new branch using `git checkout -b` or `git branch`
   - `git log` doesn't show the branch name, `git show` doesn't exist, 
     `git rev-parse HEAD` also doesn't work. It's hard to know where we are
     - Hacky solution: `ls -l .git/HEAD`
   - It was really ok to add and commit

7. Merge
   - `git merge` doesn't exist yet!
   - README says to:
     1. Get the trees of the top commits of each branch (through `git cat-file`)
     2. Merge the trees using `git read-tree -m`

8. Compatibility
   - `git fsck` didn't show any error
   - The index seems to be working
   - Somehow, the HEAD works, even if it's a symlink instead of the symref file
     that we know
     
