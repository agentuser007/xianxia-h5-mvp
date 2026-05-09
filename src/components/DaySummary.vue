<template>
  <div class="overlay">
    <div class="modal day-summary">
      <h2>📊 日结算</h2>
      <p class="day-label">第 {{ game.lastDayStats?.day || "?" }} 天结束</p>

      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-label">今日收入</span>
          <span class="stat-value"
            >💰 {{ game.lastDayStats?.income || 0 }}</span
          >
        </div>
        <div class="stat-item">
          <span class="stat-label">服务顾客</span>
          <span class="stat-value"
            >👥 {{ game.lastDayStats?.customersServed || 0 }}人</span
          >
        </div>
        <div class="stat-item">
          <span class="stat-label">流失顾客</span>
          <span class="stat-value stat-danger"
            >😞 {{ game.lastDayStats?.customersLost || 0 }}人</span
          >
        </div>
      </div>

      <div v-if="time.forcedSleep" class="penalty-notice">
        ⚠️ 强制睡觉惩罚：明日午时醒来，跳过晨练！
      </div>

      <button class="btn-primary" @click="game.closeDaySummary()">
        继续前往晨练 →
      </button>
    </div>
  </div>
</template>

<script setup>
import { useGameStore } from "../stores/game.js";
import { useTimeStore } from "../stores/time.js";

const game = useGameStore();
const time = useTimeStore();
</script>

<style scoped>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.modal {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 400px;
  border: 1px solid var(--border);
}
.day-summary h2 {
  margin: 0 0 8px;
  color: var(--accent2);
  text-align: center;
}
.day-label {
  text-align: center;
  color: var(--text-dim);
  margin: 0 0 16px;
}
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 16px;
}
.stat-item {
  background: var(--bg-light);
  padding: 10px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.stat-label {
  font-size: 0.75rem;
  color: var(--text-dim);
}
.stat-value {
  font-size: 1.1rem;
  font-weight: bold;
  color: var(--accent2);
}
.stat-danger {
  color: var(--danger);
}

.penalty-notice {
  background: rgba(244, 67, 54, 0.15);
  border: 1px solid var(--danger);
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 16px;
  font-size: 0.85rem;
  color: var(--danger);
  text-align: center;
}

.btn-primary {
  width: 100%;
  padding: 12px;
  font-size: 1rem;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
.btn-primary:hover {
  opacity: 0.85;
}
</style>
