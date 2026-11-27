(() => {
  if (customElements.get('allreduce-flow')) return

  const cases = {
    normal: {
      name: '正常传输', late: 0, queue: 0,
      steps: [
        [0, '梯度开始就绪', '观察每张 GPU 的输入，追踪同一位置的一个梯度元素。'],
        [2, '四个输入已就绪', '两台机器各自通过 NVLink 把 GPU 1 的值送到 GPU 0。'],
        [6, '两端形成局部和', '节点 A 得到 3，节点 B 得到 12。两张网卡从各自 GPU 0 读取局部和。'],
        [11, '两个方向交换分片', '青色 3 发往 B，蓝色 12 发往 A。观察两条方向相反的跨机通路。'],
        [18, '两个代表 GPU 得到 15', '各节点把收到的值和本地局部和相加，再通过 NVLink 分发结果。'],
        [26, '四张 GPU 均已完成', '这一元素在四个接收缓冲区中的值都是 15。']
      ]
    },
    late: {
      name: '一个 rank 晚到', late: 80, queue: 0,
      steps: [
        [0, '观察节点 B 的 GPU 1', '这张卡的上游计算延迟，梯度 8 要到 82 ms 才准备好。'],
        [2, 'A 先做节点内归约', 'A 可以计算并发送局部和 3。B 的 GPU 0 还缺另一个本地输入。'],
        [16, '3 已经到达 B', '网卡 B 已把 3 写入接收缓冲区。B 仍保留本地输入 4，等待 GPU 1 的 8。'],
        [82, '晚到的 8 刚就绪', 'B 的 GPU 1 现在才可以把这个输入交给本地归约。'],
        [86, 'B 得到并发出 12', 'B 已经收到 3，可以在本地合并；A 继续等待 B 的 12。'],
        [98, 'A 收齐两个局部和', 'A 的 GPU 0 得到 15，最后一段是节点内分发。'],
        [106, '四张 GPU 均已完成', '从最晚就绪到全组完成用了 24 ms，与正常案例相同。']
      ]
    },
    queue: {
      name: '共享出口排队', late: 0, queue: 80,
      steps: [
        [0, '观察发往 B 的出口', '本例只给 A 到 B 的方向增加排队，反方向保持可用。'],
        [2, '四个输入按时就绪', '两台机器照常做本地归约。此时尚看不出全组何时完成。'],
        [10, '3 到达交换机并排队', '回写流量竞争同一个物理出口，发往 B 的分片 3 暂时停在队列里。'],
        [26, 'A 已完成，B 仍在等 3', '反方向的 12 已到 A。此时 A 的两张卡都有 15，B 的 GPU 0 仍持有 12。'],
        [90, '3 离开拥堵出口', '对照上一步，分片现在才从交换机向网卡 B 移动。'],
        [97, 'B 终于得到 15', '网卡 B 已完成写入。B 的 GPU 0 把 3 加到 12 上，再分发给 GPU 1。'],
        [106, '四张 GPU 均已完成', '最晚就绪仍是 2 ms，最晚就绪到全组完成延长到了 104 ms。']
      ]
    }
  }

  const colors = { a: 'outbound', b: 'inbound', result: 'result' }

  function endpoint(id, x, y, label) {
    return `<g id="${id}" class="device" transform="translate(${x} ${y})">
      <rect width="76" height="46" rx="4"/><text class="name" x="38" y="18">${label}</text>
      <text class="value" x="38" y="36"></text></g>`
  }

  function host(id, top, ranks) {
    const y = top + 46
    return `<g>
      <rect class="enclosure" x="3" y="${top}" width="374" height="110" rx="6"/>
      <text class="host-name" x="14" y="${top + 23}">节点 ${id}</text>
      <text class="ranks" x="80" y="${top + 22}">${ranks}</text>
      <path class="wire" d="M88 ${y + 28}H148 M224 ${y + 28}H286"/>
      <text class="wire-label" x="118" y="${y + 18}">NVLink</text>
      <text class="wire-label" x="255" y="${y + 18}">PCIe</text>
      ${endpoint(id+'1',12,y,'GPU 1')}${endpoint(id+'0',148,y,'GPU 0')}
      ${endpoint(id+'nic',286,y,'网卡 '+id)}
      <text class="buffer" id="recv-${id}" x="186" y="${y+59}"></text>
    </g>`
  }

  function board() {
    return `<svg class="board" viewBox="0 0 380 330" role="img" aria-label="上下为两台双卡服务器。节点内两张 GPU 经 NVLink 相连，GPU 0 经 PCIe 连网卡，两端网卡经过中间的交换机连接。">
      <path class="wire" d="M316 95V265 M341 95V265"/>
      ${host('A',5,'rank 0–1')}${host('B',215,'rank 2–3')}
      <path class="wire" d="M316 97V144 M341 97V144 M316 198V261 M341 198V261"/>
      <path class="wire" d="m312 127 4 4 4-4 m17 4 4-4 4 4"/>
      <text class="fabric" x="14" y="143">跨机交换</text>
      <circle class="key outbound" cx="20" cy="164" r="5"/><text class="key-label" x="33" y="169">A → B　局部和 3</text>
      <circle class="key inbound" cx="20" cy="188" r="5"/><text class="key-label" x="33" y="193">B → A　局部和 12</text>
      <g id="switch" class="device" transform="translate(279 144)">
        <rect width="96" height="54" rx="4"/><text class="name" x="48" y="21">交换机</text>
        <text class="value" x="48" y="40"></text>
      </g>
      <g class="contender" hidden><path d="M184 172H276" stroke-dasharray="3 4"/><text x="184" y="162">检查点回写 →</text></g>
      <g class="tokens"></g>
    </svg>`
  }

  // Each route is one buffer transfer. Movement stops at device boundaries.
  function transfers(late, queue) {
    const aMerge = 18 + late
    const bMerge = Math.max(6 + late, 16 + queue) + 1
    return [
      [1, 5, 88, 79, 148, 79, 2, colors.a],
      [2+late, 6+late, 88, 289, 148, 289, 8, colors.b],
      [5, 8, 224, 79, 286, 79, 3, colors.a],
      [8, 10, 316, 97, 316, 144, 3, colors.a],
      [10, 10+queue, 316, 204, 316, 204, 3, 'queued'],
      [10+queue, 13+queue, 316, 198, 316, 261, 3, colors.a],
      [13+queue, 16+queue, 286, 289, 224, 289, 3, colors.a],
      [6+late, 9+late, 224, 289, 286, 289, 12, colors.b],
      [9+late, 11+late, 341, 261, 341, 198, 12, colors.b],
      [11+late, 14+late, 341, 144, 341, 97, 12, colors.b],
      [14+late, 17+late, 286, 79, 224, 79, 12, colors.b],
      [aMerge, aMerge+8, 148, 79, 88, 79, 15, colors.result],
      [bMerge, bMerge+9, 148, 289, 88, 289, 15, colors.result]
    ].filter(([start,end])=>end>start)
  }

  class AllReduceFlow extends HTMLElement {
    connectedCallback() {
      if (this.shadowRoot) { this.observe(); return }
      this.scenario = cases[this.getAttribute('scenario')]
      if (!this.scenario) return
      const {name, late, queue, steps} = this.scenario
      this.end = steps.at(-1)[0]
      this.time = 0
      this.intent = 'auto'
      this.visible = false
      this.reduced = matchMedia('(prefers-reduced-motion: reduce)')
      const root = this.attachShadow({mode:'open'})
      root.innerHTML = `<link rel="stylesheet" href="/css/allreduce-flow.css">
        <section aria-label="${name}逐步演示">
          <div class="diagram">${board()}</div>
          <div class="reader">
            <div class="clock"><span>示意时刻</span><span><output aria-live="off">0</output> / ${this.end} ms</span></div>
            <div class="detail"><strong></strong><p></p></div>
            <label>时间轴<input type="range" min="0" max="${this.end}" value="0" step="1" aria-label="示意时刻，毫秒"></label>
            <div class="buttons"><button class="play" type="button">播放</button><button class="prev" type="button">上一步</button><button class="next" type="button">下一步</button></div>
          </div>
        </section>`
      this.play = root.querySelector('.play')
      this.prev = root.querySelector('.prev')
      this.next = root.querySelector('.next')
      this.slider = root.querySelector('input')
      this.clock = root.querySelector('output')
      this.titleNode = root.querySelector('.detail strong')
      this.caption = root.querySelector('.detail p')
      this.contender = root.querySelector('.contender')
      this.buffers = [root.querySelector('#recv-A'), root.querySelector('#recv-B')]
      this.devices = new Map([...root.querySelectorAll('.device')].map(el=>[el.id,{el,value:el.querySelector('.value')}]))
      const layer = root.querySelector('.tokens')
      this.packets = transfers(late,queue).map(([start,end,x1,y1,x2,y2,value,color])=>{
        const group = document.createElementNS('http://www.w3.org/2000/svg','g')
        group.setAttribute('class','packet '+color)
        group.innerHTML = `<circle r="9"/><text y="3.8">${value}</text>`
        layer.append(group)
        return {start,end,x1,y1,x2,y2,group}
      })
      this.play.onclick = () => {
        if (this.playing) this.intent='pause'
        else {
          if (this.time>=this.end) this.seek(0)
          this.intent='play'
        }
        this.updatePlayback()
      }
      this.slider.oninput = () => this.manualSeek(this.slider.valueAsNumber)
      this.prev.onclick = () => this.manualSeek(steps.filter(([ms])=>ms<this.time-.01).at(-1)?.[0] ?? 0)
      this.next.onclick = () => this.manualSeek(steps.find(([ms])=>ms>this.time+.01)?.[0] ?? this.end)
      this.seek(0)
      this.observe()
    }

    observe() {
      if (!this.shadowRoot || this.observer) return
      this.onVisibility = () => this.updatePlayback()
      this.onMotion = () => {
        if (this.reduced.matches) this.intent='pause'
        this.updatePlayback()
      }
      this.observer=new IntersectionObserver(([entry])=>{
        this.visible=entry.isIntersecting
        this.autoVisible=entry.intersectionRatio>=.3
        this.updatePlayback()
      },{threshold:[0,.3]})
      this.observer.observe(this)
      document.addEventListener('visibilitychange',this.onVisibility)
      this.reduced.addEventListener('change',this.onMotion)
    }

    disconnectedCallback() {
      this.observer?.disconnect()
      this.observer=null
      document.removeEventListener('visibilitychange',this.onVisibility)
      this.reduced?.removeEventListener('change',this.onMotion)
      this.stop()
    }

    stop() {
      cancelAnimationFrame(this.frame)
      this.playing=false
    }

    manualSeek(t) {
      this.intent='pause'
      this.seek(t)
      this.updatePlayback()
    }

    updatePlayback() {
      const requested=this.intent==='play' || (this.intent==='auto' && this.autoVisible && !this.reduced.matches)
      const run=requested && this.visible && !document.hidden && this.time<this.end
      if (run && !this.playing) {
        this.playing=true
        let previous=performance.now()
        const tick=now=>{
          this.seek(Math.min(this.end,this.time+(now-previous)/220))
          previous=now
          if (this.time>=this.end) { this.intent='pause'; this.updatePlayback(); return }
          this.frame=requestAnimationFrame(tick)
        }
        this.frame=requestAnimationFrame(tick)
      } else if (!run) this.stop()
      this.play.textContent=this.playing?'暂停':this.time>=this.end?'重播':'播放'
    }

    paintDevice(id, value, state='') {
      const node=this.devices.get(id)
      if (node.value.textContent!==value) node.value.textContent=value
      if (node.el.dataset.state!==state) node.el.dataset.state=state
    }

    seek(t) {
      this.time=t
      const {late, queue, steps}=this.scenario
      const aMerge=18+late, bMerge=Math.max(6+late,16+queue)+1
      const drawInput=(id,ready,finish,input,waiting=false)=>{
        if (t>=finish) this.paintDevice(id,'结果 15','done')
        else if (t<ready) this.paintDevice(id,'计算中',waiting?'waiting':'')
        else this.paintDevice(id,'输入 '+input)
      }
      drawInput('A1',1,aMerge+8,2)
      drawInput('B1',2+late,bMerge+9,8,late>0)
      const representative=(id,sumAt,merged,input,sum)=>{
        if (t>=merged) this.paintDevice(id,'结果 15','done')
        else if (t>=sumAt) this.paintDevice(id,'局部和 '+sum,'partial')
        else this.paintDevice(id,'输入 '+input)
      }
      representative('A0',5,aMerge,1,3)
      representative('B0',6+late,bMerge,4,12)
      const received=[t>=17+late?'已收 12':'接收区空', t>=16+queue?'已收 3':'接收区空']
      this.buffers.forEach((el,i)=>{
        if (el.textContent!==received[i]) el.textContent=received[i]
      })
      const nic=(id,sendStart,sendEnd,receiveStart,receiveEnd)=>{
        const send=t>=sendStart && t<sendEnd, recv=t>=receiveStart && t<receiveEnd
        this.paintDevice(id,send&&recv?'双向传输':send?'发送中':recv?'接收中':'空闲',send||recv?'partial':'')
      }
      nic('Anic',5,10,11+late,17+late)
      nic('Bnic',6+late,11+late,10+queue,16+queue)
      const held=queue>0 && t>=10 && t<10+queue
      const traffic=(t>=8 && t<13+queue)||(t>=9+late && t<14+late)
      this.paintDevice('switch',held?'向 B 排队':traffic?'转发中':'空闲',held?'waiting':traffic?'partial':'')
      this.contender.toggleAttribute('hidden',!held)
      for (const {start,end,x1,y1,x2,y2,group} of this.packets) {
        const active=t>=start && t<end
        group.toggleAttribute('hidden',!active)
        if (active) {
          const f=(t-start)/(end-start)
          group.setAttribute('transform',`translate(${x1+(x2-x1)*f} ${y1+(y2-y1)*f})`)
        }
      }
      const ms=Math.floor(t)
      if (this.clock.value!==String(ms)) this.clock.value=String(ms)
      this.slider.value=ms
      const step=steps.filter(([ms])=>ms<=t).at(-1)
      if (step!==this.currentStep) {
        this.currentStep=step
        this.titleNode.textContent=step[1]
        this.caption.textContent=step[2]
      }
      this.prev.disabled=t===0
      this.next.disabled=t>=this.end
    }
  }
  customElements.define('allreduce-flow',AllReduceFlow)
})()
