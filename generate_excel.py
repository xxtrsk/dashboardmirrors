#!/usr/bin/env python3
"""
Generate Excel Spreadsheet (.xls SpreadsheetML) for Full Month of August (1–31 August):
- 39856. Lollysunnery: OF Net $10,009.90 + PayPal $1,360.89 = $11,370.79 (Goal $10,000 | 113.71%)
- 47892. 1lollyhere: OF Net $3,577.07 + PayPal $210.00 = $3,787.07 (Goal $4,000 | 94.68%)
- 30201. Eva Blush: OF Net $2,404.65 + PayPal $282.50 = $2,687.15 (Goal $3,500 | 76.78%)
- 4967. Lila (angelkiss): OF Net $1,751.52 + PayPal $0.00 = $1,751.52 (Goal $1,500 | 116.77%)
- Grand Total Net Revenue: $19,596.53 (Goal $19,000 | 103.14% EXCEEDED!)
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
  <Title>Dashboard + KPI (1–31 Августа Полный Итог)</Title>
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

 <!-- SHEET 1: 1–31 Августа Полный Итог (OF + PayPal) -->
 <Worksheet ss:Name="OM Export 1-31 Aug Full Summary">
  <Table>
   <Column ss:Width="180"/>
   <Column ss:Width="110"/>
   <Column ss:Width="110"/>
   <Column ss:Width="120"/>
   <Column ss:Width="110"/>
   <Column ss:Width="100"/>
   <Column ss:Width="100"/>
   <Column ss:Width="130"/>

   <Row ss:StyleID="Header">
    <Cell><Data ss:Type="String">Account / Model</Data></Cell>
    <Cell><Data ss:Type="String">OF Net Rev</Data></Cell>
    <Cell><Data ss:Type="String">PayPal Income</Data></Cell>
    <Cell><Data ss:Type="String">Total Model Rev</Data></Cell>
    <Cell><Data ss:Type="String">Monthly Goal</Data></Cell>
    <Cell><Data ss:Type="String">Goal Progress</Data></Cell>
    <Cell><Data ss:Type="String">Goal Status</Data></Cell>
    <Cell><Data ss:Type="String">Monthly Forecast</Data></Cell>
   </Row>

   <!-- 1. Lollysunnery -->
   <Row>
    <Cell><Data ss:Type="String">39856. Lolly (Lollysunnery)</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">10009.90</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">1360.89</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">11370.79</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">10000.00</Data></Cell>
    <Cell ss:StyleID="Percent"><Data ss:Type="Number">1.1371</Data></Cell>
    <Cell ss:StyleID="Percent"><Data ss:Type="Number">0.1371</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">11370.79</Data></Cell>
   </Row>

   <!-- 2. 1lollyhere -->
   <Row>
    <Cell><Data ss:Type="String">47892. Lolly (1lollyhere)</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">3577.07</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">210.00</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">3787.07</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">4000.00</Data></Cell>
    <Cell ss:StyleID="Percent"><Data ss:Type="Number">0.9468</Data></Cell>
    <Cell ss:StyleID="Percent"><Data ss:Type="Number">-0.0532</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">3787.07</Data></Cell>
   </Row>

   <!-- 3. Eva Blush -->
   <Row>
    <Cell><Data ss:Type="String">30201. Eva (Eva Blush)</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">2404.65</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">282.50</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">2687.15</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">3500.00</Data></Cell>
    <Cell ss:StyleID="Percent"><Data ss:Type="Number">0.7678</Data></Cell>
    <Cell ss:StyleID="Percent"><Data ss:Type="Number">-0.2322</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">2687.15</Data></Cell>
   </Row>

   <!-- 4. Lila (angelkiss) -->
   <Row>
    <Cell><Data ss:Type="String">4967. LILA (angelkiss)</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">1751.52</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">0.00</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">1751.52</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">1500.00</Data></Cell>
    <Cell ss:StyleID="Percent"><Data ss:Type="Number">1.1677</Data></Cell>
    <Cell ss:StyleID="Percent"><Data ss:Type="Number">0.1677</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">1751.52</Data></Cell>
   </Row>

   <!-- 5. Grand Total -->
   <Row ss:StyleID="Header">
    <Cell><Data ss:Type="String">ИТОГО ВЫРУЧКА АГЕНТСТВА</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">17743.14</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">1853.39</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">19596.53</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">19000.00</Data></Cell>
    <Cell ss:StyleID="Percent"><Data ss:Type="Number">1.0314</Data></Cell>
    <Cell><Data ss:Type="String">—</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">19596.53</Data></Cell>
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

    print(f"✅ Файл Excel обновлен полным итогом за 1-31 Августа: {output_filepath}")

if __name__ == "__main__":
    generate_full_om_screenshot_excel()
