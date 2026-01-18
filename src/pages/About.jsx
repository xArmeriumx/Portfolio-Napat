import SEO from "../components/utils/SEO.jsx";
import Breadcrumbs from "../components/utils/Breadcrumbs.jsx";
import { useTranslation } from "../context/LanguageContext.jsx";
import Section from "../components/ui/Section.jsx";
import Card from "../components/ui/Card.jsx";
import ScrollReveal from "../components/ui/ScrollReveal.jsx";
import PageTransition from "../components/ui/PageTransition.jsx"; // Ensure this is imported
import AnimatedText from "../components/ui/AnimatedText.jsx";
import { profile } from "../data/profile.js";

/* ========================================
   SkillCategory Component
======================================== */
function SkillCategory({ category, skills }) {
  return (
    <div className="mb-8 last:mb-0">
      <div className="flex items-center gap-4 mb-6">
        <h3 className="text-lg font-bold text-red-500 whitespace-nowrap">
          <AnimatedText>{category}</AnimatedText>
        </h3>
        <div className="h-px bg-red-100 flex-grow"></div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {skills.map((skill) => (
          <div
            key={skill.name}
            className="flex flex-col items-center justify-center gap-3 p-6 bg-white border border-gray-100 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md transition-all duration-300"
          >
            <img
              src={skill.logo}
              alt={skill.name}
              className="w-10 h-10 object-contain"
            />
            <span className="text-sm font-bold text-gray-800">
              {skill.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionHeader({ title }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
      <div className="h-px bg-gray-200 flex-grow mt-2"></div>
    </div>
  );
}

export default function About() {
  const { getContent, language } = useTranslation();

  // Labels for section titles - Always English
  const labels = {
    aboutMe: "About Me",
    education: "Education",
    contact: "Contact",
    skills: "Skills",
    location: "Location",
    phone: "Phone",
    email: "Email",
  };

  // Get translated content
  const aboutText = getContent(profile, "about");

  return (
    <>
      <SEO
        title={`${profile.name} (ณภัทร ภมรสูตร) | About`}
        description={`Learn more about ${profile.name} (ณภัทร ภมรสูตร)'s journey, skills, and experience.`}
        ogTitle={`${profile.name} (ณภัทร ภมรสูตร) | About`}
        path="/about"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          mainEntity: {
            "@type": "Person",
            name: profile.name,
            alternateName: "ณภัทร ภมรสูตร",
            jobTitle: "Frontend Developer",
            description: profile.tagline,
            image: "https://napatdev.com/favicon.png",
            sameAs: [profile.links.github, profile.links.linkedin].filter(
              Boolean,
            ),
          },
        }}
      />
      <Breadcrumbs />
      <PageTransition>
        <div className="relative min-h-screen bg-[#f9fafb] overflow-hidden pt-28 pb-32">
          {/* Dimensional Background */}
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(to right, #e5e7eb 1px, transparent 1px)",
                backgroundSize: "40px 40px",
                opacity: 0.2,
                maskImage:
                  "radial-gradient(circle at top center, black 30%, transparent 100%)",
              }}
            />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto px-6">
            {/* About Me */}
            <ScrollReveal width="100%">
              <section className="mb-12">
                <SectionHeader title={labels.aboutMe} />
                <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                  <p className="text-gray-600 leading-loose font-medium">
                    <AnimatedText>{aboutText}</AnimatedText>
                  </p>
                </div>
              </section>
            </ScrollReveal>

            {/* Education */}
            <ScrollReveal width="100%" delay={0.1}>
              <section className="mb-12">
                <SectionHeader title={labels.education} />
                <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                  <ul className="space-y-3">
                    {getContent(profile, "education").map((line, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-3 text-gray-700 font-medium"
                      >
                        <span className="mt-2 w-1.5 h-1.5 rounded-full bg-gray-800 flex-shrink-0" />
                        <span>
                          <AnimatedText>{line}</AnimatedText>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            </ScrollReveal>

            {/* Contact */}
            <ScrollReveal width="100%" delay={0.2}>
              <section className="mb-12">
                <SectionHeader title={labels.contact} />
                <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                  <ul className="space-y-3 font-medium text-gray-700">
                    <li className="flex items-center gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-800" />
                      Location: {profile.contact.location}
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-800" />
                      Email: {profile.links.email}
                    </li>
                    {profile.links.github && (
                      <li className="flex items-center gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-800" />
                        GitHub: {profile.links.github}
                      </li>
                    )}
                  </ul>
                </div>
              </section>
            </ScrollReveal>

            {/* Skills */}
            <ScrollReveal width="100%" delay={0.3}>
              <section>
                <SectionHeader title={labels.skills} />
                <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-10">
                  {profile.skillCategories.map((cat) => (
                    <SkillCategory
                      key={cat.category}
                      category={getContent(cat, "category")}
                      skills={cat.skills}
                    />
                  ))}
                </div>
              </section>
            </ScrollReveal>
          </div>
        </div>
      </PageTransition>
    </>
  );
}
