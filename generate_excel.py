#!/usr/bin/env python3
"""
Generate Excel Spreadsheet (.xls SpreadsheetML) for September 1–30 (Full Month CRM Net + PayPal):
- 39856. Lollysunnery: Total Net $8,444.19 (Goal $8,500.00 | 99.34%)
- 47892. 1lollyhere: Total Net $2,931.68 (Goal $3,500.00 | 83.76%)
- 30201. Eva Blush: Total Net $3,389.85 (Goal $2,800.00 | 121.07% - Goal Achieved!)
- 77304. Eva Pinky (Fansly): Net $1,350.36 (Goal $1,300.00 | 103.87% - Goal Achieved!)
- 4967. Lila (angelkiss): OF Net $1,463.26 (Goal $1,250.00 | 117.06% - Goal Achieved!)
- Grand Total Agency Revenue: $17,579.34 (Goal $17,350.00 | 101.32% - OVERALL AGENCY GOAL ACHIEVED!)
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
  <Title>Dashboard + KPI (1–30 Сентября Итог c PP)</Title>
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

 <!-- SHEET 1: 1–30 Сентября Итог (CRM + PayPal) -->
 <Worksheet ss:Name="OM Export 1-30 Sept Summary">
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
    <Cell><Data ss:Type="String">Monthly Total</Data></Cell>
    <Cell><Data ss:Type="String">APV</Data></Cell>
    <Cell><Data ss:Type="String">ARPPU</Data></Cell>
   </Row>

   <!-- 1. Lollysunnery -->
   <Row>
    <Cell><Data ss:Type="String">39856. Lolly (Lollysunnery)</Data></Cell>
    <Cell><Data ss:Type="String">OnlyFans</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">8444.19</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">8500.00</Data></Cell>
    <Cell ss:StyleID="Percent"><Data ss:Type="Number">0.9934</Data></Cell>
    <Cell ss:StyleID="Percent"><Data ss:Type="Number">-0.0066</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">8444.19</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">29.47</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">83.94</Data></Cell>
   </Row>

   <!-- 2. 1lollyhere -->
   <Row>
    <Cell><Data ss:Type="String">47892. Lolly (1lollyhere)</Data></Cell>
    <Cell><Data ss:Type="String">OnlyFans</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">2931.68</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">3500.00</Data></Cell>
    <Cell ss:StyleID="Percent"><Data ss:Type="Number">0.8376</Data></Cell>
    <Cell ss:StyleID="Percent"><Data ss:Type="Number">-0.1624</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">2931.68</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">18.12</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">41.17</Data></Cell>
   </Row>

   <!-- 3. Eva Blush -->
   <Row>
    <Cell><Data ss:Type="String">30201. Eva (Eva Blush)</Data></Cell>
    <Cell><Data ss:Type="String">OnlyFans</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">3389.85</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">2800.00</Data></Cell>
    <Cell ss:StyleID="Percent"><Data ss:Type="Number">1.2107</Data></Cell>
    <Cell ss:StyleID="Percent"><Data ss:Type="Number">0.2107</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">3389.85</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">18.88</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">35.56</Data></Cell>
   </Row>

   <!-- 4. Eva Pinky (Fansly) -->
   <Row>
    <Cell><Data ss:Type="String">77304. Eva Pinky (Fansly)</Data></Cell>
    <Cell><Data ss:Type="String">Fansly</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">1350.36</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">1300.00</Data></Cell>
    <Cell ss:StyleID="Percent"><Data ss:Type="Number">1.0387</Data></Cell>
    <Cell ss:StyleID="Percent"><Data ss:Type="Number">0.0387</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">1350.36</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">19.57</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">32.15</Data></Cell>
   </Row>

   <!-- 5. Lila (angelkiss) -->
   <Row>
    <Cell><Data ss:Type="String">4967. LILA (angelkiss)</Data></Cell>
    <Cell><Data ss:Type="String">OnlyFans</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">1463.26</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">1250.00</Data></Cell>
    <Cell ss:StyleID="Percent"><Data ss:Type="Number">1.1706</Data></Cell>
    <Cell ss:StyleID="Percent"><Data ss:Type="Number">0.1706</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">1463.26</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">12.72</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">24.39</Data></Cell>
   </Row>

   <!-- 6. Grand Total -->
   <Row ss:StyleID="Header">
    <Cell><Data ss:Type="String">ИТОГО ВЫРУЧКА АГЕНТСТВА</Data></Cell>
    <Cell><Data ss:Type="String">OF + Fansly + PP</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">17579.34</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">17350.00</Data></Cell>
    <Cell ss:StyleID="Percent"><Data ss:Type="Number">1.0132</Data></Cell>
    <Cell><Data ss:Type="String">ПЛАН ВЫПОЛНЕН! 🎉</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">17579.34</Data></Cell>
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

    print(f"✅ Файл Excel обновлен итоговыми данными за 1–30 Сентября (с PayPal): {output_filepath}")

if __name__ == "__main__":
    generate_full_om_screenshot_excel()
