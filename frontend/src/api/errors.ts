import type { TFunction } from "i18next";

export function parseApiError(
  err: unknown,
  t: TFunction,
  keys: { validationError: string; genericError: string },
): string {
  const apiError = err as { response?: { data?: { detail?: unknown } } };
  const detail = apiError.response?.data?.detail;
  if (typeof detail === "string") {
    return detail;
  }
  if (Array.isArray(detail)) {
    return t(keys.validationError, {
      messages: (detail as { msg: string }[]).map((d) => d.msg).join(", "),
    });
  }
  if (detail) {
    return JSON.stringify(detail);
  }
  return t(keys.genericError);
}
