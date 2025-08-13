import React, { useEffect } from 'react';
import * as Blockly from 'blockly';

export default function Workspace({ blocklyDivRef, workspaceRef, toolbox, questionBlocks }) {
  // Blockly workspace 초기화/갱신
  // 기존 로직을 컴포넌트로 옮긴 것. BlockMain의 동작과 동일하게 유지
  useEffect(() => {
    if (!questionBlocks || !blocklyDivRef.current || !toolbox) return;

    if (workspaceRef.current && !workspaceRef.current.isDisposed) {
      try {
        workspaceRef.current.dispose();
      } catch (err) {
        console.warn('Error disposing previous workspace:', err);
      }
      workspaceRef.current = null;
    }

    try {
      workspaceRef.current = Blockly.inject(blocklyDivRef.current, {
        toolbox,
        trashcan: true,
        scrollbars: true,
        grid: { spacing: 20, length: 3, colour: '#ccc', snap: true },
        zoom: { controls: true, wheel: true, startScale: 1.0, maxScale: 3, minScale: 0.3, scaleSpeed: 1.2 }
      });

      const xml = Blockly.utils.xml.textToDom(questionBlocks);
      Blockly.Xml.appendDomToWorkspace(xml, workspaceRef.current);
    } catch (e) {
      console.error('Blockly workspace initialization error:', e);
      workspaceRef.current = null;
    }

    return () => {
      if (workspaceRef.current && !workspaceRef.current.isDisposed) {
        try {
          workspaceRef.current.dispose();
        } catch (err) {
          console.warn('Error during workspace cleanup:', err);
        }
        workspaceRef.current = null;
      }
    };
  }, [questionBlocks, toolbox, blocklyDivRef, workspaceRef]);

  return (
    <div className="workspace-section">
      <div
        ref={blocklyDivRef}
        className="blockly-workspace"
        style={{
          width: '100%',
          height: '500px',
          border: '2px solid #ccc',
          backgroundColor: '#f9f9f9',
          position: 'relative'
        }}
      />
    </div>
  );
}


