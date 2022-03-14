document
  .querySelector('table tbody')
  .addEventListener('click', function (event) {
    if (event.target.nodeName === 'BUTTON') {
      // set the text in the next cell, but after async delay
      // to make sure we write a flake-free test that retries
      setTimeout(function () {
        const cell = event.target.parentElement.parentElement.children[1]
        cell.innerText = Math.random().toString().substr(2, 1)
      }, 1000)
    }
  })
