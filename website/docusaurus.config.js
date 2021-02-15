module.exports = {
  title: 'UniDriver',
  tagline: 'TBD Cool Tag-line Here',
  url: 'https://wix-incubator.github.io',
  baseUrl: '/unidriver/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'wix-incubator', // Usually your GitHub org/user name.
  projectName: 'unidriver', // Usually your repo name.
  themeConfig: {
    navbar: {
      title: 'UniDriver',
      logo: {
        alt: 'UniDriver Logo',
        src: 'img/SVG/blue.svg',
      },
      items: [
        {
          to: 'docs/',
          activeBasePath: 'docs',
          label: 'Docs',
          position: 'left',
        },
        {to: 'blog', label: 'Blog', position: 'left'},
        {
          href: 'https://github.com/wix-incubator/unidriver',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Style Guide',
              to: 'docs/',
            },
            {
              label: 'Second Doc',
              to: 'docs/doc2/',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Stack Overflow',
              href: 'https://stackoverflow.com/questions/tagged/unidriver',
            },
            {
              label: 'Discord',
              href: 'https://discordapp.com/invite/unidriver',
            },
            {
              label: 'Twitter',
              href: 'https://twitter.com/wixeng',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Blog',
              to: 'blog',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/wix-incubator/unidriver',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} UniDriver, Inc. Built with Docusaurus.`,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl:
            'https://github.com/facebook/docusaurus/edit/master/website/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl:
            'https://github.com/facebook/docusaurus/edit/master/website/blog/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
