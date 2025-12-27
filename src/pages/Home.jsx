import { useState, useEffect } from "react";

const profile = {
  name: "Napat Pamornsut",
  headline: "Full Stack Developer",
  tagline:
    "Passionate about clean code, practical design, and building meaningful digital experiences.",
  links: {
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    resume: "#",
    email: "example@email.com",
  },
};

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const x = (clientX / window.innerWidth - 0.5) * 20;
      const y = (clientY / window.innerHeight - 0.5) * 20;
      setMousePosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section
      className="hero"
      style={{
        transform: `translate(${mousePosition.x * 0.5}px, ${
          mousePosition.y * 0.5
        }px)`,
        transition: "transform 0.2s ease-out",
      }}
    >
      <div className="heroInner">
        {/* Floating decorative elements */}
        <div
          style={{
            position: "absolute",
            top: "10%",
            left: "5%",
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(209,77,77,0.08) 0%, transparent 70%)",
            filter: "blur(40px)",
            pointerEvents: "none",
            animation: "float 6s ease-in-out infinite",
            zIndex: 0,
          }}
        />

        <div
          style={{
            position: "absolute",
            bottom: "15%",
            right: "8%",
            width: "150px",
            height: "150px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(29,29,31,0.06) 0%, transparent 70%)",
            filter: "blur(50px)",
            pointerEvents: "none",
            animation: "float 8s ease-in-out infinite reverse",
            zIndex: 0,
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            className="heroKicker"
            style={{
              animation: "fadeInUp 0.6s ease-out",
              animationFillMode: "both",
            }}
          >
            Hello World, I&apos;m
          </div>

          <h1
            className="heroTitle"
            style={{
              animation: "fadeInUp 0.6s ease-out 0.1s",
              animationFillMode: "both",
              position: "relative",
            }}
          >
            {profile.name}
            <div
              style={{
                position: "absolute",
                bottom: "-4px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "60%",
                height: "3px",
                background:
                  "linear-gradient(90deg, transparent, #d14d4d, transparent)",
                opacity: 0.3,
                borderRadius: "2px",
              }}
            />
          </h1>

          <div
            className="heroRole"
            style={{
              animation: "fadeInUp 0.6s ease-out 0.2s",
              animationFillMode: "both",
            }}
          >
            {profile.headline} <span className="cursor">|</span>
          </div>

          <p
            className="heroDesc"
            style={{
              animation: "fadeInUp 0.6s ease-out 0.3s",
              animationFillMode: "both",
            }}
          >
            {profile.tagline}
          </p>

          <div
            className="heroBtns"
            style={{
              animation: "fadeInUp 0.6s ease-out 0.4s",
              animationFillMode: "both",
            }}
          >
            <a
              className="btn btnOutline"
              href={profile.links.github}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </a>
            {profile.links.linkedin ? (
              <a
                className="btn btnOutline"
                href={profile.links.linkedin}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                LinkedIn
              </a>
            ) : null}
            {profile.links.resume ? (
              <a
                className="btn btnSolid"
                href={profile.links.resume}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Download CV
              </a>
            ) : (
              <a
                className="btn btnSolid"
                href={`mailto:${profile.links.email}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                Contact
              </a>
            )}
          </div>

          {/* Scroll indicator */}
          <div
            style={{
              marginTop: "60px",
              animation:
                "fadeIn 1s ease-out 1s, bounce 2s ease-in-out 1s infinite",
              animationFillMode: "both",
            }}
          >
            <div
              style={{
                width: "24px",
                height: "36px",
                border: "2px solid rgba(29,29,31,0.2)",
                borderRadius: "12px",
                margin: "0 auto",
                position: "relative",
              }}
            >
              <div
                style={{
                  width: "4px",
                  height: "8px",
                  background: "#d14d4d",
                  borderRadius: "2px",
                  position: "absolute",
                  top: "6px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  animation: "scroll 2s ease-in-out infinite",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes scroll {
          0% { top: 6px; opacity: 1; }
          100% { top: 18px; opacity: 0; }
        }
        
        .btn {
          position: relative;
          overflow: hidden;
        }
        
        .btn::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255,255,255,0.3);
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
        }
        
        .btn:hover::before {
          width: 300px;
          height: 300px;
        }
        
        .btn svg {
          position: relative;
          z-index: 1;
        }
      `}</style>
    </section>
  );
}
