// scheduleGenerator.js

import {
    parseISO,
    addDays,
    isAfter,
  } from 'date-fns';
  
  /**
   * ユーザーの設定・タスク情報をもとに、起床〜就寝の「1時間ごとマス」を作り、
   * 固定予定やタスクを割り当てたスケジュール配列を返す。
   *
   * @param {Object} settings - { weekStart, wakeTime, bedTime, fixedSchedules[] }
   * @param {Array} tasks - [{ id, name, requiredHours, dueDate, priority, ... }]
   * @return {Array} scheduleTable - [ { date: "YYYY-MM-DD", hour: number, taskId: number|null, fixed: boolean } ... ]
   */
  export function generateHourlySchedule(settings, tasks) {
    const { weekStart, wakeTime, bedTime, fixedSchedules } = settings;
  
    // 1) 週の開始日を Date型 にする
    const startDate = parseISO(weekStart);
  
    // 2) 1週間（日数分）の日付リストを作る（ここでは7日）
    const totalDays = 7;
    const dateList = Array.from({ length: totalDays }).map((_, i) =>
      addDays(startDate, i)
    );
  
    // 3) 起床時刻・就寝時刻を1時間の数字として取得 (分は無視したシンプル版)
    const wakeHour = parseInt(wakeTime.split(':')[0], 10); // "06:00" → 6
    const bedHour = parseInt(bedTime.split(':')[0], 10);   // "23:00" → 23
  
    // 4) 全マスを作る (固定予定はまだ入れない)
    let scheduleTable = [];
    dateList.forEach((dateObj) => {
      const dateStr = dateObj.toISOString().split('T')[0];
      for (let hour = wakeHour; hour < bedHour; hour++) {
        scheduleTable.push({
          date: dateStr,
          hour,
          taskId: null,
          fixed: false,
        });
      }
    });
  
    // 5) 固定予定を "fixed=true" にする
    //    例: { date: "2025-02-05", startTime: "10:00", endTime: "12:00" }
    const parseHour = (time) => parseInt(time.split(':')[0], 10); 
    fixedSchedules.forEach((fs) => {
      const fsDate = fs.date; 
      const fsStart = parseHour(fs.startTime);
      const fsEnd   = parseHour(fs.endTime);
  
      scheduleTable = scheduleTable.map((slot) => {
        if (
          slot.date === fsDate &&
          slot.hour >= fsStart &&
          slot.hour < fsEnd
        ) {
          return { ...slot, fixed: true };
        }
        return slot;
      });
    });
  
    // 6) タスクを優先度+締切近い順にソート (超ざっくり)
    const priorityMap = { high: 1, medium: 2, low: 3 };
    const sortedTasks = [...tasks].sort((a, b) => {
      const pa = priorityMap[a.priority] || 3;
      const pb = priorityMap[b.priority] || 3;
      if (pa !== pb) return pa - pb;
      // 同じ優先度なら締切が近い順
      const da = parseISO(a.dueDate);
      const db = parseISO(b.dueDate);
      return da - db;
    });
  
    // 7) タスクを空きマスに割り当て
    for (let task of sortedTasks) {
      let remain = task.requiredHours;  // 割り当て残時間
      const dueDate = parseISO(task.dueDate);
  
      // scheduleTableを順に見て埋めていく
      for (let i = 0; i < scheduleTable.length; i++) {
        if (remain <= 0) break; // 割り当て終了
  
        let cell = scheduleTable[i];
        const cellDateObj = parseISO(cell.date);
        // もし締切を過ぎていれば割り当て終了
        if (isAfter(cellDateObj, dueDate)) break;
        // すでに固定 or 他のタスク入り
        if (cell.fixed || cell.taskId !== null) {
          continue;
        }
        // 空いていれば、このマスをtaskに
        scheduleTable[i] = { ...cell, taskId: task.id };
        remain--;
      }
    }
  
    return scheduleTable;
  }
  