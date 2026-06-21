/**
 * Form-data sends everything as strings. These helpers coerce values before Zod validation.
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

const normalizeFormValue = (value) => {
  const coercedBoolean = coerceBooleanValue(value);

  if (typeof coercedBoolean === "boolean") {
    return coercedBoolean;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
      const parsed = coerceJsonFormField(value);

      if (parsed !== value) {
        return normalizeFormValue(parsed);
      }
    }

    return value;
  }

  if (Array.isArray(value)) {
    return value.map(normalizeFormValue);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key,
        normalizeFormValue(nestedValue),
      ])
    );
  }

  return value;
};

/**
 * Normalizes req.body before Zod validation.
 * Handles top-level and nested values from multipart/form-data:
 * - "true" / "false" → boolean
 * - '[{...}]' / '{"..."}'  → parsed JSON (recursive)
 * - products[0][name] arrays → already parsed by multer; nested strings coerced inside
 */
export const normalizeFormBody = (body) => {
  if (!body || typeof body !== "object") {
    return body;
  }

  return normalizeFormValue(body);
};
