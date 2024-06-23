---
title: "Ruby: a great language for shell scripts!"
excerpt: "It's more than rails!"

header:
  teaser: https://upload.wikimedia.org/wikipedia/commons/7/73/Ruby_logo.svg

lang: en
path-pt_br: /posts/2024-06-17-ruby-shellscript
---

## Intro

Ruby is so associated with its most famous framework, Rails, that many people
forget how amazing this language is. I mean, I know a lot of people who says "I
don't like Ruby" and when I ask why, they say something about Rails. Personally,
I consider Ruby one of my favorite programming languages, and the last time I
touched any Rails code was 7 years ago...

So, if I don't use Rails anymore, what I do with Ruby? Well, Ruby is a very rich
and complete language, perhaps even more than its more famous relative, Python
(sadly, I can't say the same about its ecosystem...). And one of the things that
I think that Ruby is better than Python is using it for writing shell
scripts.

That is, most of the cases Bash for me is enough, but if the script starts to
become complex, I switch to Ruby. Here I show the main features that might be
interesting for this case of use.

### Goals

- Show features of Ruby that are useful for writing shell scripts;

- Compare Ruby to Bash and Python;

### Non-goals

- Replace _entirely_ Bash scripts by Ruby scripts.

## Feature 1: calling external commands

The first thing that you expect of language for writing shell scripts is to
call external commands. In Ruby, you do that using backticks (`` ` ``):

~~~ruby
`ls`
~~~

That's it! You don't need `system`, `popen` or something like that, or import
a library. And if you set that to a variable, you'll have the output of the
command:

~~~ruby
my_date=`date`
~~~

> Note: if you want to use `system` (e.g. if you want the output to be
> redirected to stdout instead of a string) or `popen` (if you want to read or
> write data from or to a subprocess), those are also available in Ruby!

## Feature 2: status code

This is real quick: in Ruby, the variable `$?` contains the status code of the
last executed command. So, it's really close to Bash:

~~~ruby
`true`
puts $? # 0

`false`
puts $? # 1
~~~

## Feature 3: it's a typed language

Ruby is not a _statically_ typed language, but it has types. In fact, it is a
object-oriented language, and it follow strictly the OOP paradigm (more than
Python, in some aspects even more than Java!). Bash, on the other hand,
everything is a string, and that leads to several safety issues...

~~~ruby
total_lines = `wc -l my_file`.to_i # an int containing the number of lines of a file
half = total_lines.div 2           # integer division
puts `head -n #{half} my_file`     # print half of the file
~~~

## Feature 4: functional constructions

Ruby implements `map`, `select` (filter), `reduce`, `flat_map` and other
functional operations as methods. So, you can, for example, apply a `map` over a
command output:

~~~ruby
puts `ls`.lines.map { |name| name.strip.length } # prints the lengths of the filenames
~~~

> Note for Git lovers: I know that I could do that only using `git branch
> --show-current`, but that was the first example that came in my mind to
> demonstrate the use of regex...

## Feature 5: regex matching

Regex is a type in Ruby, and operations using regex are built-in in the
language. Look at this example, where we get the current git branch name calling
`git branch`:

~~~ruby
current_branch_regex = /^\* (\S+)/
output_lines = `git branch`.lines
output_lines.each do |line|
  if line =~ current_branch_regex # match the string with the regex
    puts $1                       # prints the match of the first group  
  end
end
~~~

## Feature 6: easy threads

If want to work with multiple threads, Ruby is perhaps the one of the easiest
language to do it. Look:

~~~ruby
thread = Thread.new do
  puts "I'm in a thread!"
end

puts "I'm outside a thread!"

thread.join
~~~

So, it can be useful for, for example, downloading several files at the same time:

~~~ruby
(1..10).map do |i|                       # iterates from i=1 to i=10, inclusive
  Thread.new do
    `wget http://my_site.com/file_#{i}`  # you can use variables inside commands!  
  end
end.each { |thread| thread.join }        # do/end and curly braces have the same purpose!
~~~


## Feature 7: builtin file and dir operations

In Ruby, all the file operations are methods of the `File` class and all the
directory operations are methods of the `Dir` class, as it should be. In Python,
for example, if you want to read a file you use `open`, but if you want to
delete it you need to use `os.remove`, and `os` does a lot of other things that are
not related to files.

So, in Ruby:

~~~ruby
exists = File.exists? 'My File'           # methods that return booleans end in ?
file_content = File.open('My File').read
File.delete 'My File'                     # parentheses are optional if it's not ambiguous
~~~

## Conclusion

I hope that after reading this short text you consider using Ruby as a
replacement for complex shell scripts. I mean, I don't expect that you drop
Bash entirely, but consider using Ruby when things get complex. Of course, you
can do that in Python, Perl, even JS, but, as my personal choice I think that
Ruby is the most complete and easier Bash replacement for that!

If you find something wrong, or if you have any suggestion, please let me know
[here](https://github.com/lucasoshiro/lucasoshiro.github.io/issues).
