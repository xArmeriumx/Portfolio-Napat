import Section from '../components/ui/Section.jsx'
import { projects } from '../data/projects.js'

export default function Portfolio() {
  return (
    <div className="stack">
      <Section title="Portfolio">
        <div className="portfolioList">
          {projects.map((p) => (
            <article key={p.slug} className="projectCard">
              <div className="projectImageWrap">
                <img className="projectImage" src={p.image} alt={p.title} />
              </div>

              <div className="projectBody">
                <h3 className="projectTitle">{p.title}</h3>
                <div className="projectStack">{p.stack}</div>

                <div className="pillRow">
                  {p.role.map((r) => (
                    <span key={r} className="pill">{r}</span>
                  ))}
                </div>

                <ul className="bullets">
                  {p.highlights.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>

                <div className="projectBtns">
                  {p.links.repo ? (
                    <a className="btn btnOutline" href={p.links.repo} target="_blank" rel="noreferrer">
                      Repo
                    </a>
                  ) : null}
                  {p.links.demo ? (
                    <a className="btn btnOutline" href={p.links.demo} target="_blank" rel="noreferrer">
                      Demo
                    </a>
                  ) : null}
                  <button className="btn btnOutline" type="button" disabled>
                    Detail →
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Section>
    </div>
  )
}
