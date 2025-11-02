<template>
  <div class="browser-layout">
    <el-card class="tables-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">数据表</span>
          <el-button size="small" type="primary" text @click="refreshTables">
            刷新
          </el-button>
        </div>
      </template>
      <el-menu
        v-if="tables.length"
        :default-active="selectedTable"
        class="table-menu"
        @select="handleSelectTable"
      >
        <el-menu-item v-for="table in tables" :key="table" :index="table">
          <span>{{ table }}</span>
        </el-menu-item>
      </el-menu>
      <el-empty v-else description="暂无数据表" />
    </el-card>

    <el-card class="table-card" v-loading="tableLoading">
      <template #header>
        <div class="card-header">
          <div>
            <h2 v-if="selectedTable" class="table-title">{{ selectedTable }}</h2>
            <p v-if="selectedTable" class="table-subtitle">
              共 {{ rows.length }} 条记录 · 主键字段：
              <strong>{{ primaryKey || '未检测到' }}</strong>
            </p>
            <p v-else class="table-placeholder">请选择左侧数据表</p>
          </div>
          <div class="toolbar" v-if="selectedTable">
            <el-button type="primary" @click="openCreateDialog" :disabled="!columns.length">
              新增记录
            </el-button>
            <el-button @click="refreshCurrentTable" :disabled="!selectedTable">
              刷新
            </el-button>
          </div>
        </div>
      </template>

      <div v-if="selectedTable" class="table-wrapper">
        <el-table
          :data="rows"
          border
          stripe
          height="520"
          empty-text="暂无记录"
        >
          <el-table-column
            v-for="column in columns"
            :key="column.Field"
            :prop="column.Field"
            :label="column.Field"
            :min-width="columnWidth(column)"
            show-overflow-tooltip
          />
          <el-table-column label="操作" fixed="right" width="160">
            <template #default="{ row }">
              <el-space>
                <el-button size="small" type="primary" text @click="openEditDialog(row)">
                  编辑
                </el-button>
                <el-button size="small" type="danger" text @click="confirmDelete(row)">
                  删除
                </el-button>
              </el-space>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <el-empty v-else description="请选择数据表" />
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogMode === 'create' ? '新增记录' : '编辑记录'"
      width="520px"
      destroy-on-close
    >
      <el-form :model="formModel" label-width="120px" class="form-grid">
        <el-form-item
          v-for="column in editableColumns"
          :key="column.Field"
          :label="column.Field"
          :required="column.Null === 'NO' && !isAutoIncrement(column)"
        >
          <el-date-picker
            v-if="isDateType(column.Type)"
            v-model="formModel[column.Field]"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="选择日期"
            style="width: 100%"
            clearable
          />
          <el-input-number
            v-else-if="isNumericType(column.Type)"
            v-model="formModel[column.Field]"
            :controls="false"
            style="width: 100%"
            :disabled="isPrimaryKey(column) && dialogMode === 'edit'"
          />
          <el-input
            v-else
            v-model="formModel[column.Field]"
            clearable
            :disabled="isAutoIncrement(column) || (isPrimaryKey(column) && dialogMode === 'edit')"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { ColumnDefinition, TablePayload } from '@/types/database';
import { isDateType, isNumericType, normalizeValue } from '@/utils/format';

const tables = ref<string[]>([]);
const selectedTable = ref('');
const columns = ref<ColumnDefinition[]>([]);
const rows = ref<Record<string, any>[]>([]);
const primaryKey = ref<string | null>(null);
const tableLoading = ref(false);
const dialogVisible = ref(false);
const dialogMode = ref<'create' | 'edit'>('create');
const formModel = reactive<Record<string, any>>({});
const editingKeyValue = ref<string | number | null>(null);

const editableColumns = computed(() => columns.value);

function isAutoIncrement(column: ColumnDefinition) {
  return column.Extra.includes('auto_increment');
}

function isPrimaryKey(column: ColumnDefinition) {
  return column.Key === 'PRI';
}

function columnWidth(column: ColumnDefinition) {
  if (isPrimaryKey(column)) return 140;
  if (isNumericType(column.Type)) return 120;
  if (isDateType(column.Type)) return 180;
  return 160;
}

async function refreshTables() {
  try {
    const response = await fetch('/api/tables');
    if (!response.ok) throw new Error('无法获取数据表');
    const payload = await response.json();
    const tableNames: string[] = Array.isArray(payload)
      ? payload
      : payload.tables || [];
    tables.value = tableNames;
    if (!selectedTable.value && tableNames.length) {
      handleSelectTable(tableNames[0]);
    }
  } catch (error: any) {
    ElMessage.error(error.message || '加载数据表失败');
  }
}

async function fetchTableData(name: string) {
  tableLoading.value = true;
  try {
    const response = await fetch(`/api/table/${encodeURIComponent(name)}`);
    if (!response.ok) throw new Error('读取数据失败');
    const data: TablePayload = await response.json();
    columns.value = data.columns;
    rows.value = data.rows;
    primaryKey.value = data.primaryKey;
  } catch (error: any) {
    ElMessage.error(error.message || '加载数据失败');
  } finally {
    tableLoading.value = false;
  }
}

function handleSelectTable(name: string) {
  selectedTable.value = name;
  fetchTableData(name);
}

function initializeForm(row?: Record<string, any>) {
  columns.value.forEach((column) => {
    const field = column.Field;
    if (row) {
      const value = row[field];
      if (value === null || value === undefined) {
        formModel[field] = null;
      } else if (isDateType(column.Type)) {
        formModel[field] = value;
      } else if (isNumericType(column.Type)) {
        formModel[field] = Number(value);
      } else {
        formModel[field] = value;
      }
    } else {
      formModel[field] = isNumericType(column.Type) ? null : '';
    }
  });
}

function openCreateDialog() {
  dialogMode.value = 'create';
  initializeForm();
  editingKeyValue.value = null;
  dialogVisible.value = true;
}

function openEditDialog(row: Record<string, any>) {
  dialogMode.value = 'edit';
  initializeForm(row);
  if (primaryKey.value) {
    editingKeyValue.value = row[primaryKey.value];
  }
  dialogVisible.value = true;
}

async function submitForm() {
  if (!selectedTable.value) return;
  const payload: Record<string, any> = {};
  columns.value.forEach((column) => {
    const field = column.Field;
    const value = formModel[field];
    if (dialogMode.value === 'create' && isAutoIncrement(column) && (value === null || value === '')) {
      return;
    }
    if (isDateType(column.Type)) {
      payload[field] = value || null;
    } else if (isNumericType(column.Type)) {
      payload[field] = value === null || value === '' ? null : Number(value);
    } else {
      payload[field] = normalizeValue(value);
    }
  });

  try {
    if (dialogMode.value === 'create') {
      const response = await fetch(`/api/table/${encodeURIComponent(selectedTable.value)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('新增记录失败');
      ElMessage.success('记录新增成功');
    } else {
      if (!primaryKey.value || editingKeyValue.value === null) {
        throw new Error('无法识别主键，更新失败');
      }
      const response = await fetch(
        `/api/table/${encodeURIComponent(selectedTable.value)}/${encodeURIComponent(String(editingKeyValue.value))}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      );
      if (!response.ok) throw new Error('更新记录失败');
      ElMessage.success('记录更新成功');
    }
    dialogVisible.value = false;
    await fetchTableData(selectedTable.value);
  } catch (error: any) {
    ElMessage.error(error.message || '提交失败');
  }
}

async function confirmDelete(row: Record<string, any>) {
  if (!primaryKey.value) {
    ElMessage.error('未检测到主键，无法删除');
    return;
  }
  const keyValue = row[primaryKey.value];
  try {
    await ElMessageBox.confirm(`确认删除 ${primaryKey.value} = ${keyValue} 的记录吗？`, '提示', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消'
    });
    const response = await fetch(
      `/api/table/${encodeURIComponent(selectedTable.value)}/${encodeURIComponent(String(keyValue))}`,
      {
        method: 'DELETE'
      }
    );
    if (!response.ok) throw new Error('删除失败');
    ElMessage.success('记录删除成功');
    await fetchTableData(selectedTable.value);
  } catch (error: any) {
    if (error === 'cancel' || error === 'close') return;
    ElMessage.error(error.message || '删除失败');
  }
}

function refreshCurrentTable() {
  if (selectedTable.value) {
    fetchTableData(selectedTable.value);
  }
}

onMounted(() => {
  refreshTables();
});
</script>

<style scoped>
.browser-layout {
  display: grid;
  grid-template-columns: minmax(220px, 280px) 1fr;
  gap: 24px;
}

.table-menu {
  border: none;
}

.table-menu .el-menu-item {
  border-radius: 12px;
  margin: 4px 12px;
  height: 44px;
  line-height: 44px;
}

.table-menu .el-menu-item.is-active {
  background: linear-gradient(135deg, #5ca9ff 0%, #409eff 100%);
  color: #fff;
  box-shadow: 0 10px 24px rgba(64, 158, 255, 0.25);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.card-title {
  font-weight: 600;
  font-size: 16px;
  color: #1f2d3d;
}

.table-title {
  margin: 0;
  font-size: 22px;
  color: #1f2d3d;
}

.table-subtitle {
  margin: 6px 0 0;
  color: #5c6b7a;
  font-size: 13px;
}

.table-placeholder {
  margin: 0;
  color: #90a4c0;
}

.toolbar {
  display: flex;
  gap: 10px;
}

.table-wrapper {
  padding: 0 12px 12px;
}

.form-grid {
  max-height: 520px;
  overflow-y: auto;
  padding-right: 12px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (max-width: 1024px) {
  .browser-layout {
    grid-template-columns: 1fr;
  }
}
</style>
