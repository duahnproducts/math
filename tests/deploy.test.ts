// Workflow deploy (docs/tech_stack.md, mục 9): test phải đạt thì mới build và đẩy lên
// GitHub Pages; base của Astro khớp tên repo.
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { describe, expect, it } from 'vitest';

const goc = new URL('..', import.meta.url);
const doc = (duong: string) => readFileSync(new URL(duong, goc), 'utf8');

interface Buoc {
  run?: string;
  uses?: string;
  with?: Record<string, unknown>;
}
interface Job {
  needs?: string | string[];
  steps: Buoc[];
}
const wf = parse(doc('.github/workflows/deploy.yml')) as {
  on: { push: { branches: string[] } };
  permissions: Record<string, string>;
  jobs: Record<string, Job>;
};
const lenh = (job: string) => wf.jobs[job].steps.map((b) => b.run ?? b.uses ?? '');

describe('workflow deploy', () => {
  it('chạy khi đẩy lên main', () => {
    expect(wf.on.push.branches).toContain('main');
  });

  it('job test chạy đủ: typecheck, Vitest (gồm test shell), e2e', () => {
    const cac = lenh('test');
    expect(cac).toContain('npm ci');
    expect(cac).toContain('npm run check');
    expect(cac).toContain('npm test');
    expect(cac).toContain('npm run test:e2e');
  });

  it('chỉ build sau khi test đạt, chỉ deploy sau khi build xong', () => {
    expect(wf.jobs.build.needs).toBe('test');
    expect(wf.jobs.deploy.needs).toBe('build');
    expect(lenh('build')).toContain('npm run build');
    const upload = wf.jobs.build.steps.find((b) => b.uses?.startsWith('actions/upload-pages-artifact'));
    expect(upload?.with?.path).toBe('dist');
    expect(lenh('deploy').some((l) => l.startsWith('actions/deploy-pages'))).toBe(true);
  });

  it('dùng các action bản chạy Node 24 (bản Node 20 đã bị GitHub ngừng hỗ trợ)', () => {
    const toiThieu: Record<string, number> = {
      'actions/checkout': 7,
      'actions/setup-node': 7,
      'actions/upload-artifact': 7,
      'actions/upload-pages-artifact': 5,
      'actions/deploy-pages': 5,
    };
    const cacAction = Object.values(wf.jobs).flatMap((j) => j.steps.flatMap((b) => (b.uses ? [b.uses] : [])));
    expect(cacAction.length).toBeGreaterThan(0);
    for (const a of cacAction) {
      const [ten, ban] = a.split('@');
      expect(toiThieu[ten], a).toBeDefined();
      expect(Number(ban.replace(/^v/, '').split('.')[0]), a).toBeGreaterThanOrEqual(toiThieu[ten]);
    }
  });

  it('có quyền ghi Pages bằng OIDC', () => {
    expect(wf.permissions.pages).toBe('write');
    expect(wf.permissions['id-token']).toBe('write');
  });

  it('base của Astro khớp địa chỉ GitHub Pages ghi trong tài liệu', () => {
    const cauHinh = doc('astro.config.mjs');
    expect(cauHinh).toContain("site: 'https://duahnproducts.github.io'");
    expect(cauHinh).toContain("base: '/math'");
    expect(doc('docs/tech_stack.md')).toContain('https://duahnproducts.github.io/math/');
  });
});
