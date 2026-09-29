// Chuẩn hoá SVG của Lucide (lucide-static) thành icon của web: nét 1.75, cỡ tuỳ chọn,
// màu currentColor, ẩn với trình đọc màn hình (DESIGN_SPEC, mục 8).
// Dùng chung cho Icon.astro và các component React.
export function svgIcon(svg: string, co = 18, lop = ''): string {
  return svg
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/class="[^"]*"/, `class="icon ${lop}"`.replace(/ "$/, '"'))
    .replace(/width="24"/, `width="${co}"`)
    .replace(/height="24"/, `height="${co}"`)
    .replace(/stroke-width="2"/, 'stroke-width="1.75"')
    .replace('<svg', '<svg aria-hidden="true" focusable="false"')
    .trim();
}
