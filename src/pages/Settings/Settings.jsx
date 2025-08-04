import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/firebaseConfig';
import styles from './Settings.module.css';

const Settings = () => {
  const navigate = useNavigate();
  const user = auth.currentUser;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('ログアウト失敗:', error);
      alert('ログアウトに失敗しました');
    }
  };

  const handleProfileEdit = () => {
    navigate('/profile');
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>設定</h2>

      <button className={styles.button} onClick={handleProfileEdit}>
        プロフィールを編集する
      </button>

      {user && (
        <button className={styles.logoutButton} onClick={handleLogout}>
          ログアウト
        </button>
      )}
    </div>
  );
};

export default Settings;
