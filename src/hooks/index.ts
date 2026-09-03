import { useCallback, useEffect, useState } from 'react'

/* ------------------------------------------------------------------ */
/* Мой маршрут: localStorage + ссылка для обмена                       */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = 'guzeripl.my-route.v1'

function read(): string[] {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (!v) return []
    const parsed = JSON.parse(v)
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : []
  } catch {
    return []
  }
}

const listeners = new Set<(ids: string[]) => void>()
let current: string[] | null = null

function getCurrent(): string[] {
  if (current === null) current = read()
  return current
}

function commit(next: string[]) {
  current = next
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    /* приватный режим — маршрут просто не сохранится между сессиями */
  }
  listeners.forEach((l) => l(next))
}

export function useMyRoute() {
  const [ids, setIds] = useState<string[]>(getCurrent)

  useEffect(() => {
    const l = (n: string[]) => setIds(n)
    listeners.add(l)
    setIds(getCurrent())
    return () => {
      listeners.delete(l)
    }
  }, [])

  const has = useCallback((id: string) => ids.includes(id), [ids])

  const toggle = useCallback((id: string) => {
    const now = getCurrent()
    commit(now.includes(id) ? now.filter((x) => x !== id) : [...now, id])
  }, [])

  const remove = useCallback((id: string) => {
    commit(getCurrent().filter((x) => x !== id))
  }, [])

  const clear = useCallback(() => commit([]), [])

  const replace = useCallback((next: string[]) => commit(Array.from(new Set(next))), [])

  return { ids, has, toggle, remove, clear, replace }
}

export function encodeRoute(ids: string[]): string {
  return ids.join('~')
}

export function decodeRoute(value: string): string[] {
  return value.split('~').map((s) => s.trim()).filter(Boolean)
}

/* ------------------------------------------------------------------ */
/* Медиазапрос                                                         */
/* ------------------------------------------------------------------ */

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
  )
  useEffect(() => {
    const mq = window.matchMedia(query)
    const handler = () => setMatches(mq.matches)
    handler()
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [query])
  return matches
}

export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)')

export function usePrefersReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}

/* ------------------------------------------------------------------ */
/* Метаданные страницы                                                 */
/* ------------------------------------------------------------------ */

interface SeoOptions {
  title: string
  description: string
  path: string
  jsonLd?: object
}

const SITE = 'https://example.github.io'

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.content = content
}

export function useSeo({ title, description, path, jsonLd }: SeoOptions) {
  useEffect(() => {
    document.title = title
    const origin = typeof window !== 'undefined' ? window.location.origin : SITE
    const base = import.meta.env.BASE_URL.replace(/\/$/, '')
    const canonical = `${origin}${base}${path}`

    setMeta('name', 'description', description)
    setMeta('property', 'og:title', title)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:type', 'website')
    setMeta('property', 'og:url', canonical)
    setMeta('property', 'og:site_name', 'Дорога в Гузерипль')
    setMeta('name', 'twitter:card', 'summary_large_image')

    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!link) {
      link = document.createElement('link')
      link.rel = 'canonical'
      document.head.appendChild(link)
    }
    link.href = canonical

    const prev = document.getElementById('page-jsonld')
    if (prev) prev.remove()
    if (jsonLd) {
      const s = document.createElement('script')
      s.type = 'application/ld+json'
      s.id = 'page-jsonld'
      s.textContent = JSON.stringify(jsonLd)
      document.head.appendChild(s)
    }
  }, [title, description, path, jsonLd])
}
