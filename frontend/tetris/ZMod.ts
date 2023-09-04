export default class ZMod {
  private static readonly ERR_VALUE_NOT_INTEGER = 'Value must be an integer.';
  private static readonly ERR_VALUE_NOT_POSITIVE = 'Value must be positive.';

  /**
   * Throws an error if the value is not an integer.
   */
  private static _validateInteger(value: number): void {
    if (!Number.isInteger(value)) {
      throw new Error(ZMod.ERR_VALUE_NOT_INTEGER);
    }
  }

  /**
   * Throws an error if the value is not a positive integer.
   */
  private static _validatePositiveInteger(value: number): void {
    ZMod._validateInteger(value);
    if (value <= 0) {
      throw new Error(ZMod.ERR_VALUE_NOT_POSITIVE);
    }
  }

  /**
   * Returns the value modulo mod.
   */
  static apply(value: number, mod: number): number {
    ZMod._validateInteger(value);
    ZMod._validatePositiveInteger(mod);

    return ((value % mod) + mod) % mod;
  }

  private _value: number = 0;
  readonly mod: number;

  /**
   * Creates a new ZMod with the given value and mod.
   */
  constructor(value: number, mod: number) {
    ZMod._validatePositiveInteger(mod);

    this.mod = mod;
    this.set(value);
  }

  /**
   * Returns the value of this ZMod.
   */
  get(): number {
    return this._value;
  }

  /**
   * Sets the value of this ZMod.
   *
   * @returns This ZMod.
   */
  set(value: number): ZMod {
    ZMod._validateInteger(value);
    this._value = ((value % this.mod) + this.mod) % this.mod;
    return this;
  }

  /**
   * Adds the given value to this ZMod.
   *
   * @returns This ZMod.
   */
  add(value: number): ZMod {
    return this.set(this._value + value);
  }

  /**
   * Subtracts the given value from this ZMod.
   *
   * @returns This ZMod.
   */
  subtract(value: number): ZMod {
    return this.set(this._value - value);
  }
}
