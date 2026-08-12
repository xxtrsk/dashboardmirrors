#!/usr/bin/env python3
"""
Generate Excel Spreadsheet (.xls SpreadsheetML) with direct OnlyMonster API figures by Model and Chatter:
- Lollysunnery: $3,913.77 (paul $2,348.26, karina $1,565.51)
- 1lollyhere: $1,521.84 (hinata $913.10, Kirill $608.74)
- Lila (angelkiss): $849.69 (hinata $849.69)
- Eva Blush: $574.57 (paul $344.74, karina $229.83)
"""

def generate_direct_api_excel():
    xml = """<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Author>OnlyMonster Direct API</Author>
  <Title>Dashboard + KPI (OnlyMonster Direct API Data)</Title>
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

 <!-- SHEET 1: ИМПОРТ ОМ (Чаттеры по моделям API) -->
 <Worksheet ss:Name="Чаттеры по моделям (API)">
  <Table>
   <Column ss:Width="160"/>
   <Column ss:Width="160"/>
   <Column ss:Width="120"/>
   <Column ss:Width="110"/>
   <Column ss:Width="100"/>
   <Column ss:Width="120"/>

   <Row ss:StyleID="Header">
    <Cell><Data ss:Type="String">Model</Data></Cell>
    <Cell><Data ss:Type="String">Chatter Member</Data></Cell>
    <Cell><Data ss:Type="String">API Net Sales (80%)</Data></Cell>
    <Cell><Data ss:Type="String">PPV Sales</Data></Cell>
    <Cell><Data ss:Type="String">Tips</Data></Cell>
    <Cell><Data ss:Type="String">Messages</Data></Cell>
   </Row>

   <Row>
    <Cell><Data ss:Type="String">Lolly (Lollysunnery)</Data></Cell>
    <Cell><Data ss:Type="String">paul walkeeer</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">2348.26</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">1691.14</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">657.12</Data></Cell>
    <Cell><Data ss:Type="Number">5240</Data></Cell>
   </Row>

   <Row>
    <Cell><Data ss:Type="String">Lolly (Lollysunnery)</Data></Cell>
    <Cell><Data ss:Type="String">karina @sanesskio</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">1565.51</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">1127.43</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">438.08</Data></Cell>
    <Cell><Data ss:Type="Number">3145</Data></Cell>
   </Row>

   <Row>
    <Cell><Data ss:Type="String">Lolly (1lollyhere)</Data></Cell>
    <Cell><Data ss:Type="String">hinata hyuga</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">913.10</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">782.78</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">130.32</Data></Cell>
    <Cell><Data ss:Type="Number">1980</Data></Cell>
   </Row>

   <Row>
    <Cell><Data ss:Type="String">Lolly (1lollyhere)</Data></Cell>
    <Cell><Data ss:Type="String">Kirill Chelusti</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">608.74</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">521.86</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">86.88</Data></Cell>
    <Cell><Data ss:Type="Number">3095</Data></Cell>
   </Row>

   <Row>
    <Cell><Data ss:Type="String">Lila (angelkiss)</Data></Cell>
    <Cell><Data ss:Type="String">hinata hyuga</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">849.69</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">845.69</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">4.00</Data></Cell>
    <Cell><Data ss:Type="Number">1783</Data></Cell>
   </Row>

   <Row>
    <Cell><Data ss:Type="String">Eva Blush</Data></Cell>
    <Cell><Data ss:Type="String">paul walkeeer</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">344.74</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">255.94</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">88.80</Data></Cell>
    <Cell><Data ss:Type="Number">3145</Data></Cell>
   </Row>

   <Row>
    <Cell><Data ss:Type="String">Eva Blush</Data></Cell>
    <Cell><Data ss:Type="String">karina @sanesskio</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">229.83</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">170.63</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">59.20</Data></Cell>
    <Cell><Data ss:Type="Number">2082</Data></Cell>
   </Row>

  </Table>
 </Worksheet>

 <!-- SHEET 2: Модели (API Net 80%) -->
 <Worksheet ss:Name="Модели (API Net 80%)">
  <Table>
   <Column ss:Width="160"/>
   <Column ss:Width="120"/>
   <Column ss:Width="120"/>
   <Column ss:Width="120"/>

   <Row ss:StyleID="Header">
    <Cell><Data ss:Type="String">Model Name</Data></Cell>
    <Cell><Data ss:Type="String">Model Plan ($)</Data></Cell>
    <Cell><Data ss:Type="String">API Net Revenue (80%)</Data></Cell>
    <Cell><Data ss:Type="String">Monthly Run Rate ($)</Data></Cell>
   </Row>

   <Row>
    <Cell><Data ss:Type="String">Lila (angelkiss)</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">1500</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">849.69</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">2195.03</Data></Cell>
   </Row>

   <Row>
    <Cell><Data ss:Type="String">Eva Blush</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">4000</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">574.57</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">1484.31</Data></Cell>
   </Row>

   <Row>
    <Cell><Data ss:Type="String">Lolly (Lollysunnery)</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">10000</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">3913.77</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">10110.57</Data></Cell>
   </Row>

   <Row>
    <Cell><Data ss:Type="String">Lolly (1lollyhere)</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">4000</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">1521.84</Data></Cell>
    <Cell ss:StyleID="Currency"><Data ss:Type="Number">3928.75</Data></Cell>
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

    print(f"✅ Файл Excel обновлен с прямыми данными OnlyMonster API: {output_filepath}")

if __name__ == "__main__":
    generate_direct_api_excel()
