/**
 * 时间系统 Store
 * 驱动游戏时辰推进、日期历法、日结算触发
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  REAL_SECONDS_PER_KE, SHICHEN_PER_DAY, KE_PER_SHICHEN,
  SHICHEN_TABLE, SHICHEN_FORCE_SLEEP, SHICHEN_DAY_START,
  SHICHEN_WAKE_LATE, calcDateInfo
} from '../data/time.js'

export const useTimeStore = defineStore('time', () => {
  // ---- 状态 ----
  const totalDay = ref(1)           // 当前第几天（从1开始）
  const shichenIndex = ref(SHICHEN_DAY_START) // 当前时辰索引（辰时起）
  const keIndex = ref(0)            // 当前刻索引（0-7）
  const dayEnded = ref(false)       // 当天是否已结束（睡觉了）
  const forcedSleep = ref(false)    // 是否强制睡觉

  // 日结算相关
  const showDaySummary = ref(false) // 显示日统计页面
  const showMorningTraining = ref(false) // 显示晨练选择

  let timer = null

  // ---- 计算属性 ----
  const currentShichen = computed(() => SHICHEN_TABLE[shichenIndex.value])
  const dateInfo = computed(() => calcDateInfo(totalDay.value))
  const isForceSleepTime = computed(() => shichenIndex.value === SHICHEN_FORCE_SLEEP)
  const timeDisplay = computed(() =>
    `${currentShichen.value.name} ${keIndex.value + 1}刻`
  )
  const dateDisplay = computed(() => {
    const d = dateInfo.value
    return `第${d.year}年 ${d.season}季 第${d.weekInSeason}周 第${d.dayInWeek}天`
  })

  // ---- 方法 ----

  /** 启动时间推进（由App.vue游戏主循环驱动，不再自建定时器） */
  function startTick() {
    // 保留接口兼容，实际由外部game.onTick()驱动
  }

  /** 停止时间推进 */
  function stopTick() {
    // 兼容接口
  }

  /** 推进1刻 */
  function advanceKe() {
    keIndex.value++
    if (keIndex.value >= KE_PER_SHICHEN) {
      keIndex.value = 0
      advanceShichen()
    }
  }

  /** 推进1时辰 */
  function advanceShichen() {
    shichenIndex.value++

    // 时辰循环：从辰时(4)→...→亥时(11)→子时(0)→丑时(1)→寅时(2)
    if (shichenIndex.value >= SHICHEN_PER_DAY) {
      shichenIndex.value = 0 // 亥时之后回到子时
    }

    // 检查是否到达强制睡觉时辰（寅时=2）
    if (shichenIndex.value === SHICHEN_FORCE_SLEEP) {
      forcedSleep.value = true
      endDay()
      return
    }
  }

  /** 主动睡觉 */
  function goToSleep() {
    if (dayEnded.value) return
    forcedSleep.value = false
    endDay()
  }

  /** 结束当天 */
  function endDay() {
    dayEnded.value = true
    stopTick()
    showDaySummary.value = true
  }

  /** 关闭日统计，进入晨练选择 */
  function closeDaySummary() {
    showDaySummary.value = false
    showMorningTraining.value = true
  }

  /** 确认晨练，开始新一天 */
  function startNewDay(wakeShichen) {
    showMorningTraining.value = false
    totalDay.value++
    shichenIndex.value = wakeShichen || SHICHEN_DAY_START
    keIndex.value = 0
    dayEnded.value = false
    forcedSleep.value = false
    startTick()
  }

  /** 初始化（新游戏） */
  function init() {
    totalDay.value = 1
    shichenIndex.value = SHICHEN_DAY_START
    keIndex.value = 0
    dayEnded.value = false
    forcedSleep.value = false
    showDaySummary.value = false
    showMorningTraining.value = false
    startTick()
  }

  return {
    totalDay, shichenIndex, keIndex, dayEnded, forcedSleep,
    showDaySummary, showMorningTraining,
    currentShichen, dateInfo, isForceSleepTime,
    timeDisplay, dateDisplay,
    startTick, stopTick, advanceKe, goToSleep, endDay,
    closeDaySummary, startNewDay, init
  }
})
