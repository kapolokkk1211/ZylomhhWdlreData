export default function Legend({ strings, labels }) {
  return (
    <p className="legend">
      <span className="item">
        <span className="badge b-kk">{labels.confidence['KK-tested'].label}</span>
        {strings.legendKk}
      </span>
      <span className="item">
        <span className="badge b-reported" style={{ opacity: 0.55 }}>—</span>
        {strings.legendDefault}
      </span>
      <span className="item">
        <span className="dot-th ok" />
        {strings.legendThOk}
      </span>
      <span className="item">
        <span className="dot-th" />
        {strings.legendThNo}
      </span>
      <span className="item">
        <span className="warn-mark">!</span>
        {strings.legendWarn}
      </span>
    </p>
  );
}
