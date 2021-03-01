/// <reference types="cypress" />

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {
  on('task', {
    randomNumber() {
      return new Promise((resolve) => {
        setTimeout(() => {
          const n = parseInt(Math.random().toString().slice(6, 7))
          console.log('returning %d', n)
          resolve(n)
        }, 1000)
      })
    }
  })
}
