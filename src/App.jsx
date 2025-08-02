import React from 'react';
import { Routes, Route, Navigate, NavLink } from 'react-router-dom';
import Home from './pages/Home/Home';
import History from './pages/History/History';
import Settings from './pages/Settings/Settings';
import MemoEdit from './pages/MemoEdit/MemoEdit';
import Filter from './pages/Filter/Filter'; 
import MemoAdd from './pages/MemoAdd/MemoAdd';
import { MemoProvider } from './context/MemoContext';
import styles from './App.module.css';

const App = () => {
  return (
    <MemoProvider>
      <div className={styles.container}>
        <nav className={styles.nav}>
          <NavLink to="/" className={({ isActive }) => (isActive ? styles.active : '')}>メイン</NavLink>
          <NavLink to="/add" className={({ isActive }) => (isActive ? styles.active : '')}>記録</NavLink>
          <NavLink to="/history" className={({ isActive }) => (isActive ? styles.active : '')}>履歴</NavLink>
          <NavLink to="/settings" className={({ isActive }) => (isActive ? styles.active : '')}>設定</NavLink>
        </nav>

        <main className={styles.main}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/history" element={<History />} />
            <Route path="/filter" element={<Filter />} /> 
            <Route path="/settings" element={<Settings />} />
            <Route path="/edit/:id" element={<MemoEdit />} />
            <Route path="/add" element={<MemoAdd />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </MemoProvider>
  );
};

export default App;
