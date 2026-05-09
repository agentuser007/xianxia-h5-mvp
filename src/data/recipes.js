/**
 * 菜谱数据定义
 * 基于 设计大纲.txt 行108-165
 */

// 配方栏位类型
export const SLOT_TYPES = {
  MAIN: 'main',       // 主材
  SIDE: 'side',       // 配材
  SEASON: 'seasoning', // 调料
  MISC: 'misc'        // 杂项
}

// 菜谱定义
export const RECIPES = {
  hongshaorou: {
    id: 'hongshaorou',
    name: '红烧肉',
    desc: '鲜咸微辣的炖肉',
    tags: ['肉菜', '炖菜'],
    baseQuality: 14,
    cookTime: 3,  // 烹饪所需时辰数（简化）
    price: 50,
    slots: [
      // 主材
      { type: SLOT_TYPES.MAIN, label: '主材', required: true,  acceptItems: ['pork_item'], fixed: true, amount: 10 },
      // 配材
      { type: SLOT_TYPES.SIDE, label: '配材1', required: true, acceptItems: ['scallion_item'], fixed: true, amount: 1 },
      { type: SLOT_TYPES.SIDE, label: '配材2', required: true, acceptItems: ['ginger_item'],   fixed: true, amount: 1 },
      { type: SLOT_TYPES.SIDE, label: '配材3', required: true, acceptItems: ['chili_item'],    fixed: true, amount: 1 },
      // 调料
      { type: SLOT_TYPES.SEASON, label: '调料1', required: true, acceptItems: ['huadiao_wine'], fixed: true, amount: 1 },
      { type: SLOT_TYPES.SEASON, label: '调料2', required: true, acceptItems: ['soy_sauce'],    fixed: true, amount: 1 },
      { type: SLOT_TYPES.SEASON, label: '调料3', required: true, acceptItems: ['stock'],         fixed: true, amount: 2 },
      { type: SLOT_TYPES.SEASON, label: '调料4', required: true, acceptItems: ['spice'],         fixed: true, amount: 1 },
      // 杂项
      { type: SLOT_TYPES.MISC, label: '杂项1', required: true, acceptItems: ['water'],    fixed: true, amount: 1 },
      { type: SLOT_TYPES.MISC, label: '杂项2', required: true, acceptItems: ['firewood'], fixed: true, amount: 1 },
    ]
  }
}

// 晨练选项
export const MORNING_TRAININGS = [
  { id: 'strength',  name: '气力训练', desc: '提升力量经验', bonus: { strength: 10 } },
  { id: 'meditate',  name: '冥想训练', desc: '提升灵性经验', bonus: { spirit: 10 } },
  { id: 'stamina',   name: '体力训练', desc: '提升耐力经验', bonus: { stamina: 10 } },
  { id: 'agility',   name: '敏捷训练', desc: '提升敏捷经验', bonus: { agility: 10 } },
  { id: 'martial',   name: '武学训练', desc: '提升武学经验', bonus: { martial: 10 } },
]
