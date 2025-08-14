import React, { useEffect, useState } from 'react';
import styles from './Friend.module.css';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';

const Friend = ({ friendUid }) => {
  const [friendData, setFriendData] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [closing, setClosing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!friendUid) return;

    const fetchFriendData = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'users'),
          where('customUID', '==', friendUid)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setFriendData(querySnapshot.docs[0].data());
        } else {
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

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      setShowDetails(false);
    }, 300);
  };

  return (
    <div className={styles.container}>
      {/* フレンドボタンは変更なし */}
      <button
        className={styles.friendButton}
        onClick={() => setShowDetails(true)}
      >
        <img
          src={friendData.photoURL || '/default-avatar.png'}
          alt={`${friendData.name || '名前なし'}のアイコン`}
          className={styles.avatar}
        />
        <span className={styles.name}>{friendData.name || '名前なし'}</span>
      </button>

      {showDetails && (
        <div className={styles.modalOverlay} onClick={handleClose}>
          <div
            className={`${styles.modalContent} ${
              closing ? styles.slideDown : styles.slideUp
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className={styles.title}>{friendData.name || '名前なし'}</h2>

            <div className={styles.detailsContent}>
              <p>
                <strong>UID:</strong>
                <span className={styles.tag}>{friendData.customUID || '未設定'}</span>
              </p>
              <p>
                <strong>ステータスメッセージ:</strong>
                <span className={styles.tag}>{friendData.statusMessage || 'なし'}</span>
              </p>
              <p>
                <strong>好きなアニメ:</strong>
                <span className={styles.tag}>{friendData.favoriteAnime || '未登録'}</span>
              </p>
              <p><strong>最近見たアニメ:</strong></p>
              {friendData.recentAnimes?.length > 0 ? (
                <ul className={styles.animeList}>
                  {friendData.recentAnimes.slice(0, 4).map((anime, idx) => (
                    <li key={idx}>{anime}</li>
                  ))}
                </ul>
              ) : (
                <span className={styles.tag}>データなし</span>
              )}
            </div>

            <button className={styles.closeButton} onClick={handleClose}>
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Friend;
