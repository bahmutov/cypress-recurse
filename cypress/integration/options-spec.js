// @ts-check
/// <reference types="cypress" />
import { RecurseDefaults } from '../..'

describe('options', () => {
  it('has default options', () => {
    expect(RecurseDefaults).to.have.keys(['limit', 'timeout', 'log', 'delay'])
  })

  // it('checks invalid option via types', () => {
  //   recurse(
  //     () => cy.task('randomNumber'),
  //     (n) => n === 7,
  //     {
  //       limit: 10,
  //       unknownOptions: 42,
  //     },
  //   )
  // })
})
