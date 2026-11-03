"use client";

import { useState } from "react";
import { Play, Terminal, X } from "lucide-react";
import CodeArcade from "./CodeArcade";
import styles from "@/app/portfolio.module.css";

export default function DeveloperEditor() {
  const [isOpen, setIsOpen] = useState(false);

  return (
  <div className={styles.editor} aria-label="Developer profile">
    <div className={styles.editorBar}>
      <div className={styles.windowDots} aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <span>developer.ts</span>
      <button
        type="button"
        className={styles.runButton}
        aria-expanded={isOpen}
        aria-controls="code-arcade"
        aria-haspopup="dialog"
        onClick={() => {
          setIsOpen((open) => !open);
        }}
      >
        {isOpen ? <X size={12} aria-hidden="true" /> : <Play size={12} aria-hidden="true" />}
        {isOpen ? "Close" : "Run"}
      </button>
    </div>
    <div className={styles.editorCode}>
      <div className={styles.codeComment}>{"// a little about me"}</div>
      <div>
        <span className={styles.codePurple}>const</span> developer ={" "}
        {"{"}
      </div>
      <div className={styles.codeIndent}>
        name:{" "}
        <span className={styles.codeString}>
          &quot;Prasit Suphancho&quot;
        </span>
        ,
      </div>
      <div className={styles.codeIndent}>
        handle:{" "}
        <span className={styles.codeString}>&quot;@tankps&quot;</span>,
      </div>
      <div className={styles.codeIndent}>
        github:{" "}
        <span className={styles.codeString}>
          &quot;duckfollow&quot;
        </span>
        ,
      </div>
      <div className={styles.codeIndent}>
        focus:{" "}
        <span className={styles.codeString}>
          &quot;developer tools&quot;
        </span>
        ,
      </div>
      <div className={styles.codeIndent}>
        openSource: <span className={styles.codeOrange}>true</span>,
      </div>
      <div className={styles.codeIndent}>projects: [</div>
      <div className={styles.codeIndentDouble}>
        <a className={styles.codeProjectLink} href="#project-edith" aria-label="Explore EDITH">&quot;EDITH&quot;</a>,{" "}
        <a className={styles.codeProjectLink} href="#project-ultron" aria-label="Explore Ultron">&quot;Ultron&quot;</a>,
      </div>
      <div className={styles.codeIndentDouble}>
        <a className={styles.codeProjectLink} href="#project-dum-e" aria-label="Explore Dum-E">&quot;Dum-E&quot;</a>,{" "}
        <a className={styles.codeProjectLink} href="#project-u" aria-label="Explore u">&quot;u&quot;</a>
      </div>
      <div className={styles.codeIndent}>]</div>
      <div>{"};"}</div>
      <div className={styles.codeComment}>
        {"// always something to build"}
        <span className={styles.cursor} aria-hidden="true" />
      </div>
    </div>
    {isOpen && <CodeArcade onClose={() => setIsOpen(false)} />}
    <div className={styles.editorStatus}>
      <span>
        <Terminal size={12} aria-hidden="true" /> Personal workspace
      </span>
      <span>TypeScript</span>
    </div>
  </div>
  );
}
