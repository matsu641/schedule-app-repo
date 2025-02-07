// App.js
import React, { useState, useEffect } from 'react';
import IdealSetup from './IdealSetup';
import TaskForm from './TaskForm';
import TaskList from './TaskList';
import ProgressInput from './ProgressInput';
import ScheduleView from './ScheduleView';
import { addDays, startOfWeek, isAfter, differenceInCalendarDays } from 'date-fns';

function App() {
  // --------------------
  // 状態(State)の定義
  // --------------------

  // 1) 固定スケジュール・理想時間などの設定値
  const [settings, setSettings] = useState({
    dailyIdealHours: 4,        // 1日の理想作業時間(初期値)
    slotMinutes: 60,           // スケジュールの時間刻み(初期は60分)
    fixedSchedules: [],        // 固定スケジュールの配列
  });

  // 2) タスク配列
  const [tasks, setTasks] = useState([]);
  // 3) スケジュール割り当て情報(時間割)
  const [scheduleTable, setScheduleTable] = useState([]);
  // 4) ポイント(早く終わったり順調なら加算)
  const [points, setPoints] = useState(0);
  // 5) ほめ or 慰めメッセージ
  const [motivationMsg, setMotivationMsg] = useState('');

  // --------------------
  // 関数
  // --------------------

  /**
   * IdealSetupコンポーネントで受け取った設定を反映
   */
  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings);
  };

  /**
   * タスクを追加( TaskForm から呼ばれる )
   */
  const addTask = (task) => {
    setTasks([...tasks, task]);
  };

  /**
   * タスクを削除 ( TaskListから )
   */
  const deleteTask = (taskId) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  /**
   * 進捗更新 ( 例: 50% など )
   *  - 進捗率によってほめたり慰めたり
   *  - もし完了が早まった場合はポイント加算
   */
  const updateProgress = (taskId, newProgress) => {
    setTasks((prevTasks) => {
      return prevTasks.map((task) => {
        if (task.id === taskId) {
          const updated = { ...task, progress: newProgress };
          // タスクが完了(100%) かつ まだ完了報酬を与えていない場合 → ポイント加算
          if (newProgress === 100 && task.progress < 100) {
            // ポイント計算: 例として "必要時間" - "実際かかった時間(雑)" をボーナスに
            // ここでは適当に +10 とかでもOK
            setPoints((p) => p + 10);
            setMotivationMsg('おめでとう！タスク完了！ +10ポイント獲得！');
          } else {
            // 進捗率に応じたメッセージ
            if (newProgress >= 80) {
              setMotivationMsg('すごい！もう少しで終わるね！');
            } else if (newProgress >= 50) {
              setMotivationMsg('半分クリア！いい調子！');
            } else if (newProgress > 0) {
              setMotivationMsg('スタートしてるね。引き続き頑張ろう！');
            } else {
              setMotivationMsg('まだこれから！最初の一歩を踏み出そう。');
            }
          }
          return updated;
        }
        return task;
      });
    });
  };

  /**
   * タスクを「日数×スロット」に分割してスケジュールを生成する
   * - ここではシンプルに「今日から締切日までの日数」で均等割り当て + 優先度を少しだけ考慮
   * - 固定スケジュールの時間は除外して、残りで理想作業時間を埋めていく
   */
  const generateSchedule = () => {
    const { dailyIdealHours, slotMinutes, fixedSchedules } = settings;

    // まず、1日の内で固定スケジュールが占める時間をざっくり計算し、
    // 1日の作業可能時間を "dailyIdealHours" として使う方針にしてみる。（簡易化）
    // 本来なら 24h - 固定分 をもとにスロットを生成し、理想時間を超えない形にするなど詳細実装が必要

    // tasks を優先度順/締切の近い順にソート (ざっくり)
    const sortedTasks = [...tasks].sort((a, b) => {
      // まず優先度(高→中→低)
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      const pa = priorityOrder[a.priority] || 3;
      const pb = priorityOrder[b.priority] || 3;
      if (pa !== pb) return pa - pb;

      // 次に締切日が近い順
      const da = new Date(a.dueDate);
      const db = new Date(b.dueDate);
      return da - db;
    });

    // スケジュールテーブル用の配列
    // 例: [ { date: 日付, slots: [ { time: "09:00", taskId, taskName }, ... ] }, ... ]
    let newSchedule = [];

    // とりあえず、今週の日曜を開始点～2週間後 くらいまでをテーブルにする
    const start = startOfWeek(new Date(), { weekStartsOn: 0 });
    // 14日分(2週間)を一括で用意
    const totalDays = 14;

    // 1日の理想作業時間(dailyIdealHours) を slotMinutes 単位に分割
    //  例: dailyIdealHours=4, slotMinutes=60 -> 4時間 -> 4スロット
    //  例: dailyIdealHours=4, slotMinutes=30 -> 8スロット
    //  ...
    const slotsPerDay = Math.floor((dailyIdealHours * 60) / slotMinutes);

    // まず日付ごとに、空のスロットを作っておく
    for (let i = 0; i < totalDays; i++) {
      const day = addDays(start, i);
      const dateStr = day.toISOString().split('T')[0];
      // スロット配列
      const daySlots = [];
      for (let s = 0; s < slotsPerDay; s++) {
        daySlots.push({
          timeIndex: s, // 時刻の概念は省略しシンプル化
          taskId: null,
          taskName: '',
        });
      }

      newSchedule.push({
        date: dateStr,
        slots: daySlots,
      });
    }

    // tasks を順にスロットに埋める
    // 必要時間は newTask.requiredTime - (progress の分を除く)
    // ここでは簡単に「残り時間 / 1スロットあたりの時間」でスロット数を決めて埋める
    for (const t of sortedTasks) {
      const taskDue = new Date(t.dueDate);
      // 残り作業時間 (progressを考慮; 100%→残り0)
      const remaining = t.requiredTime * (1 - (t.progress / 100));
      if (remaining <= 0) continue; // もう終わってる

      // 締切までの日数
      // テーブルに用意している範囲内で埋める
      for (let i = 0; i < newSchedule.length; i++) {
        const scDay = new Date(newSchedule[i].date);

        // もし締切を過ぎたら終了
        if (isAfter(scDay, taskDue)) break;

        // まだ作業残があるなら、この日が持つ空スロットに割り当てる
        let daySlots = newSchedule[i].slots;
        for (let s = 0; s < daySlots.length; s++) {
          // 空スロットを探す
          if (!daySlots[s].taskId) {
            // タスクを割り当てる
            daySlots[s].taskId = t.id;
            daySlots[s].taskName = t.name;
            // 1スロット分として slotMinutes -> 何時間相当か
            const slotHours = slotMinutes / 60;
            // その分残り作業時間を減らす
            t.requiredTime -= slotHours;
            // 残り時間が0以下になったらタスク完了
            if (t.requiredTime <= 0) {
              break;
            }
          }
        }
        // もしタスクを割り当て切ったら抜ける
        if (t.requiredTime <= 0) {
          break;
        }
      }
    }

    setScheduleTable(newSchedule);
  };

  // --------------------
  // useEffect
  // --------------------
  // tasks や settings が変わるたびにスケジュール再生成
  useEffect(() => {
    generateSchedule();
  }, [tasks, settings]);

  // --------------------
  // JSX (画面表示)
  // --------------------
  return (
    <div style={{ margin: '1rem' }}>
      <h1>総合タスクスケジューラー MVP</h1>

      {/* 1. 初期設定 */}
      <IdealSetup settings={settings} onSaveSettings={handleSaveSettings} />

      {/* 2. タスク追加フォーム */}
      <TaskForm onAddTask={addTask} />

      {/* 3. タスク一覧 */}
      <TaskList tasks={tasks} onDeleteTask={deleteTask} />

      {/* 4. 進捗入力 & メッセージ表示 */}
      <ProgressInput tasks={tasks} onUpdateProgress={updateProgress} />
      <p style={{ color: 'blue' }}>{motivationMsg}</p>
      <p>現在のポイント: {points}</p>

      {/* 5. スケジュール表示(1週間 or 2週間) */}
      <ScheduleView scheduleTable={scheduleTable} slotMinutes={settings.slotMinutes} />
    </div>
  );
}

export default App;
