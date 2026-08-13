import { C } from '../../constants/theme'

interface SpinnerProps {
  size?: number
  fullPage?: boolean
}

export function Spinner({ size = 34, fullPage = true }: SpinnerProps) {
  return (
    <div style={{
      display: 'flex',
      flex: fullPage ? 1 : undefined,
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: `3px solid ${C.amber}`,
        borderTopColor: 'transparent',
        animation: 'spinner-spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spinner-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
