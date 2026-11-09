import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Github, Download } from "lucide-react";
import { projects } from "@/lib/projects";
import styles from "@/app/portfolio.module.css";

export default function OpenSourceProjects() {
  return (
    <section
      id="open-source"
      aria-labelledby="projects-title"
      className={styles.section}
    >
      <div className={styles.sectionHeading} data-reveal>
        <div>
          <p className={styles.eyebrow}>01 / OPEN SOURCE</p>
          <h2 id="projects-title">
            From my workshop.
            <br />
            <span>To your workflow.</span>
          </h2>
        </div>
        <p>
          Small tools for the work behind the work.
          <br />
          Built for my own use. Open for yours.
        </p>
      </div>
      <div className={styles.projects}>
        {projects.map((project, index) => (
          <article
            key={project.id}
            id={`project-${project.id}`}
            tabIndex={-1}
            data-project={project.id}
            data-reveal
            className={styles.project}
          >
            <div className={styles.projectTop}>
              <span className={styles.projectNumber}>0{index + 1}</span>
              <span className={styles.projectCategory}>{project.category}</span>
              <ArrowUpRight size={17} aria-hidden="true" />
            </div>
            <div className={styles.projectBrand}>
              <Image
                src={`/projects/${project.id}.png`}
                alt=""
                width={60}
                height={60}
              />
              <h3><Link href={`/${project.id}`} className={styles.projectDetailsLink}>{project.name}</Link></h3>
            </div>
            <p>{project.description}</p>
            <ul aria-label={`${project.name} features`} className={styles.tags}>
              {project.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
            <div className={styles.projectActions}>
              <a
                href={`https://github.com/duckfollow/${project.id}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`View ${project.name} source on GitHub`}
              >
                <Github size={15} aria-hidden="true" /> Source code{" "}
                <ArrowUpRight size={13} aria-hidden="true" />
              </a>
              <a
                href={`https://github.com/duckfollow/${project.id}/releases`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Download ${project.name} releases`}
              >
                <Download size={14} aria-hidden="true" /> Releases
              </a>
            </div>
          </article>
        ))}
      </div>
      <a
        className={styles.allProjects}
        href="https://github.com/duckfollow"
        target="_blank"
        rel="noopener noreferrer"
      >
        Explore the rest on GitHub <ArrowUpRight size={15} aria-hidden="true" />
      </a>
    </section>
  );
}
