/**
 * 时间系统常量与数据定义
 * 基于 设计大纲.txt 行33-49
 */

// 时间流速：游戏1小时 = 现实1分钟 → 1时辰(2小时) = 现实2分钟
export const REAL_SECONDS_PER_KE = 15 // 每刻=现实15秒，8刻=120秒=2分钟=1时辰
export const SHICHEN_PER_DAY = 12
export const KE_PER_SHICHEN = 8
export const KE_PER_DAY = SHICHEN_PER_DAY * KE_PER_SHICHEN // 96

// 历法常量
export const DAYS_PER_WEEK = 4
export const WEEKS_PER_SEASON = 6
export const SEASONS_PER_YEAR = 4
export const BONUS_WEEK = 1
export const WEEKS_PER_YEAR = SEASONS_PER_YEAR * WEEKS_PER_SEASON + BONUS_WEEK // 25
export const DAYS_PER_YEAR = WEEKS_PER_YEAR * DAYS_PER_WEEK // 100

// 季节枚举
export const SEASONS = ['春', '夏', '秋', '冬', '腊'] // 腊=奖励季度

// 时辰表：名称、时钟对应、活动标签
export const SHICHEN_TABLE = [
  { index: 0,  name: '子时', clock: '23:00-01:00', label: '',          activity: '' },
  { index: 1,  name: '丑时', clock: '01:00-03:00', label: '宵夜',      activity: 'snack' },
  { index: 2,  name: '寅时', clock: '03:00-05:00', label: '强制睡觉',  activity: 'force_sleep' },
  { index: 3,  name: '卯时', clock: '05:00-07:00', label: '正常醒来',  activity: 'wake_normal' },
  { index: 4,  name: '辰时', clock: '07:00-09:00', label: '早饭/日起', activity: 'day_start' },
  { index: 5,  name: '巳时', clock: '09:00-11:00', label: '',          activity: '' },
  { index: 6,  name: '午时', clock: '11:00-13:00', label: '延迟醒来',  activity: 'wake_late' },
  { index: 7,  name: '未时', clock: '13:00-15:00', label: '午饭',      activity: 'lunch' },
  { index: 8,  name: '申时', clock: '15:00-17:00', label: '黄昏(冬)',  activity: 'dusk_winter' },
  { index: 9,  name: '酉时', clock: '17:00-19:00', label: '黄昏(夏)',  activity: 'dusk_summer' },
  { index: 10, name: '戌时', clock: '19:00-21:00', label: '晚饭',      activity: 'dinner' },
  { index: 11, name: '亥时', clock: '21:00-23:00', label: '',          activity: '' },
]

// 关键时辰索引
export const SHICHEN_FORCE_SLEEP = 2   // 寅时 - 强制睡觉
export const SHICHEN_WAKE_NORMAL = 3   // 卯时 - 正常醒来
export const SHICHEN_DAY_START = 4     // 辰时 - 一天开始
export const SHICHEN_WAKE_LATE = 6     // 午时 - 惩罚醒来
export const SHICHEN_YOU = 9           // 酉时 - 种植判定节点

/**
 * 根据总天数计算日期信息
 * @param {number} totalDay 从第1天开始
 */
export function calcDateInfo(totalDay) {
  const day = totalDay
  const dayInWeek = ((day - 1) % DAYS_PER_WEEK) + 1
  const week = Math.ceil(day / DAYS_PER_WEEK)
  const seasonIndex = Math.min(Math.ceil(week / WEEKS_PER_SEASON) - 1, 4)
  const season = SEASONS[seasonIndex]
  const weekInSeason = ((week - 1) % WEEKS_PER_SEASON) + 1
  const year = Math.ceil(day / DAYS_PER_YEAR)
  return { day, dayInWeek, week, weekInSeason, seasonIndex, season, year }
}
