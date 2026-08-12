#!/usr/bin/env python3
"""
Generate Excel Spreadsheet (.xls SpreadsheetML) with exact OnlyMonster Chatter Overview:
- paul walkeeer (ID 121820): $2,573.58
- hinata hyuga (ID 17452): $1,792.12
- karina @sanesskio (ID 161525): $1,147.19
- Kirill Chelusti (ID 188427): $540.00
- Taras K (ID 182004): $189.58
- Alex Sonly (ID 45471): $96.00
"""

def generate_chatter_overview_excel():
    xml = """<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Author>OnlyMonster CRM System</Author>
  <Title>Dashboard + KPI (OnlyMonster Chatter Overview)</Title>
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

 <!-- SHEET 1: ИМПОРТ ОМ (Чаттеры Overview OnlyMonster) -->
 <Worksheet ss:Name="ИМПОРТ ОМ">
  <Table>
   <Column ss:Width="160"/>
   <Column ss:Width="110"/>
   <Column ss:Width="110"/>
   <Column ss:Width="100"/>
   <Column ss:Width="120"/>
   <Column ss:Width="110"/>

   <Row ss:StyleID="Header">
    <Cell><Data ss:Type="String">Member</Data></Cell>
    <Cell><Data ss:Type="String">Total Sales</Data></Cell>
    <Cell><Data ss:Type="String">PPV Sales</Data></Cell>
    <Cell><Data ss:Type="String">Tips</Data></Cell>
    <Cell><Data ss:Type="String">Total Messages Sent</Data></Cell>
    <Cell><Data ss:Type="String">Avg. Response Time</Data></Cell>
   </Row>

   <Row>
    <Cell><Data ss:Type="String">paul walkeeer (ID 121820)</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">2573.58</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">2087.98</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">485.60</Data></Cell>
    <Cell><Data ss:Type="Number">8385</Data></Cell>
    <Cell><Data ss:Type="String">4m 30sec</Data></Cell>
   </Row>

   <Row>
    <Cell><Data ss:Type="String">hinata hyuga (ID 17452)</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">1792.12</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">1600.12</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">192.00</Data></Cell>
    <Cell><Data ss:Type="Number">3763</Data></Cell>
    <Cell><Data ss:Type="String">2m 58sec</Data></Cell>
   </Row>

   <Row>
    <Cell><Data ss:Type="String">karina @sanesskio (ID 161525)</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">1147.19</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">651.19</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">496.00</Data></Cell>
    <Cell><Data ss:Type="Number">5227</Data></Cell>
    <Cell><Data ss:Type="String">2m 36sec</Data></Cell>
   </Row>

   <Row>
    <Cell><Data ss:Type="String">Kirill Chelusti (ID 188427)</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">540.00</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">428.00</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">112.00</Data></Cell>
    <Cell><Data ss:Type="Number">3095</Data></Cell>
    <Cell><Data ss:Type="String">4m 55sec</Data></Cell>
   </Row>

   <Row>
    <Cell><Data ss:Type="String">Taras K (ID 182004)</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">189.58</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">189.58</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">0.00</Data></Cell>
    <Cell><Data ss:Type="Number">239</Data></Cell>
    <Cell><Data ss:Type="String">3m 55sec</Data></Cell>
   </Row>

   <Row>
    <Cell><Data ss:Type="String">Alex Sonly (ID 45471)</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">96.00</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">96.00</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">0.00</Data></Cell>
    <Cell><Data ss:Type="Number">0</Data></Cell>
    <Cell><Data ss:Type="String">—</Data></Cell>
   </Row>
  </Table>
 </Worksheet>

 <!-- SHEET 2: ИМПОРТ ОМ (модели) -->
 <Worksheet ss:Name="ИМПОРТ ОМ (модели)">
  <Table>
   <Column ss:Width="140"/>
   <Column ss:Width="100"/>
   <Column ss:Width="130"/>
   <Column ss:Width="140"/>
   <Column ss:Width="110"/>
   <Column ss:Width="110"/>

   <Row ss:StyleID="Header">
    <Cell><Data ss:Type="String">Account</Data></Cell>
    <Cell><Data ss:Type="String">Total Net Revenue (80%)</Data></Cell>
    <Cell><Data ss:Type="String">Monthly Rev Goal</Data></Cell>
    <Cell><Data ss:Type="String">Goal Progress</Data></Cell>
    <Cell><Data ss:Type="String">Monthly Rev Run Rate</Data></Cell>
    <Cell><Data ss:Type="String">New Fans</Data></Cell>
   </Row>

   <Row>
    <Cell><Data ss:Type="String">4967. Lila</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">849.69</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">1500.00</Data></Cell>
    <Cell ss:StyleID="Percent"><Data ss:Type="Number">0.5665</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">2195.03</Data></Cell>
    <Cell><Data ss:Type="Number">285</Data></Cell>
   </Row>

   <Row>
    <Cell><Data ss:Type="String">30201. Eva</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">574.57</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">4000.00</Data></Cell>
    <Cell ss:StyleID="Percent"><Data ss:Type="Number">0.1436</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">1484.31</Data></Cell>
    <Cell><Data ss:Type="Number">240</Data></Cell>
   </Row>

   <Row>
    <Cell><Data ss:Type="String">39856. Lolly</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">3913.77</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">10000.00</Data></Cell>
    <Cell ss:StyleID="Percent"><Data ss:Type="Number">0.3914</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">10110.57</Data></Cell>
    <Cell><Data ss:Type="Number">512</Data></Cell>
   </Row>

   <Row>
    <Cell><Data ss:Type="String">47892. Lolly</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">1521.84</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">4000.00</Data></Cell>
    <Cell ss:StyleID="Percent"><Data ss:Type="Number">0.3805</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">3928.75</Data></Cell>
    <Cell><Data ss:Type="Number">325</Data></Cell>
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

    print(f"✅ Файл Excel обновлен с точной сводкой чаттеров из OnlyMonster: {output_filepath}")

if __name__ == "__main__":
    generate_chatter_overview_excel()
