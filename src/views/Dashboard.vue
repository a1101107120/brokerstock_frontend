<template>
  <div class="w-full max-w-full px-2 sm:px-4 py-4">
    <h1 class="text-xl sm:text-3xl font-bold mb-6 break-words">
      券商查看
      <span v-if="stockNumber" class="block sm:inline text-gray-500 text-lg sm:text-2xl mt-1 sm:mt-0 sm:ml-2">
        - 
        <a :href="`https://fubon-ebrokerdj.fbs.com.tw/z/zc/zco/zco_${stockNumber}.djhtm`" target="_blank" class="text-blue-600 hover:underline">
          主力資訊-{{ stockNumber }}
        </a>
      </span>
      <span v-else class="block sm:inline text-gray-500 text-lg sm:text-2xl mt-1 sm:mt-0 sm:ml-2">- 主力資訊</span>
    </h1>
    
    <div class="flex flex-col sm:flex-row gap-4 mb-8">
      <div class="flex flex-1 gap-2 flex-wrap">
        <input 
          v-model="stockNumber" 
          type="text" 
          placeholder="股票代碼 (例: 4960)" 
          class="border p-2 rounded flex-1 sm:w-48 min-w-[120px]"
          @keyup.enter="fetchStockMainForceData"
        >
        <div class="flex gap-2 w-full sm:w-auto">
          <button 
            @click="fetchFollowedData" 
            class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition whitespace-nowrap flex-1"
            :disabled="loading"
          >
            {{ loading && searchType === 'followed' ? '搜尋中...' : '關注券商查詢' }}
          </button>
          <button 
            @click="fetchStockMainForceData" 
            class="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition whitespace-nowrap flex-1"
            :disabled="loading"
          >
            {{ loading && searchType === 'stockMainForce' ? '搜尋中...' : '股票主力' }}
          </button>
        </div>
      </div>
      <router-link to="/stats" class="text-blue-600 hover:underline self-center sm:ml-auto">查看統計數據</router-link>
    </div>

    <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {{ error }}
    </div>

    <!-- 股票主力結果 -->
    <div v-if="searchType === 'stockMainForce' && stockMainForceData" class="space-y-8">
      <div class="bg-white rounded-lg shadow border border-gray-200 p-4">
        <h2 class="text-xl font-bold mb-4 flex items-center">
          <span class="w-2 h-6 bg-orange-600 rounded-full mr-2"></span>
          股票主力總覽 - {{ stockMainForceData.stock_number }} ({{ stockMainForceData.date }})
        </h2>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- 買進排行 -->
          <div>
            <h3 class="font-bold mb-3 text-red-600">買超前 15 名</h3>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200 border">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">券商</th>
                    <th class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">買進</th>
                    <th class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">賣出</th>
                    <th class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">買超</th>
                    <th class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">佔比</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="item in stockMainForceData.buy_list" :key="item.name" class="hover:bg-gray-50">
                    <td class="px-3 py-2 text-sm font-medium">{{ item.name }}</td>
                    <td class="px-3 py-2 text-right text-xs font-mono">{{ item.buy }}</td>
                    <td class="px-3 py-2 text-right text-xs font-mono">{{ item.sell }}</td>
                    <td class="px-3 py-2 text-right text-sm font-bold font-mono text-red-600">+{{ item.net }}</td>
                    <td class="px-3 py-2 text-right text-xs text-gray-500">{{ item.percent }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 賣出排行 -->
          <div>
            <h3 class="font-bold mb-3 text-green-600">賣超前 15 名</h3>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200 border">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">券商</th>
                    <th class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">買進</th>
                    <th class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">賣出</th>
                    <th class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">賣超</th>
                    <th class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">佔比</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="item in stockMainForceData.sell_list" :key="item.name" class="hover:bg-gray-50">
                    <td class="px-3 py-2 text-sm font-medium">{{ item.name }}</td>
                    <td class="px-3 py-2 text-right text-xs font-mono">{{ item.buy }}</td>
                    <td class="px-3 py-2 text-right text-xs font-mono">{{ item.sell }}</td>
                    <td class="px-3 py-2 text-right text-sm font-bold font-mono text-green-600">{{ item.net }}</td>
                    <td class="px-3 py-2 text-right text-xs text-gray-500">{{ item.percent }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 關注券商查詢結果 (原本的 fetchData) -->
    <div v-if="searchType === 'followed' && data" class="bg-white rounded-lg shadow border border-gray-200">
      <div v-if="data.total_stats" class="p-4 bg-blue-50 border-b border-gray-200 flex flex-wrap gap-6 items-center">
        <div class="text-sm font-bold text-blue-800">所有關注券商對 {{ data.stock_number }} 統計：</div>
        <div class="flex gap-4 text-sm">
          <span class="text-red-600">總買進: <span class="font-mono">{{ data.total_stats.buy }}</span></span>
          <span class="text-green-600">總賣出: <span class="font-mono">{{ data.total_stats.sell }}</span></span>
          <span :class="data.total_stats.net.startsWith('+') ? 'text-red-600 font-bold' : 'text-green-600 font-bold'">
            總買賣超: <span class="font-mono">{{ data.total_stats.net }}</span>
          </span>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 table-auto">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-3 py-3 sticky left-0 bg-gray-50 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r min-w-[120px]">券商名稱</th>
              <th class="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r">個股明細</th>
              <th class="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r">進出排行</th>
              <th class="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r">分點進出</th>
              <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">當日買進</th>
              <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">當日賣出</th>
              <th class="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">歷史進出</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="broker in data.brokers_data" :key="broker.broker_name" class="hover:bg-gray-50 transition-colors">
              <td class="px-3 py-4 sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] text-sm font-bold text-gray-900 border-r min-w-[120px]">{{ broker.broker_name }}</td>
              <td class="px-3 py-4 whitespace-nowrap text-center text-sm border-r bg-white">
                <div v-if="broker.specific_stats" class="mb-2 text-[10px] leading-tight text-left inline-block bg-gray-50 p-1 rounded border border-gray-100 min-w-[80px]">
                  <div class="text-red-600">買: {{ broker.specific_stats.buy }}</div>
                  <div class="text-green-600">賣: {{ broker.specific_stats.sell }}</div>
                  <div :class="broker.specific_stats.net.startsWith('+') ? 'text-red-600 font-bold' : 'text-green-600 font-bold'" class="border-t border-gray-200 mt-1 pt-1">
                    超: {{ broker.specific_stats.net }}
                  </div>
                </div>
                <div class="mt-1">
                  <a :href="broker.fubon_link" target="_blank" class="text-blue-600 hover:text-blue-900 hover:underline">查看-{{ stockNumber }}</a>
                </div>
              </td>
              <td class="px-3 py-4 whitespace-nowrap text-center text-sm border-r">
                <a :href="broker.fubon_ranking_link" target="_blank" class="text-blue-600 hover:text-blue-900 hover:underline">排行</a>
              </td>
              <td class="px-3 py-4 whitespace-nowrap text-center text-sm border-r">
                <a :href="broker.histock_link" target="_blank" class="text-blue-600 hover:text-blue-900 hover:underline">分點</a>
              </td>
              <td class="px-3 py-4 text-sm border-r min-w-[150px]">
                <div class="text-[10px] text-gray-400 mb-1 font-mono">{{ broker.date }}</div>
                <div v-for="item in broker.buy_data" :key="item.code" class="mb-1 last:mb-0">
                  <a :href="generateHistockLink(item.code, broker.stock_bno)" target="_blank" class="text-blue-600 hover:underline inline-block leading-tight">
                    {{ item.name }} <span class="text-red-600 font-bold">{{ item.dif }}</span>
                  </a>
                </div>
              </td>
              <td class="px-3 py-4 text-sm border-r min-w-[150px]">
                <div class="text-[10px] text-gray-400 mb-1 font-mono">{{ broker.date }}</div>
                <div v-for="item in broker.sell_data" :key="item.code" class="mb-1 last:mb-0">
                  <a :href="generateHistockLink(item.code, broker.stock_bno)" target="_blank" class="text-blue-600 hover:underline inline-block leading-tight">
                    {{ item.name }} <span class="text-green-600 font-bold">{{ item.dif }}</span>
                  </a>
                </div>
              </td>
              <td class="px-3 py-4 whitespace-nowrap text-center text-sm">
                <div class="flex flex-col gap-1.5">
                  <button @click="fetchHistory(broker, 5)" class="text-[10px] bg-blue-50 text-blue-600 hover:bg-blue-100 px-2 py-1 rounded border border-blue-200">5日</button>
                  <button @click="fetchHistory(broker, 10)" class="text-[10px] bg-blue-50 text-blue-600 hover:bg-blue-100 px-2 py-1 rounded border border-blue-200">10日</button>
                  <button @click="fetchHistory(broker, 20)" class="text-[10px] bg-blue-50 text-blue-600 hover:bg-blue-100 px-2 py-1 rounded border border-blue-200">20日</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- History Modal or Side Panel -->
    <div v-if="historyData" class="mt-8 p-4 sm:p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-lg sm:text-xl font-bold text-gray-800">{{ historyData.broker_name }} - 近{{ historyData.days }}日</h2>
        <button @click="historyData = null" class="text-gray-400 hover:text-gray-600 p-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div class="mb-4 text-xs text-gray-500 bg-gray-50 p-2 rounded">日期範圍: {{ historyData.date_range }}</div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 class="font-bold mb-3 text-red-600 flex items-center">
            <span class="w-2 h-2 bg-red-600 rounded-full mr-2"></span> 買進排行
          </h3>
          <div class="overflow-x-auto">
            <table class="w-full text-sm divide-y divide-gray-200 border">
              <thead class="bg-gray-50">
                <tr>
                  <th class="p-2 text-left border-r">代碼</th>
                  <th class="p-2 text-right border-r">買</th>
                  <th class="p-2 text-right border-r">賣</th>
                  <th class="p-2 text-right">差額</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="item in historyData.buy_data" :key="item.code" class="hover:bg-gray-50">
                  <td class="p-2 border-r"><a :href="item.histock_link" target="_blank" class="text-blue-600 hover:underline font-medium">{{ item.name }}</a></td>
                  <td class="p-2 text-right border-r font-mono text-xs">{{ item.buy }}</td>
                  <td class="p-2 text-right border-r font-mono text-xs">{{ item.sell }}</td>
                  <td class="p-2 text-right text-red-600 font-bold font-mono">{{ item.dif }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <h3 class="font-bold mb-3 text-green-600 flex items-center">
            <span class="w-2 h-2 bg-green-600 rounded-full mr-2"></span> 賣出排行
          </h3>
          <div class="overflow-x-auto">
            <table class="w-full text-sm divide-y divide-gray-200 border">
              <thead class="bg-gray-50">
                <tr>
                  <th class="p-2 text-left border-r">代碼</th>
                  <th class="p-2 text-right border-r">買</th>
                  <th class="p-2 text-right border-r">賣</th>
                  <th class="p-2 text-right">差額</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="item in historyData.sell_data" :key="item.code" class="hover:bg-gray-50">
                  <td class="p-2 border-r"><a :href="item.histock_link" target="_blank" class="text-blue-600 hover:underline font-medium">{{ item.name }}</a></td>
                  <td class="p-2 text-right border-r font-mono text-xs">{{ item.buy }}</td>
                  <td class="p-2 text-right border-r font-mono text-xs">{{ item.sell }}</td>
                  <td class="p-2 text-right text-green-600 font-bold font-mono">{{ item.dif }}</td>
                </tr>
              </tbody>
            </table>
          </div>
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
const stockMainForceData = ref(null);
const loading = ref(false);
const error = ref(null);
const historyData = ref(null);
const searchType = ref(''); // 'followed', 'stockMainForce'

const fetchFollowedData = async () => {
  if (!stockNumber.value) return;
  loading.value = true;
  error.value = null;
  searchType.value = 'followed';
  try {
    const response = await api.get(`/crawler/live/?number=${stockNumber.value}`);
    data.value = response.data;
  } catch (err) {
    error.value = '抓取關注券商數據失敗。';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const fetchStockMainForceData = async () => {
  if (!stockNumber.value) return;
  loading.value = true;
  error.value = null;
  searchType.value = 'stockMainForce';
  try {
    const response = await api.get(`/crawler/stock-main-force/?number=${stockNumber.value}`);
    stockMainForceData.value = response.data;
  } catch (err) {
    error.value = '抓取股票主力數據失敗。';
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

