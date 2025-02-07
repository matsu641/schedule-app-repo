/*タスクを追加するフォームのコンポーネント
ユーザーが入力し、「追加」ボタンを押すと新しいタスクが作成される
親コンポーネント（App.jsなど）から onAddTask を受け取り、newTask オブジェクトを渡す想定*/

// TaskForm.js
import React, { useState } from 'react';

/**
 * props:
 *  - onAddTask(newTask)
 */
function TaskForm({ onAddTask }) {
  // 入力用
  const [name, setName] = useState('');
  const [taskType, setTaskType] = useState('report');
  const [dueDate, setDueDate] = useState('');
  const [requiredTime, setRequiredTime] = useState('');
  const [priority, setPriority] = useState('medium');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !dueDate || !requiredTime) {
      alert('必須項目が未入力です');
      return;
    }

    const newTask = {
      id: Date.now(),
      name,
      taskType,          // 提出課題 or 暗記もの etc
      dueDate,
      requiredTime: Number(requiredTime), // 時間
      priority,
      progress: 0,       // 進捗率 0% からスタート
    };

    onAddTask(newTask);

    // フォームリセット
    setName('');
    setTaskType('report');
    setDueDate('');
    setRequiredTime('');
    setPriority('medium');
  };

  return (
    <div style={{ border: '1px solid #aaa', padding: '1rem', marginBottom: '1rem' }}>
      <h2>タスク追加</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>タスク名: </label>
          <input 
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label>種類: </label>
          <select value={taskType} onChange={(e) => setTaskType(e.target.value)}>
            <option value="report">提出課題</option>
            <option value="memorize">暗記もの</option>
            <option value="study">勉強 (問題集など)</option>
            <option value="other">その他</option>
          </select>
        </div>

        <div>
          <label>締切日: </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <div>
          <label>必要時間: </label>
          <input
            type="number"
            value={requiredTime}
            onChange={(e) => setRequiredTime(e.target.value)}
          />
          <span> 時間</span>
        </div>

        <div>
          <label>優先度: </label>
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="high">高</option>
            <option value="medium">中</option>
            <option value="low">低</option>
          </select>
        </div>

        <button type="submit">追加</button>
      </form>
    </div>
  );
}

export default TaskForm;
