// Excel (XLSX) to Text Tables Converter Engine
// Works seamlessly client-side using SheetJS (xlsx.full.min.js)

export function setupExcelConverter(prefix = '') {
  const getEl = (id) => document.getElementById(prefix ? `${prefix}-${id}` : id);

  const dropzone = getEl('dropzone');
  const fileInput = getEl('file-input');
  const fileInfo = getEl('file-info');
  const controlsBar = getEl('controls-bar');
  const sheetTabs = getEl('sheet-tabs');
  const outputWrapper = getEl('output-wrapper');
  const outputText = getEl('output-text');
  const previewWrapper = getEl('preview-wrapper');
  const previewTable = getEl('preview-table');
  const btnCopy = getEl('btn-copy');
  const btnDownload = getEl('btn-download');
  const toast = getEl('toast') || document.getElementById('toast');
  const chkTrimEmpty = getEl('chk-trim-empty');
  const chkPreserveFormat = getEl('chk-preserve-format');
  const statRows = getEl('stat-rows');
  const statCols = getEl('stat-cols');
  const statChars = getEl('stat-chars');

  if (!dropzone || !fileInput) return;

  let currentWorkbook = null;
  let currentFileName = '';
  let selectedSheetName = '';
  let activeFormat = 'markdown';

  // Drag and Drop
  ['dragenter', 'dragover'].forEach(name => {
    dropzone.addEventListener(name, (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach(name => {
    dropzone.addEventListener(name, (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
    });
  });

  dropzone.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    if (files.length > 0) processFile(files[0]);
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) processFile(e.target.files[0]);
  });

  function processFile(file) {
    currentFileName = file.name;
    if (fileInfo) {
      fileInfo.style.display = 'block';
      fileInfo.textContent = `⏳ Чтение файла: ${file.name} (${(file.size / 1024).toFixed(1)} KB)...`;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        if (typeof XLSX === 'undefined') {
          throw new Error('Библиотека XLSX еще загружается, попробуйте через пару секунд.');
        }

        const data = new Uint8Array(e.target.result);
        currentWorkbook = XLSX.read(data, { 
          type: 'array', 
          cellDates: true, 
          cellNF: true, 
          cellText: true 
        });

        if (fileInfo) {
          fileInfo.textContent = `✅ Загружено: ${file.name} | Листов: ${currentWorkbook.SheetNames.length}`;
        }
        if (controlsBar) controlsBar.style.display = 'block';
        if (outputWrapper) outputWrapper.style.display = 'block';
        if (previewWrapper) previewWrapper.style.display = 'block';

        renderSheetTabs();
        selectedSheetName = currentWorkbook.SheetNames[0] || '';
        renderActiveSheet();
      } catch (err) {
        if (fileInfo) fileInfo.textContent = `❌ Ошибка: ${err.message}`;
      }
    };
    reader.readAsArrayBuffer(file);
  }

  function renderSheetTabs() {
    if (!currentWorkbook || !sheetTabs) return;
    sheetTabs.innerHTML = '';

    currentWorkbook.SheetNames.forEach((name, idx) => {
      const pill = document.createElement('button');
      pill.className = `sheet-pill ${idx === 0 ? 'active' : ''}`;
      pill.textContent = name;
      pill.addEventListener('click', () => {
        sheetTabs.querySelectorAll('.sheet-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        selectedSheetName = name;
        renderActiveSheet();
      });
      sheetTabs.appendChild(pill);
    });

    if (currentWorkbook.SheetNames.length > 1) {
      const allPill = document.createElement('button');
      allPill.className = 'sheet-pill';
      allPill.textContent = '📑 Все листы разом';
      allPill.addEventListener('click', () => {
        sheetTabs.querySelectorAll('.sheet-pill').forEach(p => p.classList.remove('active'));
        allPill.classList.add('active');
        selectedSheetName = '__ALL__';
        renderActiveSheet();
      });
      sheetTabs.appendChild(allPill);
    }
  }

  function getSheetRows(sheet) {
    if (!sheet) return [];
    const preserveFormat = chkPreserveFormat ? chkPreserveFormat.checked : true;
    
    const rawRows = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      raw: !preserveFormat,
      dateNF: 'YYYY-MM-DD',
      defval: ''
    });

    if (chkTrimEmpty && !chkTrimEmpty.checked) return rawRows;

    const nonEmptyRows = rawRows.filter(row => 
      row && row.some(cell => cell !== '' && cell !== null && cell !== undefined)
    );

    if (nonEmptyRows.length === 0) return [];

    const maxCol = Math.max(...nonEmptyRows.map(r => r.length));
    const colHasContent = Array(maxCol).fill(false);

    nonEmptyRows.forEach(row => {
      row.forEach((cell, colIdx) => {
        if (cell !== '' && cell !== null && cell !== undefined) {
          colHasContent[colIdx] = true;
        }
      });
    });

    const firstCol = colHasContent.indexOf(true);
    const lastCol = colHasContent.lastIndexOf(true);

    if (firstCol === -1) return [];

    return nonEmptyRows.map(row => {
      const trimmed = [];
      for (let c = firstCol; c <= lastCol; c++) {
        trimmed.push(row[c] !== undefined && row[c] !== null ? String(row[c]).trim() : '');
      }
      return trimmed;
    });
  }

  function toMarkdown(rows) {
    if (!rows || rows.length === 0) return '';
    const maxCols = Math.max(...rows.map(r => r.length));
    const normalized = rows.map(r => {
      const row = [...r];
      while (row.length < maxCols) row.push('');
      return row.map(cell => String(cell || '').replace(/\|/g, '\\|'));
    });

    const colWidths = Array(maxCols).fill(3);
    normalized.forEach(r => {
      r.forEach((cell, i) => {
        if (cell.length > colWidths[i]) colWidths[i] = cell.length;
      });
    });

    const header = normalized[0];
    const headerLine = '| ' + header.map((h, i) => h.padEnd(colWidths[i], ' ')).join(' | ') + ' |';
    const sepLine = '| ' + colWidths.map(w => '-'.repeat(w)).join(' | ') + ' |';
    const bodyLines = normalized.slice(1).map(r => {
      return '| ' + r.map((cell, i) => cell.padEnd(colWidths[i], ' ')).join(' | ') + ' |';
    });

    return [headerLine, sepLine, ...bodyLines].join('\n');
  }

  function toTSV(rows) {
    return rows.map(r => r.map(c => String(c || '').replace(/\t/g, ' ')).join('\t')).join('\n');
  }

  function toCSV(rows) {
    return rows.map(r => r.map(c => {
      const str = String(c || '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    }).join(',')).join('\n');
  }

  function toASCII(rows) {
    if (!rows || rows.length === 0) return '';
    const maxCols = Math.max(...rows.map(r => r.length));
    const normalized = rows.map(r => {
      const row = [...r];
      while (row.length < maxCols) row.push('');
      return row.map(cell => String(cell || ''));
    });

    const colWidths = Array(maxCols).fill(1);
    normalized.forEach(r => {
      r.forEach((cell, i) => {
        if (cell.length > colWidths[i]) colWidths[i] = cell.length;
      });
    });

    const border = '+' + colWidths.map(w => '-'.repeat(w + 2)).join('+') + '+';
    const lines = [border];

    normalized.forEach((r, rowIdx) => {
      const line = '| ' + r.map((c, i) => c.padEnd(colWidths[i], ' ')).join(' | ') + ' |';
      lines.push(line);
      if (rowIdx === 0) {
        lines.push('+' + colWidths.map(w => '='.repeat(w + 2)).join('+') + '+');
      }
    });

    lines.push(border);
    return lines.join('\n');
  }

  function toJSON(rows) {
    if (!rows || rows.length === 0) return '[]';
    const headers = rows[0].map((h, i) => h ? String(h).trim() : `col_${i+1}`);
    const data = rows.slice(1).map(r => {
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = r[i] !== undefined ? r[i] : '';
      });
      return obj;
    });
    return JSON.stringify(data, null, 2);
  }

  function renderActiveSheet() {
    if (!currentWorkbook) return;
    let output = '';
    let previewRows = [];

    if (selectedSheetName === '__ALL__') {
      const sheetOutputs = [];
      currentWorkbook.SheetNames.forEach(sheetName => {
        const sheet = currentWorkbook.Sheets[sheetName];
        const rows = getSheetRows(sheet);
        if (rows.length > 0) {
          let formatted = '';
          if (activeFormat === 'markdown') formatted = `### Лист: ${sheetName}\n\n` + toMarkdown(rows);
          else if (activeFormat === 'tsv') formatted = `--- ${sheetName} ---\n` + toTSV(rows);
          else if (activeFormat === 'ascii') formatted = `--- ${sheetName} ---\n` + toASCII(rows);
          else if (activeFormat === 'csv') formatted = `--- ${sheetName} ---\n` + toCSV(rows);
          else if (activeFormat === 'json') formatted = `/* ${sheetName} */\n` + toJSON(rows);
          sheetOutputs.push(formatted);
        }
      });
      output = sheetOutputs.join('\n\n');
      previewRows = getSheetRows(currentWorkbook.Sheets[currentWorkbook.SheetNames[0]]);
    } else {
      const sheet = currentWorkbook.Sheets[selectedSheetName];
      const rows = getSheetRows(sheet);
      previewRows = rows;

      if (activeFormat === 'markdown') output = toMarkdown(rows);
      else if (activeFormat === 'tsv') output = toTSV(rows);
      else if (activeFormat === 'ascii') output = toASCII(rows);
      else if (activeFormat === 'csv') output = toCSV(rows);
      else if (activeFormat === 'json') output = toJSON(rows);
    }

    if (outputText) outputText.value = output;

    if (statRows) statRows.textContent = previewRows.length;
    if (statCols) statCols.textContent = previewRows.length > 0 ? previewRows[0].length : 0;
    if (statChars) statChars.textContent = output.length.toLocaleString('en-US');

    renderPreviewTable(previewRows);
  }

  function renderPreviewTable(rows) {
    if (!previewTable) return;
    if (!rows || rows.length === 0) {
      previewTable.innerHTML = '<tbody><tr><td style="text-align: center; color: var(--text-muted); padding: 30px;">Таблица пуста</td></tr></tbody>';
      return;
    }

    const headers = rows[0];
    const dataRows = rows.slice(1);

    let html = '<thead><tr>';
    headers.forEach(h => {
      html += `<th>${escapeHtml(h)}</th>`;
    });
    html += '</tr></thead><tbody>';

    const previewSlice = dataRows.slice(0, 50);
    previewSlice.forEach(r => {
      html += '<tr>';
      headers.forEach((_, colIdx) => {
        html += `<td>${escapeHtml(r[colIdx] || '')}</td>`;
      });
      html += '</tr>';
    });

    if (dataRows.length > 50) {
      html += `<tr><td colspan="${headers.length}" style="text-align: center; color: var(--text-muted); font-style: italic; padding: 12px;">... показаны первые 50 строк из ${dataRows.length} (полный текст доступен в поле выше)</td></tr>`;
    }

    html += '</tbody>';
    previewTable.innerHTML = html;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  const formatButtons = (controlsBar || document).querySelectorAll('.format-btn');
  formatButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      formatButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFormat = btn.dataset.format;
      renderActiveSheet();
    });
  });

  if (chkTrimEmpty) chkTrimEmpty.addEventListener('change', renderActiveSheet);
  if (chkPreserveFormat) chkPreserveFormat.addEventListener('change', renderActiveSheet);

  if (btnCopy && outputText) {
    btnCopy.addEventListener('click', () => {
      if (!outputText.value) return;
      navigator.clipboard.writeText(outputText.value).then(() => {
        showToast('✅ Скопировано в буфер обмена!');
      }).catch(() => {
        outputText.select();
        document.execCommand('copy');
        showToast('✅ Скопировано в буфер обмена!');
      });
    });
  }

  if (btnDownload && outputText) {
    btnDownload.addEventListener('click', () => {
      if (!outputText.value) return;
      const baseName = currentFileName ? currentFileName.replace(/\.[^/.]+$/, '') : 'excel_table';
      const ext = activeFormat === 'json' ? 'json' : (activeFormat === 'csv' ? 'csv' : 'txt');
      const blob = new Blob([outputText.value], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${baseName}_${selectedSheetName}_${activeFormat}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  }
}
