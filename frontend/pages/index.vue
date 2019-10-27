<template>
  <div>
    <div
      class="game-info"
      :style="{ 'opacity': +gameStarted }"
    >
      <span class="grey--text">Characters:</span>
      {{ charactersCount }}
      <br>
      <span class="grey--text">Words per {{ seconds }} sec.:</span>
      {{ charactersCount / 5 || 0 }}
    </div>

    <div class="text-main">
      <div
        ref="input"
        :class="{ 'text-written': true, 'text-written--disabled': timer.paused }"
        :contenteditable="!timer.paused"
        @input="onInput"
      />
      <div
        class="text-to-write"
        @click="placeCaretAtEnd"
        v-text="textToWrite"
      />
    </div>

    <div
      v-if="gameStarted"
      class="text-center mt-5"
    >
      <v-btn
        v-if="timer.paused"
        color="primary"
        depressed
        @click="resume"
      >
        Resume
      </v-btn>
      <v-btn
        v-if="!timer.paused"
        color="primary"
        depressed
        @click="timer.pause"
      >
        Pause
      </v-btn>
    </div>
    <div
      v-else
      class="text-center mt-5"
    >
      <v-btn
        v-if="!timer.paused"
        color="primary"
        depressed
        @click="showSettings = !showSettings"
      >
        Settings
      </v-btn>

      <v-expand-transition>
        <v-card
          v-show="showSettings"
          width="500"
          class="mx-auto mt-3"
        >
          <v-card-text>
            <v-subheader>
              Text variant
            </v-subheader>
            <v-radio-group
              v-model="textVariant"
              row
            >
              <v-radio
                label="Text"
                value="text"
              />
              <v-radio
                label="Special symbols"
                value="specialSymbols"
              />
              <v-radio
                label="Code"
                value="code"
              />
              <v-radio
                label="Custom text"
                value="custom"
              />
            </v-radio-group>

            <v-textarea
              v-if="textVariant === 'custom'"
              v-model="text"
              filled
              label="Your custom text"
            />
          </v-card-text>
        </v-card>
      </v-expand-transition>
    </div>

    <v-dialog
      v-model="dialog"
      max-width="290"
    >
      <v-card>
        <v-card-title class="headline">
          Your result
        </v-card-title>

        <v-card-text>
          <div class="font-weight-black display-3 text-center">
            {{ Math.round(charactersCount / 5) }}
          </div>

          WPM: {{ Math.round(charactersCount / 5) }}
          <br>
          CPM: {{ charactersCount }}
          <br>
          Time: {{ seconds }} sec.
          <br>
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn
            color="green darken-1"
            text
            @click="dialog = false"
          >
            Ok
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { placeCaretAtEnd, setSelectionRange } from '~/utils/caret'
import { Timer } from '~/utils/timer'

// TODO отрефакторить
var savedRange
function saveSelection () {
  if (window.getSelection) {
    savedRange = window.getSelection().getRangeAt(0)
  } else if (document.selection) {
    savedRange = document.selection.createRange()
  }
}

function restoreSelection (el) {
  el.focus()

  if (savedRange != null) {
    if (window.getSelection) {
      var s = window.getSelection()
      if (s.rangeCount > 0) { s.removeAllRanges() }
      s.addRange(savedRange)
    } else if (document.createRange) {
      window.getSelection().addRange(savedRange)
    } else if (document.selection) {
      savedRange.select()
    }
  }

  savedRange = null
}

export default {
  data () {
    return {
      textVariant: 'text',
      showSettings: false,
      dialog: false,
      gameStarted: false,
      textWritten: '',
      ignoreInput: false,
      seconds: 0,
      timer: false,
      // TODO это не правильно, ошибка может быть в любом месте
      errorStartIndex: null,
      text: 'Text loading...' // 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
    }
  },
  computed: {
    textToWrite () {
      const start = this.errorStartIndex === null
        ? this.textWritten.length
        : this.errorStartIndex

      return this.textFormatted.slice(start)
    },
    textFormatted () {
      return this.text
        // без переносов
        .replace(/(\r\n|\n|\r)/gm, '')
        // много отступов на единственный пробел
        .replace(/\s\s+/gm, ' ')
    },
    isError () {
      return this.textFormatted.slice(0, this.textWritten.length).trim() !== this.textWritten.trim()
    },
    charactersCount () {
      return this.textWritten.slice(0, this.errorStartIndex || undefined).length
    }
  },
  watch: {
    dialog (val) {
      if (!val) location.reload()
    },
    showSettings () {
      this.$refs.input.focus()
    }
  },
  async mounted () {
    this.$refs.input.focus()

    function stripHtml (html) {
      const tmp = document.createElement('div')

      tmp.innerHTML = html

      return tmp.textContent || tmp.innerText || ''
    }

    this.text = stripHtml(
      (await this.$axios.get('https://www.randomtext.me/api/lorem/p-20/150-200')).data.text_out
    ).slice(12)
    this.text = this.text.charAt(0).toUpperCase() + this.text.slice(1)
  },
  methods: {
    async resume () {
      this.timer.resume()

      await this.$nextTick()

      this.$refs.input.focus()
    },
    startGame () {
      this.gameStarted = true

      this.timer = new Timer(() => {
        this.seconds++

        if (this.seconds === 60) {
          this.timer.clear()
          // clearInterval(this.timer)

          this.dialog = true
        }
      }, 1000)
    },
    onInput ({ target }) {
      if (!this.gameStarted) this.startGame()

      if (this.ignoreInput) {
        this.ignoreInput = false

        return
      }

      this.textWritten = target.textContent

      this.$nextTick(() => {
        if (this.isError) {
          if (this.errorStartIndex === null) this.errorStartIndex = this.textWritten.length - 1
          this.markError(this.errorStartIndex, this.textWritten.length)
        } else {
          this.errorStartIndex = null
          this.clearError()
        }
      })
    },
    clearError () {
      // если пустой контент, то чтобы не мешал, а то не вызывается onInput при clearError (если пустой контент)
      if (!this.textWritten) return

      this.ignoreInput = true

      saveSelection()
      setSelectionRange(this.$refs.input, 0, this.textWritten.length)
      document.execCommand('removeFormat')
      // TODO если ошибка исправлена, то можно возвращать на 0 позицию placeCaretAtEnd
      restoreSelection(this.$refs.input)
    },
    markError (start, end) {
      this.ignoreInput = true

      saveSelection()
      setSelectionRange(this.$refs.input, start, end)
      document.execCommand('bold', false)
      restoreSelection(this.$refs.input)
    },
    placeCaretAtEnd () {
      placeCaretAtEnd(this.$refs.input)
    }
  }
}
</script>

<style lang="stylus">
.game-info
  transition opacity 0.3s

.text-main
  display flex
  justify-content center
  margin-top 15%
  font-family 'Slabo 27px', serif
  font-size: 3.5em

  .text-written
    min-width 50%
    text-align right
    outline none
    color cornflowerblue
    white-space nowrap
    width 200px
    overflow hidden

    &--disabled
      opacity 0.5

    b
      text-decoration line-through
      font-weight normal
      color crimson

    br
      display none

    *
      display inline
      white-space nowrap

  .text-to-write
    min-width 50%
    white-space: pre
</style>
