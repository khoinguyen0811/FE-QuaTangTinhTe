import { getRanks } from '../../../services/adminService.js';

export async function populateRankCheckboxes(container, prefix) {
  const checkboxContainer = container.querySelector(`#${prefix}-ranks-checkboxes-container`);
  if (!checkboxContainer) return;
  
  checkboxContainer.innerHTML = '<span class="text-xs text-gray-400 col-span-2">Đang tải các hạng...</span>';
  try {
    const res = await getRanks();
    const ranks = res.data || [];
    
    checkboxContainer.innerHTML = `
      <label class="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700 col-span-2 pb-1 border-b border-gray-150 mb-1">
        <input type="checkbox" id="${prefix}-rank-all" value="all" checked class="rounded border-gray-300 text-[#5d58f0] focus:ring-[#5d58f0]">
        Tất cả mọi người
      </label>
      ${ranks.map(r => `
        <label class="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-600">
          <input type="checkbox" name="${prefix}-rank-item" value="${r.name}" checked class="rounded border-gray-300 text-[#5d58f0] focus:ring-[#5d58f0]">
          ${r.name}
        </label>
      `).join('')}
    `;

    const allCheckbox = checkboxContainer.querySelector(`#${prefix}-rank-all`);
    const itemCheckboxes = checkboxContainer.querySelectorAll(`input[name="${prefix}-rank-item"]`);

    // Handle Select All button
    container.querySelector(`#${prefix}-select-all-ranks`).addEventListener('click', () => {
      allCheckbox.checked = true;
      itemCheckboxes.forEach(cb => cb.checked = true);
    });

    // Handle Clear All button
    container.querySelector(`#${prefix}-clear-all-ranks`).addEventListener('click', () => {
      allCheckbox.checked = false;
      itemCheckboxes.forEach(cb => cb.checked = false);
    });

    // When "Tất cả mọi người" is checked/unchecked
    allCheckbox.addEventListener('change', () => {
      itemCheckboxes.forEach(cb => cb.checked = allCheckbox.checked);
    });

    // When any item is unchecked, uncheck "Tất cả mọi người"
    itemCheckboxes.forEach(cb => {
      cb.addEventListener('change', () => {
        if (!cb.checked) {
          allCheckbox.checked = false;
        } else {
          const allChecked = Array.from(itemCheckboxes).every(item => item.checked);
          if (allChecked) allCheckbox.checked = true;
        }
      });
    });

  } catch (err) {
    checkboxContainer.innerHTML = `<span class="text-xs text-red-500 col-span-2">Lỗi tải hạng VIP: ${err.message}</span>`;
  }
}

export function getSelectedRanks(container, prefix) {
  const allCheckbox = container.querySelector(`#${prefix}-rank-all`);
  if (allCheckbox && allCheckbox.checked) {
    return 'all';
  }
  const checkedItems = Array.from(container.querySelectorAll(`input[name="${prefix}-rank-item"]:checked`))
    .map(cb => cb.value);
  
  if (checkedItems.length === 0) {
    return 'all';
  }
  
  const allItems = container.querySelectorAll(`input[name="${prefix}-rank-item"]`);
  if (allItems.length > 0 && checkedItems.length === allItems.length) {
    return 'all';
  }

  return checkedItems.join(',');
}

