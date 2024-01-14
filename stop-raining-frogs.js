function disableMIDI(element) {
  const onMIDISuccess = (midiAccess) => {
    for (var input of midiAccess.inputs.values()) input.onmidimessage = null;
  }
}

console.log('disabling midi');
disableMIDI();