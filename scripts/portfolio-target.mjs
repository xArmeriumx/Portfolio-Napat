export function searchPathHasSchema(searchPath, schema) {
  const quotedSchema = `"${schema.replaceAll('"', '""')}"`;
  return searchPath.split(",").some((entry) => {
    const value = entry.trim();
    return value === schema || value === quotedSchema;
  });
}
