const canvas = document.querySelector('#visualizer');
const gl = canvas.getContext('webgl');

if (!gl) {
  throw new Error('WebGL not supported');
}

const render = (audioBuffer) => {
  // Tell WebGL how to convert from clip space to pixels
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  if (audioBuffer) {
    // Clear screen with rhythm.
    gl.clearColor(audioBuffer[0] / 1000, audioBuffer[1] / 1000, audioBuffer[2] / 1000, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }
}

render();
window.addEventListener('resize', render);