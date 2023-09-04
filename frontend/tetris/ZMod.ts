export default class ZMod {
  private static readonly ERR_VALUE_NOT_INTEGER = 'Value must be an integer.';
  private static readonly ERR_VALUE_NOT_POSITIVE = 'Value must be positive.';

  private static _validateInteger(value: number): void {
    if (!Number.isInteger(value)) {
      throw new Error(ZMod.ERR_VALUE_NOT_INTEGER);
    }
  }

  private static _validatePositiveInteger(value: number): void {
    ZMod._validateInteger(value);
    if (value <= 0) {
      throw new Error(ZMod.ERR_VALUE_NOT_POSITIVE);
    }
  }

  static apply(value: number, mod: number): number {
    ZMod._validateInteger(value);
    ZMod._validatePositiveInteger(mod);

    return ((value % mod) + mod) % mod;
  }

  private _value: number = 0;
  readonly mod: number;

  constructor(value: number, mod: number) {
    ZMod._validatePositiveInteger(mod);

    this.mod = mod;
    this.set(value);
  }

  get(): number {
    return this._value;
  }

  set(value: number): ZMod {
    ZMod._validateInteger(value);
    this._value = ((value % this.mod) + this.mod) % this.mod;
    return this;
  }

  add(value: number): ZMod {
    return this.set(this._value + value);
  }

  subtract(value: number): ZMod {
    return this.set(this._value - value);
  }
}
