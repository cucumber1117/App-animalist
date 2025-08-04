import React from 'react';
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
  return (
    <MemoProvider>
      <div className={styles.container}>
        <nav className={styles.nav}>
          <NavLink to="/" className={({ isActive }) => (isActive ? styles.active : '')}>メイン</NavLink>
          <NavLink to="/add" className={({ isActive }) => (isActive ? styles.active : '')}>記録</NavLink>
          <NavLink to="/history" className={({ isActive }) => (isActive ? styles.active : '')}>履歴</NavLink>
          <NavLink to="/UIDsearch" className={({ isActive }) => (isActive ? styles.active : '')}>UID検索</NavLink>
          <NavLink to="/FriendList">フレンド一覧</NavLink>
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
            <Route path="/login" element={<Login />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/UIDsearch" element={<UIDsearch />} />
            <Route path="/FriendList" element={<FriendList />} />
            <Route path="/Profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </MemoProvider>
  );
};

export default App;
