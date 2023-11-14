import { h } from './lib/h.js'
import { cachekv } from './lib/cachekv.js'
import { ed25519 } from './keys.js'

const avatarName = async (pubkey) => {
  const mykey = await ed25519.pubkey()

  const name = h('a', [pubkey.substring(0, 7) + '...'])

  const getPrevious = await cachekv.get(pubkey)

  let previous
  if (getPrevious) { previous = JSON.parse(getPrevious)} else { previous = {} } 

  const input = h('input')

  if (previous && previous.name) {
    name.textContent = previous.name 
    input.placeholder = previous.name
  }

  const nameSpan = h('span', [
    name,
    ' ', 
  ])

  const inputSpan = h('span', [
    input,
    ' ',
    h('button', { onclick: async () => {
      if (input.value) {
        previous.name = input.value
        await cachekv.put(pubkey, JSON.stringify(previous))
        inputSpan.replaceWith(await avatarName(pubkey))
      }
    }}, ['Save'])
  ])

  const editButton = h('a', {
    onclick: () => {
      nameSpan.replaceWith(inputSpan)
    }
  }, ['✏️'])

  const avatarSpan = h('span', [
    nameSpan
  ])

  if (pubkey === mykey) {
    nameSpan.appendChild(editButton)
  }
  
  return avatarSpan 
}

const envelope = async (pubkey) => {
  const link = h('a', {
    href: '',
    onclick: (e) => {
      e.preventDefault()
      const toinput = document.getElementById('toinput')
      toinput.value = pubkey
    }
  }, ['✉️'])
  return link
}

export const avatar = async (pubkey) => {
  const span = h('span', [
    h('span', ['🧑‍💻']),
    ' ',
    await avatarName(pubkey),
    ' ',
    await envelope(pubkey)
  ])

  return span
}
