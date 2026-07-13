export function getMockRows(type) {
  if (type === 'source') {
    return [
      { name: 'Direct', count: 70 },
      { name: 'Google', count: 48 },
      { name: 'Facebook', count: 25 },
      { name: 'Referral', count: 14 },
    ];
  }

  return [
    { name: 'Vietnam', count: 80 },
    { name: 'United States', count: 50 },
    { name: 'Netherlands', count: 8 },
    { name: 'The Netherlands', count: 4 },
    { name: 'Singapore', count: 6 },
    { name: 'Japan', count: 9 },
  ];
}

export function getMockData(range, startDate = null, endDate = null) {
  let days = Number(range);
  if (range === 'custom' && startDate && endDate) {
    const s = new Date(startDate);
    const e = new Date(endDate);
    days = Math.max(1, Math.round((e - s) / (24 * 60 * 60 * 1000)) + 1);
  }
  if (isNaN(days) || days <= 0) days = 30;

  const factor = days === 7 ? 0.25 : days === 90 ? 3 : (days / 30);
  
  return {
    summary: {
      unique_visitors: Math.round(138 * factor),
      total_visits: Math.round(157 * factor),
      avg_time_on_page: 231.99,
      active_users: 5,
      page_views: Math.round(412 * factor),
      avg_scroll_depth: 64.2,
      conversion_rate: 10.14,
      return_rate: 33.33,
    },
    daily_visitors: generateMockDaily(days, startDate, endDate),
    sources: getMockRows('source'),
    countries: getMockRows('country'),
    devices: { desktop: 120, mobile: 35, tablet: 2 },
    cities: [
      { name: 'Ho Chi Minh, Vietnam', count: 82 },
      { name: 'Ha Noi, Vietnam', count: 43 },
      { name: 'Da Nang, Vietnam', count: 12 },
    ],
    utm_sources: [],
    search_total: Math.round(138 * factor),
    search_unique: Math.round(42 * factor),
    search_avg_ctr: 68.2,
    search_queries: [
      { term: 'áo thun', count: Math.round(48 * factor), clicks: Math.round(35 * factor), ctr: 72.9 },
      { term: 'áo khoác', count: Math.round(32 * factor), clicks: Math.round(20 * factor), ctr: 62.5 },
      { term: 'quần jean', count: Math.round(25 * factor), clicks: Math.round(18 * factor), ctr: 72.0 },
      { term: 'hoodie', count: Math.round(18 * factor), clicks: Math.round(12 * factor), ctr: 66.7 },
      { term: 'sơ mi', count: Math.round(15 * factor), clicks: Math.round(10 * factor), ctr: 66.7 },
    ],
    zero_result_queries: [
      { term: 'váy nữ', count: Math.max(1, Math.round(12 * factor)) },
      { term: 'giày da', count: Math.max(1, Math.round(8 * factor)) },
      { term: 'nước hoa', count: Math.max(1, Math.round(5 * factor)) },
    ],
    top_pages: [
      { page: '/', views: 184, users: 110, avg_time: 142 },
      { page: '/product/ao-thun-signature', views: 125, users: 84, avg_time: 215 },
      { page: '/cart', views: 82, users: 43, avg_time: 48 },
      { page: '/checkout', views: 40, users: 22, avg_time: 110 },
      { page: '/product/quan-jean-slimfit', views: 35, users: 28, avg_time: 96 },
    ],
    active_sessions: [
      { session_id: 'sess_125', current_page: '/product/ao-thun-signature', page_title: 'Áo Thun Signature', user_id: 5, user_email: 'member@gmail.com', ip_address: '113.161.42.12', country_name: 'Vietnam', city: 'Ho Chi Minh City', last_ping: new Date().toISOString() },
      { session_id: 'sess_834', current_page: '/cart', page_title: 'Giỏ hàng', user_id: null, user_email: null, ip_address: '14.232.108.5', country_name: 'Vietnam', city: 'Hanoi', last_ping: new Date(Date.now() - 22000).toISOString() },
      { session_id: 'sess_091', current_page: '/', page_title: 'Trang chủ', user_id: null, user_email: null, ip_address: '66.249.74.130', country_name: 'United States', city: 'Mountain View', last_ping: new Date(Date.now() - 45000).toISOString() },
      { session_id: 'sess_532', current_page: '/checkout', page_title: 'Thanh toán', user_id: 12, user_email: 'khachhang@yahoo.com', ip_address: '188.166.220.100', country_name: 'Singapore', city: 'Singapore', last_ping: new Date(Date.now() - 95000).toISOString() },
      { session_id: 'sess_711', current_page: '/product/quan-jean-slimfit', page_title: 'Quần Jean Slimfit', user_id: null, user_email: null, ip_address: '113.161.42.12', country_name: 'Vietnam', city: 'Ho Chi Minh City', last_ping: new Date(Date.now() - 150000).toISOString() },
    ]
  };
}

export function generateMockDaily(days, startDate = null, endDate = null) {
  const rows = [];
  const startVal = 15;

  if (days === 1 || (startDate && endDate && startDate === endDate)) {
    // Under 1 day or 1-day range: return hourly mock data (00:00 - 23:00)
    for (let h = 0; h < 24; h++) {
      const hourLabel = String(h).padStart(2, '0') + ':00';
      const noise = Math.floor(Math.random() * 6) - 2;
      const wave = Math.sin((h - 8) * 0.2) * 8; // peak during day/evening
      const count = Math.max(1, Math.round(startVal + wave + noise));
      rows.push({ date: hourLabel, count });
    }
    return rows;
  }

  if (startDate && endDate) {
    const s = new Date(startDate);
    const e = new Date(endDate);
    const diffDays = Math.max(1, Math.round((e - s) / (24 * 60 * 60 * 1000)) + 1);
    
    for (let i = 0; i < diffDays; i++) {
      const d = new Date(s);
      d.setDate(s.getDate() + i);
      const noise = Math.floor(Math.random() * 8) - 3;
      const wave = Math.sin(i * 0.5) * 6;
      const trend = i * 0.3;
      const count = Math.max(2, Math.round(startVal + wave + trend + noise));
      rows.push({ date: d.toISOString(), count });
    }
  } else {
    for (let i = days - 1; i >= 0; i -= 1) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const noise = Math.floor(Math.random() * 8) - 3;
      const wave = Math.sin(i * 0.5) * 6;
      const trend = (days - i) * 0.3;
      const count = Math.max(2, Math.round(startVal + wave + trend + noise));
      rows.push({ date: d.toISOString(), count });
    }
  }
  return rows;
}
