import { afterEach } from 'vitest'

Element.prototype.getAnimations = () => []

afterEach(() => {
  document.body.replaceChildren()
  localStorage.clear()
})
