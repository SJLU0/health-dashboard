<script setup>
// 子元件宣告有哪些資料入口
// defineProps(["title", "value", "unit"]);，這還沒有定義型別

defineProps({
  title: String,
  value: Number,
  unit: String,
});
</script>

<!--
 * SummaryCard
 *
 * 用途：顯示健康摘要資訊，比如睡眠時間、心率、步數
 *
 * 使用頁面：src/views/HomeView.vue
 -->
<template>
  <div class="rounded-xl bg-gray-200 border p-5">
    <div>{{ title }}</div>
    <div>
      <span>{{ value }}</span
      ><span>{{ unit }}</span>
    </div>
  </div>
</template>
