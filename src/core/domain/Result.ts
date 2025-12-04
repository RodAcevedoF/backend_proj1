/**
 * Result wrapper for use case execution
 * Provides type-safe error handling
 */
export class Result<T> {
  public readonly isSuccess: boolean;
  public readonly isFailure: boolean;
  private readonly _value?: T;
  private readonly _error?: string;

  private constructor(isSuccess: boolean, error?: string, value?: T) {
    if (isSuccess && error) {
      throw new Error(
        'Invalid operation: A success result cannot have an error'
      );
    }
    if (!isSuccess && !error) {
      throw new Error('Invalid operation: A failure result must have an error');
    }

    this.isSuccess = isSuccess;
    this.isFailure = !isSuccess;
    this._error = error;
    this._value = value;
  }

  public static ok<U>(value?: U): Result<U> {
    return new Result<U>(true, undefined, value);
  }

  public static fail<U>(error: string): Result<U> {
    return new Result<U>(false, error);
  }

  public getValue(): T {
    if (!this.isSuccess) {
      throw new Error('Cannot get value from failed result');
    }
    return this._value as T;
  }

  public getError(): string {
    if (this.isSuccess) {
      throw new Error('Cannot get error from successful result');
    }
    return this._error as string;
  }
}
