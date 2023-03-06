---
title: "Playing songs in a 3D printer"
excerpt: "As the sound of the steppers wasn't music enough"
author_profile: true

header:
   teaser: /assets/images/software/musica_gcode.svg

lang: en
path-pt_br: "/software/2020-07-31-musica_gcode/"

last_modified_at: 2023-03-08

---

GitHub: [https://github.com/lucasoshiro/music2gcode](https://github.com/lucasoshiro/music2gcode)

## What?

The vibration of the stepper motors cause their sound. Its frequency increases
as much as the number of steps that the stepper does per second, consequently,
its pitch rises accordingly. Here I describe how I used them to play music.

Manipulate the frequency of a stepper motor individually is easy when we have
direct access to them. As an example: when we have an Arduino controlling them
through a stepper driver. Even though I assembled my own 
[3D printer](https://lucasoshiro.github.io/hardware-en/2020-06-14-impressora_3d/) 
using an Arduino and stepper motors, controlling the frequency of each stepper
would require to make changes in its firmware, and that's not in the scope
of this project. Here, I aim to play music using __only__ the protocol that is
normally used in 3D printing.

In order to do that, I wrote a code in Haskell that receives as its input a song
written in a specific format and returns as output G-Code commands that, when
executed by a 3D printer, plays a song on its steppers.

Even though G-Code is a universal protocol that is used beyond 3D printers (it
is also used by other machines, such as laser cutters), my focus here is the
Cartesian FDM 3D printers (perhaps the most common ones...). It would work, for
example, in Delta 3D printers.

### Input

The input is a song described in a format that is a simplified version of 
[the one that I defined in this project](https://hardwarelivreusp.org/projetos/2019/03/02/musical_lpt/).
From the musical perspective of view, it is very limited and not much flexible
compared to the most well-known formats, as MIDI, MusicXML, and the formats used
by musical notation software (such as Finale, Encore, Sibelius, GuitarPro,
Musescore, etc), however, it is easy to be written by humans and parsed by
software. Its syntax is the following:

```
TEMPO <bpm>

BEGINCH
<1st note of the 1st channel>
<2nd node of the 1st channel>
...
ENDCH

BEGINCH
<1st note of the 2nd channel>
<2nd node of the 2nd channel>
ENDCH

```

As you may thought, `BEGINCH` and `ENDCH` define the beginning and the end of a
channel. All the channels are played at the same time.

Each note is represented by `<note> <octave> <duration>`, using anglo-saxon
notation (CDEFGAB), it can be sharp (`#`) or flat (`b`), and the duration is
expressed in number of beats. Double sharps and double flats are not supported.
Silences are can be declared as `- <duration>`.

In the next drawing I show the initial measures of Brejeiro, a chorinho (a
Brazilian traditional genre), composed by Ernesto Nazareth (if you have never
head it, check it out on
[Spotify](https://open.spotify.com/track/7IqgU1s9DQbSp5fndjVbQS?si=QzeWZO5sTjulrD2rNjrDcQ)),
written as a sheet music and being transcribed to that format:


<div class="img-container">
  <figure>
    <img class="large" src="{{ site.baseurl }}/assets/images/software/2020-07-31-musica_gcode/brejeiro.jpg">
    <figcaption>Transcription of a sheet music to the format that we expect as
  input (yeah, I know that my handwriting is terrible).</figcaption>
  </figure>
</div>


### Output

The output are G-Code commands. More specifically, I'm only generating
[G0 (Linear Move)](https://marlinfw.org/docs/gcode/G000-G001.html). They have
the following syntax:

```
G0 X<X position> Y<Y position> Z<Z position> F<speed>
```

For example, `G0 X10 Y20 Z30 F200` will linearly move the printing nozzle to the
position (10mm, 20mm, 30mm) at a speed of 200mm/min.

## How it works

Using the same example, Brejeiro, the conversion will be performed like
described in the next picture. The numbers represent the steps of the conversion:

<div class="img-container">
  <figure>
    <img class="large" src="{{ site.baseurl }}/assets/images/software/2020-07-31-musica_gcode/overview.jpg">
    <figcaption>G-Code conversion steps</figcaption>
  </figure>
</div>

### Step 1: parser

I'll skip it because it is boring... We only need to know that we have a
function with this signature:

~~~haskell
parseSong :: [String] -> Song
~~~

In other words, it receives as parameter a list of `String`s and return a
`Song` , where:

~~~haskell
type Hz  = Float
type Sec = Float
type Bpm = Int

data SongAtom = Silence Sec | Note (String, Int, Sec)
type Channel  = [SongAtom]
type Song     = (Bpm, [Channel])
~~~

Translating it to English, that means that `Hz` and `Sec` are only type synonyms
of `Float`, and `Bpm` is a type synonym of `Int`. Thus, `Song` is composed by
the song BPM and a list of channels, where each channel is a list of
`SongAtom`s, that can silences or notes.

### Steps 2 and 3: frequency table


#### Calculating the frequencies

We want to build a table with events showing what frequency will be played by
each axis on each time instant, accordingly to the song parsed in the previous
step. Forgive me for using musical slang, however, I can't get rid of it to
explain it... Anyway, we want a function `freqEventsFromSong`, where:

~~~haskell
type FreqEvent = (MiliSec, Hz, Hz, Hz)
freqEventsFromSong :: Song -> [FreqEvent]
~~~

Ok. First of all, we need to know how to find the frequency of each note. Based
on the [formula in this page](https://pages.mtu.edu/~suits/NoteFreqCalcs.html),
we can calculate it:

~~~haskell
c0 = 16.351597831287418
baseExp = 1.0594630943592953


freq :: SongAtom -> Hz
freq (Silence _) = 0.0
freq (Note n) = mult * c0 * baseExp ** (fromIntegral $ fromFigure figure)
  where (figure, octave, _) = n
        mult = fromIntegral $ ((2 :: Int) ^ octave)
~~~

WHAAAT? Well, the frequency of the silence is obviously 0Hz, so, we can hardcode
it. `c0` is the frequency of `C 0` (check it on the page that I mentioned
before), and it will be used to calculate the frequencies of the other
notes. `mult` is the octave multiplier: due to the fact that the frequency of
each note is the double of the frequency of the lower octave, that multiplier
will be `2 ^ octave`. 

`fromFigure` is a function with the following signature:

~~~haskell
fromFigure :: String -> Int`
~~~

I'm not going to detail its implementation, it is enough to know that, given
a note expressed in a string (e. g. `A#`), it returns how many half-tones it is
far from the C in the same octave (in the example of `A#`, 10). `baseExp` is the
ratio between the frequency of a note and the frequency of the note one
half-tone below, that is `2^(1/12)`.

Joining the two things, we can calculate the frequency of the note by `mult * c0 *
(baseExp ^ (fromFigure <figure>))`.

#### Calculating the duration of the notes

We calculate the duration of the notes using the following function:

~~~haskell
period :: Int -> Float -> Sec
period bpm beats = 60 * beats / (fromIntegral bpm)
~~~

In other words, it is a Rule of Three: if it does `bpm` beats in 60 seconds, how
many seconds does it take to do `beats` beats?

#### Joining the three channels into a single table

Once calculated the durations and the frequencies of each note or silence of
each channel, we need to join the information of the three channels in only one
table, in the format described in the beginning of this step (a table of
`FreqEvent`s).

By now, we have 3 tables, each one for a channel, where the columns are
`(Duration, Frequency)`. How can we know when each note will start? It's simple:
as they are sequential on each channel, the beginning of each note is equal to
the sum of the duration of all the previous notes.

Now, we can join those three tables into a new one where each entry of the table
represents when there's a change of frequency in one of the channels, and it
contains the new frequency for channel that changed, and the frequency of the
other channels that remain unchanged. This way, we can achieve the expected
result of `freqEventsFromSong`.

### Step 4: Position and speed changes

In this step, we want to take the output of the previous step and use it to
calculate how many steps each axis should move in order to play the notes and
the speed of that movement. In other words, it's this function
`fromFreqEvents`:

~~~haskell
type MM       = Float
type MM_s     = Float
type Movement = (MM, MM, MM, MM_s)

fromFreqEvents :: Printer -> [FreqEvent] -> [Movement]
~~~

where `Printer` contains information about the printer, `[FreqEvent]` is a list
of events generated in the previous step and `[Movement]` is a lista of the
resulting movements.

As I said before, the pitch of each note can be heard due to the frequency of
the movement of the stepper motors. And its duration? Well, it's easy, we only
need to multiply the frequency by the duration, with `p = Δt * f`, where `p` is
the number of steps, `Δt` is the duration, and `f` is the frequency. For
example: if we have a 440Hz note playing during 2s, then we need to step 880
time at 440Hz.

And as I said before, we don't have the control of that directly through G-Code,
however, we can control how many **millimeters** each axis will move and the
speed of that movement in **millimeters per minute**. And how can we calculate
that? Well, again, it's simple: for each axis, the position can be calculated
using the formula `Δs = p * (pmm)`, where `p` is the number of steps and `pmm`
is how many steps are required to the axis to move 1mm.

The speed should be calculated for the three axes at the same time. If you
remember physics classes, then you know that the speed of each axis can be
calculated using `v = Δs / Δt`. However, the speed that we need to provide in
the G-Code is the absolute value of the vector addition of the speed of the
three axes, then the `Δs` should be the absolute value of the vector addition of
the displacements of the axes. In other words: `Δs = sqrt (Δsx² + Δsy² + Δsz²)`.

Now we only need to convert the speed units, as we are working with
**millimeters** and **miliseconds** and G-Code works with **millimeters per
minute**.

### Step 5: Absolute positioning and G-Code

This is the last step, and the hardest one. So far, we have a table that
contains **how many** millimeters each axis should move, and the speed of the
movement. What we want, in G-Code, is the **absolute** position where the
printer will move the nozzle to. In order to build that G-Code we need to be
careful that the movements be restricted to the printing space. Otherwise, it
won't work and can be harmful to the printer.

We need a code that does this:

~~~haskell
fromRelativeMovements :: Printer -> [Movement] -> GCode
~~~

or, in other words, a code that takes as arguments the printer information (what
we need here is the limits of each axis) and the list of relative movements
mentioned in the previous step. That function returns the resulting G-Code.

The first position is the origin of the sequence of following movements, and it
is defined like this:

~~~haskell
fstPos = (x0, y0, z0, homeSpeed)
~~~

Given a position, we can calculate the next one, recursively. So, having the
first position and the list of the following movements, we can calculate the
absolute positions like that:

~~~haskell
absolutes = foldl nextSafeMovement [fstPos] movements
  where nextSafeMovement l d = l ++ nextSafeMovements printer (last l) d
~~~

Or, in English: the application of the function `nextSafeMovements`, having as
arguments `printer` (the printer info), an absolute position and the relative
position of the next relative movement returns the next positions that the
printer should move to in order to finish that movement. Well, yeah, it's a
little bit confusing. But keep in mind that we need to do this because a single
movement may be broken in two or more movements if it exceeds the printer
limits.

Ok, but, what is `nextSafeMovement`? It is a function with this signature:

~~~haskell
nextSafeMovements :: Printer -> Position -> Movement -> [Position]
~~~

that is, a function that takes as argument the printer information, the last
absolute position, the relative movement that we want to apply, and it returns a
list of relative positions.

This function is quite long to be described here, however, we only need to know
that:

- the direction of the movement is the one that moves towards the furthest end
  of the axis, giving it more room to move;

- if there's room enough to only make one movement, then it will be used;

- otherwise, the movement will be done until the nozzle hits a border. The
  resulting position and the remaining relative movement will be used as
  parameters to the same function. That recursive call will be done until
  there's no more remaining relative movement;

- the speed is always the same that was calculated previously for the relative
  movement, we don't need to touch it.

Then we have a list of the positions where each axis should move to, and the
speed of each of those movements. Those are the parameters of the G0 G-Code, so,
we only need to format them as described in the
[the beginning of this text]({{ site.baseurl}}/software-en/2020-07-31-music_gcode/#output).

### Finally, G-Code

Finally we have the resulting G-Code, that can be loaded in a SD card, or it can
be sent to the printer through a software.

## Possible next features

- Show the lyrics in the printer display;
- Use the extruder stepper as an extra channel;
- Use the buzzer as an extra channel;
- Add support to Delta and CoreXY printers;

### 2023 Update

I forgot to add a video showing it working. Here it is:

<blockquote class="instagram-media" data-instgrm-captioned data-instgrm-permalink="https://www.instagram.com/reel/Cha_0K2LcN3/?utm_source=ig_embed&amp;utm_campaign=loading" data-instgrm-version="14" style=" background:#FFF; border:0; border-radius:3px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 1px; max-width:540px; min-width:326px; padding:0; width:99.375%; width:-webkit-calc(100% - 2px); width:calc(100% - 2px);"><div style="padding:16px;"> <a href="https://www.instagram.com/reel/Cha_0K2LcN3/?utm_source=ig_embed&amp;utm_campaign=loading" style=" background:#FFFFFF; line-height:0; padding:0 0; text-align:center; text-decoration:none; width:100%;" target="_blank"> <div style=" display: flex; flex-direction: row; align-items: center;"> <div style="background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 40px; margin-right: 14px; width: 40px;"></div> <div style="display: flex; flex-direction: column; flex-grow: 1; justify-content: center;"> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; margin-bottom: 6px; width: 100px;"></div> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; width: 60px;"></div></div></div><div style="padding: 19% 0;"></div> <div style="display:block; height:50px; margin:0 auto 12px; width:50px;"><svg width="50px" height="50px" viewBox="0 0 60 60" version="1.1" xmlns="https://www.w3.org/2000/svg" xmlns:xlink="https://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-511.000000, -20.000000)" fill="#000000"><g><path d="M556.869,30.41 C554.814,30.41 553.148,32.076 553.148,34.131 C553.148,36.186 554.814,37.852 556.869,37.852 C558.924,37.852 560.59,36.186 560.59,34.131 C560.59,32.076 558.924,30.41 556.869,30.41 M541,60.657 C535.114,60.657 530.342,55.887 530.342,50 C530.342,44.114 535.114,39.342 541,39.342 C546.887,39.342 551.658,44.114 551.658,50 C551.658,55.887 546.887,60.657 541,60.657 M541,33.886 C532.1,33.886 524.886,41.1 524.886,50 C524.886,58.899 532.1,66.113 541,66.113 C549.9,66.113 557.115,58.899 557.115,50 C557.115,41.1 549.9,33.886 541,33.886 M565.378,62.101 C565.244,65.022 564.756,66.606 564.346,67.663 C563.803,69.06 563.154,70.057 562.106,71.106 C561.058,72.155 560.06,72.803 558.662,73.347 C557.607,73.757 556.021,74.244 553.102,74.378 C549.944,74.521 548.997,74.552 541,74.552 C533.003,74.552 532.056,74.521 528.898,74.378 C525.979,74.244 524.393,73.757 523.338,73.347 C521.94,72.803 520.942,72.155 519.894,71.106 C518.846,70.057 518.197,69.06 517.654,67.663 C517.244,66.606 516.755,65.022 516.623,62.101 C516.479,58.943 516.448,57.996 516.448,50 C516.448,42.003 516.479,41.056 516.623,37.899 C516.755,34.978 517.244,33.391 517.654,32.338 C518.197,30.938 518.846,29.942 519.894,28.894 C520.942,27.846 521.94,27.196 523.338,26.654 C524.393,26.244 525.979,25.756 528.898,25.623 C532.057,25.479 533.004,25.448 541,25.448 C548.997,25.448 549.943,25.479 553.102,25.623 C556.021,25.756 557.607,26.244 558.662,26.654 C560.06,27.196 561.058,27.846 562.106,28.894 C563.154,29.942 563.803,30.938 564.346,32.338 C564.756,33.391 565.244,34.978 565.378,37.899 C565.522,41.056 565.552,42.003 565.552,50 C565.552,57.996 565.522,58.943 565.378,62.101 M570.82,37.631 C570.674,34.438 570.167,32.258 569.425,30.349 C568.659,28.377 567.633,26.702 565.965,25.035 C564.297,23.368 562.623,22.342 560.652,21.575 C558.743,20.834 556.562,20.326 553.369,20.18 C550.169,20.033 549.148,20 541,20 C532.853,20 531.831,20.033 528.631,20.18 C525.438,20.326 523.257,20.834 521.349,21.575 C519.376,22.342 517.703,23.368 516.035,25.035 C514.368,26.702 513.342,28.377 512.574,30.349 C511.834,32.258 511.326,34.438 511.181,37.631 C511.035,40.831 511,41.851 511,50 C511,58.147 511.035,59.17 511.181,62.369 C511.326,65.562 511.834,67.743 512.574,69.651 C513.342,71.625 514.368,73.296 516.035,74.965 C517.703,76.634 519.376,77.658 521.349,78.425 C523.257,79.167 525.438,79.673 528.631,79.82 C531.831,79.965 532.853,80.001 541,80.001 C549.148,80.001 550.169,79.965 553.369,79.82 C556.562,79.673 558.743,79.167 560.652,78.425 C562.623,77.658 564.297,76.634 565.965,74.965 C567.633,73.296 568.659,71.625 569.425,69.651 C570.167,67.743 570.674,65.562 570.82,62.369 C570.966,59.17 571,58.147 571,50 C571,41.851 570.966,40.831 570.82,37.631"></path></g></g></g></svg></div><div style="padding-top: 8px;"> <div style=" color:#3897f0; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:550; line-height:18px;">View this post on Instagram</div></div><div style="padding: 12.5% 0;"></div> <div style="display: flex; flex-direction: row; margin-bottom: 14px; align-items: center;"><div> <div style="background-color: #F4F4F4; border-radius: 50%; height: 12.5px; width: 12.5px; transform: translateX(0px) translateY(7px);"></div> <div style="background-color: #F4F4F4; height: 12.5px; transform: rotate(-45deg) translateX(3px) translateY(1px); width: 12.5px; flex-grow: 0; margin-right: 14px; margin-left: 2px;"></div> <div style="background-color: #F4F4F4; border-radius: 50%; height: 12.5px; width: 12.5px; transform: translateX(9px) translateY(-18px);"></div></div><div style="margin-left: 8px;"> <div style=" background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 20px; width: 20px;"></div> <div style=" width: 0; height: 0; border-top: 2px solid transparent; border-left: 6px solid #f4f4f4; border-bottom: 2px solid transparent; transform: translateX(16px) translateY(-4px) rotate(30deg)"></div></div><div style="margin-left: auto;"> <div style=" width: 0px; border-top: 8px solid #F4F4F4; border-right: 8px solid transparent; transform: translateY(16px);"></div> <div style=" background-color: #F4F4F4; flex-grow: 0; height: 12px; width: 16px; transform: translateY(-4px);"></div> <div style=" width: 0; height: 0; border-top: 8px solid #F4F4F4; border-left: 8px solid transparent; transform: translateY(-4px) translateX(8px);"></div></div></div> <div style="display: flex; flex-direction: column; flex-grow: 1; justify-content: center; margin-bottom: 24px;"> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; margin-bottom: 6px; width: 224px;"></div> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; width: 144px;"></div></div></a><p style=" color:#c9c8cd; font-family:Arial,sans-serif; font-size:14px; line-height:17px; margin-bottom:0; margin-top:8px; overflow:hidden; padding:8px 0 7px; text-align:center; text-overflow:ellipsis; white-space:nowrap;"><a href="https://www.instagram.com/reel/Cha_0K2LcN3/?utm_source=ig_embed&amp;utm_campaign=loading" style=" color:#c9c8cd; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:normal; line-height:17px; text-decoration:none;" target="_blank">A post shared by Lucas Oshiro (@lucasseikioshiro)</a></p></div></blockquote>
<script async src="//www.instagram.com/embed.js"></script>

### 2023 Update #2

After some requests, I also added support for GuitarPro tabs as input. It was
only coded in an afternoon, so, it's can be very buggy. However, it's a great
improvement, as it is easier to edit than the format that I described above.

This new code works as the parser described in step 1.
