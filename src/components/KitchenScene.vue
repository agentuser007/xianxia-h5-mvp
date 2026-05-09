<template>
  <div class="kitchen-scene">
    <h3>🔥 灶台</h3>

    <!-- 灶台列表 -->
    <div class="stove-list">
      <div
        v-for="stove in kitchen.stoves"
        :key="stove.id"
        :class="['stove-card', { active: activeStoveId === stove.id }]"
        @click="activeStoveId = stove.id"
      >
        <div class="stove-header">
          <span>灶台 {{ stove.id + 1 }}</span>
          <span :class="['stove-state', stoveStateClass(stove)]">
            {{ stoveStateLabel(stove) }}
          </span>
        </div>

        <!-- 空闲：选择菜谱 -->
        <div v-if="stove.state === 'idle'" class="stove-body">
          <div class="recipe-list">
            <button
              v-for="rid in kitchen.unlockedRecipes"
              :key="rid"
              :class="['recipe-btn', { selected: stove.recipeId === rid }]"
              @click.stop="kitchen.selectRecipe(stove.id, rid)"
            >
              {{ getRecipeName(rid) }}
            </button>
          </div>
          <button
            v-if="stove.recipeId"
            class="btn-cook"
            :disabled="!stoveCanCook(stove.id)"
            @click.stop="startCook(stove.id)"
          >
            {{ stoveCanCook(stove.id) ? "🍳 开始制作" : "❌ 食材不足" }}
          </button>
        </div>

        <!-- 烹饪中：进度条 -->
        <div v-else-if="stove.state === 'cooking'" class="stove-body">
          <div class="cooking-info">
            正在制作：{{ getRecipeName(stove.recipeId) }}
          </div>
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: cookProgress(stove) + '%' }"
            ></div>
          </div>
          <button
            class="btn-cancel"
            @click.stop="kitchen.cancelCooking(stove.id)"
          >
            取消制作
          </button>
        </div>

        <!-- 完成：收获 -->
        <div v-else-if="stove.state === 'done'" class="stove-body">
          <div class="done-info">
            ✅ {{ getRecipeName(stove.recipeId) }} 制作完成！
          </div>
          <button class="btn-collect" @click.stop="collectDish(stove.id)">
            🍽️ 收获
          </button>
        </div>
      </div>
    </div>

    <!-- 菜谱详情 -->
    <div v-if="selectedRecipeDetail" class="recipe-detail">
      <h4>{{ selectedRecipeDetail.name }}</h4>
      <p class="recipe-desc">{{ selectedRecipeDetail.desc }}</p>
      <div class="recipe-slots">
        <div
          v-for="(slot, i) in selectedRecipeDetail.slots"
          :key="i"
          class="slot-row"
        >
          <span class="slot-label">{{ slot.label }}：</span>
          <span class="slot-item"
            >{{ getItemName(slot.acceptItems[0]) }} ×{{ slot.amount }}</span
          >
          <span :class="['slot-check', hasIngredient(slot) ? 'ok' : 'no']">
            {{ hasIngredient(slot) ? "✓" : "✗" }}
          </span>
        </div>
      </div>
    </div>

    <!-- 菜单编辑 -->
    <div class="menu-edit">
      <h4>📋 每日菜单（次日生效）</h4>
      <div class="menu-dishes">
        <button
          v-for="rid in kitchen.unlockedRecipes"
          :key="rid"
          :class="['menu-dish-tag', { active: pendingMenuIds.includes(rid) }]"
          @click="toggleMenuDish(rid)"
        >
          {{ getRecipeName(rid) }}
          {{ pendingMenuIds.includes(rid) ? "✓" : "" }}
        </button>
        <span v-if="kitchen.unlockedRecipes.length === 0" class="empty-menu">
          暂无解锁菜谱
        </span>
      </div>
      <div class="menu-current">
        <span class="menu-label">当前菜单：</span>
        <span
          v-for="did in kitchen.menuDishIds"
          :key="did"
          class="menu-dish-tag active"
        >
          {{ getRecipeName(did) }}
        </span>
        <span v-if="kitchen.menuDishIds.length === 0" class="empty-menu">
          菜单为空，不会有顾客来
        </span>
      </div>
      <button class="btn-confirm-menu" @click="confirmMenu">确认菜单</button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useKitchenStore, STOVE_STATES } from "../stores/kitchen.js";
import { useInventoryStore } from "../stores/inventory.js";
import { RECIPES } from "../data/recipes.js";
import { ITEMS } from "../data/crops.js";

const kitchen = useKitchenStore();
const inv = useInventoryStore();

// U-01: Active stove selection
const activeStoveId = ref(0);

const selectedRecipeDetail = computed(() => {
  const stove = kitchen.stoves.find((s) => s.id === activeStoveId.value);
  if (!stove?.recipeId) return null;
  return RECIPES[stove.recipeId] || null;
});

// U-02: Cache canCook result per stove
const stoveCanCookCache = ref({});
function stoveCanCook(stoveId) {
  if (!(stoveId in stoveCanCookCache.value)) {
    stoveCanCookCache.value[stoveId] = kitchen.canCook(stoveId);
  }
  return stoveCanCookCache.value[stoveId];
}

// L-06: Menu editing
const pendingMenuIds = ref([...kitchen.menuDishIds]);

function toggleMenuDish(rid) {
  const idx = pendingMenuIds.value.indexOf(rid);
  if (idx >= 0) {
    pendingMenuIds.value.splice(idx, 1);
  } else {
    pendingMenuIds.value.push(rid);
  }
}

function confirmMenu() {
  kitchen.updateMenu(pendingMenuIds.value);
}

function getRecipeName(rid) {
  return RECIPES[rid]?.name || rid;
}

function getItemName(itemId) {
  return ITEMS[itemId]?.name || itemId;
}

function hasIngredient(slot) {
  return inv.hasItem(slot.acceptItems[0], slot.amount);
}

function stoveStateClass(stove) {
  return {
    [STOVE_STATES.IDLE]: "state-idle",
    [STOVE_STATES.COOKING]: "state-cooking",
    [STOVE_STATES.DONE]: "state-done",
  }[stove.state];
}

function stoveStateLabel(stove) {
  return {
    [STOVE_STATES.IDLE]: "空闲",
    [STOVE_STATES.COOKING]: "烹饪中",
    [STOVE_STATES.DONE]: "已完成",
  }[stove.state];
}

function cookProgress(stove) {
  if (stove.totalKe <= 0) return 0;
  return Math.round((stove.progress / stove.totalKe) * 100);
}

function startCook(stoveId) {
  const ok = kitchen.startCooking(stoveId);
  if (!ok) {
    alert("食材不足，无法制作");
  }
}

function collectDish(stoveId) {
  const result = kitchen.collectDish(stoveId);
  if (result) {
    alert(`收获 ${result.dishName}，成色 ${result.quality}`);
  }
}
</script>

<style scoped>
.kitchen-scene {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.kitchen-scene h3 {
  margin: 0;
  color: var(--accent2);
}

.stove-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.stove-card {
  background: var(--bg-card);
  border-radius: 8px;
  padding: 10px;
  border: 2px solid var(--border);
  cursor: pointer;
  transition: border-color 0.2s;
}
.stove-card.active {
  border-color: var(--accent2);
}
.stove-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-weight: bold;
}
.state-idle {
  color: var(--text-dim);
}
.state-cooking {
  color: var(--warning);
}
.state-done {
  color: var(--success);
}

.stove-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.recipe-list {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.recipe-btn {
  padding: 6px 12px;
  background: var(--bg-light);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
}
.recipe-btn.selected {
  border-color: var(--accent2);
  background: rgba(245, 166, 35, 0.2);
}
.recipe-btn:hover {
  border-color: var(--accent2);
}

.btn-cook {
  padding: 8px;
  background: var(--success);
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
}
.btn-cook:disabled {
  background: var(--danger);
}
.btn-cancel {
  padding: 6px;
  background: transparent;
  color: var(--danger);
  border: 1px solid var(--danger);
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
}
.btn-collect {
  padding: 8px;
  background: var(--accent2);
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
}

.progress-bar {
  height: 8px;
  background: var(--bg-light);
  border-radius: 4px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: var(--accent2);
  transition: width 0.3s;
}

.cooking-info,
.done-info {
  font-size: 0.85rem;
  color: var(--text-dim);
}

.recipe-detail {
  background: var(--bg-card);
  border-radius: 8px;
  padding: 10px;
  border: 1px solid var(--border);
}
.recipe-detail h4 {
  margin: 0 0 6px;
  color: var(--accent2);
}
.recipe-desc {
  font-size: 0.8rem;
  color: var(--text-dim);
  margin: 0 0 8px;
}
.slot-row {
  display: flex;
  gap: 6px;
  font-size: 0.8rem;
  padding: 2px 0;
}
.slot-label {
  color: var(--text-dim);
  min-width: 50px;
}
.slot-check.ok {
  color: var(--success);
}
.slot-check.no {
  color: var(--danger);
}

.menu-edit {
  background: var(--bg-card);
  border-radius: 8px;
  padding: 10px;
  border: 1px solid var(--border);
}
.menu-edit h4 {
  margin: 0 0 8px;
  color: var(--accent2);
  font-size: 0.9rem;
}
.menu-dishes {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}
.menu-dish-tag {
  background: var(--bg-light);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  border: 1px solid var(--border);
  cursor: pointer;
  color: var(--text);
}
.menu-dish-tag.active {
  border-color: var(--accent2);
  background: rgba(245, 166, 35, 0.2);
}
.menu-current {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 8px;
}
.menu-label {
  font-size: 0.8rem;
  color: var(--text-dim);
}
.menu-current .menu-dish-tag {
  cursor: default;
}
.empty-menu {
  font-size: 0.8rem;
  color: var(--danger);
}
.btn-confirm-menu {
  padding: 8px 16px;
  background: var(--accent2);
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
}
.btn-confirm-menu:hover {
  opacity: 0.85;
}
</style>
