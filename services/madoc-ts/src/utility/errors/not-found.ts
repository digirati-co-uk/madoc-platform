export class NotFound extends Error {
  status = 404;
}

export class NotFoundPretty extends Error {
  status = 404;
  pretty = true;
}
