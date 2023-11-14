import { h } from './lib/h.js'
import { ws } from './ws.js'
import { ed25519 } from './keys.js'
import { publish, open } from './sbog.js' 
import { find } from './blob.js'
import { box } from './sbox.js'
import { cachekv } from './lib/cachekv.js'
import { avatar } from './avatar.js'

const pubkey = await ed25519.pubkey()

const search = h('input', {placeholder: 'Search'})

const searchButton = h('button', {onclick: () => {
  if (search.value.length === 44) {
    ws.send(search.value)
  }
}}, ['Search'])

const searchDiv = h('span', {style: 'float: right;'}, [
  search, 
  searchButton
])

const id = await avatar(pubkey)

const to = h('input', {placeholder: 'Pubkey', id: 'toinput'})

const textarea = h('textarea', {placeholder: 'Write a message', style: 'width: 98%;'})

const button = h('button', {
  onclick: async () => {
    const getPrevious = await cachekv.get(pubkey)

    let previous
    if (!getPrevious) { previous = {} }
    if (getPrevious) {
      previous = JSON.parse(getPrevious)
    }

    let previousHash
    if (previous && previous.msg) {
      previousHash = previous.msg.hash
    }

    if (to.value && to.value.length === 44 && textarea.value) {
      const boxed = await box(textarea.value, to.value)
      const signed = await publish(boxed, previousHash)
      const opened = await open(signed)
      const obj = {
        type: 'post',
        latest: true,
        payload: signed,
        boxed
      }
      if (previous && previous.name) {
        obj.name = previous.name
      }
      ws.send(JSON.stringify(obj))
      previous.msg = opened 
      cachekv.put(pubkey, JSON.stringify(previous))  
      textarea.value = ''
    } else if (!to.value && textarea.value) {
      let previousHash
      if (previous && previous.msg) {
        previousHash = previous.msg.hash
      } 
      const signed = await publish(textarea.value, previousHash)  
      const opened = await open(signed)
      const blob = await find(opened.data)
      const obj = {
        type: 'post',
        latest: true,
        payload: signed,
        blob
      }
      if (previous && previous.name) {
        obj.name = previous.name
      }
      ws.send(JSON.stringify(obj))
      previous.msg = opened
      cachekv.put(pubkey, JSON.stringify(previous))  
      textarea.value = ''
    } 
  }
}, ['Send'])

export const composer = h('div', {classList: 'message'}, [
  searchDiv,
  id,
  textarea,
  h('br'),
  button,
  ' ',
  to,
])

