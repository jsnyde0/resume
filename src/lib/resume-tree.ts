import type { SkillFile } from '../data/resume-skills';

export interface TreeFile {
  name: string;
  path: string;
}

export interface TreeFolder {
  name: string;
  files: TreeFile[];
  subfolders?: TreeFolder[];
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function itemSlug(item: { company: string; title: string; slug?: string }): string {
  return item.slug ?? slugify(item.company || item.title);
}

// One tree folder plus the html for each of its files, keyed by tree path.
export function buildSection<T extends { company: string; title: string; slug?: string }>(
  dir: string,
  items: T[],
  renderItem: (item: T) => string,
): { files: TreeFile[]; contents: Record<string, string> } {
  const files: TreeFile[] = [];
  const contents: Record<string, string> = {};
  for (const item of items) {
    const slug = itemSlug(item);
    const path = `${dir}/${slug}.md`;
    files.push({ name: `${slug}.md`, path });
    contents[path] = renderItem(item);
  }
  return { files, contents };
}

// Skills subfolders (in first-appearance order) and html by path, both derived from the skills table.
export function buildSkills(skillFiles: SkillFile[]): {
  subfolders: TreeFolder[];
  contents: Record<string, string>;
} {
  const subfolders: TreeFolder[] = [];
  const contents: Record<string, string> = {};
  for (const { folder, filename, html } of skillFiles) {
    let sub = subfolders.find((s) => s.name === folder);
    if (!sub) {
      sub = { name: folder, files: [] };
      subfolders.push(sub);
    }
    const path = `skills/${folder}/${filename}`;
    sub.files.push({ name: filename, path });
    contents[path] = html;
  }
  return { subfolders, contents };
}
