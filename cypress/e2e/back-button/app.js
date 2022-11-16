let currentPage = 4

function renderPage() {
  document.getElementById('page').innerText = currentPage
  if (currentPage > 0) {
    document.getElementById('controls').innerHTML = `
      <button id="back">Back</button>
    `
  } else {
    document.getElementById('controls').innerHTML = ''
  }
}

renderPage()
document.addEventListener('click', (event) => {
  if (event.target.id === 'back') {
    currentPage--
    renderPage()
  }
})
