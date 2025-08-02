import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Header.module.css';

const Header = () => (
  <header className={styles.header}>
    <nav className={styles.nav}>
      <NavLink to="/" className={({ isActive }) => isActive ? styles.active : ''}>ホーム</NavLink>
      <NavLink to="/history" className={({ isActive }) => isActive ? styles.active : ''}>履歴</NavLink>
      <NavLink to="/settings" className={({ isActive }) => isActive ? styles.active : ''}>設定</NavLink>
    </nav>
  </header>
);

export default Header;
