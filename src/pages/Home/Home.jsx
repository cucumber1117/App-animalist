import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css';

const Home = () => {
  const navigate = useNavigate();

  const pages = [
    { label: '視聴履歴', path: '/history', emoji: '📖' },
    { label: '視聴記録を追加', path: '/add', emoji: '✍️' },
    { label: 'UID検索', path: '/UIDsearch', emoji: '🔍' },
    { label: 'フレンド', path: '/FriendList', emoji: '👥' },
    { label: '設定', path: '/settings', emoji: '⚙️' },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.buttonGrid}>
        {pages.map((page, index) => (
          <button key={index} className={styles.card} onClick={() => navigate(page.path)}>
            <span className={styles.emoji}>{page.emoji}</span>
            <span className={styles.label}>{page.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Home;
