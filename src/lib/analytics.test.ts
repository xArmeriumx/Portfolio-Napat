import { expect, it } from "vitest";
import { interactionEvent, publicAnalyticsPath } from "./analytics";
it("excludes private routes and removes query/hash", () => {
  for (const path of ['/admin/login', '/preview/note/1?token=secret', '/api/auth/session', '/th/admin']) expect(publicAnalyticsPath(path)).toBeNull();
  expect(publicAnalyticsPath('/th/about?email=secret#contact')).toBe('/th/about');
});
it("classifies actual links without returning their sensitive destinations", () => {
  expect(interactionEvent('mailto:private@example.com', 'https://napatdev.com', '/contact')).toBe('contact_click');
  expect(interactionEvent('https://github.com/x/project?token=secret', 'https://napatdev.com', '/th/projects/example')).toBe('project_outbound_click');
  expect(interactionEvent('/resume.pdf', 'https://napatdev.com', '/about')).toBe('resume_download');
  expect(interactionEvent('mailto:private@example.com', 'https://napatdev.com', '/admin')).toBeNull();
});
