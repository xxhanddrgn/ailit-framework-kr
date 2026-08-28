/**
 * public/assets 의 그림을 훑어 src/data/assets.ts 를 만든다.
 *
 * 파일마다 원본 크기와 내용 해시를 담는다. 크기는 자리를 미리 잡아 두어
 * lazy 로딩이 본문을 밀어내지 않게 하고, 해시는 주소 뒤에 ?v= 로 붙어
 * 그림을 갈았을 때 브라우저가 옛 그림을 계속 쓰는 일을 막는다.
 *
 * npm run build 가 자동으로 먼저 돌린다(prebuild). 손으로 돌리는 것을 잊어
 * 해시가 낡으면 갱신이 반영되지 않기 때문이다. 실제로 그 일이 있었다.
 */
import { createHash } from 'node:crypto'
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = join(ROOT, 'public', 'assets')
const OUT = join(ROOT, 'src', 'data', 'assets.ts')

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

const rows = readdirSync(SRC)
  .filter((f) => f.endsWith('.png'))
  .sort()
  .map((name) => {
    const data = readFileSync(join(SRC, name))
    if (!data.subarray(0, 8).equals(PNG_MAGIC)) {
      throw new Error(`PNG 가 아님: ${name}`)
    }
    return {
      name,
      w: data.readUInt32BE(16),
      h: data.readUInt32BE(20),
      hash: createHash('sha1').update(data).digest('hex').slice(0, 8),
    }
  })

if (rows.length === 0) throw new Error('public/assets 에 PNG 가 없다')

writeFileSync(OUT,
  '/* 자동 생성 — scripts/build-asset-manifest.mjs 가 public/assets 를 훑어 만든다.\n' +
  '   직접 고치지 말 것. npm run build 가 알아서 다시 만든다. */\n\n' +
  '/** [가로, 세로, 내용 해시] */\n' +
  'export type AssetInfo = [number, number, string]\n\n' +
  'export const ASSETS: Record<string, AssetInfo> = {\n' +
  rows.map((r) => `  '${r.name}': [${r.w}, ${r.h}, '${r.hash}'],\n`).join('') +
  '}\n', 'utf8')

console.log(`src/data/assets.ts — 그림 ${rows.length}장`)
