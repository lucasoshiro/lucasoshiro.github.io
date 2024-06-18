---
title: "Ruby: a great language for shell scrips!"
excerpt: "It's more than rails!"

header:
  teaser: https://upload.wikimedia.org/wikipedia/commons/7/73/Ruby_logo.svg

lang: pt_br
path-en: /posts/2024-06-17-ruby-shellscript
---

**Tradução incompleta!**

## Intro

Ruby is so associated with its most framework, Rails, that many people forget
how amazing this language is. I mean, I know a lot of people who says "I don't
like Ruby" and when I ask why, they say something about Rails. I consider Ruby
one of my favorite programming languages, and the last time I touched any Rails
code was 7 years ago...

So, if I don't use Rails anymore, what I do with Ruby? Well, Ruby is a very rich
language, and could replace, for example, Python for most tasks (except that it
doesn't have as may libraries as Python do...). And there are some thing that
Ruby is even better than Python, and one of them is for writing shell scripts!

### Goals

- Show features of Ruby that are useful for writing shell scripts;

- Compare Ruby to Bash and Python;

### Non-goals

- Replace _entirely_ Bash scripts by Ruby scripts;

## Feature 1: calling external commands

The first thing that you expect of language for writing shell scripts is how to
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
Python, even more than Java!). Bash, on the other hand, has only one type, the
strings.

So, you can take all advantage of this:

~~~ruby
total_lines = `wc -l my_file`.to_i # an int containing the number of lines of a file
half = total_lines.div 2           # integer division
puts `head -n half my_file`        # print half of the file
~~~

## Feature 4: functional constructions

Ruby implements `map`, `select` (filter), `reduce`, `flat_map` and other
functional operations as methods. So, you can, for example, apply a `map` over a
command output:

~~~ruby
puts `ls`.lines.map { |name| name.strip.length } # puts the lengths of the filenames
~~~

## Feature 5: regex matching

Regex is a type in Ruby, and operations using regex are builtin in Ruby. Look at
this example, where we get the current git branch name calling `git branch`:

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

If want to work with multiple threads, Ruby is perhaps the easiest language to
do it. Look:

~~~ruby
thread = Thread.new do
    puts "I'm in a thread!"
end

puts "I'm outside a thread!"

thread.join
~~~

So, it can be useful for, for example, downloading several files:

~~~ruby
(1..10).map do |i|                       # iterates from i=0 to i=10, inclusive
  Thread.new do
    `wget http://my_site.com/file_#{i}`  # you can use variables inside commands!  
  end
end.each { |thread| thread.join }        # do/end and curly braces have the same purpose!
~~~


## Feature 7: builtin file and dir operations

In Ruby, all the file operations are methods of the `File` class and all the
directory operations are methods of the `Dir` class, as it should be. In Python,
for example, if you want to read a file you use `open`, but if you want to
delete you need to use `os.remove`, and `os` does a lot of other things that are
not related to files.

So, in Ruby:

~~~ruby
exists = File.exists? 'My File'           # boolean methods ends in ?
file_content = File.open('My File').read
File.delete 'My File'                     # parentheses are optional if it's not ambiguous
~~~

## Conclusion

I hope that after reading this short text you consider using Ruby as a
replacemente for complex shell scripts. I mean, I don't expect that you drop
Bash entirely, but consider using Ruby when things get complex. Of course, you
can do that in Python, Perl, even JS, but, as my personal choice I think that
Ruby is a more complete and easier Bash replacement for writing scripts!
