/// <reference types="cypress" />

export type LogOption<T> = boolean | string | ((arg: T) => void)

interface PostFunctionOptions<T> {
  /**
   * The value produced by the last iteration
   */
  value: T
  /**
   * The remaining number of iterations
   */
  limit: number
  /**
   * The current reduced value, if any
   */
  reduced: any
  /**
   * Time since the recursion started, ms
   */
  elapsed: number
}

type PostFunction<T> = (
  opts: PostFunctionOptions<T>,
) => void | Cypress.Chainable

interface RecurseOptions<T> {
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
  log: LogOption<T>
  /**
   * Between iterations, milliseconds
   */
  delay: number
  /**
   * Function that can run additional Cypress commands after each iteration
   */
  post?: PostFunction<T>
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

  // options for accumulator
  /** Starting value for the accumulator */
  reduceFrom: any
  /**
   * Update the accumulator with the given value,
   * synchronous function
   */
  reduce(accumulator: any, item: T): any
  /** Include the last value in the accumulator */
  reduceLastValue: boolean
  /**
   * What to yield to the next command, usually it is
   * the last value, but sometimes can be the accumulator.
   * If you need both, pass "both" and "reduce" will
   * yield an object with {value, reduced} properties
   */
  yield: 'value' | 'reduced' | 'both'
}

/**
 * Recursively calls the given command until the predicate is true.
 * @param commandsFn Function running Cypress commands
 * @param checkFn Predicate that should return true to finish
 * @param options Options for maximum timeout, logging, etc
 */
export function recurse<T>(
  commandsFn: () => Cypress.Chainable<Promise<T>>,
  checkFn: (
    x: T,
    reducedValue?: any,
  ) => boolean | void | Chai.Assertion,
  options?: Partial<RecurseOptions<T>>,
): Cypress.Chainable<T>

export function recurse<T>(
  commandsFn: () => Cypress.Chainable<T>,
  checkFn: (
    x: T,
    reducedValue?: any,
  ) => boolean | void | Chai.Assertion,
  options?: Partial<RecurseOptions<T>>,
): Cypress.Chainable<T>

export const RecurseDefaults: RecurseOptions<any>

export function each<T>(
  commandsFn: (x: T) => Cypress.Chainable<Promise<T>>,
  checkFn?: (x: T) => boolean | void | Chai.Assertion,
): Cypress.Chainable<T[]>

export function each<T>(
  commandsFn: (x: T) => Cypress.Chainable<T>,
  checkFn?: (x: T) => boolean | void | Chai.Assertion,
): Cypress.Chainable<T>

export function each(
  commandsFn: (x: any) => any | Cypress.Chainable<any>,
  checkFn?: (x: any) => boolean | void | Chai.Assertion,
): any | Cypress.Chainable<any | void | null>

export function each(
  commandsFn: (x: any) => any,
  checkFn?: (x: any) => boolean | void | Chai.Assertion,
): Cypress.Chainable<any | void | null>
