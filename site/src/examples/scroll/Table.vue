<script setup>
import Scroll from '@oneonefour/rkui/components/overflow/Scroll.vue'
</script>

<template>
  <Scroll label="Wide table" class="table-scroll">
    <table>
      <thead>
        <tr>
          <th scope="col">Run</th>
          <th scope="col">σ</th>
          <th scope="col">ρ</th>
          <th scope="col">β</th>
          <th scope="col">Δt</th>
          <th scope="col">Steps</th>
          <th scope="col">x₀</th>
          <th scope="col">y₀</th>
          <th scope="col">z₀</th>
          <th scope="col">λ₁</th>
          <th scope="col">max |x|</th>
          <th scope="col">Wall time</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>a</td>
          <td>10</td>
          <td>28</td>
          <td>2.667</td>
          <td>0.01</td>
          <td>10 000</td>
          <td>1.0</td>
          <td>1.0</td>
          <td>1.0</td>
          <td>0.906</td>
          <td>19.6</td>
          <td>0.8 s</td>
        </tr>
        <tr>
          <td>b</td>
          <td>10</td>
          <td>99.96</td>
          <td>2.667</td>
          <td>0.005</td>
          <td>20 000</td>
          <td>0.1</td>
          <td>0.0</td>
          <td>0.0</td>
          <td>1.42</td>
          <td>41.3</td>
          <td>1.7 s</td>
        </tr>
      </tbody>
    </table>
  </Scroll>
</template>

<style scoped>
.table-scroll {
  max-inline-size: 100%;
  padding-block-end: var(--rkui-space-2);
}

table {
  border-collapse: collapse;
  font-variant-numeric: tabular-nums;
}

th,
td {
  padding: var(--rkui-space-1) var(--rkui-space-3);
  text-align: start;
  white-space: nowrap;
}
</style>
