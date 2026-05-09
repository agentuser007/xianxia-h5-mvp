/**
 * 作物与食材数据定义
 * 基于 设计大纲.txt 行174-228
 */

// 季节枚举（与time.js一致）
const SPRING = 0, SUMMER = 1, AUTUMN = 2, WINTER = 3, LA = 4

// 作物数据表
export const CROPS = {
  scallion: {
    id: 'scallion',
    name: '葱',
    seasons: [SPRING, SUMMER, AUTUMN],   // 春夏秋可种
    boostSeason: SUMMER,                  // 夏季增产
    growDays: 3,                          // 生长周期3天
    infinite: false,                      // 种一次收一次
    productId: 'scallion_item',           // 产出物品ID
    productAmount: 3,                     // 基础产出量
    seedPrice: 5,                         // 种子价格
    seedId: 'scallion_seed',
  },
  ginger: {
    id: 'ginger',
    name: '姜',
    seasons: [SPRING, SUMMER, AUTUMN],
    boostSeason: AUTUMN,
    growDays: 3,
    infinite: false,
    productId: 'ginger_item',
    productAmount: 3,
    seedPrice: 5,
    seedId: 'ginger_seed',
  },
  chili: {
    id: 'chili',
    name: '辣椒',
    seasons: [SPRING, SUMMER],
    boostSeason: SUMMER,
    growDays: 4,
    infinite: true,                       // 种一次无限收
    regrowDays: 3,                        // 收获后再次生长天数
    productId: 'chili_item',
    productAmount: 2,
    seedPrice: 8,
    seedId: 'chili_seed',
  },
  wheat: {
    id: 'wheat',
    name: '小麦',
    seasons: [SPRING, SUMMER, WINTER],
    boostSeason: SUMMER,
    growDays: 4,
    infinite: false,
    productId: 'wheat_item',
    productAmount: 5,
    seedPrice: 4,
    seedId: 'wheat_seed',
  },
  sweet_potato: {
    id: 'sweet_potato',
    name: '红薯',
    seasons: [AUTUMN, WINTER],
    boostSeason: AUTUMN,
    growDays: 5,
    infinite: false,
    productId: 'sweet_potato_item',
    productAmount: 4,
    seedPrice: 6,
    seedId: 'sweet_potato_seed',
  },
  sugarcane: {
    id: 'sugarcane',
    name: '甘蔗',
    seasons: [SPRING, AUTUMN],
    boostSeason: -1,
    growDays: 6,
    infinite: false,
    productId: 'sugarcane_item',
    productAmount: 3,
    seedPrice: 10,
    seedId: 'sugarcane_seed',
  },
  glutinous_rice: {
    id: 'glutinous_rice',
    name: '糯米',
    seasons: [SPRING, SUMMER],
    boostSeason: SUMMER,
    growDays: 3,
    infinite: false,
    productId: 'glutinous_rice_item',
    productAmount: 4,
    seedPrice: 6,
    seedId: 'glutinous_rice_seed',
  },
  frost_chrysanthemum: {
    id: 'frost_chrysanthemum',
    name: '灵霜菊',
    seasons: [LA],
    boostSeason: LA,
    growDays: 2,
    infinite: false,
    productId: 'frost_chrysanthemum_petals',
    productAmount: 3,
    seedPrice: 15,
    seedId: 'frost_chrysanthemum_seed',
  },
}

// 食材/物品定义
export const ITEMS = {
  // 作物产出
  scallion_item:    { id: 'scallion_item',    name: '葱',     type: 'vegetable', price: 3 },
  ginger_item:      { id: 'ginger_item',      name: '姜',     type: 'vegetable', price: 3 },
  chili_item:       { id: 'chili_item',       name: '辣椒',   type: 'vegetable', price: 4 },
  wheat_item:       { id: 'wheat_item',       name: '小麦',   type: 'grain',     price: 2 },
  sweet_potato_item:{ id: 'sweet_potato_item', name: '红薯',  type: 'grain',     price: 3 },
  sugarcane_item:   { id: 'sugarcane_item',   name: '甘蔗',   type: 'grain',     price: 5 },
  glutinous_rice_item: { id: 'glutinous_rice_item', name: '糯米', type: 'grain',  price: 4 },

  // 种子
  scallion_seed:     { id: 'scallion_seed',     name: '葱种子',     type: 'seed', price: 5,  cropId: 'scallion' },
  ginger_seed:       { id: 'ginger_seed',       name: '姜种子',     type: 'seed', price: 5,  cropId: 'ginger' },
  chili_seed:        { id: 'chili_seed',        name: '辣椒种子',   type: 'seed', price: 8,  cropId: 'chili' },
  wheat_seed:        { id: 'wheat_seed',        name: '小麦种子',   type: 'seed', price: 4,  cropId: 'wheat' },
  sweet_potato_seed: { id: 'sweet_potato_seed', name: '红薯种子',   type: 'seed', price: 6,  cropId: 'sweet_potato' },
  sugarcane_seed:    { id: 'sugarcane_seed',    name: '甘蔗种子',   type: 'seed', price: 10, cropId: 'sugarcane' },
  glutinous_rice_seed: { id: 'glutinous_rice_seed', name: '糯米种子', type: 'seed', price: 6, cropId: 'glutinous_rice' },
  frost_chrysanthemum_seed: { id: 'frost_chrysanthemum_seed', name: '灵霜菊种子', type: 'seed', price: 15, cropId: 'frost_chrysanthemum' },

  // 动物产出
  egg_item:      { id: 'egg_item',      name: '鸡蛋',  type: 'egg',    price: 3 },
  chicken_item:  { id: 'chicken_item',  name: '鸡肉',  type: 'meat',   price: 10 },
  pork_item:     { id: 'pork_item',     name: '猪肉',  type: 'meat',   price: 12 },
  pork_bone_item:{ id: 'pork_bone_item',name: '猪大骨', type: 'meat',  price: 8 },

  // 调料（MVP简化为直接购买）
  huadiao_wine:  { id: 'huadiao_wine',  name: '花雕酒', type: 'seasoning', price: 15 },
  soy_sauce:     { id: 'soy_sauce',     name: '酱油',   type: 'seasoning', price: 8 },
  stock:         { id: 'stock',         name: '高汤',   type: 'seasoning', price: 10 },
  spice:         { id: 'spice',         name: '香料',   type: 'seasoning', price: 6 },

  // 杂项
  water:         { id: 'water',         name: '水',     type: 'misc', price: 1 },
  firewood:      { id: 'firewood',      name: '柴火',   type: 'misc', price: 2 },
  feed:          { id: 'feed',          name: '饲料',   type: 'misc', price: 3 },

  // 菜品
  hongshaorou:   { id: 'hongshaorou',   name: '红烧肉', type: 'dish', price: 50 },

  // 灵霜菊产出
  frost_chrysanthemum_petals: { id: 'frost_chrysanthemum_petals', name: '灵霜菊瓣', type: 'vegetable', price: 40 },
}

// 种子物品ID列表（用于背包筛选）
export const SEED_IDS = Object.values(ITEMS)
  .filter(item => item.type === 'seed')
  .map(item => item.id)
