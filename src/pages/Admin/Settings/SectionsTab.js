import { showToast } from '../shared/ui.js';

export function renderSectionsTab(settings) {
  const sec = settings.home_sections || {};

  const wow = sec.wow_gift || {
    eyebrow: 'Hãy WOW người thân của bạn',
    title: 'Một món quà tặng tinh tế, được giữ lại bằng ánh sáng.',
    description: 'Pha lê khắc 3D lưu giữ khoảnh khắc yêu thương trong suốt và bền lâu. Từ ảnh chân dung, lời chúc đến dáng khối, mỗi chi tiết đều được tinh chỉnh để món quà có cảm giác riêng và thật sự đáng trao.',
    btn_primary_label: 'Khám phá ngay',
    btn_primary_href: '#collections',
    btn_secondary_label: 'Xem cách chế tác',
    btn_secondary_href: '#process',
    image_url: 'public/images/imgtext_1_videoimage.png',
    caption_eyebrow: 'Pha lê cá nhân hóa',
    caption_title: 'Ảnh rõ - chữ sâu - quà gọn',
    media_type: 'video',
    video_url: 'https://www.youtube.com/watch?v=8x87TxOHXmo'
  };

  const occ = sec.occasion_stack || {
    eyebrow: 'Gợi ý theo dịp tặng',
    title: 'Chọn cảm xúc trước, chọn mẫu pha lê sau.',
    description: 'Bộ card dịp tặng giúp bạn hình dung nhanh món quà phù hợp cho sinh nhật, tình yêu hoặc người thân. Di chuột vào từng card để đưa card đó ra trước và xem rõ hơn.',
    btn_label: 'Xem các mẫu đang có',
    btn_href: '#collections',
    cards: [
      { label: 'Quà tặng sinh nhật', img: 'public/images/season_coll_1_img.png', href: '#collections' },
      { label: 'Quà tặng tình yêu', img: 'public/images/season_coll_2_img.png', href: '#collections' },
      { label: 'Quà tặng người thân', img: 'public/images/season_coll_3_img.png', href: '#collections' }
    ]
  };

  const qual = sec.quality_commitments || {
    eyebrow: 'Cam kết chế tác',
    title: 'Một món quà nhìn rõ, chạm chắc, trao đúng dịp.',
    promises: [
      { title: 'Ảnh hiển thị đầy đủ', desc: 'Ảnh sản phẩm dùng tỉ lệ contain, không cắt mất mép khối, đế gỗ hoặc chi tiết mài vát.', icon: 'fa-image' },
      { title: 'Duyệt mẫu trước khi khắc', desc: 'Bạn gửi ảnh và lời nhắn, đội ngũ dựng mẫu 3D để xác nhận bố cục trước khi sản xuất.', icon: 'fa-pen-ruler' },
      { title: 'Đóng gói quà tặng', desc: 'Mỗi khối pha lê được tư vấn hộp quà phù hợp, dễ trao tặng trong sinh nhật, kỷ niệm hoặc tri ân.', icon: 'fa-box-open' }
    ]
  };

  const story = sec.brand_story_new || {
    featured: {
      eyebrow: 'Thương hiệu hơn 30 năm cung cấp pha lê',
      title: '3Dcrystal - quà tặng pha lê dành cho những dịp đáng nhớ.',
      description: '3Dcrystal tập trung vào quà tặng pha lê cao cấp, từ chân dung 3D, kỷ niệm gia đình đến quà tri ân doanh nghiệp. Mỗi sản phẩm được tư vấn theo dịp tặng, chất liệu, kích thước và cách cá nhân hóa phù hợp.\n\nChúng tôi ưu tiên trải nghiệm rõ ràng: xem mẫu thật, chọn biến thể từ dữ liệu sản phẩm, duyệt thiết kế trước khi khắc và nhận tư vấn đóng gói để món quà sẵn sàng trao tận tay.',
      image_url: 'public/images/slider_3.png'
    },
    showroom: {
      eyebrow: 'Showroom Mcrystal',
      title: 'Hãy đến showroom để xem chất pha lê, độ trong và độ sâu khắc thực tế.',
      description: 'Đội ngũ tư vấn giúp bạn chọn dáng khối, kích thước và kiểu hộp phù hợp với người nhận.',
      btn_label: 'Thông tin liên hệ',
      btn_href: '#footer',
      video_url: 'https://www.youtube.com/embed/X1sruqMeeew'
    }
  };

  const proc = sec.process_steps || {
    eyebrow: 'Ý kiến khách hàng',
    title: 'KHÁCH HÀNG ĐÃ NÓI GÌ',
    description: 'Những đánh giá chân thực từ khách hàng đã trải nghiệm sản phẩm quà tặng pha lê 3D của chúng tôi.',
    steps: [
      { title: 'Minh Tú', rating: '5', desc: 'Sản phẩm chất lượng, giá cả hợp lý, giao hàng nhanh. Kiểu dáng độc đáo, sang trọng. Lại có khắc nội dung để tặng rất hay', avatar: 'public/images/reviewer_minh_tu.png' },
      { title: 'Ngọc Bích', rating: '5', desc: 'Tới cửa hàng mới thấy choáng ngợp vì sản phẩm đẹp lung linh, nhân viên tư vấn nhiệt tình. Sẽ ủng hộ.', avatar: 'public/images/reviewer_ngoc_bich.png' },
      { title: 'Thu Hằng', rating: '5', desc: 'Cửa hàng trưng bày sản phẩm rất đẹp mắt, nhân viên tư vấn nhiệt tình. Nhiều mẫu mã lạ mắt, sang trọng. Sẽ ủng hộ cửa hàng lâu dài.', avatar: 'public/images/reviewer_thu_hang.png' }
    ]
  };

  return `
    <div class="space-y-8 max-h-[580px] overflow-y-auto pr-2" id="sections-container">
      
      <!-- 1. WOW Gift Section -->
      <div class="border border-gray-200 rounded-xl p-5 bg-gray-50/50 space-y-4">
        <h3 class="text-sm font-bold text-gray-900 border-b pb-3 border-gray-200 flex items-center justify-between">
          <span>1. Section WOW Gift (Giới thiệu quà tặng)</span>
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Tiêu đề nhỏ (Eyebrow)</label>
            <input type="text" id="wow-eyebrow" class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#3b92ab]" value="${wow.eyebrow}" />
          </div>
          <div>
            <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Tiêu đề lớn (Title)</label>
            <input type="text" id="wow-title" class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#3b92ab]" value="${wow.title}" />
          </div>
          <div class="md:col-span-2">
            <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Đoạn mô tả (Description)</label>
            <textarea id="wow-description" class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#3b92ab] h-16 resize-none">${wow.description}</textarea>
          </div>
          <div>
            <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Nút bấm chính (Nhãn)</label>
            <input type="text" id="wow-btn-primary-label" class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#3b92ab]" value="${wow.btn_primary_label}" />
          </div>
          <div>
            <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Nút bấm chính (Liên kết)</label>
            <input type="text" id="wow-btn-primary-href" class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#3b92ab]" value="${wow.btn_primary_href}" />
          </div>
          <div>
            <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Nút bấm phụ (Nhãn)</label>
            <input type="text" id="wow-btn-secondary-label" class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#3b92ab]" value="${wow.btn_secondary_label}" />
          </div>
          <div>
            <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Nút bấm phụ (Liên kết)</label>
            <input type="text" id="wow-btn-secondary-href" class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#3b92ab]" value="${wow.btn_secondary_href}" />
          </div>
          <div>
            <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Loại phương tiện hiển thị</label>
            <select id="wow-media-type" class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#3b92ab]">
              <option value="video" ${wow.media_type === 'video' || !wow.media_type ? 'selected' : ''}>Video nhúng (YouTube)</option>
              <option value="image" ${wow.media_type === 'image' ? 'selected' : ''}>Chỉ hiển thị hình ảnh</option>
            </select>
          </div>
          <div>
            <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Đường dẫn Video YouTube</label>
            <input type="text" id="wow-video-url" class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#3b92ab]" value="${wow.video_url || 'https://www.youtube.com/watch?v=8x87TxOHXmo'}" />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-dashed border-gray-200">
          <div class="md:col-span-1 space-y-2">
            <label class="block text-[10px] font-bold text-gray-400 uppercase">Hình ảnh chính</label>
            <div class="w-full h-32 border border-gray-200 rounded-lg bg-zinc-950 relative overflow-hidden flex items-center justify-center">
              <img id="wow-image-preview" class="w-full h-full object-cover opacity-70" src="${wow.image_url}" />
              <button id="upload-wow-img-btn" class="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 text-white text-[10px] font-bold uppercase tracking-wider border-none cursor-pointer">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                Tải ảnh
              </button>
            </div>
            <input type="text" id="wow-image-url" class="w-full px-3 py-1 border border-gray-300 rounded-lg text-[10px] text-gray-500 focus:outline-none" value="${wow.image_url}" />
            <input type="file" id="wow-file-input" accept="image/*" class="hidden" />
          </div>
          <div class="md:col-span-2 space-y-3">
            <label class="block text-[10px] font-bold text-gray-400 uppercase">Chú thích hình ảnh (Caption)</label>
            <div>
              <label class="block text-[9px] text-gray-400 mb-0.5">Tiêu đề phụ của caption</label>
              <input type="text" id="wow-caption-eyebrow" class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none" value="${wow.caption_eyebrow}" />
            </div>
            <div>
              <label class="block text-[9px] text-gray-400 mb-0.5">Nội dung chính của caption</label>
              <input type="text" id="wow-caption-title" class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none" value="${wow.caption_title}" />
            </div>
          </div>
        </div>
      </div>

      <!-- 2. Gợi Ý Dịp Tặng Section -->
      <div class="border border-gray-200 rounded-xl p-5 bg-gray-50/50 space-y-4">
        <h3 class="text-sm font-bold text-gray-900 border-b pb-3 border-gray-200">2. Section Gợi Ý Dịp Tặng</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Tiêu đề nhỏ (Eyebrow)</label>
            <input type="text" id="occ-eyebrow" class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none" value="${occ.eyebrow}" />
          </div>
          <div>
            <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Tiêu đề lớn (Title)</label>
            <input type="text" id="occ-title" class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none" value="${occ.title}" />
          </div>
          <div class="md:col-span-2">
            <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Mô tả chi tiết</label>
            <textarea id="occ-description" class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none h-16 resize-none">${occ.description}</textarea>
          </div>
          <div>
            <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Nhãn nút hành động</label>
            <input type="text" id="occ-btn-label" class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none" value="${occ.btn_label}" />
          </div>
          <div>
            <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Liên kết nút hành động</label>
            <input type="text" id="occ-btn-href" class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none" value="${occ.btn_href}" />
          </div>
        </div>

        <!-- 3 Dịp tặng Cards -->
        <div class="space-y-3 pt-3 border-t border-dashed border-gray-200">
          <label class="block text-[10px] font-bold text-gray-400 uppercase">Cấu hình 3 thẻ dịp tặng (Occasion Cards)</label>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4" id="occ-cards-container">
            ${occ.cards.map((card, i) => `
              <div class="bg-white p-3 border border-gray-200 rounded-lg space-y-2 relative" data-card-idx="${i}">
                <div class="text-[9px] font-bold text-[#3b92ab]">THẺ #${i + 1}</div>
                <div>
                  <label class="block text-[8px] text-gray-400 uppercase">Tên dịp tặng</label>
                  <input type="text" class="card-label w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none" value="${card.label}" />
                </div>
                <div>
                  <label class="block text-[8px] text-gray-400 uppercase">Liên kết (Link)</label>
                  <input type="text" class="card-href w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none" value="${card.href}" />
                </div>
                <div>
                  <label class="block text-[8px] text-gray-400 uppercase">Ảnh nền</label>
                  <div class="w-full h-16 border rounded bg-zinc-950 relative overflow-hidden flex items-center justify-center mb-1">
                    <img class="card-img-preview w-full h-full object-cover opacity-70" src="${card.img}" />
                    <button class="upload-card-img-btn absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity text-white text-[8px] font-bold border-none cursor-pointer">Sửa ảnh</button>
                  </div>
                  <input type="text" class="card-img-url w-full px-2 py-0.5 border border-gray-300 rounded text-[9px] text-gray-400" value="${card.img}" />
                  <input type="file" accept="image/*" class="card-file-input hidden" />
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- 3. Cam Kết Chế Tác Section -->
      <div class="border border-gray-200 rounded-xl p-5 bg-gray-50/50 space-y-4">
        <h3 class="text-sm font-bold text-gray-900 border-b pb-3 border-gray-200">3. Section Cam Kết Chế Tác</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Tiêu đề nhỏ (Eyebrow)</label>
            <input type="text" id="qual-eyebrow" class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none" value="${qual.eyebrow}" />
          </div>
          <div>
            <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Tiêu đề lớn (Title)</label>
            <input type="text" id="qual-title" class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none" value="${qual.title}" />
          </div>
        </div>

        <!-- 3 Cam kết list -->
        <div class="space-y-3 pt-3 border-t border-dashed border-gray-200">
          <label class="block text-[10px] font-bold text-gray-400 uppercase">Danh sách 3 cam kết</label>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4" id="qual-promises-container">
            ${qual.promises.map((prom, i) => `
              <div class="bg-white p-3 border border-gray-200 rounded-lg space-y-2" data-promise-idx="${i}">
                <div class="text-[9px] font-bold text-[#3b92ab]">CAM KẾT #${i + 1}</div>
                <div>
                  <label class="block text-[8px] text-gray-400 uppercase">Tiêu đề cam kết</label>
                  <input type="text" class="promise-title w-full px-2 py-1 border border-gray-300 rounded text-xs" value="${prom.title}" />
                </div>
                <div>
                  <label class="block text-[8px] text-gray-400 uppercase">Mô tả ngắn</label>
                  <textarea class="promise-desc w-full px-2 py-1 border border-gray-300 rounded text-xs h-16 resize-none">${prom.desc}</textarea>
                </div>
                <div>
                  <label class="block text-[8px] text-gray-400 uppercase">Icon FontAwesome Class</label>
                  <input type="text" class="promise-icon w-full px-2 py-1 border border-gray-300 rounded text-xs" value="${prom.icon}" placeholder="Ví dụ: fa-image" />
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- 4. Câu Chuyện Thương Hiệu & Showroom Section -->
      <div class="border border-gray-200 rounded-xl p-5 bg-gray-50/50 space-y-4">
        <h3 class="text-sm font-bold text-gray-900 border-b pb-3 border-gray-200">4. Section Câu Chuyện Thương Hiệu & Showroom</h3>
        
        <!-- Featured Card Story -->
        <div class="p-4 bg-white border border-gray-200 rounded-lg space-y-3">
          <div class="text-xs font-bold text-[#3b92ab] uppercase">Thẻ 1: Câu chuyện thương hiệu (Bên trái)</div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-[9px] text-gray-400 uppercase mb-1">Tiêu đề nhỏ (Eyebrow)</label>
              <input type="text" id="story-feat-eyebrow" class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none" value="${story.featured.eyebrow}" />
            </div>
            <div>
              <label class="block text-[9px] text-gray-400 uppercase mb-1">Tiêu đề lớn (Title)</label>
              <input type="text" id="story-feat-title" class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none" value="${story.featured.title}" />
            </div>
            <div class="md:col-span-2">
              <label class="block text-[9px] text-gray-400 uppercase mb-1">Nội dung câu chuyện (Hỗ trợ 2 đoạn cách nhau bằng 2 dòng trống)</label>
              <textarea id="story-feat-description" class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none h-24 resize-none">${story.featured.description}</textarea>
            </div>
            <div class="md:col-span-2 space-y-1.5">
              <label class="block text-[9px] text-gray-400 uppercase">Hình ảnh câu chuyện</label>
              <div class="flex gap-4 items-center">
                <div class="w-24 h-16 border rounded bg-zinc-950 relative overflow-hidden flex items-center justify-center shrink-0">
                  <img id="story-feat-img-preview" class="w-full h-full object-cover opacity-75" src="${story.featured.image_url}" />
                  <button id="upload-story-feat-btn" class="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity text-white text-[8px] font-bold border-none cursor-pointer">Sửa ảnh</button>
                </div>
                <div class="flex-1 space-y-1">
                  <input type="text" id="story-feat-image-url" class="w-full px-3 py-1 border border-gray-300 rounded-lg text-[10px] text-gray-500 focus:outline-none" value="${story.featured.image_url}" />
                  <input type="file" id="story-feat-file-input" accept="image/*" class="hidden" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Showroom Card -->
        <div class="p-4 bg-white border border-gray-200 rounded-lg space-y-3">
          <div class="text-xs font-bold text-[#3b92ab] uppercase">Thẻ 2: Showroom Trưng Bày (Bên phải)</div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-[9px] text-gray-400 uppercase mb-1">Tiêu đề nhỏ (Eyebrow)</label>
              <input type="text" id="story-show-eyebrow" class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none" value="${story.showroom.eyebrow}" />
            </div>
            <div>
              <label class="block text-[9px] text-gray-400 uppercase mb-1">Tiêu đề lớn (Title)</label>
              <input type="text" id="story-show-title" class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none" value="${story.showroom.title}" />
            </div>
            <div class="md:col-span-2">
              <label class="block text-[9px] text-gray-400 uppercase mb-1">Mô tả ngắn</label>
              <textarea id="story-show-description" class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none h-16 resize-none">${story.showroom.description}</textarea>
            </div>
            <div>
              <label class="block text-[9px] text-gray-400 uppercase mb-1">Chữ trên nút liên kết</label>
              <input type="text" id="story-show-btn-label" class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none" value="${story.showroom.btn_label}" />
            </div>
            <div>
              <label class="block text-[9px] text-gray-400 uppercase mb-1">Đường dẫn nút (Link)</label>
              <input type="text" id="story-show-btn-href" class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none" value="${story.showroom.btn_href}" />
            </div>
            <div class="md:col-span-2">
              <label class="block text-[9px] text-gray-400 uppercase mb-1">Link nhúng video YouTube (Embed URL)</label>
              <input type="text" id="story-show-video-url" class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none" value="${story.showroom.video_url}" placeholder="Ví dụ: https://www.youtube.com/embed/..." />
            </div>
          </div>
        </div>
      </div>

      <!-- 5. Khách Hàng Đã Nói Gì Section -->
      <div class="border border-gray-200 rounded-xl p-5 bg-gray-50/50 space-y-4">
        <h3 class="text-sm font-bold text-gray-900 border-b pb-3 border-gray-200">5. Section Khách Hàng Đã Nói Gì</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Tiêu đề nhỏ (Eyebrow)</label>
            <input type="text" id="proc-eyebrow" class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none" value="${proc.eyebrow}" />
          </div>
          <div>
            <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Tiêu đề lớn (Title)</label>
            <input type="text" id="proc-title" class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none" value="${proc.title}" />
          </div>
          <div class="md:col-span-2">
            <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Mô tả tổng quan</label>
            <textarea id="proc-description" class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none h-16 resize-none">${proc.description}</textarea>
          </div>
        </div>

        <!-- Reviews configuration -->
        <div class="space-y-3 pt-3 border-t border-dashed border-gray-200">
          <label class="block text-[10px] font-bold text-gray-400 uppercase">Chi tiết các bài đánh giá</label>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3" id="proc-steps-container">
            ${proc.steps.map((step, i) => `
              <div class="bg-white p-3 border border-gray-200 rounded-lg space-y-2" data-step-idx="${i}">
                <div class="text-[9px] font-bold text-[#3b92ab]">ĐÁNH GIÁ 0${i + 1}</div>
                <div>
                  <label class="block text-[8px] text-gray-400 uppercase">Tên khách hàng</label>
                  <input type="text" class="step-title w-full px-2 py-1 border border-gray-300 rounded text-xs" value="${step.title}" />
                </div>
                <div>
                  <label class="block text-[8px] text-gray-400 uppercase">Số sao (1 - 5)</label>
                  <input type="number" class="step-rating w-full px-2 py-1 border border-gray-300 rounded text-xs" value="${step.rating || 5}" min="1" max="5" step="0.5" />
                </div>
                <div>
                  <label class="block text-[8px] text-gray-400 uppercase">Link ảnh đại diện (Avatar URL)</label>
                  <input type="text" class="step-avatar w-full px-2 py-1 border border-gray-300 rounded text-xs" value="${step.avatar || ''}" />
                </div>
                <div>
                  <label class="block text-[8px] text-gray-400 uppercase">Nội dung đánh giá</label>
                  <textarea class="step-desc w-full px-2 py-1 border border-gray-300 rounded text-xs h-20 resize-none">${step.desc || step.description || ''}</textarea>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

    </div>
  `;
}

export function bindSectionsTab(container, settings, token, API_BASE, ctx) {
  if (!settings.home_sections) settings.home_sections = {};
  
  // Set defaults on settings.home_sections if missing keys
  const sec = settings.home_sections;
  if (!sec.wow_gift) {
    sec.wow_gift = {
      eyebrow: 'Hãy WOW người thân của bạn',
      title: 'Một món quà tặng tinh tế, được giữ lại bằng ánh sáng.',
      description: 'Pha lê khắc 3D lưu giữ khoảnh khắc yêu thương trong suốt và bền lâu. Từ ảnh chân dung, lời chúc đến dáng khối, mỗi chi tiết đều được tinh chỉnh để món quà có cảm giác riêng và thật sự đáng trao.',
      btn_primary_label: 'Khám phá ngay',
      btn_primary_href: '#collections',
      btn_secondary_label: 'Xem cách chế tác',
      btn_secondary_href: '#process',
      image_url: 'public/images/imgtext_1_videoimage.png',
      caption_eyebrow: 'Pha lê cá nhân hóa',
      caption_title: 'Ảnh rõ - chữ sâu - quà gọn',
      media_type: 'video',
      video_url: 'https://www.youtube.com/watch?v=8x87TxOHXmo'
    };
  }
  if (!sec.occasion_stack) {
    sec.occasion_stack = {
      eyebrow: 'Gợi ý theo dịp tặng',
      title: 'Chọn cảm xúc trước, chọn mẫu pha lê sau.',
      description: 'Bộ card dịp tặng giúp bạn hình dung nhanh món quà phù hợp cho sinh nhật, tình yêu hoặc người thân. Di chuột vào từng card để đưa card đó ra trước và xem rõ hơn.',
      btn_label: 'Xem các mẫu đang có',
      btn_href: '#collections',
      cards: [
        { label: 'Quà tặng sinh nhật', img: 'public/images/season_coll_1_img.png', href: '#collections' },
        { label: 'Quà tặng tình yêu', img: 'public/images/season_coll_2_img.png', href: '#collections' },
        { label: 'Quà tặng người thân', img: 'public/images/season_coll_3_img.png', href: '#collections' }
      ]
    };
  }
  if (!sec.quality_commitments) {
    sec.quality_commitments = {
      eyebrow: 'Cam kết chế tác',
      title: 'Một món quà nhìn rõ, chạm chắc, trao đúng dịp.',
      promises: [
        { title: 'Ảnh hiển thị đầy đủ', desc: 'Ảnh sản phẩm dùng tỉ lệ contain, không cắt mất mép khối, đế gỗ hoặc chi tiết mài vát.', icon: 'fa-image' },
        { title: 'Duyệt mẫu trước khi khắc', desc: 'Bạn gửi ảnh và lời nhắn, đội ngũ dựng mẫu 3D để xác nhận bố cục trước khi sản xuất.', icon: 'fa-pen-ruler' },
        { title: 'Đóng gói quà tặng', desc: 'Mỗi khối pha lê được tư vấn hộp quà phù hợp, dễ trao tặng trong sinh nhật, kỷ niệm hoặc tri ân.', icon: 'fa-box-open' }
      ]
    };
  }
  if (!sec.brand_story_new) {
    sec.brand_story_new = {
      featured: {
        eyebrow: 'Thương hiệu hơn 30 năm cung cấp pha lê',
        title: '3Dcrystal - quà tặng pha lê dành cho những dịp đáng nhớ.',
        description: '3Dcrystal tập trung vào quà tặng pha lê cao cấp, từ chân dung 3D, kỷ niệm gia đình đến quà tri ân doanh nghiệp. Mỗi sản phẩm được tư vấn theo dịp tặng, chất liệu, kích thước và cách cá nhân hóa phù hợp.\n\nChúng tôi ưu tiên trải nghiệm rõ ràng: xem mẫu thật, chọn biến thể từ dữ liệu sản phẩm, duyệt thiết kế trước khi khắc và nhận tư vấn đóng gói để món quà sẵn sàng trao tận tay.',
        image_url: 'public/images/slider_3.png'
      },
      showroom: {
        eyebrow: 'Showroom Mcrystal',
        title: 'Hãy đến showroom để xem chất pha lê, độ trong và độ sâu khắc thực tế.',
        description: 'Đội ngũ tư vấn giúp bạn chọn dáng khối, kích thước và kiểu hộp phù hợp với người nhận.',
        btn_label: 'Thông tin liên hệ',
        btn_href: '#footer',
        video_url: 'https://www.youtube.com/embed/X1sruqMeeew'
      }
    };
  }
  if (!sec.process_steps) {
    sec.process_steps = {
      eyebrow: 'Quy trình đặt hàng',
      title: 'Từ ảnh chân dung đến khối pha lê hoàn thiện',
      description: 'Mỗi bước đều có điểm kiểm tra rõ ràng để sản phẩm cuối cùng đúng người, đúng dịp và đúng thông điệp.',
      steps: [
        { title: 'Chọn mẫu', desc: 'Lọc theo dáng khối, xem đủ ảnh sản phẩm, chọn kích thước và mức giá phù hợp.' },
        { title: 'Gửi nội dung', desc: 'Nhập lời khắc, gửi ảnh chân dung và ghi chú dịp tặng để đội ngũ dựng mẫu.' },
        { title: 'Duyệt thiết kế', desc: 'Xem lại bố cục mô phỏng 3D trước khi xác nhận khắc laser trong lòng pha lê.' },
        { title: 'Nhận quà', desc: 'Hoàn thiện, đóng gói và giao hàng toàn quốc theo thông tin đặt hàng của bạn.' }
      ]
    };
  }

  // --- Helper to trigger draft save and real-time preview updating ---
  const onChange = () => {
    ctx.saveSettingsDraft();
    ctx.updateMockupColors(); // In index.js, this posts the message to iframe and saves storage
  };

  // 1. WOW Gift bindings
  container.querySelector('#wow-eyebrow')?.addEventListener('input', (e) => {
    sec.wow_gift.eyebrow = e.target.value.trim();
    onChange();
  });
  container.querySelector('#wow-title')?.addEventListener('input', (e) => {
    sec.wow_gift.title = e.target.value.trim();
    onChange();
  });
  container.querySelector('#wow-description')?.addEventListener('input', (e) => {
    sec.wow_gift.description = e.target.value.trim();
    onChange();
  });
  container.querySelector('#wow-btn-primary-label')?.addEventListener('input', (e) => {
    sec.wow_gift.btn_primary_label = e.target.value.trim();
    onChange();
  });
  container.querySelector('#wow-btn-primary-href')?.addEventListener('input', (e) => {
    sec.wow_gift.btn_primary_href = e.target.value.trim();
    onChange();
  });
  container.querySelector('#wow-btn-secondary-label')?.addEventListener('input', (e) => {
    sec.wow_gift.btn_secondary_label = e.target.value.trim();
    onChange();
  });
  container.querySelector('#wow-btn-secondary-href')?.addEventListener('input', (e) => {
    sec.wow_gift.btn_secondary_href = e.target.value.trim();
    onChange();
  });
  container.querySelector('#wow-media-type')?.addEventListener('change', (e) => {
    sec.wow_gift.media_type = e.target.value;
    onChange();
  });
  container.querySelector('#wow-video-url')?.addEventListener('input', (e) => {
    sec.wow_gift.video_url = e.target.value.trim();
    onChange();
  });
  container.querySelector('#wow-image-url')?.addEventListener('input', (e) => {
    const url = e.target.value.trim();
    sec.wow_gift.image_url = url;
    const preview = container.querySelector('#wow-image-preview');
    if (preview) preview.src = url;
    onChange();
  });
  container.querySelector('#wow-caption-eyebrow')?.addEventListener('input', (e) => {
    sec.wow_gift.caption_eyebrow = e.target.value.trim();
    onChange();
  });
  container.querySelector('#wow-caption-title')?.addEventListener('input', (e) => {
    sec.wow_gift.caption_title = e.target.value.trim();
    onChange();
  });

  // WOW Image Upload
  const wowFileInput = container.querySelector('#wow-file-input');
  const wowUploadBtn = container.querySelector('#upload-wow-img-btn');
  wowUploadBtn?.addEventListener('click', () => wowFileInput.click());
  wowFileInput?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('banner', file);

    wowUploadBtn.textContent = 'Đang tải...';
    wowUploadBtn.disabled = true;

    try {
      const res = await fetch(`${API_BASE}/api/admin/settings/upload-banner`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const url = data.data.url;
        sec.wow_gift.image_url = url;
        container.querySelector('#wow-image-url').value = url;
        container.querySelector('#wow-image-preview').src = url;
        showToast('Tải lên ảnh WOW Gift thành công!', 'success');
        onChange();
      } else {
        showToast(data.error || 'Lỗi tải ảnh WOW Gift.', 'error');
      }
    } catch {
      showToast('Lỗi kết nối khi tải ảnh.', 'error');
    } finally {
      wowUploadBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        Tải ảnh
      `;
      wowUploadBtn.disabled = false;
    }
  });

  // 2. Occasion Stack bindings
  container.querySelector('#occ-eyebrow')?.addEventListener('input', (e) => {
    sec.occasion_stack.eyebrow = e.target.value.trim();
    onChange();
  });
  container.querySelector('#occ-title')?.addEventListener('input', (e) => {
    sec.occasion_stack.title = e.target.value.trim();
    onChange();
  });
  container.querySelector('#occ-description')?.addEventListener('input', (e) => {
    sec.occasion_stack.description = e.target.value.trim();
    onChange();
  });
  container.querySelector('#occ-btn-label')?.addEventListener('input', (e) => {
    sec.occasion_stack.btn_label = e.target.value.trim();
    onChange();
  });
  container.querySelector('#occ-btn-href')?.addEventListener('input', (e) => {
    sec.occasion_stack.btn_href = e.target.value.trim();
    onChange();
  });

  // 3 Cards bindings
  const cardsContainer = container.querySelector('#occ-cards-container');
  cardsContainer?.querySelectorAll('[data-card-idx]').forEach(cardRow => {
    const idx = parseInt(cardRow.dataset.cardIdx, 10);
    
    cardRow.querySelector('.card-label').addEventListener('input', (e) => {
      sec.occasion_stack.cards[idx].label = e.target.value.trim();
      onChange();
    });
    
    cardRow.querySelector('.card-href').addEventListener('input', (e) => {
      sec.occasion_stack.cards[idx].href = e.target.value.trim();
      onChange();
    });

    cardRow.querySelector('.card-img-url').addEventListener('input', (e) => {
      const url = e.target.value.trim();
      sec.occasion_stack.cards[idx].img = url;
      cardRow.querySelector('.card-img-preview').src = url;
      onChange();
    });

    // Image Upload
    const fileInput = cardRow.querySelector('.card-file-input');
    const uploadBtn = cardRow.querySelector('.upload-card-img-btn');
    uploadBtn?.addEventListener('click', () => fileInput.click());

    fileInput?.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const formData = new FormData();
      formData.append('banner', file);

      uploadBtn.textContent = '...';
      uploadBtn.disabled = true;

      try {
        const res = await fetch(`${API_BASE}/api/admin/settings/upload-banner`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });
        const data = await res.json();
        if (res.ok && data.success) {
          const url = data.data.url;
          sec.occasion_stack.cards[idx].img = url;
          cardRow.querySelector('.card-img-url').value = url;
          cardRow.querySelector('.card-img-preview').src = url;
          showToast(`Tải lên ảnh thẻ #${idx + 1} thành công!`, 'success');
          onChange();
        } else {
          showToast(data.error || 'Lỗi tải ảnh thẻ.', 'error');
        }
      } catch {
        showToast('Lỗi kết nối khi tải ảnh.', 'error');
      } finally {
        uploadBtn.textContent = 'Sửa ảnh';
        uploadBtn.disabled = false;
      }
    });
  });

  // 3. Quality bindings
  container.querySelector('#qual-eyebrow')?.addEventListener('input', (e) => {
    sec.quality_commitments.eyebrow = e.target.value.trim();
    onChange();
  });
  container.querySelector('#qual-title')?.addEventListener('input', (e) => {
    sec.quality_commitments.title = e.target.value.trim();
    onChange();
  });

  const promisesContainer = container.querySelector('#qual-promises-container');
  promisesContainer?.querySelectorAll('[data-promise-idx]').forEach(promCard => {
    const idx = parseInt(promCard.dataset.promiseIdx, 10);
    
    promCard.querySelector('.promise-title').addEventListener('input', (e) => {
      sec.quality_commitments.promises[idx].title = e.target.value.trim();
      onChange();
    });
    
    promCard.querySelector('.promise-desc').addEventListener('input', (e) => {
      sec.quality_commitments.promises[idx].desc = e.target.value.trim();
      onChange();
    });
    
    promCard.querySelector('.promise-icon').addEventListener('input', (e) => {
      sec.quality_commitments.promises[idx].icon = e.target.value.trim();
      onChange();
    });
  });

  // 4. Story featured bindings
  container.querySelector('#story-feat-eyebrow')?.addEventListener('input', (e) => {
    sec.brand_story_new.featured.eyebrow = e.target.value.trim();
    onChange();
  });
  container.querySelector('#story-feat-title')?.addEventListener('input', (e) => {
    sec.brand_story_new.featured.title = e.target.value.trim();
    onChange();
  });
  container.querySelector('#story-feat-description')?.addEventListener('input', (e) => {
    sec.brand_story_new.featured.description = e.target.value;
    onChange();
  });
  container.querySelector('#story-feat-image-url')?.addEventListener('input', (e) => {
    const url = e.target.value.trim();
    sec.brand_story_new.featured.image_url = url;
    const preview = container.querySelector('#story-feat-img-preview');
    if (preview) preview.src = url;
    onChange();
  });

  // Story Featured Image Upload
  const featFileInput = container.querySelector('#story-feat-file-input');
  const featUploadBtn = container.querySelector('#upload-story-feat-btn');
  featUploadBtn?.addEventListener('click', () => featFileInput.click());
  featFileInput?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('banner', file);

    featUploadBtn.textContent = '...';
    featUploadBtn.disabled = true;

    try {
      const res = await fetch(`${API_BASE}/api/admin/settings/upload-banner`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const url = data.data.url;
        sec.brand_story_new.featured.image_url = url;
        container.querySelector('#story-feat-image-url').value = url;
        container.querySelector('#story-feat-img-preview').src = url;
        showToast('Tải lên ảnh giới thiệu thành công!', 'success');
        onChange();
      } else {
        showToast(data.error || 'Lỗi tải ảnh.', 'error');
      }
    } catch {
      showToast('Lỗi kết nối khi tải ảnh.', 'error');
    } finally {
      featUploadBtn.textContent = 'Sửa ảnh';
      featUploadBtn.disabled = false;
    }
  });

  // Showroom bindings
  container.querySelector('#story-show-eyebrow')?.addEventListener('input', (e) => {
    sec.brand_story_new.showroom.eyebrow = e.target.value.trim();
    onChange();
  });
  container.querySelector('#story-show-title')?.addEventListener('input', (e) => {
    sec.brand_story_new.showroom.title = e.target.value.trim();
    onChange();
  });
  container.querySelector('#story-show-description')?.addEventListener('input', (e) => {
    sec.brand_story_new.showroom.description = e.target.value.trim();
    onChange();
  });
  container.querySelector('#story-show-btn-label')?.addEventListener('input', (e) => {
    sec.brand_story_new.showroom.btn_label = e.target.value.trim();
    onChange();
  });
  container.querySelector('#story-show-btn-href')?.addEventListener('input', (e) => {
    sec.brand_story_new.showroom.btn_href = e.target.value.trim();
    onChange();
  });
  container.querySelector('#story-show-video-url')?.addEventListener('input', (e) => {
    sec.brand_story_new.showroom.video_url = e.target.value.trim();
    onChange();
  });

  // 5. Process Steps bindings
  container.querySelector('#proc-eyebrow')?.addEventListener('input', (e) => {
    sec.process_steps.eyebrow = e.target.value.trim();
    onChange();
  });
  container.querySelector('#proc-title')?.addEventListener('input', (e) => {
    sec.process_steps.title = e.target.value.trim();
    onChange();
  });
  container.querySelector('#proc-description')?.addEventListener('input', (e) => {
    sec.process_steps.description = e.target.value.trim();
    onChange();
  });

  const stepsContainer = container.querySelector('#proc-steps-container');
  stepsContainer?.querySelectorAll('[data-step-idx]').forEach(stepCard => {
    const idx = parseInt(stepCard.dataset.stepIdx, 10);
    
    stepCard.querySelector('.step-title').addEventListener('input', (e) => {
      sec.process_steps.steps[idx].title = e.target.value.trim();
      onChange();
    });

    stepCard.querySelector('.step-rating').addEventListener('input', (e) => {
      sec.process_steps.steps[idx].rating = e.target.value.trim();
      onChange();
    });

    stepCard.querySelector('.step-avatar').addEventListener('input', (e) => {
      sec.process_steps.steps[idx].avatar = e.target.value.trim();
      onChange();
    });
    
    stepCard.querySelector('.step-desc').addEventListener('input', (e) => {
      sec.process_steps.steps[idx].desc = e.target.value.trim();
      onChange();
    });
  });
}
