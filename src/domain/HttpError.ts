// Error con código HTTP. Los casos de uso lo lanzan y el middleware lo convierte en { error }.
export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
