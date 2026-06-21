/**
 * Multer may send a JSON string or a nested array from bracket notation (products[0][name]).
 */
export const coerceBooleanValue = (value) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    if (normalized === "true") {
      return true;
    }

    if (normalized === "false") {
      return false;
    }
  }

  return value;
};

export const coerceJsonFormField = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return value;
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
};

/**
 * Normalizes req.body for validation:
 * - bracket notation arrays are already parsed by multer (append-field)
 * - JSON string fields (e.g. products='[{...}]') are parsed here
 *
 * Safe to run on every request — skips non-JSON strings like names/descriptions.
 */
export const normalizeFormBody = (body) => {
  if (!body || typeof body !== "object") {
    return body;
  }

  const normalizedBody = { ...body };

  for (const [key, value] of Object.entries(normalizedBody)) {
    if (typeof value !== "string") {
      continue;
    }

    const trimmed = value.trim();
    const coercedBoolean = coerceBooleanValue(value);

    if (typeof coercedBoolean === "boolean") {
      normalizedBody[key] = coercedBoolean;
      continue;
    }

    if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
      normalizedBody[key] = coerceJsonFormField(value);
    }
  }

  return normalizedBody;
};

/**
 * @deprecated Use normalizeFormBody(req.body) — kept for explicit field overrides if needed.
 */
export const coerceJsonFormFields = (body, fieldNames = []) => {
  const normalizedBody = normalizeFormBody(body);

  for (const fieldName of fieldNames) {
    if (body?.[fieldName] !== undefined) {
      normalizedBody[fieldName] = coerceJsonFormField(body[fieldName]);
    }
  }

  return normalizedBody;
};
