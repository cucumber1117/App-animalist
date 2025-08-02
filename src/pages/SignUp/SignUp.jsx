import React, { useState } from 'react';
import styles from './SignUp.module.css';
import { useNavigate } from 'react-router-dom';
import { registerUser, signUpWithGoogleAndSaveUID } from '../../firebase/auth/registerUser'; 
// signUpWithGoogleAndSaveUID は Googleサインアップ後にUID保存を含むラッパー関数

const SignUp = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  // メールパスワード登録
  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      await registerUser(email, password, displayName);
      alert('新規登録が完了しました！');
      navigate('/');
    } catch (error) {
      alert(`登録エラー: ${error.message}`);
    }
  };

  // Google登録
  const handleGoogleSignUp = async () => {
    try {
      await signUpWithGoogleAndSaveUID();
      alert('Googleでの新規登録が完了しました！');
      navigate('/');
    } catch (error) {
      alert(`Google登録エラー: ${error.message}`);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>新規登録</h2>
      <form onSubmit={handleSignUp} className={styles.form}>
        <input
          type="text"
          placeholder="表示名"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
          className={styles.input}
        />
        <input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={styles.input}
        />
        <input
          type="password"
          placeholder="パスワード（6文字以上）"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className={styles.input}
        />
        <button type="submit" className={styles.button}>
          登録する
        </button>
      </form>
      <hr />
      <button onClick={handleGoogleSignUp} className={styles.googleButton}>
        Googleで登録
      </button>
    </div>
  );
};

export default SignUp;
