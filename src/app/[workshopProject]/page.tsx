import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Activity, AudioLines, FileDiff, History, Mic, Settings2, ArrowLeft, ArrowUpRight, Braces, Database, Download, GitBranch, Github, ListTree, Network, PanelLeft, Send, Table2 } from "lucide-react";
import ProjectIcon from "@/components/ProjectIcon";
import { projects } from "@/lib/projects";
import styles from "../ultron/ultron.module.css";
import theme from "./workshop.module.css";

const details = {
  edith: {
    tagline: "See what happens between request and response.",
    platform: "Desktop debugging workbench",
    features: [
      { icon: Network, title: "Route local traffic", text: "Configure gateway listeners, routes, and backends from a visual workspace." },
      { icon: ListTree, title: "Inspect requests", text: "Filter captured gateway traffic and inspect request and response details alongside logs." },
      { icon: Activity, title: "Watch system usage", text: "Track CPU and memory use while you debug." },
    ],
  },
  "dum-e": {
    tagline: "Your little database helper.",
    platform: "Apple Silicon · macOS 13.5+ · Alpha",
    features: [
      { icon: Database, title: "Browse your databases", text: "Explore PostgreSQL and SQLite schemas, tables, and views, or open the included SQLite sample." },
      { icon: Table2, title: "Work with rows", text: "Inspect table structure, edit rows in tables with a primary key, and export results as CSV or JSON." },
      { icon: GitBranch, title: "Follow relationships", text: "Trace foreign keys in a relationship graph and run queries in dedicated SQL tabs." },
    ],
  },
  u: {
    tagline: "From one request to a repeatable flow.",
    platform: "macOS desktop · Local web app",
    features: [
      { icon: Send, title: "Build API requests", text: "Organize requests into collections and reuse variables across environments." },
      { icon: GitBranch, title: "Connect your steps", text: "Pass response data into later requests, apply transforms, and use conditions and loops." },
      { icon: Braces, title: "Document your API", text: "Generate documentation from saved requests, include response examples, and export to Markdown." },
    ],
  },
  natalie: {
    tagline: "Review changes, then commit what you mean.",
    platform: "Apple Silicon · macOS",
    features: [
      { icon: FileDiff, title: "Review and stage changes", text: "Read diffs and stage whole files or individual hunks before committing." },
      { icon: History, title: "Explore commit history", text: "Follow the branch graph or search for commits by subject, author, hash, or ref." },
      { icon: GitBranch, title: "Manage branches", text: "Create, rename, and publish branches, or cherry-pick changes from a commit." },
    ],
  },
  lyla: {
    tagline: "Talk with your assistant in Thai.",
    platform: "iPhone · iOS 17+ · SwiftUI prototype",
    features: [
      { icon: Mic, title: "Speak in Thai", text: "Tap to talk and follow the live transcript as you speak." },
      { icon: AudioLines, title: "Listen to replies", text: "Hear responses in an iOS voice and follow the highlighted text as LYLA reads." },
      { icon: Settings2, title: "Connect to Ollama", text: "Choose an Ollama endpoint and model on your Mac, or use the echo mode to test speech without a model." },
    ],
  },
};

type ProjectId = keyof typeof details;
type Props = { params: Promise<{ workshopProject: string }> };

async function getProject(params: Props["params"]) {
  const { workshopProject } = await params;
  const project = projects.find(({ id }) => id === workshopProject);
  if (!project || !Object.hasOwn(details, project.id)) notFound();
  const id = project.id as ProjectId;
  return { project, id, detail: details[id] };
}

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(details).map((workshopProject) => ({ workshopProject }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { project, id } = await getProject(params);
  const title = `${project.name} — ${project.category}`;
  const url = `/${id}`;
  return {
    title,
    description: project.description,
    alternates: { canonical: url },
    openGraph: { title, description: project.description, url },
  };
}

function WorkspacePreview({ id }: { id: ProjectId }) {
  if (id === "edith") {
    return (
      <figure id="workspace" className={styles.figure}>
        <Image className={theme.screenshot} src="/projects/edith-overview.png" width={2820} height={2956} sizes="(max-width: 768px) 100vw, 900px" alt="EDITH overview dashboard with request counts, response times, and activity charts" />
        <figcaption>EDITH overview · development screenshot</figcaption>
      </figure>
    );
  }

  if (id === "natalie") {
    return (
      <figure id="workspace" className={styles.figure}>
        <Image className={theme.screenshot} src="/projects/natalie-history.png" width={1320} height={760} sizes="(max-width: 768px) 100vw, 900px" alt="Natalie showing a branch graph, commit metadata, and a file diff in a sample repository" />
        <figcaption>Natalie commit history · sample repository</figcaption>
      </figure>
    );
  }

  if (id === "lyla") {
    return (
      <figure id="workspace" className={styles.figure}>
        <div className={theme.voicePreview} aria-hidden="true">
          <div className={theme.voiceHeader}><strong>LYLA</strong><Settings2 size={18} /></div>
          <div className={theme.voiceOrb}><AudioLines size={42} /></div>
          <p lang="th">พร้อมฟัง</p>
          <span className={theme.voicePrompt} lang="th"><Mic size={17} /> แตะเพื่อพูด</span>
        </div>
        <figcaption>Illustration of LYLA’s Thai voice interface.</figcaption>
      </figure>
    );
  }

  const database = id === "dum-e";
  return (
    <figure id="workspace" className={styles.figure}>
      <div className={styles.window} aria-hidden="true">
        <div className={styles.chrome}>
          <span className={styles.dots}><i /><i /><i /></span>
          <span>{database ? "Dum-E" : "u"}</span>
          <PanelLeft size={15} />
        </div>
        <div className={styles.workspace}>
          <div className={styles.rail}>
            <small>{database ? "SQLITE / SAMPLE" : "COLLECTIONS"}</small>
            <span className={styles.selected}>{database ? <Table2 size={14} /> : <Send size={14} />}{database ? "missions" : "List projects"}</span>
            <span>{database ? "agents" : "Authorization"}</span>
            <span>{database ? "mission_assignments" : "Workshop onboarding"}</span>
          </div>
          <div>
            <div className={styles.tabs}>
              {database ? <><span>SQL editor</span><span>Data</span><span>Relations</span></> : <><span>GET</span><code>{"{{baseUrl}}/api/demo/projects"}</code></>}
            </div>
            <div className={styles.panes}>
              {database ? (
                <>
                  <div><small>QUERY</small><pre><b>SELECT</b>{" id, name, status\n"}<b>FROM</b>{" missions\n"}<b>ORDER BY</b>{" id;"} </pre></div>
                  <div>
                    <small>RESULTS · 2 ROWS</small>
                    <table className={theme.results}>
                      <thead><tr><th>id</th><th>name</th><th>status</th></tr></thead>
                      <tbody><tr><td>1</td><td>Survey</td><td>ready</td></tr><tr><td>2</td><td>Relay</td><td>active</td></tr></tbody>
                    </table>
                  </div>
                </>
              ) : (
                <>
                  <div><small>REQUEST HEADERS</small><pre><b>Authorization</b>{"\nBearer {{token}}"}</pre></div>
                  <div><small>RESPONSE · 200 OK</small><pre>{'{\n  '}<b>"projects"</b>{': [\n    { "name": "Workshop" }\n  ]\n}'}</pre></div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <figcaption>{database ? "Illustrated SQL workspace with a sample query and its results." : "Illustrated API workspace with a request and its JSON response."}</figcaption>
    </figure>
  );
}

export default async function WorkshopProjectPage({ params }: Props) {
  const { project, id, detail } = await getProject(params);
  const repository = `https://github.com/duckfollow/${id}`;
  return (
    <main className={`${styles.page} ${theme.page}`} data-workshop-project={id}>
      <div className={styles.frame}>
        <nav className={styles.nav} aria-label={`${project.name} navigation`}>
          <Link href={`/#project-${id}`}><ArrowLeft size={16} /> Back to the workshop</Link>
          <a href={repository}><Github size={16} /> GitHub <ArrowUpRight size={13} /></a>
        </nav>
        <section className={styles.hero} aria-labelledby="project-title">
          <ProjectIcon id={id} size={72} className={styles.icon} />
          <p className={styles.eyebrow}>OPEN SOURCE / {project.category.toUpperCase()}</p>
          <h1 id="project-title">{project.name}</h1>
          <p className={styles.tagline}>{detail.tagline}</p>
          <p className={styles.description}>{project.description}</p>
          <div className={styles.actions}>
            {project.sourceOnly ? (
              <a className={styles.download} href="#getting-started">Run from source <ArrowUpRight size={14} /></a>
            ) : (
              <a className={styles.download} href={`${repository}/releases`}><Download size={17} /> View releases</a>
            )}
            <a href="#workspace">Explore the workspace <ArrowUpRight size={14} /></a>
          </div>
          <p className={styles.requirements}>{detail.platform}</p>
        </section>
        <WorkspacePreview id={id} />
        <section className={styles.features} aria-label={`${project.name} features`}>
          {detail.features.map(({ icon: Icon, title, text }) => (
            <article key={title}><Icon size={22} aria-hidden="true" /><h2>{title}</h2><p>{text}</p></article>
          ))}
        </section>
        {id === "lyla" && (
          <section id="getting-started" className={theme.gettingStarted}>
            <h2>Run LYLA from source</h2>
            <p>Open <code>LYLA.xcodeproj</code> in Xcode and run the LYLA scheme on an iPhone with iOS 17 or later, or in Simulator. To generate replies, connect LYLA to Ollama running on your Mac.</p>
            <a href={`${repository}#readme`}>Read the setup instructions <ArrowUpRight size={15} /></a>
          </section>
        )}
        <footer className={styles.footer}><Link href="/#open-source"><ArrowLeft size={15} /> More from the workshop</Link></footer>
      </div>
    </main>
  );
}
