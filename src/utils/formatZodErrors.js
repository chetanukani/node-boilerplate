/**
 * @param {import("zod").ZodError} error
 * @returns {Record<string, string>[]}
 */
export const formatZodErrors = (error) => {
  return error.issues.map((issue) => ({
    [issue.path.join(".") || "body"]: issue.message,
  }));
};
