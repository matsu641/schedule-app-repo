import React from 'react';
import { format, parseISO } from 'date-fns';

/**
 * props:
 *  - scheduleTable: [ { date, slots: [ {timeIndex, taskId, taskName} ] }, ... ]
 *  - slotMinutes: 1スロットの分数 (60, 30, 10 etc)
 */
function ScheduleView({ scheduleTable, slotMinutes }) {
  if (!scheduleTable || scheduleTable.length === 0) {
    return (
      <div style={{ border: '1px solid #aaa', padding: '1rem' }}>
        <h2>スケジュール</h2>
        <p>まだスケジュールがありません。</p>
      </div>
    );
  }

  // 日付の取得（各行のスロットごとにユニークな日付をリスト化）
  const uniqueDates = Array.from(new Set(scheduleTable.map((day) => day.date))).sort();
  
  // 最大のスロット数を取得
  const slotCount = scheduleTable[0].slots.length;

  return (
    <div style={{ border: '1px solid #aaa', padding: '1rem', marginBottom: '1rem' }}>
      <h2>スケジュール (週〜2週間)</h2>

      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
        <thead>
          <tr>
            <th style={{ padding: '8px', border: '1px solid #ccc' }}>時間</th>
            {/* 横軸に日付を表示 */}
            {uniqueDates.map((date) => (
              <th key={date} style={{ padding: '8px', border: '1px solid #ccc', backgroundColor: '#f0f0f0' }}>
                {format(parseISO(date), 'MM/dd (EEE)')}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {/* 縦軸に時間スロットを表示 */}
          {Array.from({ length: slotCount }).map((_, slotIdx) => (
            <tr key={slotIdx}>
              {/* 左端に時間表示 */}
              <td style={{ padding: '8px', fontWeight: 'bold', border: '1px solid #ccc' }}>
                {`${(slotIdx * slotMinutes) / 60}:00`}
              </td>

              {/* 各スロットにタスクや固定予定を表示 */}
              {uniqueDates.map((date) => {
                const dayInfo = scheduleTable.find((d) => d.date === date);
                if (!dayInfo) return <td key={date} style={{ border: '1px solid #ccc' }}>-</td>;

                const slot = dayInfo.slots[slotIdx];
                if (!slot) return <td key={date + slotIdx} style={{ border: '1px solid #ccc' }}>-</td>;

                return (
                  <td
                    key={date + slotIdx}
                    style={{
                      padding: '8px',
                      backgroundColor: slot.taskName ? '#d9ecff' : slot.fixed ? '#ffd9d9' : '#fff',
                      border: '1px solid #ccc',
                    }}
                  >
                    {slot.fixed ? '×' : slot.taskName || '-'}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ fontSize: '0.9rem', marginTop: '10px', color: '#555' }}>
        ※各スロットは「{slotMinutes}分」ぶんの作業枠です。
      </p>
    </div>
  );
}

export default ScheduleView;

