interface Props {
  children: React.ReactNode
}

export function NoBr(props: Props) {
  return <span style={{ whiteSpace: "nowrap" }}>{props.children}</span>
}
