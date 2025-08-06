import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, NavLink } from 'react-router-dom';
import Home from './pages/Home/Home';
import History from './pages/History/History';
import Settings from './pages/Settings/Settings';
import MemoEdit from './pages/MemoEdit/MemoEdit';
import Filter from './pages/Filter/Filter'; 
import MemoAdd from './pages/MemoAdd/MemoAdd';
import Login from './pages/Login/Login';
import SignUp from './pages/SignUp/SignUp';
import UIDsearch from './pages/UIDsearch/UIDsearch';
import FriendList from './pages/FriendList/FriendList';
import Profile from './pages/Profile/Profile';
import { MemoProvider } from './context/MemoContext';
import styles from './App.module.css';

const App = () => {
  const [navVisible, setNavVisible] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setNavVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (currentScrollY < 50) {
            // ページトップ付近なら常にヘッダー表示
            setShowHeader(true);
          } else if (currentScrollY > lastScrollY) {
            // 下方向スクロール中はヘッダーを隠す
            setShowHeader(false);
          } else if (currentScrollY < lastScrollY) {
            // 上方向スクロールでヘッダーを表示
            setShowHeader(true);
          }
          setLastScrollY(currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <MemoProvider>
      <div className={styles.container}>

        {/* ヘッダー */}
        <header className={`${styles.header} ${showHeader ? styles.headerShow : styles.headerHide}`}>
          <h1 className={styles.title}>aniMemo</h1>
        </header>

        {/* メインコンテンツ */}
        <main className={styles.main}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/history" element={<History />} />
            <Route path="/filter" element={<Filter />} /> 
            <Route path="/settings" element={<Settings />} />
            <Route path="/edit/:id" element={<MemoEdit />} />
            <Route path="/add" element={<MemoAdd />} />
            <Route path="/login" element={<Login />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/UIDsearch" element={<UIDsearch />} />
            <Route path="/FriendList" element={<FriendList />} />
            <Route path="/Profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        {/* ナビゲーション */}
        <nav className={`${styles.nav} ${navVisible ? styles.navShow : styles.navHide}`}>
          <NavLink to="/" className={({ isActive }) => (isActive ? styles.active : '')}>メイン</NavLink>
          <NavLink to="/add" className={({ isActive }) => (isActive ? styles.active : '')}>記録</NavLink>
          <NavLink to="/history" className={({ isActive }) => (isActive ? styles.active : '')}>履歴</NavLink>
          <NavLink to="/FriendList" className={({ isActive }) => (isActive ? styles.active : '')}>フレンド</NavLink>
          <NavLink to="/settings" className={({ isActive }) => (isActive ? styles.active : '')}>設定</NavLink>
        </nav>
      </div>
    </MemoProvider>
  );
};

export default App;
