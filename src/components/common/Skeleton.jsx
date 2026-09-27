import React from 'react';

export function Skeleton({ className = '', style = {}, width, height, borderRadius }) {
  const inlineStyles = {
    ...(width ? { width } : {}),
    ...(height ? { height } : {}),
    ...(borderRadius ? { borderRadius } : {}),
    ...style,
  };

  return <div className={`hireiq-skeleton ${className}`} style={inlineStyles} />;
}

export function SkeletonText({ lines = 3, gap = '8px', className = '' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap, width: '100%' }} className={className}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height="12px"
          width={i === lines - 1 && lines > 1 ? '65%' : '100%'}
          borderRadius="4px"
        />
      ))}
    </div>
  );
}

export function SkeletonMetricCard() {
  return (
    <div className="hireiq-skeleton-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Skeleton width="90px" height="12px" />
        <Skeleton width="28px" height="28px" borderRadius="8px" />
      </div>
      <Skeleton width="60px" height="24px" />
      <Skeleton width="110px" height="10px" />
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 5 }) {
  return (
    <div className="hireiq-skeleton-table-wrap">
      <div style={{ display: 'flex', gap: '12px', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
        {Array.from({ length: cols }).map((_, c) => (
          <Skeleton key={`th-${c}`} width={`${100 / cols}%`} height="14px" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={`tr-${r}`}
          style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            padding: '14px 16px',
            borderBottom: '1px solid var(--border)',
          }}
        >
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton
              key={`td-${r}-${c}`}
              width={c === 0 ? '40%' : `${60 / (cols - 1)}%`}
              height="12px"
              borderRadius="4px"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default Skeleton;
