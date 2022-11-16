// make sure the number 7 is present on the page
// by making an array of numbers that includes it
// and just shuffling it
function shuffleArray(arr) {
  arr.sort(() => Math.random() - 0.5)
}
const n = document.querySelectorAll('table tbody tr').length
const numbers = Array.from({ length: n }, (_, i) => i % 10)
shuffleArray(numbers)

document
  .querySelector('table tbody')
  .addEventListener('click', function (event) {
    if (event.target.nodeName === 'BUTTON') {
      // set the text in the next cell, but after async delay
      // to make sure we write a flake-free test that retries
      setTimeout(function () {
        const cell = event.target.parentElement.parentElement.children[1]
        cell.innerText = numbers.shift()
      }, 1000)
    }
  })
