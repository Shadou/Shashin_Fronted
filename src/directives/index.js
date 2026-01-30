import { App } from 'vue'

// 图片懒加载指令
const lazyLoad = {
  mounted(el, binding) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = el
            img.src = binding.value
            img.onload = () => {
              img.classList.add('loaded')
            }
            observer.unobserve(img)
          }
        })
      },
      {
        rootMargin: '0px',
        threshold: 0.1,
      },
    )

    observer.observe(el)

    // 保存观察器实例到元素上
    el._observer = observer
  },
  unmounted(el) {
    if (el._observer) {
      el._observer.disconnect()
    }
  },
}

// 权限指令
const permission = {
  mounted(el, binding) {
    const { value } = binding
    const userPermissions = JSON.parse(localStorage.getItem('permissions') || '[]')

    if (value && value instanceof Array && value.length > 0) {
      const hasPermission = userPermissions.some((permission) => {
        return value.includes(permission)
      })

      if (!hasPermission) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    } else {
      throw new Error('需要权限标识符，如 v-permission="[\'admin\']"')
    }
  },
}

// 复制指令
const copy = {
  mounted(el, binding) {
    el.addEventListener('click', () => {
      const text = binding.value || el.innerText

      if (!text) {
        console.warn('没有内容可以复制')
        return
      }

      // 使用现代Clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard
          .writeText(text)
          .then(() => {
            showCopySuccess()
          })
          .catch((err) => {
            console.error('复制失败:', err)
            fallbackCopy(text)
          })
      } else {
        // 降级方案
        fallbackCopy(text)
      }
    })

    function fallbackCopy(text) {
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()

      try {
        document.execCommand('copy')
        showCopySuccess()
      } catch (err) {
        console.error('降级复制失败:', err)
      }

      document.body.removeChild(textArea)
    }

    function showCopySuccess() {
      // 这里可以使用Element Plus的Message组件
      const message = document.createElement('div')
      message.className = 'copy-success-message'
      message.textContent = '已复制到剪贴板'
      message.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 10px 20px;
        border-radius: 4px;
        z-index: 9999;
        animation: fadeOut 2s forwards;
      `

      document.body.appendChild(message)
      setTimeout(() => {
        document.body.removeChild(message)
      }, 2000)
    }
  },
}

// 拖拽指令
const drag = {
  mounted(el, binding) {
    let isDragging = false
    let startX = 0
    let startY = 0
    let originalX = 0
    let originalY = 0

    el.style.position = 'fixed'
    el.style.cursor = 'move'
    el.style.userSelect = 'none'

    el.addEventListener('mousedown', (e) => {
      isDragging = true
      startX = e.clientX
      startY = e.clientY
      originalX = el.offsetLeft
      originalY = el.offsetTop

      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)

      e.preventDefault()
    })

    function onMouseMove(e) {
      if (!isDragging) return

      const dx = e.clientX - startX
      const dy = e.clientY - startY

      el.style.left = `${originalX + dx}px`
      el.style.top = `${originalY + dy}px`
    }

    function onMouseUp() {
      isDragging = false
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
  },
}

// 输入限制指令
const inputLimit = {
  mounted(el, binding) {
    const { type, max, min, decimal } = binding.value || {}

    el.addEventListener('input', (e) => {
      let value = e.target.value

      switch (type) {
        case 'number':
          value = value.replace(/[^\d]/g, '')
          if (max !== undefined && Number(value) > max) {
            value = max.toString()
          }
          if (min !== undefined && Number(value) < min) {
            value = min.toString()
          }
          break

        case 'decimal':
          const regex = decimal ? new RegExp(`^\\d*\\.?\\d{0,${decimal}}$`) : /^\d*\.?\d*$/
          if (!regex.test(value)) {
            value = value.slice(0, -1)
          }
          break

        case 'alphabet':
          value = value.replace(/[^a-zA-Z]/g, '')
          break

        case 'chinese':
          value = value.replace(/[^\u4e00-\u9fa5]/g, '')
          break
      }

      e.target.value = value
      e.target.dispatchEvent(new Event('input'))
    })
  },
}

export default {
  install(app) {
    app.directive('lazy', lazyLoad)
    app.directive('permission', permission)
    app.directive('copy', copy)
    app.directive('drag', drag)
    app.directive('limit', inputLimit)
  },
}
