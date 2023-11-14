import { h } from './lib/h.js'
import { open } from './sbog.js'
import { unbox } from './sbox.js'
import { make } from './blob.js'
import { render } from './render.js'
import { cachekv } from './lib/cachekv.js'

export const process = async (m, scroller) => {
  const msg = await JSON.parse(m)
  if (msg.type === 'post') {
    console.log('POST')
    
    const opened = await open(msg.payload)
    if (msg.latest) {
      const previous = {
        msg: opened
      }
      if (msg.name) {previous.name = msg.name}
      await cachekv.put(opened.author, (JSON.stringify(previous)))
    }

    if (msg.boxed) {
      opened.text =  '🔒 '
      opened.text = opened.text + (await unbox(msg.boxed) || '')
    } else {
      opened.text = msg.blob
    }
    const rendered = await render(opened)
    if (!scroller.firstChild) {
      scroller.appendChild(rendered)
    } else {
      scroller.insertBefore(rendered, scroller.firstChild)
    }

  }
}
