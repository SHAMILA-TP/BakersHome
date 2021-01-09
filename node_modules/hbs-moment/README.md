hbs-moment
==========

UNDER DEVELOPING!

Set [moment](https://github.com/moment/moment) as a [hbs](https://github.com/donpark/hbs) helper.

## Usage

`'now' = new Date()`

### Format Dates

```js
{{moment 'now' format='MMMM Do YYYY, h:mm:ss a'}} // July 12th 2014, 3:34:43 pm
{{moment 'now' format='dddd'}} // Saturday
{{moment 'now' format='MMM Do YY'}} // Jul 12th 14
{{moment 'now' format='YYYY [escape] YYYY'}} // 2014 escape 2014
{{moment 'now' format=''}} //2014-07-12T15:34:43+08:00
```

### Relative Time

```js
{{moment '20111031 YYYYMMDD' fromNow=''}} // 3 years ago
{{moment '20120620 YYYYMMDD' fromNow=''}} // 2 years ago
{{moment 'now' fromNow = 'start day'}} // 16 hours ago
{{moment 'now' fromNow = 'end day'}} // in 8 hours
{{moment 'now' fromNow = 'start hour'}} // 35 minutes ago
```

### Calendar Time

```javascript
{{moment 'now' calendar = 'subtract days 10'}} // 07/22/2014
{{moment 'now' calendar = 'subtract days 6'}} // Friday at 3:34 PM
{{moment 'now' calendar = 'subtract days 3'}} // Tuesday at 3:34 PM
{{moment 'now' calendar = 'subtract days 1'}} // Tomorrow at 3:34 PM
{{moment 'now' calendar = ''}} // Today at 3:34 PM
{{moment 'now' calendar = 'add days 1'}} // Tomorrow at 3:34 PM
{{moment 'now' calendar = 'add days 3'}} // Tuesday at 3:34 PM
{{moment 'now' calendar = 'add days 10' lang='zh-cn'}} // 2014年7月22日
```
