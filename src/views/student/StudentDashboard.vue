<template>
  <div class="layout">
    <SideBar role="student" />
    <div class="content">
      <h1>Welcome to Student Dashboard</h1>
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
