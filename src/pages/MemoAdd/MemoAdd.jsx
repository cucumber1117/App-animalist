import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MemoContext } from '../../context/MemoContext';
import { v4 as uuidv4 } from 'uuid';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './MemoAdd.module.css';

const MemoAdd = () => {
  const { addMemo } = useContext(MemoContext);
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [rating, setRating] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date());

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('タイトルは必須です');
      return;
    }

    const ratingNum = Number(rating);
    if (rating !== '' && (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 10)) {
      alert('評価は1から10の数字で入力してください');
      return;
    }

    const newMemo = {
      id: uuidv4(),
      title: title.trim(),
      rating: rating !== '' ? ratingNum : '',
      note: note.trim(),
      date: date ? date.toISOString() : new Date().toISOString(),
    };

    addMemo(newMemo);
    navigate('/history');
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>✍️ 新しいメモを追加</h1>
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

        <label className={styles.label}>日付</label>
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

        <button type="submit" className={styles.button}>追加</button>
      </form>
    </div>
  );
};

export default MemoAdd;
