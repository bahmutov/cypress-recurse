/// <reference types="cypress" />

export type LogOption = boolean | string | ((arg0: any) => void)

interface PostFunctionOptions {
  /**
   * The remaining number of iterations
   */
  limit: number
}

type PostFunction = (opts: PostFunctionOptions) => void | Cypress.Chainable

interface RecurseOptions {
  /**
   * The max number of iterations
   */
  limit: number
  /**
   * In milliseconds
   */
  timeout: number
  /**
   * Log to Command Log, could be true|false,
   * a message to be printed once at the end,
   * or a custom function
   */
  log: LogOption
  /**
   * Between iterations, milliseconds
   */
  delay: number
  /**
   * Function that can run additional Cypress commands after each iteration
   */
  post?: PostFunction
  /**
   * Error message to display when timed out or max limit reached
   */
  error?: string
  /**
   * Internal: tracks the timestamp of the very first iteration
   */
  started?: number
  /** Internal: the current iteration count */
  iteration?: number
  /** Internal: print the current options to Command Log */
  debugLog?: boolean
}

/**
 * Recursively calls the given command until the predicate is true.
 * @param commandsFn Function running Cypress commands
 * @param checkFn Predicate that should return true to finish
 * @param options Options for maximum timeout, logging, etc
 */
type RecurseFn = (
  commandsFn: () => Cypress.Chainable,
  checkFn: (x: any) => boolean | void | Chai.Assertion,
  options?: Partial<RecurseOptions>,
) => Cypress.Chainable

export const RecurseDefaults: RecurseOptions

export const recurse: RecurseFn
