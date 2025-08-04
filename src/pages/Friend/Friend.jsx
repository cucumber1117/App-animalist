import React, { useEffect, useState } from 'react';
import styles from './Friend.module.css';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';

const Friend = ({ friendUid }) => {
  const [friendData, setFriendData] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!friendUid) {
      console.log('friendUidがないため処理中断');
      return;
    }

    const fetchFriendData = async () => {
      setLoading(true);
      try {
        console.log(`Firestoreからクエリ検索開始: customUID == ${friendUid}`);
        const q = query(
          collection(db, 'users'),
          where('customUID', '==', friendUid)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          console.log('ドキュメント取得成功:', doc.data());
          setFriendData(doc.data());
        } else {
          console.log('ドキュメントが存在しません');
          setFriendData(null);
        }
      } catch (error) {
        console.error('フレンド情報取得エラー:', error);
        setFriendData(null);
      }
      setLoading(false);
    };

    fetchFriendData();
  }, [friendUid]);

  if (loading) return <p>読み込み中...</p>;
  if (!friendData) return null;

  return (
    <div className={styles.container}>
      <button
        className={styles.friendButton}
        onClick={() => setShowDetails(prev => !prev)}
        aria-expanded={showDetails}
      >
        <img
          src={friendData.photoURL || '/default-avatar.png'}
          alt={`${friendData.name || '名前なし'}のアイコン`}
          className={styles.avatar}
        />
        <span className={styles.name}>{friendData.name || '名前なし'}</span>
      </button>

      {showDetails && (
        <div className={styles.details}>
          <p><strong>UID:</strong> {friendData.customUID || '未設定'}</p>
          <p><strong>ステータスメッセージ:</strong> {friendData.statusMessage || 'なし'}</p>
          <p><strong>好きなアニメ:</strong> {friendData.favoriteAnime || '未登録'}</p>
          <p><strong>最近見たアニメ:</strong></p>
          {friendData.recentAnimes && friendData.recentAnimes.length > 0 ? (
            <ul className={styles.animeList}>
              {friendData.recentAnimes.slice(0, 4).map((anime, idx) => (
                <li key={idx}>{anime}</li>
              ))}
            </ul>
          ) : (
            <p>データなし</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Friend;
