#!/usr/bin/env python3
"""
Generate Excel Spreadsheet (.xls SpreadsheetML) with exact Week 1 (1-7 Aug) and Week 2 (8-12 Aug) API breakdown:
- Lollysunnery: Week 1 = $1,978.10, Week 2 = $1,935.66 (Total 1-12 = $3,913.77)
- 1lollyhere: Week 1 = $992.80, Week 2 = $529.04 (Total 1-12 = $1,521.84)
- Lila (angelkiss): Week 1 = $593.62, Week 2 = $256.07 (Total 1-12 = $849.69)
- Eva Blush: Week 1 = $253.59, Week 2 = $320.98 (Total 1-12 = $574.57)
"""

def generate_weekly_breakdown_excel():
    xml = """<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Author>OnlyMonster Direct API</Author>
  <Title>Dashboard + KPI (Weekly Breakdown 1-7 and 8-12 Aug)</Title>
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

 <!-- SHEET 1: Недельная Динамика Моделей -->
 <Worksheet ss:Name="Недельная Динамика">
  <Table>
   <Column ss:Width="160"/>
   <Column ss:Width="130"/>
   <Column ss:Width="130"/>
   <Column ss:Width="130"/>
   <Column ss:Width="140"/>

   <Row ss:StyleID="Header">
    <Cell><Data ss:Type="String">Model Name</Data></Cell>
    <Cell><Data ss:Type="String">Week 1 (1-7 Авг)</Data></Cell>
    <Cell><Data ss:Type="String">Week 2 (8-12 Авг)</Data></Cell>
    <Cell><Data ss:Type="String">Total Net (1-12 Авг)</Data></Cell>
    <Cell><Data ss:Type="String">Monthly Goal ($)</Data></Cell>
   </Row>

   <Row>
    <Cell><Data ss:Type="String">Lolly (Lollysunnery)</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">1978.10</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">1935.66</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">3913.77</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">10000.00</Data></Cell>
   </Row>

   <Row>
    <Cell><Data ss:Type="String">Lolly (1lollyhere)</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">992.80</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">529.04</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">1521.84</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">4000.00</Data></Cell>
   </Row>

   <Row>
    <Cell><Data ss:Type="String">Lila (angelkiss)</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">593.62</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">256.07</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">849.69</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">1500.00</Data></Cell>
   </Row>

   <Row>
    <Cell><Data ss:Type="String">Eva Blush</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">253.59</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">320.98</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">574.57</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">4000.00</Data></Cell>
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

    print(f"✅ Файл Excel обновлен с недели 1 (1-7 Авг) и недели 2 (8-12 Авг): {output_filepath}")

if __name__ == "__main__":
    generate_weekly_breakdown_excel()
