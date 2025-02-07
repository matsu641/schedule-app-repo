// ProgressInput.js
import React, { useState } from 'react';

/**
 * props:
 *  - tasks
 *  - onUpdateProgress(taskId, newProgress)
 */
function ProgressInput({ tasks, onUpdateProgress }) {
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [progressValue, setProgressValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedTaskId || progressValue === '') {
      alert('タスクと進捗率を入力してください');
      return;
    }
    const val = Number(progressValue);
    if (val < 0 || val > 100) {
      alert('進捗率は0〜100の範囲で入力してください');
      return;
    }
    onUpdateProgress(selectedTaskId, val);
    setProgressValue('');
  };

  return (
    <div style={{ border: '1px solid #aaa', padding: '1rem', marginBottom: '1rem' }}>
      <h2>進捗入力</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>タスクを選択: </label>
          <select
            value={selectedTaskId}
            onChange={(e) => setSelectedTaskId(Number(e.target.value))}
          >
            <option value="">-- 選択 --</option>
            {tasks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>進捗率(0〜100): </label>
          <input
            type="number"
            value={progressValue}
            onChange={(e) => setProgressValue(e.target.value)}
          />
          <span>%</span>
        </div>
        <button type="submit">更新</button>
      </form>
    </div>
  );
}

export default ProgressInput;
