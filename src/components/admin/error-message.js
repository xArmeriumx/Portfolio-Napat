export function formatAdminError(error) {
  const message = error instanceof Error && error.message ? error.message : "คำขอไม่สำเร็จ";
  const details = error?.details;
  if (!details || typeof details !== "object" || Array.isArray(details)) return message;

  const fields = Object.entries(details).flatMap(([field, messages]) => {
    if (!Array.isArray(messages)) return [];
    return messages.filter((value) => typeof value === "string" && value.trim()).map((value) => `${field}: ${value}`);
  });

  return fields.length ? `${message} — ${fields.join("; ")}` : message;
}
