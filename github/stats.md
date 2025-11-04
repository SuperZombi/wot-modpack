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
