# VitePress Online Editor
一个基于 VitePress 的在线 Markdown 编辑器集成，让你可以直接在浏览器中编写和发布文章。

![VitePress Online Editor 预览](https://raw.githubusercontent.com/cubeyu/vitepress-online-editor/main/zs.png)

## 特性

- 📝 在线 Markdown 编辑
- 🔄 实时预览
- 🚀 一键发布到 GitHub
- 🎨 自动适配明暗主题
- 🔒 密码保护
- 📸 图片上传支持

## 项目架构
```
vitepress-online-editor/                      # 项目根目录
├── docs/                                     # 文档目录
│   ├── .vitepress/                          # VitePress 配置目录
│   │   ├── theme/                           # 主题相关文件
│   │   │   ├── components/                  # Vue 组件目录
│   │   │   │   └── editor.vue              # 核心编辑器组件
│   │   │   ├── custom.css                  # 自定义样式文件
│   │   │   ├── index.js                    # 主题入口文件
│   │   │   └── Layout.vue                  # 布局组件
│   │   └── config.js                       # VitePress 配置文件
│   ├── guide/                              # 指南文档目录
│   │   ├── index.md                        # 指南首页
│   │   └── editor.md                       # 编辑器使用文档
│   ├── pages/                              # 页面目录
│   │   └── editor.md                       # 编辑器页面
│   └── index.md                            # 网站首页
├── .gitignore                              # Git 忽略配置
├── LICENSE                                 # MIT 许可证
├── package.json                            # 项目配置和依赖
└── README.md                               # 项目说明文档
```

## 快速开始

1. 克隆仓库：

```bash
git clone https://github.com/cubeyu/vitepress-online-editor.git
cd vitepress-online-editor
```

2. 安装依赖：

```bash
npm install
```

3. 启动开发服务器：

```bash
npm run dev
```

4. 构建生产版本：

```bash
npm run build
```

## 使用方法

1. 访问编辑器页面
2. 输入访问密码（默认为：123456）
3. 配置 GitHub 信息：
   - GitHub Token
   - 用户名
   - 仓库名
   - 分支名
4. 开始编写文章
5. 点击保存即可发布到 GitHub

## 小白部署方式

### 1. GitHub Pages 部署

#### 步骤 1: 创建 GitHub Actions 工作流

在项目的 `.github/workflows` 目录中创建一个名为 `deploy.yml` 的文件：

```yaml
# 构建 VitePress 站点并将其部署到 GitHub Pages 的示例工作流程
name: Deploy VitePress site to Pages

on:
  # 在针对 `main` 分支的推送上运行
  push:
    branches: [main]
  # 允许你从 Actions 选项卡手动运行此工作流程
  workflow_dispatch:

# 设置 GITHUB_TOKEN 的权限，以允许部署到 GitHub Pages
permissions:
  contents: read
  pages: write
  id-token: write

# 只允许同时进行一次部署，跳过队列中的部署
concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  # 构建工作
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - name: Setup Pages
        uses: actions/configure-pages@v4
      - name: Install dependencies
        run: npm ci
      - name: Build with VitePress
        run: npm run docs:build
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: docs/.vitepress/dist

  # 部署工作
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    needs: build
    runs-on: ubuntu-latest
    name: Deploy
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

#### 步骤 2: 配置 GitHub Pages

1. 进入仓库设置的 "Pages" 菜单项
2. 在 "Build and deployment > Source" 部分选择 "GitHub Actions"

#### 步骤 3: 配置 VitePress 基础路径

在 `docs/.vitepress/config.js` 中设置 `base` 选项：

```js
export default {
  base: '/your-repo-name/', // 将 your-repo-name 替换为你的仓库名
  // ... 其他配置
}
```

#### 步骤 4: 部署

1. 将更改推送到 main 分支
2. 等待 GitHub Action 工作流完成
3. 访问你的站点：
   - 使用 GitHub Pages URL: `https://<username>.github.io/[repository]/`
   - 或者自定义域名（如果已配置）

### 2. Netlify / Vercel / Cloudflare Pages / AWS Amplify / Render 部署

Vercel 提供了更简单的部署方式：

1. 在 Vercel 导入你的 GitHub 仓库
2. 选择 VitePress 框架预设
3. 点击部署即可

Vercel 会自动监听你的 GitHub 仓库变化，当你推送新的更改时，会自动重新部署。

## 性能优化
具体可查看！[https://vitepress.dev/zh/guide/deploy]
### HTTP 缓存配置

为了提高重复访问时的性能，你可以配置 HTTP 缓存标头。VitePress 在生产环境中会为静态资源生成带有哈希值的文件名（例如：`app.4f283b18.js`），这使得我们可以安全地使用强缓存策略。

#### Netlify 配置

在 `docs/public/_headers` 文件中添加：

```text
/assets/*
  cache-control: max-age=31536000
  cache-control: immutable
```

> 📝 注意：`_headers` 文件必须放在 `docs/public` 目录中，它会被自动复制到构建输出目录。
>
> 更多信息请参考 [Netlify 自定义标头文档](https://docs.netlify.com/routing/headers/)

#### Vercel 配置

在项目根目录创建 `vercel.json` 文件：

```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

> 📝 注意：`vercel.json` 文件必须放在项目根目录。
>
> 更多信息请参考 [Vercel 标头配置文档](https://vercel.com/docs/concepts/projects/project-configuration#headers)

#### 其他平台

对于其他平台，你可以配置以下 HTTP 标头：

```http
Cache-Control: max-age=31536000,immutable
```

这个配置应该应用到 `/assets/*` 路径下的所有文件。

### 为什么需要缓存配置？

1. **哈希文件名保证内容一致性**：
   - 文件名中的哈希值（如 `4f283b18`）是根据文件内容生成的
   - 只要文件内容不变，哈希值就不会改变
   - 内容变化时，哈希值会自动更新

2. **优化加载性能**：
   - 强缓存策略可以让浏览器直接使用本地缓存
   - 减少不必要的网络请求
   - 提升页面加载速度

3. **安全可靠**：
   - 基于内容哈希的缓存策略确保用户总是能看到最新内容
   - 无需担心缓存过期问题

## 配置说明

### 修改密码

在 `docs/.vitepress/theme/components/editor.vue` 中修改 `correctPassword` 变量：

```javascript
const correctPassword = 'your-password'
```

### 自定义主题

可以通过修改 `docs/.vitepress/theme/custom.css` 来自定义主题样式。

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

[MIT](LICENSE)
