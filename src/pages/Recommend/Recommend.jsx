import React, { useState, useEffect, useContext } from 'react';
import { auth, db } from '../../firebase/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import styles from './Recommend.module.css';
import { MemoContext } from '../../context/MemoContext';

const Recommend = () => {
  const { memoItems } = useContext(MemoContext);
  const [user, setUser] = useState(null);

  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState('');
  const [selectedAnime, setSelectedAnime] = useState('');
  const [recommendReason, setRecommendReason] = useState('');
  const [loadingSend, setLoadingSend] = useState(false);

  const [recommendationsReceived, setRecommendationsReceived] = useState([]);

  // ログイン状態監視 & ユーザーデータ取得（フレンドリスト取得）
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setUser(null);
        setFriends([]);
        return;
      }
      setUser(u);

      try {
        const userDoc = await getDoc(doc(db, 'users', u.uid));
        if (!userDoc.exists()) return;

        const userData = userDoc.data();
        const friendUIDs = (userData.friends || []).map((id) => id.trim()).filter(Boolean);

        if (friendUIDs.length === 0) {
          setFriends([]);
          return;
        }

        const q = query(collection(db, 'users'), where('customUID', 'in', friendUIDs));
        const querySnap = await getDocs(q);

        const friendList = querySnap.docs.map((docSnap) => ({
          uid: docSnap.id,
          customUID: docSnap.data().customUID,
          name: docSnap.data().name || '名前未設定',
        }));

        setFriends(friendList);
      } catch (error) {
        console.error('フレンド取得失敗:', error);
        setFriends([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // 自分宛のおすすめ一覧をリアルタイム取得
  useEffect(() => {
    if (!user) {
      setRecommendationsReceived([]);
      return;
    }

    const q = query(
      collection(db, 'recommendations'),
      where('toUID', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const recs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRecommendationsReceived(recs);
    }, (error) => {
      console.error('おすすめ取得失敗:', error);
      setRecommendationsReceived([]);
    });

    return () => unsubscribe();
  }, [user]);

  const handleSendRecommendation = async () => {
    if (!selectedFriend || !selectedAnime) {
      alert('フレンドとアニメを選択してください');
      return;
    }
    if (!user) {
      alert('ログインが必要です');
      return;
    }
    setLoadingSend(true);
    try {
      await addDoc(collection(db, 'recommendations'), {
        fromUID: user.uid,
        fromName: user.displayName || '名無し',
        toUID: selectedFriend,
        animeTitle: selectedAnime,
        reason: recommendReason || '',
        createdAt: serverTimestamp(),
      });

      alert('おすすめを送信しました！');
      setSelectedFriend('');
      setSelectedAnime('');
      setRecommendReason('');
    } catch (err) {
      console.error('おすすめ送信失敗:', err);
      alert('送信中にエラーが発生しました');
    }
    setLoadingSend(false);
  };

  return (
    <div className={styles.container}>
      <h2>おすすめ</h2>

      <section className={styles.section}>
        <h3>フレンドにおすすめする</h3>
        <select
          value={selectedFriend}
          onChange={(e) => setSelectedFriend(e.target.value)}
          className={styles.select}
        >
          <option value="">フレンドを選択</option>
          {friends.map((friend) => (
            <option key={friend.uid} value={friend.uid}>
              {friend.name} ({friend.customUID})
            </option>
          ))}
        </select>

        <select
          value={selectedAnime}
          onChange={(e) => setSelectedAnime(e.target.value)}
          className={styles.select}
        >
          <option value="">アニメを選択</option>
          {memoItems.map((memo) => (
            <option key={memo.id} value={memo.title}>
              {memo.title}
            </option>
          ))}
        </select>

        <textarea
          placeholder="おすすめどころ（任意）"
          value={recommendReason}
          onChange={(e) => setRecommendReason(e.target.value)}
          className={styles.textarea}
          rows={4}
        />

        <button
          onClick={handleSendRecommendation}
          className={styles.button}
          disabled={loadingSend}
        >
          {loadingSend ? '送信中...' : '送信'}
        </button>
      </section>

      <section className={styles.section}>
        <h3>フレンドからのおすすめ</h3>
        {recommendationsReceived.length === 0 ? (
          <p>まだおすすめはありません。</p>
        ) : (
          <ul className={styles.recommendList}>
            {recommendationsReceived.map((rec) => (
              <li key={rec.id} className={styles.recommendItem}>
                <div><strong>名前:</strong> {rec.fromName}</div>
                <div><strong>アニメの名前:</strong> {rec.animeTitle}</div>
                {rec.reason && (
                  <div><strong>おすすめどころ:</strong> {rec.reason}</div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default Recommend;
