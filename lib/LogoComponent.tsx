import { useDarkMode } from "material-ui-pack"
import { logo } from "./logo"
interface Props {
  scale: number
}

export function LogoComponent(props: Props) {
  const { darkMode } = useDarkMode()
  return (
    <div dangerouslySetInnerHTML={{ __html: logo(props.scale, darkMode) }} />
  )
}
