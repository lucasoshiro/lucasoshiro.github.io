---
title: "PCDisplay"
excerpt: "Display com informações do computador"
author_profile: true
gallery:
  - url: "/assets/images/hardware/2020-06-14-pcdisplay/hostname.jpg"
    "image_path": "/assets/images/hardware/2020-06-14-pcdisplay/hostname.jpg"
    alt: "Hostname/distro"
    title: "Hostname and Linux distro"

  - url: "/assets/images/hardware/2020-06-14-pcdisplay/data.jpg"
    "image_path": "/assets/images/hardware/2020-06-14-pcdisplay/data.jpg"
    alt: "Date/time"
    title: "Date and time"

  - url: "/assets/images/hardware/2020-06-14-pcdisplay/cpu.jpg"
    "image_path": "/assets/images/hardware/2020-06-14-pcdisplay/cpu.jpg"
    alt: "CPU"
    title: "CPU usage"

  - url: "/assets/images/hardware/2020-06-14-pcdisplay/ram.jpg"
    "image_path": "/assets/images/hardware/2020-06-14-pcdisplay/ram.jpg"
    alt: "RAM"
    title: "RAM usage"

  - url: "/assets/images/hardware/2020-06-14-pcdisplay/temperatura.jpg"
    "image_path": "/assets/images/hardware/2020-06-14-pcdisplay/temperatura.jpg"
    alt: "Temperature"
    title: "CPU temperature"

  - url: "/assets/images/hardware/2020-06-14-pcdisplay/rede.jpg"
    "image_path": "/assets/images/hardware/2020-06-14-pcdisplay/rede.jpg"
    alt: "Network speed rate"
    title: "Network speed rate"

  - url: "/assets/images/hardware/2020-06-14-pcdisplay/musica.jpg"
    "image_path": "/assets/images/hardware/2020-06-14-pcdisplay/musica.jpg"
    alt: "Now playing"
    title: "Now playing"

last_modified_at: 2021-10-24

header:
   image: /assets/images/hardware/2020-06-14-pcdisplay/cpu.jpg
   teaser: /assets/images/hardware/2020-06-14-pcdisplay/cpu.jpg

lang: en
path-pt_br: /hardware/2020-06-14-pcdisplay/
---

Github: [https://github.com/lucasoshiro/pcdisplay](https://github.com/lucasoshiro/pcdisplay)

This is a side project where I placed a LCD display on my computer case,
displaying the following information:

- CPU usage
- RAM usage
- Download/upload rate
- CPU temperature
- Date and time
- Hostname and operating system name
- Now playing (song title and artist)

The hardware was build using an Arduino Nano and a 16x2 characters display. In
the Github repository, there is the _host_ code, written in Ruby, that
provide the system information to the Arduino, and the _guest_ code, used by
the Arduino to control the display.

### Data flow

<pre style="font-size: 10px; font-family: courier">

+------+           +---------+      Request      +------------+
|Button| --------> | Arduino | ----------------> |     PC     |
+------+           | (guest) |                   |   (host)   |
                   |         | <---------------- |            |
                   +---------+       Data        +------------+
                       |
                       |
                       |
                       V
                  +---------+
                  | Display |
                  +---------+
</pre>

The format of the requests is `REQUEST <arguments>`, with the arguments
separated by spaces. An argument can also be between quotation marks, and can
be escaped the same way as `bash` does. The format of the responses is
`REQUEST <data>`, with the same name as the request.

### PCDisplay Host

The host code runs on the computer and sends the data to the Arduino. It
has the following files:

- `arduino_serial.rb`: contains the Arduino class, that abstracts the library
  SerialPort;

- `serial_server.rb`: library that allows the creation of a server capable of
  processing a request sent by the Arduino and sending the requested data. Its
  syntax is based on the famous Ruby framework Sinatra;

- `pc.rb`: contains the singleton class `PC`, that centralizes several
  measurements of the computer, always quickly providing the requested data.
  Each measurement is executed in a different thread, updating the `PC`
  singleton;

- `main.rb`: this file contains the definitions of the callbacks for each
  request, following this format:

~~~ruby
request 'REQUEST_NAME' do
   data = get_data
   "REQUEST_NAME #{data}"
end
~~~


In other words, the data flow inside the host is the following:

<pre style="font-size: 10px; font-family: courier">


+-------+    Request     +------------+      +--------+
|       | -------------> |SerialServer| ---> |        |
|Arduino|                +------------+      |callback|
|       | <--------------------------------- |        |
+-------+             Data                   +--------+
                                                  ^
                                                  |
                                            +------------+        +--------+
                                            |            | <----- | Player |
                                            |     PC     |        +--------+
                                            |            |
                                            +------------+ <----- +---------+
                                            ^ ^   ^   ^ ^         | Network |
                                            | |   |   | |         +---------+
                                      +-----+ | +---+ | +----+
                                      | CPU | | |RAM| | |Time|
                                      +-----+ | +---+ | +----+
                                              |       |
                                         +--------+  +-----------+
                                         |Hostname|  |Temperature|
                                         +--------+  +-----------+


</pre>

### PCDisplay Guest

PCDisplay Guest is executed on Arduino, and it works as a state machine:


<pre style="font-size: 10px; font-family: courier">

+---------+         +------+          +-----+
| SYSINFO | ------> | TIME | -------> | CPU |
+---------+         +------+          +-----+
     ^                                    |
     |                                    V
+-------+     +-----+      +------+     +-----+
| MEDIA | <-- | NET | <--- | TEMP | <-- | RAM |
+-------+     +-----+      +------+     +-----+

</pre>

Each state has a associated screen update function, that reads the desired
information contained in the global struct `INFO`, and show it on the screen.

The main loop do the following actions:

1. If a state change is scheduled, it changes the state. Otherwise, it stays on
   the same state;

2. Sends a request from the list of requests;

3. Waits for the result and updates the struct `INFO` with the incoming data
   from the computer. If it timeouts, it considers that the connection was lost,
   and it tries to reconnect;

4. Shows the information on the screen, executing the associated function.

A state change is scheduled when the button is pressed. That event
triggers an interruption that sets a flag that signalizes that in the next
cycle the state must be changed.


### Gallery
{% include gallery caption="Gallery" %}


### Update (10/2021)

After some time, the display stopped working and I decided to replaced by a new
one, with a graphical 128x64px display. This new display is able to show all
the information in a single screen, so, it doesnt't need the state machine and
the button anymore.

The rest of the code remains the same.

<div class="img-container">
  <figure>
    <img class="large" src="{{ site.baseurl }}/assets/images/hardware/2020-06-14-pcdisplay/128.jpg">
    <figcaption>Graphical display, with network, CPU, RAM, and media info</figcaption>
  </figure>
</div>
