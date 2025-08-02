import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { MemoContext } from '../../context/MemoContext';
import styles from './History.module.css';
import Filter from '../Filter/Filter';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
};

const History = () => {
  const { memoItems, deleteMemo } = useContext(MemoContext);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    searchText: '',
    selectedYears: new Set(),
    selectedMonths: new Set(),
    selectedRatings: new Set(),
  });

  const filteredMemos = memoItems.filter((memo) => {
    const titleMatch =
      filters.searchText === '' ||
      memo.title.toLowerCase().includes(filters.searchText.toLowerCase());

    const memoDate = new Date(memo.date);
    const year = memoDate.getFullYear();
    const month = memoDate.getMonth() + 1;

    const yearMatch = filters.selectedYears.size === 0 || filters.selectedYears.has(year);
    const monthMatch = filters.selectedMonths.size === 0 || filters.selectedMonths.has(month);
    const ratingMatch = filters.selectedRatings.size === 0 || filters.selectedRatings.has(memo.rating);

    return titleMatch && yearMatch && monthMatch && ratingMatch;
  });

  const sortedMemos = [...filteredMemos].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>すべての履歴</h1>
        <button
          className={styles.filterButton}
          onClick={() => setIsFilterOpen(true)}
          aria-label="絞り込みを開く"
        >
          &#9776; {/* ← ここが三本線アイコン */}
        </button>
      </header>

      {sortedMemos.length === 0 ? (
        <p>まだメモがありません。</p>
      ) : (
        <ul className={styles.list}>
          {sortedMemos.map((memo) => (
            <li key={memo.id} className={styles.listItem}>
              <div><strong>タイトル:</strong> {memo.title}</div>
              <div><strong>評価:</strong> {memo.rating}/10</div>
              <div><strong>メモ:</strong> {memo.note}</div>
              <div><strong>日付:</strong> {formatDate(memo.date)}</div>
              <div className={styles.buttonGroup}>
                <Link to={`/edit/${memo.id}`} className={styles.editLink}>
                  編集
                </Link>
                <button
                  className={styles.deleteButton}
                  onClick={() => {
                    if (window.confirm('本当に削除しますか？')) {
                      deleteMemo(memo.id);
                    }
                  }}
                >
                  削除
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {isFilterOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsFilterOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <Filter
              filters={filters}
              setFilters={setFilters}
              onClose={() => setIsFilterOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
