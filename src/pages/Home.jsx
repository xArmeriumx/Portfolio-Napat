import { profile } from '../data/profile.js'

export default function Home() {
  return (
    <section className="hero">
      <div className="heroInner">
        <div className="heroKicker">Hello World, I&apos;m</div>

        <h1 className="heroTitle">{profile.name}</h1>

        <div className="heroRole">
          {profile.headline} <span className="cursor">|</span>
        </div>

        <p className="heroDesc">{profile.tagline}</p>

        <div className="heroBtns">
          <a className="btn btnOutline" href={profile.links.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
          {profile.links.linkedin ? (
            <a className="btn btnOutline" href={profile.links.linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
          ) : null}
          {profile.links.resume ? (
            <a className="btn btnSolid" href={profile.links.resume} target="_blank" rel="noreferrer">
              Download CV
            </a>
          ) : (
            <a className="btn btnSolid" href={`mailto:${profile.links.email}`}>
              Contact
            </a>
          )}
        </div>
      </div>
    </section>
  )
}
