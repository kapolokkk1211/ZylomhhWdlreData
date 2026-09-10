// The KK-tested badge is not drawn on compound rows any more, so it is not explained here
// either — the tag still exists in the data and still drives the "verified only" filter.
export default function Legend({ strings }) {
  return (
    <p className="legend">
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
