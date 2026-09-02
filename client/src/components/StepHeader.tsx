interface Props {
  labels: string[];
  current: number;
}

export function StepHeader({ labels, current }: Props) {
  return (
    <nav className="steps" aria-label="Startup progress">
      {labels.map((label, i) => {
        const status = i < current ? 'done' : i === current ? 'active' : 'todo';
        return (
          <div
            key={label}
            className={`step ${status}`}
            aria-current={i === current ? 'step' : undefined}
          >
            <span className="dot">{i < current ? '✓' : i + 1}</span>
            <span className="step-label">{label}</span>
          </div>
        );
      })}
    </nav>
  );
}
