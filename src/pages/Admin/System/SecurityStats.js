export function renderSecurityStats(stats) {
  const cards = [
    {
      label: 'IP Đang Bị Chặn',
      value: stats.blocked_ips_count ?? 0,
      icon: 'ti-shield-x',
      colorClass: 'text-red-600 bg-red-50'
    },
    {
      label: 'Đăng Nhập Thất Bại (24h)',
      value: stats.failed_logins_24h ?? 0,
      icon: 'ti-lock-off',
      colorClass: 'text-yellow-600 bg-yellow-50'
    },
    {
      label: 'Yêu Cầu Bị Chặn (24h)',
      value: stats.blocked_requests_24h ?? 0,
      icon: 'ti-ban',
      colorClass: 'text-orange-600 bg-orange-50'
    },
    {
      label: 'Quốc Gia Bị Chặn',
      value: stats.blocked_countries_count ?? 0,
      icon: 'ti-world',
      colorClass: 'text-blue-600 bg-blue-50'
    }
  ];

  return `
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      ${cards.map(c => `
        <div class="bg-white border border-gray-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <span class="block text-xs font-semibold text-gray-500 uppercase tracking-wider">${c.label}</span>
            <span class="block text-2xl font-bold text-gray-900 mt-1">${c.value}</span>
          </div>
          <div class="w-12 h-12 rounded-xl flex items-center justify-center ${c.colorClass}">
            <i class="ti ${c.icon} text-2xl"></i>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}
