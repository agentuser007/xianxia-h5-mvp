<template>
  <div class="overlay">
    <div class="modal morning-training">
      <h2>🌅 晨练计划</h2>
      <p class="training-desc">选择今日晨练项目，为新一天获取增益</p>

      <div v-if="time.forcedSleep" class="skip-notice">
        ⚠️ 昨日强制睡觉，跳过晨练，无法获得增益
      </div>

      <div v-else class="training-options">
        <button
          v-for="t in trainings"
          :key="t.id"
          :class="[
            'training-btn',
            { selected: game.selectedTraining === t.id },
          ]"
          @click="game.selectedTraining = t.id"
        >
          <span class="training-name">{{ t.name }}</span>
          <span class="training-desc">{{ t.desc }}</span>
        </button>
      </div>

      <button class="btn-primary" @click="game.confirmMorningTraining()">
        {{ time.forcedSleep ? "确认（无增益）" : "确认晨练，开始新一天" }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { useGameStore } from "../stores/game.js";
import { useTimeStore } from "../stores/time.js";
import { MORNING_TRAININGS } from "../data/recipes.js";

const game = useGameStore();
const time = useTimeStore();

const trainings = MORNING_TRAININGS;
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
.morning-training h2 {
  margin: 0 0 8px;
  color: var(--accent2);
  text-align: center;
}
.training-desc {
  text-align: center;
  color: var(--text-dim);
  margin: 0 0 16px;
  font-size: 0.85rem;
}
.skip-notice {
  background: rgba(244, 67, 54, 0.15);
  border: 1px solid var(--danger);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
  font-size: 0.85rem;
  color: var(--danger);
  text-align: center;
}
.training-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}
.training-btn {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 10px 14px;
  background: var(--bg-light);
  color: var(--text);
  border: 2px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}
.training-btn.selected {
  border-color: var(--accent2);
  background: rgba(245, 166, 35, 0.15);
}
.training-btn:hover {
  border-color: var(--accent2);
}
.training-name {
  font-weight: bold;
  font-size: 0.95rem;
}
.training-desc {
  font-size: 0.75rem;
  color: var(--text-dim);
  margin-top: 2px;
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
