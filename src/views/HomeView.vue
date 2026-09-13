<script setup>
import SummaryCard from "../components/SummaryCard.vue";
</script>

<template>
  <main>
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <SummaryCard title="心率" :value="72" unit="BPM" />
      <SummaryCard title="步數" :value="6421" unit="步" />
      <SummaryCard title="睡眠" :value="7.2" unit="小時" />
      <SummaryCard title="壓力" :value="32" unit="" />
      <SummaryCard title="血氧" :value="98" unit="%" />
    </div>
  </main>
</template>
