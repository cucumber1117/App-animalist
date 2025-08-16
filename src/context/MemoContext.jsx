import React, { createContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase/firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export const MemoContext = createContext();

export const MemoProvider = ({ children }) => {
  const [memoItems, setMemoItems] = useState([]);
  const [userId, setUserId] = useState(null);
  const [isRecentAnimesPublic, setIsRecentAnimesPublic] = useState(false);

  // ログインユーザーのUIDを取得 & Firestoreから公開設定を読む
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUserId(user.uid);

        // localStorageからメモ読込
        const localMemos = localStorage.getItem(`memos_${user.uid}`);
        if (localMemos) {
          setMemoItems(JSON.parse(localMemos));
        } else {
          setMemoItems([]);
        }

        // Firestoreから公開設定を取得
        const docRef = doc(db, 'users', user.uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setIsRecentAnimesPublic(snap.data().isRecentAnimesPublic ?? false);
        }
      } else {
        setUserId(null);
        setMemoItems([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const saveToLocalStorage = (updatedMemos) => {
    if (userId) {
      localStorage.setItem(`memos_${userId}`, JSON.stringify(updatedMemos));
    }
  };

  // メモ追加
  const addMemo = (memo) => {
    const newMemo = {
      ...memo,
      id: crypto.randomUUID(),
      date: memo.date instanceof Date ? memo.date.toISOString() : memo.date,
    };
    const updated = [...memoItems, newMemo];
    setMemoItems(updated);
    saveToLocalStorage(updated);
  };

  // メモ更新
  const updateMemo = (id, updatedData) => {
    const updated = memoItems.map((m) =>
      m.id === id ? { ...m, ...updatedData } : m
    );
    setMemoItems(updated);
    saveToLocalStorage(updated);
  };

  // メモ削除
  const deleteMemo = (id) => {
    const updated = memoItems.filter((m) => m.id !== id);
    setMemoItems(updated);
    saveToLocalStorage(updated);
  };

  // 🔥 最近見たアニメを Firestore に自動更新
  useEffect(() => {
    if (!userId || memoItems.length === 0 || !isRecentAnimesPublic) return;

    // 最新4件を抽出（重複除去）
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

    const updateRecent = async () => {
      try {
        await updateDoc(doc(db, 'users', userId), {
          recentAnimes: uniqueRecent,
        });
        console.log('最近見たアニメを自動更新:', uniqueRecent);
      } catch (e) {
        console.error('自動更新失敗:', e);
      }
    };

    updateRecent();
  }, [memoItems, userId, isRecentAnimesPublic]);

  return (
    <MemoContext.Provider value={{ memoItems, addMemo, updateMemo, deleteMemo }}>
      {children}
    </MemoContext.Provider>
  );
};
