// Engine blackjack murni (tanpa I/O): dek, nilai tangan, dan alur permainan.
// State permainan serializable untuk disimpan di storage:
// { player: [card], dealer: [card], deck: [card], bet, phase, result }
// phase: 'player' (giliran pemain) | 'done'
// result: 'blackjack' | 'win' | 'push' | 'lose' | 'bust' | null
export const SUITS = ['♠', '♥', '♦', '♣']
export const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

export function newDeck() {
  const deck = []
  for (const suit of SUITS) for (const rank of RANKS) deck.push({ rank, suit })
  return deck
}

export function shuffle(deck, rng = Math.random) {
  const out = [...deck]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export function cardValue(rank) {
  if (rank === 'A') return 11
  if (['K', 'Q', 'J'].includes(rank)) return 10
  return Number(rank) || 0
}

// Nilai tangan terbaik: ace dihitung 11 selama tidak bust, lalu turun ke 1.
export function handValue(cards) {
  let total = 0
  let aces = 0
  for (const card of cards ?? []) {
    total += cardValue(card.rank)
    if (card.rank === 'A') aces += 1
  }
  while (total > 21 && aces > 0) {
    total -= 10
    aces -= 1
  }
  return total
}

export function isBlackjack(cards) {
  return Array.isArray(cards) && cards.length === 2 && handValue(cards) === 21
}

// Total koin yang dikembalikan ke pemain saat permainan selesai.
// Bet sudah dipotong di awal: menang = bet kembali + untung bet,
// blackjack natural = bet kembali + untung 3:2 (dibulatkan ke bawah),
// seri = bet kembali, kalah/bust = 0.
export function payoutFor(state) {
  const bet = Math.max(0, Math.floor(Number(state?.bet) || 0))
  switch (state?.result) {
    case 'blackjack':
      return bet + Math.floor(bet * 1.5)
    case 'win':
      return bet * 2
    case 'push':
      return bet
    default:
      return 0
  }
}

function draw(state) {
  if (!state.deck.length) state.deck = shuffle(newDeck())
  return state.deck.pop()
}

function finishDealer(state) {
  while (handValue(state.dealer) < 17) state.dealer.push(draw(state))
  const player = handValue(state.player)
  const dealer = handValue(state.dealer)
  state.phase = 'done'
  if (dealer > 21) state.result = 'win'
  else if (player > dealer) state.result = 'win'
  else if (player < dealer) state.result = 'lose'
  else state.result = 'push'
  return state
}

// Mulai permainan baru: bagi 2 kartu pemain dan 2 kartu dealer bergantian.
export function startGame(bet, rng = Math.random) {
  const state = {
    player: [],
    dealer: [],
    deck: shuffle(newDeck(), rng),
    bet: Math.max(0, Math.floor(Number(bet) || 0)),
    phase: 'player',
    result: null,
  }
  state.player.push(draw(state))
  state.dealer.push(draw(state))
  state.player.push(draw(state))
  state.dealer.push(draw(state))
  const playerBj = isBlackjack(state.player)
  const dealerBj = isBlackjack(state.dealer)
  if (playerBj || dealerBj) {
    state.phase = 'done'
    state.result = playerBj && dealerBj ? 'push' : playerBj ? 'blackjack' : 'lose'
  }
  return state
}

// Pemain mengambil satu kartu. Bust berarti langsung kalah.
export function applyHit(state) {
  if (!state || state.phase !== 'player') return state
  state.player.push(draw(state))
  const value = handValue(state.player)
  if (value > 21) {
    state.phase = 'done'
    state.result = 'bust'
  } else if (value === 21) {
    return finishDealer(state)
  }
  return state
}

// Pemain berhenti: dealer menarik kartu sampai 17+, lalu dibandingkan.
export function applyStand(state) {
  if (!state || state.phase !== 'player') return state
  return finishDealer(state)
}

export function formatCard(card) {
  return `${card.rank}${card.suit}`
}

export function formatHand(cards) {
  return (cards ?? []).map(formatCard).join(' ')
}
