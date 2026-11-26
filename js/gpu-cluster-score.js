(() => {
  const form = document.getElementById('gpu-cluster-score');
  if (!form) return;
  const result = form.querySelector('#gpu-score-result');
  const factors = Array.from(form.querySelectorAll('tbody tr'), row => ({
    a: Number(row.cells[1].textContent),
    c: Number(row.cells[2].textContent),
    weight: row.querySelector('input'),
    display: row.querySelector('output'),
  }));

  function update() {
    let a = 0, c = 0, totalWeight = 0;
    for (const factor of factors) {
      const weight = factor.weight.valueAsNumber;
      factor.display.value = String(weight);
      a += factor.a * weight;
      c += factor.c * weight;
      totalWeight += weight;
    }
    if (!totalWeight) {
      result.value = '请至少给一个因子设置大于零的权重。';
      return;
    }
    const scores = 'A ' + (a / totalWeight).toFixed(1) + ' 分，C ' + (c / totalWeight).toFixed(1) + ' 分。';
    const decision = a === c ? '两个集群并列。' : '优先选择 ' + (a > c ? 'A' : 'C') + '。';
    result.value = scores + decision;
  }

  form.addEventListener('input', update);
  form.addEventListener('reset', () => requestAnimationFrame(update));
  update();
})();

