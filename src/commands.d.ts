/// <reference types="cypress" />

import type { recurse } from '.'

declare global {
  namespace Cypress {
    interface Chainable {
      recurse: typeof recurse
    }
  }
}
