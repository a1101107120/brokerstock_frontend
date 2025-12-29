<template>
  <div class="container mx-auto p-4">
    <h1 class="text-3xl font-bold mb-6">
      券商查看 - 
      <a v-if="stockNumber" :href="`https://fubon-ebrokerdj.fbs.com.tw/z/zc/zco/zco_${stockNumber}.djhtm`" target="_blank" class="text-blue-600 hover:underline">
        主力資訊-{{ stockNumber }}
      </a>
      <span v-else>主力資訊</span>
    </h1>
    
    <div class="flex gap-4 mb-8">
      <input 
        v-model="stockNumber" 
        type="text" 
        placeholder="輸入股票代碼 (例: 4960)" 
        class="border p-2 rounded w-64"
        @keyup.enter="fetchData"
      >
      <button 
        @click="fetchData" 
        class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        :disabled="loading"
      >
        {{ loading ? '搜尋中...' : '搜尋' }}
      </button>
      <router-link to="/stats" class="ml-auto text-blue-600 hover:underline self-center">查看統計數據</router-link>
    </div>

    <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {{ error }}
    </div>

    <div v-if="data" class="overflow-x-auto">
      <table class="min-w-full bg-white border border-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-2 border">券商名稱</th>
            <th class="px-4 py-2 border">個股明細</th>
            <th class="px-4 py-2 border">進出排行</th>
            <th class="px-4 py-2 border">分點進出</th>
            <th class="px-4 py-2 border">當日買進</th>
            <th class="px-4 py-2 border">當日賣出</th>
            <th class="px-4 py-2 border">歷史進出</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="broker in data.brokers_data" :key="broker.broker_name" class="hover:bg-gray-50">
            <td class="px-4 py-2 border font-medium">{{ broker.broker_name }}</td>
            <td class="px-4 py-2 border text-center">
              <a :href="broker.fubon_link" target="_blank" class="text-blue-500 hover:underline">查看-{{ stockNumber }}</a>
            </td>
            <td class="px-4 py-2 border text-center">
              <a :href="broker.fubon_ranking_link" target="_blank" class="text-blue-500 hover:underline">進出排行</a>
            </td>
            <td class="px-4 py-2 border text-center">
              <a :href="broker.histock_link" target="_blank" class="text-blue-500 hover:underline">分點進出</a>
            </td>
            <td class="px-4 py-2 border align-top">
              <div class="text-xs text-gray-500 mb-1">日期: {{ broker.date }}</div>
              <div v-for="item in broker.buy_data" :key="item.code" class="mb-1">
                <a :href="generateHistockLink(item.code, broker.stock_bno)" target="_blank" class="text-blue-600 hover:underline">
                  {{ item.name }} - <span class="text-red-600">({{ item.dif }})</span>
                </a>
              </div>
            </td>
            <td class="px-4 py-2 border align-top">
              <div class="text-xs text-gray-500 mb-1">日期: {{ broker.date }}</div>
              <div v-for="item in broker.sell_data" :key="item.code" class="mb-1">
                <a :href="generateHistockLink(item.code, broker.stock_bno)" target="_blank" class="text-blue-600 hover:underline">
                  {{ item.name }} - <span class="text-green-600">({{ item.dif }})</span>
                </a>
              </div>
            </td>
            <td class="px-4 py-2 border">
              <div class="flex flex-col gap-2">
                <button @click="fetchHistory(broker, 5)" class="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded">看5日</button>
                <button @click="fetchHistory(broker, 10)" class="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded">看10日</button>
                <button @click="fetchHistory(broker, 20)" class="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded">看20日</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- History Modal or Side Panel -->
    <div v-if="historyData" class="mt-8 p-6 bg-gray-50 rounded-lg border">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">{{ historyData.broker_name }} - 近{{ historyData.days }}日 ({{ historyData.date_range }})</h2>
        <button @click="historyData = null" class="text-gray-500 hover:text-gray-700">關閉</button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 class="font-bold mb-2 text-red-600">買進</h3>
          <table class="w-full text-sm">
            <thead class="bg-gray-100">
              <tr>
                <th class="p-1 border text-left">代碼</th>
                <th class="p-1 border">買進</th>
                <th class="p-1 border">賣出</th>
                <th class="p-1 border">差異</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in historyData.buy_data" :key="item.code">
                <td class="p-1 border"><a :href="item.histock_link" target="_blank" class="text-blue-500">{{ item.name }}</a></td>
                <td class="p-1 border text-center">{{ item.buy }}</td>
                <td class="p-1 border text-center">{{ item.sell }}</td>
                <td class="p-1 border text-center text-red-600 font-bold">{{ item.dif }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div>
          <h3 class="font-bold mb-2 text-green-600">賣出</h3>
          <table class="w-full text-sm">
            <thead class="bg-gray-100">
              <tr>
                <th class="p-1 border text-left">代碼</th>
                <th class="p-1 border">買進</th>
                <th class="p-1 border">賣出</th>
                <th class="p-1 border">差異</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in historyData.sell_data" :key="item.code">
                <td class="p-1 border"><a :href="item.histock_link" target="_blank" class="text-blue-500">{{ item.name }}</a></td>
                <td class="p-1 border text-center">{{ item.buy }}</td>
                <td class="p-1 border text-center">{{ item.sell }}</td>
                <td class="p-1 border text-center text-green-600 font-bold">{{ item.dif }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import api from '../api';

const stockNumber = ref('');
const data = ref(null);
const loading = ref(false);
const error = ref(null);
const historyData = ref(null);

const fetchData = async () => {
  if (!stockNumber.value) return;
  loading.value = true;
  error.value = null;
  try {
    const response = await api.get(`/crawler/live/?number=${stockNumber.value}`);
    data.value = response.data;
  } catch (err) {
    error.value = '抓取數據失敗，請檢查股票代碼是否正確。';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const fetchHistory = async (broker, days) => {
  try {
    const response = await api.get(`/crawler/history/`, {
      params: {
        a: broker.fbs_a,
        b: broker.fbs_b,
        mark: broker.stock_bno,
        name: broker.broker_name,
        days: days
      }
    });
    historyData.value = response.data;
    // Scroll to history
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
  } catch (err) {
    console.error(err);
    alert('抓取歷史數據失敗');
  }
};

const generateHistockLink = (code, bno) => {
  return `https://histock.tw/stock/brokertrace.aspx?bno=${bno}&no=${code}`;
};
</script>

