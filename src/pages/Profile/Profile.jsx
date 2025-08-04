import React, { useEffect, useState, useContext } from 'react';
import { MemoContext } from '../../context/MemoContext';
import { auth, db} from '../../firebase/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import styles from './Profile.module.css';
import { useNavigate } from 'react-router-dom';


const Profile = () => {
  const { memoItems } = useContext(MemoContext);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [editProfile, setEditProfile] = useState({
    name: '',
    photoURL: '',
    statusMessage: '',
    favoriteAnime: '',
    isFavoriteAnimePublic: false,
    isRecentAnimesPublic: false,
  });
  const [recentAnimesFromHistory, setRecentAnimesFromHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfile(data);
          setEditProfile({
            name: data.name || '',
            photoURL: data.photoURL || '',
            statusMessage: data.statusMessage || '',
            favoriteAnime: data.favoriteAnime || '',
            isFavoriteAnimePublic: data.isFavoriteAnimePublic ?? false,
            isRecentAnimesPublic: data.isRecentAnimesPublic ?? false,
          });
        } else {
          await setDoc(doc(db, 'users', currentUser.uid), {
            name: currentUser.displayName || '',
            photoURL: currentUser.photoURL || '',
            statusMessage: '',
            favoriteAnime: '',
            isFavoriteAnimePublic: false,
            isRecentAnimesPublic: false,
            customUID: '',
            email: currentUser.email || '',
          });
          setProfile({
            name: currentUser.displayName || '',
            photoURL: currentUser.photoURL || '',
            statusMessage: '',
            favoriteAnime: '',
            isFavoriteAnimePublic: false,
            isRecentAnimesPublic: false,
            customUID: '',
            email: currentUser.email || '',
          });
          setEditProfile({
            name: currentUser.displayName || '',
            photoURL: currentUser.photoURL || '',
            statusMessage: '',
            favoriteAnime: '',
            isFavoriteAnimePublic: false,
            isRecentAnimesPublic: false,
          });
        }
      } else {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (memoItems && memoItems.length > 0) {
      const uniqueTitles = Array.from(
        new Set(
          memoItems
            .map((memo) => memo.title.trim())
            .filter((title) => title !== '')
        )
      ).slice(0, 4);
      setRecentAnimesFromHistory(uniqueTitles);
    } else {
      setRecentAnimesFromHistory([]);
    }
  }, [memoItems]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setEditProfile((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSave = async () => {
    if (!user) return;
    const docRef = doc(db, 'users', user.uid);
    try {
      await updateDoc(docRef, {
        name: editProfile.name,
        photoURL: editProfile.photoURL,
        statusMessage: editProfile.statusMessage,
        favoriteAnime: editProfile.favoriteAnime,
        isFavoriteAnimePublic: editProfile.isFavoriteAnimePublic,
        isRecentAnimesPublic: editProfile.isRecentAnimesPublic,
        recentAnimes: recentAnimesFromHistory,
      });
      alert('プロフィールを保存しました');
      setProfile({ ...profile, ...editProfile });
    } catch (error) {
      console.error(error);
      alert('プロフィール保存に失敗しました');
    }
  };

  if (!user || !profile) {
    return <div className={styles.loading}>読み込み中...</div>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>プロフィール編集</h2>

      {/* 名前 */}
      <label>名前 (公開、Googleアカウントには影響しません)</label>
      <input
        type="text"
        name="name"
        value={editProfile.name}
        onChange={handleChange}
        className={styles.input}
      />

      {/* ステータスメッセージ */}
      <label>ステータスメッセージ (公開)</label>
      <input
        type="text"
        name="statusMessage"
        value={editProfile.statusMessage}
        onChange={handleChange}
        className={styles.input}
      />

      {/* UID（公開、編集不可） */}
      <label>UID (公開)</label>
      <input
        type="text"
        value={profile.customUID || ''}
        readOnly
        className={styles.input}
      />

      {/* 好きなアニメ (公開・非公開設定あり) */}
      <label>好きなアニメ</label>
      <input
        type="text"
        name="favoriteAnime"
        value={editProfile.favoriteAnime}
        onChange={handleChange}
        className={styles.input}
      />
      <label>
        <input
          type="checkbox"
          name="isFavoriteAnimePublic"
          checked={editProfile.isFavoriteAnimePublic}
          onChange={handleCheckboxChange}
        />
        好きなアニメを公開する
      </label>

      {/* 最近見たアニメ */}
      <label>最近見たアニメ（最大4つ）</label>
      {editProfile.isRecentAnimesPublic ? (
        recentAnimesFromHistory.length > 0 ? (
          <ul className={styles.animeList}>
            {recentAnimesFromHistory.map((anime, idx) => (
              <li key={idx}>{anime}</li>
            ))}
          </ul>
        ) : (
          <p>履歴がありません</p>
        )
      ) : (
        <p>非公開</p>
      )}
      <label>
        <input
          type="checkbox"
          name="isRecentAnimesPublic"
          checked={editProfile.isRecentAnimesPublic}
          onChange={handleCheckboxChange}
        />
        最近見たアニメを公開する
      </label>

      <button onClick={handleSave} className={styles.button}>
        保存する
      </button>
    </div>
  );
};

export default Profile;
