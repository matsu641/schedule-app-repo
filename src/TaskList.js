// TaskList.js
import React from 'react';

/**
 * props:
 *  - tasks: [{...}, ...]
 *  - onDeleteTask: (taskId) => void
 */
function TaskList({ tasks, onDeleteTask }) {
  return (
    <div style={{ border: '1px solid #aaa', padding: '1rem', marginBottom: '1rem' }}>
      <h2>タスク一覧</h2>
      {tasks.length === 0 ? (
        <p>タスクがありません</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#fafafa' }}>
            <tr>
              <th style={{ border: '1px solid #ccc' }}>タスク名</th>
              <th style={{ border: '1px solid #ccc' }}>種類</th>
              <th style={{ border: '1px solid #ccc' }}>締切日</th>
              <th style={{ border: '1px solid #ccc' }}>必要時間</th>
              <th style={{ border: '1px solid #ccc' }}>優先度</th>
              <th style={{ border: '1px solid #ccc' }}>進捗(%)</th>
              <th style={{ border: '1px solid #ccc' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => (
              <tr key={t.id} style={{ borderBottom: '1px solid #ccc' }}>
                <td style={{ border: '1px solid #ccc', padding: '4px' }}>{t.name}</td>
                <td style={{ border: '1px solid #ccc', padding: '4px' }}>{t.taskType}</td>
                <td style={{ border: '1px solid #ccc', padding: '4px' }}>{t.dueDate}</td>
                <td style={{ border: '1px solid #ccc', padding: '4px' }}>{t.requiredTime}</td>
                <td style={{ border: '1px solid #ccc', padding: '4px' }}>{t.priority}</td>
                <td style={{ border: '1px solid #ccc', padding: '4px' }}>{t.progress}%</td>
                <td style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'center' }}>
                  <button onClick={() => onDeleteTask(t.id)}>削除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default TaskList;
