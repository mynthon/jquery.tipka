jquery.tipka
============

Tipka is a simple tooltip plugin for jquery. It was based on Drew Wilson's TipTip plugin but now there is no single common line, so i put it as separate plugin. 

Tipka is only ~7kB when comressed.

To run:

```javascript
$('.trigger').tipka(options)
```

where options is object with possible properties

String **activation **
hover|click|focus|elsewhere 
Default is hover. Defines how tooltip should be fired. "elsewhere" option means that tooltip will be fired by javascript rather than mouse event.

String **defaultPosition** 
Comma separated list of positions (no spaces). Available options are r, b, l, t, tr, rt, rb, br, bl, lb, lt, tl for	right, bottom, left, etc.

String **smartPosition**
defaults - try to fit within defaults. If no fully visible spot found display at first position declared.
findAnySpot - try to fit in any fully visible spot. If no fully visible spot found display at default position.
defaultsBestFit - show in spot where tip will be mostly visible. Check only defaults.
bestFit - if no fully visible spot find where tip will be most visible.

bool **keepOnTip** 
determines if tip should stay after moving cursor
over it or should always disappear after moving cursor out of trigger

