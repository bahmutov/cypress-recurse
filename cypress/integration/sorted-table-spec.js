// @ts-check
/// <reference types="cypress" />
import { recurse } from '../..'

describe('Table pagination', () => {
  it('has table', () => {
    cy.visit('/cypress/integration/pagination-sort-filter-manager')
  })
})
