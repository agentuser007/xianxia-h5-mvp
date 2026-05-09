/**
 * 灶台烹饪 Store
 * 管理菜谱选择、食材搭配、制作进度、收获
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { RECIPES } from '../data/recipes.js'
import { ITEMS } from '../data/crops.js'
import { useInventoryStore } from './inventory.js'
import { useTimeStore } from './time.js'

// 灶台状态
export const STOVE_STATES = {
  IDLE: 'idle',         // 空闲
  COOKING: 'cooking',   // 烹饪中
  DONE: 'done',         // 制作完成待收获
}

export const useKitchenStore = defineStore('kitchen', () => {
  // 灶台列表（MVP: 2个灶台）
  const stoves = ref([
    { id: 0, state: STOVE_STATES.IDLE, recipeId: null, progress: 0, totalKe: 0, isPlayerOnly: false, savedRecipeId: null },
    { id: 1, state: STOVE_STATES.IDLE, recipeId: null, progress: 0, totalKe: 0, isPlayerOnly: false, savedRecipeId: null },
  ])

  // 当前打开的灶台ID（用于UI交互）
  const activeStoveId = ref(null)

  // 已解锁菜谱ID列表
  const unlockedRecipes = ref(['hongshaorou'])

  // 菜单（次日生效的菜品ID列表）
  const menuDishIds = ref(['hongshaorou'])
  const pendingMenuDishIds = ref(['hongshaorou']) // 待次日生效

  // 菜品美誉 { [dishId]: number }
  const dishReputation = ref({ hongshaorou: 0 })

  function init() {
    stoves.value.forEach(s => {
      s.state = STOVE_STATES.IDLE
      s.recipeId = null
      s.progress = 0
      s.totalKe = 0
    })
    unlockedRecipes.value = ['hongshaorou']
    menuDishIds.value = ['hongshaorou']
    pendingMenuDishIds.value = ['hongshaorou']
    dishReputation.value = { hongshaorou: 0 }
  }

  /** 选择菜谱到灶台 */
  function selectRecipe(stoveId, recipeId) {
    const stove = stoves.value[stoveId]
    if (!stove || stove.state !== STOVE_STATES.IDLE) return false
    stove.recipeId = recipeId
    return true
  }

  /** 开始制作 */
  function startCooking(stoveId) {
    const stove = stoves.value[stoveId]
    if (!stove || stove.state !== STOVE_STATES.IDLE || !stove.recipeId) return false

    const recipe = RECIPES[stove.recipeId]
    if (!recipe) return false

    const inv = useInventoryStore()

    // 检查并扣除所有食材
    for (const slot of recipe.slots) {
      if (!inv.hasItem(slot.acceptItems[0], slot.amount)) return false
    }
    for (const slot of recipe.slots) {
      inv.removeItem(slot.acceptItems[0], slot.amount)
    }

    // 记住上次菜谱，方便取消/收获后快速重选
    stove.savedRecipeId = stove.recipeId

    // 开始烹饪
    stove.state = STOVE_STATES.COOKING
    stove.progress = 0
    stove.totalKe = recipe.cookTime * 8 // cookTime时辰 × 8刻

    return true
  }

  /** 取消制作（返还一半食材） */
  function cancelCooking(stoveId) {
    const stove = stoves.value[stoveId]
    if (!stove || stove.state !== STOVE_STATES.COOKING) return

    const recipe = RECIPES[stove.recipeId]
    if (recipe) {
      const inv = useInventoryStore()
      for (const slot of recipe.slots) {
        inv.addItem(slot.acceptItems[0], Math.ceil(slot.amount / 2))
      }
    }

    stove.state = STOVE_STATES.IDLE
    stove.recipeId = stove.savedRecipeId || null
    stove.progress = 0
    stove.totalKe = 0
  }

  /** 收获成品 */
  function collectDish(stoveId) {
    const stove = stoves.value[stoveId]
    if (!stove || stove.state !== STOVE_STATES.DONE) return null

    const recipe = RECIPES[stove.recipeId]
    if (!recipe) return null

    const inv = useInventoryStore()
    inv.addItem(recipe.id, 1)

    // 更新美誉
    const quality = recipe.baseQuality
    if (!dishReputation.value[recipe.id]) dishReputation.value[recipe.id] = 0
    dishReputation.value[recipe.id] += quality

    const result = {
      dishId: recipe.id,
      dishName: recipe.name,
      quality,
    }

    stove.state = STOVE_STATES.IDLE
    stove.recipeId = stove.savedRecipeId || null
    stove.progress = 0
    stove.totalKe = 0

    return result
  }

  /** 每刻推进烹饪进度 */
  function tickCooking() {
    stoves.value.forEach(stove => {
      if (stove.state === STOVE_STATES.COOKING) {
        stove.progress++
        if (stove.progress >= stove.totalKe) {
          stove.state = STOVE_STATES.DONE
        }
      }
    })
  }

  /** 更新菜单（次日生效） */
  function updateMenu(newDishIds) {
    pendingMenuDishIds.value = [...newDishIds]
  }

  /** 日结算：菜单生效 */
  function processDayEnd() {
    menuDishIds.value = [...pendingMenuDishIds.value]
  }

  /** 获取灶台当前菜谱 */
  function getStoveRecipe(stoveId) {
    const stove = stoves.value[stoveId]
    if (!stove || !stove.recipeId) return null
    return RECIPES[stove.recipeId]
  }

  /** 检查灶台是否可开始制作（食材是否齐全） */
  function canCook(stoveId) {
    const stove = stoves.value[stoveId]
    if (!stove || !stove.recipeId) return false
    const recipe = RECIPES[stove.recipeId]
    if (!recipe) return false
    const inv = useInventoryStore()
    return recipe.slots.every(slot => inv.hasItem(slot.acceptItems[0], slot.amount))
  }

  const activeStove = computed(() => {
    if (activeStoveId.value === null) return null
    return stoves.value[activeStoveId.value]
  })

  return {
    stoves, activeStoveId, unlockedRecipes, menuDishIds,
    pendingMenuDishIds, dishReputation, activeStove,
    init, selectRecipe, startCooking, cancelCooking,
    collectDish, tickCooking, updateMenu, processDayEnd,
    getStoveRecipe, canCook
  }
})
