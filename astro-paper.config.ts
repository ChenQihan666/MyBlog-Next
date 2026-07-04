import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  site: {
    url: "https://qihanx.cn/",
    title: "启涵的小破站",
    description: "最慢的步伐不是跬步，而是徘徊；最快的脚步不是冲刺，而是坚持。",
    author: "Chen Qihan",
    profile: "https://qihanx.cn",
    ogImage: "default-og.jpg",
    lang: "en",
    timezone: "Asia/Shanghai",
    dir: "ltr",
  },
  posts: {
    perPage: 4,
    perIndex: 4,
    scheduledPostMargin: 15 * 60 * 1000,
  },
  features: {
    lightAndDarkMode: true,
    dynamicOgImage: true,
    showArchives: true,
    showBackButton: true,
    editPost: {
      enabled: false,
    },
    search: "pagefind",
  },
  socials: [
    { name: "github",   url: "https://github.com/ChenQihan666" },
    { name: "x",        url: "https://x.com/QihanNX" },
    { name: "telegram",        url: "https://t.me/qihannx" },
    { name: "mail",     url: "mailto:im@qihanx.cn" },
  ],
  shareLinks: [
    { name: "whatsapp", url: "https://wa.me/?text=" },
    { name: "facebook", url: "https://www.facebook.com/sharer.php?u=" },
    { name: "x",        url: "https://x.com/intent/post?url=" },
    { name: "telegram", url: "https://t.me/share/url?url=" },
    { name: "pinterest", url: "https://pinterest.com/pin/create/button/?url=" },
    { name: "mail",     url: "mailto:?subject=See%20this%20post&body=" },
  ],
});
