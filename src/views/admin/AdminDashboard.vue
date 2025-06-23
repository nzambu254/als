<template>
  <div class="layout">
    <SideBar role="admin" />
    <div class="content">
      <h1>Admin Dashboard</h1>
    </div>
  </div>
</template>

<script>
import SideBar from '../../components/SideBar.vue'

export default {
  components: { SideBar }
}
</script>

<style scoped>
.layout {
  display: flex;
}
.content {
  padding: 20px;
  flex: 1;
}
</style>
