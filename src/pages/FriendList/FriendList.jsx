import React, { useEffect, useState } from 'react';
import { auth, db } from '../../firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Friend from '../Friend/Friend';

const FriendList = () => {
  const [friendsCustomUIDs, setFriendsCustomUIDs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);

      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();

            console.log('Firestoreから取得したfriends配列:', userData.friends);

            // 空白除去＆空文字除去
            const trimmedFriends = (userData.friends || [])
              .map(uid => uid.trim())
              .filter(uid => uid);

            console.log('トリム後のfriends配列:', trimmedFriends);

            setFriendsCustomUIDs(trimmedFriends);
          } else {
            console.log('ユーザードキュメントが存在しません');
            setFriendsCustomUIDs([]);
          }
        } catch (error) {
          console.error('friends取得エラー:', error);
          setFriendsCustomUIDs([]);
        }
      } else {
        console.log('未ログインのためfriendsCustomUIDsは空');
        setFriendsCustomUIDs([]);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <p>フレンド一覧読み込み中...</p>;
  if (friendsCustomUIDs.length === 0) return <p>フレンドがいません</p>;

  return (
    <div>
      <h2>フレンド一覧</h2>
      {friendsCustomUIDs.map((customUID) => (
        customUID ? <Friend key={customUID} friendUid={customUID} /> : null
      ))}
    </div>
  );
};

export default FriendList;
