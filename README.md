## Smart Table 组件库


## 启动项目
npm run serve

## build 流程
npm run build

### 使用方法
```
  new SmartUI.Table({
    selector: '#smartTable1',
    tableHeight: 300
  })
  new SmartUI.Table({
    selector: '#smartTable2',
    tableHeight: function () {
      return 300
    }
  })
  new SmartUI.Table({
    selector: '#smartTable3'
  })
```