import React, { useState } from 'react';
import styles from './UIDsearch.module.css';
import { db, auth } from '../../firebase/firebaseConfig';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';

const UIDsearch = () => {
  const [inputUid, setInputUid] = useState('');
  const [foundUser, setFoundUser] = useState(null);
  const [message, setMessage] = useState('');

  const currentUser = auth.currentUser;
  if (!currentUser) return <p>ログインしてください</p>;

  const handleSearch = async () => {
    if (inputUid.trim() === '') {
      setMessage('UIDを入力してください');
      setFoundUser(null);
      return;
    }

    if (inputUid === currentUser.uid) {
      setMessage('自分のUIDは検索できません');
      setFoundUser(null);
      return;
    }

    try {
      const docRef = doc(db, 'users', inputUid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setFoundUser(docSnap.data());
        setMessage('');
      } else {
        setFoundUser(null);
        setMessage('ユーザーが見つかりません');
      }
    } catch (error) {
      setFoundUser(null);
      setMessage('検索中にエラーが発生しました');
      console.error(error);
    }
  };

  const handleAddFriend = async () => {
    if (!foundUser) return;

    try {
      // 自分のfriendsに追加
      const myDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(myDocRef, {
        friends: arrayUnion(inputUid),
      });

      // 相手のfriendsにも自分を追加（相互フレンド）
      const friendDocRef = doc(db, 'users', inputUid);
      await updateDoc(friendDocRef, {
        friends: arrayUnion(currentUser.uid),
      });

      setMessage(`「${foundUser.name}」をフレンドに追加しました！`);
      setFoundUser(null);
      setInputUid('');
    } catch (error) {
      setMessage('フレンド追加に失敗しました');
      console.error(error);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>UIDでフレンド検索</h2>
      <input
        type="text"
        placeholder="フレンドのUIDを入力"
        value={inputUid}
        onChange={(e) => setInputUid(e.target.value)}
        className={styles.input}
      />
      <button onClick={handleSearch} className={styles.searchButton}>
        検索
      </button>

      {message && <p className={styles.message}>{message}</p>}

      {foundUser && (
        <div className={styles.result}>
          <p><strong>ユーザー名:</strong> {foundUser.name}</p>
          <button onClick={handleAddFriend} className={styles.addButton}>
            フレンドに追加
          </button>
        </div>
      )}
    </div>
  );
};

export default UIDsearch;
