/**
 * 游戏主控 Store
 * 协调所有子系统，管理全局游戏状态
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useTimeStore } from './time.js'
import { useInventoryStore } from './inventory.js'
import { useFarmStore } from './farm.js'
import { useKitchenStore } from './kitchen.js'
import { useTavernStore } from './tavern.js'
import { SHICHEN_DAY_START, SHICHEN_WAKE_LATE } from '../data/time.js'
import { MORNING_TRAININGS } from '../data/recipes.js'

// 游戏阶段
export const GAME_PHASES = {
  TITLE: 'title',
  PLAYING: 'playing',
  DAY_SUMMARY: 'day_summary',
  MORNING_TRAINING: 'morning_training',
}

export const useGameStore = defineStore('game', () => {
  const phase = ref(GAME_PHASES.TITLE)
  const currentScene = ref('farm') // farm | kitchen | tavern
  const selectedTraining = ref('strength') // 晨练选择
  const lastDayStats = ref(null)

  // ---- 新游戏 ----
  function newGame() {
    const time = useTimeStore()
    const inv = useInventoryStore()
    const farm = useFarmStore()
    const kitchen = useKitchenStore()
    const tavern = useTavernStore()

    time.init()
    inv.init()
    farm.init()
    kitchen.init()
    tavern.init()

    phase.value = GAME_PHASES.PLAYING
    currentScene.value = 'farm'
    selectedTraining.value = 'strength'
  }

  // ---- 每刻 tick ----
  function onTick() {
    const time = useTimeStore()
    const kitchen = useKitchenStore()
    const tavern = useTavernStore()

    if (time.dayEnded.value) return

    // 推进时间1刻
    const wasDayEnded = time.dayEnded.value
    const prevShichen = time.shichenIndex
    time.advanceKe()

    // 强制睡觉触发日结算
    if (!wasDayEnded && time.dayEnded.value) {
      onDayEnd()
      return
    }

    // 如果时辰变化了
    if (time.shichenIndex !== prevShichen) {
      onShichenChange(time.shichenIndex)
    }

    // 灶台烹饪进度
    kitchen.tickCooking()

    // 顾客等待
    tavern.tickCustomers()
  }

  /** 时辰变化回调 */
  function onShichenChange(newShichen) {
    const tavern = useTavernStore()
    const time = useTimeStore()

    // 白天时段（辰时到戌时）尝试生成顾客
    if (newShichen >= SHICHEN_DAY_START && newShichen <= 10) {
      tavern.trySpawnCustomer()
    }
  }

  // ---- 睡觉 ----
  function goToSleep() {
    const time = useTimeStore()
    time.goToSleep()
    onDayEnd()
  }

  /** 日结算 */
  function onDayEnd() {
    const farm = useFarmStore()
    const kitchen = useKitchenStore()
    const tavern = useTavernStore()
    const time = useTimeStore()

    // 各系统日结算
    farm.processDayEnd()
    kitchen.processDayEnd()
    tavern.processDayEnd()

    // 保存今日统计（在processDayEnd之后，以包含流失顾客）
    lastDayStats.value = {
      day: time.totalDay,
      ...tavern.todayStats,
      farmHarvests: 0, // TODO: 跟踪
    }

    phase.value = GAME_PHASES.DAY_SUMMARY
  }

  /** 关闭日统计 */
  function closeDaySummary() {
    const time = useTimeStore()
    time.closeDaySummary()
    phase.value = GAME_PHASES.MORNING_TRAINING
  }

  /** 确认晨练，开始新一天 */
  function confirmMorningTraining() {
    const time = useTimeStore()
    const tavern = useTavernStore()
    const inv = useInventoryStore()

    // 强制睡觉惩罚：午时醒来，跳过晨练
    const wakeShichen = time.forcedSleep ? SHICHEN_WAKE_LATE : SHICHEN_DAY_START

    // 晨练增益：应用所选训练的奖励
    if (!time.forcedSleep) {
      const training = MORNING_TRAININGS.find(t => t.id === selectedTraining.value)
      if (training) {
        const bonusValues = Object.values(training.bonus)
        const totalBonus = bonusValues.reduce((sum, v) => sum + v, 0)
        inv.addGold(totalBonus)
      }
    }

    tavern.resetDailyStats()
    time.startNewDay(wakeShichen)
    phase.value = GAME_PHASES.PLAYING
  }

  /** 切换场景 */
  function switchScene(scene) {
    currentScene.value = scene
  }

  const isPlaying = computed(() => phase.value === GAME_PHASES.PLAYING)

  return {
    phase, currentScene, selectedTraining, lastDayStats, isPlaying,
    newGame, onTick, goToSleep, closeDaySummary,
    confirmMorningTraining, switchScene
  }
})
