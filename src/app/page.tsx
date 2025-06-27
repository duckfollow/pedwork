"use client";
import styles from "./page.module.css";
import { Mail, Phone, Building, Clock, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";

export default function Home() {
  const [isDark, setIsDark] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

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
      
      <main 
        className={styles.main}
        style={{
          background: isDark ? '#1a202c' : 'white',
          color: isDark ? '#f7fafc' : '#2d3748'
        }}
      >
        {/* Hole for string */}
        <div className={styles.hole}></div>

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
              ส
            </div>
          </div>
          <h1 
            className={styles.name}
            style={{ color: isDark ? '#f7fafc' : '#2d3748' }}
          >
            สมชาย ใจดี
          </h1>
          <p 
            className={styles.position}
            style={{ color: isDark ? '#fbbf24' : '#ff8c00' }}
          >
            นักพัฒนาเว็บไซต์
          </p>
          <span 
            className={styles.department}
            style={{ 
              color: isDark ? '#a0aec0' : '#718096',
              background: isDark ? '#2d3748' : '#f7fafc'
            }}
          >
            แผกเทคโนโลยีสารสนเทศ
          </span>
        </div>

        {/* Contact Section */}
        <div 
          className={styles.contact}
          style={{ borderTop: `1px solid ${isDark ? '#2d3748' : '#e2e8f0'}` }}
        >
          <h2 
            className={styles.contactTitle}
            style={{ color: isDark ? '#f7fafc' : '#2d3748' }}
          >
            ข้อมูลติดต่อ
          </h2>
          <ul className={styles.contactList}>
            <li 
              className={styles.contactItem}
              style={{ background: isDark ? '#2d3748' : '#f7fafc' }}
            >
              <Mail 
                className={styles.icon} 
                style={{ color: isDark ? '#fbbf24' : '#ff8c00' }}
              />
              <a 
                href="mailto:somchai@company.com" 
                className={styles.contactText}
                style={{ color: isDark ? '#a0aec0' : '#4a5568' }}
              >
                somchai@company.com
              </a>
            </li>
            <li 
              className={styles.contactItem}
              style={{ background: isDark ? '#2d3748' : '#f7fafc' }}
            >
              <Phone 
                className={styles.icon} 
                style={{ color: isDark ? '#fbbf24' : '#ff8c00' }}
              />
              <a 
                href="tel:+66812345678" 
                className={styles.contactText}
                style={{ color: isDark ? '#a0aec0' : '#4a5568' }}
              >
                081-234-5678
              </a>
            </li>
            <li 
              className={styles.contactItem}
              style={{ background: isDark ? '#2d3748' : '#f7fafc' }}
            >
              <Building 
                className={styles.icon} 
                style={{ color: isDark ? '#fbbf24' : '#ff8c00' }}
              />
              <span 
                className={styles.contactText}
                style={{ color: isDark ? '#a0aec0' : '#4a5568' }}
              >
                ห้อง 301 อาคาร A
              </span>
            </li>
            <li 
              className={styles.contactItem}
              style={{ background: isDark ? '#2d3748' : '#f7fafc' }}
            >
              <Clock 
                className={styles.icon} 
                style={{ color: isDark ? '#fbbf24' : '#ff8c00' }}
              />
              <span 
                className={styles.contactText}
                style={{ color: isDark ? '#a0aec0' : '#4a5568' }}
              >
                จันทร์-ศุกร์ 8:00-17:00
              </span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
