import React, { useEffect } from 'react';
import * as Blockly from 'blockly';

export default function Workspace({ blocklyDivRef, workspaceRef, toolbox, questionBlocks }) {
  // Blockly workspace 초기화/갱신
  // 기존 로직을 컴포넌트로 옮긴 것. BlockMain의 동작과 동일하게 유지
  useEffect(() => {
    if (!questionBlocks || !blocklyDivRef.current || !toolbox) return;

    const containerEl = blocklyDivRef.current;

    if (workspaceRef.current && !workspaceRef.current.isDisposed) {
      try { workspaceRef.current.dispose(); } catch (err) { console.warn('Error disposing previous workspace:', err); }
      workspaceRef.current = null;
    }

    // 로컬 변수들 (cleanup에서 안전하게 제거)
    let resizeObserver = null;
    let onWindowResize = null;
    let onWorkspaceChange = null;
    let resizeTimer = null;
    let rafId = null;

    const doResize = () => {
      try {
        Blockly.svgResize(workspaceRef.current);
        if (workspaceRef.current && typeof workspaceRef.current.resizeContents === 'function') {
          workspaceRef.current.resizeContents();
        }
      } catch (err) {
        if (import.meta?.env?.DEV) console.debug('Blockly resize failed:', err);
      }
    };

    try {
      // 화면 스케일 상수화   // 배율 바꾸고 싶으면 여기 수정하면 됨
      const MIN_SCALE = 0.9;    // 화면 최소 배율
      const START_SCALE = 1.2;  // 화면 시작 배율
      const MAX_SCALE = 3.2;    // 화면 최대 배율

      workspaceRef.current = Blockly.inject(containerEl, {
        toolbox,
        trashcan: true,
        // Blockly 내부 스크롤러 사용, 컨테이너는 overflow:hidden 유지
        scrollbars: true,
        grid: { spacing: 20, length: 0, colour: '#ccc', snap: true },
        // 과도한 축소에서 레이아웃 깨짐을 방지하기 위해 최소 배율을 높임
        zoom: { controls: true, wheel: true, startScale: START_SCALE, maxScale: MAX_SCALE, minScale: MIN_SCALE, scaleSpeed: 1.15 }
      });

      const xml = Blockly.utils.xml.textToDom(questionBlocks);
      Blockly.Xml.appendDomToWorkspace(xml, workspaceRef.current);

      doResize();

      // 컨테이너 리사이즈 감지 (툴박스 열기/닫기, 사이드바 등 레이아웃 변화 시 동기화)
      if ('ResizeObserver' in window) {
        resizeObserver = new ResizeObserver(() => { if (workspaceRef.current) doResize(); });
        resizeObserver.observe(containerEl);
      } else {
        onWindowResize = () => { if (workspaceRef.current) doResize(); };
        window.addEventListener('resize', onWindowResize);
      }

      // 블록 생성/삽입/이동 시 재계산 (디바운스)
      const scheduleResize = () => {
        if (resizeTimer) clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          if (rafId) cancelAnimationFrame(rafId);
          rafId = requestAnimationFrame(() => {
            // 런타임에서도 최소 배율 하한을 보장
            try {
              const currentScale = typeof workspaceRef.current.getScale === 'function'
                ? workspaceRef.current.getScale()
                : workspaceRef.current.scale;
              if (currentScale < MIN_SCALE) {
                if (typeof workspaceRef.current.setScale === 'function') {
                  workspaceRef.current.setScale(MIN_SCALE);
                } else {
                  workspaceRef.current.scale = MIN_SCALE;
                }
              }
            } catch (err) {
              if (import.meta.env.DEV) console.debug('scale clamp failed:', err);
            }
            doResize();
            try {
              if (workspaceRef.current) workspaceRef.current.scrollCenter();
            } catch (err) {
              if (import.meta?.env?.DEV) console.debug('scrollCenter failed:', err);
            }
          });
        }, 0);
      };
      onWorkspaceChange = () => scheduleResize();
      workspaceRef.current.addChangeListener(onWorkspaceChange);

    } catch (e) {
      console.error('Blockly workspace initialization error:', e);
      workspaceRef.current = null;
    }

    return () => {
      // 리스너 제거
      try {
        if (workspaceRef.current && onWorkspaceChange) {
          workspaceRef.current.removeChangeListener(onWorkspaceChange);
        }
      } catch (_) {}

      if (resizeObserver) {
        try { resizeObserver.disconnect(); } catch (err) { if (import.meta?.env?.DEV) console.debug('ResizeObserver disconnect failed:', err); }
      }
      if (onWindowResize) {
        window.removeEventListener('resize', onWindowResize);
      }
      if (resizeTimer) clearTimeout(resizeTimer);
      if (rafId) cancelAnimationFrame(rafId);

      if (workspaceRef.current && !workspaceRef.current.isDisposed) {
        try { workspaceRef.current.dispose(); } catch (err) { console.warn('Error during workspace cleanup:', err); }
        workspaceRef.current = null;
      }
    };
  }, [questionBlocks, toolbox, blocklyDivRef, workspaceRef]);

  return (
    <div className="workspace-section">
      <div
        ref={blocklyDivRef}
        className="blockly-workspace"
      />
    </div>
  );
}


