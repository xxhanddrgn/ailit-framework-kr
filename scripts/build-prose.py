#!/usr/bin/env python3
"""
ailit-framework-kr.html 에서 산문·BOX·부록·푸터를 그대로 떼어 src/data/prose.ts 로 옮긴다.

번역문은 한 글자도 고치지 않는다.

삽화는 CREDITS.md 의 배치표대로 <!--FIG:이름--> 마커를 끼워 넣고,
실제 <figure> 마크업은 렌더 시점에 src/components/figure.ts 가 만든다.
앵커 문자열이 하나도 안 걸리거나 두 번 걸리면 즉시 실패시킨다. 삽화가 조용히
빠지는 것보다 빌드가 멈추는 편이 낫다.
"""
import re
import sys
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / 'ailit-framework-kr.html'
OUT = ROOT / 'src' / 'data' / 'prose.ts'

html = SRC.read_text(encoding='utf-8')


def section(section_id: str) -> str:
    """id 로 <section> 한 덩어리를 통째로 꺼낸다."""
    m = re.search(
        r'<section id="%s"[^>]*>(.*?)</section>' % re.escape(section_id),
        html, re.S)
    if not m:
        sys.exit('구획을 찾지 못함: %s' % section_id)
    return m.group(1).strip()


def between(start: str, end: str) -> str:
    i = html.find(start)
    j = html.find(end, i + len(start))
    if i < 0 or j < 0:
        sys.exit('구간을 찾지 못함: %s … %s' % (start[:40], end[:40]))
    return html[i + len(start):j].strip()


# ---------------------------------------------------------------- 삽화 앵커
# (구획 키, 앵커 문자열, 위치, 마커)  위치: before | after
FIG_ANCHORS = [
    # §02 기초 — 네 영역 카드 안에 썸네일, 카드 묶음 뒤에 꽃잎 도판
    ('foundations', '<div class="card" style="border-top:4px solid var(--engage)">',
     'after', 'card-engage'),
    ('foundations', '<div class="card" style="border-top:4px solid var(--create)">',
     'after', 'card-create'),
    ('foundations', '<div class="card" style="border-top:4px solid var(--manage)">',
     'after', 'card-manage'),
    ('foundations', '<div class="card" style="border-top:4px solid var(--shape)">',
     'after', 'card-shape'),
    ('foundations', '<p><strong>AI와 마주하기</strong>는 기초 영역으로서',
     'before', 'fig1-domains'),

    # §02 역량의 구조 — 학습자 기대수준 설명 옆
    ('foundations', '<p><strong>학습자 기대수준(Learner Expectations)</strong>',
     'before', 'illus-classroom'),

    # §02 조율된 노력 — 퍼즐 도판, 이어서 이해관계자 카드마다 아이콘
    ('foundations', '<h3>AI 리터러시는 폭넓고 조율된 노력을 요구한다</h3>',
     'after', 'fig2-shared-effort'),
    ('foundations', '<div class="card"><h4>교사와 교육자</h4>', 'after', 'aud-teachers'),
    ('foundations', '<div class="card"><h4>학습 설계자·연수 제공기관</h4>', 'after', 'aud-designers'),
    ('foundations', '<div class="card"><h4>학교·교육시스템 리더</h4>', 'after', 'aud-leaders'),
    ('foundations', '<div class="card"><h4>교육 정책결정자</h4>', 'after', 'aud-policymakers'),
    ('foundations', '<div class="card"><h4>부모·가족·보호자</h4>', 'after', 'aud-families'),

    # §02 교사의 역할 — 세로로 긴 삽화라 2단 우측에 세운다
    ('foundations', '<h3>교사와 교육자의 역할</h3>', 'after', 'illus-teachers'),

    # §02 기회와 위험 박스
    ('foundations', '<h4>교육에서 AI의 기회와 위험</h4>', 'after', 'illus-opportunities-risks'),

    # §03 개발 과정 — 응답자 원그래프 / 윤리 박스 / 인접 학문 도판
    ('process', '<p>응답자 직군 분포:', 'before', 'fig3-respondents'),
    ('process', '<h4>프레임워크 속의 윤리</h4>', 'after', 'illus-ethics'),
    ('process', '<h3>기존 프레임워크 위에 세우기</h3>', 'before', 'fig4-disciplines'),
]

parts = {
    'intro': section('intro'),
    'foundations': section('foundations'),
    'process': section('process'),
    'ksa': section('ksa'),
    'competencesIntro': between(
        '<!-- ============ COMPETENCES INTRO ============ -->', '</section>'
    ).split('>', 1)[1].strip(),
    'annex': section('annex'),
    'footer': between('<footer>', '</footer>'),
}

# 역량 도입부 끝에 배치도 도판
parts['competencesIntro'] += '\n<!--FIG:fig5-domains-->'

for key, anchor, where, name in FIG_ANCHORS:
    body = parts[key]
    if body.count(anchor) != 1:
        sys.exit('앵커가 %d번 걸림 (1번이어야 함): %s / %s'
                 % (body.count(anchor), name, anchor[:60]))
    marker = '<!--FIG:%s-->' % name
    parts[key] = body.replace(
        anchor,
        (anchor + '\n' + marker) if where == 'after' else (marker + '\n' + anchor),
        1)


def ts_literal(s: str) -> str:
    return s.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')


with OUT.open('w', encoding='utf-8') as f:
    f.write('/* 자동 생성 — scripts/build-prose.py 가 ailit-framework-kr.html 에서 뽑아낸다.\n'
            '   직접 고치지 말 것. 원본을 고친 뒤 스크립트를 다시 돌릴 것.\n'
            '   <!--FIG:이름--> 마커는 렌더 시점에 삽화로 치환된다. */\n\n')
    for key, body in parts.items():
        f.write('export const %s = `%s`\n\n' % (key, ts_literal(body)))

print('작성 완료: %s' % OUT.relative_to(ROOT))
for key, body in parts.items():
    print('  %-18s %6d자  삽화 %d' % (key, len(body), body.count('<!--FIG:')))
