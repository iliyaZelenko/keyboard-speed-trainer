// TODO refactor to class
export function Timer (callback, delay) {
  let callbackStartTime
  let remaining = 0

  this.timerId = null
  this.paused = false

  this.pause = () => {
    this.clear()
    remaining -= Date.now() - callbackStartTime
    this.paused = true
  }
  this.resume = () => {
    window.setTimeout(this.setTimeout.bind(this), remaining)
    this.paused = false
  }
  this.toggle = () => {
    this.paused ? this.resume() : this.pause()
  }
  this.setTimeout = () => {
    this.clear()
    this.timerId = window.setInterval(() => {
      callbackStartTime = Date.now()
      callback()
    }, delay)
  }
  this.clear = () => {
    window.clearInterval(this.timerId)
  }

  this.setTimeout()
}
