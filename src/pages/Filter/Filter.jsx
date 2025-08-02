import React, { useState } from 'react';
import styles from './Filter.module.css';

const Filter = ({ filters = {}, setFilters, onClose }) => {
  // 親から渡されるfiltersの値を安全に展開し、ローカル状態用に初期化
  const {
    searchText = '',
    selectedYears = new Set(),
    selectedMonths = new Set(),
    selectedRatings = new Set(),
  } = filters;

  const [searchTextState, setSearchText] = useState(searchText);
  const [selectedYearsState, setSelectedYears] = useState(new Set(selectedYears));
  const [selectedMonthsState, setSelectedMonths] = useState(new Set(selectedMonths));
  const [selectedRatingsState, setSelectedRatings] = useState(new Set(selectedRatings));

  const currentYear = new Date().getFullYear();

  // 選択toggle関数
  const toggleSelection = (item, setFunc, selectedSet) => {
    const newSet = new Set(selectedSet);
    if (newSet.has(item)) {
      newSet.delete(item);
    } else {
      newSet.add(item);
    }
    setFunc(newSet);
  };

  // 適用ボタン押下時に親に反映してモーダル閉じる
  const applyFilters = () => {
    setFilters({
      searchText: searchTextState,
      selectedYears: selectedYearsState,
      selectedMonths: selectedMonthsState,
      selectedRatings: selectedRatingsState,
    });
    onClose();
  };

  // リセットボタンで全解除
  const resetFilters = () => {
    setSearchText('');
    setSelectedYears(new Set());
    setSelectedMonths(new Set());
    setSelectedRatings(new Set());
  };

  return (
    <div className={styles.container}>
      <h2>絞り込み条件</h2>

      <div className={styles.section}>
        <label htmlFor="searchText">タイトルで検索</label>
        <input
          id="searchText"
          type="text"
          value={searchTextState}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="タイトルを入力"
          className={styles.input}
        />
      </div>

      <div className={styles.section}>
        <label>視聴年</label>
        <div className={styles.options}>
          {[...Array(21).keys()].map((i) => {
            const year = currentYear - 20 + i;
            return (
              <button
                key={year}
                type="button"
                className={`${styles.optionButton} ${
                  selectedYearsState.has(year) ? styles.selected : ''
                }`}
                onClick={() => toggleSelection(year, setSelectedYears, selectedYearsState)}
              >
                {year}
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.section}>
        <label>視聴月</label>
        <div className={styles.options}>
          {[...Array(12).keys()].map((i) => {
            const month = i + 1;
            return (
              <button
                key={month}
                type="button"
                className={`${styles.optionButton} ${
                  selectedMonthsState.has(month) ? styles.selected : ''
                }`}
                onClick={() => toggleSelection(month, setSelectedMonths, selectedMonthsState)}
              >
                {month}月
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.section}>
        <label>評価</label>
        <div className={styles.options}>
          {[...Array(10).keys()].map((i) => {
            const rating = i + 1;
            return (
              <button
                key={rating}
                type="button"
                className={`${styles.optionButton} ${
                  selectedRatingsState.has(rating) ? styles.selected : ''
                }`}
                onClick={() => toggleSelection(rating, setSelectedRatings, selectedRatingsState)}
              >
                {rating}⭐️
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.buttons}>
        <button className={styles.applyButton} type="button" onClick={applyFilters}>
          絞り込む
        </button>
        <button className={styles.resetButton} type="button" onClick={resetFilters}>
          リセット
        </button>
        <button className={styles.closeButton} type="button" onClick={onClose}>
          閉じる
        </button>
      </div>
    </div>
  );
};

export default Filter;
