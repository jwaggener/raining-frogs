// https://blog.logrocket.com/exploring-web-audio-api-web-midi-api/
// import {
// getHz,
// freqs,
// getContainer,
// getResys,
// } from "./helpers";
// https://codepen.io/stoumann/pen/ZEjjyEp
// <button aria-label="C#3" data-freq="138.59131548843604" name="midi_49" "="" style="--gcs:3"
//type="button>"></button>
// create the frequencies
// create the data object
// once you have arr of data objects
// then grab the resy buttons
// apply the data to those buttons
// then the noteon sutff will have what it needs
// the first arg to noteon is an element with some data attribute
// which is freq
// you can just repeat the key board over and over among the
// resys
// you grab the element by note like midi_52
// and then grab the frequency from that.
// so the frequencies are produces mathematically
// and associated with a note

// notes
const notes = ["A","A#","B","C","C#","D","D#","E","F","F#","G","G#"];

//helpers
const getHz = (N = 0) => 440 * Math.pow(2, N / 12);

// A440 is midi note 69, 0x45 hexadecimal
// So that means what?
// if start is -48, which is A at freq 27.5
// and if -48 is to the left of A440, 69
// then it is 21

const a440MidiNote = 69;
const freqs = (start, end) => {
  let black = 0,
  white = -2;
  return Array(end - start)
    .fill()
    .map((_, i) => {
      const key = (start + i) % 12;
      const midiNote = (start + i) + a440MidiNote;

      const note = notes[key < 0 ? 12 + key : key];
      const octave = Math.ceil(4 + (start + i) / 12);
      if (i === 0 && note === "C") black = -3;
      note.includes("#")
        ? ((black += 3), ["C#", "F#"].includes(note)
        && (black += 3))
        : (white += 3);

      return {
        note,
        midiNote,
        freq: getHz(start + i),
        octave: note === "B" || note === "A#"
        ? octave - 1 : octave,
        offset: note.includes("#") ? black : white,
      };
    });
};

// const keysData = freqs(-48, 40);
const keysData = freqs(-21, 27);

const getContainer = () => (document.querySelector("body"))

const getResys = () => (document.querySelectorAll("button, a"))

const applyKeysToElements = (keys, elements) => {
  let i = 0;
  elements.forEach(
    element => {
      element.onmouseenter = event => {
      noteon(event.target, [{freq: event.target.dataset.freq}])
    };

    element.onmouseleave = event => {
      noteoff(event.target)
    };
    element.name = `midi_${keys[i].midiNote}`
    element.dataset.freq = keys[i].freq;
    // element.style.setProperty("--v", "helllllo")//keys[i].note)
    // element.style.setProperty("--bc", "yellow")
    element.className += ` note ${keys[i].note}-note`
      i = i === keys.length - 1 ? 0 : i + 1;
    }
  )
}

/* midi.js */
function enableMIDI(element) {
  const onMIDISuccess = (midiAccess) => {
  for (var input of midiAccess.inputs.values()) input.onmidimessage = getMIDIMessage;
}

const getMIDIMessage = message => {
  const [command, note, velocity] = message.data;

  switch (command) {
    case 144: // on
      if (velocity > 0) {
        const event = new CustomEvent("noteon", { detail: { note, velocity }});
        element.dispatchEvent(event)
      }
    break;

    case 128: // off
      const event = new CustomEvent("noteoff", { detail: { note }});
      element.dispatchEvent(event)
      break;
    }
  }

  if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess().then(onMIDISuccess, () => console.log("Could not access your MIDI devices."));
  }
}
/* audio.js */
const audioCtx = new (window.AudioContext || window.webkitAudioContext)
const gainNode = audioCtx.createGain()
const notemap = new Map();
gainNode.connect(audioCtx.destination);

function createOscillator(freq) {
  const oscNode = audioCtx.createOscillator()
  oscNode.type = "triangle" // sine, square, triangle, sawtooth
  oscNode.frequency.value = freq
  oscNode.connect(gainNode)
  return oscNode
}

function noteon(key) {
  if (!key.classList.contains("on")) {
    key.focus();
    gainNode.gain.value = 0.33
    notemap.set(key.name, createOscillator(key.dataset.freq))
    notemap.get(key.name).start(0)

    key.classList.add("on")
  }
}
function noteoff(key) {
  key.classList.remove("on")
  const oscNode = notemap.get(key.name)
  if (oscNode) oscNode.stop(0)
  notemap.delete(key.name)
}

/* init */
function soundsOfResy() {
  // getResys and then you can make the parent
  // of the first item the container
  // that"s still not quite right but hey
  const container = getContainer();
  enableMIDI(container);
  applyKeysToElements(
    keysData,
    getResys(),
  );

  container.addEventListener("noteon", (event) => {
    const notes = document.getElementsByName(`midi_${event.detail.note}`);
    // container.elements[`midi_${event.detail.note}`]
    // const note = event.detail.note;
    // notes[0].style.setProperty("--v", event.detail.velocity)
    noteon(notes[0], [{freq: notes[0].dataset.freq}]);
  })

  container.addEventListener("noteoff", (event) => {
    const notes = document.getElementsByName(`midi_${event.detail.note}`);
    //const note = container.elements[`midi_${event.detail.note}`]
    noteoff(notes[0])
  })
}
function drawKeyboard() {
  const container = document.createElement('div');
  container.id = 'keyboard-container';

  const form = document.createElement('form');
  form.className = 'synth';
  form.id = 'midi';
  form.style = '--synth-bgc: hsl(216, 69%, 27%);--_h:216;';

  const keysContainer = document.createElement('div');
  keysContainer.classList = ['kb kb--49'];
  keysContainer.id = 'kb49';

  form.append(keysContainer);
  container.append(form);

  document.querySelector('body').appendChild(container);
}

const render = (data) => data.map(item => `
  <div data-note="${item.note}${item.octave}"
  data-freq="${item.freq}" style="--gcs:${item.offset}" 
  type="button>"></div>`).join('\n')


drawKeyboard();

kb49.innerHTML = render(keysData);

const keys = midi.querySelectorAll('#kb49>div');
keys.forEach(key => {
  key.addEventListener('pointerdown', event => {
    console.log('key', key)
    noteon(event.target, [{freq: event.target.dataset.freq}]);

    const frogToAppend = getFrog();
    frogToAppend.classList.add(`frog-${event.target.dataset.note[0]}`);
    key.append(frogToAppend);

    // document.querySelector('body').append(getFrog());
  })
  key.addEventListener('pointerup', event => { noteoff(event.target) })
  key.addEventListener('pointerleave', event => { noteoff(event.target) })
})

function getFrog() {
  const frog = document.createElement('div');
  frog.className = 'frog';
  const frogface = document.createElement('div');
  frogface.className = 'frogface';
  const frogEyes = document.createElement('div');
  frogEyes.className = 'frogeyes';
  const frogtongue = document.createElement('div');
  frogtongue.className = 'frogtongue';

  frogface.appendChild(frogEyes);
  frogface.appendChild(frogtongue);
  frog.appendChild(frogface);
  return frog;
}

soundsOfResy();

// midi.addEventListener("submit", event => event.preventDefault())
// const keys = midi.querySelectorAll("button");
// keys.forEach(key => {
// key.addEventListener("pointerdown", event => {
// noteon(event.target, [{freq: event.target.dataset.freq}])
// })
// key.addEventListener("pointerup", event => { noteoff(event.target) })
// key.addEventListener("pointerleave", event => { noteoff(event.target) })
