import React, { useEffect, useState, useContext } from 'react';
import { MemoContext } from '../../context/MemoContext';
import { auth, db } from '../../firebase/firebaseConfig';
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

  // ログインユーザー取得＆Firestoreユーザードキュメント取得
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
          const initialData = {
            name: currentUser.displayName || '',
            photoURL: currentUser.photoURL || '',
            statusMessage: '',
            favoriteAnime: '',
            isFavoriteAnimePublic: false,
            isRecentAnimesPublic: false,
            recentAnimes: [],   // 初期は空
            customUID: '',
            email: currentUser.email || '',
          };
          await setDoc(docRef, initialData);
          setProfile(initialData);
          setEditProfile({
            name: initialData.name,
            photoURL: initialData.photoURL,
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

  // memoItemsから最近見たアニメを抽出（最大4件、重複除去）
  useEffect(() => {
    if (memoItems && memoItems.length > 0) {
      const sortedByDate = [...memoItems].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      const uniqueRecent = [];
      const seen = new Set();
      for (const memo of sortedByDate) {
        const title = memo.title.trim();
        if (title && !seen.has(title)) {
          seen.add(title);
          uniqueRecent.push(title);
        }
        if (uniqueRecent.length >= 4) break;
      }
      setRecentAnimesFromHistory(uniqueRecent);
    } else {
      setRecentAnimesFromHistory([]);
    }
  }, [memoItems]);

  // 公開ONのときのみ Firestore を自動更新
  useEffect(() => {
    if (!user) return;
    if (!editProfile.isRecentAnimesPublic) return;

    const updateRecentAnimes = async () => {
      const docRef = doc(db, 'users', user.uid);
      try {
        await updateDoc(docRef, {
          recentAnimes: recentAnimesFromHistory,
        });
        setProfile((prevProfile) => ({
          ...prevProfile,
          recentAnimes: recentAnimesFromHistory,
        }));
      } catch (error) {
        console.error('最近見たアニメ自動更新失敗:', error);
      }
    };

    updateRecentAnimes();
  }, [recentAnimesFromHistory, editProfile.isRecentAnimesPublic, user]);

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
        recentAnimes: editProfile.isRecentAnimesPublic
          ? recentAnimesFromHistory  // 公開 → 履歴を保存
          : [],                       // 非公開 → 空配列にする
      });
      alert('プロフィールを保存しました');
      setProfile({
        ...profile,
        ...editProfile,
        recentAnimes: editProfile.isRecentAnimesPublic
          ? recentAnimesFromHistory
          : [],
      });
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
        profile.recentAnimes && profile.recentAnimes.length > 0 ? (
          <ul className={styles.animeList}>
            {profile.recentAnimes.map((anime, idx) => (
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
