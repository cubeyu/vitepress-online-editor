<template>
  <DefaultTheme.Layout>
    <template #layout-top>
      <!-- 顶部自定义内容 -->
    </template>
    <template #aside-outline-before>
      <!-- 侧边栏顶部内容 -->
    </template>
    <template #aside-outline-after>
      <!-- 侧边栏底部内容 -->
    </template>
  </DefaultTheme.Layout>
</template>

<script setup>
import DefaultTheme from 'vitepress/theme'
</script>

<style scoped>
.theme-container {
  width: 100%;
  height: 100%;
}
</style> 