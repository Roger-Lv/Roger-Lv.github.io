(() => {
  const demo = document.getElementById('sky-zone-demo');
  const workers = demo.querySelector('#sky-zone-workers');
  const demand = demo.querySelector('#sky-zone-demand');
  const choice = demo.querySelector('#sky-zone-choice');
  const combinations = Array.from(demo.querySelectorAll('tbody tr'), ({ cells }) => ({
    name: cells[0].textContent,
    capacity: Number(cells[1].textContent),
    zoneCount: Number(cells[2].textContent),
    affinity: Number(cells[3].textContent),
    status: cells[4],
  }));

  function update() {
    const workerCount = workers.valueAsNumber;
    const required = workerCount * 8;
    const feasible = combinations.filter(({ capacity }) => capacity >= required);
    const minZones = Math.min(...feasible.map(({ zoneCount }) => zoneCount));
    const smallest = feasible.filter(({ zoneCount }) => zoneCount === minZones);
    const maxAffinity = Math.max(...smallest.map(({ affinity }) => affinity));
    const leaders = smallest.filter(({ affinity }) => affinity === maxAffinity);

    demand.textContent = workerCount + ' 个 Worker × 8 GPU = ' + required + ' GPU';
    choice.textContent = leaders.length
      ? '最少需要 ' + minZones + ' 个域。亲和计数最高的组合为 ' + leaders.map(({ name }) => name).join('、') + '。'
      : '所有域合计也无法覆盖当前需求。';

    for (const combination of combinations) {
      if (combination.capacity < required) {
        combination.status.textContent = '容量不足';
      } else if (combination.zoneCount > minZones) {
        combination.status.textContent = '满足需求，使用更多域';
      } else {
        combination.status.textContent = combination.affinity === maxAffinity
          ? '最少域 · 亲和领先'
          : '最少域';
      }
    }
  }

  workers.addEventListener('input', update);
  update();
})();
