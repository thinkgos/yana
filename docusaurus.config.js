// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'thinkgos',
  tagline: 'Dinosaurs are cool',
  url: 'https://yana.thinkgos.cn',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'thinkgos', // Usually your GitHub org/user name.
  projectName: 'yana', // Usually your repo name.

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl:
          // 'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl:
          // 'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'thinkgos',
        logo: {
          alt: 'thinkgos Logo',
          src: 'img/logo.jpeg',
        },
        items: [
          {
            type: 'dropdown',
            position: 'left',
            label: 'Cloud Native',
            items: [
              {
                label: 'kubernetes',
                to: "docs/kubernetes",
              },
              {
                label: 'docker',
                to: "docs/docker",
              }
            ]
          },
          {
            type: 'dropdown',
            position: 'left',
            label: 'Database',
            items: [
              {
                label: 'mysql',
                to: "docs/mysql",
              }
            ]
          },
          {
            type: 'dropdown',
            position: 'left',
            label: 'Stock',
            items: [
              {
                label: 'open policy agent',
                to: "docs/opa",
              },
              {
                label: '拾掇',
                to: "docs/pickup",
              },
            ]
          },
          {
            position: 'left',
            label: 'Rust',
            to: "docs/rust",
          },
          {
            position: 'left',
            label: 'Golang',
            to: "docs/golang",
          },
          {
            position: 'left',
            label: 'Minority',
            to: "docs/minority",
          },
          {
            to: '/blog',
            label: 'Blog',
            position: 'left',
          },
          {
            href: 'https://github.com/thinkgos',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          // {
          //   title: 'Docs',
          //   items: [
          //     {
          //       label: 'Tutorial',
          //       to: '/docs/intro',
          //     },
          //   ],
          // },
          // {
          //   title: 'Community',
          //   items: [
          //     {
          //       label: 'Stack Overflow',
          //       href: 'https://stackoverflow.com/questions/tagged/docusaurus',
          //     },
          //     {
          //       label: 'Discord',
          //       href: 'https://discordapp.com/invite/docusaurus',
          //     },
          //     {
          //       label: 'Twitter',
          //       href: 'https://twitter.com/docusaurus',
          //     },
          //   ],
          // },
          {
            title: 'More',
            items: [
              {
                label: 'Blog',
                to: '/blog',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/thinkgos',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} thinkgos, Inc. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        additionalLanguages: ['rust', 'protobuf'],
      },
    }),
};

module.exports = config;
