import { ASSETS } from '../data/assets'

const BASE = '/assets/'

/**
 * 그림 주소. 내용 해시를 ?v= 로 붙인다.
 *
 * 그림 파일명은 고정이라(fig1-domains.png 처럼) 해시가 없으면 파일을 갈아도
 * 브라우저가 캐시된 옛 그림을 계속 쓴다. 배포 설정이 PNG 를 7일 캐시하므로
 * 그동안 갱신이 보이지 않는다.
 */
export function assetUrl(file: string): string {
  const info = ASSETS[file]
  if (!info) {
    console.warn('[asset] 매니페스트에 없는 그림:', file)
    return BASE + file
  }
  return `${BASE}${file}?v=${info[2]}`
}

/** 자리를 미리 잡아 두는 크기 속성. CSS 가 width:100% 로 다시 늘린다. */
export function sizeAttrs(file: string): string {
  const info = ASSETS[file]
  return info ? ` width="${info[0]}" height="${info[1]}"` : ''
}
