/**
 * 客栈经营 Store
 * 管理NPC顾客、上菜、收入
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { generateCustomer, calcCustomerChance, calcDishPrice } from '../data/npc.js'
import { RECIPES } from '../data/recipes.js'
import { ITEMS } from '../data/crops.js'
import { KE_PER_SHICHEN } from '../data/time.js'
import { useInventoryStore } from './inventory.js'
import { useKitchenStore } from './kitchen.js'
import { useTimeStore } from './time.js'

export const useTavernStore = defineStore('tavern', () => {
  // 当前在店顾客列表
  const customers = ref([])

  // 今日统计
  const todayStats = ref({
    customersServed: 0,
    customersLost: 0,
    income: 0,
    dishesServed: {},
  })

  function init() {
    customers.value = []
    todayStats.value = {
      customersServed: 0,
      customersLost: 0,
      income: 0,
      dishesServed: {},
    }
  }

  /** 每时辰判定：尝试生成新顾客 */
  function trySpawnCustomer() {
    const kitchen = useKitchenStore()
    const time = useTimeStore()

    if (kitchen.menuDishIds.length === 0) return

    const chance = calcCustomerChance(kitchen.menuDishIds.length)
    if (Math.random() < chance) {
      const customer = generateCustomer(kitchen.menuDishIds)
      customer.arriveShichen = time.shichenIndex
      customers.value.push(customer)
    }
  }

  /** 上菜给顾客 */
  function serveDish(customerId, dishId) {
    const inv = useInventoryStore()
    const kitchen = useKitchenStore()

    // 检查库存中是否有该菜品
    if (!inv.hasItem(dishId, 1)) return false

    const customer = customers.value.find(c => c.id === customerId)
    if (!customer || customer.served || customer.left) return false
    if (customer.orderedDish !== dishId) return false

    // 扣除菜品
    inv.removeItem(dishId, 1)

    // 计算收入
    const recipe = RECIPES[dishId]
    const price = recipe ? calcDishPrice(recipe.price, recipe.baseQuality) : 10

    customer.served = true
    customer.paid = price
    inv.addGold(price)

    // 统计
    todayStats.value.customersServed++
    todayStats.value.income += price
    if (!todayStats.value.dishesServed[dishId]) todayStats.value.dishesServed[dishId] = 0
    todayStats.value.dishesServed[dishId]++

    return true
  }

  /** 每刻推进：检查顾客等待超时 */
  function tickCustomers() {
    const kitchen = useKitchenStore()

    customers.value.forEach(customer => {
      customer.waitKe++

      if (customer.served || customer.left) return // skip patience check, but waitKe still increments

      // 超时判定（4时辰 = 32刻）
      if (customer.waitKe >= customer.patience * KE_PER_SHICHEN) {
        customer.left = true
        todayStats.value.customersLost++

        // 扣除美誉
        const recipe = RECIPES[customer.orderedDish]
        if (recipe && kitchen.dishReputation[recipe.id]) {
          kitchen.dishReputation[recipe.id] = Math.max(
            0,
            kitchen.dishReputation[recipe.id] - Math.round(recipe.baseQuality * 0.5)
          )
        }
      }
    })

    // 清理已服务的顾客（延迟移除，让玩家看到）
    customers.value = customers.value.filter(c => {
      if (c.served && c.waitKe > 8) return false // 服务后8刻离开
      if (c.left && c.waitKe > 4) return false // 离开的顾客4刻后消失
      return true
    })
  }

  /** 日结算：清理所有顾客 */
  function processDayEnd() {
    // 未服务的顾客算流失
    customers.value.forEach(c => {
      if (!c.served && !c.left) {
        todayStats.value.customersLost++
      }
    })
    customers.value = []
  }

  /** 重置今日统计 */
  function resetDailyStats() {
    todayStats.value = {
      customersServed: 0,
      customersLost: 0,
      income: 0,
      dishesServed: {},
    }
  }

  // 等待服务的顾客
  const waitingCustomers = computed(() =>
    customers.value.filter(c => !c.served && !c.left)
  )

  return {
    customers, todayStats, waitingCustomers,
    init, trySpawnCustomer, serveDish, tickCustomers,
    processDayEnd, resetDailyStats
  }
})
