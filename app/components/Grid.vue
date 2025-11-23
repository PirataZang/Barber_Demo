<template>
    <client-only>
        <div class="flex flex-col h-[calc(100vh-var(--header-height)-4rem)] m-4 bg-white rounded-lg shadow overflow-hidden">
            <!-- HEADER -->
            <div class="p-6 border-b border-neutral-200">
                <div class="flex items-center gap-2 mb-4">
                    <h2 class="text-lg font-semibold text-neutral-800">{{ title }}</h2>
                    <span v-if="rowData?.length" class="text-neutral-500 text-sm"> ({{ rowData.length }} registros) </span>
                </div>

                <div class="flex justify-between items-center gap-4">
                    <!-- SEARCH -->
                    <div class="relative flex-1 max-w-[400px]">
                        <i class="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"></i>

                        <input type="text" placeholder="Buscar..." v-model="searchText" @input="onQuickFilterChanged" class="w-full pl-2 py-2 border border-neutral-300 rounded-md focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none transition" />
                    </div>

                    <!-- BUTTONS SLOT -->
                    <div class="flex gap-2">
                        <slot name="buttons"></slot>
                    </div>
                </div>
            </div>

            <!-- GRID -->
            <div class="flex-1 min-h-[200px] relative w-full overflow-hidden">
                <ag-grid-vue ref="agGrid" class="ag-theme-alpine absolute inset-0 [--ag-header-height:48px] [--ag-row-height:48px] [--ag-header-foreground-color:var(--neutral-700)] [--ag-header-background-color:var(--neutral-50)] [--ag-odd-row-background-color:white] [--ag-row-hover-color:var(--primary-light)] [--ag-selected-row-background-color:var(--primary-light)] [--ag-font-family:var(--font-sans)] [--ag-font-size:var(--text-sm)]" style="width: 100%; height: 100%" :defaultColDef="defaultColDef" :columnDefs="columnDefs" :rowData="rowData" :pagination="true" :paginationPageSize="100" :rowSelection="rowSelection" :localeText="localeText" :suppressCellFocus="true" :enableRangeSelection="false" domLayout="normal" animateRows @grid-ready="onGridReady" @row-selected="onRowSelected" />
            </div>

            <!-- FOOTER -->
            <div class="p-4 border-t border-neutral-200 flex justify-between items-center">
                <div class="flex gap-2">
                    <button class="flex items-center gap-2 px-3 py-2 rounded-md border border-neutral-300 bg-neutral-100 hover:bg-neutral-200 transition" title="Exportar para CSV" @click="exportCSV">
                        <i class="fa-solid fa-download"></i>
                        <span>CSV</span>
                    </button>

                    <button class="flex items-center gap-2 px-3 py-2 rounded-md border border-neutral-300 bg-neutral-100 hover:bg-neutral-200 transition" title="Exportar para Excel" @click="handleExcelExport">
                        <i class="fa-solid fa-file-excel"></i>
                        <span>Excel</span>
                    </button>
                </div>

                <slot name="footer"></slot>
            </div>
        </div>
    </client-only>
</template>

<script setup>
import { AgGridVue } from 'ag-grid-vue3'
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community'
import collect from 'collect.js'
import * as XLSX from 'xlsx'

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule])

// Props
const props = defineProps({
    columnDefs: { type: Array, required: true },
    rowData: { type: Array, default: () => [] },
    title: { type: String, default: '' },
    mode: { type: String, default: 'multiRow' },
})

// Emits
const emit = defineEmits(['selectedRows'])

// Reactive state
const searchText = ref('')
const gridApi = ref(null)
const gridColumnApi = ref(null)

// Default column definition
const defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    flex: 1,
}

// Row selection configuration
const rowSelection = computed(() => ({
    mode: props.mode ?? 'multiRow',
    enableClickSelection: true,
}))

// Localization
const localeText = {
    page: 'Página',
    of: 'de',
    to: 'até',
    more: 'mais',
    next: 'Próxima',
    last: 'Última',
    after: 'Depois',
    before: 'Antes',
    first: 'Primeira',
    previous: 'Anterior',
    filterOoo: 'Filtrar...',
    equals: 'Igual',
    notEqual: 'Diferente',
    lessThan: 'Menor que',
    greaterThan: 'Maior que',
    lessThanOrEqual: 'Menor ou igual',
    greaterThanOrEqual: 'Maior ou igual',
    inRange: 'Entre',
    contains: 'Contém',
    notContains: 'Não contém',
    startsWith: 'Começa com',
    endsWith: 'Termina com',
    blank: 'Em branco',
    notBlank: 'Não em branco',
    noRowsToShow: 'Nenhum registro encontrado',
    loadingOoo: 'Carregando...',
}

// Grid event handlers
const onGridReady = (params) => {
    gridApi.value = params.api
    gridColumnApi.value = params.columnApi
}

// Watch for data changes
watch(
    () => props.rowData,
    (newData) => {
        if (gridApi.value && Array.isArray(newData)) {
            gridApi.value.setGridOption('rowData', [])
            nextTick(() => {
                gridApi.value.setGridOption('rowData', newData)
            })
        }
    },
    { immediate: true, deep: true }
)

const onQuickFilterChanged = () => {
    if (gridApi.value && searchText.value !== undefined) {
        gridApi.value.setGridOption('quickFilterText', searchText.value)
    }
}

const onRowSelected = (event) => {
    const selectedRows = event.api.getSelectedRows()
    emit('selectedRows', collect(selectedRows))
}

// Export functions
const exportCSV = () => {
    if (!gridApi.value) return
    gridApi.value.exportDataAsCsv({
        fileName: `${props.title || 'export'}_${new Date().toISOString().slice(0, 10)}.csv`,
        suppressQuotes: false,
        allColumns: true,
    })
}

const handleExcelExport = () => {
    if (!props.rowData?.length) return
    const fileName = `${props.title || 'export'}_${new Date().toISOString().slice(0, 10)}.xlsx`
    generateExcel(props.rowData, fileName)
}

const generateExcel = (rows, fileName = 'data.xlsx') => {
    const worksheet = XLSX.utils.json_to_sheet(rows)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
    XLSX.writeFile(workbook, fileName)
}
</script>
