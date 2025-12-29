<template>
  <div class="container mx-auto px-2 sm:px-4 py-4">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
      <h1 class="text-2xl sm:text-3xl font-bold">統計數據</h1>
      <router-link to="/" class="text-blue-600 hover:underline font-medium">← 返回首頁</router-link>
    </div>

    <div v-if="loading" class="text-center py-20 bg-white rounded-lg shadow-sm border">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-4 text-gray-500">載入統計數據中...</p>
    </div>

    <div v-else-if="stats && stats.length > 0" class="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 border-r text-left text-xs font-medium text-gray-500 uppercase tracking-wider">代碼</th>
              <th class="px-4 py-3 border-r text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名稱</th>
              <th class="px-4 py-3 border-r text-right text-xs font-medium text-gray-500 uppercase tracking-wider">總買進</th>
              <th class="px-4 py-3 border-r text-right text-xs font-medium text-gray-500 uppercase tracking-wider">總賣出</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">買賣超</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="stat in stats" :key="stat.stock_code" class="hover:bg-gray-50 transition-colors">
              <td class="px-4 py-4 border-r font-mono text-sm">{{ stat.stock_code }}</td>
              <td class="px-4 py-4 border-r text-sm font-medium">{{ stat.stock_name || 'N/A' }}</td>
              <td class="px-4 py-4 border-r text-right text-sm font-mono">{{ stat.total_buy }}</td>
              <td class="px-4 py-4 border-r text-right text-sm font-mono">{{ stat.total_sell }}</td>
              <td class="px-4 py-4 text-right text-sm font-bold font-mono" :class="stat.total_net > 0 ? 'text-red-600' : 'text-green-600'">
                {{ stat.total_net > 0 ? '+' : '' }}{{ stat.total_net }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
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

