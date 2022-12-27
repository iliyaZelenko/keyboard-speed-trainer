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

          <canvas id="chart-count" />
        </VContainer>
      </template>
    </template>
  </div>
</template>

<script>
import { auth, resultsCollection } from '~/plugins/firebase'
import { query, where, orderBy, getDocs } from 'firebase/firestore'
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
        where('lang', '==', this.currentLang),
        orderBy('createdAt', 'asc')
      )

      const querySnapshot = await getDocs(q)
      const results = querySnapshot.docs.map(i => i.data())
      const toDate = date => date.toDate().toLocaleDateString()
      const labels = results.map(i => toDate(i.createdAt))

      const countByDate = results.reduce((groups, i) => {
        const key = toDate(i.createdAt)
        const count = (groups[key] || 0)
        groups[key] = count + 1
        return groups
      }, {})

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
      console.log(Object.values(countByDate))
      // eslint-disable-next-line no-new
      new Chart(
        document.getElementById('chart-count'),
        {
          type: 'bar',
          data: {
            labels: Object.keys(countByDate),
            datasets: [{
              label: 'Number of attempts per day',
              data: Object.values(countByDate)
            }]
          },
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
                suggestedMax: 30
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

#chart-count
  max-height 400px
  margin-top 80px
</style>
