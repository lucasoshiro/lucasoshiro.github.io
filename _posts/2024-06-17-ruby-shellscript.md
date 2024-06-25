---
title: "Ruby: uma ótima linguagem para shell scripts!"
excerpt: "É mais do que o Rails"

header:
  teaser: https://upload.wikimedia.org/wikipedia/commons/7/73/Ruby_logo.svg

lang: pt_br
path-en: /posts-en/2024-06-17-ruby-shellscript
---

## Introdução

Ruby é tão associada com seu framework mais famoso, Rails, que muitas pessoas
esquecem o quanto incrível essa linguagem é. Quero dizer, eu conheço muita gente
que diz "eu não gosto de Ruby" e quando eu pergunto o porquê, eles dizem alguma
coisa sobre o Rails. Pessoalmente, considero Ruby uma das minhas linguagens de
programação preferidas, e a última vez que eu encostei em algum código de Rails
foi há 7 anos...

Então, se eu não uso mais Rails, o que é que eu faço com Ruby? Bem, Ruby é uma
linguagem bem rica e completa, talvez até mais que sua parente mais famosa,
Python (infelizmente, não posso dizer a mesma coisa sobre seu ecossistema...). 
E uma das coisas que eu considero que Ruby é melhor que Python é para escrever
shell scripts.

Isso é, na maior parte dos casos Bash é suficiente pra mim, mas se o script
começa a ficar complexo, então eu vou para Ruby. Aqui vou mostrar as principais
_features_ da linguagem para esse caso de uso.

### Objetivos

- Mostrar features de Ruby que possam ser úteis para escrever shell scripts;

- Comparar Ruby com Bash e Python;

### Não-objetivos

- Substituir _completamente_ scripts Bash por scripts Ruby.

## Feature 1: chamar comandos externos

A primeira coisa que você espera de uma linguagem para escrever shell scripts é
chamar comandos externos. Em Ruby, você pode fazer isso usando backticks (`` ` ``):

~~~ruby
`ls`
~~~

E é isso! Você não precisa de `system`, `popen` ou similares, ou importar uma
biblioteca. E se você atribuir isso a uma variável, você terá a saída do
comando:

~~~ruby
my_date=`date`
~~~

> Nota: se você quiser usar `system` (ex: se você quer que a saída seja
> redirecionada para o stdout em vez de uma string) ou `popen` (se você quiser
> ler e escrever dados de ou para um subprocesso), eles também estão disponíveis
> em Ruby!

## Feature 2: status code

Este é bem rápido: em Ruby, a variável `$?` contém o status code do último
comando executado. Então, é bem próximo de Bash:

~~~ruby
`true`
puts $? # 0

`false`
puts $? # 1
~~~

## Feature 3: Ruby tem tipos

Ruby não é uma linguagem _estaticamente_ tipada, mas tem tipos. Na verdade, é
uma linguagem orientada a objetos e segue estritamente o paradigma de POO (mais
que Python, em alguns aspectos até mais do que Java!). Bash, por outro lado,
tudo é uma string, e isso leva a vários problemas de segurança...

Então, você pode tirar proveito disso:

~~~ruby
total_lines = `wc -l my_file`.to_i # um int contendo o número de linhas de um arquivo
half = total_lines.div 2           # divisão inteira
puts `head -n #{half} my_file`     # imprime metade de um arquivo
~~~

## Feature 4: construções funcionais

Ruby implementa `map`, `select` (filter), `reduce`, `flat_map` e outras
operações funcionais como métodos. Então, você pode, por exemplo, aplicar um
`map` sobre a saída de um comando:

~~~ruby
puts `ls`.lines.map { |name| name.strip.length } # imprime os comprimentos dos nomes de arquivos.
~~~

## Feature 5: casamento de regex

Regex é um tipo em Ruby, e as operações usando regex são parte da
linguagem. Olhe este exemplo, em que a gente obtêm o nome da branch atual do Git
chamando `git branch`:

~~~ruby
current_branch_regex = /^\* (\S+)/
output_lines = `git branch`.lines
output_lines.each do |line|
  if line =~ current_branch_regex # casa a string com a regex
    puts $1                       # imprime o primeiro grupo
  end
end
~~~

> Nota para amantes de Git: eu sei que eu podia ter feito isso usando `git
> branch --show current`, mas esse foi o primeiro exemplo que veio na minha
> cabeça para demonstrar o uso de regex...

## Feature 6: threads fáceis

Se você quer trabalhar com várias threads, Ruby é talvez a linguagem mais fácil
de fazer isso. Veja:

~~~ruby
thread = Thread.new do
    puts "Estou dentro da thread!"
end

puts "Estou fora da thread!"

thread.join
~~~

Então, isso pode ser útil, por exemplo, para baixar vários arquivos ao mesmo
tempo:

~~~ruby
(1..10).map do |i|                       # itera de i=1 a i=10, inclusivamente
  Thread.new do
    `wget http://my_site.com/file_#{i}`  # você pode usar variáveis dentro de comandos!  
  end
end.each { |thread| thread.join }        # do/end e chaves servem para a mesma coisa
~~~

## Feature 7: operações de arquivo e diretório embutidas

Em Ruby, todas as operações de arquivos são métodos da classe `File` e todas as
operações de diretório são métodos da classe `Dir`, como deveriam ser. Em
Python, por exemplo, se você quer ler um arquivo você usa `open`, mas se você
quer apagá-lo você precisa usar `os.remove`, e `os` tem várias outras coisas
que não são relacionadas a arquivos.

Então, em Ruby:

~~~ruby
exists = File.exists? 'My File'           # métodos que retornam booleanos são terminados em ?
file_content = File.open('My File').read
File.delete 'My File'                     # parênteses são opcionais se não há ambiguidade
~~~

## Conclusão

Espero que depois de ler este pequeno texto você considere usar Ruby como uma
substituta para shell scripts complexos. Quero dizer, não espero que você deixe
o Bash completamente, mas considere usar Ruby quando as coisas ficarem mais
complexas. Claro que você poderia fazer isso tudo em Python, Perl, até JS, mas,
como minha principal escolha eu acredito que Ruby é a escolha mais fácil e
completa para isso!

Se você encontrou alguma coisa errada, ou se você tem alguma sugestão, por favor
me diga [aqui](https://github.com/lucasoshiro/lucasoshiro.github.io/issues).

## Update

Isto ficou em primeiro no [Hacker News](https://news.ycombinator.com/item?id=40763640)!  Não apenas isso, mas
começou discussões bem interessante nos comentários. Obrigado a todos!

<div class="img-container">
  <figure>
    <img class="small" src="{{ site.baseurl }}/assets/images/posts/2024-06-17-ruby-shellscript/hn.png">
    <figcaption>#1 no HN!</figcaption>
  </figure>
</div>

## Update #2

De alguma forma isto chegou no Matz, o criador de Ruby! E isso foi twitado por
ele! Eu... não acredito!

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Link: Ruby: a great language for shell scripts! - Lucas Seiki Oshiro : <a href="https://t.co/lestntomSR">https://t.co/lestntomSR</a><br> <a href="https://t.co/lestntomSR">https://t.co/lestntomSR</a></p>&mdash; Yukihiro Matz (@yukihiro_matz) <a href="https://twitter.com/yukihiro_matz/status/1805475764013252815?ref_src=twsrc%5Etfw">June 25, 2024</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
