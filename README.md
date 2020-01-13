# Smart Table 组件库

**专处理纯静态table固定头列及排序功能**

此组件库常用于服务端处理数据后直接返回HTML渲染，在客户端需要表格的多样化功能。

-- 初衷 --

  方便在服务端直接返回已经渲染好的table数据后，增加table的组件库功能（如头固定、左右列固定、排序功能）
  此项目不依赖任何其他库，减少依赖

-- 设计 --

  框架内核借鉴虚拟Dom实现，元素排序移动采用React的Diff算法实现，保证元素的可重复使用。增加throttle保证体验。

-- 优势 --

  - 支持多元化头部
  - 轻量，使用方便
  - 性能高

## 体验
可直接访问dist/index.html


## 启动项目
```
npm run serve
```

## build 流程
```
npm run build
```

### 使用方法
引入
```
  <script type="text/javascript" src="smartUtils.853cd440.js"></script>
```
使用
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
API Demo
```
<th colspan="1" rowspan="3" fixed sortable="number"></th>
<th colspan="1" rowspan="3" sortable fixed></th>
<th colspan="5" rowspan="1" sortable></th>
<th colspan="1" rowspan="3" fixed></th>
<tr unsort></tr>
```