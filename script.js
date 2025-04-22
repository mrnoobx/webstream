const client = new WebTorrent();

function makeDraggable(el) {
  let pos = { top: 0, left: 0, x: 0, y: 0 };

  const mouseDownHandler = function (e) {
    pos = {
      left: el.offsetLeft,
      top: el.offsetTop,
      x: e.clientX,
      y: e.clientY,
    };

    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
  };

  const mouseMoveHandler = function (e) {
    const dx = e.clientX - pos.x;
    const dy = e.clientY - pos.y;
    el.style.left = `${pos.left + dx}px`;
    el.style.top = `${pos.top + dy}px`;
    el.style.position = 'absolute';
  };

  const mouseUpHandler = function () {
    document.removeEventListener('mousemove', mouseMoveHandler);
    document.removeEventListener('mouseup', mouseUpHandler);
  };

  el.addEventListener('mousedown', mouseDownHandler);
}

function startStream() {
  const magnetURI = document.getElementById('magnetInput').value;
  const output = document.getElementById('output');
  const status = document.getElementById('status');
  output.innerHTML = '';
  status.textContent = 'Connecting to peers...';

  client.add(magnetURI, torrent => {
    const file = torrent.files.find(f => /\.(mp4|webm|mkv)$/i.test(f.name));
    if (!file) {
      status.textContent = 'No video file found in torrent.';
      return;
    }

    status.textContent = 'Streaming: ' + file.name;

    file.appendTo(output, {
      autoplay: true,
      controls: true
    }, err => {
      if (err) {
        status.textContent = 'Error appending video.';
        console.error(err);
      }
    });

    torrent.on('download', () => {
      const percent = (torrent.progress * 100).toFixed(2);
      status.textContent = `Streaming: ${file.name} (${percent}%)`;
    });

    // Make the video draggable once loaded
    makeDraggable(output.querySelector('video'));
  });
}
