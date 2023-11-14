import { h } from './lib/h.js'
import { human } from './lib/human.js'
import { avatar } from './avatar.js'
import { ws } from './ws.js'

export const render = async (m) => {
  const pubkey = await avatar(m.author)

  const content = h('div', [m.text])

  const ts = h('span', [human(new Date(m.timestamp))])

  const raw = h('code')

  const prev = h('a', {
    onclick: () => {
      ws.send(m.previous)
    }
  }, [h('code', ['prev'])])

  const rawButton = h('a', {
    href: '',
    onclick: (e) => {
      e.preventDefault()
      if (!raw.textContent) {
        raw.textContent = JSON.stringify(m)
      } else { raw.textContent = ''} 
    }
  }, ['raw'])

  setInterval(() => {
    ts.textContent = human(new Date(m.timestamp))
  }, 10000)

  const right = h('span', {style: 'float: right;'}, [
    rawButton,
    ' ',
    prev,
    ' ',
    h('code', [m.author.substring(0, 7)]),
    ' ',
    ts
  ])

  const div = h('div', {id: m.hash, classList: 'message'}, [
    right, 
    pubkey,
    ' ', 
    content,
    raw
  ])

  return div
}
