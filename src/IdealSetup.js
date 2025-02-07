// IdealSetup.js
import React, { useState } from 'react';

/**
 * props:
 *  - settings: { dailyIdealHours, slotMinutes, fixedSchedules }
 *  - onSaveSettings: (updatedSettings) => void
 */
function IdealSetup({ settings, onSaveSettings }) {
  // フォーム用の局所state
  const [dailyIdealHours, setDailyIdealHours] = useState(settings.dailyIdealHours);
  const [slotMinutes, setSlotMinutes] = useState(settings.slotMinutes);
  const [fixedSchedules, setFixedSchedules] = useState(settings.fixedSchedules || []);

  // 固定スケジュールの入力用
  const [dayOfWeek, setDayOfWeek] = useState('Mon');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('12:00');

  const handleSave = () => {
    // 親に渡す
    onSaveSettings({
      dailyIdealHours: Number(dailyIdealHours),
      slotMinutes: Number(slotMinutes),
      fixedSchedules: fixedSchedules,
    });
  };

  // 固定スケジュール追加
  const addFixedSchedule = () => {
    const newItem = {
      id: Date.now(),
      dayOfWeek,
      startTime,
      endTime,
    };
    setFixedSchedules([...fixedSchedules, newItem]);
  };

  const removeFixedSchedule = (id) => {
    setFixedSchedules((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div style={{ border: '1px solid #aaa', padding: '1rem', marginBottom: '1rem' }}>
      <h2>初期設定</h2>
      <div style={{ marginBottom: '1rem' }}>
        <label>1日の理想作業時間: </label>
        <input
          type="number"
          value={dailyIdealHours}
          onChange={(e) => setDailyIdealHours(e.target.value)}
          style={{ width: '60px' }}
        />
        <span> 時間</span>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>スケジュールの時間刻み: </label>
        <select
          value={slotMinutes}
          onChange={(e) => setSlotMinutes(e.target.value)}
        >
          <option value={60}>1時間単位</option>
          <option value={30}>30分単位</option>
          <option value={10}>10分単位</option>
        </select>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <h4>固定スケジュール (バイトや授業など)</h4>
        <div>
          <label>曜日: </label>
          <select value={dayOfWeek} onChange={(e) => setDayOfWeek(e.target.value)}>
            <option value="Sun">日</option>
            <option value="Mon">月</option>
            <option value="Tue">火</option>
            <option value="Wed">水</option>
            <option value="Thu">木</option>
            <option value="Fri">金</option>
            <option value="Sat">土</option>
          </select>
          <label> 開始: </label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
          <label> 終了: </label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
          <button onClick={addFixedSchedule}>追加</button>
        </div>

        <ul>
          {fixedSchedules.map((fs) => (
            <li key={fs.id}>
              {fs.dayOfWeek} {fs.startTime} - {fs.endTime}{' '}
              <button onClick={() => removeFixedSchedule(fs.id)}>削除</button>
            </li>
          ))}
        </ul>
      </div>

      <button onClick={handleSave}>設定を保存</button>
    </div>
  );
}

export default IdealSetup;
