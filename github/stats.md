### [Google form](https://docs.google.com/forms/d/1j-POhRdigGEcWIAFcM3DEyEQHLNyQmJ_oArIZ4zqyz8/)

### [Statistics](https://docs.google.com/spreadsheets/d/1GEMJfZxjUYmQAg-cDcQ7DGNjsX6pASMp9hQ1T0tVRfo/)

<hr>

```
=QUERY(
  FILTER(
    FLATTEN(ARRAYFORMULA(SPLIT(FILTER(Form_Responses[Selected mods]; Form_Responses[Selected mods]<>""); ",")));
    FLATTEN(ARRAYFORMULA(SPLIT(FILTER(Form_Responses[Selected mods]; Form_Responses[Selected mods]<>""); ","))) <> ""
  );
  "select Col1, count(Col1) group by Col1 order by count(Col1) desc label Col1 '', count(Col1) ''";
  0
)
```
