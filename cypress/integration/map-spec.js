/// <reference types="cypress" />
// register chai-sorted assertions
// https://www.chaijs.com/plugins/chai-sorted/
// The NPM package does not include TypeScript definitions
// @ts-ignore
chai.use(require('chai-sorted'))

Cypress.Commands.add('map', { prevSubject: true }, ($elements, prop) => {
  if (Cypress._.isArrayLike($elements)) {
    return Cypress._.map($elements, prop)
  } else {
    return Cypress._.property(prop)($elements)
  }
})

function really() {
  const fns = Cypress._.takeWhile(arguments, (arg) => typeof arg === 'function')
  const chainerIndex = Cypress._.findIndex(
    arguments,
    (arg) => typeof arg === 'string',
  )
  if (chainerIndex === -1) {
    throw new Error('sh: no chainer found')
  }
  const chainer = arguments[chainerIndex]
  const chainerArguments = Cypress._.slice(arguments, chainerIndex + 1)
  const chainers = chainer.split('.')
  const fn = pipe(...fns)

  return function (value) {
    // console.log('value', value)
    const transformed = fn(value)
    // console.log('transformed', transformed)
    return chainers.reduce((acc, chainer) => {
      const currentChainer = acc[chainer]
      if (typeof currentChainer === 'function') {
        return acc[chainer](...chainerArguments)
      } else {
        return acc[chainer]
      }
    }, expect(transformed).to)
  }
}

function pipe(...fns) {
  return function (value) {
    return fns.reduce((acc, fn) => fn(acc), value)
  }
}

function map(fn) {
  return function (list) {
    // console.log('mapping list', list)
    if (Cypress._.isArrayLike(list)) {
      return Cypress._.map(list, fn)
    } else {
      return fn(list)
    }
  }
}

function its(path) {
  return function (o) {
    return Cypress._.property(path)(o)
  }
}

describe('Assertion helpers', () => {
  it('works with props', () => {
    const p = {
      person: {
        name: 'Joe',
        age: 42,
      },
    }
    setTimeout(() => {
      p.person.age = 90
    }, 1000)
    cy.wrap(p).should(really(its('person.age'), 'equal', 90))
    // using custom ".map" child command
    cy.wrap(p).map('person.age').should('eq', 90)
  })

  it('map', { viewportHeight: 1100 }, () => {
    cy.visit('/cypress/integration/pagination-sort-filter-manager')
    cy.get('#numrows').select('100')
    // check if the table fits into one page
    cy.get('.pagecontroller-num').should('have.length', 1)
    // sort by clicking the header column
    cy.contains('.sorterHeader', 'Points').click()
    cy.get('tbody td + td + td + td + td').should(
      really(map('innerText'), map(parseFloat), 'be.ascending'),
    )
  })
})
