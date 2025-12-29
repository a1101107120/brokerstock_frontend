<template>
  <div class="container mx-auto p-4">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">統計數據</h1>
      <router-link to="/" class="text-blue-600 hover:underline">返回首頁</router-link>
    </div>

    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-4 text-gray-600">載入統計數據中...</p>
    </div>

    <div v-else-if="stats && stats.length > 0" class="overflow-x-auto">
      <table class="min-w-full bg-white border border-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 border text-left">股票代碼</th>
            <th class="px-6 py-3 border text-left">股票名稱</th>
            <th class="px-6 py-3 border text-right">總買進</th>
            <th class="px-6 py-3 border text-right">總賣出</th>
            <th class="px-6 py-3 border text-right">總買賣超</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="stat in stats" :key="stat.stock_code" class="hover:bg-gray-50">
            <td class="px-6 py-4 border font-mono">{{ stat.stock_code }}</td>
            <td class="px-6 py-4 border">{{ stat.stock_name || 'N/A' }}</td>
            <td class="px-6 py-4 border text-right">{{ stat.total_buy }}</td>
            <td class="px-6 py-4 border text-right">{{ stat.total_sell }}</td>
            <td class="px-6 py-4 border text-right font-bold" :class="stat.total_net > 0 ? 'text-red-600' : 'text-green-600'">
              {{ stat.total_net > 0 ? '+' : '' }}{{ stat.total_net }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
      <p class="text-gray-500 italic">目前尚無統計數據，請先由後端匯入或新增記錄。</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../api';

const stats = ref([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const response = await api.get('/records/stats/');
    stats.value = response.data;
  } catch (err) {
    console.error('Failed to fetch stats:', err);
  } finally {
    loading.value = false;
  }
});
</script>

