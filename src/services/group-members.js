import { digitsOf } from './guard-rules.js'

// Resolusi identitas peserta grup. Di grup mode LID, field id peserta
// berisi LID, bukan nomor telepon; nomor asli ada di phoneNumber.
// Fitur yang men-tag atau menampilkan member WAJIB lewat sini supaya
// LID mentah tidak pernah tercetak sebagai nomor (kasus .top dan
// .topchat 2026-11-05) dan foto profil bisa diambil dari JID nomor
// telepon yang benar (kasus .ship).

// JID nomor telepon (PN) satu peserta, atau null bila tidak teresolve.
// Peserta yang cuma punya LID tanpa phoneNumber sengaja menghasilkan
// null: lebih baik dilewati daripada ditampilkan sebagai nomor palsu.
export function participantPhoneJid(participant) {
  if (!participant) return null
  if (typeof participant === 'string') {
    return participant.endsWith('@s.whatsapp.net') ? `${digitsOf(participant)}@s.whatsapp.net` : null
  }
  for (const cand of [participant.phoneNumber, participant.jid, participant.id]) {
    if (typeof cand === 'string' && cand.endsWith('@s.whatsapp.net')) {
      const digits = digitsOf(cand)
      if (digits) return `${digits}@s.whatsapp.net`
    }
  }
  return null
}

// Susun daftar member teresolve plus peta dari SEMUA digit identitas
// peserta (id LID, lid, jid, phoneNumber) ke membernya, supaya kunci
// lama berbentuk LID tetap bisa dipetakan ke nomor aslinya.
export function resolveGroupMembers(participants) {
  const members = []
  const byDigits = new Map()
  for (const p of participants ?? []) {
    const jid = participantPhoneJid(p)
    if (!jid) continue
    const digits = digitsOf(jid)
    if (byDigits.has(digits)) continue
    const member = {
      jid,
      digits,
      name: p && typeof p === 'object' ? p.notify || p.name || '' : '',
      participant: p,
    }
    members.push(member)
    byDigits.set(digits, member)
    if (p && typeof p === 'object') {
      for (const cand of [p.id, p.lid, p.jid, p.phoneNumber]) {
        const d = digitsOf(cand)
        if (d && !byDigits.has(d)) byDigits.set(d, member)
      }
    }
  }
  return { members, byDigits }
}

// Cari member dari JID/digit apa pun (PN, LID, atau JID bersuffix).
export function resolveGroupMember(participants, jid) {
  return resolveGroupMembers(participants).byDigits.get(digitsOf(jid)) ?? null
}

// Petakan daftar JID target aksi grup ke JID nomor telepon memakai
// metadata grup dari ctx. Target yang sudah PN dibiarkan apa adanya;
// target berbentuk LID diganti nomor aslinya bila teresolve, supaya
// teks konfirmasi dan array mentions selalu memakai JID nomor telepon
// (mention LID tidak terender sebagai tag nama di WhatsApp).
export async function resolveTargetsToPhone(ctx, jids) {
  const list = [...(jids ?? [])]
  if (!list.some((j) => String(j).endsWith('@lid'))) return list
  let participants = []
  try { participants = (await ctx.getGroupMetadata())?.participants ?? [] } catch { participants = [] }
  if (!participants.length) return list
  return list.map((j) => (String(j).endsWith('@lid') ? resolveGroupMember(participants, j)?.jid ?? j : j))
}
