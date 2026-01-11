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
    
    <div class="flex flex-col gap-4 mb-8">
      <div class="flex flex-col sm:flex-row gap-3">
        <!-- 輸入框區塊 -->
        <div class="flex gap-2 flex-1">
          <input 
            v-model="stockNumber" 
            type="text" 
            placeholder="股票代碼" 
            class="border p-2.5 rounded-lg flex-1 min-w-[80px] text-sm shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
            @keyup.enter="fetchStockMainForceData"
          >
          <input 
            v-model="selectedDate" 
            type="date" 
            class="border p-2.5 rounded-lg flex-1 min-w-[130px] text-sm shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
        </div>
        <!-- 按鈕區塊 -->
        <div class="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-2 px-2 sm:mx-0 sm:px-0">
          <button 
            @click="fetchFollowedData" 
            class="bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-all whitespace-nowrap flex-1 text-xs font-bold shadow-sm active:scale-95"
            :disabled="loading"
          >
            {{ loading && searchType === 'followed' ? '搜尋中...' : '關注即時' }}
          </button>
          <button 
            @click="fetchDbFollowedData" 
            class="bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 transition-all whitespace-nowrap flex-1 text-xs font-bold shadow-sm active:scale-95"
            :disabled="loading"
          >
            {{ loading && searchType === 'dbFollowed' ? '搜尋中...' : '資料庫' }}
          </button>
          <button 
            @click="fetchStockMainForceData" 
            class="bg-orange-600 text-white px-4 py-2.5 rounded-lg hover:bg-orange-700 transition-all whitespace-nowrap flex-1 text-xs font-bold shadow-sm active:scale-95"
            :disabled="loading"
          >
            {{ loading && searchType === 'stockMainForce' ? '搜尋中...' : '股票主力' }}
          </button>
        </div>
      </div>
      <div class="flex justify-between items-center px-1">
        <router-link to="/stats" class="text-xs text-blue-600 hover:underline font-bold bg-blue-50 px-3 py-1.5 rounded-full">查看統計報表 →</router-link>
      </div>
    </div>

    <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {{ error }}
    </div>

    <!-- 股票主力結果 -->
    <div v-if="searchType === 'stockMainForce' && stockMainForceData" class="space-y-6 sm:space-y-8">
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
          <h2 class="text-lg sm:text-xl font-bold flex items-center">
            <span class="w-2 h-6 bg-orange-600 rounded-full mr-2"></span>
            股票主力總覽 - {{ stockMainForceData.stock_number }}
          </h2>
          <span class="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full font-mono">{{ stockMainForceData.date }}</span>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <!-- 買進排行 -->
          <div>
            <h3 class="font-bold mb-4 text-red-600 flex items-center text-sm sm:text-base border-b border-red-50 pb-2">
              <span class="mr-2">🔥</span> 買超前 15 名
            </h3>
            <div class="overflow-x-auto rounded-lg border border-gray-50">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-3 py-2.5 text-left text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">券商</th>
                    <th class="px-3 py-2.5 text-right text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">買/賣</th>
                    <th class="px-3 py-2.5 text-right text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">買超</th>
                    <th class="px-3 py-2.5 text-right text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">佔比</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-100">
                  <tr v-for="item in stockMainForceData.buy_list" :key="item.name" class="hover:bg-red-50/30 transition-colors">
                    <td class="px-3 py-3 text-xs font-bold text-gray-800">{{ item.name }}</td>
                    <td class="px-3 py-3 text-right font-mono text-[10px] leading-tight text-gray-500">
                      <div>{{ item.buy }}</div>
                      <div>{{ item.sell }}</div>
                    </td>
                    <td class="px-3 py-3 text-right text-sm font-bold font-mono text-red-600">+{{ item.net }}</td>
                    <td class="px-3 py-3 text-right text-[10px] text-gray-400 font-mono">{{ item.percent }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 賣出排行 -->
          <div>
            <h3 class="font-bold mb-4 text-green-600 flex items-center text-sm sm:text-base border-b border-green-50 pb-2">
              <span class="mr-2">🧊</span> 賣超前 15 名
            </h3>
            <div class="overflow-x-auto rounded-lg border border-gray-50">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-3 py-2.5 text-left text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">券商</th>
                    <th class="px-3 py-2.5 text-right text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">買/賣</th>
                    <th class="px-3 py-2.5 text-right text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">賣超</th>
                    <th class="px-3 py-2.5 text-right text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">佔比</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-100">
                  <tr v-for="item in stockMainForceData.sell_list" :key="item.name" class="hover:bg-green-50/30 transition-colors">
                    <td class="px-3 py-3 text-xs font-bold text-gray-800">{{ item.name }}</td>
                    <td class="px-3 py-3 text-right font-mono text-[10px] leading-tight text-gray-500">
                      <div>{{ item.buy }}</div>
                      <div>{{ item.sell }}</div>
                    </td>
                    <td class="px-3 py-3 text-right text-sm font-bold font-mono text-green-600">{{ item.net }}</td>
                    <td class="px-3 py-3 text-right text-[10px] text-gray-400 font-mono">{{ item.percent }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="(searchType === 'followed' || searchType === 'dbFollowed') && data" class="bg-transparent sm:bg-white rounded-lg sm:shadow sm:border sm:border-gray-200 overflow-hidden">
      <!-- 標頭資訊 -->
      <div class="p-4 bg-gray-50 border-b border-gray-200 hidden sm:flex justify-between items-center">
        <span class="text-sm font-bold text-gray-700">
          資料來源: {{ searchType === 'dbFollowed' ? '資料庫紀錄' : '即時爬蟲' }} 
          <span class="ml-2 text-gray-500">({{ data.stock_number || '總表' }})</span>
        </span>
        <span v-if="searchType === 'dbFollowed'" class="text-xs text-blue-600 font-medium">日期: {{ selectedDate }}</span>
      </div>

      <!-- 手機版標頭與統計 -->
      <div class="sm:hidden mb-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div class="flex justify-between items-center mb-3">
          <span class="text-sm font-bold text-gray-800">
            {{ searchType === 'dbFollowed' ? '資料庫' : '即時' }} - {{ data.stock_number || '總表' }}
          </span>
          <span class="text-[10px] text-gray-500">{{ selectedDate }}</span>
        </div>
        <div v-if="data.total_stats" class="grid grid-cols-3 gap-2 text-center border-t pt-3">
          <div class="flex flex-col">
            <span class="text-[10px] text-gray-400">總買進</span>
            <span class="text-sm font-bold text-red-600">{{ data.total_stats.buy }}</span>
          </div>
          <div class="flex flex-col">
            <span class="text-[10px] text-gray-400">總賣出</span>
            <span class="text-sm font-bold text-green-600">{{ data.total_stats.sell }}</span>
          </div>
          <div class="flex flex-col">
            <span class="text-[10px] text-gray-400">總買賣超</span>
            <span :class="data.total_stats.net.startsWith('+') ? 'text-red-600' : 'text-green-600'" class="text-sm font-bold">
              {{ data.total_stats.net }}
            </span>
          </div>
        </div>
      </div>

      <!-- 桌面版統計 (原本的樣式) -->
      <div v-if="data.total_stats" class="hidden sm:flex p-3 sm:p-4 bg-blue-50 border-b border-gray-200 flex-wrap gap-3 sm:gap-6 items-center">
        <div class="text-xs sm:text-sm font-bold text-blue-800 w-full sm:w-auto">關注券商對 {{ data.stock_number }} 統計：</div>
        <div class="flex gap-3 sm:gap-4 text-xs sm:text-sm">
          <span class="text-red-600 whitespace-nowrap">買: <span class="font-mono">{{ data.total_stats.buy }}</span></span>
          <span class="text-green-600 whitespace-nowrap">賣: <span class="font-mono">{{ data.total_stats.sell }}</span></span>
          <span :class="data.total_stats.net.startsWith('+') ? 'text-red-600 font-bold' : 'text-green-600 font-bold'" class="whitespace-nowrap">
            超: <span class="font-mono">{{ data.total_stats.net }}</span>
          </span>
        </div>
      </div>

      <!-- 手機版卡片列表 (sm:hidden) -->
      <div class="sm:hidden space-y-4">
        <div v-for="broker in data.brokers_data" :key="broker.broker_name" class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div class="flex justify-between items-start mb-4">
            <h3 class="font-bold text-gray-900 text-base">{{ broker.broker_name }}</h3>
            <div class="flex gap-2">
              <a :href="broker.fubon_link" target="_blank" class="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded">明細</a>
              <a :href="broker.fubon_ranking_link" target="_blank" class="text-[10px] bg-gray-50 text-gray-600 px-2 py-1 rounded">排行</a>
              <a :href="broker.histock_link" target="_blank" class="text-[10px] bg-gray-50 text-gray-600 px-2 py-1 rounded">分點</a>
            </div>
          </div>

          <!-- 個股明細統計卡片 -->
          <div v-if="broker.specific_stats" class="bg-gray-50 rounded-lg p-3 mb-4 flex justify-between items-center">
            <span class="text-xs font-medium text-gray-500">{{ stockNumber }} 進出</span>
            <div class="flex gap-4">
              <div class="text-center">
                <div class="text-[10px] text-gray-400">買</div>
                <div class="text-xs font-mono text-red-600">{{ broker.specific_stats.buy }}</div>
              </div>
              <div class="text-center">
                <div class="text-[10px] text-gray-400">賣</div>
                <div class="text-xs font-mono text-green-600">{{ broker.specific_stats.sell }}</div>
              </div>
              <div class="text-center">
                <div class="text-[10px] text-gray-400">超</div>
                <div :class="broker.specific_stats.net.startsWith('+') ? 'text-red-600 font-bold' : 'text-green-600 font-bold'" class="text-xs font-mono">
                  {{ broker.specific_stats.net }}
                </div>
              </div>
            </div>
          </div>

          <!-- 買賣清單 -->
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div class="border-r pr-2">
              <div class="text-[10px] font-bold text-red-600 mb-2 border-b pb-1">當日買進</div>
              <div v-for="item in broker.buy_data" :key="item.code" class="mb-1 text-[11px]">
                <a :href="generateHistockLink(item.code, broker.stock_bno)" target="_blank" class="text-blue-600 hover:underline">
                  {{ item.name }} <span class="font-bold font-mono text-red-600">{{ item.dif }}</span>
                </a>
              </div>
            </div>
            <div class="pl-2">
              <div class="text-[10px] font-bold text-green-600 mb-2 border-b pb-1">當日賣出</div>
              <div v-for="item in broker.sell_data" :key="item.code" class="mb-1 text-[11px]">
                <a :href="generateHistockLink(item.code, broker.stock_bno)" target="_blank" class="text-blue-600 hover:underline">
                  {{ item.name }} <span class="font-bold font-mono text-green-600">{{ item.dif }}</span>
                </a>
              </div>
            </div>
          </div>

          <!-- 歷史查詢 -->
          <div class="flex gap-2 pt-3 border-t">
            <span class="text-[10px] text-gray-400 self-center">歷史:</span>
            <button @click="fetchHistory(broker, 5)" class="flex-1 text-[10px] border border-blue-200 text-blue-600 py-1 rounded">5日</button>
            <button @click="fetchHistory(broker, 10)" class="flex-1 text-[10px] border border-blue-200 text-blue-600 py-1 rounded">10日</button>
            <button @click="fetchHistory(broker, 20)" class="flex-1 text-[10px] border border-blue-200 text-blue-600 py-1 rounded">20日</button>
          </div>
        </div>
      </div>

      <!-- 桌面版表格 (hidden sm:block) -->
      <div class="hidden sm:block overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 table-fixed sm:table-auto">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-2 sm:px-3 py-3 sticky left-0 bg-gray-50 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider border-r w-[80px] sm:w-auto min-w-[80px] sm:min-w-[120px]">券商名稱</th>
              <th class="px-2 sm:px-3 py-3 text-center text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider border-r min-w-[80px]">個股明細</th>
              <th class="px-2 sm:px-3 py-3 text-center text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider border-r min-w-[60px]">排行</th>
              <th class="px-2 sm:px-3 py-3 text-center text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider border-r min-w-[60px]">分點</th>
              <th class="px-2 sm:px-3 py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider border-r min-w-[120px]">當日買進</th>
              <th class="px-2 sm:px-3 py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider border-r min-w-[120px]">當日賣出</th>
              <th class="px-2 sm:px-3 py-3 text-center text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[60px]">歷史</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="broker in data.brokers_data" :key="broker.broker_name" class="hover:bg-gray-50 transition-colors">
              <td class="px-2 sm:px-3 py-4 sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] text-xs sm:text-sm font-bold text-gray-900 border-r w-[80px] sm:w-auto min-w-[80px] sm:min-w-[120px] break-words">{{ broker.broker_name }}</td>
              <td class="px-2 sm:px-3 py-4 whitespace-nowrap text-center text-xs sm:text-sm border-r bg-white">
                <div v-if="broker.specific_stats" class="mb-2 text-[9px] sm:text-[10px] leading-tight text-left inline-block bg-gray-50 p-1 rounded border border-gray-100 min-w-[70px] sm:min-w-[80px]">
                  <div class="text-red-600">買: {{ broker.specific_stats.buy }}</div>
                  <div class="text-green-600">賣: {{ broker.specific_stats.sell }}</div>
                  <div :class="broker.specific_stats.net.startsWith('+') ? 'text-red-600 font-bold' : 'text-green-600 font-bold'" class="border-t border-gray-200 mt-1 pt-1">
                    超: {{ broker.specific_stats.net }}
                  </div>
                </div>
                <div class="mt-1">
                  <a :href="broker.fubon_link" target="_blank" class="text-blue-600 hover:text-blue-900 hover:underline text-[10px] sm:text-xs">明細-{{ stockNumber }}</a>
                </div>
              </td>
              <td class="px-2 sm:px-3 py-4 whitespace-nowrap text-center text-xs sm:text-sm border-r">
                <a :href="broker.fubon_ranking_link" target="_blank" class="text-blue-600 hover:text-blue-900 hover:underline">排行</a>
              </td>
              <td class="px-2 sm:px-3 py-4 whitespace-nowrap text-center text-sm border-r">
                <a :href="broker.histock_link" target="_blank" class="text-blue-600 hover:text-blue-900 hover:underline">分點</a>
              </td>
              <td class="px-2 sm:px-3 py-4 text-xs sm:text-sm border-r min-w-[120px] sm:min-w-[150px]">
                <div class="text-[9px] sm:text-[10px] text-gray-400 mb-1 font-mono">{{ broker.date }}</div>
                <div v-for="item in broker.buy_data" :key="item.code" class="mb-1 last:mb-0">
                  <a :href="generateHistockLink(item.code, broker.stock_bno)" target="_blank" class="text-blue-600 hover:underline inline-block leading-tight text-[10px] sm:text-xs">
                    {{ item.name }} <span class="text-red-600 font-bold">{{ item.dif }}</span>
                  </a>
                </div>
              </td>
              <td class="px-2 sm:px-3 py-4 text-xs sm:text-sm border-r min-w-[120px] sm:min-w-[150px]">
                <div class="text-[9px] sm:text-[10px] text-gray-400 mb-1 font-mono">{{ broker.date }}</div>
                <div v-for="item in broker.sell_data" :key="item.code" class="mb-1 last:mb-0">
                  <a :href="generateHistockLink(item.code, broker.stock_bno)" target="_blank" class="text-blue-600 hover:underline inline-block leading-tight text-[10px] sm:text-xs">
                    {{ item.name }} <span class="text-green-600 font-bold">{{ item.dif }}</span>
                  </a>
                </div>
              </td>
              <td class="px-2 sm:px-3 py-4 whitespace-nowrap text-center text-xs sm:text-sm">
                <div class="flex flex-col gap-1 sm:gap-1.5">
                  <button @click="fetchHistory(broker, 5)" class="text-[9px] sm:text-[10px] bg-blue-50 text-blue-600 hover:bg-blue-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded border border-blue-200">5日</button>
                  <button @click="fetchHistory(broker, 10)" class="text-[9px] sm:text-[10px] bg-blue-50 text-blue-600 hover:bg-blue-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded border border-blue-200">10日</button>
                  <button @click="fetchHistory(broker, 20)" class="text-[9px] sm:text-[10px] bg-blue-50 text-blue-600 hover:bg-blue-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded border border-blue-200">20日</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- History Modal or Side Panel -->
    <div v-if="historyData" class="mt-8 p-4 sm:p-6 bg-white rounded-xl shadow-md border border-gray-100">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-lg sm:text-xl font-bold text-gray-800">{{ historyData.broker_name }}</h2>
          <div class="text-[10px] sm:text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded inline-block mt-1">近 {{ historyData.days }} 日 ({{ historyData.date_range }})</div>
        </div>
        <button @click="historyData = null" class="text-gray-400 hover:text-gray-600 p-2 bg-gray-50 rounded-full active:scale-90 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <!-- 買進排行 -->
        <div>
          <h3 class="font-bold mb-3 text-red-600 flex items-center text-sm sm:text-base">
            <span class="w-2 h-2 bg-red-600 rounded-full mr-2"></span> 買進排行
          </h3>
          <div class="overflow-x-auto rounded-lg border border-gray-100">
            <table class="w-full text-xs sm:text-sm divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="p-2 text-left border-r font-medium">代碼</th>
                  <th class="p-2 text-right border-r font-medium">買/賣</th>
                  <th class="p-2 text-right font-medium">差額</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white">
                <tr v-for="item in historyData.buy_data" :key="item.code" class="hover:bg-gray-50">
                  <td class="p-2 border-r">
                    <a :href="item.histock_link" target="_blank" class="text-blue-600 hover:underline font-bold">{{ item.name }}</a>
                  </td>
                  <td class="p-2 text-right border-r font-mono text-[10px] sm:text-xs leading-tight">
                    <div class="text-red-600">{{ item.buy }}</div>
                    <div class="text-green-600">{{ item.sell }}</div>
                  </td>
                  <td class="p-2 text-right text-red-600 font-bold font-mono text-sm">{{ item.dif }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 賣出排行 -->
        <div>
          <h3 class="font-bold mb-3 text-green-600 flex items-center text-sm sm:text-base">
            <span class="w-2 h-2 bg-green-600 rounded-full mr-2"></span> 賣出排行
          </h3>
          <div class="overflow-x-auto rounded-lg border border-gray-100">
            <table class="w-full text-xs sm:text-sm divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="p-2 text-left border-r font-medium">代碼</th>
                  <th class="p-2 text-right border-r font-medium">買/賣</th>
                  <th class="p-2 text-right font-medium">差額</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white">
                <tr v-for="item in historyData.sell_data" :key="item.code" class="hover:bg-gray-50">
                  <td class="p-2 border-r">
                    <a :href="item.histock_link" target="_blank" class="text-blue-600 hover:underline font-bold">{{ item.name }}</a>
                  </td>
                  <td class="p-2 text-right border-r font-mono text-[10px] sm:text-xs leading-tight">
                    <div class="text-red-600">{{ item.buy }}</div>
                    <div class="text-green-600">{{ item.sell }}</div>
                  </td>
                  <td class="p-2 text-right text-green-600 font-bold font-mono text-sm">{{ item.dif }}</td>
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

const stockNumber = ref('2330');
const selectedDate = ref(new Date().toISOString().split('T')[0]);
const data = ref(null);
const stockMainForceData = ref(null);
const loading = ref(false);
const error = ref(null);
const historyData = ref(null);
const searchType = ref(''); // 'followed', 'dbFollowed', 'stockMainForce'

import { onMounted } from 'vue';

onMounted(() => {
  fetchStockMainForceData();
});

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

const fetchDbFollowedData = async () => {
  if (!stockNumber.value) return;
  loading.value = true;
  error.value = null;
  searchType.value = 'dbFollowed';
  try {
    const response = await api.get(`/crawler/db-live/`, {
      params: {
        number: stockNumber.value,
        date: selectedDate.value
      }
    });
    data.value = response.data;
  } catch (err) {
    error.value = '抓取資料庫數據失敗，請確認該日期是否有存檔。';
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
    const response = await api.get(`/crawler/stock-main-force/`, {
      params: {
        number: stockNumber.value,
        date: selectedDate.value
      }
    });
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

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>

