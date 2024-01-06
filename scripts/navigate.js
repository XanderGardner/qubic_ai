// navigate to different path, assuming always at most one layer deep

// path may be "index.html" or "html/game.html"
function navigateTo(path) {
  const bodyElement = document.getElementById('body');
  const filePath = `../${path}`;

  const request = new XMLHttpRequest();
  request.open('GET', filePath, false);
  request.send();

  if (request.status === 200) {
    bodyElement.innerHTML = request.responseText;
  } else {
    console.error(`Failed to fetch ${filePath}: ${request.status} ${request.statusText}`);
  }
}