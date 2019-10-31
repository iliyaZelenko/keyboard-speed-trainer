<template>
  <div
    :class="{
      'game-started': gameStarted,
      'game-text-loaded': currentTextSource
    }"
  >
    <div style="float: right;">
      <LangSwitcher v-model="currentLang" />
    </div>

    <span
      v-if="currentTextSource"
      style="float: left;"
      class="grey--text"
    >
      Current text taken from wikipedia's article
      <a
        :href="currentTextSource.content_urls.desktop.page"
        target="_blank"
        rel="noopener noreferrer"
      >
        "{{ currentTextSource.title }}"
      </a>
      .
    </span>
    <div
      class="game-info"
    >
      <br>
      <span class="grey--text">Characters:</span>
      {{ charactersCount }}
      <br>
      <span class="grey--text">Words per {{ seconds }} sec.:</span>
      {{ charactersCount / 5 || 0 }}
    </div>

    <!-- :style="{}" 'word-spacing': wordSpacing + 'px' -->
    <div class="text-main">
      <div
        ref="input"
        :class="{ 'text-written': true, 'text-written--disabled': timer.paused }"
        :contenteditable="!timer.paused"
        spellcheck="false"
        @input="onInput"
        @keyup.enter="timer.pause"
      />
      <!-- Идёт замена на &nbsp; чтобы не исчезали отступы по краям при отображении .replace(/\s/gm, '&nbsp;') -->
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
        <v-icon right>
          mdi-play
        </v-icon>
      </v-btn>
      <v-btn
        v-if="!timer.paused"
        color="primary"
        depressed
        @click="timer.pause"
      >
        Pause
        <v-icon right>
          mdi-pause
        </v-icon>
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
        <v-icon right>
          mdi-settings
        </v-icon>
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
/* eslint-disable */
import { placeCaretAtEnd, setSelectionRange } from '~/utils/caret'
import { Timer } from '~/utils/timer'
import LangSwitcher from '../components/LangSwitcher'
// import { removeDiacritics } from '~/utils/removeDiacritics'

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
  components: { LangSwitcher },
  data () {
    return {
      currentLang: (typeof localStorage !== 'undefined' && localStorage.getItem('currentLang')) || 'en',
      currentTextSource: null,
      textVariant: 'text',
      showSettings: false,
      dialog: false,
      gameStarted: false,
      // не использовать напрямую! Вместо этого через textWrittenFormatted
      textWritten: '',
      ignoreInput: false,
      seconds: 0,
      timer: false,
      // TODO это не правильно, ошибка может быть в любом месте
      errorStartIndex: null,
      // не использовать напрямую! Вместо этого через textFormatted
      text: 'Text loading...' // 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
    }
  },
  computed: {
    wordSpacing () {
      return (typeof localStorage !== 'undefined' && localStorage.getItem('wordSpacing')) || 30
    },
    textToWrite () {
      const start = this.errorStartIndex === null
        ? this.textWrittenFormatted.length
        : this.errorStartIndex

      return this.textFormatted.slice(start)
    },
    textWrittenFormatted () {
      return this.textWritten
        // Удаление очень странных пробелов, потратил час чтобы разобраться с ними.
        // eslint-disable-next-line no-irregular-whitespace
        .replace(/ /gm, ' ').replace(/ /gm, ' ')
    },
    textFormatted () {
      // вариант 2: удаляет символы акцента, например: è, é, á...
      return this.text // removeDiacritics(
        // без переносов
        .replace(/(\r\n|\n|\r)/gm, '')
        // много отступов на единственный пробел
        .replace(/\s\s+/gm, ' ')
        // тире на обычный дефис
        .replace(/[—–-]/gm, '-')
        .replace(/-/gm, '-')
        // TODO повтой строки
        .replace(/-/gm, '-')
        .replace(/[«»]/gm, '"')
        .replace(/[„“]/gm, '"')
        // Удаление очень странных пробелов, потратил час чтобы разобраться с ними.
        // eslint-disable-next-line no-irregular-whitespace
        .replace(/ /gm, ' ').replace(/ /gm, ' ')
        // eslint-disable-next-line no-irregular-whitespace
        // !!! .replace(/\s/gm, ' ')
        // удаляет символы которых нет на клавиатуре http://bit.ly/2q0ehn4
        // .replace(/[^\x20-\x7E]+/g, '')
        // вариант 2: удаляет символы которых нет на клавиатуре http://bit.ly/2q0ehn4
        // .replace(/[^\x20-\x7E]/g, '')
        // удаляет символы акцента, например: è, é, á... https://stackoverflow.com/a/37511463/5286034
        /* .normalize('NFD') */ .replace(/[\u0300-\u036f]/g, '')
      // )
    },
    isError () {
      return this.textFormatted.slice(0, this.textWrittenFormatted.length) !== this.textWrittenFormatted
    },
    charactersCount () {
      return this.textWrittenFormatted.slice(0, this.errorStartIndex || undefined).length
    }
  },
  watch: {
    currentLang (val) {
      localStorage.setItem('currentLang', val)
      location.reload()
    },
    dialog (val) {
      if (!val) location.reload()
    },
    showSettings () {
      this.$refs.input.focus()
    },
    async textToWrite (text) {
      if (text.length < 15) {
        this.text += '|' + await this.fetchText()
      }
    }
  },
  async mounted () {
    this.$refs.input.focus()
    // 'ă«123»—йё,Джохо́р"́ "根室振興局'
    // '1 - f -  f' +
    this.text = await this.fetchText()
  },
  methods: {
    async fetchText () {
      function stripHtml (html) {
        const tmp = document.createElement('div')

        tmp.innerHTML = html

        return tmp.textContent || tmp.innerText || ''
      }

      this.currentTextSource = (await this.$axios.get(`https://${this.currentLang}.wikipedia.org/api/rest_v1/page/random/summary`)).data

      return stripHtml(
        // (await this.$axios.get('https://www.randomtext.me/api/lorem/p-20/150-200')).data.text_out
        this.currentTextSource.extract
        // https://en.wikipedia.org/api/rest_v1/page/random/summary
      )
      // нужно было для Lorem ipsum
      // .slice(12)
    },
    async resume () {
      this.timer.resume()

      await this.$nextTick()

      this.$refs.input.focus()
    },
    startGame () {
      this.gameStarted = true

      this.timer = new Timer(() => {
        this.seconds++

        if (this.seconds === 50) {
          // сообщает что осталось мало времени
          document.querySelector('#app').classList.add('no-time')
        }
        if (this.seconds === 60) {
          this.timer.clear()
          document.querySelector('#app').classList.remove('no-time')

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
          if (this.errorStartIndex === null) this.errorStartIndex = this.textWrittenFormatted.length - 1
          this.markError(this.errorStartIndex, this.textWrittenFormatted.length)
        } else {
          this.errorStartIndex = null
          this.clearError()
        }
      })
    },
    clearError () {
      // если пустой контент, то чтобы не мешал, а то не вызывается onInput при clearError (если пустой контент)
      if (!this.textWrittenFormatted) return

      this.ignoreInput = true

      saveSelection()
      setSelectionRange(this.$refs.input, 0, this.textWrittenFormatted.length)
      document.execCommand('removeFormat')
      // TODO если ошибка исправлена, то можно возвращать на 0 позицию placeCaretAtEnd
      restoreSelection(this.$refs.input)
    },
    markError (start, end) {
      this.ignoreInput = true

      saveSelection()
      setSelectionRange(this.$refs.input, start, end)
      document.execCommand('bold')
      restoreSelection(this.$refs.input)
    },
    placeCaretAtEnd () {
      placeCaretAtEnd(this.$refs.input)
    }
  }
}
</script>

<style lang="stylus">
#app
  transition background 0.3s

  &.no-time
    background #d9fffa !important

.game-info
  transition opacity 0.3s
  opacity 0
  pointer-events none

  // http://stylus-lang.com/docs/selectors.html#initial-reference
  .game-started &
    opacity 1
    pointer-events initial

.text-main
  display flex
  justify-content center
  margin-top 15%
  font-family: Merriweather !important
  /* font-family 'Slabo 27px', serif */
  font-size: 4.5em

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
      text-decoration underline
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
    color: #9e9e9e !important

    .game-text-loaded &
      color: inherit !important
</style>
