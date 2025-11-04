```
QUERY(
  FLATTEN(ARRAYFORMULA(SPLIT(FILTER(Form_Responses[Selected mods]; Form_Responses[Selected mods]<>""); ",")));
  "select Col1, count(Col1) where Col1 is not null group by Col1 order by count(Col1) desc";
  0
)
```
