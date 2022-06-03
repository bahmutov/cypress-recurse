// @ts-check
/// <reference types="cypress" />

it('stubs cy.request using cy.stub', () => {
  // just verifying that inside the test cy.request method
  // can be stubbed using the cy.stub command
  cy.stub(cy, 'request')
    .onFirstCall()
    .returns(cy.wrap({ foo: 'bar' }))
  cy.request('/resource')
    .then(console.log)
    .should('deep.equal', { foo: 'bar' })
})
