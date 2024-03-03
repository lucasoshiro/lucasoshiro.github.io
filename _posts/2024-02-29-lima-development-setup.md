---
title: "Tutorial: Configurando um ambiente de desenvolvimento com Lima"
excerpt: "Para aqueles que precisam de um Linux x86-64 em um Mac com Apple Silicon"

header:
  teaser: /assets/images/posts/2024-02-29-lima-development-setup/lima-logo.svg

lang: pt_br
path-en: "/posts-en/2024-02-29-lima-development-setup"
---

Os novos Macs com Apple Silicon (M1, M1 Pro, M1 Ultra, M2 e por aí vai) são
ótimas máquinas, e talvez você goste bastante do macOS (bom, eu sou um fanboy do
Manjaro que também tem um MacBook Air, e eu gosto bastante dele). Porém, esse
novo ecossistema Mac/ARM pode ser frustrante se você precisar desenvolver para o
bom e velho Linux/x86-64:

- Os Macs Intel podiam fazer dual-boot de macOS e Linux (e até mesmo
  Windows!). Os Mac Apple Silicon não conseguem;
- Ok, isso não é totalmente verdade porque a equipe do
  [Asahi Linux](https://asahilinux.org/) têm trabalhado pesado para conseguir
  rodar o Linux nativamente no Apple Silicon. Porém, apesar do incrível
  progresso deles, ele **ainda** não está 100%, e é um Linux ARM;
- O VirtualBox para o Apple Silicon praticamente não existe até agora (quer
  dizer, tem um beta que não fazia quase nada e que desapareceu da
  [página de downloads](https://www.virtualbox.org/wiki/Downloads));
- O Parallels existe, mas você precisa pagar pra usar;
- Tem o [QEMU](https://www.qemu.org/). Não me entenda mal, o QEMU é excelente,
  mas ele pode ser bem chato de configurar e executar através da linha de
  comando (em comparação ao VirtualBox, por exemplo);
- Ainda existe o [UTM](https://mac.getutm.app/), um front-end para o QEMU, mas
  ele não roda máquinas x86-64 e
  [não é tão fácil instalar uma distro ARM](https://www.appelgriebsch.org/005-utm/) nele.

Mas pera aí, não jogue fora seu belo Mac, ainda tem mais uma opção para você: o 
[Lima](https://github.com/lima-vm/lima). Ele é um wrapper para o QEMU que
permite que você crie facilmente máquinas virtuais Linux ARM e x86-64.

Mas ele tem algumas desvantagens:

- É uma ferramenta de linha de comando, não tem uma interface gráfica;
- Você até pode rodar alguns apps com interface gráfica, mas a experiência não é
  das melhores;
- A interoperabilidade com o macOS é meio fraca.

Neste tutorial vou te mostrar como configurar uma instância de Linux x86-64 no
Lima, e como usar ela em seu ambiente de desenvolvimento. Note que você
precisará rodar comandos no Mac hospedeiro e no Linux convidado, então eu vou
representar seus prompts como `mac$` e `linux$` para deixar claro onde que você
deve rodar cada comando.

## Instalando o Homebrew

Se você já tem o [Homebrew](https://brew.sh/) instalado, você pode pular esta
seção. Mas se você não o tem, eu recomendo fortemente que você o instale, já que
ele é um gerenciador e instalador de pacotes para o Mac, assim como o
`apt-get`/`dpkg` é para o Debian/Ubuntu/Mint e o `pacman` é para o Arch/Manjaro.

Você pode instalar o homebrew executando em seu terminal:

~~~bash
mac$ /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh")
~~~

> Tome cuidado!
>
> Não copie e cole nada em seu terminal a não ser que você confie na pessoa que 
> disse para você fazer isso!
>
> Se você não confia em mim então copie direto de [https://brew.sh/](https://brew.sh/) !

## Instalando o Lima

Ok, tendo o Homebrew instalado, execute:

~~~bash
mac$ brew install lima
~~~

Você pode ver se a instalação deu certo executando:

~~~bash
mac$ limactl --version
~~~

<div class="img-container">
  <figure>
    <img class="small" src="{{ site.baseurl }}/assets/images/posts/2024-02-29-lima-development-setup/lima-version.png">
  </figure>
</div>


## Visão geral do Lima

Como eu disse antes, o Lima usa o QEMU por debaixo dos panos, e ele gerencia
máquinas virtuais (também chamadas de instâncias aqui). `limactl` é o comando
que você usa para interagir com o Lima. Aqui estão alguns subcomandos do
`limactl` (você pode ver mais deles rodando `limactl --help`):

- `limactl list`: lista VMs;
- `limactl create`: cria uma VM;
- `limactl shell`: executa um shell em uma VM;
- `limactl start`: inicia uma VM;
- `limactl stop`: encerra uma VM.

Se você executar `limactl list` você não vai ver nada por enquanto. Isso é
porque você não tem nenhuma instância, então você vai precisar criar uma com
`limactl create`.

Depois de criar uma, você deverá inciá-la com `limactl start`. Se você não
precisa mais ter ela em execução, você pode pará-la com `limactl stop`
(instâncias do Lima podem desperdiçar sua bateria...). Depois de iniciada, você
pode executar `limactl shell` e isso vai iniciar um shell (provavelmente Bash)
em sua VM.

Note que apenas encerrar o shell não encerra a instância. Note também que essas
são VMs com armazenamento persistente, você não irá perder seus arquivos e
configurações depois de encerrá-las.

## Criando uma instância x86-64

Por padrão, se você executar `limactl create` em um Apple Silicon, o Lima vai
criar uma instância ARM. Então, você precisa especificar que você quer uma
instância x86-64 com `--arch=x86-64`:

~~~bash
mac$ limactl create --arch=x86_64 template://debian
~~~

Como você deve suspeitar, estamos criando uma máquina virtual Debian, mas você
pode escolher qualquer distro que você quiser (se suportar x86-64) se ela estiver
[nesta lista](https://lima-vm.io/docs/templates/). Apenas se assegure que existe
uma imagem x86-64 para ela! E você pode ter tanto instancias x86-64 quanto ARM!

Agora execute:

~~~bash
mac$ limactl list
~~~

Se tudo estiver ok você deverá ver sua nova instância `debian` aqui!

## Configurando o SSH para a sua instância

Como eu tinha dito antes, a interoperabilidade entre o hospedeiro Mac e as
instâncias do Lima é... estranha. O lima pode ler os arquivos do Mac mas não
pode escrever neles. Os hosts Mac não podem ler nem escrever instâncias do Lima
(ok, tem uma exceção para isso mas ela não é recomendada).

Mas nós podemos configurar o SSH para ter uma interoperabilidade aqui. Execute:

~~~bash
mac$ limactl edit debian
~~~

Ele vai abrir um editor de texto (aquele que estiver configurado na variável de
ambiente `EDITOR`, você pode trocá-lo pelo seu favorito como `vim`, `emacs`,
`code` e por aí vai antes de executar isso).

Adicione isso ao fim do arquivo:

~~~yaml
ssh:
  localPort: 2022
~~~

Isso vai configurar a porta SSH padrão. Você pode configurar a porta SSH para a
que você quiser.

## Adicionando a VM como um host SSH no `.ssh/ssh_config`

Isso só é necessário se você está usando Visual Studio Code, mas eu recomendo
fazer isso de qualquer jeito.

Adicione em seu `~/.config/ssh_config` as seguintes linhas:

~~~config
Host lima-debian
  HostName localhost
  Port 2022
~~~

Isso vai identificar a VM para o SSH como `lima-debian`. Mude a porta para
aquela que você escolheu no passo anterior.

## Executando sua instância

Ok, vamos executar sua instância x86-64 pela primeira vez. Execute:

~~~bash
mac$ limactl start debian
~~~

Como essa é a primeira vez, isso pode levar alguns minutos para terminar. Se
tudo foi ok, execute:

~~~bash
mac$ limactl shell debian
~~~

Isso vai abrir um shell (neste caso, o Bash) na sua instância. Se você não
acredita que esse é um Linux x86-64, você pode ver isso assim:

~~~bash
linux$ uname -a
~~~

<div class="img-container">
  <figure>
    <img class="small" src="{{ site.baseurl }}/assets/images/posts/2024-02-29-lima-development-setup/uname.png">
  </figure>
</div>


### Terminando a configuração do SSH

O SSH vai permitir você acessar arquivos tanto do Linux convidado quanto do Mac
hospedeiro. Para isso, você precisará de uma chave SSH configurada no seu
Mac. Se você não tem, siga [estas instruções](https://git-scm.com/book/en/v2/Git-on-the-Server-Generating-Your-SSH-Public-Key)
para gerar uma.

> Dica:
>
> Considere usar o [Secretive](https://github.com/maxgoedjen/secretive). Ele é
> um app open-source para o Mac que guarda a chave privada SSH no Secure
> Enclave, então ninguém (nem mesmo você) tem acesso a ela. Ela é protegida pelo
> sua senha de usuário ou Touch ID.
>
> Mas claro, você consegue ver sua chave pública!

Copie a chave SSH armazenada em `~/.ssh/id_rsa.pub` no seu Mac. De volta à VM,
cole ela no fim do `~/.ssh/authorized_keys`. Isso autoriza o seu Mac para
acessar os arquivos da sua máquina virtual Linux através do SSH.

## Acessando usando seu editor de texto

### Visual Studio Code

Se você usa o Visual Studio Code, instale a extensão
[Remote - SSH](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-ssh).

Depois de instalá-la, você verá na sua esquerda um novo ícone, chamado "Remote
Explorer". Clique nele, e você verá o `lima-debian` como um remote. Passe o seu
mouse por cima, e vai aparecer uma seta. Clique nela, e ele irá se conectar à
sua VM.

<div class="img-container">
  <figure>
    <img class="small" src="{{ site.baseurl }}/assets/images/posts/2024-02-29-lima-development-setup/vscode-lima.png">
  </figure>
</div>

Agora, você pode usar o VSCode com os arquivos dentro da VM da mesma forma como
você usaria se estivesse trabalhando com ele no hospedeiro.

### Emacs

Voc~e pode se conectar usando o TRAMP: use o atalho `C-x C-f` da mesma forma que
você faria pra abrir um arquivo local, mas use isto como caminho:

~~~
/ssh:localhost#2022:<path>
~~~

Se você está usando outra porta que não seja a 2022, então substitua
ela. Substitua também `<path>` pelo caminho do arquivo na VM que você quer abrir.

Se você adicionou `lima-debian` para sua configuração do SSH, então você pode
usar como caminho:

~~~
/ssh:lima-debian:<path>
~~~

<div class="img-container">
  <figure>
    <img class="small" src="{{ site.baseurl }}/assets/images/posts/2024-02-29-lima-development-setup/emacs-lima.png">
  </figure>
</div>


### Vim

Apenas use o Vim dentro da sua VM :-)

### Outros editores / IDEs

Se você está usando outros editores ou IDEs, você terá que procurar como o
desenvolvimento remoto funciona nele, e configurá-lo para usar o SSH com
`localhost` como host e 2022 como porta (ou a porta que você escolheu).


## Copiando arquivos

Agora que você já tem o SSH, você pode usar `scp` para mover arquivos do
hospedeiro para o convidado e vice-versa. Ele funciona como o `cp` mas ele pode
copiar arquivos entre computadores (neste caso, um físico e uma máquina
virtual).

Do hospedeiro para o convidado:

~~~bash
# troque 2022 pela porta que você escolheu
mac$ -P 2022 scp my_file localhost:destination

# ou, se você adicionou a instancia ao .ssh/ssh_config:
mac$ scp my_file lima-debian:destination
~~~

E do convidado para o hospedeiro:

~~~bash
# troque 2022 pela porta que você escolheu
mac$ scp -P 2022 localhost:my_file destination

# ou, se você adicionou a instancia ao .ssh/ssh_config:
mac$ scp lima-debian:my_file destination
~~~
