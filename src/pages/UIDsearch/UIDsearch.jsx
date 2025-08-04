import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase/firebaseConfig';
import styles from './UIDsearch.module.css';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const UIDsearch = () => {
  const [inputUid, setInputUid] = useState('');
  const [foundUser, setFoundUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [message, setMessage] = useState('');

  // 現在ログイン中のユーザー取得
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // UID検索
  const handleSearch = async () => {
    if (!inputUid.trim()) {
      setMessage('UIDを入力してください');
      setFoundUser(null);
      return;
    }

    if (inputUid === currentUser?.uid || inputUid === currentUser?.customUID) {
      setMessage('自分自身は検索できません');
      setFoundUser(null);
      return;
    }

    try {
      const q = query(
        collection(db, 'users'),
        where('customUID', '==', inputUid)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        setFoundUser({ id: docSnap.id, ...docSnap.data() });
        setMessage('');
      } else {
        setFoundUser(null);
        setMessage('該当ユーザーが見つかりません');
      }
    } catch (err) {
      console.error('検索エラー:', err);
      setMessage('エラーが発生しました');
      setFoundUser(null);
    }
  };

  // フレンド追加
  const handleAddFriend = async () => {
    if (!foundUser || !currentUser) return;

    try {
      const myDocRef = doc(db, 'users', currentUser.uid);
      const friendDocRef = doc(db, 'users', foundUser.id);

      // 自分 → 相手
      await updateDoc(myDocRef, {
        friends: arrayUnion(foundUser.customUID),
      });

      // 相手 → 自分
      await updateDoc(friendDocRef, {
        friends: arrayUnion(currentUser.uid),
      });

      setMessage(`「${foundUser.name}」をフレンドに追加しました！`);
      setFoundUser(null);
      setInputUid('');
    } catch (err) {
      console.error('フレンド追加エラー:', err);
      setMessage('フレンド追加に失敗しました');
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>UIDでフレンド検索</h2>
      <input
        type="text"
        value={inputUid}
        onChange={(e) => setInputUid(e.target.value)}
        placeholder="カスタムUID（例:888756541）"
        className={styles.input}
      />
      <button onClick={handleSearch} className={styles.searchButton}>
        検索
      </button>

      {message && <p className={styles.message}>{message}</p>}

      {foundUser && (
        <div className={styles.result}>
          <p><strong>名前:</strong> {foundUser.name}</p>
          <p><strong>UID:</strong> {foundUser.customUID}</p>
          <button onClick={handleAddFriend} className={styles.addButton}>
            フレンド追加
          </button>
        </div>
      )}
    </div>
  );
};

export default UIDsearch;
