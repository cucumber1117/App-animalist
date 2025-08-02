import React, { createContext, useState, useEffect } from 'react';

// メモアイテムの初期構造例
// id: string UUID, title: string, rating: number, note: string, date: Date(string)

export const MemoContext = createContext();

export const MemoProvider = ({ children }) => {
  const [memoItems, setMemoItems] = useState(() => {
    // ローカルストレージから読み込み
    const saved = localStorage.getItem('SavedMemos');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // 日付をDate型に変換して返す
        return parsed.map(item => ({
          ...item,
          date: new Date(item.date),
        }));
      } catch {
        return [];
      }
    }
    return [];
  });

  // メモが変わるたびにlocalStorageに保存
  useEffect(() => {
    localStorage.setItem('SavedMemos', JSON.stringify(memoItems));
  }, [memoItems]);

  // メモ追加
  const addMemo = (memo) => {
    setMemoItems(prev => [...prev, memo]);
  };

  // メモ更新（idで特定して内容を差し替え）
  const updateMemo = (updatedMemo) => {
    setMemoItems(prev =>
      prev.map(memo => (memo.id === updatedMemo.id ? updatedMemo : memo))
    );
  };

  // メモ削除
  const deleteMemo = (id) => {
    setMemoItems(prev => prev.filter(memo => memo.id !== id));
  };

  return (
    <MemoContext.Provider value={{ memoItems, addMemo, updateMemo, deleteMemo }}>
      {children}
    </MemoContext.Provider>
  );
};
