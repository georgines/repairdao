export class RepairDAODominioError extends Error {
  readonly code: string;

  readonly details?: Record<string, unknown>;

  constructor(code: string, message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = "RepairDAODominioError";
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, RepairDAODominioError.prototype);
  }
}
