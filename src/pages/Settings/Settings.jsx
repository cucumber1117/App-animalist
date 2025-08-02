import React from 'react';
import styles from './Settings.module.css';

const Settings = () => {
  const handleLogout = () => {
    alert('ログアウトしました（仮）');
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>設定</h2>
      <button onClick={handleLogout} className={styles.logoutButton}>
        ログアウト
      </button>
    </div>
  );
};

export default Settings;
