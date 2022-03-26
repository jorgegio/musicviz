let audioBufferIntervalId;
let analyzer;

document.getElementById("audio-file-input").addEventListener("change", async function() {
  if (this?.files.length) {
    const audioPlayer = document.getElementById("audio-player");
    audioPlayer.src = URL.createObjectURL(this?.files[0]);

    const audioContext = new AudioContext();
    analyzer = audioContext.createAnalyser();
    const track = audioContext.createMediaElementSource(audioPlayer);

    track.connect(analyzer);
    analyzer.connect(audioContext.destination);
  } else {
    alert("No fue posible procesar el audio.");
  }
}, false);

document.getElementById("audio-player").addEventListener("play", function () {
  audioBufferIntervalId = setInterval(() => {
    const bufferSize = analyzer.frequencyBinCount;
    const buffer = new Float32Array(bufferSize);
    analyzer.getFloatTimeDomainData(buffer);
    render(buffer);
  }, 1000); // Render velocity.
});

document.getElementById("audio-player").addEventListener("pause", function () {
  clearInterval(audioBufferIntervalId);
});

document.getElementById("audio-player").addEventListener("ended", function () {
  URL.revokeObjectURL(this.src);
  clearInterval(audioBufferIntervalId);
});