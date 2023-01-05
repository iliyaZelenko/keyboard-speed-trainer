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
              @input="rebuild"
            />
          </div>
        </div>

        <template v-if="averageLast15Results != null">
          <br>
          Average score over 15 attempts: <b>{{ averageLast15Results.toFixed(2) }}</b>
        </template>
        <template v-if="totalAttempts != null">
          <br>
          Total attempts: <b>{{ totalAttempts }}</b>
        </template>

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
      loadingUser: true,
      chart1: null,
      chart2: null,
      totalAttempts: null,
      averageLast15Results: null
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
    rebuild () {
      this.chart1.destroy()
      this.chart2.destroy()

      this.initChart()
      // this.$forceUpdate()
    },
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

      this.totalAttempts = results.length
      this.averageLast15Results = results
        .slice(-15)
        .reduce((sum, i) => sum + i.CPM, 0) / 15

      const data = {
        labels,
        datasets: [
          {
            label: 'WPM (Words Per Minute)',
            data: results.map(i => i.WPM),
            fill: true,
            tension: 0.9
          },
          {
            label: 'CPM (Characters Per Minute)',
            data: results.map(i => i.CPM),
            tension: 0.6
          }
        ]
      }
      this.chart1 = new Chart(
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

      const countByDate = results.reduce((groups, i) => {
        const key = toDate(i.createdAt)
        groups[key] ??= {
          count: null,
          sumWPM: null
        }
        const count = (groups[key].count ?? 0)
        groups[key].count = count + 1
        groups[key].sumWPM += i.WPM

        return groups
      }, {})

      const values = Object.values(countByDate)
      this.chart2 = new Chart(
        document.getElementById('chart-count'),
        {
          data: {
            labels: Object.keys(countByDate),
            datasets: [{
              type: 'bar',
              label: 'Number of attempts per day',
              data: values.map(i => i.count)
            }, {
              type: 'line',
              label: 'Average WPM',
              data: values.map(i => i.sumWPM / i.count)
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
