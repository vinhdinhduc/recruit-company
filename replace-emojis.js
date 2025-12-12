// Script để tìm và thay thế tất cả emoji trong dự án
// Chạy: node replace-emojis.js

const fs = require("fs");
const path = require("path");

const emojiMappings = {
  // Common icons
  "💼": "icon={['fas', 'briefcase']}",
  "📧": "icon={['fas', 'envelope']}",
  "🔒": "icon={['fas', 'lock']}",
  "🔑": "icon={['fas', 'key']}",
  "📱": "icon={['fas', 'phone']}",
  "👤": "icon={['fas', 'user']}",
  "📝": "icon={['fas', 'file-alt']}",
  "💾": "icon={['fas', 'bookmark']}",
  "👁️": "icon={['fas', 'eye']}",
  "👁️‍🗨️": "icon={['fas', 'eye-slash']}",
  "✉️": "icon={['fas', 'envelope']}",
  "📊": "icon={['fas', 'chart-line']}",
  "⚠️": "icon={['fas', 'exclamation-triangle']}",
  "✓": "icon={['fas', 'check']}",
  "→": "icon={['fas', 'arrow-right']}",
  "←": "icon={['fas', 'arrow-left']}",
  "🎯": "icon={['fas', 'bullseye']}",
  "🤝": "icon={['fas', 'handshake']}",
  "🏠": "icon={['fas', 'home']}",
  "🚪": "icon={['fas', 'sign-out-alt']}",
  "🔔": "icon={['fas', 'bell']}",
  "🏢": "icon={['fas', 'building']}",
  "➕": "icon={['fas', 'plus']}",
  "📋": "icon={['fas', 'tasks']}",
  "👥": "icon={['fas', 'users']}",
  "📂": "icon={['fas', 'folder']}",
  "🔍": "icon={['fas', 'search']}",
  "☰": "icon={['fas', 'bars']}",
};

const brandIconMappings = {
  G: "icon={['fab', 'google']}",
  in: "icon={['fab', 'linkedin-in']}",
  f: "icon={['fab', 'facebook']}",
};

console.log("Emoji to FontAwesome Icon Mappings:");
console.log("===================================");
Object.entries(emojiMappings).forEach(([emoji, icon]) => {
  console.log(`${emoji} => <FontAwesomeIcon ${icon} />`);
});
console.log("\nBrand Icons:");
Object.entries(brandIconMappings).forEach(([text, icon]) => {
  console.log(`"${text}" => <FontAwesomeIcon ${icon} />`);
});
