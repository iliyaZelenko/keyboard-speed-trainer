<template>
  <div>
    <template v-if="loadingUser">
      <VProgressCircular indeterminate />
    </template>
    <template v-else>
      <template v-if="!user">
        Please, sign in on main page
      </template>
      <template v-else>
        <div
          class="d-flex"
          style="justify-content: space-between; align-items: center;"
        >
          <VBtn
            color="primary"
            @click="$router.push('/')"
          >
            <VIcon left>
              mdi-arrow-left
            </VIcon>
            Go back
          </VBtn>

          <div>
            Show for the language:
            <LangSwitcher
              v-model="currentLang"
              class="ml-auto"
              with-any-option
            />
          </div>
        </div>

        <VContainer>
          <canvas id="chart" />
        </VContainer>
      </template>
    </template>
  </div>
</template>

<script>
import { auth, resultsCollection } from '~/plugins/firebase'
import { query, where, getDocs } from 'firebase/firestore'
import Chart from 'chart.js/auto'
import { onAuthStateChanged } from 'firebase/auth'
import LangSwitcher from '~/components/LangSwitcher.vue'

export default {
  name: 'Stats',
  components: { LangSwitcher },
  data () {
    return {
      currentLang: this.$cookies.get('currentLang') || 'en',
      user: null,
      loadingUser: true
    }
  },
  async mounted () {
    onAuthStateChanged(auth, (user) => {
      this.user = user
      this.loadingUser = false

      if (user) {
        this.initChart()
      }
    })
  },
  methods: {
    async initChart () {
      const q = query(
        resultsCollection,
        where('userId', '==', auth.currentUser.uid),
        where('lang', '==', this.currentLang)
      )

      const querySnapshot = await getDocs(q)
      const results = querySnapshot.docs.map(i => i.data())
      const labels = results.map(i => i.createdAt.toDate().toLocaleDateString())

      const data = {
        labels,
        datasets: [
          {
            label: 'WPM (Words Per Minute)',
            data: results.map(i => i.WPM),
            fill: true
          },
          {
            label: 'CPM (Characters Per Minute)',
            data: results.map(i => i.CPM)
          }
        ]
      }
      // eslint-disable-next-line no-unused-vars
      const chart = new Chart(
        document.getElementById('chart'),
        {
          type: 'line',
          data: data,
          options: {
            responsive: true,
            interaction: {
              intersect: false
            },
            scales: {
              x: {
                display: true,
                title: {
                  display: true
                }
              },
              y: {
                display: true,
                title: {
                  display: true,
                  text: 'Value'
                },
                suggestedMin: 0,
                suggestedMax: 300
              }
            }
          }
        }
      )
    }
  }
}
</script>

<style lang="stylus" scoped>
#chart
  max-height 400px
  margin-top 80px
</style>
