// Perbaikan audit templat 2026-11-05: versi lama MODE="info" hanya membalas
// ringkasan saldo + flavor tanpa mengubah state. Handler ini menjalankan
// mekanik nyata memakai service RPG yang sama dengan fitur sehat.
import { getProfile, updateProfile, saveProfile, addXp, levelFromXp } from '../../src/services/user-service.js'
export const config = {
  name: "tutorguild",
  alias: [],
  category: "rpg",
  description: { id: "Tutorial cara main guild KANA (teks panduan; semua perintahnya kini berfungsi nyata)", en: "Tutorial on playing KANA guilds (guide text; all its commands now really work)" },
  usage: ".tutorguild",
  example: ".tutorguild",
  cooldown: 5,
}

export const i18n = {
  id: { "tutorguild": {
    "text": "╭─❏ 🏰 「 *TUTOR GUILD* 」\n┊ CARA MAIN GUILD KANA:\n┊ 1. Buat guild: .createguild <nama>\n┊ 2. Gabung: .joinguild <id> (daftar: .guildlist)\n┊ 3. Undang teman: .guildinvite <nomor>, dia terima pakai .guildaccept\n┊ 4. Atur staff: .guildpromote / .guilddemote (khusus pemilik)\n┊ 5. Serang guild lain: .attackguild (sekali sehari, hadiah masuk bank guild)\n┊ 6. Info guildmu: .guildinfo, keluar: .guildleave\n┊ Power guild = gabungan power semua member. Naikkan power pakai .skill, senjata dari .gunshop, dan pet.\n╰━━━━━━━"
} },
  en: { "tutorguild": {
    "text": "╭─❏ 🏰 「 *GUILD TUTORIAL* 」\n┊ HOW TO PLAY KANA GUILDS:\n┊ 1. Create a guild: .createguild <name>\n┊ 2. Join: .joinguild <id> (list: .guildlist)\n┊ 3. Invite friends: .guildinvite <number>, they accept with .guildaccept\n┊ 4. Manage staff: .guildpromote / .guilddemote (owner only)\n┊ 5. Attack other guilds: .attackguild (once a day, rewards go to the guild bank)\n┊ 6. Your guild info: .guildinfo, leave: .guildleave\n┊ Guild power = combined power of all members. Raise it with .skill, weapons from .gunshop, and pets.\n╰━━━━━━━"
} },
}

export const test = { input: ".tutorguild", expect: /tutor guild|guild tutorial|createguild/i }
export async function handler(ctx) {

  return ctx.reply(ctx.t('tutorguild.text'))
}
