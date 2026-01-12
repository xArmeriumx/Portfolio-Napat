/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
export default function ScrollReveal({
  children,
  width = "fit-content",
  delay,
}) {
  return <div style={{ width }}>{children}</div>;
}
