<template>
  <v-menu
    max-height="300"
    nudge-left="40"
    offset-y
  >
    <template #activator="{ on }">
      <v-btn
        color="primary"
        icon
        x-large
        v-on="on"
      >
        <div>
          <v-img
            :src="`https://flagcdn.com/60x45/${currentLang.flag}.png`"
            :alt="`flag(${currentLang.flag})`"
            width="32"
          />
        </div>
      </v-btn>
    </template>
    <v-list>
      <v-list-item
        v-for="lang in languages"
        :key="lang.wikiDomain"
        :color="value === lang.wikiDomain ? 'success' : null"
        @click="$emit('input', lang.wikiDomain)"
      >
        <v-list-item-avatar tile>
          <v-img
            :src="`https://flagcdn.com/60x45/${lang.flag}.png`"
            :alt="`flag(${lang.flag})`"
          />
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title>
            {{ lang.wikiDomain }}
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
export default {
  props: {
    value: {
      type: String,
      default: 'en'
    }
  },
  data () {
    return {
      languages: [
        // Английский
        {
          wikiDomain: 'en',
          flag: 'us'
        },
        // Польский
        {
          wikiDomain: 'pl',
          flag: 'pl'
        },
        // Шведский
        {
          wikiDomain: 'sv',
          flag: 'se'
        },
        // Французкий
        {
          wikiDomain: 'fr',
          flag: 'fr'
        },
        // Русский
        {
          wikiDomain: 'ru',
          flag: 'ru'
        },
        // Украинский
        {
          wikiDomain: 'uk',
          flag: 'ua'
        },
        // Белорусский
        {
          wikiDomain: 'be',
          flag: 'by'
        },
        // Китайский
        {
          wikiDomain: 'zh',
          flag: 'cn'
        },
        // Немецкий
        {
          wikiDomain: 'de',
          flag: 'de'
        },
        // Нидерландский
        {
          wikiDomain: 'nl',
          flag: 'nl'
        },
        // Итальянский
        {
          wikiDomain: 'it',
          flag: 'it'
        },
        // Испанский
        {
          wikiDomain: 'es',
          flag: 'es'
        },
        // Вьетнамский
        {
          wikiDomain: 'vi',
          flag: 'vn'
        },
        // Японский
        {
          wikiDomain: 'ja',
          flag: 'jp'
        },
        // Португальский
        {
          wikiDomain: 'pt',
          flag: 'pt'
        },
        // Арабский
        {
          wikiDomain: 'ar',
          flag: 'ae'
        },
        // Корейский
        {
          wikiDomain: 'ko',
          flag: 'kr'
        },
        // Чешский
        {
          wikiDomain: 'cs',
          flag: 'cz'
        },
        // Турецский
        {
          wikiDomain: 'tr',
          flag: 'tr'
        },
        // Датский
        {
          wikiDomain: 'da',
          flag: 'dk'
        },
        // Словацкий
        {
          wikiDomain: 'sk',
          flag: 'sk'
        },
        // Казахский
        {
          wikiDomain: 'kk',
          flag: 'kz'
        },
        // Эстонский
        {
          wikiDomain: 'et',
          flag: 'ee'
        }
        // 'en',
        // 'cn',
        // 'in',
        // 'es',
        // 'sa',
        // 'my',
        // 'ru',
        // 'bd',
        // 'pt',
        // 'fr',
        // 'jp',
        // 'ua',
        // 'de',
        // 'it',
        // 'kz',
        // 'by',
        // 'gr',
        // 'br',
        // 'pl',
        // 'se',
        // 'sk'
      ]
    }
  },
  computed: {
    currentLang () {
      return this.languages.find(i => i.wikiDomain === this.value)
    }
  }
}
</script>
