import React, { createContext, useState, useEffect } from 'react';
import { auth } from '../firebase/firebaseConfig';

export const MemoContext = createContext();

export const MemoProvider = ({ children }) => {
  const [memoItems, setMemoItems] = useState([]);
  const [userId, setUserId] = useState(null);

  // ログインユーザーのUIDを取得
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
        const localMemos = localStorage.getItem(`memos_${user.uid}`);
        if (localMemos) {
          setMemoItems(JSON.parse(localMemos));
        } else {
          setMemoItems([]);
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
      id: crypto.randomUUID(), // UUIDを生成
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

  return (
    <MemoContext.Provider value={{ memoItems, addMemo, updateMemo, deleteMemo }}>
      {children}
    </MemoContext.Provider>
  );
};
