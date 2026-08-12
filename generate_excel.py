#!/usr/bin/env python3
"""
Generate Excel Spreadsheet (.xls SpreadsheetML) with Net Revenue (80% after OnlyFans fee) matching OnlyMonster ($6,859.87):
- Account 4967: Lila (angelkiss) Net Revenue: $849.69, Plan: $1500, Run Rate: $2195.03
- Account 30201: Eva Blush Net Revenue: $574.57, Plan: $4000, Run Rate: $1484.31
- Account 39856: Lolly (Lollysunnery) Net Revenue: $3913.77, Plan: $10000, Run Rate: $10110.57
- Account 47892: Lolly (1lollyhere) Net Revenue: $1521.84, Plan: $4000, Run Rate: $3928.75
"""

def generate_net_onlymonster_excel():
    xml = """<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Author>OnlyMonster CRM System</Author>
  <Title>Dashboard + KPI (Net 80% OnlyMonster 1-12 Августа)</Title>
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

 <!-- SHEET 1: ИМПОРТ ОМ (модели) - OnlyMonster Net Revenue 80% -->
 <Worksheet ss:Name="ИМПОРТ ОМ (модели)">
  <Table>
   <Column ss:Width="140"/>
   <Column ss:Width="100"/>
   <Column ss:Width="130"/>
   <Column ss:Width="140"/>
   <Column ss:Width="110"/>
   <Column ss:Width="110"/>
   <Column ss:Width="120"/>
   <Column ss:Width="80"/>

   <Row ss:StyleID="Header">
    <Cell><Data ss:Type="String">Account</Data></Cell>
    <Cell><Data ss:Type="String">Total Net Revenue (80%)</Data></Cell>
    <Cell><Data ss:Type="String">Revenue from New Fans</Data></Cell>
    <Cell><Data ss:Type="String">Revenue from Existing Fans</Data></Cell>
    <Cell><Data ss:Type="String">Monthly Rev Goal</Data></Cell>
    <Cell><Data ss:Type="String">Goal Progress</Data></Cell>
    <Cell><Data ss:Type="String">Monthly Rev Run Rate</Data></Cell>
    <Cell><Data ss:Type="String">New Fans</Data></Cell>
   </Row>

   <Row>
    <Cell><Data ss:Type="String">4967. Lila</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">849.69</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">360.00</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">489.69</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">1500.00</Data></Cell>
    <Cell ss:StyleID="Percent"><Data ss:Type="Number">0.5665</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">2195.03</Data></Cell>
    <Cell><Data ss:Type="Number">285</Data></Cell>
   </Row>

   <Row>
    <Cell><Data ss:Type="String">30201. Eva</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">574.57</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">144.00</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">430.57</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">4000.00</Data></Cell>
    <Cell ss:StyleID="Percent"><Data ss:Type="Number">0.1436</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">1484.31</Data></Cell>
    <Cell><Data ss:Type="Number">240</Data></Cell>
   </Row>

   <Row>
    <Cell><Data ss:Type="String">39856. Lolly</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">3913.77</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">1160.00</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">2753.77</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">10000.00</Data></Cell>
    <Cell ss:StyleID="Percent"><Data ss:Type="Number">0.3914</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">10110.57</Data></Cell>
    <Cell><Data ss:Type="Number">512</Data></Cell>
   </Row>

   <Row>
    <Cell><Data ss:Type="String">47892. Lolly</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">1521.84</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">256.00</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">1265.84</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">4000.00</Data></Cell>
    <Cell ss:StyleID="Percent"><Data ss:Type="Number">0.3805</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">3928.75</Data></Cell>
    <Cell><Data ss:Type="Number">325</Data></Cell>
   </Row>
  </Table>
 </Worksheet>

 <!-- SHEET 2: Main Dashboard -->
 <Worksheet ss:Name="Main Dashboard">
  <Table>
   <Column ss:Width="160"/>
   <Column ss:Width="140"/>
   <Column ss:Width="140"/>
   <Column ss:Width="140"/>
   <Column ss:Width="130"/>
   <Column ss:Width="250"/>

   <Row ss:StyleID="Header">
    <Cell><Data ss:Type="String">Model Name</Data></Cell>
    <Cell><Data ss:Type="String">Model Plan ($)</Data></Cell>
    <Cell><Data ss:Type="String">Total Net Revenue (1-12 Авг)</Data></Cell>
    <Cell><Data ss:Type="String">Run Rate ($/мес)</Data></Cell>
    <Cell><Data ss:Type="String">Goal Progress (%)</Data></Cell>
    <Cell><Data ss:Type="String">Assigned Chatters</Data></Cell>
   </Row>

   <Row>
    <Cell><Data ss:Type="String">Lila (angelkiss)</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">1500</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">849.69</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">2195.03</Data></Cell>
    <Cell ss:StyleID="Percent"><Data ss:Type="Number">0.5665</Data></Cell>
    <Cell><Data ss:Type="String">hinata</Data></Cell>
   </Row>

   <Row>
    <Cell><Data ss:Type="String">Eva Blush</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">4000</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">574.57</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">1484.31</Data></Cell>
    <Cell ss:StyleID="Percent"><Data ss:Type="Number">0.1436</Data></Cell>
    <Cell><Data ss:Type="String">paul, karina</Data></Cell>
   </Row>

   <Row>
    <Cell><Data ss:Type="String">Lolly (Lollysunnery)</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">10000</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">3913.77</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">10110.57</Data></Cell>
    <Cell ss:StyleID="Percent"><Data ss:Type="Number">0.3914</Data></Cell>
    <Cell><Data ss:Type="String">paul, karina</Data></Cell>
   </Row>

   <Row>
    <Cell><Data ss:Type="String">Lolly (1lollyhere)</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">4000</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">1521.84</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">3928.75</Data></Cell>
    <Cell ss:StyleID="Percent"><Data ss:Type="Number">0.3805</Data></Cell>
    <Cell><Data ss:Type="String">hinata, Kiril</Data></Cell>
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

    print(f"✅ Файл Excel обновлен с Net 80% OnlyMonster за 1-12 августа: {output_filepath}")

if __name__ == "__main__":
    generate_net_onlymonster_excel()
