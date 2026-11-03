import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUpRight,
  Github,
  Mail,
  Gamepad2,
} from "lucide-react";
import DeveloperEditor from "@/components/DeveloperEditor";
import OpenSourceProjects from "@/components/OpenSourceProjects";
import PortfolioThemeToggle from "@/components/PortfolioThemeToggle";
import styles from "./portfolio.module.css";
import PortfolioMotion from "@/components/PortfolioMotion";

const socialLinks = [
  {
    label: "GitHub",
    value: "@duckfollow",
    href: "https://github.com/duckfollow",
  },
  {
    label: "Email",
    value: "p.supancho@gmail.com",
    href: "mailto:p.supancho@gmail.com",
  },
  {
    label: "LinkedIn",
    value: "Prasit Suphancho",
    href: "https://www.linkedin.com/in/prasit-suphancho-864014195/",
  },
  {
    label: "Instagram",
    value: "@tankps",
    href: "https://www.instagram.com/tankps/",
  },
  {
    label: "Facebook",
    value: "prasit.suphancho",
    href: "https://www.facebook.com/prasit.suphancho",
  },
  {
    label: "TikTok",
    value: "@tankps_",
    href: "https://www.tiktok.com/@tankps_",
  },
  {
    label: "Twitter / X",
    value: "@slammonder",
    href: "https://twitter.com/slammonder",
  },
  {
    label: "Tech Calendar",
    value: "Events & community",
    href: "https://th.techcal.dev/",
  },
];
export default function Home() {
  return (
    <main className={styles.site} id="top">
      <PortfolioMotion />
      <header className={styles.header}>
        <a href="#top" className={styles.wordmark}>
          <span aria-hidden="true">&gt;_</span> pedwork
          <span className={styles.wordmarkDot}>.</span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#open-source">Projects</a>
          <a href="#playground">Playground</a>
          <a href="#contact">Contact</a>
        </nav>
        <PortfolioThemeToggle />
      </header>
      <div className={styles.container}>
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>
              <span className={styles.statusDot} /> PRASIT SUPHANCHO / @TANKPS
            </p>
            <h1 id="hero-title" aria-label="Less friction. More building.">
              <span className={styles.frictionLine} aria-hidden="true">
                Less{" "}
                <span className={styles.frictionWord}>
                  {Array.from("friction.").map((letter, index) => (
                    <span key={index}>{letter}</span>
                  ))}
                </span>
              </span>
              <br />
              <span className={styles.buildingLine} aria-hidden="true">
                More <em>building<span className={styles.buildingDot}>.</span></em>
              </span>
            </h1>
            <p className={styles.heroDescription}>
              I’m Prasit, a software developer who likes making things work —
              and making the tools that help along the way.
            </p>
            <div className={styles.heroActions}>
              <a href="#open-source" className={styles.primaryButton}>
                Explore my projects <ArrowDown size={16} aria-hidden="true" />
              </a>
              <a
                href="https://github.com/duckfollow"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.textButton}
              >
                <Github size={17} aria-hidden="true" /> GitHub{" "}
                <ArrowUpRight size={14} aria-hidden="true" />
              </a>
            </div>
            <div className={styles.heroSignature}>
              <Image
                src="/images/avatar.png"
                alt="Prasit Suphancho"
                width={38}
                height={38}
                priority
              />
              <div>
                <strong>Prasit Suphancho</strong>
                <span>aka tankps / duckfollow</span>
              </div>
            </div>
          </div>
          <DeveloperEditor />
        </section>
        <div className={styles.workshopStrip} data-reveal>
          <span>THE DEVELOPER’S WORKSHOP</span>
          <p>Inspect. Connect. Query. Automate.</p>
          <span>
            4 OPEN SOURCE TOOLS <ArrowDown size={13} aria-hidden="true" />
          </span>
        </div>
        <OpenSourceProjects />
        <section
          id="playground"
          className={styles.section}
          aria-labelledby="playground-title"
        >
          <div className={styles.sectionHeading} data-reveal>
            <div>
              <p className={styles.eyebrow}>02 / SIDE QUESTS</p>
              <h2 id="playground-title">Room to experiment.</h2>
            </div>
            <p>
              Because not everything needs
              <br />
              to be a developer tool.
            </p>
          </div>
          <div className={styles.playgroundGrid}>
            <Link href="/nad" className={styles.experiment} data-reveal>
              <div className={styles.experimentIcon}>
                <Gamepad2 size={27} aria-hidden="true" />
              </div>
              <div>
                <span>GAME / IN DEVELOPMENT</span>
                <h3>Night At Detective</h3>
                <p>A mystery game, one clue at a time.</p>
              </div>
              <ArrowUpRight size={20} aria-hidden="true" />
            </Link>
          </div>
        </section>
        <section
          id="contact"
          className={`${styles.section} ${styles.contact}`}
          aria-labelledby="contact-title"
        >
          <div className={styles.sectionHeading} data-reveal>
            <div>
              <p className={styles.eyebrow}>03 / KEEP IN TOUCH</p>
              <h2 id="contact-title">
                Good things start
                <br />
                with a <em>hello.</em>
              </h2>
            </div>
            <a
              className={styles.primaryButton}
              href="mailto:p.supancho@gmail.com"
            >
              <Mail size={16} aria-hidden="true" /> Say hello{" "}
              <ArrowUpRight size={15} aria-hidden="true" />
            </a>
          </div>
          <div className={styles.socialGrid} data-reveal>
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith("mailto:") ? undefined : "_blank"}
                rel="noopener noreferrer"
              >
                <div>
                  <strong>{link.label}</strong>
                  <span>{link.value}</span>
                </div>
                <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            ))}
          </div>
        </section>
        <footer className={styles.footer}>
          <span>© {new Date().getFullYear()} Prasit Suphancho</span>
          <span>Built with curiosity. Shared with you.</span>
          <a href="#top">Back to top ↑</a>
        </footer>
      </div>
    </main>
  );
}
