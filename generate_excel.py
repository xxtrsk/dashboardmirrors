#!/usr/bin/env python3
"""
Generate Excel Spreadsheet (.xls SpreadsheetML) for 1–16 September (Official CRM Screenshots for OF + Fansly EvaPinky):
- 39856. Lollysunnery: OF Net $3,599.40 (Goal $7,500 | 47.99%)
- 47892. 1lollyhere: OF Net $1,950.14 (Goal $3,500 | 55.72%)
- 30201. Eva Blush: OF Net $1,047.32 (Goal $3,000 | 34.91%)
- 77304. Eva Pinky (Fansly): Net $717.94 (Goal $1,000 | 71.79%)
- 4967. Lila (angelkiss): OF Net $526.81 (Goal $1,500 | 35.12%)
- Grand Total Agency Revenue 1–16 September: $7,841.61 (Goal $16,500 | 47.52%)
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
  <Title>Dashboard + KPI (1–16 Сентября Итог)</Title>
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

 <!-- SHEET 1: 1–16 Сентября Итог (OF + Fansly EvaPinky) -->
 <Worksheet ss:Name="OM Export 1-16 Sept Summary">
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
    <Cell><Data ss:Type="String">Platform</Data></Cell>
    <Cell><Data ss:Type="String">Total Rev Net</Data></Cell>
    <Cell><Data ss:Type="String">Monthly Goal</Data></Cell>
    <Cell><Data ss:Type="String">Goal Progress</Data></Cell>
    <Cell><Data ss:Type="String">Goal Status</Data></Cell>
    <Cell><Data ss:Type="String">Monthly Forecast</Data></Cell>
    <Cell><Data ss:Type="String">APV</Data></Cell>
    <Cell><Data ss:Type="String">ARPPU</Data></Cell>
   </Row>

   <!-- 1. Lollysunnery -->
   <Row>
    <Cell><Data ss:Type="String">39856. Lolly (Lollysunnery)</Data></Cell>
    <Cell><Data ss:Type="String">OnlyFans</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">3599.40</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">7500.00</Data></Cell>
    <Cell ss:StyleID="Percent"><Data ss:Type="Number">0.4799</Data></Cell>
    <Cell ss:StyleID="Percent"><Data ss:Type="Number">-0.0534</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">6748.88</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">32.43</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">83.71</Data></Cell>
   </Row>

   <!-- 2. 1lollyhere -->
   <Row>
    <Cell><Data ss:Type="String">47892. Lolly (1lollyhere)</Data></Cell>
    <Cell><Data ss:Type="String">OnlyFans</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">1950.14</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">3500.00</Data></Cell>
    <Cell ss:StyleID="Percent"><Data ss:Type="Number">0.5572</Data></Cell>
    <Cell ss:StyleID="Percent"><Data ss:Type="Number">0.0239</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">3656.51</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">20.31</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">51.32</Data></Cell>
   </Row>

   <!-- 3. Eva Blush -->
   <Row>
    <Cell><Data ss:Type="String">30201. Eva (Eva Blush)</Data></Cell>
    <Cell><Data ss:Type="String">OnlyFans</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">1047.32</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">3000.00</Data></Cell>
    <Cell ss:StyleID="Percent"><Data ss:Type="Number">0.3491</Data></Cell>
    <Cell ss:StyleID="Percent"><Data ss:Type="Number">-0.1842</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">1963.73</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">20.95</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">30.80</Data></Cell>
   </Row>

   <!-- 4. Eva Pinky (Fansly) -->
   <Row>
    <Cell><Data ss:Type="String">77304. Eva Pinky (Fansly)</Data></Cell>
    <Cell><Data ss:Type="String">Fansly</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">717.94</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">1000.00</Data></Cell>
    <Cell ss:StyleID="Percent"><Data ss:Type="Number">0.7179</Data></Cell>
    <Cell ss:StyleID="Percent"><Data ss:Type="Number">0.1846</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">1346.14</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">23.16</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">34.19</Data></Cell>
   </Row>

   <!-- 5. Lila (angelkiss) -->
   <Row>
    <Cell><Data ss:Type="String">4967. LILA (angelkiss)</Data></Cell>
    <Cell><Data ss:Type="String">OnlyFans</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">526.81</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">1500.00</Data></Cell>
    <Cell ss:StyleID="Percent"><Data ss:Type="Number">0.3512</Data></Cell>
    <Cell ss:StyleID="Percent"><Data ss:Type="Number">-0.1821</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">987.77</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">14.24</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">21.07</Data></Cell>
   </Row>

   <!-- 6. Grand Total -->
   <Row ss:StyleID="Header">
    <Cell><Data ss:Type="String">ИТОГО ВЫРУЧКА АГЕНТСТВА</Data></Cell>
    <Cell><Data ss:Type="String">OF + Fansly</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">7841.61</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">16500.00</Data></Cell>
    <Cell ss:StyleID="Percent"><Data ss:Type="Number">0.4752</Data></Cell>
    <Cell><Data ss:Type="String">—</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">14703.03</Data></Cell>
    <Cell><Data ss:Type="String">—</Data></Cell>
    <Cell><Data ss:Type="String">—</Data></Cell>
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

    print(f"✅ Файл Excel обновлен данными за 1-16 Сентября: {output_filepath}")

if __name__ == "__main__":
    generate_full_om_screenshot_excel()
