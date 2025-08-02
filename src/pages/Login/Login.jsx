import React from 'react';
import styles from './Login.module.css';
import { loginWithGoogleAndEnsureUID } from '../../firebase/auth/login'; // 関数名とパスを修正
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      const user = await loginWithGoogleAndEnsureUID();
      alert(`ようこそ、${user.displayName} さん！`);
      navigate('/');
    } catch (err) {
      alert('ログインに失敗しました');
    }
  };

  const goToSignUp = () => {
    navigate('/sign-up');
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>ログイン</h2>

      <button onClick={handleGoogleLogin} className={styles.googleButton}>
        Googleでログイン
      </button>

      <button onClick={goToSignUp} className={styles.signUpButton}>
        新規登録はこちら
      </button>
    </div>
  );
};

export default Login;
