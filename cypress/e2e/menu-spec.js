import { recurse } from '../..'
// https://github.com/bahmutov/cypress-map
import 'cypress-map'

// watch the video "Pick A Random Menu Link"
// https://youtu.be/xvvL3GRjXCY

describe('Menu', () => {
  beforeEach(() => {
    cy.visit('cypress/e2e/menu/index.html')
  })

  it('goes to the A menu and back', () => {
    cy.contains('main', 'Index page')
    cy.contains('nav a', 'A').click()
    cy.contains('main', '/A')
    cy.contains('nav a', 'a1').click()
    cy.contains('main', '/A /a1')
    cy.go('back')
    cy.location('pathname').should('include', '/menu/a/index.html')
    cy.go('back')
    cy.location('pathname').should('include', '/menu/index.html')
  })

  it('picks random top-menu link', () => {
    cy.contains('main', 'Index page')
    cy.get('nav a')
      .then(($a) => Cypress._.sample($a.toArray()))
      .click()
    cy.location('pathname').should(
      'match',
      /\/menu\/[a-d]\/index.html/,
    )
  })

  it('picks random top-menu link using cy.sample from cypress-map', () => {
    cy.contains('main', 'Index page')
    // cy.sample comes from cypress-map plugin
    cy.get('nav a').sample().click()
    cy.location('pathname').should(
      'match',
      /\/menu\/[a-d]\/index.html/,
    )
  })

  it('keeps clicking on the random navigation link', () => {
    cy.contains('main', 'Index page')
    cy.log('**random navigation**')
    recurse(
      () => cy.get('nav a').should(Cypress._.noop),
      ($a) => $a.length === 0,
      {
        log: false,
        post() {
          cy.get('nav a')
            .then(($a) => Cypress._.sample($a.toArray()))
            .click()
        },
      },
    )
    // confirm there are no more links to follow
    cy.get('nav a').should('not.exist')

    cy.log('**return to the home page**')
    recurse(
      () => cy.location('pathname'),
      (pathname) => pathname.endsWith('/menu/index.html'),
      {
        log: false,
        post() {
          cy.go('back')
        },
      },
    )
    cy.contains('main', 'Index page')
  })
})
