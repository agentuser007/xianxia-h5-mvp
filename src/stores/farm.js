/**
 * 田地种植 Store
 * 管理地块状态、播种、浇水、生长判定、收获
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { CROPS, ITEMS } from '../data/crops.js'
import { useInventoryStore } from './inventory.js'
import { useTimeStore } from './time.js'
import { SHICHEN_YOU, calcDateInfo } from '../data/time.js'

// 地块状态枚举
export const PLOT_STATES = {
  EMPTY: 'empty',           // 空地
  TILLED: 'tilled',         // 已开垦
  PLANTED: 'planted',       // 已播种（幼苗）
  GROWING: 'growing',       // 生长中
  READY: 'ready',           // 可收获
  WITHERED: 'withered',     // 枯萎
}

// 3×3地块网格
const GRID_SIZE = 9

export const useFarmStore = defineStore('farm', () => {
  const plots = ref([])

  function init() {
    plots.value = Array.from({ length: GRID_SIZE }, (_, i) => ({
      id: i,
      state: PLOT_STATES.EMPTY,
      cropId: null,        // 种植的作物ID
      growDays: 0,         // 已生长天数
      watered: false,      // 今天是否浇水
      fertilized: false,   // 是否施肥
      dayPlanted: 0,       // 种植时的totalDay
      plantedAfterYou: false, // 是否酉时后种植
    }))
  }

  /** 开垦空地 */
  function till(plotId) {
    const plot = plots.value[plotId]
    if (plot && plot.state === PLOT_STATES.EMPTY) {
      plot.state = PLOT_STATES.TILLED
    }
  }

  /** 播种 */
  function plant(plotId, seedItemId) {
    const plot = plots.value[plotId]
    if (!plot || plot.state !== PLOT_STATES.TILLED) return false

    const seedDef = ITEMS[seedItemId]
    if (!seedDef || seedDef.type !== 'seed') return false

    const crop = CROPS[seedDef.cropId]
    if (!crop) return false

    // 检查季节
    const timeStore = useTimeStore()
    const seasonIdx = timeStore.dateInfo.seasonIndex
    if (!crop.seasons.includes(seasonIdx)) {
      return false // 当前季节不可种植
    }

    // 扣除种子
    const inv = useInventoryStore()
    if (!inv.removeItem(seedItemId, 1)) return false

    plot.cropId = crop.id
    plot.state = PLOT_STATES.PLANTED
    plot.growDays = 0
    plot.dayPlanted = timeStore.totalDay
    plot.plantedAfterYou = timeStore.shichenIndex >= SHICHEN_YOU
    plot.watered = false

    return true
  }

  /** 浇水 */
  function water(plotId) {
    const plot = plots.value[plotId]
    if (!plot) return false
    if (plot.state !== PLOT_STATES.PLANTED && plot.state !== PLOT_STATES.GROWING) return false
    plot.watered = true
    return true
  }

  /** 收获 */
  function harvest(plotId) {
    const plot = plots.value[plotId]
    if (!plot || plot.state !== PLOT_STATES.READY) return null

    const crop = CROPS[plot.cropId]
    if (!crop) return null

    const inv = useInventoryStore()
    // 增产季节判定
    const timeStore = useTimeStore()
    const seasonIdx = timeStore.dateInfo.seasonIndex
    const amount = crop.boostSeason === seasonIdx
      ? Math.round(crop.productAmount * 1.5)
      : crop.productAmount

    inv.addItem(crop.productId, amount)

    const result = { cropId: crop.id, cropName: crop.name, amount }

    if (crop.infinite) {
      // 无限收获型：重置为生长中
      plot.state = PLOT_STATES.GROWING
      plot.growDays = 0
      plot.watered = false
    } else {
      // 一次收获型：回到已开垦
      plot.state = PLOT_STATES.TILLED
      plot.cropId = null
      plot.growDays = 0
      plot.watered = false
      plot.dayPlanted = 0
      plot.plantedAfterYou = false
    }

    return result
  }

  /** 清理枯萎作物 */
  function clearWithered(plotId) {
    const plot = plots.value[plotId]
    if (!plot || plot.state !== PLOT_STATES.WITHERED) return
    plot.state = PLOT_STATES.TILLED
    plot.cropId = null
    plot.growDays = 0
    plot.watered = false
    plot.dayPlanted = 0
    plot.plantedAfterYou = false
  }

  /** 日结算：判定所有地块生长 */
  function processDayEnd() {
    const timeStore = useTimeStore()

    // 使用次日的季节判定过季枯萎
    const nextDayInfo = calcDateInfo(timeStore.totalDay + 1)
    const nextSeasonIndex = nextDayInfo.seasonIndex

    plots.value.forEach(plot => {
      if (plot.state === PLOT_STATES.PLANTED || plot.state === PLOT_STATES.GROWING) {
        const crop = CROPS[plot.cropId]
        if (!crop) return

        // 检查季节：次日过季则枯萎
        if (!crop.seasons.includes(nextSeasonIndex)) {
          plot.state = PLOT_STATES.WITHERED
          return
        }

        // 检查是否浇水
        if (!plot.watered) {
          // 未浇水不生长（MVP简化，不实现缺水死亡）
          return
        }

        // 酉时后种植的作物当天不计入生长
        if (!plot.plantedAfterYou) {
          plot.growDays++
        }

        // 检查是否成熟
        if (plot.growDays >= crop.growDays) {
          plot.state = PLOT_STATES.READY
        } else {
          plot.state = PLOT_STATES.GROWING
        }
      }

      // 重置每日状态
      plot.watered = false
      plot.plantedAfterYou = false
    })
  }

  /** 获取地块的作物信息 */
  function getPlotCrop(plotId) {
    const plot = plots.value[plotId]
    if (!plot || !plot.cropId) return null
    return CROPS[plot.cropId]
  }

  return {
    plots, init, till, plant, water, harvest, clearWithered,
    processDayEnd, getPlotCrop
  }
})
