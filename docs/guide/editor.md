---
title: 编辑器组件
description: VitePress Online Editor 编辑器组件详细介绍
---

# 编辑器组件介绍

`editor.vue` 是 VitePress Online Editor 的核心组件，它提供了一个功能强大的在线 Markdown 编辑器，支持实时预览、图片上传、GitHub 发布等功能。

## 主要功能

### 1. 密码保护

编辑器内置了简单的密码保护机制，防止未授权访问：

```js
// 密码验证相关状态
const isPasswordVerified = ref(false)
const password = ref('')
const passwordError = ref(false)
const correctPassword = '123456' // 默认密码
```

### 2. GitHub 集成

支持直接将文章发布到 GitHub 仓库：

```js
// GitHub 配置
const githubApiUrl = 'https://api.github.com'
const defaultGithubToken = 'your_token'
const defaultGithubUsername = 'your_username'
const defaultGithubRepo = 'your_repo'
```

### 3. 图片上传

支持将图片直接上传到 GitHub 仓库：

```js
async function customUpload(file, callback) {
  // 上传图片到 GitHub 仓库的 public/images 目录
  const imagePath = `docs/public/images/${Date.now()}_${imageFile.name}`
}
```

## 使用方法

### 1. 基本配置

在使用编辑器之前，需要进行以下配置：

1. 设置访问密码
2. 配置 GitHub Token
3. 设置仓库信息

### 2. 文章编写

编辑器支持标准的 Markdown 语法，并提供以下功能：

- 实时预览
- 图片上传
- 文章模板
- 自动保存

### 3. 文章发布

发布流程：

1. 输入文章标题
2. 编写文章内容
3. （可选）设置自定义文件路径
4. 点击"保存到 GitHub"按钮

## 自定义配置

### 1. 修改密码

```js
// 在 editor.vue 中修改
const correctPassword = 'your_password'
```

### 2. 自定义文章模板

```js
const defaultTemplate = `---
post: true
title: 文章标题
date: ${getCurrentDate()}
cover: 图片链接
categories:
 - 分类
tags:
 - 标签
description: 文章描述
---

# 文章内容
`
```

### 3. 自定义样式

编辑器支持明暗主题自适应，可以通过 CSS 变量自定义样式：

```css
.editor {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.editor .md-editor {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
}
```

## API 参考

### 属性

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| content | String | defaultTemplate | 编辑器内容 |
| theme | String | 'light' | 编辑器主题 |

### 事件

| 事件名 | 参数 | 说明 |
|--------|------|------|
| save | content | 保存文章时触发 |
| upload | file, callback | 上传图片时触发 |

### 方法

| 方法名 | 参数 | 说明 |
|--------|------|------|
| verifyPassword | password | 验证访问密码 |
| handleLogin | - | 验证 GitHub 凭据 |
| handleSave | - | 保存文章到 GitHub |

## 最佳实践

1. **安全性**
   - 不要在代码中硬编码 GitHub Token
   - 定期更改访问密码
   - 使用环境变量存储敏感信息

2. **性能优化**
   - 图片上传前进行压缩
   - 使用防抖处理自动保存
   - 大文件分块上传

3. **用户体验**
   - 添加加载状态提示
   - 提供操作成功/失败反馈
   - 支持快捷键操作

## 常见问题

1. **图片上传失败**
   - 检查 GitHub Token 权限
   - 确认仓库访问权限
   - 验证文件大小限制

2. **保存失败**
   - 检查网络连接
   - 验证 GitHub API 限制
   - 确认文件路径合法性

3. **主题适配问题**
   - 检查 CSS 变量定义
   - 确认主题切换逻辑
   - 验证样式优先级

## 更新日志

### v2.0.0
- 添加密码保护功能
- 优化图片上传体验
- 支持自定义文件路径

### v1.0.0
- 基础编辑器功能
- GitHub 集成
- Markdown 预览 