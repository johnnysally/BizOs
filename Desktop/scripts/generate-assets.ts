import sharp from 'sharp';
import { promises as fs } from 'node:fs';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ASSETS_DIR = resolve(__dirname, '..', 'assets');

const SOURCE_SVG = resolve(ASSETS_DIR, 'favicon.svg');

interface PngTarget {
  name: string;
  size: number;
}

const PNG_TARGETS: PngTarget[] = [
  { name: 'icon-256.png', size: 256 },
  { name: 'icon-512.png', size: 512 },
  { name: 'icon.png', size: 1024 },
  { name: 'tray.png', size: 16 },
  { name: 'tray@2x.png', size: 32 },
  { name: 'tray@3x.png', size: 48 },
];

const ICO_SIZES = [16, 24, 32, 48, 64, 128, 256];

async function ensureSource(): Promise<Buffer> {
  if (!existsSync(SOURCE_SVG)) {
    console.error(`\n✗ Source SVG not found: ${SOURCE_SVG}`);
    console.error(`  Place your app icon SVG at that path and re-run.\n`);
    process.exit(1);
  }
  return fs.readFile(SOURCE_SVG);
}

async function svgToPng(svg: Buffer, size: number): Promise<Buffer> {
  return sharp(svg, { density: 384 })
    .resize(size, size, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

async function generatePngs(svg: Buffer): Promise<void> {
  for (const target of PNG_TARGETS) {
    const out = resolve(ASSETS_DIR, target.name);
    const buf = await svgToPng(svg, target.size);
    await fs.writeFile(out, buf);
    console.log(`✓ ${target.name} (${target.size}×${target.size})`);
  }
}

interface IcoEntry {
  size: number;
  png: Buffer;
}

function buildIco(entries: IcoEntry[]): Buffer {
  const ICONDIR_SIZE = 6;
  const ICONDIRENTRY_SIZE = 16;

  const header = Buffer.alloc(ICONDIR_SIZE);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(entries.length, 4);

  const directory = Buffer.alloc(ICONDIRENTRY_SIZE * entries.length);
  let offset = ICONDIR_SIZE + directory.length;

  const images: Buffer[] = [];

  entries.forEach((entry, i) => {
    const size = entry.size;
    const bytes = entry.png;
    const dirOffset = i * ICONDIRENTRY_SIZE;

    const w = size >= 256 ? 0 : size;
    const h = size >= 256 ? 0 : size;

    directory.writeUInt8(w, dirOffset + 0);
    directory.writeUInt8(h, dirOffset + 1);
    directory.writeUInt8(0, dirOffset + 2);
    directory.writeUInt8(0, dirOffset + 3);
    directory.writeUInt16LE(1, dirOffset + 4);
    directory.writeUInt16LE(32, dirOffset + 6);
    directory.writeUInt32LE(bytes.length, dirOffset + 8);
    directory.writeUInt32LE(offset, dirOffset + 12);

    offset += bytes.length;
    images.push(bytes);
  });

  return Buffer.concat([header, directory, ...images]);
}

async function generateIco(svg: Buffer): Promise<void> {
  const entries: IcoEntry[] = [];

  for (const size of ICO_SIZES) {
    const png = await svgToPng(svg, size);
    entries.push({ size, png });
  }

  const ico = buildIco(entries);
  const out = resolve(ASSETS_DIR, 'icon.ico');
  await fs.writeFile(out, ico);
  console.log(`✓ icon.ico (${ICO_SIZES.join(', ')} px)`);
}

async function main(): Promise<void> {
  console.log('\nGenerating BizOS desktop assets from favicon.svg\n');

  const svg = await ensureSource();

  await generatePngs(svg);
  await generateIco(svg);

  console.log('\nDone. Output in desktop/assets/\n');
}

main().catch((err) => {
  console.error('\n✗ Asset generation failed\n');
  console.error(err);
  process.exit(1);
});