---
title: "My journey to run Docker containers on Mac M1 natively"
excerpt: ""
---

## Day 0

Dear diary, this is craziness and I will probably regret what I'm doing. I'm
starting a journey to a place where I can run Docker containers natively on
Mac OS.

What I have, so far:

- My old, but still in use, computer running Manjaro Linux and Docker, natively
- My new Macbook Air M1

What I know, so far:
- I'm a Linux user for 12 years, 8 of them I use Linux as my main OS
- I know more about Linux than I need so far, but I don't consider myself an 
expert user
- I'm a novice on Mac, and I still have a lot of curiosity and unanswered
questions about this operating system, mainly due to the fact that is a modern
and end-user focus Unix that __is not Linux__, and this is hard to make sense
for me

- I have been using Docker in a daily basis, and I consider myself an
intermediate user. I know __how to use__ Docker for more than I need, but I know
little about __how it works__.
- Ok, I know something. I know that uses `chroot` for running containers on
Linux, or in a Linux virtual machine when we are using Mac or Windows.

What I expect to find at the end of the journey:
- A container of Busybox or Alpine running on Mac **without** the Linux VM.
- Mac provides us a `chroot`. I don't know if it is enough for running a
container like we do on Linux, but I'll figure it out!
- Of couse, if we are running something on another system, even in a `chroot`
jail, we need to recompile them for the new environment, that is, recompile for
Mac OS and Apple M1. I don't have any idea if it is feasible.

As you can see, this is **complete useless project** as I can't see any real use
cases for it. And, as you can see, I don't know I lot of things, and probably I
have a lot of misconceptions in my mind. So, what matters for me here is not if
I will succeed in doing that crazy thing, but what I will learn in this journey.
