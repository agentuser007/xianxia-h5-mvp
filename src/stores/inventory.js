/**
 * 背包/库存 Store
 * 管理玩家所有物品的数量
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ITEMS } from '../data/crops.js'

export const useInventoryStore = defineStore('inventory', () => {
  // items: { [itemId]: number }
  const items = ref({})

  // 初始物品（新游戏）
  const INITIAL_ITEMS = {
    scallion_seed: 5,
    ginger_seed: 3,
    chili_seed: 3,
    wheat_seed: 5,
    frost_chrysanthemum_seed: 2,
    firewood: 10,
    water: 20,
    feed: 10,
  }

  function init() {
    items.value = { ...INITIAL_ITEMS }
  }

  function getCount(itemId) {
    return items.value[itemId] || 0
  }

  function addItem(itemId, amount = 1) {
    if (!items.value[itemId]) items.value[itemId] = 0
    items.value[itemId] += amount
  }

  function removeItem(itemId, amount = 1) {
    if (!items.value[itemId] || items.value[itemId] < amount) return false
    items.value[itemId] -= amount
    if (items.value[itemId] <= 0) delete items.value[itemId]
    return true
  }

  function hasItem(itemId, amount = 1) {
    return (items.value[itemId] || 0) >= amount
  }

  // 按类型获取物品列表
  function getItemsByType(type) {
    return Object.entries(items.value)
      .filter(([id, count]) => count > 0 && ITEMS[id] && ITEMS[id].type === type)
      .map(([id, count]) => ({ ...ITEMS[id], itemId: id, count }))
  }

  // 获取所有非零物品
  const allItems = computed(() => {
    return Object.entries(items.value)
      .filter(([, count]) => count > 0)
      .map(([id, count]) => ({ ...ITEMS[id], itemId: id, count }))
  })

  // 金币
  const gold = ref(100)
  function addGold(amount) { gold.value += amount }
  function spendGold(amount) {
    if (gold.value < amount) return false
    gold.value -= amount
    return true
  }

  return {
    items, gold, allItems,
    init, getCount, addItem, removeItem, hasItem,
    getItemsByType, addGold, spendGold
  }
})
