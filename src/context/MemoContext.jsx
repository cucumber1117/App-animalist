import React, { createContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase/firebaseConfig';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
} from 'firebase/firestore';

export const MemoContext = createContext();

export const MemoProvider = ({ children }) => {
  const [memoItems, setMemoItems] = useState([]);

  useEffect(() => {
    let unsubscribeMemos = null;

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) {
        console.log('ユーザー未ログイン');
        setMemoItems([]);
        if (unsubscribeMemos) {
          unsubscribeMemos();
          unsubscribeMemos = null;
        }
        return;
      }

      console.log('ユーザーID:', user.uid);

      const q = query(collection(db, 'memos'), where('userId', '==', user.uid));

      if (unsubscribeMemos) {
        unsubscribeMemos();
      }

      unsubscribeMemos = onSnapshot(
        q,
        (snapshot) => {
          const memos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          console.log('取得したメモ:', memos);
          setMemoItems(memos);
        },
        (error) => {
          console.error('Firestore購読エラー:', error);
        }
      );
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeMemos) unsubscribeMemos();
    };
  }, []);

  // メモ追加
  const addMemo = async (memo) => {
    const user = auth.currentUser;
    if (!user) {
      console.warn('ログインしていません。メモを追加できません。');
      return;
    }

    try {
      const docRef = await addDoc(collection(db, 'memos'), {
        ...memo,
        userId: user.uid,
        date: memo.date instanceof Date ? memo.date.toISOString() : memo.date,
      });
      console.log('メモ追加成功:', docRef.id);
    } catch (error) {
      console.error('メモ追加失敗:', error);
    }
  };

  // メモ更新
  const updateMemo = async (updatedMemo) => {
    const user = auth.currentUser;
    if (!user) {
      console.warn('ログインしていません。メモを更新できません。');
      return;
    }

    try {
      const docRef = doc(db, 'memos', updatedMemo.id);
      await updateDoc(docRef, {
        ...updatedMemo,
        date: updatedMemo.date instanceof Date ? updatedMemo.date.toISOString() : updatedMemo.date,
      });
      console.log('メモ更新成功:', updatedMemo.id);
    } catch (error) {
      console.error('メモ更新失敗:', error);
    }
  };

  // メモ削除
  const deleteMemo = async (id) => {
    const user = auth.currentUser;
    if (!user) {
      console.warn('ログインしていません。メモを削除できません。');
      return;
    }

    try {
      const docRef = doc(db, 'memos', id);
      await deleteDoc(docRef);
      console.log('メモ削除成功:', id);
    } catch (error) {
      console.error('メモ削除失敗:', error);
    }
  };

  return (
    <MemoContext.Provider value={{ memoItems, addMemo, updateMemo, deleteMemo }}>
      {children}
    </MemoContext.Provider>
  );
};
