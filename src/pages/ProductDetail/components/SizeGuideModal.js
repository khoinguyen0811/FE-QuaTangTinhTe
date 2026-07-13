const SIZE_GUIDELINES = {
  'S': { height: '1m40 - 1m60', weight: '35kg - 50kg' },
  'M': { height: '1m45 - 1m65', weight: '40kg - 60kg' },
  'L': { height: '1m60 - 1m75', weight: '55kg - 75kg' },
  'XL': { height: '1m70 - 1m85', weight: '65kg - 85kg' },
  'XXL': { height: '1m75 - 1m90', weight: '75kg - 95kg' },
  'XXXL': { height: '1m80 - 1m95', weight: '85kg - 105kg' },
  'FS': { height: 'Mọi vóc dáng', weight: 'Dưới 70kg' },
  'FREESIZE': { height: 'Mọi vóc dáng', weight: 'Dưới 70kg' }
};

export function openSizeGuide(sizeChartUrl, availableSizes) {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-6 select-none font-sans text-black';
  
  const sizeList = Array.isArray(availableSizes) ? availableSizes : [];
  const sizeOrder = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'FS', 'FREESIZE'];
  
  const sortedSizes = [...new Set(sizeList.map(s => s.trim()))].sort((a, b) => {
    const idxA = sizeOrder.indexOf(a.toUpperCase());
    const idxB = sizeOrder.indexOf(b.toUpperCase());
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
  });

  const displaySizes = sortedSizes.length > 0 ? sortedSizes : ['M', 'L', 'XL'];

  const rowsHtml = displaySizes.map(size => {
    const key = size.toUpperCase();
    const info = SIZE_GUIDELINES[key] || { height: '—', weight: '—' };
    return `
      <tr class="border-b border-zinc-200">
        <td class="p-2.5 border-r border-zinc-200 font-bold">${size.toUpperCase()}</td>
        <td class="p-2.5 border-r border-zinc-200">${info.height}</td>
        <td class="p-2.5">${info.weight}</td>
      </tr>
    `;
  }).join('');

  const contentHtml = sizeChartUrl 
    ? `<div class="w-full flex justify-center"><img src="${sizeChartUrl}" class="w-full h-auto max-h-[70vh] object-contain shadow-sm" onerror="this.src='/image/default-placeholder.png'"></div>`
    : `
      <h3 class="text-xs font-black uppercase tracking-widest text-center">BẢNG HƯỚNG DẪN CHỌN SIZE</h3>
      
      <div class="overflow-x-auto w-full">
        <table class="w-full text-left text-xs font-medium border-collapse border border-zinc-200">
          <thead>
            <tr class="bg-zinc-50 border-b border-zinc-200 font-bold uppercase text-[10px] tracking-wider">
              <th class="p-2.5 border-r border-zinc-200">SIZE</th>
              <th class="p-2.5 border-r border-zinc-200">CHIỀU CAO</th>
              <th class="p-2.5">CÂN NẶNG</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>
      
      <div class="text-[10px] font-bold text-zinc-400 space-y-1 leading-normal w-full text-left">
        <p>* Lưu ý: Bảng size chỉ mang tính chất tham khảo, dáng người đặc biệt có thể tăng/giảm size.</p>
      </div>
    `;

  modal.innerHTML = `
    <div class="bg-white p-6 sm:p-8 max-w-lg w-full border border-black space-y-6 relative flex flex-col items-center">
      <button id="sg-close-btn" class="absolute top-4 right-4 text-black hover:opacity-70 text-lg font-black cursor-pointer bg-transparent border-none">✕</button>
      ${contentHtml}
    </div>
  `;
  modal.querySelector('#sg-close-btn').addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
  
  modal.setAttribute('data-lenis-prevent', 'true');
  modal.addEventListener('wheel', (e) => e.stopPropagation(), { passive: true });
  modal.addEventListener('touchmove', (e) => e.stopPropagation(), { passive: true });

  document.body.appendChild(modal);
}
