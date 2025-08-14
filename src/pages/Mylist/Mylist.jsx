import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase/firebaseConfig';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import styles from './Mylist.module.css';

const Mylist = () => {
  const [user, setUser] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [myList, setMyList] = useState([]);

  // ログインユーザー取得＆Firestoreから既存リスト取得
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) return;
      setUser(currentUser);

      const docRef = doc(db, 'users', currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setMyList(data.myList || []);
      } else {
        // ユーザードキュメントがなければ作成
        await setDoc(docRef, { myList: [] }, { merge: true });
      }
    });

    return () => unsubscribe();
  }, []);

  // リストに追加
  const handleAdd = async (title = null) => {
    const trimmedTitle = (title || newTitle).trim();
    if (!trimmedTitle || !user) return;

    const newItem = {
      title: trimmedTitle,
      addedAt: new Date().toISOString(),
    };

    const updatedList = [...myList, newItem];
    setMyList(updatedList);
    if (!title) setNewTitle('');

    try {
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, { myList: updatedList });
    } catch (error) {
      console.error('マイリスト保存に失敗:', error);
    }
  };

  // アイテム削除
  const handleDelete = async (index) => {
    if (!user) return;
    const updatedList = myList.filter((_, idx) => idx !== index);
    setMyList(updatedList);

    try {
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, { myList: updatedList });
    } catch (error) {
      console.error('マイリスト削除に失敗:', error);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>マイリスト</h2>

      <div className={styles.inputArea}>
        <input
          type="text"
          placeholder="リストタイトルを入力"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className={styles.input}
        />
        <button onClick={() => handleAdd()} className={styles.button}>
          リストを追加
        </button>
      </div>

      <div className={styles.listArea}>
        {myList.length === 0 ? (
          <p>マイリストは空です</p>
        ) : (
          <ul className={styles.list}>
            {myList.map((item, idx) => (
              <li key={idx} className={styles.listItem}>
                <span>{item.title}</span>
                <div className={styles.buttonGroup}>
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDelete(idx)}
                  >
                    削除
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Mylist;
