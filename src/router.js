import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from './views/Dashboard.vue';
import Statistics from './views/Statistics.vue';

const routes = [
  { path: '/', component: Dashboard },
  { path: '/stats', component: Statistics },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;

