import Section from '../components/ui/Section.jsx'
import Card from '../components/ui/Card.jsx'
import { profile } from '../data/profile.js'

export default function About() {
  return (
    <div className="stack">
      <Section title="About Me">
        <Card>
          <p className="muted" style={{ margin: 0, lineHeight: 1.8 }}>
            {profile.about}
          </p>
        </Card>
      </Section>

      <Section title="Education">
        <Card>
          <ul className="list">
            {profile.education.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </Card>
      </Section>

      <Section title="Contact">
        <Card>
          <ul className="list">
            <li>Location: {profile.contact.location}</li>
            {profile.contact.phone ? <li>Phone: {profile.contact.phone}</li> : null}
            <li>Email: {profile.links.email}</li>
            <li>GitHub: {profile.links.github}</li>
          </ul>
        </Card>
      </Section>

      <Section title="Skills">
        <div className="skillsGrid">
          {profile.skills.map((s) => (
            <div key={s} className="skillBox">
              <div className="skillText">{s}</div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}
