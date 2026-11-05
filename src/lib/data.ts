import { getDb, stories, chapters, siteSettings } from "@/db";
import { desc, eq, sql } from "drizzle-orm";

export type StoryCategory = "Full" | "Đang cook" | "Dịch" | "Fanfic";

export interface StoryItem {
  id: string;
  slug: string;
  title: string;
  author: string;
  category: StoryCategory;
  coverUrl: string | null;
  description: string | null;
  status: "ONGOING" | "COMPLETED" | "DROPPED";
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    chapters: number;
    reviews: number;
  };
}

export interface RecentChapterItem {
  id: string;
  chapterNumber: number;
  title: string;
  wordCount: number;
  createdAt: Date;
  password?: string | null;
  passwordHint?: string | null;
  story: {
    id: string;
    slug: string;
    title: string;
    author: string;
    category?: StoryCategory;
    coverUrl: string | null;
  };
}

export interface SidebarCommentItem {
  id: string;
  author: string;
  avatar?: string;
  content: string;
  targetChapter: string;
  chapterId: string;
  timeAgo: string;
}

export const VISITOR_COUNT = "282 309";

export interface ProfileExperience {
  id: string;
  title: string;
  company: string;
  time: string;
  description: string;
}

export interface ProfileProject {
  id: string;
  badge: string;
  title: string;
  author: string;
  description: string;
  link: string;
}

export interface CelineProfileData {
  name: string;
  tagline: string;
  bio: string;
  location: string;
  avatar: string;
  coverImage: string;
  socials: {
    tiktok: { handle: string; label: string; url: string };
    threads: { handle: string; label: string; url: string };
    facebook?: { handle: string; label: string; url: string };
  };
  editorNote: string;
  license: string;
  licenseNote?: string;
  experiences: ProfileExperience[];
  projects: ProfileProject[];
  tags: string[];
}

export const DEFAULT_CELINE_PROFILE: CelineProfileData = {
  name: "Celine Wang",
  tagline: "ars longa, vita brevis – nghệ thuật trường tồn, cuộc đời ngắn ngủi",
  bio: "chụp goods part-time | tui nghỉ edit rồi nhé | chia sẻ tài liệu học tập",
  location: "Trái Đất, Hệ Mặt Trời, Thiên Hà Milky Way • Hơn 500 kết nối",
  avatar: "https://i.pinimg.com/1200x/15/70/45/157045a3e240e1e2c44fd7b3f97e61f5.jpg",
  coverImage: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80",
  socials: {
    tiktok: { handle: "@celinewang94", label: "TikTok (80% embracing gravity)", url: "https://www.tiktok.com/@celinewang94" },
    threads: { handle: "@celinewang.94", label: "Threads", url: "https://www.threads.net/@celinewang.94" },
    facebook: { handle: "Celine Wang", label: "Facebook Cá Nhân", url: "https://facebook.com" },
  },
  editorNote: "Tuy có biết tiếng sương sương nhưng trình độ có hạn, phụ thuộc nhiều vào từ điển nên chỉ có thể đảm bảo bản chuyển ngữ sát nghĩa nhất có thể (trong phạm vi năng lực của mình), chứ đúng hoàn toàn thì không, vậy nên xin đừng khắt khe quá nhé ˶ˆ꒳ˆ˵",
  license: "CC BY-NC-SA 4.0",
  licenseNote: "Tất cả các bản dịch, hình ảnh và bài viết trên Media naranja được chia sẻ phi thương mại. Vui lòng không reup hoặc sao chép bản dịch khi chưa có sự đồng ý của Celine. Cảm ơn các bạn đã luôn tôn trọng công sức của người làm truyện.",
  experiences: [
    {
      id: "exp-1",
      title: "Chụp Goods Part-time & Visual Archivist",
      company: "Media Naranja Studio",
      time: "Vĩnh cửu • Trái Đất",
      description: "Lưu giữ và chia sẻ những khoảnh khắc đẹp của các ấn phẩm sách, truyện tranh, artbook và goods sưu tầm. Chia sẻ tình yêu đối với nghệ thuật thị giác và vẻ đẹp của văn hóa đọc.",
    },
    {
      id: "exp-2",
      title: "Nói Nhảm, Uống Trà & Mơ Mộng Chuyên Nghiệp",
      company: "Celine Wang Headquarters",
      time: "Toàn thời gian",
      description: "Viết blog tản văn, lắng nghe tiếng lòng của các quả cam ghé chơi, ngắm hoàng hôn và tự nhủ rằng cuộc sống luôn dịu dàng nếu ta nhìn nó qua lăng kính ấm áp.",
    },
  ],
  projects: [
    {
      id: "proj-1",
      badge: "[FULL] Edit",
      title: "Ôm Lấy Trọng Lực",
      author: "larivegauche",
      description: "Bộ truyện trượt băng nghệ thuật gắn bó sâu sắc nhất với nhà Cam. 101 chương + 3 ngoại truyện + nhật ký xuất bản.",
      link: "/truyen/om-lay-trong-luc",
    },
    {
      id: "proj-2",
      badge: "[Dịch] Văn học cổ điển",
      title: "De profundis",
      author: "Oscar Wilde",
      description: "Bản dịch bức thư bất hủ từ ngục Reading, thể hiện chiều sâu tâm tưởng và vẻ đẹp trác tuyệt của ngôn từ.",
      link: "/truyen/de-profundis",
    },
  ],
  tags: [
    "Thích đọc triện gây",
    "Người lười",
    "Hay mơ mộng",
    "Nghiện màu cam",
    "Chụp ảnh sách",
    "Thích nghe Erik Satie",
    "Lắng nghe & Thấu cảm",
    "Hạt cam ngọt ngào",
  ],
};

export const CELINE_PROFILE = DEFAULT_CELINE_PROFILE;

export interface BgmTrackItem {
  id: string;
  title: string;
  artist: string;
  youtubeId: string;
}

export const DEFAULT_BGM_PLAYLIST_ID = "PLWsWIKUX9PRq7aPRAwjjwDid_e0_K2P3Y";
export const DEFAULT_BGM_PLAYLIST_URL = "https://www.youtube.com/playlist?list=PLWsWIKUX9PRq7aPRAwjjwDid_e0_K2P3Y";

export function extractPlaylistId(urlOrId: string): string {
  if (!urlOrId) return "";
  const trimmed = urlOrId.trim();
  if (/^[a-zA-Z0-9_-]{16,50}$/.test(trimmed)) return trimmed;
  const match = trimmed.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  if (match) return match[1];
  return "";
}

// Curated official background playlist
export const DEFAULT_BGM_PLAYLIST: BgmTrackItem[] = [];

export const RECENT_SIDEBAR_COMMENTS: SidebarCommentItem[] = [];

export const FALLBACK_STORIES: StoryItem[] = [
  {
    id: "story_om_lay_trong_luc",
    slug: "om-lay-trong-luc",
    title: "Ôm Lấy Trọng Lực",
    author: "larivegauche",
    category: "Full",
    coverUrl: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=700&q=80",
    description: "Bộ truyện hiện đại trượt băng nghệ thuật kinh điển. 'Cho dù trọng lực có kéo ta rơi xuống ngàn lần, em vẫn sẽ là người dang tay ôm lấy anh giữa băng giá cuộc đời.'",
    status: "COMPLETED",
    tags: ["Full", "Đam mỹ", "Hiện đại", "Chữa lành", "Trượt băng", "Học đường"],
    createdAt: new Date("2024-05-10T08:00:00Z"),
    updatedAt: new Date("2026-11-02T10:00:00Z"),
    _count: { chapters: 86, reviews: 420 },
  },
  {
    id: "story_bay_buc_thu",
    slug: "bay-buc-thu-duoc-gui-den-sau-cai-chet-cua-ke-hoang-tuong",
    title: "Bảy bức thư được gửi đến sau cái chết của kẻ hoang tưởng",
    author: "Miêu Giới Đệ Nhất Lỗ",
    category: "Đang cook",
    coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=700&q=80",
    description: "Bảy phong thư mở ra những góc khuất u tối và day dứt nhất trong tâm trí của một kẻ hoang tưởng. Liệu cái chết là điểm kết thúc hay chỉ là khởi đầu của một ván cờ tàn?",
    status: "ONGOING",
    tags: ["Đang cook", "Đam mỹ", "Trinh thám", "Tâm lý", "Kỳ ảo", "Hồi hộp"],
    createdAt: new Date("2025-01-15T12:00:00Z"),
    updatedAt: new Date("2026-11-02T14:30:00Z"),
    _count: { chapters: 28, reviews: 156 },
  },
  {
    id: "story_gio_tin_phong",
    slug: "gio-tin-phong-thoi-ve-phia-bien",
    title: "Gió Tín Phong Thổi Về Phía Biển",
    author: "Thương Bắc Thụ",
    category: "Đang cook",
    coverUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=700&q=80",
    description: "Những ngày hè ven biển rợp nắng vàng, gió tín phong mang theo vị mặn mòi của đại dương và sự dịu dàng lặng lẽ của một người đàn ông từng trải qua bao sóng gió.",
    status: "ONGOING",
    tags: ["Đang cook", "Đam mỹ", "Niên thượng", "Chữa lành", "Đời thường", "Thâm tình"],
    createdAt: new Date("2025-06-01T09:00:00Z"),
    updatedAt: new Date("2026-11-01T18:15:00Z"),
    _count: { chapters: 35, reviews: 189 },
  },
  {
    id: "story_sternstunde",
    slug: "sternstunde",
    title: "Sternstunde",
    author: "Trĩ Sở",
    category: "Đang cook",
    coverUrl: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=700&q=80",
    description: "Khoảnh khắc xuất thần giữa muôn vì tinh tú. Bản giao hưởng tình yêu ngân vang giữa không gian bao la vô tận và thời gian ngưng đọng.",
    status: "ONGOING",
    tags: ["Đang cook", "Đam mỹ", "Vũ trụ", "Khoa học viễn tưởng", "Lãng mạn", "Ánh sao"],
    createdAt: new Date("2025-08-20T14:00:00Z"),
    updatedAt: new Date("2026-10-29T16:00:00Z"),
    _count: { chapters: 42, reviews: 275 },
  },
  {
    id: "story_de_profundis",
    slug: "de-profundis",
    title: "De profundis",
    author: "Oscar Wilde",
    category: "Dịch",
    coverUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=700&q=80",
    description: "Bản chuyển ngữ bức thư dài gửi từ ngục tối Reading, bản tự thuật bi tráng và sâu sắc nhất về nỗi đau, nghệ thuật, tình yêu và sự cứu rỗi của Oscar Wilde.",
    status: "COMPLETED",
    tags: ["Dịch", "Văn học cổ điển", "Triết lý", "Thư từ", "Nghệ thuật"],
    createdAt: new Date("2024-02-14T10:00:00Z"),
    updatedAt: new Date("2026-11-02T16:45:00Z"),
    _count: { chapters: 12, reviews: 98 },
  },
  {
    id: "story_mat_bao",
    slug: "mat-bao",
    title: "Mắt Bão",
    author: "Đàm Thạch",
    category: "Fanfic",
    coverUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=700&q=80",
    description: "Giữa tâm bão dữ dội, nơi yên tĩnh nhất chính là mắt bão — cũng là nơi hai linh hồn va vào nhau, cùng vượt qua hiểm nguy và bóng tối bao trùm.",
    status: "ONGOING",
    tags: ["Fanfic", "Edit – Fanfic", "Đam mỹ", "Hành động", "Bí ẩn", "Cường cường"],
    createdAt: new Date("2025-03-12T08:00:00Z"),
    updatedAt: new Date("2026-10-31T19:30:00Z"),
    _count: { chapters: 19, reviews: 112 },
  },
];

export const FALLBACK_RECENT_CHAPTERS: RecentChapterItem[] = [
  {
    id: "ch_omlay_44",
    chapterNumber: 44,
    title: "[EG] Chương 44: Dưới ánh đèn sân băng rực rỡ",
    wordCount: 4250,
    createdAt: new Date("2026-11-02T16:30:00Z"),
    story: {
      id: "story_om_lay_trong_luc",
      slug: "om-lay-trong-luc",
      title: "Ôm Lấy Trọng Lực",
      author: "larivegauche",
      category: "Full",
      coverUrl: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=700&q=80",
    },
  },
  {
    id: "ch_weibo_1",
    chapterNumber: 99,
    title: "[EG] Bài đăng Weibo của tác giả larivegauche",
    wordCount: 1680,
    createdAt: new Date("2026-11-02T12:00:00Z"),
    password: "medianaranja",
    passwordHint: "Tên trang web viết thường không dấu (media...)",
    story: {
      id: "story_om_lay_trong_luc",
      slug: "om-lay-trong-luc",
      title: "Ôm Lấy Trọng Lực",
      author: "larivegauche",
      category: "Full",
      coverUrl: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=700&q=80",
    },
  },
  {
    id: "ch_omlay_1",
    chapterNumber: 1,
    title: "Chương 1: Những bông tuyết đầu tiên trên mặt băng",
    wordCount: 3820,
    createdAt: new Date("2026-11-01T20:15:00Z"),
    story: {
      id: "story_om_lay_trong_luc",
      slug: "om-lay-trong-luc",
      title: "Ôm Lấy Trọng Lực",
      author: "larivegauche",
      category: "Full",
      coverUrl: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=700&q=80",
    },
  },
  {
    id: "ch_deprofundis_1",
    chapterNumber: 1,
    title: "Phần I: Thư gửi từ vực sâu khổ đau",
    wordCount: 5120,
    createdAt: new Date("2026-11-01T15:00:00Z"),
    story: {
      id: "story_de_profundis",
      slug: "de-profundis",
      title: "De profundis",
      author: "Oscar Wilde",
      category: "Dịch",
      coverUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=700&q=80",
    },
  },
  {
    id: "ch_giotinphong_1",
    chapterNumber: 1,
    title: "Chương 1: Tiếng sóng vỗ mạn thuyền lúc bình minh",
    wordCount: 3410,
    createdAt: new Date("2026-10-31T18:40:00Z"),
    story: {
      id: "story_gio_tin_phong",
      slug: "gio-tin-phong-thoi-ve-phia-bien",
      title: "Gió Tín Phong Thổi Về Phía Biển",
      author: "Thương Bắc Thụ",
      category: "Đang cook",
      coverUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=700&q=80",
    },
  },
  {
    id: "ch_sternstunde_1",
    chapterNumber: 1,
    title: "Chương 1: Tọa độ của một vì tinh tú lạc lối",
    wordCount: 4670,
    createdAt: new Date("2026-10-30T10:20:00Z"),
    story: {
      id: "story_sternstunde",
      slug: "sternstunde",
      title: "Sternstunde",
      author: "Trĩ Sở",
      category: "Đang cook",
      coverUrl: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=700&q=80",
    },
  },
];

// Rich paragraphs for demo reading of Ôm Lấy Trọng Lực & De profundis
export const CHAPTER_PARAGRAPHS_MAP: Record<string, { index: number; text: string }[]> = {
  ch_omlay_1: [
    {
      index: 1,
      text: "Mặt băng phẳng lặng như một tấm gương khổng lồ phản chiếu ánh đèn vòm nhà thi đấu. Từng luồng khí lạnh phả ra từ dưới [lưỡi trượt][[Lưỡi dao thép chuyên dụng gắn dưới đế giày trượt băng, có rãnh giữa để bám mặt băng]] mang theo cảm giác buốt giá nhưng cũng tỉnh táo đến kỳ lạ.",
    },
    {
      index: 2,
      text: "Cậu khẽ cúi người, siết chặt dây giày trượt băng màu đen mờ. Mười năm qua, [Sân băng Bolshoi][[Khu phức hợp thể thao băng nghệ thuật danh tiếng, nơi đào tạo nhiều vận động viên cự phách]] này chứng kiến từng vết xước trên đầu gối, từng giọt mồ hôi rơi xuống rồi lập tức đóng băng giữa mùa đông miền Bắc.",
    },
    {
      index: 3,
      text: "Tiếng nhạc cất lên từ chiếc loa cũ kỹ góc khán đài — khúc nhạc dạo đầu của bản valse êm dịu[efn_note]Giai điệu trích từ khúc Valse Hoa hồng của Tchaikovsky, bản nhạc bất hủ đồng hành cùng mùa thi đấu.[/efn_note]. Cậu hít một hơi sâu, đạp mạnh chân phải, cả người lướt đi trên mặt băng như một cánh chim chao lượn trong gió sớm.",
    },
    {
      index: 4,
      text: "'Trọng lực không phải là kẻ thù cản bước chân em,' giọng nói trầm ấm của người ấy từng vang bên tai cậu trong những buổi tập muộn. 'Trọng lực giữ cho chúng ta không bị văng khỏi quỹ đạo, để mỗi khi em tiếp đất, em biết luôn có người đứng đợi ở vạch băng.'",
    },
    {
      index: 5,
      text: "Cậu xoay người ba vòng trên không trung. Khoảnh khắc lơ lửng giữa ánh sáng và hư vô, cả thế giới dường như nín thở theo từng chuyển động của đường trượt.",
    },
    {
      index: 6,
      text: "Khi lưỡi dao cắm trở lại mặt băng, để lại một vệt cong hoàn hảo, tiếng vỗ tay từ phía băng ghế kỹ thuật vang lên. Cậu ngước nhìn lên khán đài, nơi có ánh mắt quen thuộc luôn dõi theo từng nhịp thở của mình.",
    },
  ],
  ch_omlay_44: [
    {
      index: 1,
      text: "Ánh đèn sân băng hội tụ rực rỡ tại điểm trung tâm. Đêm chung kết toàn quốc, áp lực đè nặng lên từng nhịp tim của khán giả đang ngồi chật kín khán đài.",
    },
    {
      index: 2,
      text: "Người ấy đứng bên ngoài rào chắn, cẩn thận quàng chiếc khăn len màu cam ấm áp quanh cổ cậu trước giờ ra sân thi đấu.",
    },
    {
      index: 3,
      text: "'Đừng nghĩ về huy chương hay điểm số,' người ấy nói, ánh mắt kiên định và dịu dàng như làn nước mùa thu. 'Hãy trượt bài này cho chính em, và cho bản thân những ngày tháng gian nan em đã đi qua.'",
    },
    {
      index: 4,
      text: "Cậu gật đầu, tháo khăn len trao lại cho anh. Giây phút bước lên sân băng, mọi nỗi hoang mang đều biến mất, chỉ còn lại sự tự do tuyệt đối của niềm đam mê cháy bỏng.",
    },
    {
      index: 5,
      text: "Cú nhảy [Axel ba vòng rưỡi][[Cú nhảy 3A (Triple Axel) - một trong những kỹ thuật khó và đòi hỏi thể lực cao nhất trong trượt băng đơn nam]] được thực hiện hoàn mỹ. Tiếng reo hò bùng nổ khắp khán phòng, và giữa muôn ngàn tiếng vỗ tay, cậu chỉ nhìn về một hướng duy nhất.",
    },
  ],
  ch_weibo_1: [
    {
      index: 1,
      text: "[Bài đăng weibo của tác giả larivegauche - Dịch bởi Celine Wang]",
    },
    {
      index: 2,
      text: "Gửi đến những độc giả thân yêu của 'Ôm Lấy Trọng Lực': Cảm ơn các bạn đã đồng hành cùng hai đứa trẻ suốt cả một mùa đông dài đầy gió tuyết.",
    },
    {
      index: 3,
      text: "Rất nhiều bạn hỏi tôi về chi tiết chiếc khăn len và bài hát ở chương kết. Thật ra, câu chuyện này bắt đầu từ một buổi chiều khi tôi tình cờ đi ngang qua một sân trượt băng công cộng ở ngoại ô...",
    },
    {
      index: 4,
      text: "Mong rằng ai trong chúng ta, dù vấp ngã bao nhiêu lần trước sức nặng của cuộc đời, cũng sẽ tìm thấy một người sẵn sàng ôm lấy mình mà không cần bất kỳ điều kiện nào.",
    },
  ],
  ch_deprofundis_1: [
    {
      index: 1,
      text: "Gửi Bosie[efn_note]Biệt danh thân mật của Lord Alfred Douglas, người tình trẻ của Oscar Wilde.[/efn_note], Sau một thời gian dài chờ đợi trong vô vọng, tôi quyết định viết cho cậu bức thư này, vì lợi ích của chính cậu cũng như của tôi...",
    },
    {
      index: 2,
      text: "[De profundis][[Thành ngữ tiếng Latinh có nghĩa 'Từ vực sâu thẳm', lấy từ Thánh Vịnh 130 trong Kinh Thánh]] là tiếng khóc than và lời tự thú đau đớn nhất rút ra từ tận đáy tâm can của một linh hồn lưu đày giữa bốn bức tường giam lạnh lẽo.",
    },
    {
      index: 3,
      text: "Nơi nào có đau khổ, nơi ấy là thánh địa thiêng liêng. Một ngày nào đó người đời sẽ nhận ra điều này. Họ sẽ hiểu rằng nỗi đau không bao giờ là vô nghĩa.",
    },
    {
      index: 4,
      text: "Nghệ thuật là một biểu hiện của tâm hồn; và tâm hồn không thể nào đạt tới độ sâu sắc tột cùng nếu chưa từng trải qua nỗi cô độc tột bậc giữa bốn bức tường giam cầm.",
    },
    {
      index: 5,
      text: "Tôi không oán hận những gì đã xảy ra. Sự đau đớn đã gột rửa trái tim tôi, dạy tôi cách tha thứ và tìm lại vẻ đẹp đích thực của sự tĩnh lặng.",
    },
  ],
};

let cachedStories: { data: StoryItem[]; timestamp: number } | null = null;
let cachedRecentChapters: { data: RecentChapterItem[]; timestamp: number } | null = null;

export function invalidateDataCache() {
  cachedStories = null;
  cachedRecentChapters = null;
}

export async function getStories(): Promise<StoryItem[]> {
  const now = Date.now();
  if (cachedStories && now - cachedStories.timestamp < 60_000) {
    return cachedStories.data;
  }

  try {
    const db = await getDb();
    if (db) {
      const rows = await db
        .select({
          id: stories.id,
          slug: stories.slug,
          title: stories.title,
          author: stories.author,
          coverUrl: stories.coverUrl,
          description: stories.description,
          status: stories.status,
          tags: stories.tags,
          updatedAt: stories.updatedAt,
          chapterCount: sql<number>`count(${chapters.id})`,
        })
        .from(stories)
        .leftJoin(chapters, eq(chapters.storyId, stories.id))
        .groupBy(stories.id)
        .orderBy(desc(stories.updatedAt));

      if (rows && rows.length > 0) {
        const result = rows.map((s) => {
          // Infer category from tags
          const tags = (s.tags as string[]) || [];
          let category: StoryCategory = "Đang cook";
          if (tags.includes("Full") || s.status === "COMPLETED") category = "Full";
          else if (tags.includes("Dịch")) category = "Dịch";
          else if (tags.includes("Fanfic")) category = "Fanfic";

          return {
            ...s,
            category,
            tags,
            _count: {
              chapters: Number(s.chapterCount || 0),
              reviews: 0,
            },
          } as unknown as StoryItem;
        });

        cachedStories = { data: result, timestamp: now };
        return result;
      }
    }
  } catch (error) {
    console.warn("Could not query D1 stories, using fallback items:", error);
  }
  return FALLBACK_STORIES;
}

export async function getRecentChapters(limit: number = 6): Promise<RecentChapterItem[]> {
  const now = Date.now();
  if (cachedRecentChapters && now - cachedRecentChapters.timestamp < 60_000) {
    return cachedRecentChapters.data.slice(0, limit);
  }

  try {
    const db = await getDb();
    if (db) {
      const rows = await db
        .select({
          id: chapters.id,
          chapterNumber: chapters.chapterNumber,
          title: chapters.title,
          wordCount: chapters.wordCount,
          createdAt: chapters.createdAt,
          password: chapters.password,
          passwordHint: chapters.passwordHint,
          storyId: stories.id,
          storySlug: stories.slug,
          storyTitle: stories.title,
          storyAuthor: stories.author,
          storyCoverUrl: stories.coverUrl,
        })
        .from(chapters)
        .innerJoin(stories, eq(chapters.storyId, stories.id))
        .orderBy(desc(chapters.createdAt))
        .limit(limit);

      if (rows && rows.length > 0) {
        const result = rows.map((r) => ({
          id: r.id,
          chapterNumber: r.chapterNumber,
          title: r.title,
          wordCount: r.wordCount,
          createdAt: r.createdAt,
          password: r.password,
          passwordHint: r.passwordHint,
          story: {
            id: r.storyId,
            slug: r.storySlug,
            title: r.storyTitle,
            author: r.storyAuthor,
            coverUrl: r.storyCoverUrl,
          },
        }));

        cachedRecentChapters = { data: result, timestamp: now };
        return result;
      }
    }
  } catch (error) {
    console.warn("Could not query D1 recent chapters, using fallback items:", error);
  }
  return FALLBACK_RECENT_CHAPTERS.slice(0, limit);
}

export async function getProfileSettings(): Promise<CelineProfileData> {
  try {
    const db = await getDb();
    if (db) {
      const rows = await db
        .select()
        .from(siteSettings)
        .where(eq(siteSettings.key, "celine_profile"))
        .limit(1);
      if (rows && rows.length > 0 && rows[0].value) {
        const parsed = JSON.parse(rows[0].value);
        return { ...DEFAULT_CELINE_PROFILE, ...parsed };
      }
    }
  } catch (error) {
    console.warn("Could not query D1 profile, using default:", error);
  }
  return DEFAULT_CELINE_PROFILE;
}

export async function getBgmPlaylist(): Promise<BgmTrackItem[]> {
  try {
    const db = await getDb();
    if (db) {
      const rows = await db
        .select()
        .from(siteSettings)
        .where(eq(siteSettings.key, "bgm_playlist"))
        .limit(1);
      if (rows && rows.length > 0 && rows[0].value) {
        const parsed = JSON.parse(rows[0].value);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    }
  } catch (error) {
    console.warn("Could not query D1 BGM playlist, using default:", error);
  }
  return DEFAULT_BGM_PLAYLIST;
}
