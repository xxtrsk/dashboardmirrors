#!/usr/bin/env python3
"""
Generate Excel Spreadsheet (.xls SpreadsheetML) with model total revenue = OnlyFans Net + PayPal Income:
- 39856. Lollysunnery: OF $7,120.28 + PayPal $1,141.45 = $8,261.73 Net
- 47892. 1lollyhere: OF $2,560.25 Net
- 30201. Eva Blush: OF $1,534.37 + PayPal $282.50 = $1,816.87 Net
- 4967. Lila (angelkiss): OF $1,216.88 Net
- Grand Total Net Revenue: $13,855.73
- Monthly Goal Progress: 72.92% ($13,855.73 / $19,000.00)
- Monthly Revenue Forecast: $20,453.70
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
  <Title>Dashboard + KPI (Балансы Моделей OF + PayPal)</Title>
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

 <!-- SHEET 1: Балансы Моделей OF + PayPal -->
 <Worksheet ss:Name="OM Export Models (OF + PP)">
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
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">7120.28</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">1141.45</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">8261.73</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">10000.00</Data></Cell>
    <Cell ss:StyleID="Percent"><Data ss:Type="Number">0.8262</Data></Cell>
    <Cell ss:StyleID="Percent"><Data ss:Type="Number">0.1488</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">12195.89</Data></Cell>
   </Row>

   <!-- 2. 1lollyhere -->
   <Row>
    <Cell><Data ss:Type="String">47892. Lolly (1lollyhere)</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">2560.25</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">0.00</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">2560.25</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">4000.00</Data></Cell>
    <Cell ss:StyleID="Percent"><Data ss:Type="Number">0.6401</Data></Cell>
    <Cell ss:StyleID="Percent"><Data ss:Type="Number">-0.0373</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">3779.42</Data></Cell>
   </Row>

   <!-- 3. Eva Blush -->
   <Row>
    <Cell><Data ss:Type="String">30201. Eva (Eva Blush)</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">1534.37</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">282.50</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">1816.87</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">3500.00</Data></Cell>
    <Cell ss:StyleID="Percent"><Data ss:Type="Number">0.5191</Data></Cell>
    <Cell ss:StyleID="Percent"><Data ss:Type="Number">-0.1583</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">2681.95</Data></Cell>
   </Row>

   <!-- 4. Lila (angelkiss) -->
   <Row>
    <Cell><Data ss:Type="String">4967. LILA (angelkiss)</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">1216.88</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">0.00</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">1216.88</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">1500.00</Data></Cell>
    <Cell ss:StyleID="Percent"><Data ss:Type="Number">0.8113</Data></Cell>
    <Cell ss:StyleID="Percent"><Data ss:Type="Number">0.1339</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">1796.44</Data></Cell>
   </Row>

   <!-- 5. Grand Total -->
   <Row ss:StyleID="Header">
    <Cell><Data ss:Type="String">ИТОГО ВЫРУЧКА АГЕНТСТВА</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">12431.78</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">1423.95</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">13855.73</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">19000.00</Data></Cell>
    <Cell ss:StyleID="Percent"><Data ss:Type="Number">0.7292</Data></Cell>
    <Cell><Data ss:Type="String">—</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">20453.70</Data></Cell>
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

    print(f"✅ Файл Excel обновлен с учетом балансов моделей OF + PayPal: {output_filepath}")

if __name__ == "__main__":
    generate_full_om_screenshot_excel()
