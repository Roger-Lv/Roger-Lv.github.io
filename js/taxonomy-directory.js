(() => {
  const directory = document.querySelector('.taxonomy-directory')
  if (!directory) return
  const filter = directory.querySelector('.directory-filter')
  const input = filter.querySelector('input')
  const counter = directory.querySelector('.directory-count')
  const empty = directory.querySelector('.directory-empty')
  const initialCount = counter.textContent
  const items = Array.from(directory.querySelectorAll('li'), element => ({
    element,
    name: element.querySelector('.directory-name').textContent.toLocaleLowerCase()
  }))

  function update () {
    const query = input.value.trim().toLocaleLowerCase()
    let matches = 0
    for (const { element, name } of items) {
      element.hidden = !name.includes(query)
      if (!element.hidden) matches++
    }
    counter.textContent = query ? matches + ' / ' + initialCount : initialCount
    empty.hidden = matches > 0
  }

  filter.hidden = false
  input.addEventListener('input', update)
  update()
})()
