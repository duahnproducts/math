// Cấu hình Astro cho Hochanh — xem docs/tech_stack.md.
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// Web chạy ở https://duahnproducts.github.io/math/ (repo duahnproducts/math).
// Mọi link nội bộ phải đi qua BASE_URL — dùng hàm trong src/lib/duong-dan.ts.
export default defineConfig({
  site: 'https://duahnproducts.github.io',
  base: '/math',
  trailingSlash: 'always',
  output: 'static',
  markdown: {
    // Astro 7 mặc định dùng bộ xử lý Sätteri, không chạy plugin remark/rehype.
    // Cần unified để KaTeX dựng công thức thành HTML lúc build.
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [[rehypeKatex, { strict: 'ignore', output: 'htmlAndMathml' }]],
    }),
  },
  integrations: [mdx(), react()],
  devToolbar: { enabled: false },
  vite: {
    build: {
      rollupOptions: {
        // Cảnh báo vô hại của Astro + Rolldown về chỉ thị "use astro:head-inject" trong MDX
        onwarn(canhBao, macDinh) {
          if (canhBao.code === 'MODULE_LEVEL_DIRECTIVE') return;
          macDinh(canhBao);
        },
      },
    },
  },
});
