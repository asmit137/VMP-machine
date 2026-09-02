interface Props {
  operation: string;
  quantity: number;
  busy: boolean;
}

export function TopBar({ operation, quantity, busy }: Props) {
  return (
    <header className="topbar">
      <div className="brand">
        PRIMEFORM <span>VMC HMI</span>
      </div>
      <div className="job">
        {operation} · Qty {quantity}
      </div>
    </header>
  );
}
