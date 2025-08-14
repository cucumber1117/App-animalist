import React, { useEffect, useState } from 'react';
import { auth, db } from '../../firebase/firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import styles from './FriendList.module.css';
import Friend from '../Friend/Friend';

const FriendList = () => {
  const [friendsCustomUIDs, setFriendsCustomUIDs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);

      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();

            const trimmedFriends = (userData.friends || [])
              .map(uid => uid.trim())
              .filter(uid => uid);

            setFriendsCustomUIDs(trimmedFriends);
          } else {
            setFriendsCustomUIDs([]);
          }
        } catch (error) {
          console.error('friends取得エラー:', error);
          setFriendsCustomUIDs([]);
        }
      } else {
        setFriendsCustomUIDs([]);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <p>フレンド一覧読み込み中...</p>;

  return (
    <div>
  <h2>フレンド一覧</h2>
  <button
    className={styles.addButton}
    onClick={() => navigate('/UIDsearch')}
  >
    フレンドを追加する
  </button>

  {friendsCustomUIDs.length === 0 ? (
    <p>フレンドがいません</p>
  ) : (
    <div className={styles.friendListContainer}>
      {friendsCustomUIDs.map((customUID) =>
        customUID ? (
          <div key={customUID} className={styles.friendItem}>
            <Friend friendUid={customUID} />
          </div>
        ) : null
      )}
    </div>
  )}
</div>

  );
};

export default FriendList;
