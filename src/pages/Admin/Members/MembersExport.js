export function exportMembersToCSV(state, showToast) {
  if (!state.data.length) {
    showToast('Không có dữ liệu để xuất', 'error');
    return;
  }

  let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // UTF-8 BOM
  csvContent += "Tên Khách Hàng,Email,Số Điện Thoại,Hạng VIP,Tổng Chi Tiêu,Điểm Tích Lũy,Trạng Thái Khóa\n";

  state.data.forEach(user => {
    const name = `"${user.full_name || 'Khách ẩn danh'}"`;
    const email = `"${user.email || ''}"`;
    const phone = `"${user.phone || ''}"`;
    const rank = `"${user.rank}"`;
    const spend = `"${user.total_spend}"`;
    const points = `"${user.points}"`;
    const blacklisted = user.is_blacklisted == 1 ? '"Bị Khóa"' : '"Hoạt Động"';

    csvContent += `${name},${email},${phone},${rank},${spend},${points},${blacklisted}\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  const brand = (window.APP_SETTINGS?.brand_name || 'shop')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/gi, '_');
  link.setAttribute("download", `${brand}_members_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function renderMembersPageNav(container, state, loadMembers, createPagination) {
  const wrap = container.querySelector('#members-pagination');
  wrap.innerHTML = '';
  const totalPages = Math.ceil(state.total / state.limit);
  if (totalPages <= 1) return;
  wrap.appendChild(createPagination(state.page, totalPages, (page) => {
    state.page = page;
    loadMembers(container);
  }));
}
