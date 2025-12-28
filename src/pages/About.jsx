import { usePageMeta } from "../hooks/usePageMeta.js";
import Section from "../components/ui/Section.jsx";
import Card from "../components/ui/Card.jsx";
import { profile } from "../data/profile.js";

export default function About() {
  // SEO Meta Tags
  usePageMeta({
    title: `About | ${profile.name}`,
    description: profile.about,
  });

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
            {profile.education.map((x, idx) => (
              <li key={idx}>{x}</li>
            ))}
          </ul>
        </Card>
      </Section>

      <Section title="Contact">
        <Card>
          <ul className="list">
            <li>Location: {profile.contact.location}</li>
            {profile.contact.phone && (
              <li>Phone: {profile.contact.phone}</li>
            )}
            <li>Email: {profile.links.email}</li>
            <li>GitHub: {profile.links.github}</li>
          </ul>
        </Card>
      </Section>

      <Section title="Skills">
        <div className="skillsGrid">
          {profile.skills.map((skill) => (
            <div key={skill.name} className="skillBox">
              <img
                src={skill.logo}
                alt={skill.name}
                className="skillIcon"
                style={{
                  width: "32px",
                  height: "32px",
                  objectFit: "contain",
                }}
              />
              <div className="skillText">{skill.name}</div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}


