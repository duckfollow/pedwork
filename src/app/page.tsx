"use client";
import styles from "./page.module.css";
import { Mail, Sun, Moon, Github, Instagram, Linkedin, Twitter, Facebook, Calendar, Tv } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function Home() {
  const [isDark, setIsDark] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [play, setPlay] = useState(1)
  useEffect(() => {
    // Check localStorage first, then system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    console.log('Theme initialization:', { savedTheme, systemPrefersDark });

    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);

    if (shouldBeDark) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
      console.log('Set to dark mode');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
      console.log('Set to light mode');
    }

    setIsLoaded(true);
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    console.log('Toggling theme:', { isDark, newIsDark });
    setIsDark(newIsDark);

    if (newIsDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      console.log('Added dark class');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      console.log('Removed dark class');
    }
  };

  const clickPlay = () => {
    setPlay(1)
  }

  // Don't render until theme is loaded to prevent flash
  if (!isLoaded) {
    return null;
  }

  return (
    <div
      className={styles.page}
      style={{
        background: isDark
          ? 'linear-gradient(135deg, #fbbf24 0%, #ea580c 100%)'
          : 'linear-gradient(135deg, #ffd700 0%, #ff8c00 100%)'
      }}
    >
      <div
        className={`${styles.cardWithLanyard} ${styles.swing}`}
        data-animate={play}
        onClick={clickPlay}
        onAnimationEnd={() => setPlay(0)}
      >
        <div className={styles.lanyard}></div>
        <div className={styles.hole}></div>
        <main
          className={styles.main}
          style={{
            background: isDark ? '#1a202c' : 'white',
            color: isDark ? '#f7fafc' : '#2d3748'
          }}
        >
          <button
            onClick={toggleTheme}
            className={styles.themeToggle}
            style={{
              background: isDark ? '#1a202c' : 'white',
              border: `2px solid ${isDark ? '#2d3748' : '#e2e8f0'}`,
              color: isDark ? '#fbbf24' : '#ff8c00'
            }}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Profile Section */}
          <div className={styles.profile}>
            <div className={styles.avatarContainer}>
              <div
                className={styles.avatar}
                style={{
                  background: isDark
                    ? 'linear-gradient(135deg, #fbbf24, #ea580c)'
                    : 'linear-gradient(135deg, #ffd700, #ff8c00)'
                }}
              >
                <Image src="/images/avatar.png" alt="Avatar" width={100} height={100} className={styles.avatarImg} />
              </div>
            </div>
            <h1
              className={styles.name}
              style={{ color: isDark ? '#f7fafc' : '#2d3748' }}
            >
              <Instagram
                style={{ color: isDark ? '#fbbf24' : '#ff8c00' }}
              />
              <a
                href="https://www.instagram.com/tankps/"
                style={{ color: isDark ? '#a0aec0' : '#4a5568' }}
                target="_blank" rel="noopener noreferrer"
              >
                tankps
              </a>
            </h1>
          </div>

          {/* Contact Section */}
          <div
            className={styles.contact}
            style={{ borderTop: `1px solid ${isDark ? '#2d3748' : '#e2e8f0'}` }}
          >
            <ul className={styles.contactList}>
              <li
                className={styles.contactItem}
                style={{ background: isDark ? '#2d3748' : '#f7fafc' }}
              >
                <Github
                  className={styles.icon}
                  style={{ color: isDark ? '#fbbf24' : '#ff8c00' }}
                />
                <a
                  href="https://github.com/duckfollow"
                  className={styles.contactText}
                  style={{ color: isDark ? '#a0aec0' : '#4a5568' }}
                  target="_blank" rel="noopener noreferrer"
                >
                  github.com/duckfollow
                </a>
              </li>
              <li
                className={styles.contactItem}
                style={{ background: isDark ? '#2d3748' : '#f7fafc' }}
              >
                <Tv
                  className={styles.icon}
                  style={{ color: isDark ? '#fbbf24' : '#ff8c00' }}
                />
                <a
                  href="https://www.tiktok.com/@tankps_?_t=ZS-8xjsgeejGPg&_r=1"
                  className={styles.contactText}
                  style={{ color: isDark ? '#a0aec0' : '#4a5568' }}
                  target="_blank" rel="noopener noreferrer"
                >
                  @tankps_ (TikTok)
                </a>
              </li>
              <li
                className={styles.contactItem}
                style={{ background: isDark ? '#2d3748' : '#f7fafc' }}
              >
                <Linkedin
                  className={styles.icon}
                  style={{ color: isDark ? '#fbbf24' : '#ff8c00' }}
                />
                <a
                  href="https://www.linkedin.com/in/prasit-suphancho-864014195/"
                  className={styles.contactText}
                  style={{ color: isDark ? '#a0aec0' : '#4a5568' }}
                  target="_blank" rel="noopener noreferrer"
                >
                  prasit-suphancho
                </a>
              </li>
              <li
                className={styles.contactItem}
                style={{ background: isDark ? '#2d3748' : '#f7fafc' }}
              >
                <Twitter
                  className={styles.icon}
                  style={{ color: isDark ? '#fbbf24' : '#ff8c00' }}
                />
                <a
                  href="https://twitter.com/slammonder"
                  className={styles.contactText}
                  style={{ color: isDark ? '#a0aec0' : '#4a5568' }}
                  target="_blank" rel="noopener noreferrer"
                >
                  @slammonder
                </a>
              </li>
              <li
                className={styles.contactItem}
                style={{ background: isDark ? '#2d3748' : '#f7fafc' }}
              >
                <Facebook
                  className={styles.icon}
                  style={{ color: isDark ? '#fbbf24' : '#ff8c00' }}
                />
                <a
                  href="https://www.facebook.com/prasit.suphancho"
                  className={styles.contactText}
                  style={{ color: isDark ? '#a0aec0' : '#4a5568' }}
                  target="_blank" rel="noopener noreferrer"
                >
                  prasit.suphancho
                </a>
              </li>
              <li
                className={styles.contactItem}
                style={{ background: isDark ? '#2d3748' : '#f7fafc' }}
              >
                <Mail
                  className={styles.icon}
                  style={{ color: isDark ? '#fbbf24' : '#ff8c00' }}
                />
                <a
                  href="mailto:p.supancho@gmail.com"
                  className={styles.contactText}
                  style={{ color: isDark ? '#a0aec0' : '#4a5568' }}
                >
                  p.supancho@gmail.com
                </a>
              </li>
              <li
                className={styles.contactItem}
                style={{ background: isDark ? '#2d3748' : '#f7fafc' }}
              >
                <Calendar
                  className={styles.icon}
                  style={{ color: isDark ? '#fbbf24' : '#ff8c00' }}
                />
                <a
                  href="https://th.techcal.dev/"
                  className={styles.contactText}
                  style={{ color: isDark ? '#a0aec0' : '#4a5568' }}
                  target="_blank" rel="noopener noreferrer"
                >
                  th.techcal.dev
                </a>
              </li>
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
}
