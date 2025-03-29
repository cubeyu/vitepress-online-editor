<script setup>
import { ref, computed, onMounted, shallowRef, markRaw } from 'vue';
import { MdEditor } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';
import { useData } from 'vitepress'
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

// GitHub API配置
const githubApiUrl = 'https://api.github.com'

// GitHub默认配置
const defaultGithubToken = '' // 替换为您的GitHub Token
const defaultGithubUsername = '' // 替换为您的GitHub用户名
const defaultGithubRepo = '' // 替换为您的仓库名称

const theme = computed(() => {
  const data = useData()
  return data.isDark.value ? 'dark' : 'light'
})
// 上传图片到GitHub
async function customUpload(file, callback) {
  if (isLogin.value !== 1) {
    toast.error('请先登录GitHub')
    return
  }
  
  try {
    const imageFile = file[0]
    const reader = new FileReader()
    
    reader.onload = async (e) => {
      const content = e.target.result
      const base64Content = content.split(',')[1] // 移除data:image/jpeg;base64,前缀
      
      const imagePath = `docs/public/images/${Date.now()}_${imageFile.name}`
      
      // 上传图片到GitHub
      const response = await fetch(`${githubApiUrl}/repos/${username.value}/${repoName.value}/contents/${imagePath}`, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${githubToken.value}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `Upload image: ${imageFile.name}`,
          content: base64Content,
          branch: branch.value
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`上传图片失败: ${response.status} - ${errorData.message}`)
      }
      
      const data = await response.json()
      // 构建图片URL
      const imageUrl = `/images/${Date.now()}_${imageFile.name}`
      // 使用markRaw确保回调中的数据不会被Vue深度响应式处理
      callback(markRaw([imageUrl]))
      toast.success('图片上传成功!')
    }
    
    reader.readAsDataURL(imageFile)
  } catch (error) {
    toast.error(`上传图片失败: ${error.message}`)
    console.error('上传图片失败:', error)
  }
}
// 密码保护相关状态
const isPasswordVerified = ref(false)
const password = ref('')
const passwordError = ref(false)
const correctPassword = '123456' // 设置正确的密码

// GitHub认证相关状态
const githubToken = ref(defaultGithubToken)
const username = ref(defaultGithubUsername)
const repoName = ref(defaultGithubRepo)
const branch = ref('main')
const loginLoading = ref(false)
const isLogin = ref(0)

// 从localStorage加载GitHub Token
onMounted(() => {
  
  const savedToken = localStorage.getItem('github_token')
  const savedUsername = localStorage.getItem('github_username')
  const savedRepo = localStorage.getItem('github_repo')
  const savedBranch = localStorage.getItem('github_branch')
  
  if (savedToken) {
    githubToken.value = savedToken
    username.value = savedUsername || ''
    repoName.value = savedRepo || ''
    branch.value = savedBranch || 'main'
    verifyGithubToken()
  }
})

// 验证GitHub Token
const verifyGithubToken = () => {
  loginLoading.value = true
  fetch(`${githubApiUrl}/user`, {
    method: 'GET',
    headers: {
      'Authorization': `token ${githubToken.value}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  }).then(async response => {
    if (response.ok) {
      return response.json()
    } else {
      // 获取详细的错误信息
      const errorData = await response.json().catch(() => ({}));
      let errorMessage = `GitHub认证失败: ${response.status}`;
      
      // 针对不同状态码提供更具体的错误信息
      if (response.status === 401) {
        errorMessage = 'GitHub Token无效或已过期，请检查Token是否正确';
      } else if (response.status === 403) {
        errorMessage = 'GitHub API访问受限，可能是请求次数超限';
      } else if (errorData && errorData.message) {
        errorMessage += ` - ${errorData.message}`;
      }
      
      throw new Error(errorMessage);
    }
  })
  .then(data => {
    isLogin.value = 1
    loginLoading.value = false
    toast.success('GitHub认证成功!')
    // 保存认证信息到localStorage
    localStorage.setItem('github_token', githubToken.value)
    localStorage.setItem('github_username', username.value)
    localStorage.setItem('github_repo', repoName.value)
    localStorage.setItem('github_branch', branch.value)
  })
  .catch(error => {
    isLogin.value = 2
    loginLoading.value = false
    toast.error(error.message)
    console.error('GitHub认证错误:', error)
  })
}

// 验证密码
const verifyPassword = () => {
  if (password.value === correctPassword) {
    isPasswordVerified.value = true
    passwordError.value = false
    toast.success('密码验证成功!')
  } else {
    passwordError.value = true
    toast.error('密码错误，请重试!')
  }
}

// GitHub登录处理
const handleLogin = () => {
  // 简单验证Token格式
  if (githubToken.value.length < 30 || !githubToken.value.startsWith('github_pat_')) {
    toast.warning('GitHub Token格式可能不正确，请确认是否为有效的个人访问令牌')
  }
  
  verifyGithubToken()
}

// 获取当前日期，格式为YYYY-MM-DD
const getCurrentDate = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 文章模板
const defaultTemplate = `---
post: true
title: 文章标题
date: ${getCurrentDate()}
cover: 图片连接
coveross: 备用连接
categories:
 - 分类
tags:
 - 标签
description: 在此处添加文章描述，会显示在文章列表中。
---
文章内容
`;
const content = shallowRef(defaultTemplate);
const title = ref('')
const filePath = ref('')
const saveLoading = ref(false)

// 生成文件名
const generateFileName = () => {
  const now = new Date()
  const year = now.getFullYear().toString()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const date = getCurrentDate()
  const slug = title.value
    ? title.value.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
    : 'untitled-' + Date.now()
  
  return filePath.value || `docs/posts/${year}/${month}/${date}-${slug}.md`
}

// 生成文件内容
const generateFileContent = () => {
  // 直接返回编辑器内容的原始值，不添加额外的frontMatter
  // 使用markRaw确保返回的是原始对象，避免Vue尝试将其转换为响应式对象
  return markRaw(content.value)
}

// 获取文件的SHA
const getFileSHA = async (path) => {
  try {
    const response = await fetch(`${githubApiUrl}/repos/${username.value}/${repoName.value}/contents/${path}?ref=${branch.value}`, {
      method: 'GET',
      headers: {
        'Authorization': `token ${githubToken.value}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    })
    
    if (response.status === 404) {
      return null // 文件不存在
    }
    
    if (!response.ok) {
      throw new Error(`获取文件SHA失败: ${response.status}`)
    }
    
    const data = await response.json()
    return data.sha
  } catch (error) {
    console.error('获取文件SHA出错:', error)
    return null
  }
}

// 检查并创建目录
const ensureDirectoryExists = async (path) => {
  // 从文件路径中提取目录路径
  const dirPath = path.substring(0, path.lastIndexOf('/'))
  
  try {
    // 检查目录是否存在
    const response = await fetch(`${githubApiUrl}/repos/${username.value}/${repoName.value}/contents/${dirPath}?ref=${branch.value}`, {
      method: 'GET',
      headers: {
        'Authorization': `token ${githubToken.value}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    })
    
    if (response.status === 404) {
      // 目录不存在，需要创建
      // 先确保父目录存在
      const parentDir = dirPath.substring(0, dirPath.lastIndexOf('/'))
      if (parentDir) {
        await ensureDirectoryExists(parentDir + '/placeholder.md')
      }
      
      // 创建当前目录（通过创建一个占位文件）
      const placeholderResponse = await fetch(`${githubApiUrl}/repos/${username.value}/${repoName.value}/contents/${dirPath}/.gitkeep`, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${githubToken.value}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `Create directory: ${dirPath}`,
          content: btoa(''), // 空文件的Base64编码
          branch: branch.value
        })
      })
      
      if (!placeholderResponse.ok) {
        throw new Error(`创建目录失败: ${placeholderResponse.status}`)
      }
    } else if (!response.ok) {
      throw new Error(`检查目录失败: ${response.status}`)
    }
  } catch (error) {
    console.error('确保目录存在时出错:', error)
    throw error
  }
}

// 保存到GitHub
const handleSave = async () => {
  if (isLogin.value !== 1) {
    toast.error('请先登录GitHub')
    return
  }
  
  if (!title.value) {
    toast.error('请输入文章标题')
    return
  }
  
  saveLoading.value = true
  const fileName = generateFileName()
  // 确保使用原始内容而不是响应式对象
  // 使用markRaw处理content.value，避免Vue深度响应式化
  const fileContent = typeof content.value === 'string' ? content.value : JSON.stringify(markRaw(content.value))
  
  try {
    // 确保目录存在
    await ensureDirectoryExists(fileName)
    
    // 检查文件是否已存在
    const sha = await getFileSHA(fileName)
    
    // 准备请求体
    const requestBody = {
      message: `${sha ? 'Update' : 'Add'} ${title.value || 'new post'}`,
      content: btoa(unescape(encodeURIComponent(fileContent))), // Base64编码
      branch: branch.value
    }
    
    // 如果文件已存在，添加SHA
    if (sha) {
      requestBody.sha = sha
    }
    
    // 提交到GitHub
    const response = await fetch(`${githubApiUrl}/repos/${username.value}/${repoName.value}/contents/${fileName}`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${githubToken.value}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`GitHub API错误: ${response.status} - ${errorData.message}`)
    }
    
    const data = await response.json()
    toast.success('文章已成功保存到GitHub!')
    console.log('保存成功:', data)
  } catch (error) {
    toast.error(`保存失败: ${error.message}`)
    console.error('保存失败:', error)
  } finally {
    saveLoading.value = false
  }
}
</script>
<template>
  <div class="editor">
    <!-- 密码验证层 -->
    <div v-if="!isPasswordVerified" class="password-layer">
      <div class="password-container">
        <h2>访问受限</h2>
        <p>请输入密码[123456]</p>
        <div class="password-input-container">
          <input 
            type="password" 
            v-model="password" 
            placeholder="请输入访问密码" 
            :class="{'error': passwordError}"
            @keyup.enter="verifyPassword"
          >
          <button @click="verifyPassword">验证</button>
        </div>
        <p v-if="passwordError" class="error-message">密码错误，请重试!</p>
      </div>
    </div>
    <div class="editor-header">
      <div class="post-info">
        <input type="text" placeholder="文章标题" v-model="title">
        <input type="text" placeholder="文件路径 (可选)" v-model="filePath">
      </div>
      <div class="github-login">
        <div class="login-form">
          <input type="text" placeholder="分支名称" v-model="branch" title="输入您要操作的分支名称" class="branch-input">
          <button @click="handleLogin">连接GitHub</button>
          <svg v-if="loginLoading" class="loading-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 1024 1024"><path fill="currentColor" d="M512 64a32 32 0 0 1 32 32v192a32 32 0 0 1-64 0V96a32 32 0 0 1 32-32zm0 640a32 32 0 0 1 32 32v192a32 32 0 1 1-64 0V736a32 32 0 0 1 32-32zm448-192a32 32 0 0 1-32 32H736a32 32 0 1 1 0-64h192a32 32 0 0 1 32 32zm-640 0a32 32 0 0 1-32 32H96a32 32 0 0 1 0-64h192a32 32 0 0 1 32 32zM195.2 195.2a32 32 0 0 1 45.248 0L376.32 331.008a32 32 0 0 1-45.248 45.248L195.2 240.448a32 32 0 0 1 0-45.248zm452.544 452.544a32 32 0 0 1 45.248 0L828.8 783.552a32 32 0 0 1-45.248 45.248L647.744 692.992a32 32 0 0 1 0-45.248zM828.8 195.264a32 32 0 0 1 0 45.184L692.992 376.32a32 32 0 0 1-45.248-45.248l135.808-135.808a32 32 0 0 1 45.248 0zm-452.544 452.48a32 32 0 0 1 0 45.248L240.448 828.8a32 32 0 0 1-45.248-45.248l135.808-135.808a32 32 0 0 1 45.248 0z"/></svg>
          <svg v-if="isLogin==1" class="success-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 1024 1024"><path fill="currentColor" d="M512 896a384 384 0 1 0 0-768a384 384 0 0 0 0 768zm0 64a448 448 0 1 1 0-896a448 448 0 0 1 0 896z"/><path fill="currentColor" d="M745.344 361.344a32 32 0 0 1 45.312 45.312l-288 288a32 32 0 0 1-45.312 0l-160-160a32 32 0 1 1 45.312-45.312L480 626.752l265.344-265.408z"/></svg>
          <svg v-if="isLogin==2" class="error-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 1024 1024"><path fill="currentColor" d="m466.752 512l-90.496-90.496a32 32 0 0 1 45.248-45.248L512 466.752l90.496-90.496a32 32 0 1 1 45.248 45.248L557.248 512l90.496 90.496a32 32 0 1 1-45.248 45.248L512 557.248l-90.496 90.496a32 32 0 0 1-45.248-45.248L466.752 512z"/><path fill="currentColor" d="M512 896a384 384 0 1 0 0-768a384 384 0 0 0 0 768zm0 64a448 448 0 1 1 0-896a448 448 0 0 1 0 896z"/></svg>
          <div v-if="isLogin==2" class="error-message">认证失败，请检查Token是否有效</div>
          <button class="save-btn" @click="handleSave" :disabled="saveLoading">
            <span v-if="!saveLoading">保存到GitHub</span>
            <span v-else>保存中...</span>
          </button>
        </div>
      </div>
    </div>
    <MdEditor v-model="content" @onUploadImg="customUpload" :theme="theme"/>
  </div>
</template>
<style scoped>
.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.github-login {
  padding: 0;
  margin-bottom: 0;
}

.github-login h3 {
  margin-top: 0;
  margin-bottom: 10px;
  display: none;
}

.login-form {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 0;
}

.error-message {
  color: #f56c6c;
  font-size: 12px;
  margin-top: 5px;
  width: 100%;
}

.post-info {
  margin-bottom: 0;
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
}

.editor input {
  font-size: 14px;
  -webkit-appearance: none;
  background-color: var(--vp-c-bg);
  background-image: none;
  border-radius: 4px;
  border: 1px solid var(--vp-c-gray-3);
  box-sizing: border-box;
  color: var(--vp-c-gray-3);
  display: inline-block;
  font-size: inherit;
  height: 26px;
  line-height: 26px;
  outline: none;
  padding: 0 15px;
  transition: border-color .2s cubic-bezier(.645,.045,.355,1);
  margin-right: 6px;
  width: 180px;
}

.editor button {
  color: var(--vp-c-text-2);
  background-color: var(--vp-c-bg) !important;
  display: inline-block;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  background: #fff;
  border: 1px solid var(--vp-c-gray-3);
  -webkit-appearance: none;
  text-align: center;
  box-sizing: border-box;
  outline: none;
  margin: 0;
  transition: .1s;
  font-weight: 500;
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  padding: 6px 15px;
  font-size: 14px;
  border-radius: 4px;
  margin-right: 6px;
}
.save-btn {
  min-width: 120px;
  margin-left: auto;
}

.branch-input {
  width: 100px !important;
}

.loading-icon, .success-icon, .error-icon {
  margin-left: 8px;
}

.success-icon {
  color: #67C23A;
}

.error-icon {
  color: #F56C6C;
}
.password-layer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--vp-c-bg);
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
}

.password-container {
  background-color: var(--vp-c-bg-soft);
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 400px;
  width: 90%;
}

.password-container h2 {
  margin-top: 0;
  color: var(--vp-c-text-1);
}

.password-input-container {
  display: flex;
  margin: 20px 0;
}

.password-input-container input {
  flex: 1;
  padding: 8px 12px;
  border-radius: 4px 0 0 4px;
  border: 1px solid var(--vp-c-gray-3);
  background-color: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}

.password-input-container input.error {
  border-color: #F56C6C;
}

.password-input-container button {
  border-radius: 0 4px 4px 0;
  margin-right: 0;
  background-color: var(--vp-c-brand);
  color: white;
  border: none;
}

.password-container .error-message {
  color: #F56C6C;
  font-size: 14px;
  margin-top: 0;
}
</style>