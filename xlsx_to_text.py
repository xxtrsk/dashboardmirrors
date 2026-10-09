#!/usr/bin/env python3
"""
xlsx_to_text.py
A zero-dependency Python tool to convert Excel (.xlsx) spreadsheets to clean text tables:
- Markdown table (| Col 1 | Col 2 |) with auto-aligned columns
- TSV (Tab-separated values, perfect for pasting into Google Sheets / Excel)
- ASCII / Box plain text table
- CSV (Comma-separated values)

Works with pure Python standard library (no pip install needed!) and automatically
copies the result to macOS clipboard if requested (-c or --copy).
"""

import sys
import os
import re
import zipfile
import argparse
import subprocess
import xml.etree.ElementTree as ET

def col_to_idx(col_str):
    idx = 0
    for char in col_str:
        idx = idx * 26 + (ord(char.upper()) - ord('A') + 1)
    return idx - 1

def parse_cell_ref(ref):
    m = re.match(r'([A-Za-z]+)([0-9]+)', ref)
    if not m:
        return 0, 0
    col_str, row_str = m.groups()
    return col_to_idx(col_str), int(row_str) - 1

def read_shared_strings(zf):
    strings = []
    if 'xl/sharedStrings.xml' not in zf.namelist():
        return strings
    
    xml_data = zf.read('xl/sharedStrings.xml')
    root = ET.fromstring(xml_data)
    # namespace strip
    ns = '{http://schemas.openxmlformats.org/spreadsheetml/2006/main}'
    
    for si in root.findall(f'.//{ns}si'):
        # Can have simple <t> or rich text <r><t>
        text_parts = []
        for t in si.iter(f'{ns}t'):
            if t.text:
                text_parts.append(t.text)
        strings.append(''.join(text_parts))
    return strings

def get_workbook_sheets(zf):
    sheets = []
    if 'xl/workbook.xml' not in zf.namelist():
        return sheets

    wb_xml = zf.read('xl/workbook.xml')
    wb_root = ET.fromstring(wb_xml)
    ns = '{http://schemas.openxmlformats.org/spreadsheetml/2006/main}'
    r_ns = '{http://schemas.openxmlformats.org/officeDocument/2006/relationships}'

    rels_map = {}
    if 'xl/_rels/workbook.xml.rels' in zf.namelist():
        rels_xml = zf.read('xl/_rels/workbook.xml.rels')
        rels_root = ET.fromstring(rels_xml)
        for rel in rels_root:
            r_id = rel.attrib.get('Id')
            target = rel.attrib.get('Target')
            if r_id and target:
                if not target.startswith('xl/'):
                    target = 'xl/' + target.lstrip('/')
                rels_map[r_id] = target

    for sheet in wb_root.findall(f'.//{ns}sheet'):
        name = sheet.attrib.get('name')
        r_id = sheet.attrib.get(f'{r_ns}id')
        file_path = rels_map.get(r_id)
        if not file_path:
            # Fallback to sheet order
            idx = len(sheets) + 1
            file_path = f'xl/worksheets/sheet{idx}.xml'
        sheets.append({'name': name, 'path': file_path})

    return sheets

def parse_worksheet(zf, sheet_path, shared_strings):
    if sheet_path not in zf.namelist():
        return []

    xml_data = zf.read(sheet_path)
    root = ET.fromstring(xml_data)
    ns = '{http://schemas.openxmlformats.org/spreadsheetml/2006/main}'

    grid = {}
    max_row = 0
    max_col = 0

    for row in root.findall(f'.//{ns}row'):
        row_num_str = row.attrib.get('r')
        default_row_idx = int(row_num_str) - 1 if row_num_str else 0
        
        col_cursor = 0
        for c in row.findall(f'{ns}c'):
            cell_ref = c.attrib.get('r')
            if cell_ref:
                col_idx, row_idx = parse_cell_ref(cell_ref)
            else:
                col_idx = col_cursor
                row_idx = default_row_idx

            col_cursor = col_idx + 1
            cell_type = c.attrib.get('t', '')
            val_el = c.find(f'{ns}v')
            raw_val = val_el.text if val_el is not None and val_el.text is not None else ''

            val = ''
            if cell_type == 's':  # shared string
                try:
                    str_idx = int(raw_val)
                    if 0 <= str_idx < len(shared_strings):
                        val = shared_strings[str_idx]
                except ValueError:
                    val = raw_val
            elif cell_type == 'inlineStr':
                is_el = c.find(f'{ns}is')
                if is_el is not None:
                    t_el = is_el.find(f'{ns}t')
                    val = t_el.text if t_el is not None and t_el.text is not None else ''
            elif cell_type == 'b':  # boolean
                val = 'TRUE' if raw_val == '1' else 'FALSE'
            else:
                val = raw_val

            val_str = str(val).strip()
            # If float ends with .0, format as integer
            if val_str.endswith('.0') and val_str[:-2].isdigit():
                val_str = val_str[:-2]

            if val_str:
                grid[(row_idx, col_idx)] = val_str
                if row_idx > max_row: max_row = row_idx
                if col_idx > max_col: max_col = col_idx

    if not grid:
        return []

    # Build dense 2D list
    dense = []
    for r in range(max_row + 1):
        row_vals = []
        for c in range(max_col + 1):
            row_vals.append(grid.get((r, c), ''))
        dense.append(row_vals)

    # Trim empty rows
    non_empty_rows = [r for r in dense if any(cell != '' for cell in r)]
    if not non_empty_rows:
        return []

    # Trim empty columns
    col_has_data = [False] * (max_col + 1)
    for r in non_empty_rows:
        for c_idx, cell in enumerate(r):
            if cell != '':
                col_has_data[c_idx] = True

    try:
        first_col = col_has_data.index(True)
        last_col = len(col_has_data) - 1 - col_has_data[::-1].index(True)
    except ValueError:
        return []

    trimmed = []
    for r in non_empty_rows:
        trimmed.append(r[first_col : last_col + 1])

    return trimmed

def format_markdown(rows):
    if not rows: return ''
    max_cols = max(len(r) for r in rows)
    normalized = [r + [''] * (max_cols - len(r)) for r in rows]
    # Escape pipes
    normalized = [[c.replace('|', '\\|') for c in r] for r in normalized]

    col_widths = [3] * max_cols
    for r in normalized:
        for i, c in enumerate(r):
            col_widths[i] = max(col_widths[i], len(c))

    header = normalized[0]
    header_line = '| ' + ' | '.join(c.ljust(col_widths[i]) for i, c in enumerate(header)) + ' |'
    sep_line = '| ' + ' | '.join('-' * col_widths[i] for i in range(max_cols)) + ' |'
    body_lines = ['| ' + ' | '.join(c.ljust(col_widths[i]) for i, c in enumerate(r)) + ' |' for r in normalized[1:]]

    return '\n'.join([header_line, sep_line] + body_lines)

def format_tsv(rows):
    if not rows: return ''
    return '\n'.join('\t'.join(c.replace('\t', ' ') for c in r) for r in rows)

def format_csv(rows):
    if not rows: return ''
    lines = []
    for r in rows:
        escaped_cells = []
        for c in r:
            if any(char in c for char in [',', '"', '\n']):
                escaped_cells.append('"' + c.replace('"', '""') + '"')
            else:
                escaped_cells.append(c)
        lines.append(','.join(escaped_cells))
    return '\n'.join(lines)

def format_ascii(rows):
    if not rows: return ''
    max_cols = max(len(r) for r in rows)
    normalized = [r + [''] * (max_cols - len(r)) for r in rows]

    col_widths = [1] * max_cols
    for r in normalized:
        for i, c in enumerate(r):
            col_widths[i] = max(col_widths[i], len(c))

    border = '+' + '+'.join('-' * (w + 2) for w in col_widths) + '+'
    lines = [border]

    for idx, r in enumerate(normalized):
        row_str = '| ' + ' | '.join(c.ljust(col_widths[i]) for i, c in enumerate(r)) + ' |'
        lines.append(row_str)
        if idx == 0:
            lines.append('+' + '+'.join('=' * (w + 2) for w in col_widths) + '+')

    lines.append(border)
    return '\n'.join(lines)

def copy_to_macos_clipboard(text):
    try:
        proc = subprocess.Popen(['pbcopy'], stdin=subprocess.PIPE)
        proc.communicate(input=text.encode('utf-8'))
        return True
    except Exception:
        return False

def convert_xlsx(file_path, fmt='markdown', sheet_filter=None, all_sheets=False):
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Файл '{file_path}' не найден.")

    with zipfile.ZipFile(file_path, 'r') as zf:
        shared_strings = read_shared_strings(zf)
        sheets = get_workbook_sheets(zf)

        if not sheets:
            raise ValueError("В книге Excel не найдено ни одного листа.")

        results = []

        for idx, s in enumerate(sheets):
            s_name = s['name']
            if sheet_filter:
                if sheet_filter.isdigit() and int(sheet_filter) == idx + 1:
                    pass
                elif s_name.lower() != sheet_filter.lower():
                    continue

            rows = parse_worksheet(zf, s['path'], shared_strings)
            if not rows:
                continue

            if fmt == 'markdown':
                table_text = format_markdown(rows)
            elif fmt == 'tsv':
                table_text = format_tsv(rows)
            elif fmt == 'ascii':
                table_text = format_ascii(rows)
            elif fmt == 'csv':
                table_text = format_csv(rows)
            else:
                table_text = format_markdown(rows)

            if all_sheets or (not sheet_filter and len(sheets) > 1):
                results.append(f"### Лист: {s_name}\n\n{table_text}")
            else:
                results.append(table_text)

            if not all_sheets and sheet_filter:
                break

        return '\n\n'.join(results)

def main():
    parser = argparse.ArgumentParser(
        description="Конвертер Excel (.xlsx) файлов в таблицы текста (Markdown, TSV, ASCII, CSV)."
    )
    parser.add_argument("file", help="Путь к файлу .xlsx")
    parser.add_argument("-f", "--format", choices=['markdown', 'tsv', 'ascii', 'csv'], default='markdown',
                        help="Формат вывода таблицы (по умолчанию: markdown)")
    parser.add_argument("-s", "--sheet", help="Имя или номер листа для конвертации (по умолчанию: первый лист или все)")
    parser.add_argument("-a", "--all", action="store_true", help="Конвертировать все листы книги")
    parser.add_argument("-o", "--output", help="Сохранить результат в текстовый файл")
    parser.add_argument("-c", "--copy", action="store_true", help="Скопировать результат в буфер обмена (macOS pbcopy)")

    args = parser.parse_args()

    try:
        converted = convert_xlsx(args.file, fmt=args.format, sheet_filter=args.sheet, all_sheets=args.all)
        if not converted:
            print("Предупреждение: Лист пуст или данные не найдены.", file=sys.stderr)
            return

        if args.output:
            with open(args.output, 'w', encoding='utf-8') as f:
                f.write(converted)
            print(f"✅ Таблица успешно сохранена в '{args.output}'")

        if args.copy:
            if copy_to_macos_clipboard(converted):
                print("📋 Результат скопирован в буфер обмена!")
            else:
                print("⚠️ Не удалось скопировать в буфер обмена автоматически.", file=sys.stderr)

        if not args.output and not args.copy:
            print(converted)

    except Exception as e:
        print(f"Ошибка: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
