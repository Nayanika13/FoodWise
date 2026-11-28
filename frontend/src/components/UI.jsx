export function Button({
  children,
  variant = "primary",
  type = "button",
  className = "",
  ...props
}) {
  return (
    <button
      type={type}
      className={`ui-button ui-button--${variant} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input({ label, id, ...props }) {
  return (
    <div className="ui-field">
      <label htmlFor={id}>{label}</label>
      <input id={id} {...props} />
    </div>
  );
}

export function Card({ children, className = "" }) {
  return (
    <section className={`ui-card ${className}`}>
      {children}
    </section>
  );
}

export function Badge({ children, tone = "neutral" }) {
  return (
    <span className={`ui-badge ui-badge--${tone}`}>
      {children}
    </span>
  );
}

export function PageHeader({ eyebrow, title, description }) {
  return (
    <header className="ui-page-header">
      {eyebrow && <p className="ui-eyebrow">{eyebrow}</p>}
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </header>
  );
}