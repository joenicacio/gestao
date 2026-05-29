import { useEffect, useRef } from 'react'

/**
 * Hook para criar efeito de gradiente que segue o cursor
 * Adiciona um ponto de luz que acompanha o mouse
 */
export function useNeonCursorEffect(elementRef: React.RefObject<HTMLElement>) {
  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      element.style.setProperty('--cursor-x', `${x}px`)
      element.style.setProperty('--cursor-y', `${y}px`)
    }

    const handleMouseEnter = () => {
      element.style.setProperty('--cursor-visible', '1')
    }

    const handleMouseLeave = () => {
      element.style.setProperty('--cursor-visible', '0')
    }

    element.addEventListener('mousemove', handleMouseMove)
    element.addEventListener('mouseenter', handleMouseEnter)
    element.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      element.removeEventListener('mousemove', handleMouseMove)
      element.removeEventListener('mouseenter', handleMouseEnter)
      element.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [elementRef])
}

/**
 * Hook para criar efeito de brilho que reaja ao cursor em cards
 */
export function useCardNeonGlow(elementRef: React.RefObject<HTMLElement>) {
  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // Criar efeito de glow circular
      const glowRadius = 150
      element.style.setProperty(
        '--glow-box-shadow',
        `0 0 ${glowRadius}px rgba(107, 198, 223, 0.4) at ${x}px ${y}px`
      )

      // Calcular intensidade baseado na distância do centro
      const centerX = rect.width / 2
      const centerY = rect.height / 2
      const distance = Math.sqrt(
        Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
      )
      const maxDistance = Math.sqrt(
        Math.pow(centerX, 2) + Math.pow(centerY, 2)
      )
      const intensity = Math.max(0, 1 - distance / maxDistance)

      element.style.setProperty('--glow-intensity', `${intensity}`)
    }

    const handleMouseLeave = () => {
      element.style.setProperty('--glow-intensity', '0')
    }

    element.addEventListener('mousemove', handleMouseMove)
    element.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      element.removeEventListener('mousemove', handleMouseMove)
      element.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [elementRef])
}
