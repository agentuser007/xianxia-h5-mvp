<template>
  <div class="game-container">
    <!-- 标题画面 -->
    <div v-if="game.phase === 'title'" class="title-screen">
      <h1 class="title-text">仙侠客栈</h1>
      <p class="title-subtitle">云梦泽畔 · 经营物语</p>
      <button class="btn-primary" @click="game.newGame()">开始游戏</button>
    </div>

    <!-- 游戏主界面 -->
    <div v-else class="game-main">
      <!-- 顶部时间栏 -->
      <header class="time-bar">
        <div class="time-info">
          <span class="time-display">{{ time.timeDisplay }}</span>
          <span class="date-display">{{ time.dateDisplay }}</span>
        </div>
        <div class="resource-info">
          <span class="gold">💰 {{ inv.gold }}</span>
        </div>
        <button
          v-if="!time.dayEnded"
          class="btn-sleep"
          @click="game.goToSleep()"
        >
          🛏️ 休息
        </button>
      </header>

      <!-- 场景Tab -->
      <nav class="scene-tabs">
        <button
          v-for="tab in sceneTabs"
          :key="tab.id"
          :class="['tab-btn', { active: game.currentScene === tab.id }]"
          @click="game.switchScene(tab.id)"
        >
          {{ tab.label }}
        </button>
      </nav>

      <!-- 场景内容 -->
      <main class="scene-content">
        <FarmScene v-if="game.currentScene === 'farm'" />
        <KitchenScene v-if="game.currentScene === 'kitchen'" />
        <TavernScene v-if="game.currentScene === 'tavern'" />
      </main>

      <!-- 底部背包快捷栏 -->
      <footer class="bottom-bar">
        <div class="inventory-preview">
          <span
            v-for="item in inv.allItems.slice(0, 8)"
            :key="item.itemId"
            class="inv-item"
            :title="item.name"
          >
            {{ item.name }}×{{ item.count }}
          </span>
        </div>
      </footer>
    </div>

    <!-- 日结算弹窗 -->
    <DaySummary v-if="game.phase === 'day_summary'" />

    <!-- 晨练选择弹窗 -->
    <MorningTraining v-if="game.phase === 'morning_training'" />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from "vue";
import { useGameStore } from "./stores/game.js";
import { useTimeStore } from "./stores/time.js";
import { useInventoryStore } from "./stores/inventory.js";
import FarmScene from "./components/FarmScene.vue";
import KitchenScene from "./components/KitchenScene.vue";
import TavernScene from "./components/TavernScene.vue";
import DaySummary from "./components/DaySummary.vue";
import MorningTraining from "./components/MorningTraining.vue";
import { REAL_SECONDS_PER_KE } from "./data/time.js";

const game = useGameStore();
const time = useTimeStore();
const inv = useInventoryStore();

const sceneTabs = [
  { id: "farm", label: "🌾 田地" },
  { id: "kitchen", label: "🔥 灶台" },
  { id: "tavern", label: "🏠 客栈" },
];

// 游戏主循环
let gameLoop = null;

onMounted(() => {
  gameLoop = setInterval(() => {
    if (game.isPlaying) {
      game.onTick();
    }
  }, REAL_SECONDS_PER_KE * 1000);
});

onUnmounted(() => {
  if (gameLoop) clearInterval(gameLoop);
});
</script>

<style>
:root {
  --bg-dark: #1a1a2e;
  --bg-card: #16213e;
  --bg-light: #0f3460;
  --accent: #e94560;
  --accent2: #f5a623;
  --text: #eee;
  --text-dim: #aaa;
  --success: #4caf50;
  --warning: #ff9800;
  --danger: #f44336;
  --border: #333;
}

.game-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-dark);
  color: var(--text);
  overflow: hidden;
}

/* 标题画面 */
.title-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 16px;
}
.title-text {
  font-size: 3rem;
  color: var(--accent2);
  text-shadow: 0 0 20px rgba(245, 166, 35, 0.5);
}
.title-subtitle {
  font-size: 1.2rem;
  color: var(--text-dim);
  margin-bottom: 24px;
}

/* 按钮 */
.btn-primary {
  padding: 12px 32px;
  font-size: 1.1rem;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: opacity 0.2s;
}
.btn-primary:hover {
  opacity: 0.85;
}

.btn-sleep {
  padding: 6px 12px;
  background: var(--bg-light);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
}
.btn-sleep:hover {
  background: var(--accent);
}

/* 游戏主界面 */
.game-main {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* 时间栏 */
.time-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.time-info {
  display: flex;
  gap: 12px;
  align-items: center;
}
.time-display {
  font-size: 1.1rem;
  font-weight: bold;
  color: var(--accent2);
}
.date-display {
  font-size: 0.85rem;
  color: var(--text-dim);
}
.resource-info .gold {
  font-weight: bold;
  color: var(--accent2);
}

/* 场景Tab */
.scene-tabs {
  display: flex;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.tab-btn {
  flex: 1;
  padding: 10px;
  background: transparent;
  color: var(--text-dim);
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.2s;
}
.tab-btn.active {
  color: var(--accent2);
  border-bottom-color: var(--accent2);
  background: rgba(245, 166, 35, 0.1);
}

/* 场景内容 */
.scene-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

/* 底部栏 */
.bottom-bar {
  padding: 6px 12px;
  background: var(--bg-card);
  border-top: 1px solid var(--border);
  flex-shrink: 0;
}
.inventory-preview {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 0.75rem;
}
.inv-item {
  background: var(--bg-light);
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
}

/* 通用 */
button {
  font-family: inherit;
}
button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
