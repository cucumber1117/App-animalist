import React, { useEffect, useState } from 'react';
import styles from './Settings.module.css';
import { auth, db } from '../../firebase/firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const Settings = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({
    customUID: '',
    favoriteAnime: '',
    recentAnimes: [],
    isFavoriteAnimePublic: false,
    isRecentAnimesPublic: false,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile((prev) => ({
            ...prev,
            ...docSnap.data(),
            // Firestoreに無い場合に備えdefaultを設定
            isFavoriteAnimePublic: docSnap.data().isFavoriteAnimePublic ?? false,
            isRecentAnimesPublic: docSnap.data().isRecentAnimesPublic ?? false,
          }));
        } else {
          await setDoc(docRef, {
            customUID: '', // 初期は空文字でOK
            favoriteAnime: '',
            recentAnimes: [],
            isFavoriteAnimePublic: false,
            isRecentAnimesPublic: false,
            name: currentUser.displayName,
            photoURL: currentUser.photoURL,
            email: currentUser.email,
          });
        }
      } else {
        setProfile({
          customUID: '',
          favoriteAnime: '',
          recentAnimes: [],
          isFavoriteAnimePublic: false,
          isRecentAnimesPublic: false,
        });
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert('ログアウトしました');
      navigate('/login');
    } catch (error) {
      console.error('ログアウトエラー:', error);
      alert('ログアウトに失敗しました');
    }
  };

  // 編集ハンドラー
  const handleFavoriteAnimeChange = (e) => {
    setProfile((prev) => ({ ...prev, favoriteAnime: e.target.value }));
  };
  const handleIsFavoriteAnimePublicChange = (e) => {
    setProfile((prev) => ({ ...prev, isFavoriteAnimePublic: e.target.checked }));
  };
  const handleIsRecentAnimesPublicChange = (e) => {
    setProfile((prev) => ({ ...prev, isRecentAnimesPublic: e.target.checked }));
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    const docRef = doc(db, 'users', user.uid);
    try {
      await updateDoc(docRef, {
        favoriteAnime: profile.favoriteAnime,
        isFavoriteAnimePublic: profile.isFavoriteAnimePublic,
        isRecentAnimesPublic: profile.isRecentAnimesPublic,
      });
      alert('プロフィールを保存しました');
    } catch (error) {
      alert('保存に失敗しました');
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>設定</h2>
      {user ? (
        <>
          <div className={styles.profile}>
            <img src={profile.photoURL} alt="プロフィールアイコン" className={styles.avatar} />
            <p>名前: {profile.name}</p>
            <p>メール: {profile.email}</p>
            <p>UID: <code>{profile.customUID || '未設定'}</code></p>
          </div>

          <div className={styles.formGroup}>
            <label>好きなアニメ</label>
            <input
              type="text"
              value={profile.favoriteAnime}
              onChange={handleFavoriteAnimeChange}
              className={styles.input}
            />
            <label>
              <input
                type="checkbox"
                checked={profile.isFavoriteAnimePublic}
                onChange={handleIsFavoriteAnimePublicChange}
              />
              好きなアニメを公開する
            </label>
          </div>

          <div className={styles.recentAnimes}>
            <h3>最近見たアニメ（最大4つ）</h3>
            <ul>
              {profile.recentAnimes && profile.recentAnimes.length > 0 ? (
                profile.recentAnimes.slice(0, 4).map((anime, idx) => (
                  <li key={idx}>{anime}</li>
                ))
              ) : (
                <li>データがありません</li>
              )}
            </ul>
            <label>
              <input
                type="checkbox"
                checked={profile.isRecentAnimesPublic}
                onChange={handleIsRecentAnimesPublicChange}
              />
              最近見たアニメを公開する
            </label>
          </div>

          <button onClick={handleSaveProfile} className={styles.button}>
            保存する
          </button>

          <button onClick={handleLogout} className={styles.logoutButton}>
            ログアウト
          </button>
        </>
      ) : (
        <button onClick={() => navigate('/login')} className={styles.loginButton}>
          ログイン / 新規登録
        </button>
      )}
    </div>
  );
};

export default Settings;
