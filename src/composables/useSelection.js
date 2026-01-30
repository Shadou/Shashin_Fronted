import { ref, computed, watch } from 'vue'

export function useSelection(options = {}) {
  const { idKey = '_id', multiple = true, initialSelection = [] } = options

  const selectedItems = ref(new Set(initialSelection))
  const allItems = ref([])
  const lastSelectedIndex = ref(-1)

  // 计算属性
  const selectedCount = computed(() => selectedItems.value.size)
  const allSelected = computed({
    get: () =>
      allItems.value.length > 0 &&
      allItems.value.every((item) => selectedItems.value.has(item[idKey])),
    set: (value) => {
      if (value) {
        allItems.value.forEach((item) => selectedItems.value.add(item[idKey]))
      } else {
        selectedItems.value.clear()
      }
    },
  })
  const isIndeterminate = computed(
    () => selectedCount.value > 0 && selectedCount.value < allItems.value.length,
  )
  const selectedIds = computed(() => Array.from(selectedItems.value))
  const selectedData = computed(() =>
    allItems.value.filter((item) => selectedItems.value.has(item[idKey])),
  )

  // 方法
  const select = (item) => {
    if (!item) return

    const itemId = item[idKey] || item
    if (multiple) {
      selectedItems.value.add(itemId)
    } else {
      selectedItems.value.clear()
      selectedItems.value.add(itemId)
    }
  }

  const unselect = (item) => {
    const itemId = item[idKey] || item
    selectedItems.value.delete(itemId)
  }

  const toggle = (item) => {
    const itemId = item[idKey] || item
    if (selectedItems.value.has(itemId)) {
      unselect(item)
    } else {
      select(item)
    }
  }

  const toggleRange = (currentIndex) => {
    if (!multiple || lastSelectedIndex.value === -1) {
      lastSelectedIndex.value = currentIndex
      const item = allItems.value[currentIndex]
      if (item) {
        toggle(item)
      }
      return
    }

    const start = Math.min(lastSelectedIndex.value, currentIndex)
    const end = Math.max(lastSelectedIndex.value, currentIndex)

    for (let i = start; i <= end; i++) {
      const item = allItems.value[i]
      if (item && !selectedItems.value.has(item[idKey])) {
        selectedItems.value.add(item[idKey])
      }
    }

    lastSelectedIndex.value = currentIndex
  }

  const selectAll = () => {
    allItems.value.forEach((item) => {
      selectedItems.value.add(item[idKey])
    })
  }

  const unselectAll = () => {
    selectedItems.value.clear()
  }

  const toggleAll = () => {
    if (allSelected.value) {
      unselectAll()
    } else {
      selectAll()
    }
  }

  const isSelected = (item) => {
    const itemId = item[idKey] || item
    return selectedItems.value.has(itemId)
  }

  const setItems = (items) => {
    allItems.value = items || []
  }

  const updateSelection = (ids) => {
    selectedItems.value = new Set(ids)
  }

  const clear = () => {
    selectedItems.value.clear()
    lastSelectedIndex.value = -1
  }

  // 监听数据变化，清除无效的选择
  watch(
    allItems,
    (newItems) => {
      const validIds = new Set(newItems.map((item) => item[idKey]))
      const filteredSelection = new Set(
        Array.from(selectedItems.value).filter((id) => validIds.has(id)),
      )
      selectedItems.value = filteredSelection
    },
    { deep: true },
  )

  return {
    // 状态
    selectedItems,
    selectedCount,

    // 计算属性
    allSelected,
    isIndeterminate,
    selectedIds,
    selectedData,

    // 方法
    select,
    unselect,
    toggle,
    toggleRange,
    selectAll,
    unselectAll,
    toggleAll,
    isSelected,
    setItems,
    updateSelection,
    clear,
  }
}
