interface Props {
  operation: string;
  material: string;
  busy: boolean;
}

export function TopBar({ operation, material, busy }: Props) {
  return (
    <header className="topbar">
      <div className="brand">
        PRIMEFORM <span>VMC HMI</span>
      </div>
      <div className="job">
        {operation} · {material}
      </div>
      {busy && <span className="topbar-busy"><span className="loader" /></span>}
    </header>
  );
}
