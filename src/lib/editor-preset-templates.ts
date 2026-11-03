import { TEMPLATE_OM_LAY_TRONG_LUC } from "./templates/template-om-lay-trong-luc";

export interface PresetTemplate {
  id: string;
  title: string;
  description: string;
  category: "cinema" | "character" | "notice" | "music" | "glossary" | "shortcode";
  iconName: string;
  htmlCode: string;
  cssCode?: string;
}

export const PRESET_TEMPLATES: PresetTemplate[] = [
  {
    id: "cinema-clapperboard-full",
    title: "1. Hồ Sơ Điện Ảnh (Clapperboard + Cast + Reels 35mm)",
    description: "Nguyên mẫu giao diện trang Ôm Lấy Trọng Lực: Bảng Clapperboard, cuộn phim 35mm, thẻ diễn viên, BGM, mục lục reels và ghi chú chân trang.",
    category: "cinema",
    iconName: "Clapperboard",
    htmlCode: TEMPLATE_OM_LAY_TRONG_LUC,
  },
  {
    id: "character-cast-cards",
    title: "2. Thẻ Nhân Vật & Diễn Viên (The Cast Cards)",
    description: "Khung giới thiệu nhân vật chính với ảnh chân dung, tên nhân vật, vai diễn và tóm tắt tính cách phong cách điện ảnh.",
    category: "character",
    iconName: "Users",
    htmlCode: `<div class="thecast" style="width: 100%;max-width: 850px;margin: 15px auto;border-radius: 6px;border: 1px solid #6d675e;overflow: hidden;font-family: 'Alegreya', serif;color: #333;background-color: #eee9e1;padding: clamp(15px, 4vw, 30px);box-shadow: 0 4px 15px rgba(0,0,0,0.06)">
    <h3 style="margin: 0 0 20px 0;font-size: clamp(1rem, 3vw, 1.15rem);text-transform: uppercase;letter-spacing: 2px;color: #6d675e;border-left: 5px solid #6d675e;padding-left: 12px;font-weight: 700">THE CAST / NHÂN VẬT</h3>
    
    <div style="display: grid;grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));gap: 20px">
        <!-- Nhân vật 1 -->
        <div style="background-color: #f7f3ed;border: 1px solid #dcd7cf;border-radius: 6px;padding: 16px;text-align: center">
            <div style="width: 100px;height: 100px;border-radius: 50%;overflow: hidden;margin: 0 auto 12px;border: 2px solid #6d675e">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80" alt="Nhân vật 1" style="width: 100%;height: 100%;object-fit: cover" />
            </div>
            <h4 style="margin: 0 0 4px;font-size: 1.1rem;font-weight: 700;color: #3d3935">Trình Dư Thanh</h4>
            <p style="margin: 0 0 8px;font-size: 0.85rem;color: #ea580c;font-family: 'Courier New', monospace;font-weight: 600">Vận động viên đơn nam</p>
            <p style="margin: 0;font-size: 0.9rem;color: #555;line-height: 1.5;font-style: italic">"Mười năm qua, sân băng Bolshoi chứng kiến từng giọt mồ hôi rơi xuống..."</p>
        </div>

        <!-- Nhân vật 2 -->
        <div style="background-color: #f7f3ed;border: 1px solid #dcd7cf;border-radius: 6px;padding: 16px;text-align: center">
            <div style="width: 100px;height: 100px;border-radius: 50%;overflow: hidden;margin: 0 auto 12px;border: 2px solid #6d675e">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80" alt="Nhân vật 2" style="width: 100%;height: 100%;object-fit: cover" />
            </div>
            <h4 style="margin: 0 0 4px;font-size: 1.1rem;font-weight: 700;color: #3d3935">Cố Liễm</h4>
            <p style="margin: 0 0 8px;font-size: 0.85rem;color: #ea580c;font-family: 'Courier New', monospace;font-weight: 600">Người ôm lấy trọng lực</p>
            <p style="margin: 0;font-size: 0.9rem;color: #555;line-height: 1.5;font-style: italic">"Trọng lực giữ cho chúng ta không bị văng khỏi quỹ đạo..."</p>
        </div>
    </div>
</div>`,
  },
  {
    id: "notice-spoiler-box",
    title: "3. Hộp Cảnh Báo, Dò Mìn & Ghi Chú Pass (Collapsible Accordion)",
    description: "Hộp đóng/mở tinh tế với viền nét đứt sang trọng, dùng để che spoiler, dò mìn, hoặc hướng dẫn giải mật khẩu chương.",
    category: "notice",
    iconName: "AlertTriangle",
    htmlCode: `<details class="note2" style="width: 100%;max-width: 850px;margin: 15px auto;border-radius: 6px;border: 1px dashed #a8a092;background-color: #f7f3ed;font-family: 'Alegreya', serif;color: #3d3935;box-shadow: 2px 2px 10px rgba(109,103,94,0.05);overflow: hidden" open>
    <summary style="padding: clamp(12px, 4vw, 18px);font-family: 'Alegreya', serif;font-size: clamp(0.9rem, 3vw, 1.05rem);font-weight: 700;cursor: pointer;background-color: #eee9e1;color: #6d675e;border-bottom: 1px dashed #a8a092;text-transform: uppercase;letter-spacing: 1px;user-select: none">
        ⚠️ 1. DÒ MÌN &amp; LƯU Ý ĐỌC TRUYỆN
    </summary>
    <div style="padding: clamp(15px, 4vw, 25px);line-height: 1.7;font-size: 0.95rem">
        <ul style="margin: 0;padding-left: 20px">
            <li style="margin-bottom: 8px"><strong>Thể loại:</strong> Hiện đại, Đam mỹ, Thể thao trượt băng nghệ thuật, Chữa lành, Niên thượng.</li>
            <li style="margin-bottom: 8px"><strong>Nhân vật chính:</strong> Cố Liễm x Trình Dư Thanh.</li>
            <li style="margin-bottom: 8px"><strong>Cảnh báo (Content Warning):</strong> Truyện có đề cập đến chấn thương thể thao, áp lực tâm lý thi đấu và phục hồi sau phẫu thuật.</li>
            <li><strong>Mật khẩu chương:</strong> Đặt cho các chương đặc biệt/ngoại truyện. Gợi ý pass nằm ở cuối chương trước đó.</li>
        </ul>
    </div>
</details>`,
  },
  {
    id: "bgm-playlist-box",
    title: "4. Khung Nhạc BGM & Lời Nhắn Editor",
    description: "Khung nhúng nhạc nền Spotify hoặc MP3 kèm lời nhắn cảm xúc từ Editor.",
    category: "music",
    iconName: "Music",
    htmlCode: `<div class="bgm" style="width: 100%;max-width: 850px;margin: 15px auto;border-radius: 6px;border: 1px solid #6d675e;overflow: hidden;font-family: 'Alegreya', serif;color: #333;background-color: #eee9e1;padding: clamp(15px, 4vw, 30px);box-shadow: 0 4px 15px rgba(0,0,0,0.06)">
    <h3 style="margin: 0 0 15px 0;font-size: clamp(1rem, 3vw, 1.15rem);text-transform: uppercase;letter-spacing: 2px;color: #6d675e;border-left: 5px solid #6d675e;padding-left: 12px;font-weight: 700">V. BGM / SOUNDTRACK CỦA CÂU CHUYỆN</h3>
    
    <p style="margin: 0 0 16px 0;font-style: italic;font-size: 0.95rem;color: #555;line-height: 1.6">
        "Âm nhạc là linh hồn của những bài thi trượt băng. Hãy vừa lắng nghe danh sách bài hát này vừa bước vào thế giới tuyết trắng cùng Dư Thanh và Cố Liễm nhé."
    </p>

    <!-- Smart Shortcode BGM: Tự động render trình nghe nhạc Spotify hoặc Audio -->
    [bgm src="https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M" title="Embracing Gravity — OST Official Playlist"]
</div>`,
  },
  {
    id: "glossary-terms-grid",
    title: "5. Bảng Thuật Ngữ Chuyên Môn (Field Knowledge)",
    description: "Hộp giải nghĩa các thuật ngữ kỹ thuật (như các cú nhảy trượt băng, từ ngữ chuyên ngành) xếp theo lưới 2 cột gọn gàng.",
    category: "glossary",
    iconName: "BookOpen",
    htmlCode: `<div class="thuatngu" style="width: 100%;max-width: 850px;margin: 15px auto;border-radius: 6px;border: 1px solid #6d675e;overflow: hidden;font-family: 'Alegreya', serif;color: #333;background-color: #eee9e1;padding: clamp(20px, 5vw, 35px);box-shadow: 0 4px 15px rgba(0,0,0,0.06)">
    <h3 style="margin: 0 0 20px 0;font-size: clamp(1rem, 3vw, 1.15rem);text-transform: uppercase;letter-spacing: 2px;color: #6d675e;border-left: 5px solid #6d675e;padding-left: 12px;font-weight: 700">IV. FIELD KNOWLEDGE / THUẬT NGỮ CHUYÊN MÔN</h3>
    
    <div style="display: grid;grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));gap: 15px">
        <div style="background-color: #f7f3ed;padding: 14px 16px;border-radius: 6px;border: 1px solid #dcd7cf">
            <h4 style="margin: 0 0 6px;font-size: 1rem;font-weight: 700;color: #ea580c">1. Cú nhảy Axel (3A - Axel ba vòng rưỡi)</h4>
            <p style="margin: 0;font-size: 0.88rem;color: #555;line-height: 1.5">Cú nhảy duy nhất cất cánh về phía trước, có thêm nửa vòng xoay trên không. Được coi là cú nhảy có độ khó kỹ thuật cao nhất trong các cú nhảy xoay vòng.</p>
        </div>
        <div style="background-color: #f7f3ed;padding: 14px 16px;border-radius: 6px;border: 1px solid #dcd7cf">
            <h4 style="margin: 0 0 6px;font-size: 1rem;font-weight: 700;color: #ea580c">2. Cú nhảy Quadruple (Quad - Bốn vòng)</h4>
            <p style="margin: 0;font-size: 0.88rem;color: #555;line-height: 1.5">Nhảy lên và xoay đủ 4 vòng trên không trung trong chưa đầy 0.7 giây, tiếp đất bằng lưỡi trượt chịu lực gấp 5-8 lần trọng lượng cơ thể.</p>
        </div>
    </div>
</div>`,
  },
  {
    id: "smart-shortcodes-pack",
    title: "6. Khối Mục Lục Thông Minh (Smart Shortcode Reels)",
    description: "Bộ Shortcode tự động sinh lưới chương 01 đến 48, 49 đến 101 và danh sách ngoại truyện liên kết trực tiếp database.",
    category: "shortcode",
    iconName: "ListTree",
    htmlCode: `<!-- 1. Phần Thượng: Các chương từ 1 đến 48 -->
[muc_luc style="grid" from="1" to="48" title="🎞️ REEL 01: PHẦN THƯỢNG (CHƯƠNG 01 - 48)"]

<!-- 2. Phần Hạ: Các chương từ 49 đến 101 -->
[muc_luc style="grid" from="49" to="101" title="🎞️ REEL 02: PHẦN HẠ (CHƯƠNG 49 - 101)"]

<!-- 3. Ngoại truyện -->
[muc_luc style="list" type="extra" title="🎞️ EXTRA SCENES: NGOẠI TRUYỆN & ĐẶC BIỆT"]`,
  },
];
