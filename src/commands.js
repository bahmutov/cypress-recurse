/// <reference types="cypress" />
/// <reference path="./commands.d.ts" />

const { recurse } = require('.')

if (!('recurse' in cy)) {
  Cypress.Commands.add('recurse', recurse)
}
