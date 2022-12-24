<template>
  <div
    :class="{
      'game-started': gameStarted
    }"
    style="min-height: 100%;"
  >
    <div id="firebaseui-auth-container" />

    <v-row
      v-if="loadingRestartGame"
      style="height: 90vh;"
      class="display-4 grey--text"
      justify="center"
      align="center"
    >
      Restarting game...
    </v-row>
    <div v-else>
      <div style="float: right;">
        <span class="mr-5">
          <v-menu
            v-if="user"
            offset-y
            open-on-hover
          >
            <template #activator="{ on, attrs }">
              <span
                v-bind="attrs"
                v-on="on"
              >
                <v-avatar
                  size="35"
                  class="mr-2"
                >
                  <img
                    :src="user.photoURL"
                    alt="John"
                  >
                </v-avatar>

                {{ user.displayName }}
              </span>
            </template>
            <v-list>
              <v-list-item @click="logout">
                <v-list-item-title>
                  Logout
                </v-list-item-title>
              </v-list-item>
              <v-list-item @click="$router.push('/stats')">
                <v-list-item-title>
                  Stats
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
          <v-btn
            v-else
            color="primary"
            @click="auth"
          >
            <v-icon left>mdi-account</v-icon>
            Auth
          </v-btn>
        </span>

        <LangSwitcher v-model="currentLang" />
      </div>

      <v-menu
        :close-on-content-click="false"
        transition="slide-y-transition"
        open-on-hover
        bottom
        offset-y
      >
        <template #activator="{ on }">
          <span
            v-if="currentTextSource"
            style="float: left;"
            class="grey--text"
            v-on="on"
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
        </template>

        <v-card>
          <a
            :href="currentTextSource.originalimage.source"
            target="_blank"
            rel="noopener noreferrer"
          >
            <v-img
              :src="currentTextSource.thumbnail.source"
              class="white--text align-end"
              height="200px"
            >
              <v-card-title>
                {{ currentTextSource.title }}
              </v-card-title>
            </v-img>
          </a>

          <!-- <v-card-subtitle class="pb-0">Number 10</v-card-subtitle> -->

          <v-card-text class="text--primary">
            <div>
              {{ currentTextSource.description }}
            </div>
          </v-card-text>
        </v-card>
      </v-menu>

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
        <span
          v-if="loadingRestartGame"
          class="grey--text"
        >
          Restarting game...
        </span>
        <template v-else>
          <div
            ref="input"
            :class="{ 'text-written': true, 'text-written--disabled': timer.paused }"
            :contenteditable="!timer.paused"
            spellcheck="false"
            @input="onInput"
          />
          <!-- Идёт замена на &nbsp; чтобы не исчезали отступы по краям при отображении .replace(/\s/gm, '&nbsp;') -->
          <div
            class="text-to-write"
            @click="placeCaretAtEnd"
            v-text="textToWrite"
          />
        </template>
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
      <!--      <div-->
      <!--        v-else-->
      <!--        class="text-center mt-5"-->
      <!--      >-->
      <!--        <v-btn-->
      <!--          v-if="!timer.paused"-->
      <!--          color="primary"-->
      <!--          depressed-->
      <!--          @click="showSettings = !showSettings"-->
      <!--        >-->
      <!--          Settings-->
      <!--          <v-icon right>-->
      <!--            mdi-cog-->
      <!--          </v-icon>-->
      <!--        </v-btn>-->

      <!--        <v-expand-transition>-->
      <!--          <v-card-->
      <!--            v-show="showSettings"-->
      <!--            width="500"-->
      <!--            class="mx-auto mt-3"-->
      <!--          >-->
      <!--            <v-card-text>-->
      <!--              <v-subheader>-->
      <!--                Text variant-->
      <!--              </v-subheader>-->
      <!--              <v-radio-group-->
      <!--                v-model="textVariant"-->
      <!--                row-->
      <!--              >-->
      <!--                <v-radio-->
      <!--                  label="Text"-->
      <!--                  value="text"-->
      <!--                />-->
      <!--                <v-radio-->
      <!--                  label="Special symbols"-->
      <!--                  value="specialSymbols"-->
      <!--                />-->
      <!--                <v-radio-->
      <!--                  label="Code"-->
      <!--                  value="code"-->
      <!--                />-->
      <!--                <v-radio-->
      <!--                  label="Custom text"-->
      <!--                  value="custom"-->
      <!--                />-->
      <!--              </v-radio-group>-->

      <!--              <v-textarea-->
      <!--                v-if="textVariant === 'custom'"-->
      <!--                v-model="text"-->
      <!--                filled-->
      <!--                label="Your custom text"-->
      <!--              />-->
      <!--            </v-card-text>-->
      <!--          </v-card>-->
      <!--        </v-expand-transition>-->
      <!--      </div>-->

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

            <span class="font-weight-bold">
              WPM:
            </span>
            {{ WPM }}
            <br>
            <span class="font-weight-bold">
              CPM:
            </span>
            {{ charactersCount }}
            <br>
            <span class="font-weight-bold">
              Time:
            </span>
            {{ seconds }} sec.
            <br>

            <span class="font-weight-bold">
              Text sources:
            </span>

            <ul>
              <li
                v-for="source of textSources"
                :key="'text-source' + source.title"
              >
                <a
                  :href="source.content_urls.desktop.page"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {{ source.title }}
                </a>
              </li>
            </ul>
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
  </div>
</template>

<script>
/* eslint-disable */
import { placeCaretAtEnd, setSelectionRange } from '~/utils/caret'
import { Timer } from '~/utils/timer'
import LangSwitcher from '../components/LangSwitcher'
import { removeDiacritics } from '~/utils/removeDiacritics'
import { initializeApp } from 'firebase/app';
import { getAnalytics, logEvent } from "firebase/analytics";
// import * as firebaseui from "firebaseui";
// import "firebaseui/dist/firebaseui.css";
import { signInWithPopup, setPersistence, browserLocalPersistence, onAuthStateChanged, getAuth, EmailAuthProvider, GoogleAuthProvider, PhoneAuthProvider } from "firebase/auth";
import { addDoc, collection } from "firebase/firestore";
import { getFirestore, Timestamp } from "firebase/firestore";
import {resultsCollection, analytics, auth} from "~/plugins/firebase";

// Initialize the FirebaseUI Widget using Firebase.
// const ui = new firebaseui.auth.AuthUI(auth);


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

async function fetchText (lang) {
  function stripHtml (html) {
    if (process.client) {
      const tmp = document.createElement('div')

      tmp.innerHTML = html

      return tmp.textContent
    }

    return html.replace(/<[^>]*>?/gm, '')
  }

  const textSource = (await this.$axios.get(`https://${lang}.wikipedia.org/api/rest_v1/page/random/summary`)).data
  return {
    textSource,
    // `á'ă«123»—йё,Джохо́р"́ "根室振興局'`
    text: removeDiacritics(stripHtml(
      // (await this.$axios.get('https://www.randomtext.me/api/lorem/p-20/150-200')).data.text_out
      textSource.extract
      // https://en.wikipedia.org/api/rest_v1/page/random/summary
    ))
  }
  // нужно было для Lorem ipsum
  // .slice(12)
}

const GAME_TIME = 60

export default {
  components: { LangSwitcher },
  async asyncData ({ app }) {
    const currentLang = app.$cookies.get('currentLang') || 'en'
    const { textSource, text } = await fetchText.call(app, currentLang)

    return {
      currentLang,
      text: text,
      textSources: [textSource]
    }
  },
  data () {
    return {
      user: null,
      ui: null,
      textSources: [],
      loadingMoreText: false,
      loadingRestartGame: false,
      // currentLang: (typeof localStorage !== 'undefined' && localStorage.getItem('currentLang')) || 'en',
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
      // text: 'Text loading...' // 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
    }
  },
  computed: {
    currentTextSource () {
      return this.textSources[this.textSources.length - 1]
    },
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
      return this.text
    },
    isError () {
      return this.textFormatted.slice(0, this.textWrittenFormatted.length) !== this.textWrittenFormatted
    },
    charactersCount () {
      return this.textWrittenFormatted.slice(0, this.errorStartIndex || undefined).length
    },
    WPM () {
      return Math.round(this.charactersCount / 5)
    }
  },
  watch: {
    currentLang (val) {
      this.$cookies.set('currentLang', val)
      this.restartGame()
    },
    dialog (val) {
      if (!val) this.restartGame()
    },
    showSettings () {
      this.$refs.input.focus()
    },
    async textToWrite (text) {
      if (text.length < 20 && !this.loadingMoreText) {
        this.loadingMoreText = true

        const {
          textSource,
          text
        } = await this.fetchText(this.currentLang)

        this.textSources.push(textSource)
        this.text += '|' + text

        this.loadingMoreText = false
      }
    }
  },
  async mounted () {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User

      } else {
        console.log('User is signed out')
      }

      this.user = user;
      console.log(user);
    });

    document.addEventListener('keyup', this.togglePauseListener);

    this.$refs.input.focus()
  },
  beforeDestroy() {
    document.removeEventListener('keyup', this.togglePauseListener);
  },
  methods: {
    fetchText,
    logout () {
      auth.signOut();
    },
    auth () {
      signInWithPopup(auth, new GoogleAuthProvider())
        .then((result) => {
          // This gives you a Google Access Token. You can use it to access the Google API.
          const credential = GoogleAuthProvider.credentialFromResult(result);
          const token = credential.accessToken;
          // The signed-in user info.
          const user = result.user;

          console.log(token);
          // ...
        }).catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        // ...

        console.log(errorCode)
      });

      // ui.start('#firebaseui-auth-container', {
      //   signInOptions: [
      //     EmailAuthProvider.PROVIDER_ID,
      //     GoogleAuthProvider.PROVIDER_ID,
      //     PhoneAuthProvider.PROVIDER_ID,
      //   ],
      //   callbacks: {
      //     signInSuccessWithAuthResult: function(authResult, redirectUrl) {
      //       console.log(authResult)
      //
      //       return true;
      //     },
      //   },
      //   // Other config options...
      // });
    },
    async togglePauseListener (e) {
      if (e.key === 'Enter') {
        this.timer.toggle();

        await this.$nextTick()

        this.$refs.input.focus()
      }
    },
    async resume () {
      this.timer.resume()

      await this.$nextTick()

      this.$refs.input.focus()
    },
    restartGame () {
      location.reload()
      this.loadingRestartGame = true
    },
    startGame () {
      this.gameStarted = true

      logEvent(analytics, 'game_start', {
        userId: this.user.uid,
      });

      this.timer = new Timer(async () => {
        this.seconds++

        if (this.seconds === GAME_TIME - 10) {
          // сообщает что осталось мало времени
          document.querySelector('#app').classList.add('no-time')
        }
        if (this.seconds === GAME_TIME) {
          this.timer.clear()
          document.querySelector('#app').classList.remove('no-time')

          this.dialog = true

          const doc = await addDoc(resultsCollection, {
            WPM: this.WPM,
            CPM: this.charactersCount,
            userId: this.user.uid,
            textSources: this.textSources.map(i => ({
              URL: i.content_urls.desktop.page,
              title: i.title,
            })),
            createdAt: Timestamp.now(),
            lang: this.currentLang,
          });

          logEvent(analytics, 'game_results', {
            WPM: this.WPM,
            CPM: this.charactersCount,
            userId: this.user.uid,
            lang: this.currentLang,
            docId: doc.id,
          });
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
  position: absolute
  left: 0
  top: 0
  right: 0
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
</style>
