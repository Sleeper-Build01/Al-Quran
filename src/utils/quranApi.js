// Uses Al-Quran Cloud API (free, no key needed)
// Docs: https://alquran.cloud/api

const BASE = 'https://api.alquran.cloud/v1'

export async function getSurahList() {
  const res = await fetch(`${BASE}/surah`)
  const data = await res.json()
  return data.data
}

export async function getSurah(number, edition = 'quran-uthmani') {
  const res = await fetch(`${BASE}/surah/${number}/${edition}`)
  const data = await res.json()
  return data.data
}

export async function getAyatWithTranslations(surahNumber) {
  const [arabic, english, urdu] = await Promise.all([
    fetch(`${BASE}/surah/${surahNumber}/quran-uthmani`).then(r => r.json()),
    fetch(`${BASE}/surah/${surahNumber}/en.asad`).then(r => r.json()),
    fetch(`${BASE}/surah/${surahNumber}/ur.jalandhry`).then(r => r.json()),
  ])
  return {
    arabic: arabic.data,
    english: english.data,
    urdu: urdu.data,
  }
}

export async function searchQuran(keyword) {
  const res = await fetch(`${BASE}/search/${encodeURIComponent(keyword)}/all/en`)
  const data = await res.json()
  return data.data?.matches || []
}

// Audio URL for recitations
// Reciter codes: ar.alafasy, ar.abdurrahmaansudais, ar.husary
export function getAudioUrl(surahNumber, ayahNumber, reciter = 'ar.alafasy') {
  const s = String(surahNumber).padStart(3, '0')
  const a = String(ayahNumber).padStart(3, '0')
  return `https://cdn.islamic.network/quran/audio/128/${reciter}/${s}${a}.mp3`
}

export const RECITERS = [
  { id: 'ar.alafasy', name: 'Sheikh Mishary Alafasy' },
  { id: 'ar.abdurrahmaansudais', name: 'Sheikh Abdurrahman Al-Sudais' },
  { id: 'ar.husary', name: 'Sheikh Mahmoud Khalil Al-Husary' },
]
