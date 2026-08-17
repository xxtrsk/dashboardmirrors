#!/usr/bin/env python3
"""
Generate Excel Spreadsheet (.xls SpreadsheetML) with exact 100% matching values from full OnlyMonster export screenshots, including +$424.48 PP (Prize Pool) income:
- Total Net Revenue across models: $9,003.20
- PP Income (Prize Pool): +$424.48
- Grand Total Revenue: $9,427.68
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
  <Title>Dashboard + KPI (С учетом доклада с PP)</Title>
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

 <!-- SHEET 1: 100% Точные Данные OnlyMonster CRM -->
 <Worksheet ss:Name="OnlyMonster CRM Full Export">
  <Table>
   <Column ss:Width="180"/>
   <Column ss:Width="120"/>
   <Column ss:Width="120"/>
   <Column ss:Width="120"/>
   <Column ss:Width="120"/>
   <Column ss:Width="110"/>
   <Column ss:Width="110"/>
   <Column ss:Width="140"/>

   <Row ss:StyleID="Header">
    <Cell><Data ss:Type="String">Account / Model</Data></Cell>
    <Cell><Data ss:Type="String">Total Revenue Net</Data></Cell>
    <Cell><Data ss:Type="String">Revenue 1-7 (W1)</Data></Cell>
    <Cell><Data ss:Type="String">Revenue 8-15 (W2)</Data></Cell>
    <Cell><Data ss:Type="String">Monthly Revenue Goal</Data></Cell>
    <Cell><Data ss:Type="String">Goal Progress</Data></Cell>
    <Cell><Data ss:Type="String">Goal Status</Data></Cell>
    <Cell><Data ss:Type="String">Monthly Revenue Forecast</Data></Cell>
   </Row>

   <Row>
    <Cell><Data ss:Type="String">39856. Lolly (Lollysunnery)</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">5247.68</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">1644.02</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">3603.66</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">10000.00</Data></Cell>
    <Cell ss:StyleID="Percent"><Data ss:Type="Number">0.5539</Data></Cell>
    <Cell ss:StyleID="Percent"><Data ss:Type="Number">0.0700</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">10731.89</Data></Cell>
   </Row>

   <Row>
    <Cell><Data ss:Type="String">47892. Lolly (1lollyhere)</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">1746.33</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">378.15</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">1368.18</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">4000.00</Data></Cell>
    <Cell ss:StyleID="Percent"><Data ss:Type="Number">0.4831</Data></Cell>
    <Cell ss:StyleID="Percent"><Data ss:Type="Number">-0.0008</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">3744.03</Data></Cell>
   </Row>

   <Row>
    <Cell><Data ss:Type="String">30201. Eva (Eva Blush)</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">1010.16</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">549.69</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">460.47</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">3500.00</Data></Cell>
    <Cell ss:StyleID="Percent"><Data ss:Type="Number">0.2948</Data></Cell>
    <Cell ss:StyleID="Percent"><Data ss:Type="Number">-0.1891</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">1999.00</Data></Cell>
   </Row>

   <Row>
    <Cell><Data ss:Type="String">4967. LILA (angelkiss)</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">999.03</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">482.55</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">516.48</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">1500.00</Data></Cell>
    <Cell ss:StyleID="Percent"><Data ss:Type="Number">0.6826</Data></Cell>
    <Cell ss:StyleID="Percent"><Data ss:Type="Number">0.1987</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">1983.83</Data></Cell>
   </Row>

   <Row>
    <Cell><Data ss:Type="String">Доход с PP (Prize Pool)</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">424.48</Data></Cell>
    <Cell><Data ss:Type="String">—</Data></Cell>
    <Cell><Data ss:Type="String">—</Data></Cell>
    <Cell><Data ss:Type="String">—</Data></Cell>
    <Cell><Data ss:Type="String">—</Data></Cell>
    <Cell><Data ss:Type="String">—</Data></Cell>
    <Cell><Data ss:Type="String">—</Data></Cell>
   </Row>

   <Row ss:StyleID="Header">
    <Cell><Data ss:Type="String">ИТОГО ВЫРУЧКА АГЕНТСТВА</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">9427.68</Data></Cell>
    <Cell><Data ss:Type="String">—</Data></Cell>
    <Cell><Data ss:Type="String">—</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">19000.00</Data></Cell>
    <Cell ss:StyleID="Percent"><Data ss:Type="Number">0.4962</Data></Cell>
    <Cell><Data ss:Type="String">—</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">19483.87</Data></Cell>
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

    print(f"✅ Файл Excel обновлен с доходом PP (+$424.48): {output_filepath}")

if __name__ == "__main__":
    generate_full_om_screenshot_excel()
