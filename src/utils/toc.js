function getRootWindow() {
  let w = window
  while (w !== w.parent) {
    w = w.parent
  }
  return w
}

function getMaster(root) {
  if (root.frames.length === 0) {
    return root
  } else {
    const largestChild = [].slice.apply(root.document.getElementsByTagName('iframe'))
      .map(f => ({
        elem: f,
        area: f.offsetWidth * f.offsetHeight
      }))
      .sort((a, b) => (b.area - a.area))[0]
    const html = root.document.documentElement
    return largestChild.area / (html.offsetWidth * html.offsetHeight) > 0.5 ?
      largestChild.elem.contentWindow : root
  }
}

function isMasterFrame(w) {
  const root = getRootWindow()
  const master = getMaster(root)
  return w === master
}

var toastCSS = "#smarttoc-toast {\n  all: initial;\n}\n\n#smarttoc-toast * {\n  all: unset;\n}\n\n#smarttoc-toast {\n  display: none;\n  position: fixed;\n  right: 0;\n  top: 0;\n  margin: 1em 2em;\n  padding: 1em;\n  z-index: 10000;\n  box-sizing: border-box;\n  background-color: #fff;\n  border: 1px solid rgba(158, 158, 158, 0.22);\n  color: gray;\n  font-size: calc(12px + 0.15vw);\n  font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif;\n  font-weight: normal;\n  -webkit-font-smoothing: subpixel-antialiased;\n  font-smoothing: subpixel-antialiased;\n  transition: opacity 200ms ease-out, transform 200ms ease-out;\n}\n\n#smarttoc-toast.enter {\n  display: block;\n  opacity: 0.01;\n  transform: translate3d(0, -2em, 0);\n}\n\n#smarttoc-toast.enter.enter-active {\n  display: block;\n  opacity: 1;\n  transform: translate3d(0, 0, 0);\n}\n\n#smarttoc-toast.leave {\n  display: block;\n  opacity: 1;\n  transform: translate3d(0, 0, 0);\n}\n\n#smarttoc-toast.leave.leave-active {\n  display: block;\n  opacity: 0.01;\n  transform: translate3d(0, -2em, 0);\n}\n";

function log() {
  if (false) {}
}

function draw(elem, color = 'red') {
  if (false && elem) {}
}

function assert(condition, error) {
  if (!condition) {
    throw new Error(error)
  }
}

// '12px' => 12
const num = (size = '0') =>
  typeof size === 'number' ? size : +size.replace(/px/, '')

// '12px' <= 12
const px = (size = 0) => num(size) + 'px'

function throttle(fn, delay) {
  if (delay) {
    let timer
    return function timerThrottled(...args) {
      clearTimeout(timer)
      timer = setTimeout(function() {
        fn(...args)
      }, delay)
    }
  } else {
    let request
    return function rafThrottled(...args) {
      cancelAnimationFrame(request)
      request = requestAnimationFrame(function() {
        fn(...args)
      })
    }
  }
}

const safe = str =>
  str.replace(/\s+/g, '-')

const unique = (function uniqueGenerator() {
  let set = new Set()
  return function unique(str) {
    let id = 1
    while (set.has(str)) {
      str = str.replace(/(\$\d+)?$/, '') + '$' + id
      id++
    }
    set.add(str)
    return str
  }
})()

const scrollTo = (function scrollToFactory() {
  let request
  const easeOutQuad = function(t, b, c, d) {
    t /= d
    return -c * t * (t - 2) + b
  }
  return function scrollTo({
    targetElem,
    scrollElem = document.body,
    topMargin = 0,
    maxDuration = 300,
    easeFn,
    callback
  }) {
    cancelAnimationFrame(request)
    let rect = targetElem.getBoundingClientRect()
    let endScrollTop = rect.top + scrollElem.scrollTop - topMargin
    let startScrollTop = scrollElem.scrollTop
    let distance = endScrollTop - startScrollTop
    let startTime
    let ease = easeFn || easeOutQuad
    let distanceRatio = Math.min(Math.abs(distance) / 10000, 1)
    let duration = Math.max(maxDuration * distanceRatio * (2 - distanceRatio), 10)

    function update(timestamp) {
      if (!startTime) {
        startTime = timestamp
      }
      let progress = (timestamp - startTime) / duration
      if (progress < 1) {
        scrollElem.scrollTop = ease(timestamp - startTime, startScrollTop, distance, duration)
        requestAnimationFrame(update)
      } else {
        scrollElem.scrollTop = endScrollTop
        if (callback) {
          callback()
        }
      }
    }
    requestAnimationFrame(update)
  }
})()

function toDash(str) {
  return str.replace(/([A-Z])/g, (match, p1) => '-' + p1.toLowerCase())
}

function applyStyle(elem, style = {}, reset = false) {
  if (reset) {
    elem.style = ''
  }
  if (typeof style === 'string') {
    elem.style = style
  } else {
    for (let prop in style) {
      if (typeof style[prop] === 'number') {
        elem.style.setProperty(toDash(prop), px(style[prop]), 'important')
      } else {
        elem.style.setProperty(toDash(prop), style[prop], 'important')
      }
    }
  }
}

function translate3d(x = 0, y = 0, z = 0) {
  return `translate3d(${Math.round(x)}px, ${Math.round(y)}px, ${Math.round(z)}px)` // 0.5px => blurred text
}

function setClass(elem, names, delay) {
  if (delay === undefined) {
    elem.classList = names
  } else {
    return setTimeout(() => {
      elem.classList = names
    }, delay)
  }
}



const toastFn = (function toastFactory() {
  let timers = []
  return function _toast(msg) {
    let toast
    insertCSS(toastCSS, 'smarttoc-toast__css')
    if (document.getElementById('smarttoc-toast')) {
      toast = document.getElementById('smarttoc-toast')
    } else {
      toast = document.createElement('DIV')
      toast.id = 'smarttoc-toast'
      document.body.appendChild(toast)
    }
    toast.textContent = msg

    timers.forEach(clearTimeout)
    toast.classList = ''

    const set = setClass.bind(null, toast)

    toast.classList = 'enter'
    timers = [
      set('enter enter-active', 0),
      set('leave', 3000),
      set('leave leave-active', 3000),
      set('', 3000 + 200)
    ]
  }
})()

const insertCSS = function(css, id) {
  if (!document.getElementById(id)) {
    let style = document.createElement('STYLE')
    style.type = 'text/css'
    style.id = id
    style.textContent = css
    document.head.appendChild(style)
    return
  }
}


const mount = function(parent, elem) {
  if (!parent.contains(elem)) {
    parent.appendChild(elem)
  }
}

var tocCSS = "/* EVERYTHING HERE WILL BE '!IMPORTANT'  */\n\n\n/* reset */\n\n#smarttoc {\n  all: initial;\n}\n\n#smarttoc * {\n  all: unset;\n}\n\n\n/* container */\n\n#smarttoc {\n  position: fixed;\n  max-width: 22em;\n  min-width: 14em;\n  max-height: calc(100vh - 100px);\n  z-index: 10000;\n  box-sizing: border-box;\n  background-color: #fff;\n  padding: 2em 1.3em 1.3em 1em;\n  color: gray;\n  font-size: calc(12px + 0.1vw);\n  font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif;\n  line-height: 1.5;\n  font-weight: normal;\n  border: 1px solid rgba(158, 158, 158, 0.22);\n  -webkit-font-smoothing: subpixel-antialiased;\n  font-smoothing: subpixel-antialiased;\n  overflow-x: hidden;\n  overflow-y: auto;\n  will-change: transform, max-width;\n  transition: max-width 0.3s;\n}\n\n#smarttoc:hover {\n  max-width: 33vw;\n}\n\n#smarttoc.hidden {\n  display: none;\n}\n\n#smarttoc .handle {\n  -webkit-user-select: none;\n  user-select: none;\n  position: absolute;\n  left: 0;\n  right: 0;\n  top: 0;\n  border-bottom: 1px solid rgba(158, 158, 158, 0.22);\n  padding: 0.1em 0.7em;\n  font-variant-caps: inherit;\n  font-variant: small-caps;\n  font-size: 0.9em;\n  color: #bbb;\n  cursor: pointer;\n  text-align: center;\n  opacity: 0;\n  will-change: opacity;\n  transition: opacity 0.3s;\n}\n\n#smarttoc:hover .handle {\n  max-width: 33vw;\n  opacity: 1;\n}\n\n#smarttoc .handle:hover,\n#smarttoc .handle:active {\n  cursor: move;\n}\n\n#smarttoc .handle:active {\n  background: #f9f9f9;\n}\n\n\n/* all headings  */\n\n#smarttoc ul,\n#smarttoc li {\n  list-style: none;\n  padding-left: 0;\n  display: block;\n}\n\n#smarttoc a {\n  text-decoration: none;\n  color: gray;\n  display: block;\n  line-height: 1.3;\n  padding-top: 0.2em;\n  padding-bottom: 0.2em;\n  text-overflow: ellipsis;\n  overflow-x: hidden;\n  white-space: nowrap;\n}\n\n#smarttoc a:hover,\n#smarttoc a:active {\n  border-left-color: rgba(86, 61, 124, 0.5);\n  color: #563d7c;\n}\n\n#smarttoc li.active>a {\n  border-left-color: #563d7c;\n  color: #563d7c;\n}\n\n\n/* heading level: 1 */\n\n#smarttoc ul {\n  line-height: 2;\n}\n\n#smarttoc ul a {\n  font-size: 1em;\n  padding-left: 1.3em;\n}\n\n#smarttoc ul a:hover,\n#smarttoc ul a:active,\n#smarttoc ul li.active>a {\n  border-left-width: 3px;\n  border-left-style: solid;\n  padding-left: calc(1.3em - 3px);\n}\n\n#smarttoc ul li.active>a {\n  font-weight: 700;\n}\n\n\n/* heading level: 2 (hidden only when there are too many headings)  */\n\n#smarttoc ul ul {\n  line-height: 1.8;\n}\n\n#smarttoc.lengthy ul ul {\n  display: none;\n}\n\n#smarttoc.lengthy ul li.active>ul {\n  display: block;\n}\n\n#smarttoc ul ul a {\n  font-size: 1em;\n  padding-left: 2.7em;\n}\n\n#smarttoc ul ul a:hover,\n#smarttoc ul ul a:active,\n#smarttoc ul ul li.active>a {\n  border-left-width: 2px;\n  border-left-style: solid;\n  padding-left: calc(2.7em - 2px);\n  font-weight: normal;\n}\n\n\n/* heading level: 3 (hidden unless parent is active) */\n\n#smarttoc ul ul ul {\n  line-height: 1.7;\n  display: none;\n}\n\n#smarttoc ul ul li.active>ul {\n  display: block;\n}\n\n#smarttoc ul ul ul a {\n  font-size: 1em;\n  padding-left: 4em;\n}\n\n#smarttoc ul ul ul a:hover,\n#smarttoc ul ul ul a:active,\n#smarttoc ul ul ul li.active>a {\n  border-left-width: 1px;\n  border-left-style: solid;\n  padding-left: calc(4em - 1px);\n  font-weight: normal;\n}\n";

const proto = {
  subscribe(cb, emitOnSubscribe = true) {
    if (emitOnSubscribe && this.value !== undefined) {
      cb(this.value)
    }
    this.listeners.push(cb)
    return this
  },
  unique() {
    let lastValue = this.value
    let $unique = Stream(lastValue)
    this.subscribe(val => {
      if (val !== lastValue) {
        $unique(val)
        lastValue = val
      }
    })
    return $unique
  },
  map(f) {
    return Stream.combine(this, f)
  },
  filter(f) {
    return this.map(output => f(output) ? output : undefined)
  },
  throttle(delay) {
    let $throttled = Stream(this.value)
    const emit = throttle(value => $throttled(value), delay)
    this.subscribe(emit)
    return $throttled
  }
}

const Stream = function Stream(initial) {
  let s = function(val) {
    if (val !== undefined) {
      s.value = val
      s.listeners.forEach(l => l(s.value))
    }
    return s.value
  }

  s.value = initial
  s.listeners = []

  Object.assign(s, proto)

  return s
}

Stream.combine = function(...streams) {
  let reducer = streams.pop()
  let cached = streams.map(s => s())
  let $combined = Stream(reducer(...cached))
  streams.forEach((stream, i) => {
    stream.subscribe(
      val => {
        cached[i] = val
        $combined(reducer(...cached))
      },
      false
    )
  })
  return $combined
}

Stream.interval = function(int) {
  let $interval = Stream()
  setInterval(() => $interval(null), int)
  return $interval
}

Stream.fromEvent = function(elem, type) {
  let $event = Stream()
  elem.addEventListener(type, $event)
  return $event
}

const createHeadingDOM = function(headings) {
  function toTree(headings) {
    let i = 0
    let len = headings.length
    let tree = []
    let stack = [tree]
    const last = arr => arr.slice(-1)[0]

    function createChild(parent, heading) {
      parent.push({
        heading: heading || null,
        children: []
      })
      return last(parent).children
    }
    while (i < len) {
      let { level } = headings[i]
      if (level === stack.length) {
        let children = createChild(last(stack), headings[i])
        stack.push(children)
        i++
      } else if (level < stack.length) {
        stack.pop()
      } else if (level > stack.length) {
        let children = createChild(last(stack))
        stack.push(children)
      }
    }
    return tree
  }

  function toDOM(tree) {
    function toUL(array) {
      let ul = document.createElement('UL')
      array.forEach(child => {
        ul.appendChild(toLI(child))
      })
      return ul
    }

    function toLI({ heading, children }) {
      let li = document.createElement('LI')
      let ul
      if (heading) {
        let a = document.createElement('A')
        a.href = '#' + heading.anchor
        a.textContent = heading.node.textContent
        li.appendChild(a)
      }
      if (children && children.length) {
        ul = toUL(children)
        li.appendChild(ul)
      }
      return li
    }
    return toUL(tree)
  }

  let tree = toTree(headings)
  let dom = toDOM(tree)
  return dom
}


const TOC = function({ headings, $activeHeading, onClickHeading }) {
  const updateActiveHeading = function(container, activeIndex) {
    let activeLIs = [].slice.apply(container.querySelectorAll('.active'))
    activeLIs.forEach(li => {
      li.classList.remove('active')
    })
    let anchors = [].slice.apply(container.querySelectorAll('a'))
    let elem = anchors[activeIndex]
    elem.scrollIntoViewIfNeeded()
    while (elem !== container) {
      if (elem.tagName === 'LI') {
        elem.classList.add('active')
      }
      elem = elem.parentNode
    }
  }

  let toc = createHeadingDOM(headings)

  $activeHeading.subscribe(activeIndex => {
    updateActiveHeading(toc, activeIndex)
  })

  toc.addEventListener('click', onClickHeading, true)
  return toc
}

const Handle = function({ $userOffset }) {
  const handleUserDrag = function(handle, $userOffset) {
    let [sClientX, sClientY] = [0, 0]
    let [sOffsetX, sOffsetY] = [0, 0]
    const stop = e => {
      e.stopPropagation()
      e.preventDefault()
    }
    const onMouseMove = throttle(e => {
      stop(e)
      let [dX, dY] = [e.clientX - sClientX, e.clientY - sClientY]
      $userOffset([sOffsetX + dX, sOffsetY + dY])
    })
    handle.addEventListener('mousedown', e => {
      if (e.button === 0) {
        stop(e)
        sClientX = e.clientX
        sClientY = e.clientY
        sOffsetX = $userOffset()[0]
        sOffsetY = $userOffset()[1]
        window.addEventListener('mousemove', onMouseMove)
      }
    })
    window.addEventListener('mouseup', () => {
      window.removeEventListener('mousemove', onMouseMove)
    })
  }

  let handle = document.createElement('DIV')
  handle.textContent = 'table of contents'
  handle.classList.add('handle')
  handleUserDrag(handle, $userOffset)
  return handle
}

const ARTICLE_TOC_GAP = 150

const makeSticky = function(options) {
  let { ref, popper, direction, gap, $refChange, $scroll, $offset, $topMargin } = options
  let $refMetric = Stream.combine($refChange,
    () => {
      let refRect = ref.getBoundingClientRect()
      return {
        top: refRect.top + window.scrollY,
        right: refRect.right + window.scrollX,
        bottom: refRect.bottom + window.scrollY,
        left: refRect.left + window.scrollX,
        width: refRect.width,
        height: refRect.height
      }
    }
  )
  let popperMetric = popper.getBoundingClientRect()
  return Stream.combine($refMetric, $scroll, $offset, $topMargin,
    (article, [scrollX, scrollY], [offsetX, offsetY], topMargin) => {
      let x = direction === 'right' ? article.right + gap : article.left - gap - popperMetric.width
      x = Math.min(Math.max(0, x), window.innerWidth - popperMetric.width) // restrict to visible area
      let y = Math.max(topMargin, article.top - scrollY)
      return {
        position: 'fixed',
        left: 0,
        top: 0,
        transform: translate3d(x + offsetX, y + offsetY)
      }
    }
  )
}


const getOptimalContainerPos = function(article) {
  const { top, left, right, bottom, height, width } = article.getBoundingClientRect()


  const depthOf = function(elem) {
    let depth = 0
    while (elem) {
      elem = elem.parentElement
      depth++
    }
    return depth
  }
  const depthOfPoint = function([x, y]) {
    const elem = document.elementFromPoint(x, y)
    return elem && depthOf(elem)
  }
  const gap = ARTICLE_TOC_GAP
  const testWidth = 200
  const testHeight = 400
  const leftSlotTestPoints = [left - gap - testWidth, left - gap - testWidth / 2, left - gap]
    .map(x => [top, top + testHeight / 2, top + testHeight].map(y => [x, y]))
    .reduce((prev, cur) => prev.concat(cur), [])
  const rightSlotTestPoints = [right + gap, right + gap + testWidth / 2, right + gap + testWidth]
    .map(x => [top, top + testHeight / 2, top + testHeight].map(y => [x, y]))
    .reduce((prev, cur) => prev.concat(cur), [])
  const leftDepths = leftSlotTestPoints.map(depthOfPoint).filter(Boolean)
  const rightDepths = rightSlotTestPoints.map(depthOfPoint).filter(Boolean)
  const leftAvgDepth = leftDepths.length ? leftDepths.reduce((a, b) => a + b, 0) / leftDepths.length : null
  const rightAvgDepth = rightDepths.length ? rightDepths.reduce((a, b) => a + b, 0) / rightDepths.length : null

  log('rightDepths ', rightDepths)
  log('rightAvgDepth ', rightAvgDepth)
  log('leftDepths ', leftDepths)
  log('leftAvgDepth ', leftAvgDepth)
  if (!leftAvgDepth) return { direction: 'right' }
  if (!rightAvgDepth) return { direction: 'left' }
  const spaceDiff = document.documentElement.offsetWidth - right - left
  log('spaceDiff ', spaceDiff)
  const scoreDiff = spaceDiff * 1 + (rightAvgDepth - leftAvgDepth) * 9 * (-10) + 20 // I do like right better
  return scoreDiff > 0 ? { direction: 'right' } : { direction: 'left' }
}


const Container = function({
  article,
  headings,
  $activeHeading,
  $isShow,
  $userOffset,
  $relayout,
  $scroll,
  $topbarHeight,
  onClickHeading
}) {
  let container = document.createElement('DIV')
  container.id = 'smarttoc'
  container.appendChild(Handle({ $userOffset }))
  container.appendChild(TOC({ headings, $activeHeading, onClickHeading }))

  let isLengthy = headings.filter(h => (h.level <= 2)).length > 50
  if (isLengthy) {
    container.classList.add('lengthy')
  }

  $isShow.subscribe(isShow => {
    if (!isShow) {
      container.classList.add('hidden')
    } else {
      container.classList.remove('hidden')
    }
  })

  setTimeout(() => {
    // wait until node is mounted
    // you can addEventListener() BEFORE adding to DOM
    // but elem.getBoundingRect() will return all zeros

    const { direction } = getOptimalContainerPos(article)

    const $containerStyle = makeSticky({
      ref: article,
      popper: container,
      direction: direction,
      gap: ARTICLE_TOC_GAP,
      $topMargin: $topbarHeight.map(h => ((h || 0) + 50)),
      $refChange: $relayout,
      $scroll: $scroll,
      $offset: $userOffset
    })

    $containerStyle.subscribe(style => applyStyle(container, style, true))

  }, 0)

  return container
}

const Extender = function({ headings, scrollable, $isShow, $relayout }) {
  const $extender = Stream()
    // toc: extend body height so we can scroll to the last heading
  let extender = document.createElement('DIV')
  extender.id = 'smarttoc-extender'
  Stream.combine($isShow, $relayout, (isShow) => {
    setTimeout(() => { // some delay to ensure page is stable ?
      let lastHeading = headings.slice(-1)[0].node
      let lastRect = lastHeading.getBoundingClientRect()
      let extenderHeight = 0
      if (scrollable === document.body) {
        let heightBelowLastRect = document.documentElement.scrollHeight -
          (lastRect.bottom + window.scrollY) - num(extender.style.height) // in case we are there already
        extenderHeight = isShow ? Math.max(window.innerHeight - lastRect.height - heightBelowLastRect, 0) : 0
      } else {
        let scrollRect = scrollable.getBoundingClientRect()
        let heightBelowLastRect = scrollRect.top + scrollable.scrollHeight - scrollable.scrollTop // bottom of scrollable relative to viewport
          -
          lastRect.bottom - num(extender.style.height) // in case we are there already
        extenderHeight = isShow ? Math.max(scrollRect.height - lastRect.height - heightBelowLastRect, 0) : 0
      }
      $extender({
        height: extenderHeight
      })
    }, 300)
  })
  $extender.subscribe(style => applyStyle(extender, style))
  return extender
}

const relayoutStream = function(article, $resize, $isShow) {
  const readableStyle = function(article) {
    let computed = window.getComputedStyle(article)
    let fontSize = num(computed.fontSize)
    let bestWidth = Math.min(Math.max(fontSize, 12), 16) * 66
    return Object.assign(
      (num(computed.marginLeft) || num(computed.marginRight)) ? {} : {
        marginLeft: 'auto',
        marginRight: 'auto'
      },
      num(computed.maxWidth) ? {} : {
        maxWidth: bestWidth
      }
    )
  }
  let oldStyle = article.style.cssText
  let newStyle = readableStyle(article)
  let $relayout = $isShow.map(isShow => {
    if (isShow) {
      applyStyle(article, newStyle)
      return article
    } else {
      applyStyle(article, oldStyle)
    }
  })
  return Stream.combine($relayout, $resize, () => null)
}

const addAnchors = function(headings) {
  const anchoredHeadings = headings.map(function({ node, level }) {
    let anchor = node.id || [].slice.apply(node.children)
      .filter(elem => elem.tagName === 'A')
      .map(a => {
        let href = a.getAttribute('href') || ''
        return href.startsWith('#') ? href.substr(1) : a.id
      })
      .filter(Boolean)[0]
    if (!anchor) {
      anchor = node.id = unique(safe(node.textContent))
    } else {
      anchor = unique(anchor)
    }
    return { node, level, anchor }
  })
  return anchoredHeadings
}

const getScrollParent = function(elem) {
  const canScroll = el =>
    (['auto', 'scroll'].includes(window.getComputedStyle(el).overflowY) &&
      (el.clientHeight + 1 < el.scrollHeight))
  while (elem && (elem !== document.body) && !canScroll(elem)) {
    elem = elem.parentElement
  }
  log('scrollable', elem)
  draw(elem, 'purple')
  return elem
}

const scrollStream = function(scrollable, $isShow) {
  let $scroll = Stream([scrollable.scrollLeft, scrollable.scrollTop])
  let source = scrollable === document.body ? window : scrollable
  Stream.fromEvent(source, 'scroll')
    .filter(() => $isShow())
    .throttle()
    .subscribe(() => {
      $scroll([scrollable.scrollLeft, scrollable.scrollTop])
    })
  return $scroll
}

const activeHeadingStream = function(headings, $scroll, $relayout, $topbarHeight) {
  let $headingYs = $relayout.map(() => {
    let scrollY = window.scrollY // FIXME
    return headings.map(({ node }) => [
      scrollY + node.getBoundingClientRect().top,
      scrollY + node.getBoundingClientRect().bottom
    ])
  })

  let $curIndex = Stream.combine($headingYs, $scroll, $topbarHeight, function(headingYs, [scrollX, scrollY],
    topbarHeight = 0) {
    let i = 0
    for (let len = headingYs.length; i < len; i++) {
      if (headingYs[i][0] > scrollY + topbarHeight + 20) {
        break
      }
    }
    return Math.max(0, i - 1)
  })

  return $curIndex.unique()
}

const scrollToHeading = function({ node },
  scrollElem = document.body,
  onScrollEnd,
  topMargin = 0
) {
  scrollTo({
    targetElem: node,
    scrollElem: scrollElem,
    topMargin: topMargin,
    maxDuration: 300,
    callback: onScrollEnd && onScrollEnd.bind(null, node)
  })
}

const getTopBarHeight = function(topElem) {
  const findFixedParent = function(elem) {
    const isFixed = elem => {
      let { position, zIndex } = window.getComputedStyle(elem)
      return position === 'fixed' && zIndex
    }
    while (elem !== document.body && !isFixed(elem)) {
      elem = elem.parentElement
    }
    return elem === document.body ? null : elem
  }
  let { left, right, top } = topElem.getBoundingClientRect()
  let leftTopmost = document.elementFromPoint(left + 1, top + 1)
  let rightTopmost = document.elementFromPoint(right - 1, top + 1)
  if (leftTopmost && rightTopmost && leftTopmost !== topElem && rightTopmost !== topElem) {
    let leftFixed = findFixedParent(leftTopmost)
    let rightFixed = findFixedParent(rightTopmost)
    if (leftFixed && leftFixed === rightFixed) {
      return leftFixed.offsetHeight
    } else {
      return 0
    }
  } else {
    return 0
  }
}

function createTOC({ article, headings, userOffset = [0, 0] }) {

  headings = addAnchors(headings)
  insertCSS(tocCSS, 'smarttoc__css')

  const scrollable = getScrollParent(article)

  const $isShow = Stream(true)
  const $topbarHeight = Stream()
  const $resize = Stream.combine(
      Stream.fromEvent(window, 'resize'),
      Stream.fromEvent(document, 'readystatechange'),
      Stream.fromEvent(document, 'load'),
      Stream.fromEvent(document, 'DOMContentLoaded'),
      () => null
    )
    .filter(() => $isShow())
    .throttle()
  const $scroll = scrollStream(scrollable, $isShow)
  const $relayout = relayoutStream(article, $resize, $isShow)
  const $activeHeading = activeHeadingStream(headings, $scroll, $relayout, $topbarHeight)
  const $userOffset = Stream(userOffset)


  scrollable.appendChild(Extender({ headings, scrollable, $isShow, $relayout }))


  const onScrollEnd = function(node) {
    if ($topbarHeight() == null) {
      setTimeout(() => {
        $topbarHeight(getTopBarHeight(node))
        if ($topbarHeight()) {
          scrollToHeading({ node }, scrollable, null, $topbarHeight() + 10)
        }
      }, 300)
    }
  }

  const onClickHeading = function(e) {
    e.preventDefault()
    e.stopPropagation()
    const anchor = e.target.getAttribute('href').substr(1)
    const heading = headings.find(heading => (heading.anchor === anchor))
    scrollToHeading(heading, scrollable, onScrollEnd, ($topbarHeight() || 0) + 10)
  }

  const container = Container({
    article,
    headings,
    $activeHeading,
    $isShow,
    $userOffset,
    $relayout,
    $scroll,
    $topbarHeight,
    onClickHeading
  })
  mount(document.body, container)

  // now show what we've found
  if (article.getBoundingClientRect().top > window.innerHeight - 50) {
    scrollToHeading(headings[0], scrollable, onScrollEnd, ($topbarHeight() || 0) + 10)
  }


  return {

    isValid: () =>
      document.body.contains(article) &&
      article.contains(headings[0].node),

    isShow: () =>
      $isShow(),

    toggle: () =>
      $isShow(!$isShow()),

    next: () => {
      if ($isShow()) {
        let nextIdx = Math.min(headings.length - 1, $activeHeading() + 1)
        scrollToHeading(headings[nextIdx], scrollable, onScrollEnd, ($topbarHeight() || 0) + 10)
      }
    },

    prev: () => {
      if ($isShow()) {
        let prevIdx = Math.max(0, $activeHeading() - 1)
        scrollToHeading(headings[prevIdx], scrollable, onScrollEnd, ($topbarHeight() || 0) + 10)
      }
    },

    dispose: () => {
      log('dispose')
      $isShow(false)
      container && container.remove()
      return { userOffset: $userOffset() }
    }
  }
}

const pathToTop = function(elem, maxLvl = -1) {
  assert(elem, 'no element given')
  const path = []
  while (elem && maxLvl--) {
    path.push(elem)
    elem = elem.parentElement
  }
  return path
}

const isStrongAlsoHeading = function(rootElement = document) {
  return false
    // return rootElement.querySelectorAll('p > strong:only-child').length > 3
}

const extractArticle = function(rootElement = document) {
  log('extracting article')

  const scores = new Map()

  function addScore(elem, inc) {
    scores.set(elem, (scores.get(elem) || 0) + inc)
  }

  function updateScore(elem, weight) {
    let path = pathToTop(elem, weight.length)
    path.forEach((elem, distance) => addScore(elem, weight[distance]))
  }

  // weigh nodes by factor: "selector", "distance from this node"
  const weights = {
    h1: [0, 100, 60, 40, 30, 25, 22].map(s => (s * 0.4)),
    h2: [0, 100, 60, 40, 30, 25, 22],
    h3: [0, 100, 60, 40, 30, 25, 22].map(s => (s * 0.5)),
    h4: [0, 100, 60, 40, 30, 25, 22].map(s => (s * 0.5 * 0.5)),
    h5: [0, 100, 60, 40, 30, 25, 22].map(s => (s * 0.5 * 0.5 * 0.5)),
    h6: [0, 100, 60, 40, 30, 25, 22].map(s => (s * 0.5 * 0.5 * 0.5 * 0.5)),
    article: [500],
    '.article': [500],
    '.content': [101],
    'sidebar': [-500],
    '.sidebar': [-500],
    'aside': [-500],
    '.aside': [-500],
    'nav': [-500],
    '.nav': [-500],
    '.navigation': [-500],
    '.toc': [-500],
    '.table-of-contents': [-500]
  }
  const selectors = Object.keys(weights)
  selectors
    .map(selector => ({
      selector: selector,
      elems: [].slice.apply(rootElement.querySelectorAll(selector))
    }))
    .forEach(({ selector, elems }) =>
      elems.forEach(elem =>
        updateScore(elem, weights[selector])
      )
    )
  const sorted = [...scores].sort((a, b) => (b[1] - a[1]))

  // reweigh top 5 nodes by factor:  "take-lots-vertical-space", "contain-less-links", "too-narrow"
  let candicates = sorted.slice(0, 5).filter(Boolean).map(([elem, score]) => ({ elem, score }))
  let isTooNarrow = e => (e.scrollWidth < 400) // rule out sidebars
  candicates.forEach(c => {
    if (isTooNarrow(c.elem)) {
      c.isNarrow = true
      candicates.forEach(parent => {
        if (parent.elem.contains(c.elem)) {
          parent.score *= 0.7
        }
      })
    }
  })
  candicates = candicates.filter(c => !c.isNarrow)

  const reweighted = candicates
    .map(({ elem, score }) => [
      elem,
      score * Math.log(elem.scrollHeight / (elem.querySelectorAll('a').length || 1)),
      elem.scrollHeight,
      elem.querySelectorAll('a').length
    ])
    .sort((a, b) => (b[1] - a[1]))
  const article = reweighted.length ? reweighted[0][0] : null
  if (false) {}
  return article
}

const extractHeadings = function(article) {
  log('extracting heading')

  // what to be considered as headings
  const tags = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].concat(
    isStrongAlsoHeading(article) ? 'STRONG' : [])
  const tagWeight = tag => ({ H1: 4, H2: 9, H3: 9, H4: 10, H5: 10, H6: 10, STRONG: 10 }[tag])
  const isMostlyVisible = headings => (headings.filter(h => h.offsetHeight).length >= headings.length * 0.5)
  const headingGroup = tags.map(tag => [].slice.apply(article.getElementsByTagName(tag)))
    .map((headings, i) => ({
      elems: headings,
      tag: tags[i],
      score: headings.length * tagWeight(tags[i])
    }))
    .filter(heading => heading.score >= 10)
    .filter(heading => isMostlyVisible(heading.elems))
    .slice(0, 3)

  // use document sequence
  const validTags = headingGroup.map(headings => headings.tag)
  const acceptNode = node => validTags.includes(node.tagName) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
  const treeWalker = document.createTreeWalker(
    article,
    NodeFilter.SHOW_ELEMENT, { acceptNode }
  )
  const headings = []
  while (treeWalker.nextNode()) {
    let node = treeWalker.currentNode
    headings.push({
      node,
      level: validTags.indexOf(node.tagName) + 1
    })
  }
  if (false) {}
  return headings
}

export function extract() {
  const article = extractArticle(document)
  const headings = article && extractHeadings(article)
  return [article, headings]
}

export function run(option){

  if (isMasterFrame(window)) {

    let toc

    const generate = function(option = {userOffset: [0, 0]}) {
      let [article, headings] = extract()
      if (article && headings && headings.length) {
        return createTOC(Object.assign({ article, headings }, option))
      } else {
        toastFn('No article/headings are detected.')
        return null
      }
    }

    toc = generate(option)

    // setInterval(() => {

    // }, 3000)
    return {toc: toc, refresh: ()=>{
      if (toc && !toc.isValid()) {
        let lastState = toc.dispose()
        toc = generate(lastState)
      }
      if (!toc){
        toc = generate(option)
      }
    }, dispose: ()=>{
      toc && toc.dispose()
    }}; // return obj for reference hold
  }
}
