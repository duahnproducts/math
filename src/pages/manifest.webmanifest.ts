// manifest.webmanifest dựng lúc build, để đường dẫn biểu tượng mang mã phiên bản
// theo nội dung ảnh — xem src/lib/bieu-tuong.ts.
import type { APIRoute } from 'astro';
import { docFilePublic, taoManifest } from '@/lib/bieu-tuong';

export const GET: APIRoute = () =>
  new Response(JSON.stringify(taoManifest(docFilePublic), null, 2), {
    headers: { 'Content-Type': 'application/manifest+json; charset=utf-8' },
  });
