let analyzer;
let isVisualizerOn = false;

const audioPlayer = document.getElementById("audio-player");

document.getElementById("audio-file-input").addEventListener("change", async function () {
  if (this?.files.length) {
    audioPlayer.src = URL.createObjectURL(this?.files[ 0 ]);
  } else {
    alert("No fue posible procesar el audio.");
  }
}, false);

document.getElementById("audio-player").addEventListener("play", function () {
  if (!analyzer) {
    const audioContext = new AudioContext();

    analyzer = audioContext.createAnalyser();

    const track = audioContext.createMediaElementSource(audioPlayer);

    track.connect(analyzer);
    analyzer.connect(audioContext.destination);
  }
  isVisualizerOn = true;
});

document.getElementById("audio-player").addEventListener("pause", function () {
  isVisualizerOn = false;
});

document.getElementById("audio-player").addEventListener("ended", function () {
  URL.revokeObjectURL(this.src);
  isVisualizerOn = false;
});

export { analyzer, isVisualizerOn };