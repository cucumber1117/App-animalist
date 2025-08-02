import React, { useContext, useState } from 'react';
import { MemoContext } from '../../context/MemoContext';
import styles from './MemoAdd.module.css';
import { v4 as uuidv4 } from 'uuid';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const MemoAdd = () => {
  const { addMemo } = useContext(MemoContext);

  // 日付は今日を初期値
  const [date, setDate] = useState(new Date());
  const [title, setTitle] = useState('');
  const [rating, setRating] = useState('');
  const [note, setNote] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('タイトルは必須です');
      return;
    }

    const newMemo = {
      id: uuidv4(),
      title: title.trim(),
      rating: rating ? Number(rating) : null,
      note: note.trim() || '',
      date: date ? date.toISOString() : new Date().toISOString(),
    };

    addMemo(newMemo);

    setSuccessMessage('保存完了！！');

    // フォームリセット
    setTitle('');
    setRating('');
    setNote('');
    setDate(new Date());

    setTimeout(() => {
      setSuccessMessage('');
    }, 1000);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>🎬 アニメを記録</h1>
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
          onChange={e => setRating(e.target.value)}
          className={styles.input}
          min="1"
          max="10"
        />

        <label className={styles.label}>メモ</label>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          className={styles.textarea}
          rows="5"
        />

        <label className={styles.label}>見た日付</label>
        <DatePicker
          selected={date}
          onChange={setDate}
          className={styles.input}
          calendarClassName={styles.centeredCalendar}
          dateFormat="yyyy-MM-dd"
          showYearDropdown
          scrollableYearDropdown
          yearDropdownItemNumber={50}
          maxDate={new Date()}
        />

        <button type="submit" className={styles.button}>保存</button>
      </form>
      {successMessage && <p className={styles.successMessage}>{successMessage}</p>}
    </div>
  );
};

export default MemoAdd;
