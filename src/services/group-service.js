// Pengaturan grup: namespace 'groups', key = JID grup, value = objek settings.
// Semua fitur grup (proteksi, welcome, jadwal, pengingat) berbagi objek ini.
export const DEFAULT_GROUP_SETTINGS = {
  lang: '',
  welcome: false,
  goodbye: false,
  antilink: false,
  antispam: false,
  antitoxic: false,
  antijudol: false,
  antiphising: false,
  antidocument: false,
  antisticker: false,
  antiflood: false,
  antitagsw: false,
  antivirtex: false,
  antihidetag: false,
  anticulik: false,
  warnLimit: 3,
  slowmodeSec: 0,
  introTemplate: '',
  rules: '',
  toxicWords: [],
  customCommands: {},
  openClose: null, // { open: 'HH:mm', close: 'HH:mm', state: 'open'|'closed' }
  prayerReminder: false,
  prayerCity: '',
  religiTime: '',
  afk: {}, // digits -> { reason, since }
  warns: {}, // digits -> jumlah warn
}

export async function getGroupSettings(storage, jid) {
  const saved = await storage.get('groups', jid)
  return { ...DEFAULT_GROUP_SETTINGS, ...(saved ?? {}) }
}

export async function saveGroupSettings(storage, jid, settings) {
  await storage.set('groups', jid, settings)
  return settings
}

export async function updateGroupSettings(storage, jid, patch) {
  const settings = await getGroupSettings(storage, jid)
  Object.assign(settings, patch)
  return saveGroupSettings(storage, jid, settings)
}
