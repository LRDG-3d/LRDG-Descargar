import { useEffect, useState } from 'react'
import { ref, onValue, push, remove, set, update } from 'firebase/database'
import { db } from '../firebase.js'

function useDbList(path) {
  const [items, setItems] = useState([])

  useEffect(() => {
    const r = ref(db, path)
    const unsub = onValue(r, (snapshot) => {
      const val = snapshot.val() || {}
      const list = Object.entries(val).map(([id, data]) => ({ id, ...data }))
      setItems(list)
    })
    return unsub
  }, [path])

  return items
}

export function useCategories() {
  return useDbList('categories')
}

export function useSeasons() {
  return useDbList('seasons')
}

export function useEpisodes() {
  return useDbList('episodes')
}

export async function addCategory(name) {
  return push(ref(db, 'categories'), { name })
}
export async function deleteCategory(id) {
  return remove(ref(db, `categories/${id}`))
}

export async function addSeason(number, title, categoryId) {
  return push(ref(db, 'seasons'), { number, title: title || `Temporada ${number}`, categoryId: categoryId || null })
}
export async function deleteSeason(id) {
  return remove(ref(db, `seasons/${id}`))
}

export async function addEpisode(seasonId, title, url, order = 0, number = null) {
  return push(ref(db, 'episodes'), { seasonId, title, url, order, number })
}
export async function deleteEpisode(id) {
  return remove(ref(db, `episodes/${id}`))
}
export async function setEpisodeOrder(id, order) {
  return update(ref(db, `episodes/${id}`), { order })
}
