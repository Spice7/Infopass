import React, { useEffect, useRef } from 'react';
import * as Blockly from 'blockly';
import { registerAllBlocks } from '../blocks';

/**
 * 주어진 Blockly XML 문자열을 읽기 전용 워크스페이스로 렌더링하는 컴포넌트
 * - 상호작용 불가 (이미지처럼 보기용)
 * - 부모 컨테이너의 크기에 맞춰 렌더링
 */
export default function BlockXmlPreview({ xml, height = 260 }) {
  const containerRef = useRef(null);
  const workspaceRef = useRef(null);

  useEffect(() => {
    // 커스텀 블록 등록 (중복 등록 안전)
    registerAllBlocks();
  }, []);

  useEffect(() => {
    if (!xml || !containerRef.current) return;

    // 기존 워크스페이스 정리
    if (workspaceRef.current && !workspaceRef.current.isDisposed) {
      try {
        workspaceRef.current.dispose();
      } catch {
        // ignore dispose errors in preview cleanup
      }
      workspaceRef.current = null;
    }

    try {
      // 읽기 전용 워크스페이스 생성 (툴박스/줌/이동 비활성화)
      workspaceRef.current = Blockly.inject(containerRef.current, {
        readOnly: true,
        trashcan: false,
        zoom: false,
        move: {
          scrollbars: false,
          drag: false,
          wheel: false,
        },
        grid: { spacing: 20, length: 0, colour: '#eee', snap: false },
      });

      const dom = Blockly.utils.xml.textToDom(repairMinifiedXml(xml));
      workspaceRef.current.clear();
      Blockly.Xml.appendDomToWorkspace(dom, workspaceRef.current);

      // 블록 전체가 보이도록 맞춤
      setTimeout(() => {
        try {
          const ws = workspaceRef.current;
          if (!ws) return;
          //fitAndCenterWithPadding(ws, containerRef.current, 24);
          zoomToFitCenter(ws, 24);
        } catch {
          // ignore fit/center error
        }
      }, 0);
    } catch (err) {
      console.error('BlockXmlPreview 렌더링 오류:', err);
    }

    return () => {
      if (workspaceRef.current && !workspaceRef.current.isDisposed) {
        try { workspaceRef.current.dispose(); } catch { /* ignore */ }
        workspaceRef.current = null;
      }
    };
  }, [xml]);

  return (
    <div
      ref={containerRef}
      className="block-xml-preview"
      style={{ width: '100%', height, overflow: 'hidden' }}
    />
  );
}

// 기존 정규화로 인해 공백이 사라진 문자열을 복구
function repairMinifiedXml(source) {
  if (!source) return source;
  const s = String(source).trim();
  // 이미 정상 형태면 그대로 반환
  if (s.includes('<xml ') || s.startsWith('<xml>') || s.startsWith('<xml\n')) return s;

  // 케이스: `<xmlxmlns="...">` → `<xml xmlns="...">`
  let fixed = s.replace('<xmlxmlns', '<xml xmlns');

  // 케이스: `<blocktype=` → `<block type=`
  fixed = fixed.replace(/<blocktype=/g, '<block type=');
  // 케이스: `</block>`는 정상. `<fieldname=` → `<field name=`
  fixed = fixed.replace(/<fieldname=/g, '<field name=');
  // 케이스: `<statementname=` → `<statement name=`
  fixed = fixed.replace(/<statementname=/g, '<statement name=');
  // 케이스: `<next>`는 정상. 혹시 self-closing 표기 누락은 그대로 둠

  // xml 최상단이 `<xml`로 시작하지 않으면 래핑
  if (!fixed.startsWith('<xml')) {
    fixed = `<xml xmlns="https://developers.google.com/blockly/xml">${fixed}</xml>`;
  }
  return fixed;
}

// 컨테이너 중앙 정렬 + 패딩 여백을 두고 전체 블록이 보이도록 스케일/스크롤 조정
// function fitAndCenterWithPadding(workspace, containerEl, padding = 20) {
//   Blockly.svgResize(workspace);
//   const bounds = workspace.getBlocksBoundingBox();
//   // 빈 워크스페이스면 끝
//   if (!isFinite(bounds.left) || !isFinite(bounds.top)) return;

//   const contentWidth = Math.max(1, bounds.right - bounds.left);
//   const contentHeight = Math.max(1, bounds.bottom - bounds.top);

//   const containerWidth = Math.max(1, containerEl.clientWidth);
//   const containerHeight = Math.max(1, containerEl.clientHeight);

//   const scaleX = (containerWidth - padding * 2) / contentWidth;
//   const scaleY = (containerHeight - padding * 2) / contentHeight;
//   const scale = Math.min(1.2, Math.max(0.2, Math.min(scaleX, scaleY)));

//   workspace.setScale(scale);
//   Blockly.svgResize(workspace);

//   // 현재 스케일에서 화면이 그릴 수 있는 컨텐츠 폭/높이
//   const visibleWidth = containerWidth / scale;
//   const visibleHeight = containerHeight / scale;

//   // 좌상단 스크롤 위치 = (컨텐츠 좌표 - 여백) - 남는 공간의 절반
//   const offsetX = bounds.left - padding - Math.max(0, (visibleWidth - (contentWidth + padding * 2)) / 2);
//   const offsetY = bounds.top - padding - Math.max(0, (visibleHeight - (contentHeight + padding * 2)) / 2);

//   workspace.scroll(Math.max(0, offsetX), Math.max(0, offsetY));
// }

// svg를 지원하는 Blockly 버전에서는 zoomToFit 메소드를 지원하지 않음
// 그래서 직접 만들었다
function zoomToFitCenter(ws, paddingPx = 24) {
  Blockly.svgResize(ws);

  // 1) 블록 경계 (WU)
  const bb = ws.getBlocksBoundingBox();
  if (!isFinite(bb.left) || !isFinite(bb.top)) return;

  const contentW = Math.max(1, bb.right - bb.left);
  const contentH = Math.max(1, bb.bottom - bb.top);

  // 2) 현재 뷰포트 (px)
  const m0 = ws.getMetrics(); // 모두 px 기준
  const viewW = Math.max(1, m0.viewWidth);
  const viewH = Math.max(1, m0.viewHeight);

  // 3) 패딩 고려 스케일(px/WU) 계산
  const sX = (viewW - paddingPx * 2) / contentW;
  const sY = (viewH - paddingPx * 2) / contentH;
  const scale = Math.min(Math.max(Math.min(sX, sY), 0.2), 1.5);

  ws.setScale(scale);
  Blockly.svgResize(ws);

  // 4) 중앙 정렬: getMetrics()만 사용 (절대 값 px)
  const m = ws.getMetrics();
  const targetX = m.contentLeft + (m.contentWidth - m.viewWidth) / 2;
  const targetY = m.contentTop + (m.contentHeight - m.viewHeight) / 2;

  // ❗음수 허용: 클램프 금지
  ws.scroll(targetX, targetY);
}

