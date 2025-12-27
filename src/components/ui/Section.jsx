export default function Section({ title, children }) {
  return (
    <section className="section">
      <div className="sectionHead">
        <h2 className="sectionTitle">{title}</h2>
        <div className="sectionLine" />
      </div>
      {children}
    </section>
  )
}
