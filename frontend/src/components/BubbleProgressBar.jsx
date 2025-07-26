/*
倒计时组件
*/
import React from 'react';

export default function BubbleProgressBar({ total, current }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      margin: '2.5em 0 2em 0', userSelect: 'none',
      minHeight: 56,
      // 移除背景卡片样式
      // boxShadow: '0 4px 24px #0001',
      // background: 'rgba(255,255,255,0.92)',
      // borderRadius: 18,
      // padding: '1.2em 1em',
      maxWidth: 900,
      marginLeft: 'auto',
      marginRight: 'auto',
      position: 'relative',
      zIndex: 2
    }}>
      {Array.from({ length: total }).map((_, i) => {
        let style = {
          width: 40, height: 40, minWidth: 40, minHeight: 40, maxWidth: 40, maxHeight: 40, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: 22, margin: '0 2px', boxSizing: 'border-box', aspectRatio: '1 / 1',
          transition: 'background 0.2s, color 0.2s, border 0.2s, box-shadow 0.2s',
        };
        let numberStyle = {};
        if (i < current) {
          // 已完成
          style.background = 'radial-gradient(circle at 30% 30%, #7fd6ff 70%, #0071e3 100%)';
          style.color = '#fff';
          style.boxShadow = '0 2px 8px #0071e322, 0 1px 2px #fff8';
          style.border = '2.5px solid #7fd6ff';
        } else if (i === current) {
          // 当前
          style.background = 'radial-gradient(circle at 30% 30%, #4eaaff 70%, #0071e3 100%)';
          style.color = '#fff';
          style.boxShadow = '0 4px 16px #0071e355, 0 2px 8px #fff8';
          style.border = '3px solid #0071e3';
          style.fontSize = 26;
          numberStyle.textShadow = '0 2px 8px #0071e355';
        } else {
          // 未开始
          style.background = 'radial-gradient(circle at 30% 30%, #f5f5f5 70%, #e0e0e0 100%)';
          style.color = '#bbb';
          style.boxShadow = '0 2px 8px #0001, 0 1px 2px #fff8';
          style.border = '2.5px solid #e0e0e0';
        }
        return (
          <React.Fragment key={i}>
            <div style={style}><span style={numberStyle}>{i + 1}</span></div>
            {i < total - 1 && (
              <div style={{
                width: 48, height: 2, background: '#b0b0b0',
                margin: '0 2px', borderRadius: 1,
                boxShadow: '0 1px 2px #0001',
                alignSelf: 'center',
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
