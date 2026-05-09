(function () {
  const fuelCarData = [
    {
      bienSo: '88C-174.88', fuel: [{
        date: '07/11/2025', info: [
          { hour: '06:00:00', liters: 240 }, { hour: '06:00:30', liters: 239 },
          { hour: '06:01:15', liters: 238 }, { hour: '06:02:40', liters: 236 },
          { hour: '06:03:05', liters: 233 }, { hour: '06:04:50', liters: 230 },
          { hour: '06:05:30', liters: 228 }
        ]
      }]
    },
    {
      bienSo: '29A-123.45', fuel: [
        {
          date: '07/11/2025', info: [
            { hour: '08:00:00', liters: 320 }, { hour: '08:02:00', liters: 315 },
            { hour: '08:05:00', liters: 310 }, { hour: '08:10:00', liters: 300 },
            { hour: '08:15:00', liters: 480 }
          ]
        },
        {
          date: '07/11/2025', info: [
            { hour: '08:00:00', liters: 320 }, { hour: '08:02:00', liters: 315 }
          ]
        }
      ]
    },
    {
      bienSo: '36C-124.88', fuel: [{
        date: '07/11/2025', info: [
          { hour: '06:40:00', liters: 240 }, { hour: '06:40:30', liters: 239 },
          { hour: '06:41:15', liters: 238 }, { hour: '06:42:40', liters: 236 },
          { hour: '06:43:05', liters: 233 }, { hour: '06:44:50', liters: 230 },
          { hour: '06:45:30', liters: 228 }
        ]
      }]
    }
  ];

  // ========== STATE ==========
  let canvas, ctx, lastPointPos, isActive = false;
  const maxLiters = 500;
  const yTicks = Array.from({ length: maxLiters / 20 + 1 }, (_, i) => i * 20);

  const getResponsive = () => {
    const w = window.innerWidth;
    return w <= 480 ? 'mobile' : w <= 768 ? 'tablet' : 'desktop';
  };

  const responsiveConfig = {
    mobile: {
      padding: { top: 15, right: 10, bottom: 35, left: 45 },
      point: { radius: 5, inner: 3.5 }, lineWidth: 3,
      fonts: { msg: '12px', y: '11px', x: '10px', tip: '12px', tipSmall: '10px', tipMain: '13px' },
      offsets: { yLabel: 12, xLabel: 18, xInt: 6, click: 12, hover: 12, hoverPt: 6.5, hoverPtInner: 5, tipMainY: 14, tipSecY: 30 },
      tooltip: { padding: 16, height: 44 }, minSize: { width: 300, height: 250 }
    },
    tablet: {
      padding: { top: 18, right: 5, bottom: 38, left: 55 },
      point: { radius: 6, inner: 4.5 }, lineWidth: 3.5,
      fonts: { msg: '14px', y: '12px', x: '11px', tip: '13px', tipSmall: '11px', tipMain: '14px' },
      offsets: { yLabel: 13, xLabel: 19, xInt: 5, click: 13, hover: 13, hoverPt: 7.5, hoverPtInner: 6, tipMainY: 16, tipSecY: 34 },
      tooltip: { padding: 20, height: 49 }, minSize: { width: 300, height: 300 }
    },
    desktop: {
      padding: { top: 20, right: 0, bottom: 40, left: 60 },
      point: { radius: 7, inner: 5 }, lineWidth: 4,
      fonts: { msg: '16px', y: '13px', x: '12px', tip: '14px', tipSmall: '12px', tipMain: '16px' },
      offsets: { yLabel: 15, xLabel: 20, xInt: 5, click: 15, hover: 15, hoverPt: 9, hoverPtInner: 7, tipMainY: 18, tipSecY: 38 },
      tooltip: { padding: 24, height: 54 }, minSize: { width: 300, height: 400 }
    }
  };

  const cfg = () => responsiveConfig[getResponsive()];

  // ========== UTILITIES ==========
  const parseTime = (t) => {
    const [h, m, s = 0] = t.split(':').map(Number);
    return h * 3600 + m * 60 + s;
  };

  const genTimeTicks = (start, mins = 30) => {
    const [h, m] = start.split(':').map(Number);
    return Array.from({ length: mins }, (_, i) => {
      const total = h * 60 + m + i;
      return `${Math.floor(total / 60) % 24}`.padStart(2, '0') + ':' + `${total % 60}`.padStart(2, '0');
    });
  };

  const formatDate = (d) => d.split('-').reverse().join('/');

  const findCar = (plate, date) => {
    const car = fuelCarData.find(c => c.bienSo === plate);
    if (!car) return null;
    const day = car.fuel.find(f => f.date === formatDate(date));
    return day ? { car, fuelDay: day } : null;
  };

  const $ = (id) => document.getElementById(id);

  // ========== CANVAS SIZING ==========
  const resizeCanvas = () => {
    if (!canvas?.parentElement) return;

    const config = cfg();
    const container = canvas.parentElement;
    const padding = config.padding.top + config.padding.bottom;

    canvas.width = Math.max(config.minSize.width, container.offsetWidth - padding);

    const navbar = $('sp-header');
    const chartHeader = document.querySelector('.oil-chart-header');
    const oilScreen = document.querySelector('.oil-chart-screen');
    const oilContainer = container.closest('.oil-chart-container');

    const navHeight = navbar?.offsetHeight || 65;
    const headerHeight = chartHeader?.offsetHeight || 0;
    const screenPad = oilScreen ?
      parseInt(getComputedStyle(oilScreen).paddingTop) + parseInt(getComputedStyle(oilScreen).paddingBottom) : padding;
    const containerPad = oilContainer ?
      parseInt(getComputedStyle(oilContainer).paddingTop) + parseInt(getComputedStyle(oilContainer).paddingBottom) : padding;

    const availHeight = window.innerHeight - navHeight - screenPad - headerHeight - containerPad - 10;
    canvas.height = Math.max(config.minSize.height, availHeight);

    if ($('licensePlate')?.value && $('date')?.value) drawChart();
  };

  // ========== CHART DRAWING ==========
  const drawMsg = (msg) => {
    const config = cfg();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#9a3412';
    ctx.font = `bold ${config.fonts.msg} sans-serif`;
    ctx.textAlign = 'center';

    if (getResponsive() !== 'desktop') {
      const lines = msg.split(' '), mid = Math.ceil(lines.length / 2);
      ctx.fillText(lines.slice(0, mid).join(' '), canvas.width / 2, canvas.height / 2 - 10);
      ctx.fillText(lines.slice(mid).join(' '), canvas.width / 2, canvas.height / 2 + 10);
    } else {
      ctx.fillText(msg, canvas.width / 2, canvas.height / 2);
    }
  };

  const drawChart = () => {
    canvas = canvas || $('fuelChart');
    ctx = ctx || canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const plate = $('licensePlate')?.value.trim();
    const date = $('date')?.value;

    if (!plate || !date) return drawMsg('Vui lòng nhập đầy đủ biển số xe và ngày');

    const data = findCar(plate, date);
    if (!data) return drawMsg('Không tìm thấy dữ liệu cho biển số và ngày này');

    const fuelData = data.fuelDay.info.map(d => ({ time: d.hour, liters: d.liters }));
    const startTime = fuelData[0].time.split(':').slice(0, 2).join(':');
    const timeTicks = genTimeTicks(startTime, 30);

    const config = cfg();
    const p = config.padding;
    const w = canvas.width - p.left - p.right;
    const h = canvas.height - p.top - p.bottom;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Grid
    ctx.strokeStyle = '#fed7aa';
    ctx.lineWidth = 1;
    yTicks.forEach(v => {
      const y = p.top + h - (v / maxLiters) * h;
      ctx.beginPath();
      ctx.moveTo(p.left, y);
      ctx.lineTo(p.left + w, y);
      ctx.stroke();
    });

    timeTicks.forEach((t, i) => {
      const x = p.left + (i / (timeTicks.length - 1)) * w;
      ctx.beginPath();
      ctx.moveTo(x, p.top);
      ctx.lineTo(x, p.top + h);
      ctx.stroke();
    });

    // Axes
    ctx.strokeStyle = '#fb923c';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(p.left, p.top);
    ctx.lineTo(p.left, p.top + h);
    ctx.lineTo(p.left + w, p.top + h);
    ctx.stroke();

    // Y labels
    ctx.fillStyle = '#9a3412';
    ctx.font = `bold ${config.fonts.y} sans-serif`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    yTicks.forEach(v => {
      const y = p.top + h - (v / maxLiters) * h;
      ctx.fillText(v + ' L', p.left - config.offsets.yLabel, y);
    });

    // X labels
    ctx.font = `bold ${config.fonts.x} sans-serif`;
    ctx.textAlign = 'center';
    timeTicks.forEach((t, i) => {
      if (i % config.offsets.xInt === 0) {
        const x = p.left + (i / (timeTicks.length - 1)) * w;
        ctx.save();
        ctx.translate(x, p.top + h + config.offsets.xLabel);
        ctx.rotate(-Math.PI / 4);
        ctx.fillText(t, 0, 0);
        ctx.restore();
      }
    });

    // Line
    const startSec = parseTime(fuelData[0].time);
    const endSec = startSec + 30 * 60;
    const range = endSec - startSec;

    const grad = ctx.createLinearGradient(p.left, 0, p.left + w, 0);
    grad.addColorStop(0, '#ea580c');
    grad.addColorStop(0.5, '#fb923c');
    grad.addColorStop(1, '#f97316');

    ctx.strokeStyle = grad;
    ctx.lineWidth = config.lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = 'rgba(234, 88, 12, 0.3)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 2;

    ctx.beginPath();
    fuelData.forEach((pt, i) => {
      const ratio = (parseTime(pt.time) - startSec) / range;
      if (ratio < 0 || ratio > 1) return;
      const x = p.left + ratio * w;
      const y = p.top + h - (pt.liters / maxLiters) * h;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Last point
    const last = fuelData[fuelData.length - 1];
    const ratio = (parseTime(last.time) - startSec) / range;

    if (ratio >= 0 && ratio <= 1) {
      const x = p.left + ratio * w;
      const y = p.top + h - (last.liters / maxLiters) * h;

      ctx.beginPath();
      ctx.arc(x, y, config.point.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x, y, config.point.inner, 0, Math.PI * 2);
      ctx.fillStyle = '#ea580c';
      ctx.fill();

      lastPointPos = { x, y, data: last };
    }

    // Fill area
    ctx.globalAlpha = 0.2;
    const areaGrad = ctx.createLinearGradient(0, p.top, 0, p.top + h);
    areaGrad.addColorStop(0, '#ea580c');
    areaGrad.addColorStop(1, 'rgba(234, 88, 12, 0)');

    ctx.fillStyle = areaGrad;
    ctx.beginPath();
    fuelData.forEach((pt, i) => {
      const ratio = (parseTime(pt.time) - startSec) / range;
      if (ratio < 0 || ratio > 1) return;
      const x = p.left + ratio * w;
      const y = p.top + h - (pt.liters / maxLiters) * h;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });

    const lastRatio = (parseTime(fuelData[fuelData.length - 1].time) - startSec) / range;
    ctx.lineTo(p.left + lastRatio * w, p.top + h);
    ctx.lineTo(p.left, p.top + h);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
  };

  // ========== CANVAS EVENTS ==========
  const setupEvents = () => {
    if (!canvas) return;

    canvas.onclick = (e) => {
      if (!lastPointPos) return;
      const rect = canvas.getBoundingClientRect();
      const dx = e.clientX - rect.left - lastPointPos.x;
      const dy = e.clientY - rect.top - lastPointPos.y;
      if (Math.sqrt(dx * dx + dy * dy) < cfg().offsets.click) {
        isActive = !isActive;
        drawChart();
      }
    };

    canvas.onmousemove = (e) => {
      if (!lastPointPos || !ctx) return;

      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const dist = Math.sqrt((mx - lastPointPos.x) ** 2 + (my - lastPointPos.y) ** 2);

      drawChart();

      const config = cfg();
      if (dist < config.offsets.hover || isActive) {
        canvas.style.cursor = 'pointer';

        // Hover point
        ctx.beginPath();
        ctx.arc(lastPointPos.x, lastPointPos.y, config.offsets.hoverPt, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(lastPointPos.x, lastPointPos.y, config.offsets.hoverPtInner, 0, Math.PI * 2);
        ctx.fillStyle = '#ea580c';
        ctx.fill();

        // Tooltip
        ctx.font = `bold ${config.fonts.tip} sans-serif`;
        const tipText = `${lastPointPos.data.liters} L`;
        const timeText = lastPointPos.data.time;
        const tipWidth = Math.max(ctx.measureText(tipText).width, ctx.measureText(timeText).width) + config.tooltip.padding;

        let tipX = lastPointPos.x - tipWidth / 2;
        let tipY = lastPointPos.y - config.tooltip.height - 15;

        tipX = Math.max(10, Math.min(canvas.width - tipWidth - 10, tipX));
        if (tipY < 10) tipY = lastPointPos.y + 20;

        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetY = 4;

        const tipGrad = ctx.createLinearGradient(tipX, tipY, tipX, tipY + config.tooltip.height);
        tipGrad.addColorStop(0, '#ea580c');
        tipGrad.addColorStop(1, '#fb923c');

        ctx.fillStyle = tipGrad;
        ctx.beginPath();
        ctx.roundRect(tipX, tipY, tipWidth, config.tooltip.height, 12);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;

        // Triangle
        const triX = lastPointPos.x;
        const triY = tipY < lastPointPos.y ? tipY + config.tooltip.height : tipY;
        const dir = tipY < lastPointPos.y ? 1 : -1;

        ctx.fillStyle = dir === 1 ? '#fb923c' : '#ea580c';
        ctx.beginPath();
        ctx.moveTo(triX, triY + 8 * dir);
        ctx.lineTo(triX - 6, triY);
        ctx.lineTo(triX + 6, triY);
        ctx.closePath();
        ctx.fill();

        // Text
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `bold ${config.fonts.tipMain} sans-serif`;
        ctx.fillText(tipText, tipX + tipWidth / 2, tipY + config.offsets.tipMainY);
        ctx.font = `${config.fonts.tipSmall} sans-serif`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillText(timeText, tipX + tipWidth / 2, tipY + config.offsets.tipSecY);
      } else {
        canvas.style.cursor = 'default';
      }
    };
  };

  // ========== SUGGESTIONS ==========
  const showSuggestions = (query) => {
    const list = $('suggestionList');
    if (!list) return;

    list.innerHTML = '';
    if (!query.trim()) return list.style.display = 'none';

    const matches = fuelCarData.filter(c => c.bienSo.toLowerCase().includes(query.toLowerCase()));
    if (!matches.length) return list.style.display = 'none';

    matches.forEach(car => {
      const lastFuel = car.fuel.reduce((latest, f) => {
        const d = f.date.split('/').reverse().join('-');
        return !latest || new Date(d) > new Date(latest.date.split('/').reverse().join('-')) ? f : latest;
      }, null);

      const li = document.createElement('li');
      li.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center">
        <span style="font-weight:600;color:#1e293b">${car.bienSo}</span>
        <small style="color:#64748b;font-size:12px">${lastFuel?.date || 'Không có dữ liệu'}</small>
      </div>`;

      li.onclick = () => {
        $('licensePlate').value = car.bienSo;
        list.style.display = 'none';

        const dateInput = $('date');
        if (!dateInput.value && lastFuel) {
          const [d, m, y] = lastFuel.date.split('/');
          dateInput.value = `${y}-${m}-${d}`;
        }

        setTimeout(handleSearch, 10);
      };

      list.appendChild(li);
    });

    list.style.display = 'block';
  };

  const handleSearch = () => {
    const plate = $('licensePlate')?.value.trim();
    const dateInput = $('date');
    const date = dateInput?.value;

    if (plate && date) {
      const car = fuelCarData.find(c => c.bienSo === plate);
      if (car) {
        const day = car.fuel.find(f => f.date === formatDate(date));
        if (!day) {
          const lastFuel = car.fuel.reduce((latest, f) => {
            const d = f.date.split('/').reverse().join('-');
            return !latest || new Date(d) > new Date(latest.date.split('/').reverse().join('-')) ? f : latest;
          }, null);

          if (lastFuel) {
            const [d, m, y] = lastFuel.date.split('/');
            dateInput.value = `${y}-${m}-${d}`;
          }
        }
      }
    }

    setTimeout(resizeCanvas, 50);
  };

  // ========== INIT ==========
  const init = () => {
    canvas = $('fuelChart');
    ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const today = new Date();
    const dateInput = $('date');
    if (dateInput && !dateInput.value) {
      dateInput.value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    }

    document.addEventListener('click', (e) => {
      const list = $('suggestionList');
      const input = $('licensePlate');
      if (list && input && !list.contains(e.target) && e.target !== input) {
        list.style.display = 'none';
      }
    });

    setupEvents();
    setTimeout(() => { resizeCanvas(); drawChart(); }, 150);
  };

  // ========== EVENT LISTENERS ==========
  window.addEventListener('load', init);
  window.addEventListener('pageLoaded', (e) => e.detail?.page === 'oilChart' && setTimeout(init, 100));
  window.addEventListener('DOMContentLoaded', () => {
    const el = $('fuelChart');
    if (el && !el.width) setTimeout(init, 100);
  });
  window.addEventListener('resize', resizeCanvas);

  const licenseInput = $('licensePlate');
  if (licenseInput) {
    licenseInput.oninput = function () { showSuggestions(this.value.trim()); };
    licenseInput.onkeydown = function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        $('suggestionList').style.display = 'none';
        handleSearch();
      }
    };
    licenseInput.onchange = drawChart;
  }

  const dateInput = $('date');
  if (dateInput) dateInput.onchange = () => setTimeout(resizeCanvas, 50);
})();