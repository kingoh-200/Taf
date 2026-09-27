import { Fragment } from 'react';

export type UploadStage = 'preparing' | 'uploading' | 'saving' | 'done';

interface UploadProgressProps {
  /** Where the upload currently is in its lifecycle. */
  stage: UploadStage;
  /** Cloudinary upload percentage for the file in flight (0-100). */
  percent?: number;
  /** 1-based index of the file being uploaded, when sending several. */
  current?: number;
  /** How many files are in this batch. */
  total?: number;
  /** What is being uploaded, e.g. "Profile photo". */
  title?: string;
}

const STEPS: { key: UploadStage; label: string }[] = [
  { key: 'preparing', label: 'Optimising' },
  { key: 'uploading', label: 'Uploading' },
  { key: 'saving', label: 'Saving' },
];

const STAGE_TEXT: Record<UploadStage, string> = {
  preparing: 'Optimising image…',
  uploading: 'Uploading…',
  saving: 'Saving…',
  done: 'Upload complete',
};

/** A single bar that sweeps through the stages so it always moves. */
function barPercent(stage: UploadStage, percent: number): number {
  const p = Math.min(Math.max(percent, 0), 100);
  switch (stage) {
    case 'preparing':
      return 8;
    case 'uploading':
      return 10 + p * 0.8;
    case 'saving':
      return 94;
    case 'done':
      return 100;
  }
}

/**
 * Shared upload progress UI — a bar, a percentage and the
 * Optimising → Uploading → Saving steps. Used by profile photos, event
 * posters and gallery uploads so they all feel the same.
 */
const UploadProgress = ({ stage, percent = 0, current, total, title }: UploadProgressProps) => {
  const activeIdx = stage === 'done' ? STEPS.length : STEPS.findIndex((s) => s.key === stage);
  const overall = barPercent(stage, percent);

  // While uploading, show the real transfer percentage next to the stage name
  const headline =
    stage === 'uploading' && percent > 0
      ? `Uploading… ${Math.round(percent)}%`
      : STAGE_TEXT[stage];
  const batch = current !== undefined && total !== undefined && total > 1
    ? `File ${Math.min(current, total)} of ${total}`
    : '';

  return (
    <div style={s.wrap} role="status" aria-live="polite">
      <div style={s.row}>
        <span style={s.status}>
          <i
            className={`fa-solid ${stage === 'done' ? 'fa-circle-check' : stage === 'saving' ? 'fa-floppy-disk' : stage === 'uploading' ? 'fa-cloud-arrow-up' : 'fa-wand-magic-sparkles'}`}
            style={{ color: 'var(--primary)', marginRight: '0.4rem' }}
          ></i>
          {title ? `${title} — ${headline}` : headline}
        </span>
        <span style={s.percent}>{Math.round(overall)}%</span>
      </div>

      <div style={s.track}>
        <div style={{ ...s.fill, width: `${overall}%` }} />
      </div>

      <div style={s.steps}>
        {STEPS.map((step, i) => {
          const state = i < activeIdx ? 'done' : i === activeIdx ? 'active' : 'todo';
          return (
            <Fragment key={step.key}>
              {i > 0 && <span style={{ ...s.sep, background: i <= activeIdx ? 'var(--primary)' : 'var(--border)' }} />}
              <span style={s.step}>
                <span
                  style={{
                    ...s.dot,
                    background: state === 'todo' ? 'var(--border)' : 'var(--primary)',
                    transform: state === 'active' ? 'scale(1.15)' : 'scale(1)',
                  }}
                >
                  {state === 'done' && <i className="fa-solid fa-check" style={{ fontSize: '0.45rem', color: '#fff' }}></i>}
                </span>
                <span
                  style={{
                    ...s.stepLabel,
                    color: state === 'todo' ? 'var(--text-muted)' : 'var(--primary)',
                    fontWeight: state === 'active' ? 700 : 500,
                  }}
                >
                  {step.label}
                </span>
              </span>
            </Fragment>
          );
        })}
      </div>

      {batch && <div style={s.batch}>{batch}</div>}
    </div>
  );
};

const s: Record<string, React.CSSProperties> = {
  wrap: {
    marginTop: '0.8rem',
    padding: '0.7rem 0.85rem',
    borderRadius: 12,
    border: '1px solid var(--border)',
    background: 'var(--bg-alt, var(--card-bg))',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.6rem',
    marginBottom: '0.45rem',
  },
  status: {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: '0.82rem',
    fontWeight: 600,
    color: 'var(--text)',
    minWidth: 0,
  },
  percent: {
    fontSize: '0.78rem',
    fontWeight: 700,
    color: 'var(--primary)',
    flexShrink: 0,
  },
  track: {
    height: 6,
    borderRadius: 3,
    background: 'var(--border)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
    background: 'linear-gradient(90deg, #00A0DC, #F7941D)',
    transition: 'width 0.25s ease-out',
  },
  steps: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    marginTop: '0.5rem',
    flexWrap: 'wrap',
  },
  step: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: '50%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    flexShrink: 0,
  },
  stepLabel: {
    fontSize: '0.68rem',
    letterSpacing: '0.01em',
  },
  sep: {
    width: 14,
    height: 2,
    borderRadius: 1,
    display: 'inline-block',
  },
  batch: {
    marginTop: '0.4rem',
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
  },
};

export default UploadProgress;
