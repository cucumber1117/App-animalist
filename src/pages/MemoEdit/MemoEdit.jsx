import React, { useContext, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MemoContext } from '../../context/MemoContext';
import styles from './MemoEdit.module.css';

const MemoEdit = () => {
  const { memoItems, updateMemo } = useContext(MemoContext);
  const { id } = useParams();
  const navigate = useNavigate();

  const memo = memoItems.find(item => item.id === id);

  const [title, setTitle] = useState('');
  const [rating, setRating] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (memo) {
      setTitle(memo.title);
      setRating(memo.rating);
      setNote(memo.note);
    }
  }, [memo]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !rating || !note) return;

    updateMemo(id, { title, rating, note, date: new Date().toISOString() });
    navigate('/history');
  };

  if (!memo) {
    return <p className={styles.notFound}>メモが見つかりませんでした。</p>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>✏️ メモを編集</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label className={styles.label}>タイトル</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className={styles.input}
        />

        <label className={styles.label}>評価（1〜10）</label>
        <input
          type="number"
          value={rating}
          min="1"
          max="10"
          onChange={e => setRating(e.target.value)}
          className={styles.input}
        />

        <label className={styles.label}>メモ</label>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          rows="5"
          className={styles.textarea}
        />

        <button type="submit" className={styles.button}>保存</button>
      </form>
    </div>
  );
};

export default MemoEdit;
