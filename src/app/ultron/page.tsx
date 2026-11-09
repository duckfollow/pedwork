import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Download, Github, PanelLeft, Server, SquareSplitHorizontal, Terminal } from "lucide-react";
import styles from "./ultron.module.css";

const releases = "https://github.com/duckfollow/ultron/releases";
const description = "An open-source macOS terminal with native shell sessions, split panes, and saved SSH connections.";
export const metadata: Metadata = {
  title: "Ultron — Terminal & SSH for macOS",
  description,
  alternates: { canonical: "/ultron" },
  openGraph: { title: "Ultron — Terminal & SSH for macOS", description, url: "/ultron" },
};

const features = [
  { icon: Terminal, title: "Your shell, in a native session", text: "Run your usual shell and interactive tools. Search scrollback and jump between sessions with keyboard shortcuts." },
  { icon: SquareSplitHorizontal, title: "One tab, multiple panes", text: "Split a tab horizontally or vertically and resize each pane. Running commands stay in place as you switch tabs." },
  { icon: Server, title: "Saved SSH connections", text: "Group your servers and open a connection in a tab or split pane using your system OpenSSH client." },
];

export default function UltronPage() {
  return (
    <main className={styles.page}>
      <div className={styles.frame}>
        <nav className={styles.nav} aria-label="Ultron navigation">
          <Link href="/#open-source"><ArrowLeft size={16} /> Back to the workshop</Link>
          <a href="https://github.com/duckfollow/ultron"><Github size={16} /> GitHub <ArrowUpRight size={13} /></a>
        </nav>
        <section className={styles.hero} aria-labelledby="ultron-title">
          <Image src="/projects/ultron.png" alt="" width={72} height={72} className={styles.icon} />
          <p className={styles.eyebrow}>OPEN SOURCE / MACOS</p>
          <h1 id="ultron-title">Ultron</h1>
          <p className={styles.tagline}>Your terminal. Your servers. One workspace.</p>
          <p className={styles.description}>{description}</p>
          <div className={styles.actions}>
            <a className={styles.download} href={releases}><Download size={17} /> Download for macOS</a>
            <a href="#workspace">Explore the workspace <ArrowUpRight size={14} /></a>
          </div>
          <p className={styles.requirements}>Apple Silicon · macOS 13.5+ · Alpha</p>
        </section>

        <figure id="workspace" className={styles.figure}>
          <div className={styles.window} aria-hidden="true">
            <div className={styles.chrome}><span className={styles.dots}><i /><i /><i /></span><span>Ultron</span><PanelLeft size={15} /></div>
            <div className={styles.workspace}>
              <aside className={styles.rail}>
                <strong>Ultron</strong>
                <small>CONNECTIONS</small>
                <span><Server size={14} /> Lab server</span>
                <small>WORKSPACE</small>
                <span className={styles.selected}><Terminal size={14} /> Local</span>
                <span><Terminal size={14} /> Lab server</span>
              </aside>
              <div className={styles.terminals}>
                <div className={styles.tabs}><span>Local</span><span>Lab server</span><span>+</span></div>
                <div className={styles.panes}>
                  <div><small>LOCAL / ZSH</small><pre><b>~/workshop</b>{" % git status\nOn branch main\nWorking tree clean\n\n"}<b>~/workshop</b>{" % ls\nnotes.md  src  scripts\n\n"}<b>~/workshop</b>{" % ▌"}</pre></div>
                  <div><small>SSH / LAB SERVER</small><pre><b>lab</b>{" $ uptime\nup 3 days, 4:12\n\n"}<b>lab</b>{" $ tail -f app.log\n[info] service ready\n[info] health check OK\n\n▌"}</pre></div>
                </div>
              </div>
            </div>
          </div>
          <figcaption>Illustrated workspace preview with a local shell and an SSH session.</figcaption>
        </figure>

        <section className={styles.features} aria-label="Ultron features">
          {features.map(({ icon: Icon, title, text }) => (
            <article key={title}><Icon size={22} aria-hidden="true" /><h2>{title}</h2><p>{text}</p></article>
          ))}
        </section>
        <footer className={styles.footer}><Link href="/#open-source"><ArrowLeft size={15} /> More from the workshop</Link><a href={releases}>All releases <ArrowUpRight size={15} /></a></footer>
      </div>
    </main>
  );
}
