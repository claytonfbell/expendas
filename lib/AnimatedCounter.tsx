import { useEffect } from "react"
import { useCountUp } from "react-countup"
import { formatMoney } from "./formatMoney"

interface Props {
  value: number
}

export default function AnimatedCounter(props: Props) {
  const { countUp, update } = useCountUp({
    start: 0,
    end: 0,
    delay: 400,
    duration: 0.2,
  })

  useEffect(() => {
    update(props.value)
  }, [props.value, update])

  return <>{formatMoney(countUp as number)}</>
}
