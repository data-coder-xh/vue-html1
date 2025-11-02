<template>
  <div class="app-shell">
    <header class="app-header">
      <div class="title-block">
        <h1>数据库可视化浏览器</h1>
        <p>浏览、管理并实时记录操作日志的轻量级平台</p>
      </div>
      <div class="connection-chip">
        <span class="chip-label">当前连接</span>
        <strong>{{ connectionLabel }}</strong>
      </div>
    </header>

    <TableBrowser />

    <footer class="app-footer">
      <span>数据库操作将自动写入日志表 logs。</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import TableBrowser from './components/TableBrowser.vue';

const connectionLabel = ref('root@localhost / test');

onMounted(async () => {
  try {
    const response = await fetch('/api/health');
    if (!response.ok) return;
    const data = await response.json();
    connectionLabel.value = `${data.user}@${data.host} / ${data.database}`;
  } catch (error) {
    console.warn('无法加载数据库信息', error);
  }
});
</script>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 32px clamp(24px, 6vw, 80px) 48px;
  box-sizing: border-box;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
  gap: 16px;
}

.title-block h1 {
  margin: 0;
  font-size: 28px;
  color: #1f2d3d;
}

.title-block p {
  margin: 8px 0 0;
  font-size: 15px;
  color: #5c6b7a;
}

.connection-chip {
  background: rgba(64, 158, 255, 0.12);
  color: #1f6fd5;
  padding: 12px 18px;
  border-radius: 16px;
  box-shadow: inset 0 0 0 1px rgba(64, 158, 255, 0.2);
  text-align: right;
}

.connection-chip .chip-label {
  display: block;
  font-size: 12px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #409eff;
}

.connection-chip strong {
  font-size: 15px;
}

.app-footer {
  margin-top: auto;
  text-align: center;
  color: #90a4c0;
  font-size: 13px;
  padding-top: 32px;
}

@media (max-width: 768px) {
  .app-shell {
    padding: 24px;
  }

  .app-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .connection-chip {
    align-self: stretch;
    text-align: left;
  }
}
</style>
