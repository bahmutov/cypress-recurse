// @ts-check
/// <reference types="cypress" />
import { recurse } from '../../src'

beforeEach(() => {
  const incomplete = {
    body: {
      data: {
        status: 'PENDING',
      },
    },
  }
  const complete = {
    body: {
      data: {
        status: 'COMPLETE',
      },
    },
  }
  cy.stub(cy, 'request')
    .onFirstCall()
    .callsFake(() => cy.wrap(incomplete))
    .onSecondCall()
    .callsFake(() => cy.wrap(incomplete))
    .onThirdCall()
    .callsFake(() => cy.wrap(complete))
})

it('makes a request until the server returns COMPLETE', () => {
  recurse(
    () => cy.request('/resource'),
    ({ body }) => {
      return body.data.status === 'COMPLETE'
    },
    {
      limit: 10,
      delay: 1000,
      log: 'COMPLETED',
    },
  )
})
