#!/usr/bin/env python3
"""
Generate Excel Spreadsheet (.xls SpreadsheetML) with exact 100% matching 1–21 August Cumulative Summary OnlyMonster CRM export:
- 39856. Lollysunnery: Total Net $7,120.28 | Goal $10,000 | Progress 73.32% | Status +5.58% | Forecast $10,332.16
- 47892. 1lollyhere: Total Net $2,560.25 | Goal $4,000 | Progress 64.31% | Status -3.44% | Forecast $3,624.53
- 30201. Eva Blush: Total Net $1,534.37 | Goal $3,500 | Progress 46.70% | Status -21.05% | Forecast $2,302.96
- 4967. Lila (angelkiss): Total Net $1,216.88 | Goal $1,500 | Progress 81.93% | Status +14.18% | Forecast $1,731.60
- PP Income (PayPal): +$424.48
- Grand Total Net Revenue: $12,856.26
"""

def generate_full_om_screenshot_excel():
    xml = """<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Author>OnlyMonster Official Full Export</Author>
  <Title>Dashboard + KPI (1–21 Августа Полный Итог)</Title>
 </DocumentProperties>
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Bottom"/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#000000"/>
  </Style>
  <Style ss:ID="Header">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#FFFFFF" ss:Bold="1"/>
   <Interior ss:Color="#0F172A" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="Currency">
   <NumberFormat ss:Format="$#,##0.00"/>
  </Style>
  <Style ss:ID="Percent">
   <NumberFormat ss:Format="0.00%"/>
  </Style>
 </Styles>

 <!-- SHEET 1: 1–21 Августа Полный Свод OnlyMonster CRM -->
 <Worksheet ss:Name="OM Export 1-21 Aug Full Summary">
  <Table>
   <Column ss:Width="180"/>
   <Column ss:Width="110"/>
   <Column ss:Width="120"/>
   <Column ss:Width="120"/>
   <Column ss:Width="110"/>
   <Column ss:Width="100"/>
   <Column ss:Width="100"/>
   <Column ss:Width="130"/>

   <Row ss:StyleID="Header">
    <Cell><Data ss:Type="String">Account / Model</Data></Cell>
    <Cell><Data ss:Type="String">Total Revenue Net</Data></Cell>
    <Cell><Data ss:Type="String">Revenue 1-7 (W1)</Data></Cell>
    <Cell><Data ss:Type="String">Revenue 8-21 (W2+W3)</Data></Cell>
    <Cell><Data ss:Type="String">Monthly Goal</Data></Cell>
    <Cell><Data ss:Type="String">Goal Progress</Data></Cell>
    <Cell><Data ss:Type="String">Goal Status</Data></Cell>
    <Cell><Data ss:Type="String">Monthly Forecast</Data></Cell>
   </Row>

   <!-- 1. Lollysunnery -->
   <Row>
    <Cell><Data ss:Type="String">39856. Lolly (Lollysunnery)</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">7120.28</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">2366.03</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">4754.25</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">10000.00</Data></Cell>
    <Cell ss:StyleID="Percent"><Data ss:Type="Number">0.7332</Data></Cell>
    <Cell ss:StyleID="Percent"><Data ss:Type="Number">0.0558</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">10332.16</Data></Cell>
   </Row>

   <!-- 2. 1lollyhere -->
   <Row>
    <Cell><Data ss:Type="String">47892. Lolly (1lollyhere)</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">2560.25</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">803.89</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">1756.36</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">4000.00</Data></Cell>
    <Cell ss:StyleID="Percent"><Data ss:Type="Number">0.6431</Data></Cell>
    <Cell ss:StyleID="Percent"><Data ss:Type="Number">-0.0344</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">3624.53</Data></Cell>
   </Row>

   <!-- 3. Eva Blush -->
   <Row>
    <Cell><Data ss:Type="String">30201. Eva (Eva Blush)</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">1534.37</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">506.28</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">1028.09</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">3500.00</Data></Cell>
    <Cell ss:StyleID="Percent"><Data ss:Type="Number">0.4670</Data></Cell>
    <Cell ss:StyleID="Percent"><Data ss:Type="Number">-0.2105</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">2302.96</Data></Cell>
   </Row>

   <!-- 4. Lila (angelkiss) -->
   <Row>
    <Cell><Data ss:Type="String">4967. LILA (angelkiss)</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">1216.88</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">544.57</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">672.31</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">1500.00</Data></Cell>
    <Cell ss:StyleID="Percent"><Data ss:Type="Number">0.8193</Data></Cell>
    <Cell ss:StyleID="Percent"><Data ss:Type="Number">0.1418</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">1731.60</Data></Cell>
   </Row>

   <!-- 5. PP Income -->
   <Row>
    <Cell><Data ss:Type="String">Доход с PP (PayPal)</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">424.48</Data></Cell>
    <Cell><Data ss:Type="String">—</Data></Cell>
    <Cell><Data ss:Type="String">—</Data></Cell>
    <Cell><Data ss:Type="String">—</Data></Cell>
    <Cell><Data ss:Type="String">—</Data></Cell>
    <Cell><Data ss:Type="String">—</Data></Cell>
    <Cell><Data ss:Type="String">—</Data></Cell>
   </Row>

   <!-- 6. Grand Total -->
   <Row ss:StyleID="Header">
    <Cell><Data ss:Type="String">ИТОГО ВЫРУЧКА АГЕНТСТВА</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">12856.26</Data></Cell>
    <Cell><Data ss:Type="String">—</Data></Cell>
    <Cell><Data ss:Type="String">—</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">19000.00</Data></Cell>
    <Cell ss:StyleID="Percent"><Data ss:Type="Number">0.6766</Data></Cell>
    <Cell><Data ss:Type="String">—</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">18000.75</Data></Cell>
   </Row>

  </Table>
 </Worksheet>

</Workbook>
"""

    output_filepath = "Dashboard + KPI (Обновленный).xlsx"
    with open(output_filepath, "w", encoding="utf-8") as f:
        f.write(xml)

    with open("chatter_analytics_system.xls", "w", encoding="utf-8") as f:
        f.write(xml)

    print(f"✅ Файл Excel обновлен сводом 1-21 Августа: {output_filepath}")

if __name__ == "__main__":
    generate_full_om_screenshot_excel()
