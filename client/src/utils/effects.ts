// Haptic feedback utility (only works on mobile devices with support)
export const hapticFeedback = {
  light: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  },
  
  medium: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(25);
    }
  },
  
  heavy: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 25, 50]);
    }
  },
  
  success: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
  },
  
  error: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200, 100, 200]);
    }
  }
};

// Screen flash effect
export const screenFlash = (color: string = '#ffffff', duration: number = 200) => {
  const flash = document.createElement('div');
  flash.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: ${color};
    opacity: 0.8;
    z-index: 9999;
    pointer-events: none;
    transition: opacity ${duration}ms ease-out;
  `;
  
  document.body.appendChild(flash);
  
  requestAnimationFrame(() => {
    flash.style.opacity = '0';
  });
  
  setTimeout(() => {
    document.body.removeChild(flash);
  }, duration);
};

// Confetti effect
export const createConfetti = (element?: HTMLElement) => {
  const container = element || document.body;
  const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];
  
  for (let i = 0; i < 100; i++) {
    const confetti = document.createElement('div');
    confetti.style.cssText = `
      position: fixed;
      width: 6px;
      height: 6px;
      background-color: ${colors[Math.floor(Math.random() * colors.length)]};
      left: ${Math.random() * 100}%;
      top: -10px;
      z-index: 9999;
      pointer-events: none;
      border-radius: 50%;
      animation: confettiFall ${3 + Math.random() * 2}s linear forwards;
      transform: rotate(${Math.random() * 360}deg);
    `;
    
    container.appendChild(confetti);
    
    setTimeout(() => {
      if (container.contains(confetti)) {
        container.removeChild(confetti);
      }
    }, 5000);
  }
};

// Ripple effect
export const createRipple = (event: React.MouseEvent<HTMLElement>) => {
  const button = event.currentTarget;
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;
  
  const ripple = document.createElement('span');
  ripple.style.cssText = `
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.6);
    transform: scale(0);
    animation: rippleEffect 0.6s ease-out;
    left: ${x}px;
    top: ${y}px;
    width: ${size}px;
    height: ${size}px;
    pointer-events: none;
  `;
  
  button.style.position = 'relative';
  button.style.overflow = 'hidden';
  button.appendChild(ripple);
  
  setTimeout(() => {
    if (button.contains(ripple)) {
      button.removeChild(ripple);
    }
  }, 600);
};

// Shake animation
export const shakeElement = (element: HTMLElement, intensity: number = 10) => {
  const originalTransform = element.style.transform;
  let shakeCount = 0;
  const maxShakes = 6;
  
  const shake = () => {
    if (shakeCount < maxShakes) {
      const x = (Math.random() - 0.5) * intensity;
      const y = (Math.random() - 0.5) * intensity;
      element.style.transform = `${originalTransform} translate(${x}px, ${y}px)`;
      shakeCount++;
      setTimeout(shake, 100);
    } else {
      element.style.transform = originalTransform;
    }
  };
  
  shake();
};

// Bounce animation
export const bounceElement = (element: HTMLElement, scale: number = 1.1) => {
  const originalTransform = element.style.transform;
  element.style.transform = `${originalTransform} scale(${scale})`;
  element.style.transition = 'transform 0.2s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
  
  setTimeout(() => {
    element.style.transform = originalTransform;
    setTimeout(() => {
      element.style.transition = '';
    }, 200);
  }, 200);
};

// Pulse effect
export const pulseElement = (element: HTMLElement, color: string = '#667eea') => {
  const pulse = document.createElement('div');
  pulse.style.cssText = `
    position: absolute;
    inset: -4px;
    border: 2px solid ${color};
    border-radius: inherit;
    animation: pulseRing 1s ease-out;
    pointer-events: none;
    z-index: -1;
  `;
  
  element.style.position = 'relative';
  element.appendChild(pulse);
  
  setTimeout(() => {
    if (element.contains(pulse)) {
      element.removeChild(pulse);
    }
  }, 1000);
};

// Floating text effect
export const floatingText = (
  text: string, 
  x: number, 
  y: number, 
  color: string = '#667eea'
) => {
  const floater = document.createElement('div');
  floater.textContent = text;
  floater.style.cssText = `
    position: fixed;
    left: ${x}px;
    top: ${y}px;
    color: ${color};
    font-weight: bold;
    font-size: 18px;
    pointer-events: none;
    z-index: 9999;
    animation: floatUp 2s ease-out forwards;
  `;
  
  document.body.appendChild(floater);
  
  setTimeout(() => {
    if (document.body.contains(floater)) {
      document.body.removeChild(floater);
    }
  }, 2000);
};

// Particle burst effect
export const particleBurst = (x: number, y: number, count: number = 20) => {
  const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c'];
  
  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div');
    const angle = (i / count) * Math.PI * 2;
    const velocity = 2 + Math.random() * 3;
    const vx = Math.cos(angle) * velocity;
    const vy = Math.sin(angle) * velocity;
    
    particle.style.cssText = `
      position: fixed;
      width: 4px;
      height: 4px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      border-radius: 50%;
      left: ${x}px;
      top: ${y}px;
      pointer-events: none;
      z-index: 9999;
    `;
    
    document.body.appendChild(particle);
    
    let life = 60;
    const animate = () => {
      if (life > 0) {
        const currentX = parseFloat(particle.style.left);
        const currentY = parseFloat(particle.style.top);
        particle.style.left = `${currentX + vx}px`;
        particle.style.top = `${currentY + vy}px`;
        particle.style.opacity = (life / 60).toString();
        life--;
        requestAnimationFrame(animate);
      } else {
        if (document.body.contains(particle)) {
          document.body.removeChild(particle);
        }
      }
    };
    
    animate();
  }
};

// CSS Animation injection (call this once on app initialization)
export const injectAnimationStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes confettiFall {
      0% { 
        transform: translateY(-10px) rotate(0deg); 
        opacity: 1; 
      }
      100% { 
        transform: translateY(100vh) rotate(720deg); 
        opacity: 0; 
      }
    }
    
    @keyframes rippleEffect {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
    
    @keyframes pulseRing {
      0% {
        transform: scale(0.8);
        opacity: 1;
      }
      100% {
        transform: scale(1.2);
        opacity: 0;
      }
    }
    
    @keyframes floatUp {
      0% {
        transform: translateY(0) scale(1);
        opacity: 1;
      }
      100% {
        transform: translateY(-100px) scale(1.2);
        opacity: 0;
      }
    }
  `;
  
  document.head.appendChild(style);
};

// Combined success effect
export const successEffect = (element: HTMLElement, message?: string) => {
  hapticFeedback.success();
  bounceElement(element);
  pulseElement(element, '#10b981');
  
  if (message) {
    const rect = element.getBoundingClientRect();
    floatingText(message, rect.left + rect.width / 2, rect.top, '#10b981');
  }
};

// Combined error effect  
export const errorEffect = (element: HTMLElement, message?: string) => {
  hapticFeedback.error();
  shakeElement(element);
  pulseElement(element, '#ef4444');
  
  if (message) {
    const rect = element.getBoundingClientRect();
    floatingText(message, rect.left + rect.width / 2, rect.top, '#ef4444');
  }
};

export default {
  hapticFeedback,
  screenFlash,
  createConfetti,
  createRipple,
  shakeElement,
  bounceElement,
  pulseElement,
  floatingText,
  particleBurst,
  injectAnimationStyles,
  successEffect,
  errorEffect
};