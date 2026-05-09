<template>
  <div class="farm-scene">
    <h3>🌾 田地</h3>

    <!-- 种子选择 -->
    <div class="seed-selector" v-if="selectedPlot !== null">
      <span>选择种子：</span>
      <button
        v-for="seed in seeds"
        :key="seed.itemId"
        class="seed-btn"
        :disabled="seed.count <= 0"
        @click="plantSeed(seed.itemId)"
      >
        {{ seed.name }}×{{ seed.count }}
      </button>
      <button class="cancel-btn" @click="selectedPlot = null">取消</button>
    </div>

    <!-- 地块网格 -->
    <div class="plot-grid">
      <div
        v-for="plot in farm.plots"
        :key="plot.id"
        :class="['plot', plotStateClass(plot)]"
        @click="onPlotClick(plot)"
      >
        <div class="plot-icon">{{ plotIcon(plot) }}</div>
        <div class="plot-label">{{ plotLabel(plot) }}</div>
        <div v-if="plot.watered" class="water-badge">💧</div>
      </div>
    </div>

    <!-- 操作提示 -->
    <div class="farm-tips">
      <p>
        💡 点击空地开垦 | 点击已开垦地选择种子播种 | 点击作物浇水 |
        点击成熟作物收获
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useFarmStore, PLOT_STATES } from "../stores/farm.js";
import { useInventoryStore } from "../stores/inventory.js";
import { useTimeStore } from "../stores/time.js";
import { CROPS, ITEMS } from "../data/crops.js";

const farm = useFarmStore();
const inv = useInventoryStore();
const time = useTimeStore();

const selectedPlot = ref(null);

// 背包中的种子列表
const seeds = computed(() => inv.getItemsByType("seed"));

function plotStateClass(plot) {
  return {
    [PLOT_STATES.EMPTY]: "plot-empty",
    [PLOT_STATES.TILLED]: "plot-tilled",
    [PLOT_STATES.PLANTED]: "plot-planted",
    [PLOT_STATES.GROWING]: "plot-growing",
    [PLOT_STATES.READY]: "plot-ready",
    [PLOT_STATES.WITHERED]: "plot-withered",
  }[plot.state];
}

function plotIcon(plot) {
  switch (plot.state) {
    case PLOT_STATES.EMPTY:
      return "🟫";
    case PLOT_STATES.TILLED:
      return "🟫";
    case PLOT_STATES.PLANTED:
      return "🌱";
    case PLOT_STATES.GROWING:
      return "🌿";
    case PLOT_STATES.READY:
      return "🌾";
    case PLOT_STATES.WITHERED:
      return "🥀";
    default:
      return "❓";
  }
}

function plotLabel(plot) {
  if (!plot.cropId) {
    return plot.state === PLOT_STATES.EMPTY ? "空地" : "已开垦";
  }
  const crop = CROPS[plot.cropId];
  if (!crop) return "";
  if (plot.state === PLOT_STATES.READY) return `${crop.name}✓`;
  return `${crop.name} ${plot.growDays}/${crop.growDays}天`;
}

function onPlotClick(plot) {
  switch (plot.state) {
    case PLOT_STATES.EMPTY:
      farm.till(plot.id);
      break;
    case PLOT_STATES.TILLED:
      selectedPlot.value = plot.id;
      break;
    case PLOT_STATES.PLANTED:
    case PLOT_STATES.GROWING:
      farm.water(plot.id);
      break;
    case PLOT_STATES.READY:
      const result = farm.harvest(plot.id);
      if (result) {
        alert(`收获 ${result.cropName} × ${result.amount}`);
      }
      break;
    case PLOT_STATES.WITHERED:
      farm.clearWithered(plot.id);
      break;
  }
}

function plantSeed(seedItemId) {
  if (selectedPlot.value === null) return;
  const success = farm.plant(selectedPlot.value, seedItemId);
  if (!success) {
    alert("无法种植：种子不足或当前季节不可种植");
  }
  selectedPlot.value = null;
}
</script>

<style scoped>
.farm-scene {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.farm-scene h3 {
  margin: 0;
  color: var(--accent2);
}
.seed-selector {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
  padding: 8px;
  background: var(--bg-card);
  border-radius: 8px;
  font-size: 0.85rem;
}
.seed-btn {
  padding: 4px 8px;
  background: var(--bg-light);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
}
.seed-btn:hover:not(:disabled) {
  background: var(--accent);
}
.cancel-btn {
  padding: 4px 8px;
  background: transparent;
  color: var(--text-dim);
  border: 1px solid var(--border);
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
}
.plot-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.plot {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  transition: transform 0.1s;
  border: 2px solid transparent;
}
.plot:hover {
  transform: scale(1.05);
}
.plot-empty {
  background: #3e2723;
  border-color: #5d4037;
}
.plot-tilled {
  background: #4e342e;
  border-color: #795548;
}
.plot-planted {
  background: #2e7d32;
  border-color: #4caf50;
}
.plot-growing {
  background: #388e3c;
  border-color: #66bb6a;
}
.plot-ready {
  background: #f57f17;
  border-color: #ffca28;
}
.plot-withered {
  background: #424242;
  border-color: #757575;
}
.plot-icon {
  font-size: 1.8rem;
}
.plot-label {
  font-size: 0.7rem;
  margin-top: 2px;
  color: var(--text);
}
.water-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  font-size: 0.7rem;
}
.farm-tips {
  font-size: 0.75rem;
  color: var(--text-dim);
  text-align: center;
}
</style>
