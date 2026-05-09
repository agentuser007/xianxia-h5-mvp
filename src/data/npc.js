/**
 * NPC顾客行为模型
 * 基于 设计大纲.txt 行62-67, 105
 */

// NPC顾客名称池
const NPC_NAMES = [
  '李逍遥', '赵灵儿', '林月如', '阿奴', '酒剑仙',
  '花无缺', '小鱼儿', '苏樱', '铁心兰', '江玉燕',
  '令狐冲', '任盈盈', '岳灵珊', '东方不败', '风清扬',
  '张无忌', '赵敏', '周芷若', '小昭', '殷离',
]

// NPC顾客模板
export function generateCustomer(menuDishIds) {
  const name = NPC_NAMES[Math.floor(Math.random() * NPC_NAMES.length)]
  // 从当前菜单中随机点一道菜
  const orderedDish = menuDishIds.length > 0
    ? menuDishIds[Math.floor(Math.random() * menuDishIds.length)]
    : null

  return {
    id: Date.now() + Math.random(),
    name,
    orderedDish,       // 点的菜品ID
    arriveShichen: -1, // 到达时辰（由store设置）
    patience: 4,       // 耐心：等4个时辰，超时扣除美誉
    waitKe: 0,         // 已等待的刻数
    served: false,     // 是否已上菜
    left: false,       // 是否已离开
    paid: 0,           // 支付金额
  }
}

// 顾客生成概率：每个时辰有概率来客
// 基础概率30%，菜单菜品越多概率越高
export function calcCustomerChance(menuDishCount) {
  return Math.min(0.3 + menuDishCount * 0.05, 0.8)
}

// 菜品售价计算（基础价格 × 成色倍率）
export function calcDishPrice(basePrice, quality) {
  const qualityMultiplier = 0.5 + (quality / 20) // 成色14时约1.2倍
  return Math.round(basePrice * qualityMultiplier)
}
