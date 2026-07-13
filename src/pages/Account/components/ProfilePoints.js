import { formatDate, formatPrice } from '../../../utils/helpers.js?v=1.0.20';
import { convertPointsToVoucher } from '../../../services/userService.js?v=1.0.20';

export class ProfilePoints {
  constructor(page) {
    this.page = page;

    // Bind action handler to window.accountPage
    this.page.handlePointsConvert = this.handlePointsConvert.bind(this);
  }

  render() {
    const spend = parseFloat(this.page._userProfile?.total_spend || 0);
    let rank = this.page._userProfile?.rank || 'Silver';
    let nextRank = '';
    let targetSpend = 0;
    let spendDiff = 0;
    let pct = 0;

    // Dynamic rank calculation from DB
    const sortedRanks = [...(this.page._ranks || [])].sort((a, b) => Number(a.min_spend) - Number(b.min_spend));

    if (sortedRanks.length > 0) {
      const currentRankIndex = sortedRanks.findIndex(r => r.name.toLowerCase() === rank.toLowerCase());
      const nextRankObj = currentRankIndex !== -1 && currentRankIndex < sortedRanks.length - 1
        ? sortedRanks[currentRankIndex + 1]
        : null;

      if (nextRankObj) {
        nextRank = nextRankObj.name;
        targetSpend = parseFloat(nextRankObj.min_spend);
        spendDiff = Math.max(0, targetSpend - spend);
        const currentRankMin = currentRankIndex !== -1 ? parseFloat(sortedRanks[currentRankIndex].min_spend) : 0;
        const range = targetSpend - currentRankMin;
        pct = range > 0 ? Math.min(100, Math.max(0, ((spend - currentRankMin) / range) * 100)) : 100;
      } else {
        pct = 100;
      }
    } else {
      // Static fallback
      if (spend < 3000000) {
        nextRank = 'Gold'; targetSpend = 3000000;
        spendDiff = 3000000 - spend; pct = (spend / 3000000) * 100;
      } else if (spend < 10000000) {
        nextRank = 'Diamond'; targetSpend = 10000000;
        spendDiff = 10000000 - spend; pct = ((spend - 3000000) / 7000000) * 100;
      } else {
        pct = 100;
      }
    }

    const diamondIcon = `
      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-zinc-950" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M6 5h12l3 5l-9 9l-9 -9z" />
      </svg>
    `;

    // Dynamic benefits table
    const ranksForTable = sortedRanks.length > 0 ? sortedRanks : [
      { name: 'Silver', min_spend: 0 },
      { name: 'Gold', min_spend: 3000000 },
      { name: 'Diamond', min_spend: 10000000 }
    ];

    const benefitRows = [
      { label: 'Doanh số tích lũy', values: ranksForTable.map(r => {
        const ms = Number(r.min_spend);
        return ms === 0 ? '0đ' : `≥${Number(ms).toLocaleString('vi-VN')}đ`;
      })},
      { label: 'Tỷ lệ tích điểm', values: ranksForTable.map((_, i) => {
        const multiplier = 1 + i * 0.5;
        return `${multiplier}đ / 1K (${multiplier}x)`;
      })},
      { label: 'Voucher sinh nhật', values: ranksForTable.map((_, i) => {
        const amount = (i + 1) * 100000;
        return `${Number(amount).toLocaleString('vi-VN')}đ`;
      })},
      { label: 'Quyền truy cập VIP', values: ranksForTable.map((_, i) => {
        if (i === 0) return 'Không';
        if (i === 1) return 'Sớm 24h';
        return 'Ngay lập tức';
      })}
    ];

    const benefitsTableHtml = `
      <table class="w-full text-xs text-left border-collapse">
        <thead>
          <tr class="bg-zinc-50 border-b border-zinc-100 font-bold text-zinc-700">
            <th class="p-3">Quyền lợi</th>
            ${ranksForTable.map(r => `<th class="p-3">${r.name}</th>`).join('')}
          </tr>
        </thead>
        <tbody class="divide-y divide-zinc-50 font-medium text-zinc-650">
          ${benefitRows.map(row => `
            <tr>
              <td class="p-3 font-bold text-zinc-800">${row.label}</td>
              ${row.values.map(v => `<td class="p-3">${v}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    return `
      <div class="flex items-center justify-between mb-6 pb-4 border-b border-zinc-100">
        <h2 class="text-sm font-black uppercase tracking-wider text-zinc-950 flex items-center gap-2">
          ${diamondIcon}
          <span>Hạng thành viên & Điểm</span>
        </h2>
      </div>

      <!-- Current Membership Card -->
      <div class="p-6 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-850 to-zinc-950 text-white shadow-xl mb-8">
        <div class="flex justify-between items-center mb-4">
          <div>
            <div class="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Hạng Hiện Tại</div>
            <div class="text-xl font-black text-amber-400 uppercase tracking-widest mt-1">★ ${rank} Member</div>
          </div>
          <div class="text-right">
            <div class="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Tổng chi tiêu</div>
            <div class="text-base font-black text-white mt-1">${formatPrice(spend)}</div>
          </div>
        </div>

        <div class="w-full bg-zinc-800 h-2 rounded-full overflow-hidden mb-3 border border-zinc-800/40">
          <div class="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full" style="width: ${pct}%"></div>
        </div>

        <div class="flex justify-between text-[10px] text-zinc-400">
          <span>0đ</span>
          <span>${nextRank ? `Đã đạt ${pct.toFixed(0)}% · Mua thêm ${formatPrice(spendDiff)} lên ${nextRank}` : 'Hạng Tối Đa'}</span>
          <span>${targetSpend ? formatPrice(targetSpend) : ''}</span>
        </div>
      </div>

      <!-- Tier Comparison Table (Dynamic) -->
      <div class="mb-8">
        <div class="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3">BẢNG QUYỀN LỢI THÀNH VIÊN</div>
        <div class="overflow-x-auto no-scrollbar whitespace-nowrap border border-zinc-100 rounded-2xl">
          ${benefitsTableHtml}
        </div>
      </div>

      <!-- Convert Points Card -->
      <div class="border border-zinc-150/70 rounded-2xl bg-white p-5 mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div class="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">ĐIỂM TÍCH LŨY HIỆN CÓ</div>
          <div class="text-2xl font-black text-amber-500 mt-1">${this.page._userProfile?.points || 0} điểm</div>
          <p class="text-xs text-zinc-450 mt-1">Đổi ngay <strong>100 điểm</strong> để nhận voucher giảm giá <strong>10K</strong>.</p>
        </div>
        <button onclick="window.accountPage.handlePointsConvert()"
          class="h-11 px-6 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-xs font-black tracking-widest uppercase transition">
          Đổi voucher 10K
        </button>
      </div>

      <!-- Points History List -->
      <div>
        <div class="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3">LỊCH SỬ ĐIỂM</div>
        <div class="divide-y divide-zinc-100 border border-zinc-100 rounded-2xl bg-white overflow-hidden max-h-60 overflow-y-auto">
          ${this.page._pointsHistory.length === 0 ? `
            <div class="p-8 text-center text-xs text-zinc-400 font-bold">Chưa có lịch sử điểm tích lũy.</div>
          ` : this.page._pointsHistory.map(hist => {
            const isEarn = hist.points > 0;
            return `
              <div class="flex items-center justify-between p-4 text-xs">
                <div>
                  <div class="font-bold text-zinc-850">${hist.description || 'Giao dịch điểm'}</div>
                  <div class="text-[10px] text-zinc-400 mt-0.5">${formatDate(hist.created_at)}</div>
                </div>
                <span class="font-black text-sm ${isEarn ? 'text-emerald-600' : 'text-zinc-650'}">
                  ${isEarn ? '+' : ''}${hist.points}đ
                </span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  bindEvents(container) {
    // Buttons inside points conversion form are managed globally in Account index.js
  }

  async handlePointsConvert() {
    if (!confirm('Bạn có chắc chắn muốn đổi 100 điểm tích lũy lấy 1 voucher 10K không?')) return;
    try {
      const res = await convertPointsToVoucher();
      alert(res.message || 'Đổi voucher thành công!');
      await this.page._loadData();
      this.page._renderDashboard(this.page._wrap);
    } catch (err) {
      alert(err.message || 'Lỗi đổi điểm.');
    }
  }
}
