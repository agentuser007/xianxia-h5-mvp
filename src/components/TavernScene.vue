<template>
  <div class="tavern-scene">
    <h3>🏠 客栈</h3>

    <!-- 今日统计 -->
    <div class="today-stats">
      <span>今日收入：💰{{ tavern.todayStats.income }}</span>
      <span>已服务：{{ tavern.todayStats.customersServed }}人</span>
      <span>流失：{{ tavern.todayStats.customersLost }}人</span>
    </div>

    <!-- 等待中的顾客 -->
    <div class="customer-section">
      <h4>👥 当前顾客</h4>
      <div v-if="tavern.waitingCustomers.length === 0" class="no-customers">
        暂无顾客，等待中...
      </div>
      <div v-else class="customer-list">
        <div
          v-for="customer in tavern.waitingCustomers"
          :key="customer.id"
          class="customer-card"
        >
          <div class="customer-info">
            <span class="customer-name">{{ customer.name }}</span>
            <span class="customer-order"
              >点了：{{ getDishName(customer.orderedDish) }}</span
            >
          </div>
          <div class="customer-patience">
            <div class="patience-bar">
              <div
                class="patience-fill"
                :style="{ width: patiencePercent(customer) + '%' }"
                :class="{ low: patiencePercent(customer) < 30 }"
              ></div>
            </div>
          </div>
          <button
            class="btn-serve"
            :disabled="!canServe(customer)"
            @click="serveCustomer(customer)"
          >
            {{ canServe(customer) ? "🍽️ 上菜" : "缺菜" }}
          </button>
        </div>
      </div>
    </div>

    <!-- 菜品库存 -->
    <div class="dish-stock">
      <h4>🍽️ 菜品库存</h4>
      <div class="dish-list">
        <div v-for="dish in dishItems" :key="dish.itemId" class="dish-item">
          {{ dish.name }} ×{{ dish.count }}
        </div>
        <div v-if="dishItems.length === 0" class="no-dish">
          暂无菜品，请先去灶台制作
        </div>
      </div>
    </div>

    <!-- 美誉 -->
    <div class="reputation">
      <h4>⭐ 菜品美誉</h4>
      <div class="rep-list">
        <span
          v-for="(val, key) in kitchen.dishReputation"
          :key="key"
          class="rep-tag"
        >
          {{ getDishName(key) }}：{{ val }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useTavernStore } from "../stores/tavern.js";
import { useKitchenStore } from "../stores/kitchen.js";
import { useInventoryStore } from "../stores/inventory.js";
import { RECIPES } from "../data/recipes.js";
import { ITEMS } from "../data/crops.js";
import { KE_PER_SHICHEN } from "../data/time.js";

const tavern = useTavernStore();
const kitchen = useKitchenStore();
const inv = useInventoryStore();

const dishItems = computed(() => inv.getItemsByType("dish"));

function getDishName(dishId) {
  return RECIPES[dishId]?.name || ITEMS[dishId]?.name || dishId;
}

function canServe(customer) {
  if (!customer.orderedDish) return false;
  return inv.hasItem(customer.orderedDish, 1);
}

function serveCustomer(customer) {
  const ok = tavern.serveDish(customer.id, customer.orderedDish);
  if (ok) {
    // 成功上菜
  } else {
    alert("上菜失败");
  }
}

function patiencePercent(customer) {
  const maxWait = customer.patience * 8; // 8刻/时辰
  const remaining = maxWait - customer.waitKe;
  return Math.max(0, Math.round((remaining / maxWait) * 100));
}
</script>

<style scoped>
.tavern-scene {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.tavern-scene h3 {
  margin: 0;
  color: var(--accent2);
}

.today-stats {
  display: flex;
  gap: 16px;
  padding: 8px;
  background: var(--bg-card);
  border-radius: 8px;
  font-size: 0.85rem;
}

.customer-section h4,
.dish-stock h4,
.reputation h4 {
  margin: 0 0 8px;
  font-size: 0.9rem;
  color: var(--accent2);
}

.no-customers,
.no-dish {
  font-size: 0.8rem;
  color: var(--text-dim);
  padding: 12px;
  text-align: center;
}

.customer-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.customer-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  background: var(--bg-card);
  border-radius: 8px;
  border: 1px solid var(--border);
}
.customer-info {
  display: flex;
  flex-direction: column;
  min-width: 80px;
}
.customer-name {
  font-weight: bold;
  font-size: 0.9rem;
}
.customer-order {
  font-size: 0.75rem;
  color: var(--text-dim);
}

.customer-patience {
  flex: 1;
}
.patience-bar {
  height: 6px;
  background: var(--bg-light);
  border-radius: 3px;
  overflow: hidden;
}
.patience-fill {
  height: 100%;
  background: var(--success);
  transition: width 0.5s;
}
.patience-fill.low {
  background: var(--danger);
}

.btn-serve {
  padding: 6px 12px;
  background: var(--success);
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  white-space: nowrap;
}
.btn-serve:disabled {
  background: var(--text-dim);
}

.dish-stock,
.reputation {
  background: var(--bg-card);
  border-radius: 8px;
  padding: 10px;
  border: 1px solid var(--border);
}
.dish-list {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.dish-item {
  background: var(--bg-light);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
}
.rep-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.rep-tag {
  font-size: 0.8rem;
  color: var(--accent2);
}
</style>
