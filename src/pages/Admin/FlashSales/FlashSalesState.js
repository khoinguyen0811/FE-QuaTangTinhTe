export const state = {
  listData: [],
  allProducts: [],
  categories: [],
  selectedProducts: new Map(),
  filteredProducts: [],
  fsPage: 1,
  fsSearchQuery: '',
  fsStatusFilter: 'all',
  selectedFlashSales: new Set(),
  editingCampaign: null,
};

export function resetFlashSalesState() {
  state.selectedProducts.clear();
  state.selectedFlashSales.clear();
  state.fsPage = 1;
  state.fsSearchQuery = '';
  state.fsStatusFilter = 'all';
  state.editingCampaign = null;
}
