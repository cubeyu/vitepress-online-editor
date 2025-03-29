export default {
  title: 'VitePress Online Editor',
  description: 'A VitePress-based online editor',
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '在线编辑器', link: '/pages/editor' },
      { text: '文档', link: '/guide/editor' }
    ],
    sidebar: {
      '/': [
        {
          text: '指南',
          items: [
            { text: '介绍', link: '/guide/' },
            { text: '编辑器组件', link: '/guide/editor' }
          ]
        }
      ],
      '/pages/': [
        {
          text: '功能',
          items: [
            { text: '在线编辑器', link: '/pages/editor' }
          ]
        }
      ]
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/cubeyu/vitepress-online-editor' }
    ],
    footer: {
      message: '基于 MIT 许可发布',
      copyright: 'Copyright © 2024-present'
    }
  }
} 